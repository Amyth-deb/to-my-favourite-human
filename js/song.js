/* Song page: YouTube embed (settings in js/song-config.js).
   Nothing here autoplays, records, uploads or sends audio anywhere. */
(function () {
  'use strict';

  /* ---------- Song ---------- */
  var cfg = window.SONG_CONFIG || {};
  var frame = document.getElementById('song-frame');
  var titleEl = document.getElementById('song-title');
  var fallback = document.getElementById('song-fallback');
  var linkEl = document.getElementById('song-link');

  var title = typeof cfg.songTitle === 'string' ? cfg.songTitle.trim() : '';
  if (title === 'Song title goes here') title = '';   // old placeholder: never show it
  if (titleEl) titleEl.textContent = title;

  // Accepts a bare 11-character ID, or a pasted YouTube link.
  function parseVideoId(raw) {
    if (typeof raw !== 'string') return '';
    var s = raw.trim();
    if (!s) return '';
    if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
    var m = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/);
    return m ? m[1] : '';
  }

  var id = parseVideoId(cfg.youtubeVideoId);
  // Without a real video, don't show a placeholder title to the recipient.
  if (titleEl && (!id || !title)) titleEl.hidden = true;
  if (cfg.youtubeVideoId && !id && window.console) {
    console.warn('song-config.js: youtubeVideoId is not a valid YouTube ID or link. Showing the placeholder.');
  }

  if (!id && !cfg.youtubeVideoId && window.console) {
    console.info('song-config.js: youtubeVideoId is empty, so the song placeholder is showing. Add the YouTube link or ID to js/song-config.js.');
  }

  if (frame && id) {
    var iframe = document.createElement('iframe');
    // No autoplay parameter: the song only plays when she presses play.
    // enablejsapi lets the shared music controller (js/music.js) control this same player.
    var src = 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&playsinline=1&enablejsapi=1';
    if (/^https?:$/.test(location.protocol)) src += '&origin=' + encodeURIComponent(location.origin);
    iframe.src = src;
    iframe.title = title ? 'Song: ' + title : 'The song';
        // 'autoplay' only delegates permission; nothing here asks the video to start.
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.textContent = '';
    frame.appendChild(iframe);
    if (fallback && linkEl) {
      linkEl.href = 'https://www.youtube.com/watch?v=' + id;
      fallback.hidden = false;
    }
  }

  /* ---------- Closing: one quiet fade-in, skipped for reduced motion ---------- */
  var closing = document.getElementById('closing');
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (closing && 'IntersectionObserver' in window && !calm) {
    closing.classList.add('will-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { closing.classList.add('is-seen'); io.disconnect(); }
      });
    }, { threshold: 0.35 });
    io.observe(closing);
  }
})();
