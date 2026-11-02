/* Thule Incognita · el final
   Con los diez: llega la noche cerrada y la aurora se desata, con su corona encima. Diez luces, una por secreto, suben del
   suelo: siete forman la Osa Mayor y una la Estrella Polar (las ocho estrellas de la bandera de Alaska); las otras dos se
   pierden en la aurora y estallan. Un trineo cruza a contraluz, al galope, hacia la Polar. El «in» del título se tacha:
   «Thule cognita». Después, los créditos. */
(function () {
  'use strict';
  var TH = window.TH, U = TH.util, E = TH.motor, A = TH.arte, PA = TH.paisaje, S = TH.esc;
  var TAU = Math.PI * 2;
  var T = { luces: 2600, forma: 5600, lineas: 6400, trineo: 7600, fin: 15000 };
  // la Osa Mayor y la Polar, en un recuadro 0…1 (los «punteros» Merak y Dubhe apuntan a la Polar)
  var OSA = [[0.25, 0.62], [0.33, 0.52], [0.43, 0.5], [0.53, 0.54], [0.5, 0.7], [0.64, 0.74], [0.67, 0.56]], POLAR = [0.86, 0.12];
  var TRAZO = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]];
  var SILUETA = { perro: '#0a0e1a', perroSombra: '#05070f', perroClaro: '#121a2c', ribete2: '#0a0e1a', oscuro: '#000000', trineo: '#0a0e1a', umiak: '#121a2c', parka2: '#0a0e1a', ribete: '#121a2c', flor: 'rgba(0,0,0,0)', piel: '#121a2c', pielOscura: '#05070f', cara: '#05070f', sombraSuelo: 'rgba(0,0,0,0)', _filo: '#6ff2b0', _filoDx: 0, _filoDy: 2.4 };
  var chispas = [];

  TH.registrarFinal({
    escena: function () {
      var D = T.fin + E.lectura, hora0 = PA.hora;
      function caja() { var W = E.W, H = E.H, w = Math.min(W * 0.62, H * 1.0), h = w * 0.5; return { x: W / 2 - w / 2, y: H * (W < 700 ? 0.1 : 0.06), w: w, h: h }; }
      function sitio(q) { var b = caja(); return [b.x + q[0] * b.w, b.y + q[1] * b.h]; }
      return {
        duracion: D, detenerDia: true,
        tarjeta: { en: 9400, hasta: D - 400, titulo: 'Thule cognita', pie: 'Los diez secretos de la noche polar',
          texto: 'Has encontrado los diez secretos del Ártico. Las ocho estrellas que acaban de encenderse, la Osa Mayor y la Estrella Polar, son las de la bandera de Alaska: la dibujó en 1927 Benny Benson, un niño alutiiq de 13 años, para un concurso escolar. El fondo azul, por el cielo de Alaska y la nomeolvides; la Osa Mayor, por la fuerza del oso; la Polar, porque Alaska sería el estado más al norte del país. El fin del mundo conocido ya no es tan desconocido.' },
        inicio: function () { PA.hora = 23.4; chispas = []; },
        fin: function () { PA.hora = hora0; },
        aurora: function (t) { return 1.1 + 1.3 * U.meseta(t, 300, 2600, D - 2600, D - 400); },
        frente: function (c, t) {
          var W = E.W, H = E.H, a = U.meseta(t, 0, 600, D - 1200, D - 300);
          // el cielo se oscurece un poco para que manden las luces
          c.fillStyle = 'rgba(0,4,14,' + (0.25 * a).toFixed(3) + ')'; c.fillRect(0, 0, W, H);
          // las diez luces: suben del suelo y van a su sitio
          for (var n = 0; n < 10; n++) {
            var t0 = T.luces + n * 180, k = U.inOut(U.tramo(t, t0, T.forma + n * 60)); if (t < t0) continue;
            var ox = W * (0.06 + n * 0.098), oy = H * 0.95, dest = n < 7 ? sitio(OSA[n]) : n === 7 ? sitio(POLAR) : [W * (0.2 + (n - 8) * 0.6), H * 0.1];
            var mx = (ox + dest[0]) / 2 + (n % 2 ? -1 : 1) * W * 0.1, my = H * 0.5;
            var lx = (1 - k) * (1 - k) * ox + 2 * (1 - k) * k * mx + k * k * dest[0], ly = (1 - k) * (1 - k) * oy + 2 * (1 - k) * k * my + k * k * dest[1];
            if (n >= 8 && k >= 1) { if (!chispas[n]) chispas[n] = t; var dc = t - chispas[n]; if (dc < 1600) for (var q = 0; q < 16; q++) { var an = q / 16 * TAU; S.destello(c, lx + Math.cos(an) * dc * 0.12, ly + Math.sin(an) * dc * 0.12 + dc * dc * 0.00004, 2, a * (1 - dc / 1600)); } continue; }
            var brillo = k >= 1 ? 0.75 + 0.25 * Math.sin(t / 300 + n) : 1, r = (n === 7 ? 5 : 3.6) * (W < 700 ? 0.8 : 1);
            c.save(); c.globalCompositeOperation = 'lighter'; var g = c.createRadialGradient(lx, ly, 0, lx, ly, r * 7); g.addColorStop(0, 'rgba(230,255,240,' + (0.9 * a * brillo).toFixed(3) + ')'); g.addColorStop(1, 'rgba(111,242,176,0)'); c.fillStyle = g; c.beginPath(); c.arc(lx, ly, r * 7, 0, TAU); c.fill(); c.restore();
            c.fillStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')'; c.beginPath(); c.arc(lx, ly, r * 0.6, 0, TAU); c.fill();
            if (k >= 1 && n === 7) S.destello(c, lx, ly, 5, a * brillo);
          }
          // las líneas de la constelación y la de los punteros hacia la Polar
          var kl = U.tramo(t, T.lineas, T.lineas + 1600);
          if (kl > 0) {
            c.save(); c.globalAlpha = a; c.strokeStyle = 'rgba(111,242,176,.55)'; c.lineWidth = 1.2;
            TRAZO.forEach(function (s, i) { var u = U.clamp(kl * TRAZO.length - i, 0, 1); if (u <= 0) return; var p0 = sitio(OSA[s[0]]), p1 = sitio(OSA[s[1]]); c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(U.lerp(p0[0], p1[0], u), U.lerp(p0[1], p1[1], u)); c.stroke(); });
            var kp = U.tramo(t, T.lineas + 1400, T.lineas + 2600); if (kp > 0) { var m0 = sitio(OSA[5]), m1 = sitio(POLAR); c.setLineDash([4, 5]); c.beginPath(); c.moveTo(m0[0], m0[1]); c.lineTo(U.lerp(m0[0], m1[0], kp), U.lerp(m0[1], m1[1], kp)); c.stroke(); c.setLineDash([]); }
            c.restore();
            var b = caja(), tam = W < 700 ? 8 : 10;
            S.mono(c, 'LA OSA MAYOR', b.x + b.w * 0.36, b.y + b.h * 0.86, tam, S.CREMA, 'center', a * U.tramo(t, T.lineas + 800, T.lineas + 1600));
            S.mono(c, 'LA ESTRELLA POLAR', sitio(POLAR)[0], sitio(POLAR)[1] + 22, tam, S.ACENTO, 'center', a * U.tramo(t, T.lineas + 2200, T.lineas + 2800));
          }
          // el trineo, a contraluz, hacia la Polar
          var kt = U.tramo(t, T.trineo, T.trineo + 6200);
          if (kt > 0 && kt < 1) {
            var k2 = S.k() * 1.15, y = H * 0.94, xs = U.lerp(-W * 0.25, W * 1.15, U.inOut(kt));
            c.save(); c.globalAlpha = a; c.translate(xs, y); c.scale(k2, k2);
            var P = Object.assign({}, PA.paleta(), SILUETA);
            A.trineo(c, 0, 0, 1.3, P); A.persona(c, -78, -4, 88, 'parka2', P);
            for (var i = 0; i < 6; i++) A.perroGalope(c, 120 + i * 64, (i % 2 ? 6 : -6), i % 2 ? 37 : 34, (t / 420 + i * 0.27) % 1, P);
            c.restore();
          }
          S.rotulo(c, 'THULE COGNITA', W / 2, H * (W < 700 ? 0.6 : 0.56), U.meseta(t, T.lineas + 2400, T.lineas + 3200, D - 2000, D - 600), S.ACENTO, 13);
        }
      };
    }
  });
})();
