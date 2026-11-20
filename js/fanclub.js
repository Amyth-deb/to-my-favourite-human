/* Fan club page: a playful reveal. No data is collected or stored. */
(function () {
  var btn = document.getElementById('apply-btn');
  var out = document.getElementById('apply-result');
  if (!btn || !out) return;

  btn.hidden = false; // the button only makes sense when JavaScript runs

  function reset() {
    out.textContent = '';
    out.classList.remove('is-open');
    btn.disabled = false;
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', function () {
    if (btn.disabled) return;
    var line = document.createElement('p');
    line.className = 'apply-confirm';
    line.textContent = 'Your membership was never in question.';
    var small = document.createElement('p');
    small.className = 'apply-small';
    small.textContent = 'Application approved on arrival. Status: permanent.';
    out.appendChild(line);
    out.appendChild(small);
    out.classList.add('is-open');
    btn.disabled = true;
    btn.setAttribute('aria-expanded', 'true');
  });

  document.addEventListener('page:restored', reset);
})();
