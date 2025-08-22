import { useEffect, useCallback } from 'react';
import analyticsService from '../services/analyticsService';

// Hook personalizado para analytics
export const useAnalytics = () => {

  // Inicializar analytics al montar el componente
  useEffect(() => {
    analyticsService.init();
  }, []);

  // Trackear vista inicial
  useEffect(() => {
    if (analyticsService.isInitialized) {
      analyticsService.pageView('Sporting Cristal Stats', '/');
    }
  }, []);

  // Funciones de tracking
  const trackTabNavigation = useCallback((tabName) => {
    analyticsService.trackTabNavigation(tabName);
  }, []);

  const trackFilter = useCallback((filterType, filterValue) => {
    analyticsService.trackFilter(filterType, filterValue);
  }, []);

  const trackDateSearch = useCallback((date) => {
    analyticsService.trackDateSearch(date);
  }, []);

  const trackStatsView = useCallback((statsType, year) => {
    analyticsService.trackStatsView(statsType, year);
  }, []);

  const trackError = useCallback((errorType, errorMessage) => {
    analyticsService.trackError(errorType, errorMessage);
  }, []);

  const trackLoadTime = useCallback((loadTime) => {
    analyticsService.trackLoadTime(loadTime);
  }, []);

  const trackUserInteraction = useCallback((interactionType, details = {}) => {
    analyticsService.trackUserInteraction(interactionType, details);
  }, []);

  return {
    trackTabNavigation,
    trackFilter,
    trackDateSearch,
    trackStatsView,
    trackError,
    trackLoadTime,
    trackUserInteraction
  };
};
