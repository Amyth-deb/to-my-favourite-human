/* Shared behaviour */
(function () {
  document.documentElement.classList.add('js');
  // Restore a clean state when returning via the browser's back/forward cache.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) document.dispatchEvent(new Event('page:restored'));
  });
})();
