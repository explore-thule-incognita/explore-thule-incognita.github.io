/* Secreto 02 · La carrera del suero (Distancia)
   Seguir empujando más allá del final del camino (rueda, flecha o arrastre).
   La escena: en plena ventisca llega un trineo al galope con el paquete del suero; en el relevo le espera otro equipo; el
   paquete pasa de un trineo al otro y el segundo sale disparado. Arriba, la ruta de Nenana a Nome con sus 20 conductores se
   va encendiendo, con los días y los kilómetros; el tramo de Togo y el de Balto, marcados. */
(function () {
  'use strict';
  var TH = window.TH, U = TH.util, E = TH.motor, A = TH.arte, PA = TH.paisaje, S = TH.esc;
  var TAU = Math.PI * 2, Y = 856, PERRO = 34;
  // los tramos del relevo, en km desde Nenana (aproximados; 1.085 km en total). Togo: de Shaktoolik a Golovin (146 km),
  // el más largo, sobre el hielo del Norton Sound; Balto: el último, de Bluff a Nome (85 km)
  var TOGO = [700, 846], BALTO = [1000, 1085];
  function equipo(c, x, y, fase, P, conCarga) {
    A.trineo(c, x, y, 1.3, P, { carga: conCarga });
    A.persona(c, x - 78, y - 4, 88, 'parka2', P);
    var cuerda = new Path2D(); cuerda.moveTo(x + 74, y - 18); cuerda.lineTo(x + 74 + 7 * 64, y - 18); A.pintor(c, P).l('oscuro', cuerda, 1.4);
    for (var i = 0; i < 7; i++) A.perroGalope(c, x + 120 + i * 64, y + (i % 2 ? 6 : -6), i % 2 ? PERRO + 3 : PERRO, (fase + i * 0.27) % 1, P);
  }

  TH.registrar({
    id: 'suero', n: 2, nombre: 'La carrera del suero', tipo: 'Distancia',
    pista: 'Seiscientas setenta y cuatro millas. Sigue la pista más allá del final.',
    detectar: function (api) {
      api.en('empujar', function (d) { if (d.lado === 'fin' && d.total > 1300) api.disparar(); });
    },
    escena: function () {
      var D = 13500 + E.lectura, V, mid;
      function x1(t) { return U.lerp(V[0] - 900, mid - 640, U.sale(U.tramo(t, 0, 2800))); }
      function x2(t) { return U.lerp(mid + 60, V[1] + 300, U.entra(U.tramo(t, 3300, 6400))); }
      return {
        duracion: D,
        tarjeta: { en: 7600, hasta: D - 400, titulo: 'La carrera del suero', pie: 'Nenana → Nome, Alaska · 27 de enero – 2 de febrero de 1925',
          texto: 'En enero de 1925 hubo un brote de difteria en Nome y el suero estaba a más de mil kilómetros. Llegó en tren hasta Nenana y desde allí lo llevaron en relevos 20 conductores de trineo y unos 150 perros: 1.085 km en cinco días y medio, con ventiscas a −40 °C. El tramo más largo y peligroso, sobre el hielo del Norton Sound, lo hizo Togo, el perro guía de Leonhard Seppala. La fama, y la estatua de Central Park, se la llevó Balto, que guió el último tramo. La carrera Iditarod la recuerda desde 1973.' },
        inicio: function () { V = S.vista(1); mid = V[0] + (V[1] - V[0]) * 0.46; },
        camino: function (c, t) {
          var P = PA.paleta();
          c.save(); S.enCapa(c, 1);
          // el equipo que espera el relevo, y luego sale
          var ap = U.tramo(t, 200, 900); c.globalAlpha = ap;
          var xb = t < 3300 ? mid + 60 : x2(t); equipo(c, xb, Y + 20, t < 3300 ? 0.15 : (xb / (PERRO * 2.2)) % 1, P, true);
          c.globalAlpha = 1;
          // el que llega con el suero
          var xa = x1(t), llegado = t > 2800; equipo(c, xa, Y - 14, llegado ? 0.15 : (xa / (PERRO * 2.2)) % 1, P, true);
          // el paquete del suero vuela de un trineo al otro
          var kp = U.tramo(t, 2900, 3300);
          if (kp > 0 && kp < 1) { var px = U.lerp(xa - 10, mid + 50, kp), py = Y - 70 - Math.sin(kp * Math.PI) * 70; c.save(); c.translate(px, py); c.rotate(kp * 3); A.pintor(c, P).f('ribete2', A.rect(-14, -9, 28, 18)); A.pintor(c, P).f('oscuro', A.rect(-14, -2, 28, 4)); c.restore(); }
          c.restore();
        },
        cielo: function (c, t) {
          // la ventisca: velos de nieve que cruzan
          var a = U.meseta(t, 0, 800, D - 1500, D - 300) * 0.35; if (a <= 0) return;
          c.save(); c.fillStyle = 'rgba(220,232,250,' + (a * 0.25).toFixed(3) + ')'; c.fillRect(0, 0, E.W, E.H); c.restore();
        },
        frente: function (c, t) {
          var W = E.W, H = E.H, a = U.meseta(t, 400, 1200, D - 2200, D - 600); if (a <= 0) return;
          // la nieve de la ventisca, en diagonal
          c.save(); c.strokeStyle = 'rgba(240,246,255,' + (0.5 * a).toFixed(3) + ')'; c.lineWidth = 1.2; c.beginPath();
          for (var i = 0; i < 120; i++) { var x = ((U._h(i) * W * 1.4 + t * (0.8 + U._h(i + 3))) % (W * 1.4)) - W * 0.2, y = (U._h(i + 7) * H + t * 0.25) % H; c.moveTo(x, y); c.lineTo(x + 26, y + 6); }
          c.stroke(); c.restore();
          // la ruta de Nenana a Nome, con sus 20 relevos
          var x0 = W * (W < 700 ? 0.08 : 0.16), xf = W * (W < 700 ? 0.92 : 0.84), y = H * 0.17, k = U.inOut(U.tramo(t, 900, 7000)), km = k * 1085;
          var X = function (v) { return U.lerp(x0, xf, v / 1085); };
          c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(5,12,26,.8)'; c.fillRect(x0 - 26, y - 38, xf - x0 + 52, 104);
          c.strokeStyle = 'rgba(230,238,244,.35)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x0, y); c.lineTo(xf, y); c.stroke();
          [[TOGO, 'TOGO'], [BALTO, 'BALTO']].forEach(function (q) { c.fillStyle = 'rgba(111,242,176,.22)'; c.fillRect(X(q[0][0]), y - 12, X(q[0][1]) - X(q[0][0]), 24); S.mono(c, q[1], (X(q[0][0]) + X(q[0][1])) / 2, y + 22, W < 700 ? 8 : 10, S.ACENTO); });
          for (var r = 0; r <= 20; r++) { var xr = U.lerp(x0, xf, r / 20), on = r / 20 <= k; c.strokeStyle = on ? S.ACENTO : 'rgba(230,238,244,.4)'; c.lineWidth = on ? 1.6 : 1; c.beginPath(); c.moveTo(xr, y - 7); c.lineTo(xr, y + 7); c.stroke(); }
          c.strokeStyle = S.ACENTO; c.lineWidth = 2.6; c.beginPath(); c.moveTo(x0, y); c.lineTo(X(km), y); c.stroke();
          var g = c.createRadialGradient(X(km), y, 0, X(km), y, 14); g.addColorStop(0, 'rgba(220,255,236,.95)'); g.addColorStop(1, 'rgba(111,242,176,0)'); c.fillStyle = g; c.beginPath(); c.arc(X(km), y, 14, 0, TAU); c.fill();
          var tam = W < 700 ? 8 : 10;
          S.mono(c, 'NENANA', x0, y - 22, tam, S.CREMA, 'left'); S.mono(c, 'NOME', xf, y - 22, tam, S.CREMA, 'right');
          var horas = k * 127.5, dia = Math.min(6, 1 + Math.floor(horas / 24));
          S.mono(c, 'DÍA ' + dia + ' · ' + S.num(km) + ' KM · RELEVO ' + Math.max(1, Math.ceil(k * 20)) + ' / 20 · −40 °C', (x0 + xf) / 2, y + 44, tam, k >= 1 ? S.ACENTO : S.CREMA);
          c.restore();
          var ar = U.meseta(t, 2700, 2900, 3700, 4300), p = S.pant(mid - 40, Y - 150, 1);
          S.rotulo(c, 'RELEVO · EL SUERO PASA DE MANO', p[0], p[1], ar, S.ACENTO);
        }
      };
    }
  });
})();
