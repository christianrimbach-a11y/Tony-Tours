/**
 * Einmalige Scroll-/Entrance-Animationen (.animate-on-scroll)
 * Optional: window.tonyToursScrollRevealRefresh(root) für nachträglich eingefügte Knoten
 */
(function () {
  "use strict";

  var observer = null;

  function revealAll(list) {
    list.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  function tryRevealInView(el, obs) {
    if (el.classList.contains("is-visible")) return;
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var vw = window.innerWidth || document.documentElement.clientWidth;
    var visibleH = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    var minShow = Math.min(rect.height * 0.12, 72);
    if (visibleH > minShow && rect.right > 0 && rect.left < vw) {
      el.classList.add("is-visible");
      if (obs) obs.unobserve(el);
    }
  }

  function bindOne(el, obs, reduced) {
    if (el.getAttribute("data-scroll-reveal-bound") === "1") return;
    el.setAttribute("data-scroll-reveal-bound", "1");

    if (reduced || !obs) {
      el.classList.add("is-visible");
      return;
    }

    obs.observe(el);
    tryRevealInView(el, obs);
  }

  function scan(root, obs, reduced) {
    var scope = root && root.querySelectorAll ? root : document;
    var list = scope.querySelectorAll
      ? scope.querySelectorAll(".animate-on-scroll:not([data-scroll-reveal-bound])")
      : [];
    if (!list.length) return;
    Array.prototype.forEach.call(list, function (el) {
      bindOne(el, obs, reduced);
    });
  }

  function init() {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!("IntersectionObserver" in window)) {
      scan(document, null, true);
      window.tonyToursScrollRevealRefresh = function (root) {
        scan(root || document, null, true);
      };
      return;
    }

    if (reduced) {
      var all = document.querySelectorAll(".animate-on-scroll");
      revealAll(all);
      window.tonyToursScrollRevealRefresh = function () {};
      return;
    }

    observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -6% 0px"
      }
    );

    scan(document, observer, false);

    window.tonyToursScrollRevealRefresh = function (root) {
      scan(root || document, observer, false);
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
