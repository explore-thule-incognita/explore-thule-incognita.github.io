/* Secreto 01 · La aurora boreal (Gesto)
   De noche, dibujar la aurora en el cielo: apretar en la parte alta del cielo y hacer una onda de lado a lado (Pau 02/11:
   «la activaría de otra forma»; antes era quedarse quieto de noche y se podía encontrar sin querer). Mientras se dibuja,
   una cinta de aurora (rayos verdes que suben a violeta) sigue el trazo; si cruza casi medio cielo y sube y baja al
   menos dos veces, se desata. Si se suelta antes, la cinta se apaga.
   La escena: llega una tormenta solar; la aurora se enciende entera y, justo encima, se abre en corona (los rayos parecen
   salir de un punto porque los miras desde debajo). A la derecha, una regla de alturas: el borde magenta del nitrógeno
   hacia los 90 km, el verde del oxígeno de 100 a 250 km y el rojo del oxígeno más arriba. */
(function () {
  'use strict';
  var TH = window.TH, U = TH.util, E = TH.motor, PA = TH.paisaje, S = TH.esc;
  var TAU = Math.PI * 2;
  var RAYOS = (function () { var r = U.azar(17), out = []; for (var i = 0; i < 64; i++) out.push({ a: -1.25 + r() * 2.5, l: 0.35 + r() * 0.5, w: 2 + r() * 6, f: r() * TAU, v: 0.6 + r() * 1.4 }); return out; })();
  // ¿es de noche y está el punto en lo alto del cielo?
  function enCielo(y) { return PA.peso('noche') > 0.6 && y < E.H * PA.HOR * 0.72; }
  // la onda: ancho recorrido y cuántas veces cambia de subir a bajar (con un margen para no contar el temblor)
  function onda(pts) {
    var x0 = 1e9, x1 = -1e9, giros = 0, dir = 0, ref = pts[0][1], umbral = E.H * 0.02;
    pts.forEach(function (q) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); var d = q[1] - ref; if (Math.abs(d) > umbral) { var nd = d > 0 ? 1 : -1; if (dir && nd !== dir) giros++; dir = nd; ref = q[1]; } });
    return { ancho: x1 - x0, giros: giros };
  }

  TH.registrar({
    id: 'aurora', n: 1, nombre: 'La aurora boreal', tipo: 'Gesto',
    pista: 'De noche, dibuja tú la aurora en el cielo: una onda de lado a lado.',
    detectar: function (api) {
      var trazo = null, apagando = null;
      api.en('bajar', function (d) { if (!enCielo(d.y)) return; d.tomar(); trazo = [[d.x, d.y, E.t]]; apagando = null; });
      api.en('arrastrar', function (d) {
        if (!trazo) return; trazo.push([d.x, d.y, E.t]);
        var o = onda(trazo); if (o.ancho > E.W * 0.45 && o.giros >= 2) { apagando = { pts: trazo, t0: E.t }; trazo = null; api.disparar(); }
      });
      api.en('soltar', function () { if (trazo) { apagando = { pts: trazo, t0: E.t }; trazo = null; } });
      // la cinta que sigue al dedo: rayos que suben desde el trazo, verdes abajo y violeta arriba
      api.capa(function (c) {
        var pts = trazo || (apagando && apagando.pts), a = trazo ? 1 : apagando ? 1 - U.tramo(E.t - apagando.t0, 0, 1400) : 0;
        if (!pts || a <= 0 || pts.length < 2) return;
        c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
        for (var i = 1; i < pts.length; i++) {
          var p = pts[i], q = pts[i - 1], n = Math.max(1, Math.round(Math.hypot(p[0] - q[0], p[1] - q[1]) / 5));
          for (var j = 0; j < n; j++) {
            var x = U.lerp(q[0], p[0], j / n), y = U.lerp(q[1], p[1], j / n), h = E.H * (0.09 + 0.05 * Math.sin(x * 0.05 + E.t / 300)), al = a * (0.7 + 0.3 * Math.sin(x * 0.13 + E.t / 200));
            var g = c.createLinearGradient(0, y, 0, y - h); g.addColorStop(0, 'rgba(93,255,174,0)'); g.addColorStop(0.08, 'rgba(93,255,174,' + al.toFixed(3) + ')'); g.addColorStop(0.5, 'rgba(47,220,174,' + (al * 0.45).toFixed(3) + ')'); g.addColorStop(1, 'rgba(160,102,255,0)');
            c.strokeStyle = g; c.lineWidth = 7; c.beginPath(); c.moveTo(x, y + 2); c.lineTo(x, y - h); c.stroke();
          }
        }
        var linea = function (w, col, dy) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); pts.forEach(function (q, i) { c[i ? 'lineTo' : 'moveTo'](q[0], q[1] + dy); }); c.stroke(); };
        linea(22, 'rgba(93,255,174,' + (0.16 * a).toFixed(3) + ')', 0); linea(8, 'rgba(150,255,200,' + (0.4 * a).toFixed(3) + ')', 0); linea(2.6, 'rgba(235,255,245,' + (0.95 * a).toFixed(3) + ')', 0); linea(2, 'rgba(255,110,180,' + (0.5 * a).toFixed(3) + ')', 6);
        c.restore();
      });
    },
    escena: function () {
      var D = 13000 + E.lectura;
      return {
        duracion: D, detenerDia: true,
        tarjeta: { en: 6200, hasta: D - 400, titulo: 'La aurora boreal', pie: 'Aurora borealis · entre 90 y 300 km de altura',
          texto: 'El viento solar trae partículas cargadas que el campo magnético de la Tierra lleva hacia los polos. Al chocar con el aire de la alta atmósfera, lo encienden: el oxígeno brilla verde más o menos entre los 100 y los 250 km, y rojo por encima; el nitrógeno da el borde rosado de abajo. Alaska queda bajo el «óvalo auroral», el anillo donde más aparece. Su fuerza se mide con el índice Kp, de 0 a 9; cuando está justo encima, los rayos parecen salir de un punto: es la corona.' },
        aurora: function (t) { return 1 + 1.1 * U.meseta(t, 400, 2600, D - 2600, D - 400); },
        frente: function (c, t) {
          var W = E.W, H = E.H, a = U.meseta(t, 1800, 3600, D - 2400, D - 600), cx = W * 0.5, cy = H * 0.04, hz = H * PA.HOR;
          if (a > 0) {
            // la corona: rayos que parecen salir de un punto encima de ti
            c.save(); c.globalCompositeOperation = 'lighter';
            RAYOS.forEach(function (q) {
              var l = H * q.l * (0.8 + 0.2 * Math.sin(t / 700 * q.v + q.f)), x1 = cx + Math.sin(q.a) * l, y1 = cy + Math.cos(q.a) * l * 0.9, al = a * (0.18 + 0.14 * Math.sin(t / 500 * q.v + q.f));
              var g = c.createLinearGradient(cx, cy, x1, y1); g.addColorStop(0, 'rgba(255,90,140,0)'); g.addColorStop(0.25, 'rgba(255,90,140,' + (al * 0.5).toFixed(3) + ')'); g.addColorStop(0.55, 'rgba(120,255,190,' + al.toFixed(3) + ')'); g.addColorStop(1, 'rgba(93,255,174,0)');
              c.strokeStyle = g; c.lineWidth = q.w; c.beginPath(); c.moveTo(cx, cy); c.lineTo(x1, y1); c.stroke();
            });
            c.restore();
          }
          // la regla de alturas
          var ar = U.meseta(t, 3000, 4200, D - 2400, D - 600); if (ar <= 0) return;
          var x = W - (W < 700 ? 34 : 70), y0 = Math.min(hz - 30, H * 0.52), y1 = H * 0.14;
          c.save(); c.globalAlpha = ar; c.strokeStyle = 'rgba(230,238,244,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke();
          var alt = function (km) { return U.lerp(y0, y1, km / 320); };
          [[0, 'rgba(230,238,244,.6)', ''], [90, '#ff6aa8', ''], [100, '#6ff2b0', ''], [250, '#6ff2b0', ''], [300, '#ff6a5a', '']].forEach(function (q) { c.strokeStyle = q[1]; c.beginPath(); c.moveTo(x - 6, alt(q[0])); c.lineTo(x + 6, alt(q[0])); c.stroke(); });
          c.fillStyle = 'rgba(111,242,176,.5)'; c.fillRect(x - 2, alt(250), 4, alt(100) - alt(250)); c.fillStyle = 'rgba(255,106,90,.5)'; c.fillRect(x - 2, alt(320), 4, alt(250) - alt(320));
          c.fillStyle = 'rgba(255,106,168,.6)'; c.fillRect(x - 2, alt(100), 4, alt(85) - alt(100));
          var tam = W < 700 ? 8 : 10;
          S.mono(c, 'ROJO · OXÍGENO', x - 14, alt(285), tam, '#ff9a8a', 'right'); S.mono(c, '+250 KM', x - 14, alt(285) + tam * 1.5, tam, 'rgba(230,238,244,.7)', 'right');
          S.mono(c, 'VERDE · OXÍGENO', x - 14, alt(175), tam, '#6ff2b0', 'right'); S.mono(c, '100–250 KM', x - 14, alt(175) + tam * 1.5, tam, 'rgba(230,238,244,.7)', 'right');
          S.mono(c, 'ROSA · NITRÓGENO · ~90 KM', x - 14, alt(88), tam, '#ff9ac4', 'right');
          c.restore();
          S.rotulo(c, 'TORMENTA SOLAR · KP 7', W / 2, H * (W < 700 ? 0.17 : 0.13), U.meseta(t, 1200, 2400, D - 2400, D - 600), S.ACENTO, 12);
        }
      };
    }
  });
})();
