/* Secreto 09 · La locura de Seward (Teclado)
   Escribir 1867.
   La escena: cae una orden de pago del Tesoro de los Estados Unidos por 7.200.000 dólares; al lado, la cuenta: unos 375
   millones de acres a dos centavos el acre; el sello de las dos fechas (el tratado, el 30 de marzo; el traspaso en Sitka,
   el 18 de octubre) y, al final, el sello rojo que le pusieron los que se burlaban: SEWARD'S FOLLY. */
(function () {
  'use strict';
  var TH = window.TH, U = TH.util, E = TH.motor, S = TH.esc;
  var TAU = Math.PI * 2, CLAVE = '1867';

  TH.registrar({
    id: 'alaska-1867', n: 9, nombre: 'La locura de Seward', tipo: 'Teclado',
    pista: 'Escribe el año en que Alaska cambió de dueño.',
    detectar: function (api) {
      var b = '';
      api.en('tecla', function (d) { if (!d.key || d.key.length !== 1) return; b = (b + d.key).slice(-CLAVE.length); if (b === CLAVE) { b = ''; api.disparar(); } });
    },
    escena: function () {
      var D = 12000 + E.lectura;
      return {
        duracion: D,
        tarjeta: { en: 6600, hasta: D - 400, titulo: 'La locura de Seward', pie: 'Tratado de compra de Alaska · 30 de marzo de 1867',
          texto: 'El 30 de marzo de 1867, tras negociar toda la noche, el secretario de Estado William Seward firmó la compra de Alaska al Imperio ruso por 7,2 millones de dólares: unos dos centavos por acre. Muchos se burlaron («la locura de Seward», «la nevera de Seward») hasta que llegó el oro del Klondike, en 1896. El traspaso se hizo en Sitka el 18 de octubre de 1867. A los pueblos que ya vivían allí, como los iñupiat, nadie les preguntó.' },
        frente: function (c, t) {
          var W = E.W, H = E.H, a = U.meseta(t, 300, 900, D - 2000, D - 600); if (a <= 0) return;
          var w0 = 620, h0 = 300, st = S.sitio(w0, h0), w = w0 * st.s, h = h0 * st.s, kc = U.sale(U.tramo(t, 300, 1300));
          var y = U.lerp(-h - 40, st.y, kc), giro = (1 - kc) * -0.12;
          c.save(); c.translate(st.x + w / 2, y + h / 2); c.rotate(giro); c.translate(-(st.x + w / 2), -(y + h / 2));
          S.vineta(c, st.x, y, w, h, a, function (x, yy, iw, ih) {
            c.fillStyle = '#e9efe6'; c.fillRect(x, yy, iw, ih);
            // la guilloche del borde y el texto de la orden de pago
            c.strokeStyle = 'rgba(40,90,70,.25)'; c.lineWidth = 0.8; for (var i = 0; i < 6; i++) { c.beginPath(); for (var u = 0; u <= 1.001; u += 0.01) { var px = x + u * iw, py = yy + 14 + Math.sin(u * 60 + i) * 4 + i * 1.2; c[u ? 'lineTo' : 'moveTo'](px, py); } c.stroke(); }
            var tam = Math.max(7, 10 * st.s);
            S.mono(c, 'TREASURY OF THE UNITED STATES', x + iw / 2, yy + ih * 0.2, tam, '#1d3a2e');
            S.serif(c, 'Pay to the Russian minister, Edouard de Stoeckl', x + iw / 2, yy + ih * 0.36, Math.round(17 * st.s), '#1d3a2e', 'center', true);
            S.serif(c, '$7.200.000', x + iw * 0.5, yy + ih * 0.58, Math.round(46 * st.s), '#1d3a2e');
            S.mono(c, 'SEVEN MILLION TWO HUNDRED THOUSAND DOLLARS · IN COIN', x + iw / 2, yy + ih * 0.76, Math.max(6, 8 * st.s), '#3a5a4a');
            // las dos fechas, como sellos
            var ks = U.tramo(t, 2400, 2800); if (ks > 0) { c.save(); c.globalAlpha *= ks; c.strokeStyle = '#2a4a8a'; c.lineWidth = 2; c.beginPath(); c.arc(x + iw * 0.14, yy + ih * 0.62, 30 * st.s, 0, TAU); c.stroke(); S.mono(c, '30·III·1867', x + iw * 0.14, yy + ih * 0.6, Math.max(6, 8 * st.s), '#2a4a8a'); S.mono(c, 'TRATADO', x + iw * 0.14, yy + ih * 0.66, Math.max(6, 7 * st.s), '#2a4a8a'); c.restore(); }
            var ks2 = U.tramo(t, 3000, 3400); if (ks2 > 0) { c.save(); c.globalAlpha *= ks2; c.strokeStyle = '#2a4a8a'; c.lineWidth = 2; c.beginPath(); c.arc(x + iw * 0.86, yy + ih * 0.62, 30 * st.s, 0, TAU); c.stroke(); S.mono(c, '18·X·1867', x + iw * 0.86, yy + ih * 0.6, Math.max(6, 8 * st.s), '#2a4a8a'); S.mono(c, 'SITKA', x + iw * 0.86, yy + ih * 0.66, Math.max(6, 7 * st.s), '#2a4a8a'); c.restore(); }
            // el sello rojo de los que se burlaban
            var kf = U.tramo(t, 4800, 5100);
            if (kf > 0) { var sc = 1 + (1 - U.sale(kf)) * 1.4; c.save(); c.globalAlpha *= kf; c.translate(x + iw * 0.62, yy + ih * 0.42); c.rotate(-0.18); c.scale(sc, sc); c.strokeStyle = 'rgba(184,38,28,.85)'; c.lineWidth = 3; c.strokeRect(-110 * st.s, -24 * st.s, 220 * st.s, 48 * st.s); S.mono(c, "SEWARD'S FOLLY", 0, 1, Math.round(20 * st.s), 'rgba(184,38,28,.9)'); c.restore(); }
          });
          c.restore();
          // la cuenta: acres a dos centavos
          var kk = U.inOut(U.tramo(t, 1600, 3800)), yy2 = st.y + h + 40 * st.s;
          S.rotulo(c, S.num(kk * 375000000) + ' ACRES × 2 ¢', W / 2, Math.min(yy2, H * 0.62), U.meseta(t, 1600, 2000, D - 2000, D - 600), kk >= 1 ? S.ACENTO : S.CREMA, 12);
        }
      };
    }
  });
})();
