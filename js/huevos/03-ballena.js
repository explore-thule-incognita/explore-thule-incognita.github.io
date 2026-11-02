/* Secreto 03 · La ballena de 1880 (Lugar)
   Tocar una de las ballenas del canal mientras está fuera (el lomo, el soplo o la cola).
   La escena: la ballena se queda arriba respirando y en una lámina se ve por dentro: el perfil de la ballena de
   Groenlandia (la cabeza enorme, la boca en arco, la barbilla blanca), la capa de grasa y, metida en ella, la punta de la
   «lanza bomba» que brilla. Debajo, los años corren de 1880 a 2007: 127 años con el arpón dentro. */
(function () {
  'use strict';
  var TH = window.TH, U = TH.util, E = TH.motor, A = TH.arte, PA = TH.paisaje, S = TH.esc;
  var TAU = Math.PI * 2, CICLO = 26000;
  var elegida = null;
  function sobreBallena(x, y) {
    var r = null;
    PA.BALLENAS.forEach(function (b) { var f = PA.ballena(b); if (!f) return; var p = S.pant(b.x + (f.fase === 'cola' ? 40 : 0), PA.CANAL.y + 34 - (f.fase === 'cola' ? 50 : 18), 1); if (Math.hypot(x - p[0], (y - p[1]) * 1.6) < 150 * S.k()) r = b; });
    return r;
  }
  // el perfil de una ballena de Groenlandia, de lado (mira a la izquierda), en un rectángulo w × h
  function perfil(c, x, y, w, h) {
    var X = function (u) { return x + u * w; }, Y = function (v) { return y + v * h; };
    var cuerpo = new Path2D();
    cuerpo.moveTo(X(0.02), Y(0.5)); cuerpo.bezierCurveTo(X(0.04), Y(0.18), X(0.2), Y(0.06), X(0.32), Y(0.14));
    cuerpo.bezierCurveTo(X(0.42), Y(0.2), X(0.6), Y(0.24), X(0.78), Y(0.36)); cuerpo.lineTo(X(0.86), Y(0.42));
    cuerpo.lineTo(X(0.97), Y(0.24)); cuerpo.lineTo(X(0.93), Y(0.46)); cuerpo.lineTo(X(0.99), Y(0.66)); cuerpo.lineTo(X(0.86), Y(0.52));
    cuerpo.bezierCurveTo(X(0.7), Y(0.66), X(0.48), Y(0.86), X(0.3), Y(0.86)); cuerpo.bezierCurveTo(X(0.12), Y(0.86), X(0.02), Y(0.74), X(0.02), Y(0.5)); cuerpo.closePath();
    c.fillStyle = '#1d2a40'; c.fill(cuerpo);
    c.save(); c.clip(cuerpo); c.fillStyle = '#f1f4f2'; c.beginPath(); c.ellipse(X(0.08), Y(0.78), w * 0.07, h * 0.08, 0.3, 0, TAU); c.fill(); c.restore();
    // la boca en arco, el ojo y la aleta
    c.strokeStyle = '#0c1424'; c.lineWidth = 2; c.beginPath(); c.moveTo(X(0.04), Y(0.48)); c.bezierCurveTo(X(0.12), Y(0.24), X(0.24), Y(0.3), X(0.3), Y(0.58)); c.stroke();
    c.fillStyle = '#0c1424'; c.beginPath(); c.arc(X(0.3), Y(0.62), 2.5, 0, TAU); c.fill();
    c.fillStyle = '#16223a'; c.beginPath(); c.moveTo(X(0.36), Y(0.74)); c.quadraticCurveTo(X(0.4), Y(0.98), X(0.48), Y(0.92)); c.quadraticCurveTo(X(0.44), Y(0.8), X(0.42), Y(0.72)); c.fill();
    return cuerpo;
  }

  TH.registrar({
    id: 'ballena', n: 3, nombre: 'La ballena de 1880', tipo: 'Lugar',
    pista: 'En el canal sale a respirar una ballena que lleva más de un siglo con algo dentro. Tócala.',
    lugar: function () { return 420 / S.K; }, radio: 0.3,
    detectar: function (api) {
      api.en('clic', function (d) { var b = sobreBallena(d.x, d.y); if (b) { elegida = b; api.disparar(); } });
    },
    escena: function () {
      var D = 12500 + E.lectura, b = elegida || PA.BALLENAS[0];
      return {
        duracion: D,
        tarjeta: { en: 6400, hasta: D - 400, titulo: 'La ballena de 1880', pie: 'Balaena mysticetus · Utqiaġvik, mayo de 2007',
          texto: 'En mayo de 2007, cazadores iñupiat de Utqiaġvik (entonces Barrow) encontraron en la grasa de una ballena de Groenlandia la punta de un arpón explosivo, una «lanza bomba» fabricada en New Bedford hacia 1880: la patente es de 1879. La ballena había vivido con ella más de un siglo; según su ojo y el arpón, tenía entre 115 y 130 años. La ballena de Groenlandia es el mamífero más longevo que se conoce: algunas pasan de los 200 años.' },
        inicio: function () { E.irA(b.x / S.K, 1100); },
        frente: function (c, t) {
          var W = E.W, H = E.H, a = U.meseta(t, 900, 1700, D - 2000, D - 600); if (a <= 0) return;
          var w0 = Math.min(W * 0.8, 760), h0 = w0 * 0.5, st = S.sitio(w0, h0 + 70), w = w0 * st.s, h = h0 * st.s, x = st.x, y = st.y;
          S.panel(c, x - 12, y - 12, w + 24, h + 70 * st.s + 24, a);
          c.save(); c.globalAlpha = a;
          var cuerpo = perfil(c, x + w * 0.04, y + h * 0.06, w * 0.92, h * 0.86);
          // la capa de grasa (más de medio metro) y la punta del arpón metida en ella, que brilla
          var gx = x + w * 0.04 + w * 0.92 * 0.46, gy = y + h * 0.06 + h * 0.86 * 0.27, ke = U.tramo(t, 1900, 2900);
          c.save(); c.clip(cuerpo); c.strokeStyle = 'rgba(255,214,170,.35)'; c.lineWidth = h * 0.06; c.beginPath(); c.moveTo(x + w * 0.1, y + h * 0.2); c.bezierCurveTo(x + w * 0.3, y + h * 0.1, x + w * 0.5, y + h * 0.24, x + w * 0.76, y + h * 0.38); c.stroke(); c.restore();
          if (ke > 0) {
            c.save(); c.globalCompositeOperation = 'lighter'; var g = c.createRadialGradient(gx, gy, 0, gx, gy, 46 * st.s); g.addColorStop(0, 'rgba(255,220,150,' + (0.8 * ke * (0.8 + 0.2 * Math.sin(t / 220))).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,170,80,0)'); c.fillStyle = g; c.beginPath(); c.arc(gx, gy, 46 * st.s, 0, TAU); c.fill(); c.restore();
            c.save(); c.translate(gx, gy); c.rotate(0.5); c.fillStyle = '#c9b48a'; c.fillRect(-12 * st.s, -2.5 * st.s, 24 * st.s, 5 * st.s); c.fillStyle = '#8a7a5a'; c.beginPath(); c.moveTo(12 * st.s, -4 * st.s); c.lineTo(18 * st.s, 0); c.lineTo(12 * st.s, 4 * st.s); c.fill(); c.restore();
            c.strokeStyle = 'rgba(230,238,244,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(gx + 10 * st.s, gy - 8 * st.s); c.lineTo(gx + 60 * st.s, gy - 42 * st.s); c.lineTo(gx + 170 * st.s, gy - 42 * st.s); c.stroke();
            S.monoDentro(c, 'LANZA BOMBA · NEW BEDFORD · ~1880', gx + 64 * st.s, gy - 54 * st.s, Math.max(8, 10 * st.s), S.ACENTO, x, x + w, 'left', ke);
          }
          // los años: de 1880 a 2007
          var ka = U.inOut(U.tramo(t, 2600, 5600)), ano = Math.round(U.lerp(1880, 2007, ka)), ly = y + h + 30 * st.s, lx0 = x + w * 0.08, lx1 = x + w * 0.92;
          c.strokeStyle = 'rgba(230,238,244,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(lx0, ly); c.lineTo(lx1, ly); c.stroke();
          c.strokeStyle = S.ACENTO; c.lineWidth = 2.4; c.beginPath(); c.moveTo(lx0, ly); c.lineTo(U.lerp(lx0, lx1, ka), ly); c.stroke();
          S.mono(c, '1880', lx0, ly - 14, Math.max(8, 10 * st.s), S.CREMA, 'left'); S.mono(c, '2007', lx1, ly - 14, Math.max(8, 10 * st.s), S.CREMA, 'right');
          S.mono(c, ano + ' · ' + (ano - 1880) + ' AÑOS CON EL ARPÓN DENTRO', (lx0 + lx1) / 2, ly + 18 * st.s, Math.max(8, 11 * st.s), ka >= 1 ? S.ACENTO : S.CREMA);
          c.restore();
        }
      };
    }
  });
  // mientras dura la escena, la ballena elegida se queda arriba respirando
  var orig = PA.ballena;
  PA.ballena = function (b, t) { var e = E.escena; if (e && e.h && e.h.id === 'ballena' && b === (elegida || PA.BALLENAS[0])) return { fase: 'sopla', u: ((e.t / 4000) % 1) }; return orig(b, t); };
})();
