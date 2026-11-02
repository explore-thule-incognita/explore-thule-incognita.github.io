/* Secreto 07 · Blanco por fuera (Lugar)
   Tocar el oso polar de la banquisa.
   La escena: el pelo del oso se vuelve transparente y debajo aparece su piel negra; una lupa enseña los pelos de cerca:
   tubos huecos y sin color sobre la piel oscura, y la luz que rebota dentro y sale blanca. */
(function () {
  'use strict';
  var TH = window.TH, U = TH.util, E = TH.motor, A = TH.arte, PA = TH.paisaje, S = TH.esc;
  var TAU = Math.PI * 2, OX = 1250, OY = 712, OS = 1.25;
  // el oso camina: se busca donde esté ahora (PA.osoPos)
  function sobreOso(x, y) { var o = PA.osoPos(); return S.dentro(x, y, o.x - 95 * OS, o.x + 95 * OS, o.y - 80 * OS, o.y + 6, 1); }
  var quieto = null;
  // el oso pintado con su piel: todo negro azulado, con el filo de luz
  var PIEL = { oso: '#1b1d26', osoMedio: '#262a36', osoSombra: '#101118', oscuro: '#050508', sombraSuelo: 'rgba(16,30,62,.4)', _filo: '#7a8aa8', _filoDx: -2, _filoDy: 2.6 };

  TH.registrar({
    id: 'oso', n: 7, nombre: 'Blanco por fuera', tipo: 'Lugar',
    pista: 'Al oso no le hace falta abrigo. Tócalo: ¿de qué color es debajo?',
    lugar: function () { return PA.osoPos().x / S.K; }, radio: 0.25,
    detectar: function (api) { api.en('clic', function (d) { if (sobreOso(d.x, d.y)) api.disparar(); }); },
    escena: function () {
      var D = 12000 + E.lectura;
      return {
        duracion: D,
        tarjeta: { en: 6200, hasta: D - 400, titulo: 'Blanco por fuera', pie: 'Ursus maritimus · piel negra, pelo sin color',
          texto: 'Debajo del pelo, el oso polar tiene la piel negra. Y su pelo no es blanco: cada pelo es transparente, sin pigmento, y los de fuera son huecos. Se ve blanco por cómo dispersa la luz, como la nieve, que está hecha de hielo transparente. Los oseznos nacen con la piel rosada y se les oscurece en unos meses. La idea de que los pelos llevan la luz hasta la piel, como si fueran fibra óptica, resultó ser falsa.' },
        inicio: function () { var o = PA.osoPos(); quieto = { x: o.x, y: o.y, dir: o.dir, anda: false, f: 0 }; PA.osoQuieto = quieto; E.irA(o.x / S.K, 1100); },
        fin: function () { PA.osoQuieto = null; },
        camino: function (c, t) {
          // el pelo se va volviendo transparente: el oso de piel negra aparece debajo y luego se vuelve a cubrir
          var k = U.meseta(t, 900, 2600, D - 2600, D - 1000); if (k <= 0) return;
          var P = Object.assign({}, PA.paleta(), PIEL);
          var o = quieto; c.save(); S.enCapa(c, 1); c.globalAlpha = k * 0.92; if (o.dir > 0) { c.translate(o.x * 2, 0); c.scale(-1, 1); } A.oso(c, o.x, o.y, OS, P); c.restore();
          // unos pelos sueltos, transparentes, alrededor
          c.save(); S.enCapa(c, 1); c.globalAlpha = k * 0.55; c.strokeStyle = 'rgba(235,245,255,.7)'; c.lineWidth = 1;
          for (var i = 0; i < 60; i++) { var a = U._h(i) * TAU, r = 60 + U._h(i + 3) * 30, x = quieto.x + Math.cos(a) * r * OS * 1.1, y = quieto.y - 46 * OS + Math.sin(a) * r * 0.45 * OS; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 6, y + Math.sin(a) * 4); c.stroke(); }
          c.restore();
        },
        frente: function (c, t) {
          var W = E.W, H = E.H, a = U.meseta(t, 2200, 3200, D - 2000, D - 600); if (a <= 0) return;
          // la lupa: pelos huecos y transparentes sobre la piel negra, con la luz que rebota dentro
          var p = S.pant(quieto.x - 30 * OS * -quieto.dir, quieto.y - 60 * OS, 1), R = Math.min(W, H) * (W < 700 ? 0.2 : 0.17), cx = U.clamp(p[0] + R * 1.2, R + 10, W - R - 10), cy = U.clamp(p[1] - R * 1.4, R + 70, H - R - 10);
          c.save(); c.globalAlpha = a;
          c.strokeStyle = 'rgba(230,238,244,.5)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(cx - R * 0.7, cy + R * 0.7); c.stroke();
          c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.save(); c.clip();
          c.fillStyle = '#121218'; c.fillRect(cx - R, cy - R, R * 2, R * 2);
          var g = c.createLinearGradient(cx, cy + R * 0.3, cx, cy + R); g.addColorStop(0, '#121218'); g.addColorStop(1, '#2a2a36'); c.fillStyle = g; c.fillRect(cx - R, cy + R * 0.3, R * 2, R * 0.7);
          for (var i = 0; i < 9; i++) {
            var hx = cx - R * 0.9 + i * R * 0.22, ang = -0.5 + U._h(i) * 0.3, l = R * 1.5, x0 = hx, y0 = cy + R * 0.55, x1 = hx + Math.sin(ang) * l, y1 = y0 - Math.cos(ang) * l, w = R * 0.07;
            c.save(); c.translate(x0, y0); c.rotate(ang);
            c.fillStyle = 'rgba(230,240,250,.16)'; c.fillRect(-w, -l, w * 2, l); c.strokeStyle = 'rgba(240,248,255,.75)'; c.lineWidth = 1.2; c.strokeRect(-w, -l, w * 2, l);
            c.fillStyle = 'rgba(10,10,16,.85)'; c.fillRect(-w * 0.45, -l, w * 0.9, l);
            // la luz que entra, rebota dentro del pelo y sale blanca
            var ph = ((t / 900 + i * 0.37) % 1), ly = -l * ph; c.fillStyle = 'rgba(255,255,255,' + (0.8 * Math.sin(Math.PI * ph)).toFixed(3) + ')'; c.beginPath(); c.arc((ph * 7 % 1 - 0.5) * w * 1.4, ly, 2, 0, TAU); c.fill();
            c.restore();
          }
          c.restore();
          c.strokeStyle = S.CREMA; c.lineWidth = 2.5; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
          var tam = W < 700 ? 8 : 10;
          S.mono(c, 'PELO TRANSPARENTE Y HUECO', cx, cy - R - 16, tam, S.CREMA); S.mono(c, 'PIEL NEGRA', cx, cy + R + 16, tam, S.ACENTO);
          c.restore();
        }
      };
    }
  });
})();
