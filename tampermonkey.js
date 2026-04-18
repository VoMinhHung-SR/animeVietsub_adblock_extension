// ==UserScript==
// @name         🌿 AnimeVietsub AdBlock
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Chặn quảng cáo + popup redirect AnimeVietsub (linh hoạt, không leak, không hardcode URL)
// @author       Võ Minh Hùng
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  if (!/(animevietsub)\./.test(location.hostname)) return;

  // Keep in sync: content.js (extension) — same IIFE.

  const CONFIG = {
    adCheckInterval: 300,
    verbose: true,
    popupCookieName: 'popupOpened',
    popupCookieTTL: 30 * 60 * 1000,
  };

  const log = (msg, icon = '✅') => CONFIG.verbose && console.log(`${icon} [AVS] ${msg}`);

  const Cookie = {
    set: (name, value, ttlMs) => {
      const expires = new Date(Date.now() + ttlMs).toUTCString();
      document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    },
    get: name => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    },
  };

  /** Runs in page context — works in MV3 isolated world + Tampermonkey without @grant unsafeWindow */
  function injectPageWorldPopupBlock() {
    const el = document.createElement('script');
    el.textContent =
      '(function(){"use strict";function n(){return null;}try{window.open=n;var l=window.location;if(l){l.assign=n;l.replace=n;}}catch(e){}})();';
    const root = document.documentElement || document.head;
    if (!root) return;
    root.appendChild(el);
    el.remove();
    log('Page-world popup hooks injected 🔗');
  }

  function stripGlobalOnclick() {
    document.body?.removeAttribute('onclick');
    document.documentElement?.removeAttribute('onclick');
  }

  function blockPopupCaptureListeners() {
    const stopEvent = e => {
      const isAnchor = e.target.closest('a');
      if (!isAnchor) e.preventDefault();
      e.stopImmediatePropagation();
    };
    for (const evt of ['click', 'mousedown', 'mouseup']) {
      window.addEventListener(evt, stopEvent, { capture: true, passive: false });
    }
    log('Popup redirect capture listeners on 🚫');
  }

  function blockPopupFunctions() {
    stripGlobalOnclick();
    blockPopupCaptureListeners();
  }

  const adSelectors = [
    '#_preload-ads-1',
    '#_preload-ads-2',
    '#invideo_wrapper',
    'main .Ads.ads_player',
    '.Ads.ads_player',
    '.Adv.ad-center-header',
    '.header-ads-pc',
    '.header-ads-mobile',
    '.header-ads-pc a',
    '.header-ads-mobile a',
    '.pc_catfix_adv',
    '.mobile-catfish-top',
    '.mobile-catfixx',
    '.is-catfish',
    '.below-player',
    '.below-player a',
    '.below-playerm a',
    '.ad-overlay',
    '.popup-ads',
    '.sspp-modal',
    '.sspp-area',
    '.man88',
    'div[class*="popup"][class*="overlay"]',
    '.top-banner',
    '.bottom-banner',
    '.sticky-ads',
    '.floating-ads',
    '.advertisement',
    '[class*="advertisement"]',
    '[id*="advertisement"]',
    '[class*="sponsored"]',
    '[id*="sponsored"]',
    'iframe[src*="88"]',
    'iframe[src*="bet"]',
    'iframe[src*="qc"]',
    'iframe[src*="doubleclick"]',
    'iframe[src*="googlesyndication"]',
    'iframe[src*="adserver"]',
    '.adsbygoogle',
    'ins.adsbygoogle',
    '#pc-catfixx a',
    '#pc-catfixx',
    '#mobile-catfish-top a',
    '#mobile-catfixx a',
    '#mobile-catfixx',
    'center a',
    '.Ads',
    '.Adv',
    '.ads',
  ];

  const hideAds = () => {
    let count = 0;
    for (const selector of adSelectors) {
      try {
        document.querySelectorAll(selector).forEach(el => {
          if (el?.isConnected) {
            el.remove();
            count++;
          }
        });
      } catch {
        /* invalid selector */
      }
    }
    if (count) log(`Removed ${count} ad elements 🧹`);
  };

  let domObserver = null;
  let hideAdsDebounceTimer = 0;

  function hidePreloadNode(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return;
    const id = el.getAttribute('id');
    if (!id || !id.startsWith('_preload-ads')) return;
    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
    el.style.setProperty('opacity', '0', 'important');
    el.innerHTML = '';
    log('Hidden #_preload-ads 🔒');
  }

  function processMutationBatch(mutations) {
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (n.nodeType !== Node.ELEMENT_NODE) continue;
        hidePreloadNode(n);
        if (typeof n.querySelectorAll === 'function') {
          n.querySelectorAll('[id^="_preload-ads"]').forEach(hidePreloadNode);
        }
      }
    }
    clearTimeout(hideAdsDebounceTimer);
    hideAdsDebounceTimer = setTimeout(hideAds, CONFIG.adCheckInterval);
  }

  function runPreloadPassOnce() {
    for (const sel of ['#_preload-ads-1', '#_preload-ads-2']) {
      hidePreloadNode(document.querySelector(sel));
    }
  }

  function startDomObserver() {
    if (!document.body) return;
    domObserver?.disconnect();
    domObserver = new MutationObserver(processMutationBatch);
    domObserver.observe(document.body, { childList: true, subtree: true });
    log('MutationObserver (ads + preload) started 🔁');
  }

  function blockAnimeVietsubClickPopup() {
    const whitelist = [
      '#pc-catfixx',
      '#mobile-catfish-top',
      '#mobile-catfixx',
      '.banner-container',
      '.header-ads-mobile',
    ];
    document.addEventListener(
      'click',
      e => {
        const target = e.target;
        const hasCookie = Cookie.get(CONFIG.popupCookieName) === 'true';
        const allowed = whitelist.some(sel => target.closest(sel));
        if (!allowed && !hasCookie) {
          Cookie.set(CONFIG.popupCookieName, 'true', CONFIG.popupCookieTTL);
          e.stopImmediatePropagation();
          e.preventDefault();
          log('Blocked site popup trigger 💣');
        }
      },
      { capture: true, passive: false }
    );
  }

  function cleanup() {
    clearTimeout(hideAdsDebounceTimer);
    hideAdsDebounceTimer = 0;
    domObserver?.disconnect();
    domObserver = null;
  }

  function init() {
    hideAds();
    runPreloadPassOnce();
    startDomObserver();
    blockPopupFunctions();
    blockAnimeVietsubClickPopup();
    log('AdBlock fully initialized ✅');
  }

  injectPageWorldPopupBlock();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.addEventListener('pagehide', cleanup, { capture: true });
})();
