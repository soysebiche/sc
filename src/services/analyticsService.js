// Google Analytics 4 Service
class AnalyticsService {
  constructor() {
    this.gaId = process.env.REACT_APP_GA_MEASUREMENT_ID;
    this.isInitialized = false;
  }

  // Inicializar Google Analytics
  init() {
    if (!this.gaId || this.isInitialized) return;

    // Cargar Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
    document.head.appendChild(script);

    // Configurar gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', this.gaId, {
      page_title: 'Sporting Cristal Stats Viewer',
      page_location: window.location.href,
      custom_map: {
        'custom_parameter_1': 'tournament_type',
        'custom_parameter_2': 'data_year',
        'custom_parameter_3': 'user_action'
      }
    });

    // Hacer gtag disponible globalmente
    window.gtag = gtag;
    this.isInitialized = true;

    console.log('✅ Google Analytics inicializado');
  }

  // Enviar evento de página vista
  pageView(pageName, pagePath) {
    if (!this.isInitialized) return;

    window.gtag('event', 'page_view', {
      page_title: pageName,
      page_location: pagePath,
      page_path: pagePath
    });
  }

  // Enviar evento personalizado
  trackEvent(eventName, parameters = {}) {
    if (!this.isInitialized) return;

    window.gtag('event', eventName, {
      ...parameters,
      timestamp: new Date().toISOString()
    });
  }

  // Trackear navegación entre tabs
  trackTabNavigation(tabName) {
    this.trackEvent('tab_navigation', {
      tab_name: tabName,
      page_location: window.location.href
    });
  }

  // Trackear filtros aplicados
  trackFilter(filterType, filterValue) {
    this.trackEvent('filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
      page_location: window.location.href
    });
  }

  // Trackear búsquedas de fechas
  trackDateSearch(date) {
    this.trackEvent('date_search', {
      search_date: date,
      page_location: window.location.href
    });
  }

  // Trackear visualización de estadísticas
  trackStatsView(statsType, year) {
    this.trackEvent('stats_viewed', {
      stats_type: statsType,
      year: year,
      page_location: window.location.href
    });
  }

  // Trackear errores
  trackError(errorType, errorMessage) {
    this.trackEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      page_location: window.location.href
    });
  }

  // Trackear tiempo de carga
  trackLoadTime(loadTime) {
    this.trackEvent('page_load_time', {
      load_time_ms: loadTime,
      page_location: window.location.href
    });
  }

  // Trackear interacciones del usuario
  trackUserInteraction(interactionType, details = {}) {
    this.trackEvent('user_interaction', {
      interaction_type: interactionType,
      ...details,
      page_location: window.location.href
    });
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
