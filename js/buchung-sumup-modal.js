/**
 * TonyTours – Buchungs-Modal (SumUp Pay Links) für buchung.html
 * Fixe Beträge pro Person: E-Bike 10 € / Kind 7 €, Motorrad 49 €.
 * Zahlung in mehreren Schritten (ein SumUp-Link pro Person).
 */
(function () {
  "use strict";

  const SUMUP_PAY_LINKS = {
    motorrad: "https://pay.sumup.com/b2c/QBFVRQXR",
    ebikeErwachsene: "https://pay.sumup.com/b2c/Q7M0X5CH",
    ebikeKinder: "https://pay.sumup.com/b2c/QXFHT4DH"
  };

  /** Formspree: Buchungs-Backup-Mails. ID im Dashboard eintragen. */
  const FORMSPREE_BOOKING_ENDPOINT = "https://formspree.io/f/REPLACE_BOOKING_ENDPOINT";

  const MAX_PERSONEN = 10;

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

  function sendeBuchungsEmail(vorname, nachname, email, telefon, datum, tourTyp, tourName, erw, kinder) {
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
  }

  /** Motorrad-Touren: direkt ein Motorrad-Pay-Link (Karten auf buchung.html). */
  window.geheZuSumUpMotorradDirekt = function () {
    var url = SUMUP_PAY_LINKS.motorrad;
    if (!url) {
      window.alert("SumUp-Link für Motorrad-Touren fehlt in js/buchung-sumup-modal.js.");
      return;
    }
    window.location.href = url;
  };

  function zeigZahlungsSchritte(tourTyp, erwachsene, kinder) {
    const LINKS = {
      motorrad: SUMUP_PAY_LINKS.motorrad,
      ebike_erwachsene: SUMUP_PAY_LINKS.ebikeErwachsene,
      ebike_kinder: SUMUP_PAY_LINKS.ebikeKinder
    };

    let schritte = "";
    let gesamtBetrag = 0;
    let schritteAnzahl = 0;

    if (tourTyp === "motorrad") {
      gesamtBetrag = erwachsene * 49;
      for (let i = 1; i <= erwachsene; i++) {
        schritteAnzahl++;
        schritte += `
          <div id="schritt-${schritteAnzahl}" style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            border: 2px solid #EEEEEE;
            border-radius: 12px;
            margin-bottom: 10px;
            background: white;
          ">
            <div style="
              width:32px; height:32px;
              background:#F5A623;
              color:white;
              border-radius:50%;
              display:flex;
              align-items:center;
              justify-content:center;
              font-weight:900;
              font-size:0.9rem;
              flex-shrink:0;
            ">${schritteAnzahl}</div>
            <span style="
              flex:1;
              font-weight:600;
              font-size:0.95rem;
              color:#333;
              font-family:inherit;
            ">Person ${i} – Motorrad-Tour: 49 €</span>
            <a href="${LINKS.motorrad}"
               target="_blank" rel="noopener noreferrer"
               onclick="markiereSchritt(${schritteAnzahl})"
               style="
                 background:#F5A623;
                 color:white;
                 padding:8px 16px;
                 border-radius:20px;
                 text-decoration:none;
                 font-weight:800;
                 font-size:0.85rem;
                 white-space:nowrap;
                 font-family:inherit;
               ">Jetzt zahlen →</a>
          </div>`;
      }
    } else {
      gesamtBetrag = erwachsene * 10 + kinder * 7;
      for (let i = 1; i <= erwachsene; i++) {
        schritteAnzahl++;
        schritte += `
          <div id="schritt-${schritteAnzahl}" style="
            display:flex;
            align-items:center;
            gap:12px;
            padding:14px 16px;
            border:2px solid #EEEEEE;
            border-radius:12px;
            margin-bottom:10px;
            background:white;
          ">
            <div style="
              width:32px; height:32px;
              background:#F5A623;
              color:white;
              border-radius:50%;
              display:flex;
              align-items:center;
              justify-content:center;
              font-weight:900;
              font-size:0.9rem;
              flex-shrink:0;
            ">${schritteAnzahl}</div>
            <span style="
              flex:1;
              font-weight:600;
              font-size:0.95rem;
              color:#333;
              font-family:inherit;
            ">Erwachsener ${i} – E-Bike Tour: 10 €</span>
            <a href="${LINKS.ebike_erwachsene}"
               target="_blank" rel="noopener noreferrer"
               onclick="markiereSchritt(${schritteAnzahl})"
               style="
                 background:#F5A623;
                 color:white;
                 padding:8px 16px;
                 border-radius:20px;
                 text-decoration:none;
                 font-weight:800;
                 font-size:0.85rem;
                 white-space:nowrap;
                 font-family:inherit;
               ">Jetzt zahlen →</a>
          </div>`;
      }
      for (let j = 1; j <= kinder; j++) {
        schritteAnzahl++;
        schritte += `
          <div id="schritt-${schritteAnzahl}" style="
            display:flex;
            align-items:center;
            gap:12px;
            padding:14px 16px;
            border:2px solid #EEEEEE;
            border-radius:12px;
            margin-bottom:10px;
            background:white;
          ">
            <div style="
              width:32px; height:32px;
              background:#F5A623;
              color:white;
              border-radius:50%;
              display:flex;
              align-items:center;
              justify-content:center;
              font-weight:900;
              font-size:0.9rem;
              flex-shrink:0;
            ">${schritteAnzahl}</div>
            <span style="
              flex:1;
              font-weight:600;
              font-size:0.95rem;
              color:#333;
              font-family:inherit;
            ">Kind ${j} – E-Bike Tour: 7 €</span>
            <a href="${LINKS.ebike_kinder}"
               target="_blank" rel="noopener noreferrer"
               onclick="markiereSchritt(${schritteAnzahl})"
               style="
                 background:#27AE60;
                 color:white;
                 padding:8px 16px;
                 border-radius:20px;
                 text-decoration:none;
                 font-weight:800;
                 font-size:0.85rem;
                 white-space:nowrap;
                 font-family:inherit;
               ">Jetzt zahlen →</a>
          </div>`;
      }
    }

    const altesOverlay = getEl("zahlungsOverlay");
    if (altesOverlay) altesOverlay.remove();

    const overlay = document.createElement("div");
    overlay.id = "zahlungsOverlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "zahlungsOverlayTitle");
    overlay.setAttribute(
      "style",
      `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0,0,0,0.7) !important;
      z-index: 999999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 20px !important;
      box-sizing: border-box !important;
    `
    );

    overlay.innerHTML = `
      <div style="
        background: white !important;
        border-radius: 20px;
        padding: 36px;
        max-width: 520px;
        width: 100%;
        max-height: 85vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        position: relative;
        z-index: 1000000;
        font-family: 'Nunito', sans-serif;
      ">
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:8px;
        ">
          <h2 id="zahlungsOverlayTitle" style="
            font-size:1.4rem;
            font-weight:900;
            color:#1A1A1A;
            margin:0;
          ">Zahlung abschließen</h2>
          <button type="button" onclick="schliesseZahlung()" style="
            background:none;
            border:none;
            font-size:1.5rem;
            cursor:pointer;
            color:#999;
            padding:0;
            line-height:1;
          " aria-label="Schließen">✕</button>
        </div>

        <p style="
          color:#666;
          font-size:0.9rem;
          margin-bottom:8px;
        ">
          Bitte jeden Schritt in SumUp abschließen.
        </p>

        <div style="
          background:#FFF8EC;
          border:2px solid #F5A623;
          border-radius:10px;
          padding:10px 16px;
          margin-bottom:20px;
          display:flex;
          justify-content:space-between;
          align-items:center;
        ">
          <span style="font-weight:700;color:#333;">
            Gesamtbetrag:
          </span>
          <span style="
            font-size:1.3rem;
            font-weight:900;
            color:#F5A623;
          ">${gesamtBetrag} €</span>
        </div>

        <div>${schritte}</div>

        <p style="
          font-size:0.8rem;
          color:#999;
          text-align:center;
          margin-top:16px;
          line-height:1.5;
        ">
          Nach allen Zahlungen erhältst du eine 
          Bestätigung von SumUp.
        </p>

        <button type="button" onclick="schliesseZahlung()" style="
          width:100%;
          margin-top:12px;
          padding:12px;
          background:#F5F5F5;
          border:none;
          border-radius:10px;
          font-weight:700;
          cursor:pointer;
          color:#666;
          font-size:0.95rem;
          font-family:inherit;
        ">Schließen</button>
      </div>`;

    overlay.addEventListener("click", function (ev) {
      if (ev.target === overlay) window.schliesseZahlung();
    });

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
  }

  window.markiereSchritt = function (num) {
    window.setTimeout(function () {
      var schritt = getEl("schritt-" + num);
      if (!schritt) return;
      schritt.style.background = "#EAFAF1";
      schritt.style.border = "2px solid #27AE60";
      var btn = schritt.querySelector("a");
      if (btn) {
        btn.textContent = "✓ Bezahlt";
        btn.style.background = "#27AE60";
        btn.style.pointerEvents = "none";
      }
    }, 1500);
  };

  window.schliesseZahlung = function () {
    var overlay = getEl("zahlungsOverlay");
    if (overlay) overlay.remove();
    document.body.style.overflow = "";
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

    var erwInput = getEl("erwachsene");
    var kindInput = getEl("kinder");
    if (erwInput) erwInput.setAttribute("max", String(MAX_PERSONEN));
    if (kindInput) kindInput.setAttribute("max", String(MAX_PERSONEN));

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

    if (tourTyp === "ebike") {
      if (erw + kinder > MAX_PERSONEN) {
        window.alert("Maximal " + MAX_PERSONEN + " Personen pro Buchung (kleine Gruppen).");
        return;
      }
    } else if (tourTyp === "motorrad" && erw > MAX_PERSONEN) {
      window.alert("Maximal " + MAX_PERSONEN + " Personen pro Buchung (kleine Gruppen).");
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

    sendeBuchungsEmail(vorname, nachname, email, telefon, datum, tourTyp, tourName, erw, kinder);

    window.schliesseModal();
    zeigZahlungsSchritte(tourTyp, erw, kinder);
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
      if (e.key !== "Escape") return;
      if (getEl("zahlungsOverlay")) {
        window.schliesseZahlung();
        e.preventDefault();
        return;
      }
      if (modal.style.display === "flex") window.schliesseModal();
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
