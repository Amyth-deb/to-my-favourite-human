/* Page 01: gift opening */
(function () {
  var page = document.querySelector('[data-gift-page]');
  var stage = document.querySelector('[data-gift]');
  var btn = document.querySelector('[data-open]');
  var status = document.querySelector('[data-status]');
  if (!page || !stage || !btn || !status) return;

  var NEXT = 'apology.html';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var opened = false;
  var timer;

  function open() {
    if (opened) return; // duplicate-interaction guard
    opened = true;
    stage.classList.add('is-open');
    page.classList.add('is-opening');
    status.textContent = 'Opening your gift.';
    // A natively disabled button drops keyboard focus, so move focus to the
    // status message first; keyboard and screen-reader users keep their place.
    status.setAttribute('tabindex', '-1');
    status.focus({ preventScroll: true });
    btn.disabled = true;
    timer = setTimeout(function () { window.location.href = NEXT; }, reduce.matches ? 300 : 1900);
  }

  function reset() {
    clearTimeout(timer);
    opened = false;
    stage.classList.remove('is-open');
    page.classList.remove('is-opening');
    btn.disabled = false;
    status.removeAttribute('tabindex');
    status.textContent = '';
  }

  btn.addEventListener('click', open);
  document.addEventListener('page:restored', reset);
})();
