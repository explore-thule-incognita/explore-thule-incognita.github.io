/* Secreto 06 · La noche polar (Espera)
   Quedarse 15 s sin tocar nada a mediodía (en el «mediodía polar», cuando el horizonte del sur se pone rosa).
   La escena: el resplandor del sur crece como si el sol fuera a salir… y no sale. Un diagrama: la Tierra con el eje
   inclinado y el Sol a un lado; Utqiaġvik da vueltas con la Tierra y nunca llega a la luz. Y el calendario: del 18 de
   noviembre al 22 de enero, los días sin sol se van contando. */
(function () {
  'use strict';
  var TH = window.TH, U = TH.util, E = TH.motor, PA = TH.paisaje, S = TH.esc;
  var TAU = Math.PI * 2, ESPERA = 15000, INCL = 23.4 * Math.PI / 180;

  TH.registrar({
    id: 'noche-polar', n: 6, nombre: 'La noche polar', tipo: 'Espera',
    pista: 'A mediodía, espera quieto a que salga el sol. No va a salir.',
    detectar: function (api) {
      api.en('cuadro', function (d) { if (!api.hallado() && PA.franja() === 'mediodía polar' && d.inactivo > ESPERA && !document.documentElement.classList.contains('cuaderno-abierto')) api.disparar(); });
    },
    escena: function () {
      var D = 13000 + E.lectura;
      return {
        duracion: D, detenerDia: true,
        tarjeta: { en: 7000, hasta: D - 400, titulo: 'La noche polar', pie: 'Utqiaġvik · 71° 17′ N · unos 65 días sin sol',
          texto: 'En invierno, el eje inclinado de la Tierra deja el Ártico de espaldas al Sol. En Utqiaġvik, la ciudad más al norte de Estados Unidos, el sol se pone a mediados de noviembre y no vuelve a salir hasta finales de enero: unos 65 días (64 o 65, según el año). No es oscuridad total: a mediodía quedan unas horas de penumbra azul y el horizonte del sur se enciende. En verano pasa al revés: casi tres meses sin que el sol se ponga.' },
        inicio: function () { PA.hora = Math.max(11.2, Math.min(12.4, PA.hora)); },
        cielo: function (c, t) {
          // el resplandor del sur crece como si el sol fuera a salir, y vuelve a bajar
          var W = E.W, H = E.H, hz = H * PA.HOR, k = U.meseta(t, 400, 3800, 5200, 8200) * 0.9; if (k <= 0) return;
          var g = c.createRadialGradient(W * 0.24, hz + H * 0.02, 4, W * 0.24, hz + H * 0.02, W * 0.42); g.addColorStop(0, 'rgba(255,214,150,' + (0.8 * k).toFixed(3) + ')'); g.addColorStop(0.3, 'rgba(255,170,140,' + (0.32 * k).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,150,150,0)');
          c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(0, 0, W, hz); c.restore();
        },
        frente: function (c, t) {
          var W = E.W, H = E.H, a = U.meseta(t, 2200, 3200, D - 2000, D - 600);
          var hz = H * PA.HOR, ar = U.meseta(t, 3600, 4400, 6200, 7200);
          S.rotulo(c, 'EL SOL ESTÁ AHÍ DEBAJO · −4°', W * 0.24, hz - H * 0.06, ar, '#ffd6a0');
          if (a <= 0) return;
          var w0 = 640, h0 = 300, st = S.sitio(w0, h0), w = w0 * st.s, h = h0 * st.s, x = st.x, y = st.y;
          S.panel(c, x, y, w, h, a);
          c.save(); c.globalAlpha = a;
          // el Sol a la izquierda, con sus rayos
          var sx = x + w * 0.1, sy = y + h * 0.46, R = h * 0.26, ex = x + w * 0.36, ey = sy;
          var gs = c.createRadialGradient(sx, sy, 0, sx, sy, h * 0.12); gs.addColorStop(0, '#fff3c8'); gs.addColorStop(1, 'rgba(255,200,110,0)'); c.fillStyle = gs; c.beginPath(); c.arc(sx, sy, h * 0.12, 0, TAU); c.fill();
          c.strokeStyle = 'rgba(255,220,150,.35)'; c.lineWidth = 1; c.beginPath(); for (var i = -3; i <= 3; i++) { c.moveTo(sx + h * 0.14, sy + i * R * 0.3); c.lineTo(ex - R - 6, sy + i * R * 0.3); } c.stroke();
          // la Tierra, con la mitad de día y la de noche, y el eje inclinado (el norte, de espaldas al Sol)
          c.fillStyle = '#16294a'; c.beginPath(); c.arc(ex, ey, R, 0, TAU); c.fill();
          c.fillStyle = '#4f86c6'; c.beginPath(); c.arc(ex, ey, R, Math.PI / 2, Math.PI * 1.5); c.fill();
          c.save(); c.translate(ex, ey); c.rotate(INCL);
          c.strokeStyle = 'rgba(230,238,244,.7)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, -R * 1.3); c.lineTo(0, R * 1.3); c.stroke();
          var yc = -R * Math.sin(66.6 * Math.PI / 180), rc = R * Math.cos(66.6 * Math.PI / 180);
          c.setLineDash([3, 3]); c.strokeStyle = 'rgba(111,242,176,.7)'; c.beginPath(); c.moveTo(-rc, yc); c.lineTo(rc, yc); c.stroke(); c.setLineDash([]);
          // Utqiaġvik (71° N) da vueltas con la Tierra: siempre del lado de la noche
          var yu = -R * Math.sin(71.3 * Math.PI / 180), ru = R * Math.cos(71.3 * Math.PI / 180), ang = t / 900, ux = Math.sin(ang) * ru;
          c.fillStyle = S.ACENTO; c.beginPath(); c.arc(ux, yu, 3.5, 0, TAU); c.fill();
          c.restore();
          var tam = Math.max(8, 10 * st.s);
          S.mono(c, 'SOL', sx, sy + h * 0.2, tam, '#ffd6a0'); S.mono(c, 'CÍRCULO POLAR', ex, y + h * 0.1, tam, S.ACENTO); S.mono(c, 'UTQIAĠVIK · 71° N', ex, y + h * 0.9, tam, S.CREMA);
          // el calendario de la noche polar
          var cx0 = x + w * 0.58, cx1 = x + w * 0.94, cy = y + h * 0.5, k = U.inOut(U.tramo(t, 3600, 7800)), dias = Math.round(k * 65);
          c.strokeStyle = 'rgba(230,238,244,.3)'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx0, cy); c.lineTo(cx1, cy); c.stroke();
          for (i = 0; i <= 65; i++) { var xi = U.lerp(cx0, cx1, i / 65), on = i <= dias; c.strokeStyle = on ? '#16294a' : 'rgba(230,238,244,.25)'; if (on) c.strokeStyle = 'rgba(120,150,220,.9)'; c.beginPath(); c.moveTo(xi, cy - (i % 7 ? 6 : 12)); c.lineTo(xi, cy + (i % 7 ? 6 : 12)); c.stroke(); }
          S.mono(c, '18 NOV', cx0, cy - 26, tam, S.CREMA, 'left'); S.mono(c, '22 ENE', cx1, cy - 26, tam, S.CREMA, 'right');
          S.serif(c, dias + ' días sin sol', (cx0 + cx1) / 2, cy + 40 * st.s, Math.round(26 * st.s), k >= 1 ? S.ACENTO : S.CREMA, 'center', true);
          c.restore();
        }
      };
    }
  });
})();
