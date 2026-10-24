(function () {
  var meta = document.querySelector('meta[name="sc-spa"]');
  var target = meta && meta.getAttribute('content');
  if (!target) return;
  var current = window.location.pathname + window.location.search;
  if (current === target) return;
  window.history.replaceState(window.history.state, '', target);
})();
