/* Thule Incognita · piezas de las escenas
   Lo que comparten los secretos: pasar de lámina a pantalla y al revés, los rótulos de cristal oscuro con el filo verde
   de la aurora, los paneles para mapas y diagramas, la lámina de papel helado y la letra. Casi todo dibuja en unidades
   de lámina (900 = la altura de la pantalla) dentro de una capa: S.enCapa(c, p). */
(function () {
  'use strict';
  var TH = window.TH, U = TH.util, E = TH.motor, A = TH.arte, PA = TH.paisaje;
  var TAU = Math.PI * 2, K = 900, ACENTO = '#6ff2b0', CREMA = '#e6eef4', NOCHE = 'rgba(7,14,30,.86)';
  var S = TH.esc = { ACENTO: ACENTO, CREMA: CREMA, K: K, P: { lejos: 0.35, medio: 0.65, camino: 1, cerca: 1.3 } };

  /* ---------- coordenadas: de lámina de una capa a pantalla y al revés ---------- */
  S.k = function () { return E.u / K; };
  S.enCapa = function (c, p) { var k = E.u / K; c.translate(E.W / 2 - (E.W / 2 + E.camX) * p, 0); c.scale(k, k); };
  S.pant = function (x, y, p) { var k = E.u / K; return [E.W / 2 + x * k - (E.W / 2 + E.camX) * (p == null ? 1 : p), y * k]; };
  S.lam = function (sx, sy, p) { var k = E.u / K; return [(sx - E.W / 2 + (E.W / 2 + E.camX) * (p == null ? 1 : p)) / k, sy / k]; };
  S.vista = function (p) { var a = S.lam(0, 0, p)[0], b = S.lam(E.W, 0, p)[0]; return [a, b]; };
  // ¿está el punto de pantalla (x, y) dentro del rectángulo de lámina [x0, x1] × [y0, y1] de la capa p?
  S.dentro = function (x, y, x0, x1, y0, y1, p) { var q = S.lam(x, y, p); return q[0] >= x0 && q[0] <= x1 && q[1] >= y0 && q[1] <= y1; };

  /* ---------- rótulos, paneles y láminas ---------- */
  S.rotulo = function (c, txt, x, y, a, color, tam) {
    if (a <= 0) return;
    c.save(); c.globalAlpha = a; tam = tam || 11;
    c.font = '500 ' + tam + 'px "IBM Plex Mono", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
    if ('letterSpacing' in c) c.letterSpacing = (tam * 0.2).toFixed(1) + 'px';
    var w = c.measureText(txt).width + tam * 1.7, h = tam * 2;
    if (w > E.W - 20 && tam > 8) { c.restore(); return S.rotulo(c, txt, x, y, a, color, tam - 1); }
    c.fillStyle = NOCHE; c.fillRect(x - w / 2, y - h / 2, w, h);
    c.strokeStyle = 'rgba(111,242,176,.35)'; c.lineWidth = 1; c.strokeRect(x - w / 2 + 2.5, y - h / 2 + 2.5, w - 5, h - 5);
    c.fillStyle = color || CREMA; c.fillText(txt, x, y + 0.5);
    if ('letterSpacing' in c) c.letterSpacing = '0px';
    c.restore();
  };
  // un texto pequeño en versalitas espaciadas (para mapas y diagramas)
  S.mono = function (c, txt, x, y, tam, color, alin, a) {
    c.save(); if (a != null) c.globalAlpha *= a; c.font = '500 ' + tam + 'px "IBM Plex Mono", monospace'; c.textAlign = alin || 'center'; c.textBaseline = 'middle';
    if ('letterSpacing' in c) c.letterSpacing = (tam * 0.18).toFixed(1) + 'px';
    c.fillStyle = color || CREMA; c.fillText(txt, x, y); c.restore();
  };
  // un texto que no se sale de [x0, x1]: se mide y, si hace falta, se corre hacia dentro
  S.monoDentro = function (c, txt, x, y, tam, color, x0, x1, alin, a) {
    c.save(); c.font = '500 ' + tam + 'px "IBM Plex Mono", monospace'; if ('letterSpacing' in c) c.letterSpacing = (tam * 0.18).toFixed(1) + 'px';
    var w = c.measureText(txt).width; c.restore();
    var izq = alin === 'right' ? x - w : alin === 'left' ? x : x - w / 2; izq = U.clamp(izq, x0, Math.max(x0, x1 - w));
    S.mono(c, txt, izq, y, tam, color, 'left', a);
  };
  // texto con la serif de la familia
  S.serif = function (c, txt, x, y, tam, color, alin, cursiva) {
    c.save(); c.font = (cursiva ? 'italic ' : '') + '400 ' + tam + 'px "Instrument Serif", Georgia, serif'; c.textAlign = alin || 'center'; c.textBaseline = 'middle';
    c.fillStyle = color || CREMA; c.fillText(txt, x, y); c.restore();
  };
  // un panel de cristal oscuro (para mapas, relojes y diagramas)
  S.panel = function (c, x, y, w, h, a) {
    if (a <= 0) return;
    c.save(); c.globalAlpha *= a; c.fillStyle = 'rgba(5,12,26,.84)'; c.fillRect(x, y, w, h);
    c.strokeStyle = 'rgba(111,242,176,.3)'; c.lineWidth = 1; c.strokeRect(x + 4.5, y + 4.5, w - 9, h - 9);
    c.strokeStyle = 'rgba(230,238,244,.12)'; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); c.restore();
  };
  // una lámina de papel helado enmarcada, para contar algo de cerca (dibujo recibe el rectángulo de dentro)
  S.vineta = function (c, x, y, w, h, a, dibujo) {
    if (a <= 0) return;
    c.save(); c.globalAlpha = a;
    c.fillStyle = 'rgba(0,4,16,.45)'; c.fillRect(x + 8, y + 10, w, h);
    c.fillStyle = '#eef2f2'; c.fillRect(x, y, w, h);
    c.save(); c.beginPath(); c.rect(x + 10, y + 10, w - 20, h - 20); c.clip(); dibujo(x + 10, y + 10, w - 20, h - 20); c.restore();
    c.strokeStyle = '#1b2a44'; c.lineWidth = 1.5; c.strokeRect(x + 10, y + 10, w - 20, h - 20);
    c.strokeStyle = 'rgba(27,42,68,.35)'; c.lineWidth = 1; c.strokeRect(x + 4, y + 4, w - 8, h - 8);
    c.restore();
  };
  // dónde va una lámina de tamaño w × h: arriba al centro en el ordenador, sin pisar la tarjeta en el móvil
  S.sitio = function (w, h) { var W = E.W, H = E.H, s = Math.min(1, (W - 40) / w, (H * 0.48) / h); return { x: W / 2 - w * s / 2, y: W < 700 ? H * 0.1 : H * 0.07, s: s }; };
  S.destello = function (c, x, y, r, a) {
    if (a <= 0) return;
    c.save(); c.globalAlpha = a; c.globalCompositeOperation = 'lighter';
    var g = c.createRadialGradient(x, y, 0, x, y, r * 3); g.addColorStop(0, 'rgba(220,255,236,.9)'); g.addColorStop(1, 'rgba(111,242,176,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 3, 0, TAU); c.fill();
    c.fillStyle = '#f4fffa'; c.fillRect(x - r * 2.2, y - 0.6, r * 4.4, 1.2); c.fillRect(x - 0.6, y - r * 2.2, 1.2, r * 4.4);
    c.restore();
  };
  S.num = function (n) { return U.num(Math.round(n)); };
  // la paleta del momento, para pintar piezas de arte.js en vivo
  S.paleta = function () { return PA.paleta(); };
})();
