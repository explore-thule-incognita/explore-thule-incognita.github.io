/* Secreto 10 · El salto de la manta (Gesto)
   En Utqiaġvik, junto a la manta de pieles de foca tendida en la nieve, deslizar hacia arriba (un gesto rápido, de abajo
   arriba, que empiece en la manta).
   La escena: la gente se pone alrededor de la manta y la levanta; en medio, alguien sale volando, tres saltos cada vez
   más altos, con los brazos abiertos; en lo más alto tira caramelos al público. */
(function () {
  'use strict';
  var TH = window.TH, U = TH.util, E = TH.motor, A = TH.arte, PA = TH.paisaje, S = TH.esc;
  var TAU = Math.PI * 2, MX = 3470, MY = 858, MR = 62;
  var SALTOS = [[1600, 2700, 120], [2800, 4100, 210], [4200, 5800, 320]];
  var COLORES = ['parka', 'parka2', 'parka3', 'parka4', 'parka', 'parka2', 'parka4', 'parka3', 'parka', 'parka2', 'parka3', 'parka4'];
  function salto(t) { for (var i = 0; i < SALTOS.length; i++) { var q = SALTOS[i]; if (t >= q[0] && t < q[1]) { var u = (t - q[0]) / (q[1] - q[0]); return { h: q[2] * 4 * u * (1 - u), u: u, i: i }; } } return { h: 0, u: 0, i: -1 }; }

  TH.registrar({
    id: 'nalukataq', n: 10, nombre: 'El salto de la manta', tipo: 'Gesto',
    pista: 'En la fiesta de la ballena alguien vuela desde una manta. Lánzalo hacia arriba.',
    lugar: function () { return MX / S.K; }, radio: 0.2,
    detectar: function (api) {
      api.en('trazo', function (d) {
        var p = d.pts; if (p.length < 3 || d.dur > 1200) return;
        var a = p[0], b = p[p.length - 1], dy = a.y - b.y, dx = Math.abs(b.x - a.x);
        if (dy > E.H * 0.18 && dx < dy * 0.6 && S.dentro(a.x, a.y, MX - MR * 1.6, MX + MR * 1.6, MY - 60, MY + 40, 1)) api.disparar();
      });
    },
    escena: function () {
      var D = 12500 + E.lectura;
      return {
        duracion: D,
        tarjeta: { en: 6400, hasta: D - 400, titulo: 'El salto de la manta', pie: 'Nalukataq · Utqiaġvik, cada junio',
          texto: 'Cuando termina la caza de la ballena en primavera, en junio, Utqiaġvik celebra el Nalukataq: varios días de fiesta, oraciones, danza y comida compartida, como el muktuk (piel y grasa de ballena). Lo más famoso es la manta: pieles de foca cosidas que antes cubrieron las barcas, sostenidas por mucha gente que lanza por los aires a quien se sube. A veces, quien salta tira caramelos al público. Se cuenta que empezó como una forma de ver la caza a lo lejos. (Aquí lo recordamos en plena noche de invierno).' },
        inicio: function () { E.irA((MX + 40) / S.K, 900); },
        camino: function (c, t) {
          var P = PA.paleta(), ap = U.meseta(t, 200, 1200, D - 1400, D - 400); if (ap <= 0) return;
          var sj = salto(t), tension = sj.i >= 0 && sj.u < 0.12 ? 1 - sj.u / 0.12 : sj.i >= 0 && sj.u > 0.88 ? (sj.u - 0.88) / 0.12 : 0;
          c.save(); S.enCapa(c, 1); c.globalAlpha = ap;
          // la gente de detrás, la manta levantada y la gente de delante
          var gente = [];
          for (var i = 0; i < 12; i++) { var an = i / 12 * TAU + 0.2, gx = MX + Math.cos(an) * MR * 1.25, gy = MY - 18 + Math.sin(an) * MR * 0.36; gente.push({ x: gx, y: gy + 20, delante: Math.sin(an) > 0, c: COLORES[i] }); }
          gente.filter(function (g) { return !g.delante; }).forEach(function (g) { A.persona(c, g.x, g.y, 62, g.c, P); });
          var my = MY - 22 + tension * 8;
          var E2 = A.pintor(c, P); E2.f('umiak', A.elipse(MX, my, MR, MR * 0.26 + tension * 4)); E2.f('umiakSombra', A.elipse(MX + 6, my + 4, MR * 0.8, MR * 0.15)); E2.l('oscuro', A.elipse(MX, my, MR * 1.01, MR * 0.27 + tension * 4), 1.2);
          // el que salta: brazos abiertos, un poco girado en el aire
          var yj = my - 4 - sj.h;
          c.save(); c.translate(MX, yj); c.rotate(Math.sin(t / 300) * 0.08 * (sj.h / 200)); A.persona(c, 0, 0, 74, 'parka4', P, { brazo: sj.h > 40 ? null : 'abajo' }); c.restore();
          if (sj.h > 40) { var br = new Path2D(); br.moveTo(MX - 8, yj - 52); br.lineTo(MX - 34, yj - 78); E2.l('parka4', br, 7); }
          gente.filter(function (g) { return g.delante; }).forEach(function (g) { A.persona(c, g.x, g.y, 66, g.c, P); });
          // los caramelos que tira desde arriba
          var ult = SALTOS[2];
          if (t > ult[0] + 500) { for (var k = 0; k < 18; k++) { var tk = (t - ult[0] - 500) / 1500, ang = -Math.PI / 2 + (U._h(k) - 0.5) * 2.2, v = 160 + U._h(k + 9) * 140, px = MX + Math.cos(ang) * v * tk, py = MY - 22 - ult[2] + Math.sin(ang) * v * tk + 260 * tk * tk; if (tk < 0 || tk > 1.4 || py > MY + 30) continue; c.fillStyle = ['#ff6a8a', '#ffd44a', '#6ff2b0', '#7ab8ff'][k % 4]; c.beginPath(); c.arc(px, py, 3.2, 0, TAU); c.fill(); } }
          c.restore();
        },
        frente: function (c, t) {
          var sj = salto(t), p = S.pant(MX, MY - 120 - sj.h, 1);
          S.rotulo(c, ['¡UNO!', '¡DOS!', '¡TRES!'][sj.i] || '', p[0] + 120 * S.k(), p[1], sj.i >= 0 ? U.meseta(sj.u, 0.2, 0.35, 0.65, 0.8) : 0, S.ACENTO, 12);
          S.rotulo(c, 'NALUKATAQ · LA FIESTA DE LA BALLENA', E.W / 2, E.H * (E.W < 700 ? 0.17 : 0.13), U.meseta(t, 600, 1500, D - 2000, D - 600), S.CREMA, 12);
        }
      };
    }
  });
})();
