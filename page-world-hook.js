/* Runs in page MAIN world — loaded via <script src="chrome-extension://…/page-world-hook.js"> (CSP-safe vs inline). */
(function () {
  'use strict';
  var AD_HOST_RE =
    /(^|\.)((bom88|man88)\.(vin|com)|doubleclick\.net|googlesyndication\.com|adserver\.)$/i;

  function isLikelyAdUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return false;
    try {
      var resolved = new URL(rawUrl, window.location.href);
      var host = resolved.hostname || '';
      if (AD_HOST_RE.test(host)) return true;
      return /(^|[./-])(ads?|adclick|popunder|popup)([./-]|$)/i.test(
        '' + resolved.pathname + resolved.search
      );
    } catch (_) {
      return false;
    }
  }

  function noop() {
    return null;
  }
  try {
    var nativeOpen = window.open ? window.open.bind(window) : null;
    if (nativeOpen) {
      window.open = function (url) {
        if (isLikelyAdUrl(String(url || ''))) return null;
        return nativeOpen.apply(window, arguments);
      };
    }
    var loc = window.location;
    if (loc) {
      var nativeAssign = loc.assign ? loc.assign.bind(loc) : null;
      var nativeReplace = loc.replace ? loc.replace.bind(loc) : null;
      if (nativeAssign) {
        loc.assign = function (url) {
          if (isLikelyAdUrl(String(url || ''))) return null;
          return nativeAssign(url);
        };
      }
      if (nativeReplace) {
        loc.replace = function (url) {
          if (isLikelyAdUrl(String(url || ''))) return null;
          return nativeReplace(url);
        };
      }
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
