/* Runs in page MAIN world — loaded via <script src="chrome-extension://…/page-world-hook.js"> (CSP-safe vs inline). */
(function () {
  'use strict';
  function noop() {
    return null;
  }
  try {
    window.open = noop;
    var loc = window.location;
    if (loc) {
      loc.assign = noop;
      loc.replace = noop;
    }
  } catch (e) {
    /* ignore */
  }
  try {
    var poll = setInterval(function () {
      try {
        if (typeof window.createPopupAndRedirect === 'function' && !window.__avsPR) {
          window.__avsPR = 1;
          window.createPopupAndRedirect = function () {};
        }
        if (typeof window.markPopupAsOpened === 'function' && !window.__avsPM) {
          window.__avsPM = 1;
          window.markPopupAsOpened = function () {};
        }
      } catch (_) {
        /* ignore */
      }
    }, 130);
    setTimeout(function () {
      clearInterval(poll);
    }, 25000);
  } catch (_) {
    /* ignore */
  }
})();
