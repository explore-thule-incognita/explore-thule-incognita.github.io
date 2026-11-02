/* Secreto 04 · Última Thule (Teclado)
   Escribir THULE.
   La escena: una carta antigua en pergamino del Atlántico norte (Iberia, la Galia, Britania, Escandinavia, Islandia). Un
   barco griego sale de Masalia, rodea Iberia, sube por Britania y sigue «seis días al norte» hasta Thule, junto al mar
   helado; las letras ULTIMA THULE se escriben en la carta. */
(function () {
  'use strict';
  var TH = window.TH, U = TH.util, E = TH.motor, S = TH.esc;
  var TAU = Math.PI * 2, PALABRA = 'THULE';
  // la carta, en coordenadas 0…1 (x hacia el este, y hacia el sur): tierras simplificadas
  var TIERRAS = [
    [[0.36, 0.86], [0.42, 0.78], [0.52, 0.76], [0.6, 0.8], [0.62, 0.92], [0.54, 0.98], [0.42, 0.98]],   // Iberia
    [[0.6, 0.8], [0.58, 0.68], [0.64, 0.6], [0.74, 0.56], [0.86, 0.6], [0.92, 0.74], [0.8, 0.84], [0.66, 0.84]],   // la Galia
    [[0.5, 0.56], [0.48, 0.46], [0.5, 0.36], [0.47, 0.28], [0.52, 0.24], [0.56, 0.34], [0.58, 0.46], [0.6, 0.54], [0.54, 0.58]],   // Britania
    [[0.42, 0.46], [0.4, 0.4], [0.44, 0.38], [0.46, 0.44]],   // Irlanda
    [[0.74, 0.5], [0.72, 0.36], [0.76, 0.2], [0.84, 0.08], [0.94, 0.06], [0.98, 0.2], [0.9, 0.34], [0.84, 0.48], [0.8, 0.54]],   // Escandinavia
    [[0.3, 0.16], [0.36, 0.12], [0.44, 0.13], [0.46, 0.18], [0.4, 0.22], [0.32, 0.21]]   // Islandia (¿Thule?)
  ];
  var RUTA = [[0.86, 0.9], [0.62, 0.99], [0.4, 0.99], [0.34, 0.86], [0.44, 0.68], [0.46, 0.5], [0.46, 0.34], [0.42, 0.26], [0.39, 0.17]];
  function punto(k) { var n = RUTA.length - 1, i = Math.min(n - 1, Math.floor(k * n)), u = k * n - i; return [U.lerp(RUTA[i][0], RUTA[i + 1][0], u), U.lerp(RUTA[i][1], RUTA[i + 1][1], u), Math.atan2(RUTA[i + 1][1] - RUTA[i][1], RUTA[i + 1][0] - RUTA[i][0])]; }

  TH.registrar({
    id: 'thule', n: 4, nombre: 'Última Thule', tipo: 'Teclado',
    pista: 'Escribe el nombre que un griego dio al fin del mundo.',
    detectar: function (api) {
      var b = '';
      api.en('tecla', function (d) { if (!d.key || d.key.length !== 1) return; b = (b + d.key.toUpperCase()).slice(-PALABRA.length); if (b === PALABRA) { b = ''; api.disparar(); } });
    },
    escena: function () {
      var D = 12500 + E.lectura;
      return {
        duracion: D,
        tarjeta: { en: 7000, hasta: D - 400, titulo: 'Última Thule', pie: 'Piteas de Masalia · hacia el 325 a. C.',
          texto: 'Hacia el 325 a. C., Piteas, un griego de Masalia (la actual Marsella), navegó hasta Britania y contó que seis días más al norte había una tierra, Thule, cerca de un «mar helado». Su libro se perdió: lo conocemos por Estrabón o Plinio, que no siempre le creían. Hoy se piensa que pudo ser Islandia o la costa de Noruega, y se sigue discutiendo. Los romanos llamaron «Ultima Thule» al último lugar del mundo, y siglos después el nombre pasó al norte de Groenlandia y a la cultura Thule.' },
        frente: function (c, t) {
          var W = E.W, H = E.H, a = U.meseta(t, 300, 1100, D - 2000, D - 600); if (a <= 0) return;
          var w0 = 600, h0 = 470, st = S.sitio(w0, h0), w = w0 * st.s, h = h0 * st.s;
          S.vineta(c, st.x, st.y, w, h, a, function (x, y, iw, ih) {
            var X = function (u) { return x + u * iw; }, Y = function (v) { return y + v * ih; };
            c.fillStyle = '#e8dcc0'; c.fillRect(x, y, iw, ih);
            // la retícula y el mar helado arriba
            c.strokeStyle = 'rgba(90,60,30,.18)'; c.lineWidth = 1; c.beginPath(); for (var i = 1; i < 6; i++) { c.moveTo(X(i / 6), y); c.lineTo(X(i / 6), y + ih); c.moveTo(x, Y(i / 6)); c.lineTo(x + iw, Y(i / 6)); } c.stroke();
            var gh = c.createLinearGradient(0, y, 0, Y(0.14)); gh.addColorStop(0, 'rgba(160,190,210,.8)'); gh.addColorStop(1, 'rgba(160,190,210,0)'); c.fillStyle = gh; c.fillRect(x, y, iw, ih * 0.14);
            S.mono(c, 'MAR HELADO', X(0.62), Y(0.05), Math.max(7, 9 * st.s), '#3a4a5a');
            TIERRAS.forEach(function (tz, j) { c.beginPath(); tz.forEach(function (q, i) { c[i ? 'lineTo' : 'moveTo'](X(q[0]), Y(q[1])); }); c.closePath(); c.fillStyle = j === 5 ? '#d8c296' : '#cdb789'; c.fill(); c.strokeStyle = '#6a4a26'; c.lineWidth = 1.4; c.stroke(); });
            // la ruta de Piteas, que se dibuja, y el barco
            var k = U.inOut(U.tramo(t, 1300, 6200)), n = 40;
            c.strokeStyle = '#8a2a18'; c.lineWidth = 1.6; c.setLineDash([5, 4]); c.beginPath(); for (i = 0; i <= n; i++) { var p = punto(k * i / n); c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1])); } c.stroke(); c.setLineDash([]);
            var pb = punto(k), bx = X(pb[0]), by = Y(pb[1]), s2 = 9 * st.s;
            c.save(); c.translate(bx, by); c.fillStyle = '#5a3418'; c.beginPath(); c.moveTo(-s2 * 1.4, 0); c.quadraticCurveTo(0, s2 * 0.8, s2 * 1.5, -s2 * 0.2); c.lineTo(-s2 * 1.4, 0); c.fill();
            c.strokeStyle = '#5a3418'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -s2 * 1.8); c.stroke(); c.fillStyle = '#f3e8cf'; c.beginPath(); c.moveTo(-s2 * 0.9, -s2 * 1.6); c.lineTo(s2 * 0.9, -s2 * 1.6); c.lineTo(s2 * 0.8, -s2 * 0.5); c.lineTo(-s2 * 0.8, -s2 * 0.5); c.closePath(); c.fill(); c.stroke(); c.restore();
            var tam = Math.max(7, 9 * st.s);
            S.mono(c, 'MASSALIA', X(0.86), Y(0.94), tam, '#4a3018'); S.mono(c, 'PRETTANIKÉ', X(0.62), Y(0.4), tam, '#4a3018');
            if (k > 0.6) S.mono(c, '6 DÍAS AL NORTE', X(0.58), Y(0.27), tam, '#8a2a18', 'left', U.tramo(k, 0.6, 0.75));
            var kt = U.tramo(t, 5600, 7000);
            if (kt > 0) { c.save(); c.globalAlpha *= kt; S.serif(c, 'Ultima Thule', X(0.38), Y(0.3), Math.round(28 * st.s), '#7a2418', 'center', true); c.restore(); S.destello(c, X(0.38), Y(0.17), 4 * st.s, kt * (0.6 + 0.4 * Math.sin(t / 240))); }
          });
        }
      };
    }
  });
})();
