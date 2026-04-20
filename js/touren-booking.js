/**
 * TonyTours – Schnellbuchung auf touren.html
 * Daten entsprechen den Tour-Blöcken auf der Seite (Preise / Status).
 * Zahlungsabwicklung: vorbereitet für spätere API (z. B. Stripe); aktuell Mailto-Flow.
 */
(function () {
  "use strict";

  const MAILTO = "info@tonytours.de";

  /** @type {Record<string, BookingTour>} */
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
      priceNote: "Kinder 7 € – bitte im Feld „Nachricht“ oder bei uns nach der Anfrage angeben.",
      highlights: [
        "Geführt vom Werdchen bis Wanfried – volle Route mit Wow-Momenten",
        "Ideal für Einsteiger: kleine Gruppe, E-Bike empfohlen, Fotostopps",
        "Sicher dir deinen Platz – persönlich statt Massentourismus"
      ],
      thumb: "/assets/Leuchtberg_.jpg",
      ctaOpen: "Jetzt buchen",
      ctaCheckout: "Buchung abschließen"
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
      priceNote: null,
      highlights: [
        "Ruhige Wege am Werraufer – perfekt zum Ankommen",
        "Kurze Strecken? Wir fahren im passenden Tempo",
        "Interesse vormerken: wir informieren dich zum Starttermin"
      ],
      thumb: "/assets/Werratal_Tour.jpg",
      ctaOpen: "Anfrage senden",
      ctaCheckout: "Anfrage senden"
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
      priceNote: null,
      highlights: [
        "Kurven, Schwalbental & Highwalk – echtes Kurvenparadies",
        "Wenig Verkehr, kleine Gruppen, maximale Freiheit",
        "Unverbindlich anfragen – wir melden uns mit Termin & Preis"
      ],
      thumb: "/assets/tour-suedwest-schwalbental.png",
      ctaOpen: "Anfrage senden",
      ctaCheckout: "Anfrage senden"
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
      priceNote: null,
      highlights: [
        "Werratal, Normannstein, Probstei Zella & Eisenach",
        "Geschichte trifft Motorradgefühl – kompakt am Stück",
        "Persönlich gebucht – TonyTours zeigt dir die Nebenstrecken"
      ],
      thumb: "/assets/tour-suedost-01-burg.png",
      ctaOpen: "Anfrage senden",
      ctaCheckout: "Anfrage senden"
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
      priceNote: null,
      highlights: [
        "Fährhaus Hemeln, Weser-Fähre & Hoher Meißner",
        "Echte Biker-Strecke mit Wow-Aussichten",
        "Anfrage ohne Risiko – Preis & Termin klären wir mit dir"
      ],
      thumb: "/assets/tour-nordwest-01-hoher-meissner.png",
      ctaOpen: "Anfrage senden",
      ctaCheckout: "Anfrage senden"
    }
  };

  const modal = document.getElementById("booking-modal");
  if (!modal) return;

  const backdrop = modal.querySelector(".booking-modal__backdrop");
  const btnClose = modal.querySelectorAll("[data-close-booking]");
  const step1 = document.getElementById("booking-step-1");
  const step2 = document.getElementById("booking-step-2");
  const form = document.getElementById("booking-form-step1");
  const formCheckout = document.getElementById("booking-form-checkout");

  const elTourLabel = document.getElementById("booking-selected-tour-label");
  const elSummary = document.getElementById("booking-checkout-summary");
  const elBtnStep1 = document.getElementById("booking-btn-step1");
  const elBtnCheckout = document.getElementById("booking-btn-checkout");
  const elBtnBack = document.getElementById("booking-btn-back");

  let currentTourId = null;
  let lastPayload = null;

  function getTour(id) {
    return TOURS[id] || null;
  }

  function openModal(tourId) {
    const tour = getTour(tourId);
    if (!tour) return;

    currentTourId = tourId;
    modal.removeAttribute("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    elTourLabel.textContent = tour.title;
    form.querySelector('input[name="tourId"]').value = tour.id;

    step1.hidden = false;
    step2.hidden = true;
    form.reset();
    form.querySelector('input[name="tourId"]').value = tour.id;
    clearErrors();

    modal.querySelector("#booking-modal-title").textContent =
      tour.status === "available" ? "Tour buchen" : "Tour-Anfrage";

    elBtnStep1.textContent = "Weiter zum Checkout";
    elBtnCheckout.textContent = tour.ctaCheckout;

    var datumInput = form.querySelector('input[name="datum"]');
    if (datumInput) {
      datumInput.min = new Date().toISOString().split("T")[0];
    }

    const first = form.querySelector("input[name=vorname]");
    if (first) first.focus();
  }

  function closeModal() {
    modal.setAttribute("hidden", "");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    currentTourId = null;
    lastPayload = null;
  }

  function clearErrors() {
    modal.querySelectorAll(".booking-field-error").forEach((el) => {
      el.textContent = "";
    });
    modal.querySelectorAll(".booking-input").forEach((el) => el.classList.remove("booking-input--invalid"));
  }

  function setError(name, msg) {
    const err = modal.querySelector('[data-error-for="' + name + '"]');
    const input = form.querySelector("[name=\"" + name + "\"]");
    if (err) err.textContent = msg || "";
    if (input) input.classList.toggle("booking-input--invalid", Boolean(msg));
  }

  function validateStep1() {
    clearErrors();
    let ok = true;

    const vorname = form.vorname.value.trim();
    const nachname = form.nachname.value.trim();
    const email = form.email.value.trim();
    const telefon = form.telefon.value.trim();
    const datum = form.datum.value;
    const personen = parseInt(form.personen.value, 10);
    const privacy = form.privacy.checked;

    if (!vorname) {
      setError("vorname", "Bitte Vornamen eingeben.");
      ok = false;
    }
    if (!nachname) {
      setError("nachname", "Bitte Nachnamen eingeben.");
      ok = false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("email", "Bitte gültige E-Mail eingeben.");
      ok = false;
    }
    if (!telefon || telefon.length < 5) {
      setError("telefon", "Bitte Telefonnummer angeben.");
      ok = false;
    }
    if (!datum) {
      setError("datum", "Bitte Wunschdatum wählen.");
      ok = false;
    }
    if (!personen || personen < 1) {
      setError("personen", "Mindestens 1 Person.");
      ok = false;
    }
    if (!privacy) {
      setError("privacy", "Bitte Datenschutzhinweis bestätigen.");
      ok = false;
    }

    return ok;
  }

  function buildSummaryHtml(tour, data) {
    const p = data.personen;
    let priceBlock = "";
    if (tour.priceAdult != null) {
      const total = p * tour.priceAdult;
      priceBlock =
        '<div class="booking-summary__row"><span>Preis p. P. (Erw.)</span><span>' +
        tour.priceAdult +
        " €</span></div>" +
        '<div class="booking-summary__row"><span>Personen</span><span>' +
        p +
        "</span></div>" +
        '<div class="booking-summary__row booking-summary__row--total"><span>Zwischensumme (Erwachsene)</span><span>' +
        total +
        " €</span></div>";
      if (tour.priceNote) {
        priceBlock += '<p class="booking-summary__hint">' + escapeHtml(tour.priceNote) + "</p>";
      }
    } else {
      priceBlock =
        '<div class="booking-summary__row"><span>Preis</span><span>Preis auf Anfrage</span></div>' +
        '<p class="booking-summary__hint">Individuelles Angebot – Gesamtsumme nach Absprache.</p>';
    }

    return (
      '<div class="booking-summary">' +
      '<div class="booking-summary__row"><span>Tour</span><strong>' +
      escapeHtml(tour.title) +
      "</strong></div>" +
      '<div class="booking-summary__row"><span>Datum</span><span>' +
      escapeHtml(data.datum) +
      "</span></div>" +
      '<div class="booking-summary__row"><span>Personen</span><span>' +
      p +
      "</span></div>" +
      priceBlock +
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

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function goStep2() {
    const tour = getTour(currentTourId);
    if (!tour) return;

    const data = {
      vorname: form.vorname.value.trim(),
      nachname: form.nachname.value.trim(),
      email: form.email.value.trim(),
      telefon: form.telefon.value.trim(),
      datum: form.datum.value,
      personen: parseInt(form.personen.value, 10),
      nachricht: form.nachricht.value.trim(),
      tourId: tour.id,
      tourTitle: tour.title
    };

    lastPayload = data;
    elSummary.innerHTML = buildSummaryHtml(tour, data);
    step1.hidden = true;
    step2.hidden = false;
  }

  function submitCheckout() {
    const tour = getTour(currentTourId);
    if (!tour || !lastPayload) return;

    const lines = [
      "TonyTours – Buchungsanfrage",
      "Tour: " + lastPayload.tourTitle,
      "Datum: " + lastPayload.datum,
      "Personen: " + lastPayload.personen,
      "",
      "Kontakt:",
      "Name: " + lastPayload.vorname + " " + lastPayload.nachname,
      "E-Mail: " + lastPayload.email,
      "Telefon: " + lastPayload.telefon,
      ""
    ];

    if (lastPayload.nachricht) {
      lines.push("Nachricht:", lastPayload.nachricht, "");
    }

    if (tour.priceAdult != null) {
      lines.push(
        "Preis (Orientierung Erwachsene):",
        lastPayload.personen + " × " + tour.priceAdult + " € = " + lastPayload.personen * tour.priceAdult + " €",
        "( finale Abrechnung / Kinderpreis mit TonyTours )",
        ""
      );
    } else {
      lines.push("Preis: auf Anfrage", "");
    }

    lines.push("—", "Gesendet über TonyTours Schnellbuchung (ohne Zahlungsprovider).");

    const subject =
      tour.status === "available"
        ? encodeURIComponent("Buchungsanfrage: " + lastPayload.tourTitle)
        : encodeURIComponent("Tour-Anfrage: " + lastPayload.tourTitle);
    const body = encodeURIComponent(lines.join("\n"));

    window.location.href = "mailto:" + MAILTO + "?subject=" + subject + "&body=" + body;
    closeModal();
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
      if (tour.priceAdult != null) {
        return "Ab " + tour.priceAdult + " € / Erw.";
      }
      return "Preis auf Anfrage";
    }

    function buildCard(tour) {
      const article = document.createElement("article");
      article.className = "book-card " + statusModifier(tour.status);
      article.setAttribute("data-tour-id", tour.id);

      const pills = tour.meta
        .map(function (m) {
          return '<span class="book-card__pill">' + escapeHtml(m) + "</span>";
        })
        .join("");

      const priceExtra =
        '<span class="book-card__pill book-card__pill--accent">' + escapeHtml(pricePill(tour)) + "</span>";

      const highlights = tour.highlights
        .map(function (h) {
          return "<li>" + escapeHtml(h) + "</li>";
        })
        .join("");

      article.innerHTML =
        '<div class="book-card__inner">' +
        '<div class="book-card__top">' +
        '<div class="book-card__thumb-wrap">' +
        '<img class="book-card__thumb" src="' +
        escapeHtml(tour.thumb) +
        '" alt="" width="72" height="72" loading="lazy" decoding="async" />' +
        "</div>" +
        '<div class="book-card__head">' +
        '<span class="book-card__cat">' +
        escapeHtml(tour.category) +
        "</span>" +
        '<h3 class="book-card__title">' +
        escapeHtml(tour.title) +
        "</h3>" +
        "</div>" +
        "</div>" +
        '<div class="book-card__pills">' +
        pills +
        priceExtra +
        "</div>" +
        '<ul class="book-card__highlights">' +
        highlights +
        "</ul>" +
        '<button type="button" class="btn btn--primary btn-primary book-card__cta" data-open-booking="' +
        escapeHtml(tour.id) +
        '">' +
        escapeHtml(tour.ctaOpen) +
        "</button>" +
        "</div>";

      return article;
    }

    const ebikeTours = sortTours(Object.values(TOURS).filter(function (t) {
      return t.group === "ebike";
    }));
    const motoTours = sortTours(Object.values(TOURS).filter(function (t) {
      return t.group === "moto";
    }));

    ebikeEl.innerHTML = "";
    motoEl.innerHTML = "";
    ebikeTours.forEach(function (t) {
      ebikeEl.appendChild(buildCard(t));
    });
    motoTours.forEach(function (t) {
      motoEl.appendChild(buildCard(t));
    });
  }

  renderBookingCards();

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-open-booking]");
    if (!trigger) return;
    var id = trigger.getAttribute("data-open-booking");
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
  });

  formCheckout?.addEventListener("submit", (e) => {
    e.preventDefault();
    submitCheckout();
  });
})();
