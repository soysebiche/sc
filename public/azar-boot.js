// Client picker for /partidos/azar and share controls on match pages.
// Filter/pick semantics match src/domain/randomMatch.js (compact index).
(function () {
  var PATH = '/partidos/azar';
  var FILTERS_KEY = 'sc-azar-filters';
  var LAST_KEY = 'sc-azar-last';

  function canonicalPath(pathname) {
    var path = String(pathname || '/').replace(/\/+$/, '');
    return path || '/';
  }

  function readParams() {
    var query = new URLSearchParams(window.location.search || '');
    var hash = new URLSearchParams(String(window.location.hash || '').replace(/^#/, ''));
    return function (key) {
      if (query.has(key)) return query.get(key);
      if (hash.has(key)) return hash.get(key);
      return null;
    };
  }

  function emptyFilters() {
    return { winsOnly: false, clasicosOnly: false, decade: null };
  }

  function parseFilters(get) {
    var wins = get('wins');
    var clasico = get('clasico') || get('clasicos');
    var decadeRaw = get('decade');
    if (wins == null && clasico == null && decadeRaw == null) return null;
    var decade = decadeRaw ? Number(decadeRaw) : null;
    return {
      winsOnly: wins === '1',
      clasicosOnly: clasico === '1',
      decade: Number.isInteger(decade) ? decade : null,
    };
  }

  function readStored() {
    try {
      var raw = sessionStorage.getItem(FILTERS_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      var decade = data.decade == null || data.decade === '' ? null : Number(data.decade);
      return {
        winsOnly: Boolean(data.winsOnly),
        clasicosOnly: Boolean(data.clasicosOnly),
        decade: Number.isInteger(decade) ? decade : null,
      };
    } catch (error) {
      return null;
    }
  }

  function writeStored(filters) {
    try {
      sessionStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
    } catch (error) {
      // Private mode.
    }
  }

  function lastPath() {
    try { return sessionStorage.getItem(LAST_KEY) || ''; } catch (error) { return ''; }
  }

  function writeLast(path) {
    try { if (path) sessionStorage.setItem(LAST_KEY, path); } catch (error) { /* ignore */ }
  }

  function decadeOf(year) {
    return Number.isInteger(year) ? Math.floor(year / 10) * 10 : null;
  }

  function passes(row, filters) {
    if (!row || !row.p) return false;
    if (filters.winsOnly && row.r !== 'V') return false;
    if (filters.clasicosOnly && row.c !== 1) return false;
    if (filters.decade != null && decadeOf(row.y) !== filters.decade) return false;
    return true;
  }

  function pickUniform(items) {
    if (!items.length) return null;
    return items[Math.min(items.length - 1, Math.floor(Math.random() * items.length))];
  }

  function setStatus(message) {
    var node = document.querySelector('[data-azar-status]');
    if (node) node.textContent = message;
  }

  function filtersFromForm(form) {
    if (!form) return emptyFilters();
    var decadeField = form.elements.namedItem('decade');
    var decadeValue = decadeField && decadeField.value;
    return {
      winsOnly: Boolean(form.elements.namedItem('wins') && form.elements.namedItem('wins').checked),
      clasicosOnly: Boolean(form.elements.namedItem('clasico') && form.elements.namedItem('clasico').checked),
      decade: decadeValue ? Number(decadeValue) : null,
    };
  }

  function applyFilters(form, filters) {
    if (!form || !filters) return;
    var wins = form.elements.namedItem('wins');
    var clasico = form.elements.namedItem('clasico');
    var decade = form.elements.namedItem('decade');
    if (wins) wins.checked = filters.winsOnly;
    if (clasico) clasico.checked = filters.clasicosOnly;
    if (decade) decade.value = filters.decade == null ? '' : String(filters.decade);
  }

  function roll(filters) {
    setStatus('Buscando un partido…');
    writeStored(filters);
    return fetch('/azar-index.json', { credentials: 'same-origin' }).then(function (response) {
      if (!response.ok) throw new Error('azar-index');
      return response.json();
    }).then(function (rows) {
      var pool = rows.filter(function (row) { return passes(row, filters); });
      var previous = lastPath();
      if (previous && pool.length > 1) {
        var without = pool.filter(function (row) { return row.p !== previous; });
        if (without.length) pool = without;
      }
      var pick = pickUniform(pool);
      if (!pick) {
        setStatus('No hay partidos con esos filtros. Prueba a soltar un filtro o abre el archivo.');
        return;
      }
      window.location.replace(pick.p);
    }).catch(function () {
      setStatus('No pudimos cargar el archivo. Ábrelo desde Partidos.');
    });
  }

  function initAzar() {
    var form = document.querySelector('[data-azar-form]');
    var get = readParams();
    var filters = parseFilters(get) || readStored() || emptyFilters();
    applyFilters(form, filters);
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        roll(filtersFromForm(form));
      });
    }
    if (get('auto') === '1') roll(filters);
  }

  function initShare() {
    var path = canonicalPath(window.location.pathname);
    if (path.indexOf('/partidos/') === 0 && path !== PATH && path !== '/partidos') writeLast(path);
    Array.prototype.forEach.call(document.querySelectorAll('[data-copy-match]'), function (button) {
      button.addEventListener('click', function () {
        var url = button.getAttribute('data-copy-url') || (window.location.origin + path);
        var done = function () { button.textContent = 'Enlace copiado'; };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done).catch(function () { window.prompt('Copia el enlace', url); });
        } else {
          window.prompt('Copia el enlace', url);
        }
      });
    });
  }

  var path = canonicalPath(window.location.pathname);
  if (path === PATH) initAzar();
  initShare();
})();
