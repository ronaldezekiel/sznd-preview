/* sznd. polish layer (v8). Small, dependency-free, safe to load deferred.
   1. The product photo carries over from a card to its product page (view transitions).
   2. A thin reading line on journal posts. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NAME = 'szn-photo';
  var KEY = 'sznPhoto';

  /* ---------- 1. Photo carry-over ---------- */
  function clearNames() {
    document.querySelectorAll('[data-szn-vt]').forEach(function (el) { el.style.viewTransitionName = ''; el.removeAttribute('data-szn-vt'); });
  }
  function tag(el) { if (!el) return; clearNames(); el.style.viewTransitionName = NAME; el.setAttribute('data-szn-vt', ''); }
  function cardImg(card) {
    if (!card) return null;
    var worn = card.closest('.grid--worn');
    return card.querySelector(worn ? '.card__img--alt' : '.card__img:not(.card__img--alt)') || card.querySelector('.card__media img');
  }
  window.SZNDPolish = { tag: tag, clear: clearNames, cardImg: cardImg, reduce: reduce };

  if (!reduce) {
    // Remember which card was opened. Works for the Shopify theme (real page loads)
    // and is reused by the preview's own router.
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('.card a[href]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      var img = cardImg(a.closest('.card'));
      if (!img) return;
      tag(img);
      try { sessionStorage.setItem(KEY, '1'); } catch (err) {}
    }, true);

    // Shopify: the new page names its first gallery photo before it is first painted.
    window.addEventListener('pagereveal', function (e) {
      var flag = null;
      try { flag = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch (err) {}
      if (!e.viewTransition) return;
      if (!flag) return;
      var first = document.querySelector('.gallery__item img');
      if (first) {
        first.style.viewTransitionName = NAME;
        e.viewTransition.finished.finally(function () { first.style.viewTransitionName = ''; });
      }
    });
    // The page being left drops its names once the swap is done (back/forward cache).
    window.addEventListener('pageshow', function () { clearNames(); });
  }

  /* ---------- 2. Reading line on articles ---------- */
  function readLine() {
    if (document.querySelector('.read-line')) return;
    var line = document.createElement('div');
    line.className = 'read-line';
    line.setAttribute('aria-hidden', 'true');
    document.body.appendChild(line);
    if (window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()')) return;
    var tick = false;
    var update = function () {
      tick = false;
      var max = document.documentElement.scrollHeight - innerHeight;
      line.style.setProperty('--read', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
    };
    addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }
  window.SZNDPolish.readLine = readLine;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', readLine); else readLine();
})();
