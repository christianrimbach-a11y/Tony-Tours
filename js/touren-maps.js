/**
 * TonyTours - Tourenkarten mit vorbereiteter Routenanimation.
 * Hinweis: Die Koordinaten sind Vorschau-Routen (keine GPX-genauen Navigationsdaten).
 * Struktur ist so vorbereitet, dass spaeter echte Streckendaten pro Tour ersetzt werden koennen.
 */
(function () {
  "use strict";

  if (!window.L) return;

  var ROUTES = {
    "tour-leuchtberg": {
      center: [51.189, 10.051],
      zoom: 11,
      routeCoordinates: [
        [51.1865, 10.0525], // Eschwege (Start)
        [51.1992, 10.077],
        [51.1718, 10.1674], // Wanfried
        [51.1688, 10.1432],
        [51.1865, 10.0525] // Rueckweg
      ],
      startLabel: "Start: Werdchen, Eschwege",
      endLabel: "Ziel: Werdchen, Eschwege"
    },
    "tour-werratal": {
      center: [51.178, 10.115],
      zoom: 11,
      routeCoordinates: [
        [51.1865, 10.0525],
        [51.179, 10.084],
        [51.1718, 10.1674],
        [51.1738, 10.109],
        [51.1865, 10.0525]
      ],
      startLabel: "Start: Eschwege",
      endLabel: "Ziel: Eschwege"
    },
    "tour-hoher-meissner": {
      center: [51.243, 9.873],
      zoom: 11,
      routeCoordinates: [
        [51.1865, 10.0525],
        [51.214, 9.992],
        [51.2448, 9.8893], // Hoher Meissner
        [51.225, 9.944],
        [51.1865, 10.0525]
      ],
      startLabel: "Start: Eschwege",
      endLabel: "Ziel: Eschwege"
    },
    "tour-suedwest": {
      center: [51.08, 9.9],
      zoom: 10,
      routeCoordinates: [
        [51.1865, 10.0525],
        [51.121, 9.931], // Raum Schwalbental
        [51.008, 9.734], // Rotenburg / Highwalk
        [51.103, 9.86],
        [51.1865, 10.0525]
      ],
      startLabel: "Start: Werdchen, Eschwege",
      endLabel: "Ziel: Werdchen, Eschwege"
    },
    "tour-suedost": {
      center: [51.02, 10.23],
      zoom: 10,
      routeCoordinates: [
        [51.1865, 10.0525],
        [51.174, 10.161], // Burg Normannstein Region
        [50.996, 10.299], // Eisenach
        [51.099, 10.194], // Probstei Zella Region
        [51.1865, 10.0525]
      ],
      startLabel: "Start: Werdchen, Eschwege",
      endLabel: "Ziel: Werdchen, Eschwege"
    },
    "tour-nordwest": {
      center: [51.339, 9.685],
      zoom: 10,
      routeCoordinates: [
        [51.1865, 10.0525],
        [51.456, 9.61], // Weser/Hemeln
        [51.403, 9.73],
        [51.2448, 9.8893], // Hoher Meissner
        [51.1865, 10.0525]
      ],
      startLabel: "Start: Werdchen, Eschwege",
      endLabel: "Ziel: Werdchen, Eschwege"
    }
  };

  function makeMap(el, routeCfg) {
    var map = L.map(el, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView(routeCfg.center, routeCfg.zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var coords = routeCfg.routeCoordinates;
    if (!coords || coords.length < 2) return;

    var baseLine = L.polyline(coords, {
      color: "#DADADA",
      weight: 5,
      opacity: 0.85
    }).addTo(map);

    var animatedLine = L.polyline([], {
      color: "#F5A623",
      weight: 5,
      opacity: 0.95
    }).addTo(map);

    var start = coords[0];
    var end = coords[coords.length - 1];

    L.circleMarker(start, {
      radius: 6,
      color: "#27AE60",
      fillColor: "#27AE60",
      fillOpacity: 0.95,
      weight: 2
    })
      .bindTooltip(routeCfg.startLabel, { direction: "top" })
      .addTo(map);

    L.circleMarker(end, {
      radius: 6,
      color: "#D4881A",
      fillColor: "#F5A623",
      fillOpacity: 0.95,
      weight: 2
    })
      .bindTooltip(routeCfg.endLabel, { direction: "top" })
      .addTo(map);

    var rider = L.circleMarker(start, {
      radius: 4.5,
      color: "#1A1A1A",
      fillColor: "#1A1A1A",
      fillOpacity: 1,
      weight: 1
    }).addTo(map);

    map.fitBounds(baseLine.getBounds(), { padding: [18, 18] });

    var step = 0;
    var total = coords.length;
    var timer = window.setInterval(function () {
      step += 1;
      if (step > total) {
        window.clearInterval(timer);
        return;
      }
      var slice = coords.slice(0, step);
      animatedLine.setLatLngs(slice);
      var current = slice[slice.length - 1];
      if (current) rider.setLatLng(current);
    }, 380);
  }

  document.querySelectorAll("[data-tour-map]").forEach(function (mapEl) {
    var key = mapEl.getAttribute("data-tour-map");
    var routeCfg = ROUTES[key];
    if (!routeCfg) return;
    makeMap(mapEl, routeCfg);
  });
})();
