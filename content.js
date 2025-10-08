(() => {
    'use strict';
  
    if (!/(animevietsub)\./.test(location.hostname)) return;
  
    // ============================================
    // ⚙️ CONFIG
    // ============================================
    const CONFIG = {
      adCheckInterval: 300, // ms
      verbose: true,
      popupCookieName: 'popupOpened',
      popupCookieTTL: 30 * 60 * 1000, // 30 phút
    };
  
    // ============================================
    // 🧾 LOGGING
    // ============================================
    const log = (msg, icon = '✅') => CONFIG.verbose && console.log(`${icon} [AVS] ${msg}`);
  
    // ============================================
    // 🍪 COOKIE HELPER
    // ============================================
    const Cookie = {
      set: (name, value, ttlMs) => {
        const expires = new Date(Date.now() + ttlMs).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/`;
      },
      get: name => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
      }
    };
  
    // ============================================
    // 🚫 BLOCK POPUP / REDIRECT
    // ============================================
    function blockPopupFunctions() {
      const noop = (...args) => {
        log(`Blocked popup/redirect call ${args?.[0] || ''} 🚷`);
        return null;
      };
  
      // Gỡ khả năng mở tab mới / redirect
      unsafeWindow.open = noop;
      unsafeWindow.location.assign = noop;
      unsafeWindow.location.replace = noop;
  
      // Xóa onclick toàn cục
      document.body?.removeAttribute('onclick');
      document.documentElement?.removeAttribute('onclick');
  
      // Ngăn click/mousedown/up trigger popup
      const stopEvent = e => {
        const isAnchor = e.target.closest('a');
        if (!isAnchor) e.preventDefault();
        e.stopImmediatePropagation();
      };
  
      ['click', 'mousedown', 'mouseup'].forEach(evt =>
        window.addEventListener(evt, stopEvent, true)
      );
  
      log("Popup redirect protection enabled 🚫");
    }
  
    // ============================================
    // 💥 REMOVE ADS
    // ============================================
    const adSelectors = [
        '#_preload-ads-1', '#_preload-ads-2', '#invideo_wrapper',
        '.Ads', '.Ads.ads_player', '.ad-overlay', '.below-player',

        // 🔴 Header / Footer / Banner Ads
        '.Adv.ad-center-header', '.header-ads-mobile',
        '.top-banner', '.bottom-banner', '.sticky-ads', '.floating-ads',

        // 🟠 Catfish (mobile / desktop floating ads)
        '.pc_catfix_adv', '.mobile-catfish-top', '.mobile-catfixx', '.is-catfish',

        // 🟡 Overlay / Popup Ads
        '.popup-ads', 'div[class*="popup"][class*="overlay"]', '.sspp-modal', '.sspp-area',

        // 🟢 Sponsored / Advertisement Classes
        '.ads', '.advertisement', '[class*="advertisement"]', '[id*="advertisement"]',
        '[class*="sponsored"]', '[id*="sponsored"]',

        // 🔵 Iframe-based Ads
        'iframe[src*="88"]', 'iframe[src*="bet"]', 'iframe[src*="qc"]',
        'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]',
        'iframe[src*="adserver"]',

        // ⚫ Google Ads
        '.adsbygoogle', 'ins.adsbygoogle',

        // ⚪ Miscellaneous
        '.man88',
    ];
  
    const hideAds = () => {
      let count = 0;
      for (const selector of adSelectors) {
        try {
          document.querySelectorAll(selector).forEach(el => {
            if (el && el.offsetParent !== null) {
              el.remove();
              count++;
            }
          });
        } catch { /* skip invalid selector */ }
      }
      if (count) log(`Removed ${count} ad elements 🧹`);
    };
  
    // ============================================
    // 👁️ MUTATION OBSERVER (1 INSTANCE)
    // ============================================
    let observer;
    const observeAds = () => {
      if (observer) observer.disconnect();
  
      observer = new MutationObserver(() => {
        clearTimeout(observer.debounce);
        observer.debounce = setTimeout(hideAds, CONFIG.adCheckInterval);
      });
  
      observer.observe(document.body, { childList: true, subtree: true });
      log("MutationObserver started 🔁");
    };
  
    // ============================================
    // 🧱 BLOCK SITE'S CLICK POPUP LOGIC
    // ============================================
    function blockAnimeVietsubClickPopup() {
      document.addEventListener('click', e => {
        const target = e.target;
        const hasCookie = Cookie.get(CONFIG.popupCookieName) === 'true';
  
        // Chỉ cho phép click vào các vùng hợp lệ (vd: menu, player controls...)
        const whitelist = [
          "#pc-catfixx", "#mobile-catfish-top", "#mobile-catfixx",
          ".banner-container", ".header-ads-mobile"
        ];
  
        const allowed = whitelist.some(sel => target.closest(sel));
        if (!allowed && !hasCookie) {
          Cookie.set(CONFIG.popupCookieName, 'true', CONFIG.popupCookieTTL);
          e.stopImmediatePropagation();
          e.preventDefault();
          log("Blocked site popup trigger 💣");
        }
      }, true);
    }
      // ============================================
      // 🧨 SPECIAL CASE: #_preload-ads FIX
      // ============================================
      function fixPreloadAds() {
          const hidePreload = el => {
              if (!el) return;
              el.style.setProperty('display', 'none', 'important');
              el.style.setProperty('visibility', 'hidden', 'important');
              el.style.setProperty('opacity', '0', 'important');
              el.innerHTML = '';
              log('Hidden #_preload-ads 🔒');
          };
  
          const preloadTargets = ['#_preload-ads-1', '#_preload-ads-2'];
          preloadTargets.forEach(sel => hidePreload(document.querySelector(sel)));
  
          const preloadObserver = new MutationObserver(mutations => {
              for (const m of mutations) {
                  if (m.addedNodes.length) {
                      m.addedNodes.forEach(n => {
                          if (n.id?.startsWith('_preload-ads')) hidePreload(n);
                      });
                  }
              }
          });
  
    preloadObserver.observe(document.body, { childList: true, subtree: true });
    log('Preload-ads watcher active 👁️');
  }
  
    // ============================================
    // 🏁 INIT
    // ============================================
    const init = () => {
        hideAds();
        fixPreloadAds();
        observeAds();
        blockPopupFunctions();
        blockAnimeVietsubClickPopup();
        log("AdBlock fully initialized ✅");
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ============================================
    // 🧹 CLEANUP ON EXIT
    // ============================================
    window.addEventListener('beforeunload', () => {
        observer?.disconnect();
        clearTimeout(observer?.debounce);
    });

})();