/* Cake page: countdown, tap to blow, optional microphone blow detection.
   Audio is analysed in memory only. It is never recorded, stored or sent anywhere. */
(function () {
  'use strict';

  var COUNT_SECONDS = 10;
  var MIC_CALIBRATE_MS = 600;   // measure room noise first
  var MIC_SUSTAIN_MS = 700;     // total loud time needed
  var MIC_GAP_MS = 220;         // a quiet gap longer than this resets the window
  var MIC_TIMEOUT_MS = 20000;   // give up and stop listening
  var MIC_MIN_LEVEL = 0.05;     // RMS floor (0..1)
  var MIC_NOISE_FACTOR = 3.5;   // must be this many times louder than the room

  var stage = document.getElementById('cake-stage');
  if (!stage) return;

  var $ = function (id) { return document.getElementById(id); };
  var steps = {};
  Array.prototype.forEach.call(stage.querySelectorAll('.cake-step[data-step]'), function (el) { steps[el.getAttribute('data-step')] = el; });

  var startBtn = $('start-btn'), skipBtn = $('skip-btn'), blowBtn = $('blow-btn');
  var micBtn = $('mic-btn'), micCancel = $('mic-cancel'), micStatus = $('mic-status');
  var countNum = $('count-number'), live = $('cake-live'), songLink = $('song-link');
  var svgTitle = $('cake-svg-title');

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var state = 'intro';
  var countTimer = null, doneTimer = null;
  var mic = null; // active microphone session

  function announce(text) {
    // Clear first so repeated identical messages are still read out.
    live.textContent = '';
    setTimeout(function () { live.textContent = text; }, 30);
  }

  function show(name) {
    state = name;
    stage.setAttribute('data-state', name);
    Object.keys(steps).forEach(function (k) { steps[k].hidden = (k !== name); });
  }

  /* ---------- Countdown ---------- */
  function startCountdown() {
    if (state !== 'intro') return;
    show('counting');
    countNum.textContent = String(COUNT_SECONDS);
    announce('Countdown started. ' + COUNT_SECONDS + ' seconds. Make your wish.');
    skipBtn.focus();
    var endAt = performance.now() + COUNT_SECONDS * 1000;
    var lastShown = COUNT_SECONDS;
    clearInterval(countTimer);
    countTimer = setInterval(function () {
      var left = Math.ceil((endAt - performance.now()) / 1000);
      if (left < 0) left = 0;
      if (left !== lastShown) {
        lastShown = left;
        countNum.textContent = String(left);
        if (left === 5 || (left > 0 && left <= 3)) announce(String(left));
      }
      if (left <= 0) finishCountdown(false);
    }, 100);
  }

  function finishCountdown(skipped) {
    if (state !== 'counting') return;
    clearInterval(countTimer);
    countTimer = null;
    show('ready');
    announce((skipped ? 'Countdown skipped. ' : 'Countdown finished. ') + 'The candles are still lit. Blow them out whenever you are ready.');
    blowBtn.focus();
  }

  /* ---------- Blowing out ---------- */
  function extinguish() {
    if (state !== 'ready') return;
    stopMic();
    stage.classList.add('is-out');
    svgTitle.textContent = 'A two-tier cherry-red birthday cake with three candles just blown out';
    state = 'out';
    stage.setAttribute('data-state', 'out');
    Object.keys(steps).forEach(function (k) { steps[k].hidden = true; });
    announce('The candles are out.');
    clearTimeout(doneTimer);
    doneTimer = setTimeout(function () {
      show('done');
      stage.classList.add('is-out');
      announce('Wish made. I hope this year brings you beautiful things.');
      songLink.focus();
    }, reduced ? 500 : 1800);
  }

  /* ---------- Microphone (optional) ---------- */
  function micMessage(text) { micStatus.textContent = text; }

  function stopMic() {
    var m = mic;
    mic = null;
    if (!m) return;
    m.stopped = true;
    clearInterval(m.timer);
    clearTimeout(m.timeout);
    try { if (m.source) m.source.disconnect(); } catch (e) {}
    if (m.stream) m.stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });
    if (m.ctx && m.ctx.state !== 'closed') { try { m.ctx.close(); } catch (e) {} }
    micBtn.disabled = false;
    micBtn.hidden = false;
    micCancel.hidden = true;
  }

  function startMic() {
    if (state !== 'ready' || mic) return;
    var md = navigator.mediaDevices;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!window.isSecureContext || !md || !md.getUserMedia || !AC) {
      micMessage('Microphone blowing isn’t available here. It needs HTTPS or localhost and a browser that supports it. Tapping works just as well.');
      return;
    }
    var session = { stopped: false, stream: null, ctx: null, source: null, timer: null, timeout: null };
    mic = session;
    micBtn.disabled = true;
    micMessage('Waiting for your browser’s permission…');

    md.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false })
      .then(function (stream) {
        session.stream = stream;
        if (session.stopped || mic !== session) { // cancelled while the prompt was open
          stream.getTracks().forEach(function (t) { t.stop(); });
          return;
        }
        var ctx;
        try {
          ctx = new AC();
          session.ctx = ctx;
          session.source = ctx.createMediaStreamSource(stream);
        } catch (e) { throw e; }
        var analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0;
        session.source.connect(analyser); // analyser is not connected to the speakers
        if (ctx.state === 'suspended') ctx.resume();
        var buf = new Float32Array(analyser.fftSize);

        micBtn.hidden = true;
        micCancel.hidden = false;
        micCancel.focus();
        micMessage('Listening. Take a breath, then blow gently towards your microphone.');
        announce('Listening for your breath.');

        var t0 = performance.now(), last = t0;
        var ambientSum = 0, ambientN = 0, threshold = null;
        var loudMs = 0, quietMs = 0;

        session.timeout = setTimeout(function () {
          if (mic !== session) return;
          stopMic();
          micMessage('I didn’t catch a breath, so the microphone is off. You can try again, or just tap.');
        }, MIC_TIMEOUT_MS);

        session.timer = setInterval(function () {
          if (mic !== session) return;
          var now = performance.now(), dt = now - last; last = now;
          analyser.getFloatTimeDomainData(buf);
          var sum = 0;
          for (var i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
          var rms = Math.sqrt(sum / buf.length);

          if (threshold === null) {
            ambientSum += rms; ambientN++;
            if (now - t0 >= MIC_CALIBRATE_MS) {
              var ambient = ambientN ? ambientSum / ambientN : 0;
              threshold = Math.min(0.3, Math.max(MIC_MIN_LEVEL, ambient * MIC_NOISE_FACTOR));
            }
            return;
          }
          if (rms > threshold) { loudMs += dt; quietMs = 0; }
          else { quietMs += dt; if (quietMs > MIC_GAP_MS) loudMs = 0; }
          if (loudMs >= MIC_SUSTAIN_MS) extinguish();
        }, 50);
      })
      .catch(function (err) {
        if (mic === session) stopMic(); else if (session.stream) session.stream.getTracks().forEach(function (t) { t.stop(); });
        var denied = err && (err.name === 'NotAllowedError' || err.name === 'SecurityError' || err.name === 'PermissionDeniedError');
        micMessage(denied
          ? 'No problem, the microphone stays off. Tapping works just as well.'
          : 'I couldn’t use a microphone here. Tapping works just as well.');
      });
  }

  function cancelMic() {
    stopMic();
    micMessage('Microphone off. Tap whenever you’re ready.');
    micBtn.focus();
  }

  /* ---------- Reset (back/forward cache) ---------- */
  function reset() {
    stopMic();
    clearInterval(countTimer);
    clearTimeout(doneTimer);
    stage.classList.remove('is-out');
    svgTitle.textContent = 'A two-tier cherry-red birthday cake with three lit candles';
    micMessage('');
    show('intro');
  }

  /* ---------- Wire up ---------- */
  startBtn.hidden = false; // controls only make sense with JavaScript
  show('intro');
  startBtn.addEventListener('click', startCountdown);
  skipBtn.addEventListener('click', function () { finishCountdown(true); });
  blowBtn.addEventListener('click', extinguish);
  micBtn.addEventListener('click', startMic);
  micCancel.addEventListener('click', cancelMic);
  document.addEventListener('page:restored', reset);
  window.addEventListener('pagehide', stopMic);
})();
