(function () {
  var path = window.location.pathname || '/';
  if (path.length > 1) return;
  var meta = document.querySelector('meta[name="sc-spa"]');
  var target = meta && meta.getAttribute('content');
  if (!target) return;
  var current = path + window.location.search;
  if (current === target) return;
  window.history.replaceState(window.history.state, '', target);
})();
