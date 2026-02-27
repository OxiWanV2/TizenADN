/**
 * ADN TizenBrew Module
 * Injecté dans https://animationdigitalnetwork.fr
 * Gestion navigation télécommande Samsung Tizen
 */

(function () {
  'use strict';

  const KEYS = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    ENTER: 13,
    BACK: 10009,
    RETURN: 10182,
    PLAY: 415,
    PAUSE: 19,
    PLAY_PAUSE: 10252,
    STOP: 413,
    FF: 417,      // Fast Forward
    RW: 412,      // Rewind
    RED: 403,
    GREEN: 404,
    YELLOW: 405,
    BLUE: 406,
  };

  if (window.tizen && window.tizen.tvinputdevice) {
    try {
      tizen.tvinputdevice.registerKeyBatch([
        'MediaPlayPause', 'MediaPlay', 'MediaPause',
        'MediaStop', 'MediaFastForward', 'MediaRewind',
        'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue'
      ]);
      console.log('[ADN] Touches télécommande enregistrées');
    } catch (e) {
      console.warn('[ADN] Impossible d\'enregistrer les touches Tizen:', e);
    }
  }

  const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    '[role="button"]',
    '[tabindex]:not([tabindex="-1"])',
    '.slider-item',
    '.catalog-item',
    '.episode-item',
    '.player-control',
    '.nav-item',
    '.media-card',
  ].join(', ');

  let focusableElements = [];
  let currentIndex = 0;

  function refreshFocusable() {
    focusableElements = Array.from(document.querySelectorAll(FOCUSABLE_SELECTORS))
      .filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
  }

  function applyFocus(index) {
    document.querySelectorAll('.__adn_focused').forEach(el => {
      el.classList.remove('__adn_focused');
      el.style.outline = '';
      el.style.transform = '';
      el.style.zIndex = '';
    });

    if (!focusableElements[index]) return;

    currentIndex = index;
    const el = focusableElements[index];
    el.classList.add('__adn_focused');
    el.style.outline = '3px solid #e94560';
    el.style.transform = 'scale(1.05)';
    el.style.zIndex = '9999';
    el.focus({ preventScroll: false });

    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }

  function findNearest(direction) {
    const current = focusableElements[currentIndex];
    if (!current) return currentIndex;

    const curRect = current.getBoundingClientRect();
    const curCX = curRect.left + curRect.width / 2;
    const curCY = curRect.top + curRect.height / 2;

    let bestIndex = currentIndex;
    let bestScore = Infinity;

    focusableElements.forEach((el, i) => {
      if (i === currentIndex) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = cx - curCX;
      const dy = cy - curCY;

      let isCandidate = false;
      switch (direction) {
        case 'UP':    isCandidate = dy < -10; break;
        case 'DOWN':  isCandidate = dy > 10;  break;
        case 'LEFT':  isCandidate = dx < -10; break;
        case 'RIGHT': isCandidate = dx > 10;  break;
      }

      if (!isCandidate) return;

      const primary = (direction === 'UP' || direction === 'DOWN') ? Math.abs(dy) : Math.abs(dx);
      const secondary = (direction === 'UP' || direction === 'DOWN') ? Math.abs(dx) : Math.abs(dy);
      const score = primary + secondary * 2;

      if (score < bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    });

    return bestIndex;
  }

  function getVideo() {
    return document.querySelector('video');
  }

  function seekVideo(seconds) {
    const v = getVideo();
    if (v) v.currentTime = Math.max(0, v.currentTime + seconds);
  }

  document.addEventListener('keydown', function (e) {
    refreshFocusable();

    switch (e.keyCode) {

      case KEYS.UP:
        e.preventDefault();
        applyFocus(findNearest('UP'));
        break;

      case KEYS.DOWN:
        e.preventDefault();
        applyFocus(findNearest('DOWN'));
        break;

      case KEYS.LEFT:
        e.preventDefault();
        if (getVideo() && !getVideo().paused) {
          seekVideo(-10);
        } else {
          applyFocus(findNearest('LEFT'));
        }
        break;

      case KEYS.RIGHT:
        e.preventDefault();
        if (getVideo() && !getVideo().paused) {
          seekVideo(10);
        } else {
          applyFocus(findNearest('RIGHT'));
        }
        break;

      case KEYS.ENTER:
        if (focusableElements[currentIndex]) {
          e.preventDefault();
          focusableElements[currentIndex].click();
        }
        break;

      case KEYS.BACK:
      case KEYS.RETURN:
        e.preventDefault();
        const video = getVideo();
        if (video && !video.paused) {
          video.pause();
        } else {
          history.back();
        }
        break;

      case KEYS.PLAY:
      case KEYS.PAUSE:
      case KEYS.PLAY_PAUSE: {
        const v = getVideo();
        if (v) {
          e.preventDefault();
          v.paused ? v.play() : v.pause();
        }
        break;
      }

      case KEYS.STOP: {
        const v = getVideo();
        if (v) { e.preventDefault(); v.pause(); v.currentTime = 0; }
        break;
      }

      case KEYS.FF:
        e.preventDefault();
        seekVideo(30);
        break;

      case KEYS.RW:
        e.preventDefault();
        seekVideo(-10);
        break;
    }
  }, true);

  const style = document.createElement('style');
  style.textContent = `
    /* Cache le curseur souris sur TV */
    * { cursor: none !important; }

    /* Focus custom ADN */
    .__adn_focused {
      outline: 3px solid #e94560 !important;
      outline-offset: 2px !important;
      transform: scale(1.05) !important;
      transition: transform 0.15s ease !important;
      box-shadow: 0 0 15px rgba(233, 69, 96, 0.6) !important;
    }

    /* Amélioration lisibilité sur grand écran */
    body {
      font-size: 1.1em !important;
    }
  `;
  document.head.appendChild(style);

  function init() {
    refreshFocusable();
    if (focusableElements.length > 0) applyFocus(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  const observer = new MutationObserver(() => {
    setTimeout(() => {
      refreshFocusable();
    }, 500);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  console.log('[ADN TizenBrew] Module chargé ✅');
})();
