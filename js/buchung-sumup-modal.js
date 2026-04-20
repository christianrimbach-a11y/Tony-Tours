/**
 * TonyTours – Buchungs-Modal (SumUp Pay Links) für buchung.html
 * Echte Pay-Link-URLs in SUMUP_EBIKE_LINK / SUMUP_MOTORRAD_LINK eintragen.
 */
(function () {
  "use strict";

  const SUMUP_EBIKE_LINK = "https://pay.sumup.com/DEIN-EBIKE-LINK";
  const SUMUP_MOTORRAD_LINK = "https://pay.sumup.com/DEIN-MOTORRAD-LINK";

  /** Formspree: zweites Formular für Buchungs-Backup-Mails. ID aus dem Dashboard eintragen (…/f/DEINE-ID). */
  const FORMSPREE_BOOKING_ENDPOINT = "https://formspree.io/f/REPLACE_BOOKING_ENDPOINT";

  const PREISE = {
    ebike: {
      erwachsene: 10,
      kinder: 7,
      label: "E-Bike Tour"
    },
    motorrad: {
      erwachsene: 49,
      kinder: 0,
      label: "Motorrad-Tour (Aktionspreis)"
    }
  };

  function getEl(id) {
    return document.getElementById(id);
  }

  /** Motorrad-Touren: ohne Formular direkt zur SumUp-Zahlungsseite (nur buchung.html-Karten). */
  window.geheZuSumUpMotorradDirekt = function () {
    var url = SUMUP_MOTORRAD_LINK;
    if (!url || url.indexOf("DEIN-") !== -1) {
      window.alert(
        "Bitte den SumUp Pay Link für Motorrad-Touren in js/buchung-sumup-modal.js eintragen (SUMUP_MOTORRAD_LINK)."
      );
      return;
    }
    window.location.href = url;
  };

  window.oeffneModal = function (tourTyp, tourName) {
    const modal = getEl("buchungsModal");
    const typInput = getEl("selectedTourType");
    const nameInput = getEl("selectedTourName");
    const kinderFeld = getEl("kinderFeld");
    const kinderInput = getEl("kinder");
    if (!modal || !typInput || !nameInput) return;

    typInput.value = tourTyp || "";
    nameInput.value = tourName || "";

    if (tourTyp === "motorrad") {
      if (kinderFeld) kinderFeld.style.display = "none";
      if (kinderInput) kinderInput.value = "0";
    } else {
      if (kinderFeld) kinderFeld.style.display = "";
    }

    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    var datum = getEl("datum");
    if (datum && !datum.value) {
      datum.min = new Date().toISOString().split("T")[0];
    }

    window.berechnePreis();
  };

  window.schliesseModal = function () {
    var modal = getEl("buchungsModal");
    if (!modal) return;
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  window.berechnePreis = function () {
    var typInput = getEl("selectedTourType");
    var preis = PREISE[typInput && typInput.value];
    if (!preis) return;

    var erw = parseInt(getEl("erwachsene").value, 10) || 0;
    var kinder = parseInt(getEl("kinder").value, 10) || 0;

    if (typInput.value === "motorrad") {
      kinder = 0;
      var ki = getEl("kinder");
      if (ki) ki.value = "0";
    }

    var gesamt = erw * preis.erwachsene + kinder * preis.kinder;

    var gesamtEl = getEl("gesamtpreis");
    if (gesamtEl) gesamtEl.textContent = gesamt + " €";

    var hinweis = "";
    if (erw > 0) hinweis += erw + " × " + preis.erwachsene + " € (Erwachsene)";
    if (kinder > 0) hinweis += (hinweis ? " + " : "") + kinder + " × " + preis.kinder + " € (Kinder)";

    var hEl = getEl("preisHinweis");
    if (hEl) hEl.textContent = hinweis;
  };

  window.weiterZuSumUp = function () {
    var vorname = getEl("vorname").value.trim();
    var nachname = getEl("nachname").value.trim();
    var email = getEl("email").value.trim();
    var telefon = getEl("telefon").value.trim();
    var datum = getEl("datum").value;
    var tourTyp = getEl("selectedTourType").value;
    var tourName = getEl("selectedTourName").value.trim();

    if (!vorname || !nachname || !email || !telefon || !datum) {
      window.alert("Bitte fülle alle Pflichtfelder aus.");
      return;
    }

    var erw = parseInt(getEl("erwachsene").value, 10) || 0;
    var kinder = tourTyp === "motorrad" ? 0 : parseInt(getEl("kinder").value, 10) || 0;

    if (erw < 1) {
      window.alert("Bitte mindestens eine erwachsene Person angeben.");
      return;
    }

    if (tourTyp === "ebike" && erw + kinder < 1) {
      window.alert("Bitte mindestens eine Person angeben.");
      return;
    }

    try {
      var p = PREISE[tourTyp];
      var gesamt = erw * p.erwachsene + kinder * p.kinder;
      sessionStorage.setItem(
        "tonytours_buchung_meta",
        JSON.stringify({
          tourTyp: tourTyp,
          tourName: tourName,
          vorname: vorname,
          nachname: nachname,
          email: email,
          telefon: telefon,
          datum: datum,
          erwachsene: erw,
          kinder: kinder,
          gesamtEuro: gesamt,
          ts: Date.now()
        })
      );
    } catch (_e) {}

    var url = tourTyp === "motorrad" ? SUMUP_MOTORRAD_LINK : SUMUP_EBIKE_LINK;
    if (!url || url.indexOf("DEIN-") !== -1) {
      window.alert(
        "Bitte die SumUp Pay Links in js/buchung-sumup-modal.js (SUMUP_EBIKE_LINK / SUMUP_MOTORRAD_LINK) eintragen."
      );
      return;
    }

    (function sendBookingEmailBackup() {
      var fsForm = getEl("buchungsFormspree");
      var endpoint = (fsForm && fsForm.getAttribute("action")) || "";
      if (!endpoint || endpoint.indexOf("REPLACE_BOOKING_ENDPOINT") !== -1) return;

      var set = function (id, val) {
        var el = getEl(id);
        if (el) el.value = val == null ? "" : String(val);
      };
      set("fs_vorname", vorname);
      set("fs_nachname", nachname);
      set("fs_email", email);
      set("fs_replyto", email);
      set("fs_telefon", telefon);
      set("fs_datum", datum);
      set("fs_tour", tourName);
      set("fs_tour_typ", tourTyp);
      set("fs_erwachsene", String(erw));
      set("fs_kinder", String(kinder));
      var preisEl = getEl("gesamtpreis");
      set("fs_preis", preisEl ? preisEl.textContent.trim() : "");

      var fd = new FormData(fsForm);
      fetch(endpoint, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
        keepalive: true
      }).catch(function () {});
    })();

    window.location.href = url;
  };

  document.addEventListener("DOMContentLoaded", function () {
    var fsForm = getEl("buchungsFormspree");
    if (fsForm && FORMSPREE_BOOKING_ENDPOINT.indexOf("REPLACE_BOOKING_ENDPOINT") === -1) {
      fsForm.setAttribute("action", FORMSPREE_BOOKING_ENDPOINT);
    }

    var modal = getEl("buchungsModal");
    if (!modal) return;

    modal.addEventListener("click", function (e) {
      if (e.target === modal) window.schliesseModal();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.style.display === "flex") window.schliesseModal();
    });

    ["erwachsene", "kinder"].forEach(function (id) {
      var el = getEl(id);
      if (el) {
        el.addEventListener("input", window.berechnePreis);
        el.addEventListener("change", window.berechnePreis);
      }
    });
  });
})();
