/** Formspree Kontaktformular (kontakt.html): ID aus dem Dashboard eintragen. */
const FORMSPREE_KONTAKT_ENDPOINT = "https://formspree.io/f/meevrjkl";

/** SumUp Pay Links (Buchungslogik siehe js/buchung-sumup-modal.js; GPX-Button buchung.html). */
const LINKS = {
  motorrad: "https://pay.sumup.com/b2c/QBFVRQXR",
  ebike_erwachsene: "https://pay.sumup.com/b2c/Q7M0X5CH",
  ebike_kinder: "https://pay.sumup.com/b2c/QXFHT4DH",
  gpx: "https://pay.sumup.com/b2c/QXEERGZV"
};

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  const gpxKaufBtn = document.querySelector("a.gpx-btn");
  if (gpxKaufBtn && LINKS.gpx) {
    gpxKaufBtn.setAttribute("href", LINKS.gpx);
  }

  // Hero-/Seiten-Videos: src erst nach DOMContentLoaded setzen (data-src + ?v=… gegen aggressives Cross-Page-Caching)
  document.querySelectorAll("video[data-src]").forEach((video) => {
    const src = video.getAttribute("data-src");
    if (!src) return;
    video.src = src;
    video.load();
    video.play().catch(() => {});
  });

  // Mobile navigation toggle
  const hamburger = document.querySelector(".hamburger");
  const mobileNav = document.querySelector(".mobile-nav");
  const mobileOverlay = document.querySelector(".mobile-overlay");

  function setNavOpen(open) {
    body.classList.toggle("nav-open", open);
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", () => {
      setNavOpen(!body.classList.contains("nav-open"));
    });

    // Close when clicking a link inside mobile menu
    mobileNav.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.tagName === "A") setNavOpen(false);
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener("click", () => setNavOpen(false));
  }

  // Sticky header shadow after scroll threshold
  const header = document.querySelector(".site-header");
  const SCROLL_LIMIT = 50;
  if (header) {
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > SCROLL_LIMIT);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Smooth scroll for same-page anchor links
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Hero slideshow (gradient backgrounds with cross-fade)
  const heroSlides = [
    // Outdoor-ish warm/cool gradients
    "radial-gradient(circle at 20% 20%, rgba(245,166,35,0.40), rgba(26,26,26,0) 45%), linear-gradient(135deg, #0B3D2E 0%, #0E355A 55%, #1A1A1A 100%)",
    "radial-gradient(circle at 80% 30%, rgba(46,134,193,0.45), rgba(26,26,26,0) 50%), linear-gradient(135deg, #0F3A66 0%, #1B6B4B 55%, #1A1A1A 100%)",
    "radial-gradient(circle at 40% 70%, rgba(245,166,35,0.35), rgba(26,26,26,0) 55%), linear-gradient(135deg, #0B2F3A 0%, #234E6F 55%, #1A1A1A 100%)"
  ];

  function initHeroSlideshow(slideshow) {
    const layer1 = slideshow.querySelector(".hero-bg--1");
    const layer2 = slideshow.querySelector(".hero-bg--2");
    if (!layer1 || !layer2) return;

    let current = 0;
    let showingLayer1 = true;

    layer1.style.backgroundImage = heroSlides[0];
    layer2.style.backgroundImage = heroSlides[1];
    layer1.style.opacity = "1";
    layer2.style.opacity = "0";

    setInterval(() => {
      const next = (current + 1) % heroSlides.length;
      const active = showingLayer1 ? layer2 : layer1; // fade-in layer
      const inactive = showingLayer1 ? layer1 : layer2; // fade-out layer

      active.style.backgroundImage = heroSlides[next];
      active.style.opacity = "1";
      inactive.style.opacity = "0";

      current = next;
      showingLayer1 = !showingLayer1;
    }, 5000);
  }

  document.querySelectorAll(".hero-slideshow").forEach(initHeroSlideshow);

  // Cross-page anchor links (z. B. index -> touren.html#tour-*) sanft nachziehen
  if (window.location.hash) {
    const hashTarget = document.querySelector(window.location.hash);
    if (hashTarget) {
      window.setTimeout(() => {
        hashTarget.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }
  }

  // Tour-Bild-Slideshows (z. B. Motorrad Südwest)
  function initTourSlideshow(root) {
    const slides = root.querySelectorAll(".tour-slideshow__slide");
    const dotsWrap = root.querySelector(".tour-slideshow__dots");
    const prevBtn = root.querySelector(".tour-slideshow__btn--prev");
    const nextBtn = root.querySelector(".tour-slideshow__btn--next");
    if (!slides.length) return;

    let idx = 0;
    const n = slides.length;
    const rawInterval = parseInt(root.getAttribute("data-interval") || "5500", 10);
    const intervalMs = Number.isFinite(rawInterval) ? Math.max(2500, rawInterval) : 5500;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function go(i) {
      idx = ((i % n) + n) % n;
      slides.forEach((s, j) => {
        const on = j === idx;
        s.classList.toggle("is-active", on);
        s.toggleAttribute("aria-hidden", !on);
      });
      dotsWrap?.querySelectorAll(".tour-slideshow__dot").forEach((d, j) => {
        const on = j === idx;
        d.classList.toggle("is-active", on);
        d.setAttribute("aria-selected", on ? "true" : "false");
      });
    }

    slides.forEach((s, j) => {
      if (!s.hasAttribute("aria-hidden")) s.setAttribute("aria-hidden", j === 0 ? "false" : "true");
    });

    if (dotsWrap && n > 1) {
      dotsWrap.innerHTML = "";
      slides.forEach((_, j) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tour-slideshow__dot" + (j === 0 ? " is-active" : "");
        b.setAttribute("aria-label", `Foto ${j + 1} von ${n}`);
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", j === 0 ? "true" : "false");
        b.addEventListener("click", () => {
          go(j);
          armTimer();
        });
        dotsWrap.appendChild(b);
      });
    }

    let timerId = 0;
    function armTimer() {
      if (timerId) clearInterval(timerId);
      timerId = 0;
      if (reduceMotion || n < 2) return;
      timerId = window.setInterval(() => go(idx + 1), intervalMs);
    }

    prevBtn?.addEventListener("click", () => {
      go(idx - 1);
      armTimer();
    });
    nextBtn?.addEventListener("click", () => {
      go(idx + 1);
      armTimer();
    });

    if (n < 2) {
      prevBtn && (prevBtn.style.visibility = "hidden");
      nextBtn && (nextBtn.style.visibility = "hidden");
      dotsWrap && (dotsWrap.style.display = "none");
    }

    go(0);
    armTimer();
  }

  document.querySelectorAll("[data-tour-slideshow]").forEach(initTourSlideshow);

  // Form validation + success handling
  function setInvalid(el, isInvalid) {
    if (!el) return;
    el.classList.toggle("invalid", Boolean(isInvalid));
  }

  function buildMailto(form) {
    const to = (form.getAttribute("action") || "").replace(/^mailto:/, "");
    const inputs = Array.from(form.querySelectorAll("input, textarea, select"));

    const pairs = inputs
      .filter((el) => el.name && !el.disabled)
      .map((el) => {
        const value = (el.value || "").trim();
        if (!value) return null;
        // Use label text where possible
        const label = form.querySelector(`label[for="${el.id}"]`);
        const key = label ? label.textContent.replace("*", "").trim() : el.name;
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .filter(Boolean);

    const subjectInput = form.querySelector('input[name="betreff"]');
    const subjectEl = subjectInput || form.querySelector('input[name="gewünschtesDatum"], input[name="datum"]');
    const subject = (subjectEl && subjectEl.value ? subjectEl.value : "TonyTours Anfrage") + "";

    const body = pairs
      .map((p) => {
        const [k, v] = p.split("=");
        return `${decodeURIComponent(k)}: ${decodeURIComponent(v || "")}`;
      })
      .join("\n");

    const params = new URLSearchParams({
      subject,
      body
    });

    return `mailto:${to}?${params.toString()}`;
  }

  function handleForm(form, successSelector) {
    const successEl = successSelector ? document.querySelector(successSelector) : form.closest(".form-wrap")?.querySelector(".form-success");
    const formWrap = form.closest(".form-wrap") || form.parentElement;

    form.addEventListener("submit", (e) => {
      const requiredEls = Array.from(form.querySelectorAll("[required]"));
      let isValid = true;

      requiredEls.forEach((el) => {
        const value = (el.value || "").trim();
        const isEmpty = !value && el.type !== "checkbox";
        const isCheckboxEmpty = el.type === "checkbox" && !el.checked;
        const invalid = isEmpty || isCheckboxEmpty;
        if (invalid) isValid = false;
        setInvalid(el, invalid);
      });

      if (!isValid) {
        e.preventDefault();
        return;
      }

      e.preventDefault();

      // Show success UI
      if (successEl) successEl.classList.add("visible");
      if (formWrap) formWrap.querySelectorAll("form").forEach((f) => (f.style.display = "none"));

      // Open mail client (best-effort)
      try {
        const mailto = buildMailto(form);
        window.location.href = mailto;
      } catch (_) {
        // No-op: success UI is still shown
      }
    });
  }

  document.querySelectorAll("form[data-js-form='true']").forEach((form) => {
    handleForm(form);
  });

  // Kontakt: Formspree (kein mailto)
  const kontaktForm = document.getElementById("kontaktForm");
  if (kontaktForm) {
    kontaktForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = kontaktForm.querySelector('button[type="submit"]');
      const erfolg = document.getElementById("formErfolg");
      const fehler = document.getElementById("formFehler");
      if (!submitBtn || !erfolg || !fehler) return;

      const requiredEls = Array.from(kontaktForm.querySelectorAll("[required]"));
      let isValid = true;
      requiredEls.forEach((el) => {
        const value = (el.value || "").trim();
        const invalid = !value;
        if (invalid) isValid = false;
        setInvalid(el, invalid);
      });
      if (!isValid) return;

      if (FORMSPREE_KONTAKT_ENDPOINT.indexOf("REPLACE_KONTAKT_ENDPOINT") !== -1) {
        fehler.hidden = false;
        fehler.innerHTML =
          'Formspree ist noch nicht eingerichtet. Bitte die Form-ID in der Datei js/main.js bei FORMSPREE_KONTAKT_ENDPOINT eintragen – oder schreib an <a href="mailto:info@tonytours.de">info@tonytours.de</a>.';
        return;
      }

      const origLabel = submitBtn.textContent;
      submitBtn.textContent = "Wird gesendet…";
      submitBtn.disabled = true;
      erfolg.hidden = true;
      fehler.hidden = true;

      const betreff = document.getElementById("k_betreff").value.trim();
      const formData = {
        name: document.getElementById("k_name").value.trim(),
        email: document.getElementById("k_email").value.trim(),
        betreff,
        nachricht: document.getElementById("k_nachricht").value.trim(),
        _subject: "Neue Kontaktanfrage – TonyTours: " + betreff,
        _replyto: document.getElementById("k_email").value.trim()
      };

      try {
        const response = await fetch(FORMSPREE_KONTAKT_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(formData)
        });

        let result = {};
        try {
          result = await response.json();
        } catch (_) {}

        if (response.ok) {
          erfolg.hidden = false;
          kontaktForm.reset();
          requiredEls.forEach((el) => setInvalid(el, false));
          submitBtn.textContent = "Gesendet!";
          submitBtn.style.background = "#27AE60";
        } else {
          throw new Error((result && result.error) || "Fehler");
        }
      } catch (_err) {
        fehler.hidden = false;
        fehler.innerHTML =
          'Etwas ist schiefgelaufen. Bitte versuche es erneut oder schreib direkt an <a href="mailto:info@tonytours.de">info@tonytours.de</a>.';
        submitBtn.textContent = origLabel;
        submitBtn.disabled = false;
      }
    });
  }
});

