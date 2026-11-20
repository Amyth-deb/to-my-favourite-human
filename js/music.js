/* Website-wide background music (settings: js/song-config.js).
   One YouTube player per page, controlled by a small floating control.
   Nothing plays before the visitor's first tap or click. Each page load is a fresh document,
   so the player is recreated and resumed from the saved position: expect a short gap on navigation. */
(function () {
  'use strict';

  var cfg = window.SONG_CONFIG || {};
  var KEY = 'mfh-music-v1';

  // Same rules as js/song.js: a bare 11-character ID or a pasted YouTube link.
  function parseVideoId(raw) {
    if (typeof raw !== 'string') return '';
    var s = raw.trim();
    if (!s) return '';
    if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
    var m = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/);
    return m ? m[1] : '';
  }

  var id = parseVideoId(cfg.youtubeVideoId);
  if (!id) {
    // Missing or invalid configuration: no control, no YouTube request.
    if (window.console) console.info('music.js: no valid youtubeVideoId in js/song-config.js, so there is no background music.');
    return;
  }

  var volume = Number(cfg.musicVolume);
  if (!isFinite(volume)) volume = 25;
  volume = Math.max(0, Math.min(100, Math.round(volume)));
  var startOnFirstTap = cfg.startMusicOnFirstTap !== false;

  /* ---------- Saved state for this browser tab ---------- */
  var st = {};
  try { st = JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch (e) { st = {}; }
  if (typeof st !== 'object' || st.v !== id) st = { v: id };
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  /* ---------- Control ---------- */
  var ICON = {
    play: '<svg class="i-main" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.5v13a.8.8 0 0 0 1.2.7l10.4-6.5a.8.8 0 0 0 0-1.4L9.2 4.8A.8.8 0 0 0 8 5.5z" fill="currentColor"/></svg>' +
          '<svg class="i-alt" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>',
    mute: '<svg class="i-main" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>' +
          '<svg class="i-alt" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>'
  };

  var root = document.createElement('div');
  root.className = 'bgm';
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', 'Background music');
  root.innerHTML =
    '<button type="button" class="bgm-btn bgm-play" data-state="paused" aria-label="Play music">' + ICON.play + '</button>' +
    '<span class="bgm-sep" aria-hidden="true"></span>' +
    '<button type="button" class="bgm-btn bgm-mute" data-state="on" aria-label="Mute music">' + ICON.mute + '</button>' +
    '<span class="visually-hidden" role="status" aria-live="polite"></span>';
  document.body.appendChild(root);
  document.body.classList.add('has-music');
  var playBtn = root.querySelector('.bgm-play');
  var muteBtn = root.querySelector('.bgm-mute');
  var live = root.querySelector('[role="status"]');

  /* ---------- Player ---------- */
  var player = null, ready = false, creating = false, failed = false;
  var pending = [];            // functions waiting for the player
  var playing = false;         // the player really is playing
  var wasPlaying = false;      // has been playing (so a pause is the visitor's)
  var pendingPlay = false;     // asked to play, waiting for it to start
  var pendTimer = null, ticker = null, host = null;
  var micPaused = false, leaving = false;
  var resumeAt = 0;
  if (st.t > 1) resumeAt = st.t + (st.p ? Math.min(3, Math.max(0, (Date.now() - (st.at || 0)) / 1000)) : 0);

  function say(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 30); }

  function render() {
    var on = playing || pendingPlay;
    playBtn.setAttribute('data-state', on ? 'playing' : 'paused');
    playBtn.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
    muteBtn.setAttribute('data-state', st.muted ? 'muted' : 'on');
    muteBtn.setAttribute('aria-label', st.muted ? 'Unmute music' : 'Mute music');
  }

  function fail(why) {
    if (failed) return;
    failed = true;
    if (window.console) console.warn('music.js: background music unavailable (' + why + '). The control has been removed.');
    clearTimeout(pendTimer); clearInterval(ticker);
    document.removeEventListener('click', onDocClick, true);
    if (root.parentNode) root.parentNode.removeChild(root);
    if (host && host.parentNode) host.parentNode.removeChild(host);
    document.body.classList.remove('has-music');
  }

  function loadApi(cb) {
    if (window.YT && window.YT.Player) { cb(true); return; }
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prev === 'function') { try { prev(); } catch (e) {} }
      cb(true);
    };
    var s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    s.onerror = function () { cb(false); };
    document.head.appendChild(s);
  }

  function withPlayer(fn) {
    if (failed) return;
    if (ready) { if (fn) fn(player); return; }
    if (fn) pending.push(fn);
    if (creating) return;
    creating = true;
    loadApi(function (ok) { if (!ok) fail('YouTube could not be loaded'); else createPlayer(); });
  }

  function createPlayer() {
    // On the Song page the existing embed IS the player, so there is never a second one.
    var existing = document.querySelector('#song-frame iframe');
    var target = existing;
    var opts = { events: { onReady: onReady, onStateChange: onState, onError: onError } };
    if (!existing) {
      host = document.createElement('div');
      host.className = 'bgm-host';
      host.setAttribute('aria-hidden', 'true');
      target = document.createElement('div');
      host.appendChild(target);
      document.body.appendChild(host);
      opts.videoId = id;
      opts.width = '200';
      opts.height = '200';
      opts.playerVars = { playsinline: 1, rel: 0, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3 };
    }
    try { player = new window.YT.Player(target, opts); } catch (e) { fail('player error'); }
  }

  function onReady() {
    ready = true;
    try {
      player.setVolume(volume);
      if (st.muted) player.mute(); else player.unMute();
    } catch (e) {}
    var q = pending; pending = [];
    q.forEach(function (fn) { try { fn(player); } catch (e) {} });
    clearInterval(ticker);
    ticker = setInterval(tick, 1000);
  }

  function onState(e) {
    var s = e && e.data;
    if (s === 1) {
      playing = true; wasPlaying = true; pendingPlay = false; clearTimeout(pendTimer);
      st.want = true; save(); render();
    } else if (s === 2) {
      playing = false;
      // A pause after real playback is the visitor's (e.g. the Song page's own player). The microphone pause and leaving the page are not.
      if (wasPlaying && !micPaused && !leaving) { st.want = false; pendingPlay = false; }
      wasPlaying = false;
      writeTime(); render();
    } else if (s === 0) {
      playing = false; wasPlaying = false;
      if (st.want !== false) { try { player.seekTo(0, true); player.playVideo(); } catch (e2) {} }
    }
  }

  function onError(e) {
    var c = e && e.data;
    if (c === 2 || c === 5 || c === 100 || c === 101 || c === 150) fail('YouTube error ' + c);
  }

  function writeTime() {
    if (!ready) return;
    try {
      var t = player.getCurrentTime();
      if (isFinite(t)) st.t = t;
      st.p = playing; st.at = Date.now();
      save();
    } catch (e) {}
  }

  function tick() {
    if (!ready) return;
    if (playing) writeTime();
    try {
      var m = player.isMuted();            // follows the Song page's own controls too
      if (typeof m === 'boolean' && m !== !!st.muted) { st.muted = m; save(); render(); }
    } catch (e) {}
  }

  /* ---------- Actions ---------- */
  function startPlayback() {
    st.want = true; save();
    pendingPlay = true; render();
    withPlayer(function (p) {
      try {
        if (resumeAt > 1) { p.seekTo(resumeAt, true); resumeAt = 0; }
        p.playVideo();
      } catch (e) {}
    });
    clearTimeout(pendTimer);
    pendTimer = setTimeout(function () {
      // Not started: the browser blocked it, or the network is slow. Show Play; the next tap resumes.
      if (!playing) { pendingPlay = false; render(); }
    }, 4000);
  }

  function pausePlayback() {
    st.want = false; pendingPlay = false; clearTimeout(pendTimer); save();
    withPlayer(function (p) { try { p.pauseVideo(); } catch (e) {} });
    render();
  }

  playBtn.addEventListener('click', function () {
    if (playing || pendingPlay) { pausePlayback(); say('Music paused'); }
    else { startPlayback(); say('Music playing'); }
  });

  muteBtn.addEventListener('click', function () {
    st.muted = !st.muted; save(); render();
    if (ready) { try { if (st.muted) player.mute(); else player.unMute(); } catch (e) {} }
    say(st.muted ? 'Music muted' : 'Music unmuted');
  });

  // First tap or click anywhere starts the music (or resumes it after navigation, if the browser blocked the automatic resume).
  // A visitor who paused stays paused.
  function onDocClick(e) {
    if (root.contains(e.target)) return;
    if (playing || pendingPlay || failed) return;
    if (st.want === false) return;
    if (st.want === undefined && !startOnFirstTap) return;
    startPlayback();
  }
  document.addEventListener('click', onDocClick, true);

  // The cake page's microphone would pick the music up as noise, so pause while it listens.
  window.addEventListener('marisha:mic', function (e) {
    var on = e && e.detail && e.detail.listening;
    if (on) {
      if (playing || pendingPlay) { micPaused = true; withPlayer(function (p) { try { p.pauseVideo(); } catch (x) {} }); }
    } else if (micPaused) {
      micPaused = false;
      if (st.want !== false) startPlayback();
    }
  });

  window.addEventListener('pagehide', function () { leaving = true; writeTime(); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') writeTime(); });
  document.addEventListener('page:restored', function () {
    leaving = false;
    if (ready) { try { playing = player.getPlayerState() === 1; } catch (e) {} }
    render();
  });

  /* ---------- Start-up ---------- */
  render();
  if (document.querySelector('#song-frame iframe')) withPlayer(null);   // Song page: attach to the embed that is already there
  if (st.want === true) startPlayback();                                // was playing on the previous page: try to resume
})();
