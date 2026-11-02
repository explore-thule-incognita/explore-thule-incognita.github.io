/* Secreto 05 · El viaje de los Thule (Gesto)
   Agarrar uno de los umiaks del pueblo y arrastrarlo hacia el este (a la derecha), un buen trecho.
   Mientras se arrastra, un umiak fantasma sigue al dedo con su estela y el rótulo «→ GROENLANDIA».
   La escena: un mapa del Ártico de oeste a este (Alaska, el Ártico canadiense, Groenlandia); de Alaska salen umiaks y
   trineos que avanzan por la costa encendiendo los siglos (hacia el 1000, siglo XII, siglo XIII) hasta Groenlandia. */
(function () {
  'use strict';
  var TH = window.TH, U = TH.util, E = TH.motor, A = TH.arte, PA = TH.paisaje, S = TH.esc;
  var TAU = Math.PI * 2, UMIAKS = [[4410, 760, 1.22], [5760, 752, 1.05]];
  // el Ártico, de oeste a este, en coordenadas 0…1: la costa norte de América (abajo) y las islas y Groenlandia (arriba)
  var COSTA = [[0, 0.62], [0.06, 0.55], [0.14, 0.58], [0.22, 0.66], [0.3, 0.7], [0.4, 0.66], [0.5, 0.72], [0.6, 0.7], [0.68, 0.76], [0.74, 0.86], [0.74, 1], [0, 1]];
  var ISLAS = [[[0.36, 0.5], [0.44, 0.42], [0.52, 0.46], [0.5, 0.56], [0.4, 0.58]], [[0.5, 0.34], [0.58, 0.28], [0.66, 0.34], [0.62, 0.46], [0.54, 0.44]], [[0.6, 0.56], [0.66, 0.52], [0.7, 0.6], [0.64, 0.64]]];
  var GROENLANDIA = [[0.76, 0.18], [0.84, 0.08], [0.96, 0.08], [1, 0.2], [0.98, 0.5], [0.9, 0.72], [0.84, 0.66], [0.8, 0.44], [0.74, 0.32]];
  var RUTA = [[0.05, 0.58], [0.16, 0.6], [0.28, 0.64], [0.36, 0.6], [0.46, 0.6], [0.56, 0.5], [0.66, 0.42], [0.74, 0.3], [0.8, 0.22], [0.88, 0.14]];
  var PARADAS = [[0.05, 'ALASKA · HACIA EL 1000'], [0.46, 'ÁRTICO CANADIENSE · SIGLO XII'], [0.88, 'GROENLANDIA · SIGLO XIII']];
  function punto(k) { var n = RUTA.length - 1, i = Math.min(n - 1, Math.floor(k * n)), u = k * n - i; return [U.lerp(RUTA[i][0], RUTA[i + 1][0], u), U.lerp(RUTA[i][1], RUTA[i + 1][1], u)]; }
  function sobreUmiak(x, y) { var r = null; UMIAKS.forEach(function (q) { if (S.dentro(x, y, q[0] - 120 * q[2], q[0] + 120 * q[2], q[1] - 110 * q[2], q[1] - 60 * q[2], 1)) r = q; }); return r; }

  TH.registrar({
    id: 'viaje', n: 5, nombre: 'El viaje de los Thule', tipo: 'Gesto',
    pista: 'De Alaska a Groenlandia: coge un umiak y llévalo hacia donde sale el sol.',
    lugar: function () { return 4410 / S.K; }, radio: 0.3,
    detectar: function (api) {
      var agarre = null, lienzo = document.getElementById('lienzo');
      api.en('mover', function (d) { if (!agarre) lienzo.style.cursor = !api.hallado() && sobreUmiak(d.x, d.y) ? 'grab' : ''; });
      api.en('bajar', function (d) { var q = sobreUmiak(d.x, d.y); if (!q) return; d.tomar(); agarre = { x0: d.x, y0: d.y, x: d.x, y: d.y, q: q }; lienzo.style.cursor = 'grabbing'; });
      api.en('arrastrar', function (d) {
        if (!agarre) return; agarre.x = d.x; agarre.y = d.y;
        if (d.x - agarre.x0 > Math.max(260, E.W * 0.32)) { agarre = null; lienzo.style.cursor = ''; api.disparar(); }
      });
      api.en('soltar', function () { agarre = null; lienzo.style.cursor = ''; });
      // la pista en vivo: el umiak fantasma que sigue al dedo, su estela y hacia dónde ir
      api.capa(function (c) {
        if (!agarre) return;
        var dx = agarre.x - agarre.x0, falta = Math.max(260, E.W * 0.32), k = U.clamp(dx / falta, 0, 1), s = S.k() * agarre.q[2];
        c.save(); c.strokeStyle = 'rgba(111,242,176,.6)'; c.lineWidth = 2; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(agarre.x0, agarre.y0); c.lineTo(agarre.x0 + falta, agarre.y0); c.stroke(); c.setLineDash([]);
        c.globalAlpha = 0.85; c.translate(agarre.x, agarre.y); c.scale(s * 0.6, s * 0.6); c.fillStyle = '#c5965c'; c.beginPath(); c.moveTo(-112, -10); c.quadraticCurveTo(-96, 14, -74, 16); c.lineTo(72, 16); c.quadraticCurveTo(96, 14, 108, -12); c.lineTo(92, 0); c.lineTo(-92, 0); c.closePath(); c.fill(); c.restore();
        S.rotulo(c, k >= 1 ? 'GROENLANDIA' : '→ GROENLANDIA', agarre.x0 + falta, agarre.y0 - 40, 0.9, S.ACENTO);
      });
    },
    escena: function () {
      var D = 13000 + E.lectura;
      return {
        duracion: D,
        tarjeta: { en: 7400, hasta: D - 400, titulo: 'El viaje de los Thule', pie: 'Cultura Thule · de Alaska a Groenlandia, hacia los años 1000–1300',
          texto: 'Los Thule, antepasados de los inuit de hoy, nacieron en la costa de Alaska y del estrecho de Bering. Cazaban ballenas desde umiaks, viajaban en trineos de perros y vivían en casas de turba como estas. Hacia el año 1000 empezaron a moverse hacia el este, muy deprisa: en uno o dos siglos cruzaron el Ártico canadiense y llegaron a Groenlandia, donde se encontraron con los nórdicos. Las fechas exactas aún se discuten.' },
        frente: function (c, t) {
          var W = E.W, H = E.H, a = U.meseta(t, 300, 1100, D - 2000, D - 600); if (a <= 0) return;
          var w0 = 820, h0 = 380, st = S.sitio(w0, h0), w = w0 * st.s, h = h0 * st.s, x = st.x, y = st.y;
          S.panel(c, x, y, w, h, a);
          c.save(); c.globalAlpha = a; c.beginPath(); c.rect(x + 6, y + 6, w - 12, h - 12); c.clip();
          var X = function (u) { return x + 16 + u * (w - 32); }, Y = function (v) { return y + 16 + v * (h - 32); };
          var tierra = function (pts) { c.beginPath(); pts.forEach(function (q, i) { c[i ? 'lineTo' : 'moveTo'](X(q[0]), Y(q[1])); }); c.closePath(); c.fillStyle = '#2b4774'; c.fill(); c.strokeStyle = '#9cc2ea'; c.lineWidth = 1.2; c.stroke(); };
          tierra(COSTA); ISLAS.forEach(tierra); tierra(GROENLANDIA);
          c.fillStyle = 'rgba(156,194,234,.25)'; c.fillRect(X(0.8), Y(0.12), (w - 32) * 0.14, (h - 32) * 0.4);
          var k = U.inOut(U.tramo(t, 1300, 7000)), n = 50, i;
          c.strokeStyle = S.ACENTO; c.lineWidth = 2.2; c.setLineDash([7, 5]); c.beginPath(); for (i = 0; i <= n; i++) { var p = punto(k * i / n); c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1])); } c.stroke(); c.setLineDash([]);
          // los umiaks y los trineos que van por delante
          [0, -0.04, -0.08].forEach(function (d, j) { var kk = k + d; if (kk <= 0) return; var p2 = punto(Math.min(1, kk)), px = X(p2[0]), py = Y(p2[1]); c.save(); c.translate(px, py); c.fillStyle = j % 2 ? '#dcc8a2' : '#c5965c'; c.beginPath(); c.moveTo(-9, -2); c.quadraticCurveTo(0, 4, 10, -3); c.lineTo(-9, -2); c.fill(); c.restore(); });
          var tam = Math.max(8, 10 * st.s);
          PARADAS.forEach(function (q, j) { var p3 = punto(q[0]), on = k >= q[0] - 0.01; c.fillStyle = on ? S.ACENTO : 'rgba(230,238,244,.4)'; c.beginPath(); c.arc(X(p3[0]), Y(p3[1]), on ? 5 : 3, 0, TAU); c.fill(); if (on) S.monoDentro(c, q[1], X(p3[0]) + (j === 2 ? -10 : 10), Y(p3[1]) + (j === 1 ? 22 : -16), tam, S.CREMA, x + 12, x + w - 12, j === 2 ? 'right' : 'left'); });
          S.mono(c, 'UNOS 5.000 KM DE COSTA · ANTEPASADOS DE LOS INUIT', x + w / 2, y + h - 22, tam, k >= 1 ? S.ACENTO : 'rgba(230,238,244,.7)');
          c.restore();
        }
      };
    }
  });
})();
