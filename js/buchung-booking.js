/**
 * TonyTours – Buchungskatalog (Karten) + Legacy-Buchungsmodal (index.html) + GPX.
 * buchung.html: SumUp-Pay-Link-Flow über js/buchung-sumup-modal.js (oeffneModal).
 */
(function () {
  "use strict";

  const MAILTO = "info@tonytours.de";
  const SUMUP_CREATE_ENDPOINT = "/api/create-sumup-checkout";
  /** Gleiche URL wie in main.js (LINKS.gpx); Fallback wenn main.js nicht geladen. */
  const GPX_SUMUP_PAY_URL_FALLBACK = "https://pay.sumup.com/b2c/QXEERGZV";

  function getGpxSumUpPayUrl() {
    try {
      if (typeof LINKS !== "undefined" && LINKS && LINKS.gpx) return LINKS.gpx;
    } catch (_e) {}
    return GPX_SUMUP_PAY_URL_FALLBACK;
  }

  const TOURS = {
    "ebike-leuchtberg": {
      id: "ebike-leuchtberg",
      group: "ebike",
      sortOrder: 1,
      category: "E-Bike Tour",
      title: "Leuchtberg, Schäferhalle & Wanfrieder Hafen",
      status: "available",
      meta: ["34,7 km", "3–4 Std", "299 m Anstieg", "Leicht–Mittel"],
      priceAdult: 10,
      priceChild: 7,
      highlights: [
        "Geführt vom Werdchen bis Wanfried – volle Route mit Wow-Momenten",
        "Ideal für Einsteiger: kleine Gruppe, E-Bike empfohlen, Fotostopps",
        "Sicher dir deinen Platz – persönlich statt Massentourismus"
      ],
      thumb: "/assets/Leuchtberg_.jpg",
      ctaOpen: "Jetzt buchen"
    },
    "ebike-wanfried": {
      id: "ebike-wanfried",
      group: "ebike",
      sortOrder: 2,
      category: "E-Bike Tour",
      title: "Wanfried & Werraufer – eine entspannte Runde",
      status: "upcoming",
      meta: ["ca. 30–40 km", "ca. 3–4 Std", "Leicht", "Demnächst / In Planung"],
      priceAdult: null,
      priceChild: null,
      highlights: [
        "Ruhige Wege am Werraufer – perfekt zum Ankommen",
        "Kurze Strecken? Wir fahren im passenden Tempo",
        "Interesse vormerken: wir informieren dich zum Starttermin"
      ],
      thumb: "/assets/Werratal_Tour.jpg",
      ctaOpen: "Jetzt buchen"
    },
    "moto-suedwest": {
      id: "moto-suedwest",
      group: "moto",
      sortOrder: 1,
      category: "Motorrad-Tour",
      title: "Südwest Tour – Abenteuer & Panorama pur",
      status: "inquiry",
      meta: ["ca. 5 Std gesamt", "~3 Std Fahrt", "Start: Werdchen, Eschwege", "Auf Anfrage"],
      priceAdult: null,
      priceChild: null,
      highlights: [
        "Kurven, Schwalbental & Highwalk – echtes Kurvenparadies",
        "Wenig Verkehr, kleine Gruppen, maximale Freiheit",
        "Unverbindlich anfragen – wir melden uns mit Termin & Preis"
      ],
      thumb: "/assets/tour-suedwest-schwalbental.png",
      ctaOpen: "Jetzt buchen"
    },
    "moto-suedost": {
      id: "moto-suedost",
      group: "moto",
      sortOrder: 2,
      category: "Motorrad-Tour",
      title: "Südost Tour – Kurven, Geschichte & echte Motorleidenschaft",
      status: "inquiry",
      meta: ["ca. 5 Std gesamt", "~3 Std Fahrt", "Start: Werdchen, Eschwege", "Auf Anfrage"],
      priceAdult: null,
      priceChild: null,
      highlights: [
        "Werratal, Normannstein, Probstei Zella & Eisenach",
        "Geschichte trifft Motorradgefühl – kompakt am Stück",
        "Persönlich gebucht – TonyTours zeigt dir die Nebenstrecken"
      ],
      thumb: "/assets/tour-suedost-01-burg.png",
      ctaOpen: "Jetzt buchen"
    },
    "moto-nordwest": {
      id: "moto-nordwest",
      group: "moto",
      sortOrder: 3,
      category: "Motorrad-Tour",
      title: "Nordwest Tour – Weser, Fähre & echtes Biker-Feeling",
      status: "inquiry",
      meta: ["ca. 5 Std gesamt", "~3 Std Fahrt", "Start: Werdchen, Eschwege", "Auf Anfrage"],
      priceAdult: null,
      priceChild: null,
      highlights: [
        "Fährhaus Hemeln, Weser-Fähre & Hoher Meißner",
        "Echte Biker-Strecke mit Wow-Aussichten",
        "Anfrage ohne Risiko – Preis & Termin klären wir mit dir"
      ],
      thumb: "/assets/tour-nordwest-01-hoher-meissner.png",
      ctaOpen: "Jetzt buchen"
    }
  };

  const sumModal = document.getElementById("buchungsModal");
  const legacyModal = document.getElementById("booking-modal");

  function getTour(id) {
    return TOURS[id] || null;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function statusModifier(st) {
    if (st === "available") return "book-card--status-available";
    if (st === "upcoming") return "book-card--status-upcoming";
    return "book-card--status-inquiry";
  }

  function renderBookingCards() {
    const ebikeEl = document.getElementById("quick-book-ebike");
    const motoEl = document.getElementById("quick-book-moto");
    if (!ebikeEl || !motoEl) return;

    function sortTours(list) {
      return list.slice().sort((a, b) => a.sortOrder - b.sortOrder);
    }

    function pricePill(tour) {
      if (tour.priceAdult != null) return "Ab " + tour.priceAdult + " € / Erw.";
      return "Preis auf Anfrage";
    }

    function motorradPreisBlockHtml() {
      return (
        '<div class="motorrad-preis-block">' +
        '<span class="motorrad-preis-label">Preis pro Person</span>' +
        '<div class="motorrad-preis-zeile">' +
        '<span class="preis-alt-card">69 €</span>' +
        '<span class="preis-neu-card">49 €</span>' +
        '<span class="preis-badge-card">Jetzt sparen!</span>' +
        "</div></div>"
      );
    }

    function buildCtaButton(tour) {
      /* Kein inline-onclick mit JSON.stringify: Doppelte Anführungszeichen brechen das Attribut onclick="…" ab.
         Stattdessen data-tour-id + Delegation (initSumupCardClicks). */
      var useSumup = sumModal && typeof window.oeffneModal === "function";
      if (useSumup) {
        return (
          '<button type="button" class="btn btn--primary btn-primary book-card__cta book-card__cta--sumup" data-tour-id="' +
          escapeHtml(tour.id) +
          '">Jetzt buchen</button>'
        );
      }
      return (
        '<button type="button" class="btn btn--primary btn-primary book-card__cta" data-open-booking="' +
        tour.id +
        '">Jetzt buchen</button>'
      );
    }

    function buildCard(tour) {
      const article = document.createElement("article");
      article.className = "book-card " + statusModifier(tour.status);
      const preCta = tour.group === "moto" ? motorradPreisBlockHtml() : "";
      article.innerHTML =
        '<div class="book-card__inner">' +
        '<div class="book-card__top">' +
        '<div class="book-card__thumb-wrap"><img class="book-card__thumb" src="' +
        escapeHtml(tour.thumb) +
        '" alt="" width="72" height="72" loading="lazy" decoding="async" /></div>' +
        '<div class="book-card__head"><span class="book-card__cat">' +
        escapeHtml(tour.category) +
        '</span><h3 class="book-card__title">' +
        escapeHtml(tour.title) +
        "</h3></div>" +
        "</div>" +
        '<div class="book-card__pills">' +
        tour.meta.map((m) => '<span class="book-card__pill">' + escapeHtml(m) + "</span>").join("") +
        '<span class="book-card__pill book-card__pill--accent">' +
        escapeHtml(pricePill(tour)) +
        "</span></div>" +
        '<ul class="book-card__highlights">' +
        tour.highlights.map((h) => "<li>" + escapeHtml(h) + "</li>").join("") +
        "</ul>" +
        preCta +
        buildCtaButton(tour) +
        "</div>";
      return article;
    }

    ebikeEl.innerHTML = "";
    motoEl.innerHTML = "";
    var ebikeI = 0;
    sortTours(Object.values(TOURS).filter((t) => t.group === "ebike")).forEach((t) => {
      const card = buildCard(t);
      card.classList.add("animate-on-scroll", "fade-up");
      card.style.setProperty("--scroll-delay", 0.14 + ebikeI * 0.08 + "s");
      ebikeI += 1;
      ebikeEl.appendChild(card);
    });
    var motoI = 0;
    sortTours(Object.values(TOURS).filter((t) => t.group === "moto")).forEach((t) => {
      const card = buildCard(t);
      card.classList.add("animate-on-scroll", "fade-up");
      card.style.setProperty("--scroll-delay", 0.38 + motoI * 0.08 + "s");
      motoI += 1;
      motoEl.appendChild(card);
    });
  }

  renderBookingCards();

  /** SumUp-Buchung: Klicks auf Karten-CTA (ohne kaputtes onclick-HTML durch Anführungszeichen in Tourtiteln) */
  if (sumModal && typeof window.oeffneModal === "function") {
    document.addEventListener(
      "click",
      function (e) {
        var btn = e.target && e.target.closest(".book-card__cta--sumup[data-tour-id]");
        if (!btn) return;
        var id = btn.getAttribute("data-tour-id");
        var tour = getTour(id);
        if (!tour) return;
        e.preventDefault();
        if (tour.group === "moto") {
          if (typeof window.geheZuSumUpMotorradDirekt === "function") {
            window.geheZuSumUpMotorradDirekt();
          }
          return;
        }
        window.oeffneModal("ebike", tour.title);
      },
      false
    );
  }

  /** Legacy-Zweistufen-Modal (z. B. index.html) */
  function initLegacyBookingModal() {
    if (!legacyModal) return;

    const modal = legacyModal;
    const step1 = document.getElementById("booking-step-1");
    const step2 = document.getElementById("booking-step-2");
    const form = document.getElementById("booking-form-step1");
    const formCheckout = document.getElementById("booking-form-checkout");
    const backdrop = modal.querySelector(".booking-modal__backdrop");
    const btnClose = modal.querySelectorAll("[data-close-booking]");
    const elSummary = document.getElementById("booking-checkout-summary");
    const elTourLabel = document.getElementById("booking-selected-tour-label");
    const elBtnStep1 = document.getElementById("booking-btn-step1");
    const elBtnCheckout = document.getElementById("booking-btn-checkout");
    const elBtnBack = document.getElementById("booking-btn-back");
    const elPaymentNotice = document.getElementById("booking-payment-notice");

    let currentTourId = null;
    let lastPayload = null;

    function isFixedPriceTour(tour) {
      return tour && tour.status === "available" && tour.priceAdult != null;
    }

    function setPaymentNotice(msg, isError) {
      if (!elPaymentNotice) return;
      if (!msg) {
        elPaymentNotice.setAttribute("hidden", "");
        elPaymentNotice.textContent = "";
        elPaymentNotice.classList.remove("booking-payment-notice--error");
        return;
      }
      elPaymentNotice.removeAttribute("hidden");
      elPaymentNotice.textContent = msg;
      elPaymentNotice.classList.toggle("booking-payment-notice--error", Boolean(isError));
    }

    function closeModal() {
      modal.setAttribute("hidden", "");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      currentTourId = null;
      lastPayload = null;
      setPaymentNotice("");
    }

    function openModal(tourId) {
      const tour = getTour(tourId);
      if (!tour) return;
      currentTourId = tourId;

      modal.removeAttribute("hidden");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      step1.hidden = false;
      step2.hidden = true;
      form.reset();
      clearErrors();
      setPaymentNotice("");

      form.querySelector('input[name="tourId"]').value = tour.id;
      form.querySelector('input[name="erwachsene"]').value = "1";
      form.querySelector('input[name="kinder"]').value = "0";
      elTourLabel.textContent = tour.title;
      modal.querySelector("#booking-modal-title").textContent = "Tour buchen";

      if (isFixedPriceTour(tour)) {
        elBtnStep1.textContent = "Weiter zum Checkout";
        elBtnCheckout.textContent = "Weiter zu SumUp";
      } else {
        elBtnStep1.textContent = "Weiter zum Checkout";
        elBtnCheckout.textContent = "Buchungsanfrage senden";
      }

      const datumInput = form.querySelector('input[name="datum"]');
      if (datumInput) datumInput.min = new Date().toISOString().split("T")[0];
    }

    function clearErrors() {
      modal.querySelectorAll(".booking-field-error").forEach((el) => {
        el.textContent = "";
      });
      modal.querySelectorAll(".booking-input").forEach((el) => el.classList.remove("booking-input--invalid"));
    }

    function setError(name, msg) {
      const err = modal.querySelector('[data-error-for="' + name + '"]');
      const input = form.querySelector('[name="' + name + '"]');
      if (err) err.textContent = msg || "";
      if (input) input.classList.toggle("booking-input--invalid", Boolean(msg));
    }

    function validateStep1() {
      clearErrors();
      let ok = true;
      const erw = parseInt(form.erwachsene.value, 10);
      const kid = parseInt(form.kinder.value, 10);

      if (!form.vorname.value.trim()) {
        setError("vorname", "Bitte Vornamen eingeben.");
        ok = false;
      }
      if (!form.nachname.value.trim()) {
        setError("nachname", "Bitte Nachnamen eingeben.");
        ok = false;
      }
      if (!form.email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim())) {
        setError("email", "Bitte gültige E-Mail eingeben.");
        ok = false;
      }
      if (!form.telefon.value.trim()) {
        setError("telefon", "Bitte Telefonnummer angeben.");
        ok = false;
      }
      if (!form.datum.value) {
        setError("datum", "Bitte Wunschdatum wählen.");
        ok = false;
      }
      if (Number.isNaN(erw) || erw < 0) {
        setError("erwachsene", "Bitte 0 oder mehr eingeben.");
        ok = false;
      }
      if (Number.isNaN(kid) || kid < 0) {
        setError("kinder", "Bitte 0 oder mehr eingeben.");
        ok = false;
      }
      if ((erw || 0) + (kid || 0) < 1) {
        setError("erwachsene", "Mindestens 1 Person insgesamt.");
        setError("kinder", "Mindestens 1 Person insgesamt.");
        ok = false;
      }
      if (!form.privacy.checked) {
        setError("privacy", "Bitte Datenschutzhinweis bestätigen.");
        ok = false;
      }
      return ok;
    }

    function collectPayload(tour) {
      return {
        vorname: form.vorname.value.trim(),
        nachname: form.nachname.value.trim(),
        email: form.email.value.trim(),
        telefon: form.telefon.value.trim(),
        datum: form.datum.value,
        erwachsene: parseInt(form.erwachsene.value, 10) || 0,
        kinder: parseInt(form.kinder.value, 10) || 0,
        nachricht: form.nachricht.value.trim(),
        tourId: tour.id,
        tourTitle: tour.title
      };
    }

    function buildSummaryHtml(tour, data) {
      let price = "";
      if (isFixedPriceTour(tour)) {
        const adultTotal = data.erwachsene * tour.priceAdult;
        const childTotal = tour.priceChild != null ? data.kinder * tour.priceChild : 0;
        const total = adultTotal + childTotal;
        price =
          '<div class="booking-summary__row"><span>Preis Erwachsene</span><span>' + tour.priceAdult + " €</span></div>" +
          '<div class="booking-summary__row"><span>Erwachsene</span><span>' + data.erwachsene + "</span></div>";
        if (tour.priceChild != null) {
          price +=
            '<div class="booking-summary__row"><span>Preis Kinder</span><span>' + tour.priceChild + " €</span></div>" +
            '<div class="booking-summary__row"><span>Kinder</span><span>' + data.kinder + "</span></div>";
        } else {
          price += '<div class="booking-summary__row"><span>Kinder</span><span>' + data.kinder + "</span></div>";
        }
        price +=
          '<div class="booking-summary__row booking-summary__row--total"><span>Gesamtsumme</span><span>' + total + " €</span></div>";
      } else {
        price =
          '<div class="booking-summary__row"><span>Preis</span><span>Preis auf Anfrage</span></div>' +
          '<p class="booking-summary__hint">Preis auf Anfrage – wir melden uns mit Termin und Preis.</p>';
      }

      return (
        '<div class="booking-summary">' +
        '<div class="booking-summary__row"><span>Tour</span><strong>' +
        escapeHtml(tour.title) +
        "</strong></div>" +
        '<div class="booking-summary__row"><span>Datum</span><span>' +
        escapeHtml(data.datum) +
        "</span></div>" +
        '<div class="booking-summary__row"><span>Erwachsene</span><span>' +
        data.erwachsene +
        "</span></div>" +
        '<div class="booking-summary__row"><span>Kinder</span><span>' +
        data.kinder +
        "</span></div>" +
        price +
        '<div class="booking-summary__divider"></div>' +
        '<div class="booking-summary__row"><span>Kontakt</span><span>' +
        escapeHtml(data.vorname + " " + data.nachname) +
        "<br>" +
        escapeHtml(data.email) +
        "<br>" +
        escapeHtml(data.telefon) +
        "</span></div>" +
        (data.nachricht
          ? '<div class="booking-summary__row booking-summary__row--block"><span>Nachricht</span><p>' +
            escapeHtml(data.nachricht) +
            "</p></div>"
          : "") +
        "</div>"
      );
    }

    function goStep2() {
      const tour = getTour(currentTourId);
      if (!tour) return;
      lastPayload = collectPayload(tour);
      elSummary.innerHTML = buildSummaryHtml(tour, lastPayload);
      step1.hidden = true;
      step2.hidden = false;
      setPaymentNotice("");
    }

    function submitInquiryMail(tour, data) {
      const lines = [
        "TonyTours – Buchungsanfrage",
        "Tour: " + data.tourTitle,
        "Datum: " + data.datum,
        "Erwachsene: " + data.erwachsene,
        "Kinder: " + data.kinder,
        "",
        "Kontakt:",
        "Name: " + data.vorname + " " + data.nachname,
        "E-Mail: " + data.email,
        "Telefon: " + data.telefon,
        "",
        data.nachricht ? "Nachricht:\n" + data.nachricht + "\n" : "",
        "Preis: auf Anfrage",
        "",
        "—",
        "Gesendet über TonyTours Schnellbuchung."
      ];
      const subject = encodeURIComponent("Tour-Anfrage: " + data.tourTitle);
      const body = encodeURIComponent(lines.join("\n"));
      window.location.href = "mailto:" + MAILTO + "?subject=" + subject + "&body=" + body;
      closeModal();
    }

    async function startSumupCheckout(tour, data) {
      const amount =
        data.erwachsene * tour.priceAdult + (tour.priceChild != null ? data.kinder * tour.priceChild : 0);
      const payload = {
        amount: amount.toFixed(2),
        currency: "EUR",
        checkout_reference: "TT-" + Date.now() + "-" + tour.id,
        return_url: window.location.origin + "/buchung.html?payment=success",
        success_url: window.location.origin + "/buchung.html?payment=success",
        tour: {
          id: tour.id,
          title: tour.title,
          date: data.datum,
          adults: data.erwachsene,
          children: data.kinder
        },
        customer: {
          first_name: data.vorname,
          last_name: data.nachname,
          email: data.email,
          phone: data.telefon
        },
        note: data.nachricht || ""
      };

      const res = await fetch(SUMUP_CREATE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      if (!json || !json.checkout_url) throw new Error("Kein checkout_url im Response.");
      window.location.href = json.checkout_url;
    }

    async function submitCheckout() {
      const tour = getTour(currentTourId);
      if (!tour || !lastPayload) return;
      if (!isFixedPriceTour(tour)) {
        submitInquiryMail(tour, lastPayload);
        return;
      }
      try {
        setPaymentNotice("SumUp-Checkout wird vorbereitet ...", false);
        await startSumupCheckout(tour, lastPayload);
      } catch (_err) {
        setPaymentNotice(
          "Die Zahlung konnte noch nicht gestartet werden. Bitte den Backend-Endpunkt /api/create-sumup-checkout mit echten SumUp-Zugangsdaten anbinden.",
          true
        );
      }
    }

    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-open-booking]");
      if (!trigger) return;
      const id = trigger.getAttribute("data-open-booking");
      if (!id || !getTour(id)) return;
      e.preventDefault();
      openModal(id);
    });

    backdrop?.addEventListener("click", closeModal);
    btnClose.forEach((b) => b.addEventListener("click", closeModal));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hasAttribute("hidden")) closeModal();
    });

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateStep1()) return;
      goStep2();
    });

    elBtnBack?.addEventListener("click", () => {
      step2.hidden = true;
      step1.hidden = false;
      setPaymentNotice("");
    });

    formCheckout?.addEventListener("submit", async (e) => {
      e.preventDefault();
      await submitCheckout();
    });

    window.__legacyOpenBookingModal = openModal;
  }

  initLegacyBookingModal();

  const gpxBuyBtn = document.getElementById("gpx-buy-btn");
  const gpxBuyStatus = document.getElementById("gpx-buy-status");

  function setGpxStatus(msg, isError) {
    if (!gpxBuyStatus) return;
    if (!msg) {
      gpxBuyStatus.setAttribute("hidden", "");
      gpxBuyStatus.textContent = "";
      return;
    }
    gpxBuyStatus.removeAttribute("hidden");
    gpxBuyStatus.textContent = msg;
    gpxBuyStatus.style.background = isError ? "rgba(231, 76, 60, 0.22)" : "rgba(255, 255, 255, 0.15)";
    gpxBuyStatus.style.borderColor = isError ? "rgba(231, 76, 60, 0.45)" : "rgba(255, 255, 255, 0.26)";
  }

  /** Direkter SumUp Pay Link (kein Backend nötig). */
  function startGpxCheckout() {
    var url = getGpxSumUpPayUrl();
    window.open(url, "_blank", "noopener,noreferrer");
  }

  gpxBuyBtn?.addEventListener("click", function () {
    setGpxStatus("SumUp öffnet sich in einem neuen Tab …", false);
    startGpxCheckout();
    window.setTimeout(function () {
      setGpxStatus("Bitte die Zahlung im neuen Tab abschließen.", false);
    }, 400);
  });

  window.openBookingModal = function (tourId) {
    const id = typeof tourId === "string" && tourId.trim() ? tourId.trim() : "ebike-leuchtberg";
    const t = getTour(id);
    if (!t) return;
    if (sumModal && t.group === "moto" && typeof window.geheZuSumUpMotorradDirekt === "function") {
      window.geheZuSumUpMotorradDirekt();
      return;
    }
    if (sumModal && typeof window.oeffneModal === "function") {
      window.oeffneModal("ebike", t.title);
    } else if (typeof window.__legacyOpenBookingModal === "function") {
      window.__legacyOpenBookingModal(id);
    }
  };
})();
