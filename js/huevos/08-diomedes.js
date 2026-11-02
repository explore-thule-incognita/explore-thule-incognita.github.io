/* Secreto 08 · Ayer y mañana (Lugar)
   Tocar una de las dos islas del horizonte en el estrecho de Bering (las Diómedes).
   La escena: baja del cielo la línea del cambio de fecha y se queda entre las dos islas; sobre cada una, un reloj: la
   Diómedes Grande (Rusia) va 21 horas por delante de la Pequeña (Alaska). Están a 3,8 km. */
(function () {
  'use strict';
  var TH = window.TH, U = TH.util, E = TH.motor, PA = TH.paisaje, S = TH.esc, A = TH.arte;
  var TAU = Math.PI * 2, P = 0.35, HOR = A.HOR, GRANDE = [250, 500], PEQUENA = [556, 684];
  function sobreIsla(x, y) { return S.dentro(x, y, GRANDE[0], GRANDE[1], HOR - 70, HOR + 6, P) || S.dentro(x, y, PEQUENA[0], PEQUENA[1], HOR - 50, HOR + 6, P); }
  function reloj(c, x, y, r, h, m, a) {
    c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(5,12,26,.86)'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = S.CREMA; c.lineWidth = 1.5; c.stroke();
    for (var i = 0; i < 12; i++) { var an = i / 12 * TAU; c.beginPath(); c.moveTo(x + Math.sin(an) * r * 0.8, y - Math.cos(an) * r * 0.8); c.lineTo(x + Math.sin(an) * r * 0.92, y - Math.cos(an) * r * 0.92); c.stroke(); }
    var ah = (h % 12 + m / 60) / 12 * TAU, am = m / 60 * TAU;
    c.lineCap = 'round'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(ah) * r * 0.5, y - Math.cos(ah) * r * 0.5); c.stroke();
    c.strokeStyle = S.ACENTO; c.lineWidth = 1.8; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(am) * r * 0.78, y - Math.cos(am) * r * 0.78); c.stroke(); c.restore();
  }

  TH.registrar({
    id: 'diomedes', n: 8, nombre: 'Ayer y mañana', tipo: 'Lugar',
    pista: 'Dos islas en el horizonte, a cuatro kilómetros… y a casi un día de distancia. Toca una.',
    lugar: function () { return 0.5; }, radio: 0.45,
    detectar: function (api) { api.en('clic', function (d) { if (sobreIsla(d.x, d.y)) api.disparar(); }); },
    escena: function () {
      var D = 12000 + E.lectura;
      return {
        duracion: D,
        tarjeta: { en: 6400, hasta: D - 400, titulo: 'Ayer y mañana', pie: 'Diómedes Grande (Rusia) y Diómedes Pequeña (EE. UU.) · 3,8 km',
          texto: 'En medio del estrecho de Bering, entre Asia y América, hay dos islas a solo 3,8 km. Entre ellas pasan la frontera de Rusia y Estados Unidos y la línea internacional del cambio de fecha. La Diómedes Grande va por la hora de Anádyr y la Pequeña por la de Alaska: 21 horas de diferencia (20 en verano). Por eso las llaman la isla del Mañana y la isla del Ayer. Algunos inviernos el hielo las une y se podría ir andando de un día a otro.' },
        inicio: function () { E.irA(0.42, 1000); },
        frente: function (c, t) {
          var W = E.W, H = E.H, a = U.meseta(t, 600, 1600, D - 2000, D - 600); if (a <= 0) return;
          var g1 = S.pant((GRANDE[0] + GRANDE[1]) / 2, HOR - 56, P), g2 = S.pant((PEQUENA[0] + PEQUENA[1]) / 2, HOR - 36, P), lx = S.pant((GRANDE[1] + PEQUENA[0]) / 2, 0, P)[0];
          // la línea del cambio de fecha baja del cielo
          var kl = U.inOut(U.tramo(t, 700, 2200)), yl = H * PA.HOR + 4;
          c.save(); c.globalAlpha = a; c.strokeStyle = S.ACENTO; c.lineWidth = 2; c.setLineDash([8, 6]); c.beginPath(); c.moveTo(lx, 0); c.lineTo(lx, yl * kl); c.stroke(); c.setLineDash([]);
          var tam = W < 700 ? 8 : 10;
          if (kl > 0.6) { c.save(); c.translate(lx - 10, H * 0.32); c.rotate(-Math.PI / 2); S.mono(c, 'LÍNEA DEL CAMBIO DE FECHA', 0, 0, tam, S.ACENTO); c.restore(); }
          // los relojes: la Grande va 21 horas por delante
          var kr = U.tramo(t, 2000, 3000), m = (t / 60) % 60, hp = 12 + (t / 3600) % 1, R = Math.min(W, H) * (W < 700 ? 0.07 : 0.055), yr = Math.max(H * 0.2, g1[1] - R * 3.4);
          reloj(c, g1[0], yr, R, hp + 21, m, kr); reloj(c, g2[0], yr, R, hp, m, kr);
          S.mono(c, 'MAÑANA', g1[0], yr - R - 18, tam + 2, S.ACENTO, 'center', kr); S.mono(c, 'AYER', g2[0], yr - R - 18, tam + 2, S.CREMA, 'center', kr);
          S.mono(c, 'DIÓMEDES GRANDE · RUSIA', g1[0], yr + R + 16, tam, S.CREMA, 'center', kr); S.mono(c, 'DIÓMEDES PEQUEÑA · EE. UU.', g2[0], yr + R + 16, tam, S.CREMA, 'center', kr);
          c.restore();
          S.rotulo(c, '3,8 KM · 21 HORAS', lx, H * PA.HOR - 70 * S.k(), U.meseta(t, 2800, 3600, D - 2000, D - 600), S.ACENTO, 12);
        }
      };
    }
  });
})();
