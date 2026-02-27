/**
 * Service TizenBrew pour ADN
 * Gère les événements bas niveau du système Tizen
 */
(function () {
  if (window.tizen) {
    try {
      tizen.power.request('SCREEN', 'SCREEN_NORMAL');
      console.log('[ADN Service] Anti-veille activé');
    } catch (e) {
      console.warn('[ADN Service] Power API indisponible:', e);
    }
  }
})();
