/* Thule Incognita · el arte
   La librería de dibujo del mundo, sacada de lab-c.html (el estilo C que eligió Pau: ilustración de juego, planos de color
   con su filo de luz) y hecha para colocarse en cualquier sitio. Todo dibuja en «unidades de lámina»: 900 = la altura de la
   pantalla; el horizonte está en HOR = 560. Cada pieza recibe la paleta P (mediodía polar o noche) y se pinta con el pintor,
   que da el filo de luz a lo que lo lleva (FILO). Si se toca el dibujo, se toca aquí; lab-c.html queda de referencia. */
(function () {
  'use strict';
  var TH = window.TH, TAU = Math.PI * 2;
  var A = TH.arte = { HOR: 560, BASE: 780, K: 900 };
  var HOR = A.HOR;

  /* ================================================================== herramientas */
  var semilla = 7;
  function azar() { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646; }
  function sembrar(s) { semilla = Math.max(1, Math.floor(s * 7919) % 2147483646 + 1); azar(); azar(); }
  function poli(pts, abierto) { var p = new Path2D(); pts.forEach(function (q, i) { p[i ? 'lineTo' : 'moveTo'](q[0], q[1]); }); if (!abierto) p.closePath(); return p; }
  function rect(x, y, w, h) { var p = new Path2D(); p.rect(x, y, w, h); return p; }
  function circulo(x, y, r) { var p = new Path2D(); p.arc(x, y, r, 0, TAU); return p; }
  function elipse(x, y, rx, ry, a) { var p = new Path2D(); p.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), a || 0, 0, TAU); return p; }
  function une(lista) { var p = new Path2D(); lista.forEach(function (q) { if (q) p.addPath(q); }); return p; }
  function suave(pts) {   // contorno cerrado suavizado (curvas por los puntos medios)
    var p = new Path2D(), n = pts.length, m = function (a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }, a0 = m(pts[n - 1], pts[0]);
    p.moveTo(a0[0], a0[1]);
    for (var i = 0; i < n; i++) { var q = pts[i], mm = m(q, pts[(i + 1) % n]); p.quadraticCurveTo(q[0], q[1], mm[0], mm[1]); }
    p.closePath(); return p;
  }
  function pata(pts, anchos) {   // un miembro: la línea de los huesos con su grosor en cada articulación y la punta redonda
    var izq = [], der = [], n = pts.length;
    for (var i = 0; i < n; i++) {
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = anchos[i] / 2;
      izq.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]); der.push([pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]);
    }
    return une([poli(izq.concat(der.reverse())), circulo(pts[n - 1][0], pts[n - 1][1], anchos[n - 1] / 2)]);
  }
  function escalar(p, x, y, k) { var q = new Path2D(); q.addPath(p, new DOMMatrix().translate(x, y).scale(k).translate(-x, -y)); return q; }
  function lugar(pts, x, y, s, espejo) { return pts.map(function (q) { return [x + (espejo ? -q[0] : q[0]) * s, y + q[1] * s]; }); }
  function aRGB(h) {
    if (h[0] === '#') { h = h.slice(1); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
    var m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/.exec(h); return m ? [+m[1], +m[2], +m[3]] : [255, 0, 255];
  }
  function mezcla(a, b, t) { var x = aRGB(a), y = aRGB(b); return 'rgb(' + x.map(function (v, i) { return Math.round(v + (y[i] - v) * t); }).join(',') + ')'; }
  function rgba(h, al) { var x = aRGB(h); return 'rgba(' + x[0] + ',' + x[1] + ',' + x[2] + ',' + al + ')'; }
  Object.assign(A, { azar: azar, sembrar: sembrar, poli: poli, rect: rect, circulo: circulo, elipse: elipse, une: une, suave: suave, pata: pata, escalar: escalar, lugar: lugar, mezcla: mezcla, rgba: rgba, aRGB: aRGB });

  /* ================================================================== las dos luces (de lab-c.html) */
  // la noche: luna a la derecha, nieve azul de luna, filo de luz arriba a la derecha, sombras hacia la izquierda
  A.NOCHE = { pliegue: 'rgba(0,0,20,.22)', iceberg: '#6d9fd2', icebergLuz: '#a9d6f7', icebergSombra: '#3d6aa6', icebergCueva: '#1b4479', ballenaVientre: '#2a3d5c', bruma: '#2c5a78', perro2: '#8590a6', abeto: '#1d3a40', abetoSombra: '#12272d', montMedio: '#243f69', montFalda: '#7392c2', buey: '#3a2e2c', bueySombra: '#241c1c', bueyClaro: '#9a8a76', humo: 'rgba(170,190,220,.07)', hieloSombra: '#6788b8', ribete2: '#d8463a', agua: '#0a2340', foca: '#3a4458', focaSombra: '#262d3d', focaClaro: '#58637a', parka3: '#7b4a8e', parka4: '#c98e2b',
    bloqueBrillo: 'rgba(170,235,255,.32)', bloqueLado: '#9fcdf0', espuma: 'rgba(220,240,255,.7)', pezCabeza: '#4e4448', pezClaro: '#f2b39a', buhoSombra: '#cdd8e4', buhoCara: '#ffffff', buhoMota: '#4a5466', caribuSombra: '#1f2636', caribuClaro: '#c9d3df', cuerno: '#9a8a74', casaTepeOscuro: 'rgba(0,0,0,.16)',
    montLejos: '#2b4774', montSombra: '#1d335a', montNieve: '#9cc2ea', montReguero: '#5e80b2', montLejos2: '#22395f', montNieve2: '#7fa3cf', cresta: '#a8c9ee', tierra: '#7c9dc9', tierraSombra: '#6687b6', caribu: '#3a3a4c',
    bloque: '#77a9d8', bloqueSombra: '#3e6a9c', bloqueTop: '#c6e6ff', bloqueLuz: '#a6d8ff', bloqueGrieta: '#4c7fb3', nieveTop: '#c9e2fa', soplo: '#cfe6f7', ballena: '#1b2b44', aguaBrillo: '#4fe0a6', sombraSuelo: 'rgba(16,30,62,.45)', huella: 'rgba(40,64,110,.4)',
    oso: '#d5e0e9', osoSombra: '#7f93ad', osoLejos: '#62728c', osoMedio: '#b8c8d8', oscuro: '#151322', zorro: '#e6eef6', zorroSombra: '#a9bad0', buho: '#eef3f8',
    madera: '#5b4434', maderaSombra: '#3e2f28', maderaClara: '#7a5c44', casa: '#4c3a3e', casaTepe: '#41323a', casaNieve: '#aac8ea', luz: '#ffd479', hueso: '#d7cbb0', huesoSombra: '#a39886', umiak: '#c5965c', umiakSombra: '#8a6340', pez: '#c0553a', pezPiel: '#9aa3ad',
    parka: '#c4463a', parka2: '#2f6e8f', ribete: '#f0c55c', flor: 'rgba(255,230,190,.55)', piel: '#dcc8a2', pielOscura: '#7a5a3e', cara: '#8a5a3d', iris: '#8fd8ff', lona: '#c9bfa6', lonaSombra: '#968c76',
    pista: '#5d7eae', perro: '#59647a', perroSombra: '#3d465a', perroClaro: '#dfe7f0', trineo: '#7a5236', nieve: '#9bbce4', nieveSombra: '#6a8dbe', hierba: '#8d7d5c', polvoNieve: 'rgba(220,236,255,.55)', hielo: '#5f86b8', hieloClaro: '#8db4de',
    cielo: ['#03060f', '#071631', '#0d3150', '#155066'], suelo: ['#6f90bd', '#7c9dc9', '#86a6d0'], vineta: 'rgba(0,4,20,.5)', calima: 'rgba(90,200,170,.10)',
    _filo: '#e4f4ff', _filoDx: -2.6, _filoDy: 3.2, _sombra: -1 };
  // el mediodía polar: el sol no sale, pero el horizonte del sur se enciende de rosa; la nieve, lila; sombras a la derecha
  A.MEDIODIA = { pliegue: 'rgba(40,0,40,.16)', iceberg: '#9fb8e6', icebergLuz: '#d9e4fb', icebergSombra: '#6f86c2', icebergCueva: '#3d4f96', ballenaVientre: '#2e3558', bruma: '#e9c3d2', perro2: '#9a98b2', abeto: '#3c4a66', abetoSombra: '#2b3652', montMedio: '#5f62a0', montFalda: '#b9b4dc', buey: '#4e3c3c', bueySombra: '#33282c', bueyClaro: '#c4b09c', humo: 'rgba(240,220,235,.10)', hieloSombra: '#a59ccc', ribete2: '#d8463a', agua: '#22305e', foca: '#4a4a66', focaSombra: '#35354e', focaClaro: '#6a6a88', parka3: '#7b4a8e', parka4: '#d39b2a',
    bloqueBrillo: 'rgba(245,235,255,.4)', bloqueLado: '#cbd6f2', espuma: 'rgba(255,240,245,.75)', pezCabeza: '#5e4c50', pezClaro: '#ffc2a8', buhoSombra: '#e2dbe6', buhoCara: '#ffffff', buhoMota: '#5a5068', caribuSombra: '#3a3550', caribuClaro: '#e6e0ee', cuerno: '#a08a72', casaTepeOscuro: 'rgba(40,0,30,.13)',
    montLejos: '#6c6ea8', montSombra: '#4f528a', montNieve: '#f1d4dc', montReguero: '#a39cc8', montLejos2: '#8a84b8', montNieve2: '#e8cbd8', cresta: '#e8d6e6', tierra: '#c3bde0', tierraSombra: '#aaa4d2', caribu: '#5a4e5c',
    bloque: '#a7c2e8', bloqueSombra: '#7488bf', bloqueTop: '#f6e2ea', bloqueLuz: '#d6e2fa', bloqueGrieta: '#7d8fc4', nieveTop: '#f6e6ee', soplo: '#f4e8f0', ballena: '#1d2240', aguaBrillo: '#f5a3a8', sombraSuelo: 'rgba(80,70,140,.32)', huella: 'rgba(90,80,150,.35)',
    oso: '#f3ece8', osoSombra: '#b8b0c8', osoLejos: '#9a90ac', osoMedio: '#dcd4e0', oscuro: '#1d1a2e', zorro: '#f6f0f2', zorroSombra: '#c5bdd4', buho: '#fbf6f6',
    madera: '#6a4c42', maderaSombra: '#4a3438', maderaClara: '#8a6656', casa: '#6a4f58', casaTepe: '#5c4650', casaNieve: '#ecdde9', luz: '#ffd27a', hueso: '#f0e2cc', huesoSombra: '#bfaeb0', umiak: '#dfa66a', umiakSombra: '#a0704e', pez: '#d0623e', pezPiel: '#b4b0bc',
    parka: '#d24a3d', parka2: '#2f7d96', ribete: '#f3c95e', flor: 'rgba(255,236,200,.6)', piel: '#ecd6b2', pielOscura: '#8a6646', cara: '#9a6646', iris: '#8fd8ff', lona: '#e8dccb', lonaSombra: '#b8a8a4',
    pista: '#9a94c8', perro: '#64657e', perroSombra: '#4a4a62', perroClaro: '#f3eef2', trineo: '#86583c', nieve: '#d6cfea', nieveSombra: '#aca6d4', hierba: '#9c8466', polvoNieve: 'rgba(250,240,250,.6)', hielo: '#9a9ccc', hieloClaro: '#c6c4e4',
    cielo: ['#16224d', '#34407c', '#7a6aa8', '#d98ea6', '#ffc29a'], suelo: ['#b6b0d8', '#c3bde0', '#cbc6e6'], vineta: 'rgba(20,10,40,.28)', calima: 'rgba(255,190,190,.22)',
    _filo: '#ffe0dc', _filoDx: 2.8, _filoDy: 1.6, _sombra: 1 };

  /* ================================================================== el pintor */
  // lo que lleva filo de luz: se rellena con el color aclarado y encima, recortado, el color desplazado; queda un borde de luz
  var FILO = { iceberg: 1, buey: 1, montNieve: 1, tierra: 1, bloque: 1, bloqueTop: 1, oso: 1, casaNieve: 1, nieve: 1, casa: 1, hueso: 1, umiak: 1, perro: 1, parka: 1, parka2: 1, parka3: 1, parka4: 1, montLejos: 1, ballena: 1, zorro: 1, nieveTop: 1, buho: 1, maderaClara: 1, lona: 1 };
  A.pintor = function (c, P) {
    return {
      f: function (n, p) {
        var col = P[n] || '#f0f';
        if (FILO[n] && col[0] === '#') {
          c.fillStyle = mezcla(col, P._filo, n === 'ballena' ? 0.3 : 0.42); c.fill(p);
          c.save(); c.clip(p); c.translate(P._filoDx, P._filoDy); c.fillStyle = col; c.fill(p); c.restore();
        } else { c.fillStyle = col; c.fill(p); }
      },
      fEn: function (n, p, recorte) { c.save(); c.clip(recorte); c.fillStyle = P[n] || '#f0f'; c.fill(p); c.restore(); },
      l: function (n, p, w) { c.strokeStyle = P[n] || '#f0f'; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(p); }
    };
  };

  // un montón de nieve blando: cresta clara que se funde con el suelo por abajo y por los lados (sin borde)
  A.monton = function (c, x, y, rx, ry, P) {
    c.save(); c.translate(x, y); c.scale(1, ry / rx);
    var g = c.createRadialGradient(0, -rx * 0.15, 0, 0, 0, rx); g.addColorStop(0, rgba(P.nieveTop, 0.95)); g.addColorStop(0.55, rgba(P.nieve, 0.75)); g.addColorStop(1, rgba(P.nieve, 0));
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, rx, Math.PI, 0); c.lineTo(rx, rx * 0.25); c.lineTo(-rx, rx * 0.25); c.closePath(); c.fill(); c.restore();
  };

  /* ================================================================== las montañas */
  // una cordillera a partir de sus puntos (valles y picos): el cuerpo, la cara en sombra, la nieve de las cimas y los regueros
  A.cordillera = function (c, pts, base, P, lejos) {
    var E = A.pintor(c, P), sombra = [], medio = [], nieve = [], reg = [], cornisa = new Path2D();
    for (var i = 1; i < pts.length - 1; i++) {
      if (pts[i][1] < pts[i - 1][1] && pts[i][1] < pts[i + 1][1]) {
        var a = pts[i - 1], q = pts[i], b = pts[i + 1], t = 0.34, alto = base - q[1];
        // la cara en sombra (del pico al valle de la derecha) y una arista intermedia que parte la cara en luz
        sombra.push(poli([q, b, [b[0] - 6, base], [q[0] + alto * 0.12, base]]));
        var m = [q[0] + (a[0] - q[0]) * 0.55, q[1] + (a[1] - q[1]) * 0.55];
        medio.push(poli([q, m, [m[0] + alto * 0.08, base], [q[0] + alto * 0.04, base]]));
        var L = [q[0] + (a[0] - q[0]) * t, q[1] + (a[1] - q[1]) * t], R = [q[0] + (b[0] - q[0]) * t, q[1] + (b[1] - q[1]) * t];
        nieve.push(poli([L, q, R, [R[0] - (R[0] - q[0]) * 0.35, R[1] + 7], [q[0] + 4, L[1] - 2], [L[0] + (q[0] - L[0]) * 0.4, L[1] + 8]]));
        cornisa.moveTo(L[0], L[1]); cornisa.lineTo(q[0], q[1]);
        [0.42, 0.55, 0.68].forEach(function (u, j) { var r = [q[0] + (a[0] - q[0]) * u, q[1] + (a[1] - q[1]) * u], l = (base - r[1]) * (0.35 + 0.15 * j); reg.push(poli([[r[0] - 1.5, r[1]], [r[0] + 1.5, r[1]], [r[0] + l * 0.2 + 0.6, r[1] + l], [r[0] + l * 0.2 - 0.6, r[1] + l]])); });
        [0.4, 0.6].forEach(function (u) { var r = [q[0] + (b[0] - q[0]) * u, q[1] + (b[1] - q[1]) * u], l = (base - r[1]) * 0.45; reg.push(poli([[r[0] - 1.2, r[1]], [r[0] + 1.2, r[1]], [r[0] - l * 0.12 + 0.5, r[1] + l], [r[0] - l * 0.12 - 0.5, r[1] + l]])); });
      }
    }
    var cuerpo = poli(pts);
    E.f(lejos ? 'montLejos2' : 'montLejos', cuerpo);
    c.save(); c.clip(cuerpo);
    E.f('montMedio', une(medio)); E.f('montSombra', une(sombra)); E.f('montReguero', une(reg)); E.f(lejos ? 'montNieve2' : 'montNieve', une(nieve));
    // el faldón: la nieve que se acumula al pie y se funde con la llanura (así la montaña se apoya, no flota)
    var x0 = pts[0][0], x1 = pts[pts.length - 1][0], alto2 = 34;
    var g = c.createLinearGradient(0, base - alto2, 0, base); g.addColorStop(0, rgba(P.montFalda, 0)); g.addColorStop(0.7, rgba(P.montFalda, 0.85)); g.addColorStop(1, rgba(P.montFalda, 1));
    c.fillStyle = g; c.fillRect(x0, base - alto2, x1 - x0, alto2 + 2);
    c.restore();
    E.l('montNieve', cornisa, 1.2);
    // y por debajo de la base, la misma nieve sigue un poco, para que no quede ninguna raya entre la montaña y el suelo
    var g2 = c.createLinearGradient(0, base, 0, base + 14); g2.addColorStop(0, rgba(P.montFalda, 1)); g2.addColorStop(1, rgba(P.montFalda, 0)); c.fillStyle = g2; c.fillRect(x0, base - 0.5, x1 - x0, 14.5);
  };
  // los puntos de una cordillera entre x0 y x1 (picos al azar, más altos en el medio)
  A.puntosCordillera = function (x0, x1, base, alto, s) {
    sembrar(s); var pts = [[x0, base]], x = x0, arriba = true;
    while (x < x1) { x += 40 + azar() * 70; var t = (x - x0) / (x1 - x0), h = alto * Math.pow(Math.sin(Math.PI * Math.min(1, t)), 0.5); pts.push([Math.min(x, x1), base - (arriba ? h * (0.7 + azar() * 0.3) : h * (0.25 + azar() * 0.3))]); arriba = !arriba; }
    pts.push([x1, base]); return pts;
  };

  /* ================================================================== el hielo */
  // las crestas de presión lejanas: una fila de dientes bajos
  A.crestas = function (c, x0, x1, y, alto, s, P) {
    var E = A.pintor(c, P); sembrar(s);
    var luz = [], som = [], top = [];
    for (var x = x0 + azar() * alto * 6; x < x1;) {
      // un cordón: muchos bloques apretados e inclinados, más altos en el medio; entre cordón y cordón, hielo llano
      var n = 6 + Math.floor(azar() * 14), ancho = 0;
      for (var i = 0; i < n; i++) {
        var w = alto * (0.7 + azar() * 0.9), h = alto * (0.35 + azar() * 0.65) * (0.35 + 0.65 * Math.sin(Math.PI * (i + 0.5) / n)), bx = x + ancho, g = (azar() - 0.5) * 0.9;
        var R = function (px, py) { return [bx + px * Math.cos(g) - py * Math.sin(g), y + px * Math.sin(g) + py * Math.cos(g)]; };
        var A0 = R(0, 0), B = R(w, 0), C = R(w, -h), D = R(0, -h), Cs = R(w * 0.55, -h), As = R(w * 0.55, 0);
        luz.push(poli([A0, As, Cs, D])); som.push(poli([As, B, C, Cs])); top.push(poli([D, C, [C[0] - alto * 0.12, C[1] - alto * 0.1], [D[0] - alto * 0.12, D[1] - alto * 0.1]]));
        ancho += w * (0.4 + azar() * 0.25);
      }
      x += ancho + alto * (8 + azar() * 22);
    }
    E.f('bloque', une(luz)); E.f('bloqueSombra', une(som)); E.f('nieveTop', une(top));
    // la nieve que el viento amontona contra la cresta, fundida con el hielo
    var g = c.createLinearGradient(0, y - alto * 0.5, 0, y + 2); g.addColorStop(0, rgba(P.tierra, 0)); g.addColorStop(1, rgba(P.tierra, 0.95)); c.fillStyle = g; c.fillRect(x0, y - alto * 0.5, x1 - x0, alto * 0.5 + 2);
  };
  // bloques de una cresta de presión: losas gruesas, inclinadas y apoyadas unas en otras, con su canto nevado y ventisca al pie
  A.bloques = function (c, cx, base, n, s, k, P) {
    var E = A.pintor(c, P); sembrar(s); var x0 = 1e9, x1 = -1e9;
    for (var i = 0; i < n; i++) {
      var w = (30 + azar() * 40) * k, h = (46 + azar() * 66 * (1 - Math.abs(i - (n - 1) / 2) / n)) * k, x = cx + (i - (n - 1) / 2) * 36 * k + (azar() - 0.5) * 12 * k, y = base + azar() * 6, g = (azar() - 0.5) * 0.95;
      var R = function (px, py) { return [x + px * Math.cos(g) - py * Math.sin(g), y + px * Math.sin(g) + py * Math.cos(g)]; };
      var Aa = R(-w / 2, 0), B = R(w / 2, 0), C = R(w / 2, -h), D = R(-w / 2, -h), t = 9 * k, C2 = [C[0] - t, C[1] - t * 0.7], D2 = [D[0] - t, D[1] - t * 0.7];
      var vetas = new Path2D(); [[-0.32, 0.12, -0.3, 0.8], [-0.2, 0.3, -0.16, 0.66]].forEach(function (v) { var a = R(v[0] * w, -v[1] * h), b = R(v[2] * w, -v[3] * h); vetas.moveTo(a[0], a[1]); vetas.lineTo(b[0], b[1]); });
      var grietas = new Path2D(), q0 = R((azar() - 0.2) * w * 0.4, -h * 0.85), q1 = R((azar() - 0.5) * w * 0.3, -h * 0.5), q2 = R((azar() - 0.3) * w * 0.4, -h * 0.2); grietas.moveTo(q0[0], q0[1]); grietas.lineTo(q1[0], q1[1]); grietas.lineTo(q2[0], q2[1]);
      var m = [(D2[0] + C2[0]) / 2, (D2[1] + C2[1]) / 2 - 4 * k];
      c.save(); c.beginPath(); c.rect(x - 400, y - 600, 800, base + 6 - (y - 600)); c.clip();   // nada del bloque baja del suelo
      if (g > 0) E.f('bloqueLado', poli([Aa, D, D2, [Aa[0] - t, Aa[1] - t * 0.7]]));
      E.f('bloque', poli([Aa, B, C, D])); E.f('bloqueBrillo', poli([R(-w * 0.46, -h * 0.06), R(-w * 0.3, -h * 0.06), R(-w * 0.34, -h * 0.94), R(-w * 0.46, -h * 0.94)]));
      E.f('bloqueSombra', poli([R(w * 0.08, 0), B, C, R(w * 0.08, -h)])); E.l('bloqueLuz', vetas, 1.4); E.l('bloqueGrieta', grietas, 1.1);
      E.f('bloqueTop', poli([D, C, C2, D2])); E.f('nieveTop', suave([[D[0] - 1, D[1] + 2], [C[0] + 1, C[1] + 2], [C2[0] + 1, C2[1] - 2], m, [D2[0] - 1, D2[1] - 2]]));
      c.restore();
      x0 = Math.min(x0, x - w * 0.8); x1 = Math.max(x1, x + w * 0.8);
    }
    // la nieve amontonada al pie: la forma de siempre, pero opaca del todo (Pau 02/11: antes era transparente por abajo y
    // dejaba ver la base de los bloques); arriba, nieve; abajo, del color del suelo
    sembrar(s + 3); var pts = [[x0 - 30 * k, base + 2]]; for (var u = 0; u <= 1.0001; u += 0.1) pts.push([x0 + (x1 - x0) * u, base - (8 + azar() * 14) * k * Math.sin(Math.PI * (0.1 + u * 0.8))]); pts.push([x1 + 30 * k, base + 2]);
    var pie = suave(pts.concat([[x1 + 30 * k, base + 10], [x0 - 30 * k, base + 10]])), top = base - 24 * k;
    var g = c.createLinearGradient(0, top, 0, base + 8); g.addColorStop(0, P.nieve); g.addColorStop(0.6, P.nieve); g.addColorStop(1, P.tierra); c.fillStyle = g; c.fill(pie);
  };
  // un canal de agua abierta en la banquisa, de x0 a x1 (se cierra en las puntas)
  A.canalPts = function (x0, x1, y, ancho) {
    var arriba = [], abajo = [];
    for (var x = x0; x <= x1; x += 10) {
      var t = (x - x0) / (x1 - x0), cierre = Math.pow(Math.sin(Math.PI * t), 0.35);
      arriba.push([x, y + 5 * Math.sin(x / 41) + 3 * Math.sin(x / 13) + (1 - cierre) * ancho * 0.45]);
      abajo.push([x, y + ancho + 4 * Math.sin(x / 33 + 1) - (1 - cierre) * ancho * 0.55]);
    }
    return { arriba: arriba, abajo: abajo };
  };
  A.canal = function (x0, x1, y, ancho) {
    var arriba = [], abajo = [];
    for (var x = x0; x <= x1; x += 10) {
      var t = (x - x0) / (x1 - x0), cierre = Math.pow(Math.sin(Math.PI * t), 0.35);
      arriba.push([x, y + 5 * Math.sin(x / 41) + 3 * Math.sin(x / 13) + (1 - cierre) * ancho * 0.45]);
      abajo.push([x, y + ancho + 4 * Math.sin(x / 33 + 1) - (1 - cierre) * ancho * 0.55]);
    }
    return poli(arriba.concat(abajo.reverse()));
  };
  // un lago helado: el hielo liso, con grietas blancas y nieve en el borde
  A.lagoHelado = function (c, x, y, rx, ry, s, P) {
    var E = A.pintor(c, P), g = new Path2D(); sembrar(s);
    E.f('nieveSombra', elipse(x, y + 2, rx + 8, ry + 3)); E.f('hielo', elipse(x, y, rx, ry)); E.f('hieloClaro', elipse(x - rx * 0.2, y - ry * 0.25, rx * 0.6, ry * 0.4));
    for (var i = 0; i < 5; i++) { var a = azar() * TAU, x0 = x + Math.cos(a) * rx * 0.2, y0 = y + Math.sin(a) * ry * 0.2; g.moveTo(x0, y0); g.lineTo(x0 + Math.cos(a) * rx * 0.4, y0 + Math.sin(a) * ry * 0.4); g.lineTo(x0 + Math.cos(a + 0.4) * rx * 0.7, y0 + Math.sin(a + 0.4) * ry * 0.7); }
    E.l('cresta', g, 1);
  };

  /* ================================================================== los animales */
  // la ballena de Groenlandia que respira: el lomo sin aleta dorsal (la cabeza enorme con su joroba)
  A.lomoBallena = function (x, y, k) {
    var p = new Path2D();
    p.moveTo(x - 82 * k, y + 1); p.bezierCurveTo(x - 66 * k, y - 18 * k, x - 44 * k, y - 22 * k, x - 30 * k, y - 18 * k); p.bezierCurveTo(x - 12 * k, y - 26 * k, x + 24 * k, y - 22 * k, x + 60 * k, y - 9 * k); p.quadraticCurveTo(x + 76 * k, y - 4 * k, x + 86 * k, y + 1); p.closePath();
    return p;
  };
  // la cola de la ballena al sumergirse: las aletas anchas con su muesca; sale del agua en y
  A.colaBallena = function (x, y, k) {
    var p = new Path2D(), X = function (d) { return x + d * k; }, Y = function (d) { return y + d * k; };
    p.moveTo(X(-17), Y(4)); p.bezierCurveTo(X(-12), Y(-18), X(-8), Y(-34), X(-10), Y(-46));
    p.bezierCurveTo(X(-30), Y(-50), X(-56), Y(-58), X(-74), Y(-78)); p.bezierCurveTo(X(-60), Y(-70), X(-38), Y(-66), X(-16), Y(-64));
    p.quadraticCurveTo(X(-6), Y(-63), X(0), Y(-58)); p.quadraticCurveTo(X(6), Y(-63), X(16), Y(-64));
    p.bezierCurveTo(X(38), Y(-67), X(62), Y(-72), X(78), Y(-82)); p.bezierCurveTo(X(60), Y(-60), X(34), Y(-50), X(10), Y(-46));
    p.bezierCurveTo(X(8), Y(-34), X(12), Y(-18), X(17), Y(4)); p.closePath();
    return p;
  };
  // una foca anillada tumbada junto a su agujero de respirar (mira a la derecha)
  A.foca = function (c, x, y, s, P) {
    var E = A.pintor(c, P), L = function (pts) { return lugar(pts, x, y, s); };
    E.f('agua', elipse(x - 1.65 * s, y + 3, 0.56 * s, 0.15 * s)); E.f('sombraSuelo', elipse(x - 10, y + 2, 1.4 * s, 0.11 * s));
    E.f('foca', poli(L([[-1.0, -0.08], [-1.32, -0.24], [-1.22, -0.02], [-1.34, 0.08]])));
    E.f('foca', suave(L([[-1.05, -0.08], [-0.7, -0.3], [-0.1, -0.42], [0.5, -0.36], [0.86, -0.3], [1.08, -0.18], [1.1, -0.04], [0.6, 0.02], [-0.5, 0.02]])));
    E.f('focaClaro', une([[-0.6, -0.2], [-0.3, -0.28], [0.0, -0.32], [0.3, -0.27], [-0.45, -0.1], [0.15, -0.14], [0.55, -0.2]].map(function (q) { return elipse(x + q[0] * s, y + q[1] * s, 0.05 * s, 0.032 * s); })));
    E.f('focaSombra', elipse(x + 0.2 * s, y - 0.06 * s, 0.2 * s, 0.06 * s, 0.4)); E.f('oscuro', circulo(x + 0.9 * s, y - 0.24 * s, 0.035 * s));
    var b = new Path2D(); [-0.02, 0.03].forEach(function (d) { b.moveTo(x + 1.06 * s, y - (0.16 + d) * s); b.lineTo(x + 1.3 * s, y - (0.2 + d * 3) * s); }); E.l('focaClaro', b, 0.8);
  };
  // el oso polar (mira a la izquierda, al paso): cuello largo, cabeza pequeña, la grupa más alta que la cruz, zarpas enormes
  A.oso = function (c, x, y, s, P, espejo, f, amp) {
    var E = A.pintor(c, P), L = function (pts) { return lugar(pts, x, y, s, espejo); }, X = function (d) { return x + (espejo ? -d : d) * s; }, W = f == null ? null : TAU * f;
    // una pata que camina: la cadera fija, el pie va adelante y atrás (adelante = hacia la cabeza, a la izquierda) y se levanta al volver
    var paso = function (cad, pie, d) { if (W == null) return [cad, [(cad[0] + pie[0]) / 2 + (pie[0] < cad[0] ? -2 : 2), -17], pie]; var am = amp == null ? 1 : amp, a = Math.sin(W + d) * am, sube = Math.max(0, Math.cos(W + d)) * 5 * am, px = pie[0] - a * 10; return [cad, [(cad[0] + px) / 2 - a * 2, -17 - sube * 0.4], [px, pie[1] - sube]]; };
    var zp = function (pt) { return elipse(X(pt[0] + (pt[0] < 0 ? -2 : 0)), y + (pt[1] + 0.4) * s, 11 * s, 4.6 * s); };
    var pl1 = paso([-10, -36], [0, -3], Math.PI * 0.5), pl2 = paso([36, -40], [24, -3], 0), pc1 = paso([-26, -38], [-38, -3], Math.PI * 1.5), pc2 = paso([50, -44], [46, -3], Math.PI);
    E.f('sombraSuelo', elipse(X(4), y + 1, 70 * s, 4.5 * s));
    if (W != null) { var bote = Math.sin(W * 2) * 0.8 * s * (amp == null ? 1 : amp); c.save(); c.translate(0, bote); }
    var cuerpo = suave(L([[-72, -45], [-70, -49], [-62, -54], [-55, -57], [-48, -58], [-36, -57], [-22, -60], [-6, -65], [10, -66], [26, -66], [40, -71], [54, -72], [64, -66], [69, -54], [68, -42], [62, -32], [44, -27], [20, -25], [-4, -26], [-20, -28], [-34, -33], [-46, -39], [-58, -41], [-66, -42]]));
    var unas = new Path2D(); [pc1[2], pc2[2]].forEach(function (pt) { var px = pt[0] + (pt[0] < 0 ? -2 : 0); for (var j = 0; j < 4; j++) { unas.moveTo(X(px - 9 + j * 2.4), y + (pt[1] + 0.8) * s); unas.lineTo(X(px - 10 + j * 2.4), y + (pt[1] + 2.6) * s); } });
    var pelo = new Path2D(); for (var t = -28; t < 58; t += 7) { pelo.moveTo(X(t), y - 33 * s); pelo.quadraticCurveTo(X(t + 1.5), y - 29 * s, X(t + 0.5), y - 26.5 * s); }
    var boca = new Path2D(); boca.moveTo(X(-70), y - 44.5 * s); boca.quadraticCurveTo(X(-65), y - 42 * s, X(-59), y - 43.5 * s);
    E.f('osoLejos', une([pata(L(pl1), [17 * s, 13 * s, 12 * s]), zp(pl1[2]), pata(L(pl2), [22 * s, 14 * s, 12 * s]), zp(pl2[2])]));
    E.f('oso', circulo(X(68), y - 60 * s, 3.6 * s)); E.f('oso', cuerpo);
    E.fEn('osoMedio', une([elipse(X(50), y - 50 * s, 15 * s, 19 * s, 0.3), elipse(X(-18), y - 46 * s, 11 * s, 13 * s, -0.2)]), cuerpo);
    c.save(); c.clip(cuerpo); var gb = c.createLinearGradient(0, y - 40 * s, 0, y - 24 * s); gb.addColorStop(0, rgba(P.osoSombra, 0)); gb.addColorStop(1, rgba(P.osoSombra, 0.85)); c.fillStyle = gb; c.fillRect(X(-80) - 80 * s, y - 40 * s, 240 * s, 18 * s); c.restore();
    c.save(); c.clip(cuerpo); E.l('osoMedio', pelo, 1.2); c.restore();
    E.f('oso', une([pata(L(pc1), [19 * s, 14 * s, 13 * s]), zp(pc1[2]), pata(L(pc2), [26 * s, 16 * s, 13 * s]), zp(pc2[2])]));
    E.l('oscuro', unas, 1); E.f('oso', circulo(X(-48), y - 58.5 * s, 4 * s)); E.f('osoSombra', circulo(X(-48), y - 58 * s, 1.8 * s));
    E.f('oscuro', une([elipse(X(-71), y - 47.5 * s, 3 * s, 2.4 * s), circulo(X(-58), y - 52.5 * s, 1.5 * s)])); E.l('oscuro', boca, 1.2);
    if (W != null) c.restore();
    return [X(-72), y - 47 * s];
  };
  // un zorro ártico de puntillas (mira a la izquierda)
  A.zorro = function (c, x, y, s, P, f, amp) {
    var E = A.pintor(c, P), L = function (pts) { return lugar(pts, x, y, s, true); }, W = f == null ? null : TAU * f;
    var pz = function (cad, pie, d) { if (W == null) return [cad, [(cad[0] + pie[0]) / 2, -0.24], pie]; var am = amp == null ? 1 : amp, a = Math.sin(W + d) * am, sube = Math.max(0, Math.cos(W + d)) * 0.1 * am; return [cad, [cad[0] + a * 0.1, -0.26 - sube * 0.5], [pie[0] + a * 0.2, pie[1] - sube]]; };
    E.f('sombraSuelo', elipse(x - 0.1 * s, y + 1, 1.0 * s, 0.07 * s));
    E.f('zorroSombra', une([pata(L(pz([0.3, -0.5], [0.3, -0.02], Math.PI)), [0.1 * s, 0.06 * s, 0.055 * s]), pata(L(pz([-0.3, -0.5], [-0.36, -0.02], 0)), [0.12 * s, 0.06 * s, 0.055 * s])]));
    E.f('zorro', suave(L([[-0.55, -0.62], [-1.0, -0.5], [-1.32, -0.3], [-1.2, -0.12], [-0.8, -0.3], [-0.55, -0.45]])));
    E.f('zorro', une([suave(L([[-0.6, -0.66], [0.0, -0.8], [0.5, -0.78], [0.66, -0.6], [0.5, -0.46], [-0.1, -0.44], [-0.6, -0.46]])), elipse(x - 0.78 * s, y - 0.86 * s, 0.2 * s, 0.15 * s), elipse(x - 0.96 * s, y - 0.8 * s, 0.13 * s, 0.06 * s), poli(L([[0.66, -0.98], [0.7, -1.16], [0.8, -0.98]])), poli(L([[0.78, -0.98], [0.86, -1.14], [0.9, -0.94]])),
      pata(L(pz([0.4, -0.5], [0.42, 0], 0)), [0.11 * s, 0.07 * s, 0.06 * s]), pata(L(pz([-0.4, -0.5], [-0.44, 0], Math.PI)), [0.13 * s, 0.07 * s, 0.06 * s])]));
    E.f('oscuro', une([circulo(x - 0.84 * s, y - 0.9 * s, 0.025 * s), circulo(x - 1.08 * s, y - 0.81 * s, 0.03 * s)]));
  };
  // un búho nival posado: cabeza ancha sin orejas, ojos amarillos, motas, patas emplumadas
  A.buho = function (c, x, y, s, P, op) {
    op = op || {}; var E = A.pintor(c, P), L = function (pts) { return lugar(pts, x, y, s); }, gx = (op.giro || 0) * 0.14 * s, oj = op.ojos == null ? 1 : op.ojos;
    E.f('buho', suave(L([[-0.32, -0.05], [-0.42, -0.5], [-0.38, -1.0], [-0.42, -1.3], [-0.36, -1.62], [0.0, -1.76], [0.36, -1.62], [0.42, -1.3], [0.38, -1.0], [0.44, -0.5], [0.34, -0.05]])));
    E.f('buhoSombra', suave(L([[0.16, -1.12], [0.44, -0.9], [0.5, -0.4], [0.38, -0.1], [0.2, -0.3]]))); E.f('buhoCara', elipse(x + gx, y - 1.36 * s, 0.32 * s - Math.abs(gx) * 0.6, 0.24 * s));
    [[0.18, -0.62], [-0.16, -0.5], [0.26, -0.95], [-0.08, -0.82], [0.06, -0.4], [0.3, -0.6], [-0.26, -0.7], [0.14, -1.1]].forEach(function (q) { var p = new Path2D(); p.moveTo(x + (q[0] - 0.06) * s, y + q[1] * s); p.quadraticCurveTo(x + q[0] * s, y + (q[1] + 0.06) * s, x + (q[0] + 0.06) * s, y + q[1] * s); E.l('buhoMota', p, Math.max(1, s * 0.06)); });
    E.f('buho', une([elipse(x - 0.12 * s, y - 0.02 * s, 0.1 * s, 0.05 * s), elipse(x + 0.12 * s, y - 0.02 * s, 0.1 * s, 0.05 * s)]));
    if (oj > 0.2) { E.f('ribete', une([elipse(x - 0.14 * s + gx, y - 1.4 * s, 0.075 * s, 0.075 * s * oj), elipse(x + 0.14 * s + gx, y - 1.4 * s, 0.075 * s, 0.075 * s * oj)])); E.f('oscuro', une([elipse(x - 0.14 * s + gx * 1.2, y - 1.4 * s, 0.035 * s, 0.035 * s * oj), elipse(x + 0.14 * s + gx * 1.2, y - 1.4 * s, 0.035 * s, 0.035 * s * oj)])); }
    else { var pa = new Path2D(); [-0.14, 0.14].forEach(function (d) { pa.moveTo(x + (d - 0.07) * s + gx, y - 1.4 * s); pa.quadraticCurveTo(x + d * s + gx, y - 1.36 * s, x + (d + 0.07) * s + gx, y - 1.4 * s); }); E.l('oscuro', pa, Math.max(1, s * 0.03)); }
    E.f('oscuro', poli([[x - 0.04 * s + gx * 1.3, y - 1.32 * s], [x + 0.04 * s + gx * 1.3, y - 1.32 * s], [x + gx * 1.3, y - 1.22 * s]]));
  };
  // un caribú: pecho hondo, crin blanca, rabo blanco y la cornamenta grande (pasta = con la cabeza baja)
  A.caribu = function (c, x, y, s, pasta, P, espejo) {
    var kp = +pasta || 0, E = A.pintor(c, P), L = function (pts) { return lugar(pts, x, y, s, espejo); }, X = function (d) { return x + (espejo ? -d : d) * s; }, cab = [0.86 - 0.12 * kp, -1.32 + 0.87 * kp];
    var cuernos = new Path2D();
    [[0, 0], [0.07, 0.03]].forEach(function (d) {
      var b = [cab[0] - 0.08 + d[0], cab[1] - 0.1 + d[1]];
      cuernos.moveTo(X(b[0]), y + b[1] * s); cuernos.bezierCurveTo(X(b[0] - 0.5), y + (b[1] - 0.3) * s, X(b[0] - 0.4), y + (b[1] - 0.95) * s, X(b[0] + 0.05), y + (b[1] - 1.05) * s);
      [[0.35, -0.4, -0.16], [0.62, -0.38, -0.22], [0.86, -0.1, -0.2]].forEach(function (t) { var px = b[0] - 0.45 * t[0], py = b[1] - 1.0 * t[0]; cuernos.moveTo(X(px), y + py * s); cuernos.lineTo(X(px + t[2]), y + (py + t[1] * 0.4) * s); });
      cuernos.moveTo(X(b[0] - 0.05), y + (b[1] - 0.12) * s); cuernos.quadraticCurveTo(X(b[0] + 0.12), y + (b[1] - 0.3) * s, X(b[0] + 0.2), y + (b[1] - 0.2) * s);
    });
    var med = [0.62 + 0.04 * kp, -1.2 + 0.42 * kp], cuello = pata(L([[0.42, -0.98], med, [cab[0] - 0.06, cab[1] + 0.02]]), [0.3 * s, 0.2 * s, 0.13 * s]);
    E.f('sombraSuelo', elipse(x, y + 1, 0.8 * s, 0.07 * s));
    E.f('caribuSombra', une([pata(L([[-0.36, -0.8], [-0.34, -0.42], [-0.36, 0]]), [Math.max(1.6, 0.14 * s), Math.max(1.2, 0.075 * s), Math.max(1.1, 0.06 * s)]), pata(L([[0.24, -0.8], [0.22, -0.4], [0.26, 0]]), [Math.max(1.6, 0.14 * s), Math.max(1.2, 0.075 * s), Math.max(1.1, 0.06 * s)])]));
    E.f('caribu', une([suave(L([[-0.62, -0.92], [-0.3, -1.06], [0.12, -1.06], [0.38, -1.14], [0.56, -1.0], [0.54, -0.78], [0.2, -0.7], [-0.3, -0.72], [-0.6, -0.76]])), cuello, elipse(X(cab[0]), y + cab[1] * s, 0.17 * s, 0.09 * s, (0.45 + 0.65 * kp) * (espejo ? -1 : 1)),
      pata(L([[-0.48, -0.8], [-0.52, -0.42], [-0.48, 0]]), [Math.max(1.8, 0.16 * s), Math.max(1.4, 0.085 * s), Math.max(1.3, 0.07 * s)]), pata(L([[0.36, -0.8], [0.38, -0.4], [0.4, 0]]), [Math.max(1.8, 0.15 * s), Math.max(1.4, 0.085 * s), Math.max(1.3, 0.07 * s)])]));
    E.f('caribuClaro', une([elipse(X((0.42 + med[0]) / 2 + 0.02), y + ((-0.98 + med[1]) / 2 + 0.06) * s, 0.09 * s, 0.13 * s, (0.5 - 0.6 * kp) * (espejo ? -1 : 1)), elipse(X(-0.62), y - 0.9 * s, 0.07 * s, 0.09 * s), elipse(X(-0.1), y - 0.75 * s, 0.4 * s, 0.05 * s)]));
    E.l('cuerno', cuernos, Math.max(1, s * 0.08));
  };

  /* ================================================================== los perros */
  // un husky al galope (mira a la derecha); s = altura a la cruz, f = fase de la zancada
  A.perroGalope = function (c, x, y, s, f, P, arnes, amp) {
    var E = A.pintor(c, P), L = function (pts) { return lugar(pts, x, y, s); }, am = amp == null ? 0.85 : amp;
    function pierna(hx, hy, a, dobla, del) {
      var k = [hx + Math.sin(a) * 0.38, hy + Math.cos(a) * 0.38], p = [k[0] + Math.sin(a + dobla) * 0.4, Math.min(0, k[1] + Math.cos(a + dobla) * 0.4)];
      return pata(L([[hx, hy], k, p]), [(del ? 0.19 : 0.21) * s, 0.11 * s, 0.085 * s]);
    }
    var w = TAU * f, cola = new Path2D(); cola.moveTo(x - 0.58 * s, y - 0.96 * s); cola.bezierCurveTo(x - 0.86 * s, y - 1.2 * s, x - 0.78 * s, y - 1.5 * s, x - 0.46 * s, y - 1.3 * s);
    E.f('perroSombra', une([pierna(0.36, -0.82, am * Math.sin(w + 0.6), -0.8 * am / 0.85, 1), pierna(-0.4, -0.84, am * Math.sin(w + Math.PI + 0.6), 0.7 * am / 0.85)]));
    E.l('perro', cola, 0.13 * s);
    E.f('perro', une([suave(L([[-0.66, -0.96], [-0.2, -1.04], [0.3, -1.06], [0.56, -1.1], [0.66, -0.9], [0.5, -0.66], [0.1, -0.68], [-0.4, -0.66], [-0.66, -0.74]])), poli(L([[0.42, -1.04], [0.66, -1.26], [0.86, -1.14], [0.64, -0.86]])), elipse(x + 0.8 * s, y - 1.2 * s, 0.2 * s, 0.15 * s), elipse(x + 1.0 * s, y - 1.13 * s, 0.14 * s, 0.065 * s), poli(L([[0.66, -1.28], [0.68, -1.52], [0.8, -1.3]])), poli(L([[0.76, -1.29], [0.83, -1.5], [0.9, -1.26]]))]));
    E.f('perroClaro', une([suave(L([[-0.5, -0.72], [0.1, -0.7], [0.5, -0.7], [0.62, -0.88], [0.4, -0.8], [-0.2, -0.8]])), elipse(x + 0.94 * s, y - 1.11 * s, 0.16 * s, 0.06 * s), elipse(x + 0.82 * s, y - 1.12 * s, 0.1 * s, 0.07 * s)]));
    if (arnes !== false) E.f('ribete2', une([pata(L([[0.48, -1.08], [0.42, -0.72]]), [0.07 * s, 0.07 * s]), pata(L([[0.48, -1.0], [-0.1, -1.03]]), [0.06 * s, 0.06 * s])]));
    E.f('perro', une([pierna(0.46, -0.82, am * Math.sin(w), -0.8 * am / 0.85, 1), pierna(-0.3, -0.84, am * Math.sin(w + Math.PI), 0.7 * am / 0.85)]));
    E.f('oscuro', une([circulo(x + 0.86 * s, y - 1.24 * s, 0.03 * s), circulo(x + 1.13 * s, y - 1.15 * s, 0.035 * s)]));
  };
  // un husky sentado (el compañero), mirando a la izquierda: máscara, ojos azules y la cola enroscada delante
  A.huskySentado = function (c, x, y, s, P, op) {
    op = op || {}; var E = A.pintor(c, P), L = function (pts) { return lugar(pts, x, y, s); }, au = op.aulla || 0;
    var cuerpo = suave(L([[0.5, -0.02], [0.56, -0.22], [0.54, -0.44], [0.42, -0.62], [0.24, -0.72], [0.08, -0.86], [-0.08, -0.94], [-0.22, -0.88], [-0.3, -0.72], [-0.33, -0.5], [-0.28, -0.28], [-0.22, -0.04], [0.1, -0.02]]));
    var cabeza = suave(L([[-0.06, -1.0], [-0.16, -1.12], [-0.32, -1.13], [-0.43, -1.04], [-0.6, -0.99], [-0.62, -0.92], [-0.46, -0.86], [-0.26, -0.84], [-0.1, -0.9]]));
    E.f('sombraSuelo', elipse(x + 0.1 * s, y + 1, 0.7 * s, 0.08 * s));
    E.f('perro', cuerpo); E.fEn('perroSombra', suave(L([[0.42, -0.62], [0.24, -0.72], [0.08, -0.86], [-0.08, -0.94], [-0.02, -0.76], [0.2, -0.6], [0.4, -0.5]])), cuerpo);
    E.f('perro', suave(L([[0.46, -0.06], [0.52, -0.3], [0.42, -0.52], [0.24, -0.54], [0.14, -0.36], [0.2, -0.08]])));
    E.f('perro', une([suave(L([[-0.3, -0.5], [-0.2, -0.5], [-0.19, -0.04], [-0.31, -0.04]])), suave(L([[-0.15, -0.5], [-0.05, -0.5], [-0.04, -0.04], [-0.16, -0.04]]))]));
    E.f('perroClaro', une([suave(L([[-0.3, -0.74], [-0.14, -0.86], [-0.08, -0.6], [-0.16, -0.3], [-0.28, -0.32]])), elipse(x - 0.25 * s, y - 0.04 * s, 0.075 * s, 0.035 * s), elipse(x - 0.1 * s, y - 0.04 * s, 0.075 * s, 0.035 * s), elipse(x + 0.3 * s, y - 0.04 * s, 0.13 * s, 0.04 * s)]));
    E.f('perro', suave(L([[0.5, -0.1], [0.64, -0.02], [0.56, 0.05], [0.2, 0.06], [-0.18, 0.04], [-0.04, -0.02], [0.24, -0.04], [0.44, -0.04]]))); E.f('perroClaro', suave(L([[-0.18, 0.04], [-0.02, -0.02], [0.06, 0.04]])));
    // la cabeza gira sobre el cuello: al aullar, el hocico sube
    c.save(); var px = x - 0.12 * s, py = y - 0.9 * s; c.translate(px, py); c.rotate(au * 0.8); c.translate(-px, -py);
    E.f('perro', cabeza); E.fEn('perroSombra', suave(L([[-0.06, -1.0], [-0.16, -1.12], [-0.32, -1.13], [-0.42, -1.05], [-0.34, -1.02], [-0.22, -1.04], [-0.1, -0.96]])), cabeza);
    E.f('perro', une([poli(L([[-0.1, -1.08], [-0.04, -1.34], [0.04, -1.04]])), poli(L([[-0.25, -1.11], [-0.22, -1.36], [-0.13, -1.1]]))]));
    E.f('perroClaro', une([poli(L([[-0.07, -1.09], [-0.04, -1.26], [0.0, -1.07]])), poli(L([[-0.22, -1.12], [-0.21, -1.28], [-0.16, -1.11]]))]));
    E.f('perroClaro', une([suave(L([[-0.24, -0.96], [-0.44, -1.0], [-0.6, -0.97], [-0.6, -0.91], [-0.44, -0.87], [-0.26, -0.86]])), elipse(x - 0.3 * s, y - 1.05 * s, 0.045 * s, 0.022 * s, -0.2)]));
    if (au > 0.3) E.f('oscuro', elipse(x - 0.5 * s, y - 0.9 * s, 0.07 * s, 0.03 * s * au, -0.1));
    E.f('iris', circulo(x - 0.33 * s, y - 1.02 * s, 0.034 * s)); E.f('oscuro', une([circulo(x - 0.335 * s, y - 1.02 * s, 0.015 * s), elipse(x - 0.6 * s, y - 0.965 * s, 0.035 * s, 0.028 * s)]));
    if (au < 0.3) { var b = new Path2D(); b.moveTo(x - 0.58 * s, y - 0.91 * s); b.quadraticCurveTo(x - 0.5 * s, y - 0.885 * s, x - 0.44 * s, y - 0.9 * s); E.l('oscuro', b, Math.max(1, s * 0.015)); }
    c.restore();
    // dónde tiene la nariz (para el vaho del aliento)
    var a2 = au * 0.8, nx = -0.6 * s + 0.12 * s, ny = -0.96 * s + 0.9 * s;
    return [px + nx * Math.cos(a2) - ny * Math.sin(a2), py + nx * Math.sin(a2) + ny * Math.cos(a2)];
  };
  // un perro dormido enroscado en la nieve (la cola le tapa el hocico)
  A.perroDormido = function (c, x, y, s, P, claro) {
    var E = A.pintor(c, P), L = function (pts) { return lugar(pts, x, y, s); };
    E.f('sombraSuelo', elipse(x + 0.05 * s, y + 1, 0.7 * s, 0.08 * s));
    var lomo = suave(L([[-0.6, 0], [-0.64, -0.2], [-0.46, -0.42], [-0.1, -0.5], [0.26, -0.44], [0.46, -0.3], [0.5, -0.1], [0.4, 0]]));
    E.f(claro ? 'perro2' : 'perro', lomo);
    if (!claro) E.fEn('perroSombra', suave(L([[-0.5, -0.36], [-0.1, -0.5], [0.26, -0.44], [0.1, -0.34], [-0.3, -0.3]])), lomo);
    E.f('perroClaro', suave(L([[-0.56, -0.02], [-0.3, -0.14], [0.1, -0.14], [0.4, -0.06], [0.36, 0], [-0.5, 0.01]])));
    // la cabeza, apoyada sobre las patas delanteras, con las orejas de punta
    E.f(claro ? 'perro2' : 'perro', une([elipse(x + 0.46 * s, y - 0.14 * s, 0.2 * s, 0.13 * s), poli(L([[0.36, -0.22], [0.4, -0.38], [0.47, -0.22]])), poli(L([[0.46, -0.22], [0.52, -0.36], [0.56, -0.2]]))]));
    E.f('perroClaro', elipse(x + 0.6 * s, y - 0.1 * s, 0.11 * s, 0.06 * s)); E.f('oscuro', une([circulo(x + 0.69 * s, y - 0.11 * s, 0.025 * s), elipse(x + 0.48 * s, y - 0.17 * s, 0.03 * s, 0.006 * s)]));
    // la cola enroscada por encima, con la punta clara
    E.f(claro ? 'perro2' : 'perro', suave(L([[-0.58, -0.1], [-0.7, -0.3], [-0.5, -0.5], [-0.2, -0.56], [0.06, -0.5], [-0.2, -0.46], [-0.46, -0.34]]))); E.f('perroClaro', suave(L([[0.06, -0.5], [-0.08, -0.54], [-0.12, -0.47]])));
    E.f('nieveTop', elipse(x - 0.1 * s, y - 0.52 * s, 0.22 * s, 0.04 * s));
  };

  /* ================================================================== la gente */
  // una persona con parka iñupiaq (atikłuk) estampada, mirando a la derecha; s = altura; color = 'parka', 'parka2'…
  A.persona = function (c, x, y, s, color, P, op) {
    op = op || {}; var E = A.pintor(c, P), L = function (pts) { return lugar(pts, x, y, s); };
    var rayos = []; for (var i = 0; i < 32; i++) { var a = i / 32 * TAU, r = (i % 2 ? 0.118 : 0.152); rayos.push([x + Math.cos(a) * r * s, y - 0.86 * s + Math.sin(a) * r * s]); }
    var dentro = []; for (i = 0; i < 24; i++) { var a2 = i / 24 * TAU, rr = (i % 2 ? 0.1 : 0.122); dentro.push([x + Math.cos(a2) * rr * s, y - 0.86 * s + Math.sin(a2) * rr * s]); }
    var parka = suave(L([[-0.16, -0.75], [0.16, -0.75], [0.21, -0.45], [0.27, -0.21], [-0.27, -0.21], [-0.21, -0.45]]));
    var flores = []; for (var fy = -0.72; fy < -0.27; fy += 0.07) for (var fx = -0.26; fx < 0.27; fx += 0.07) flores.push(circulo(x + (fx + (Math.round(fy * 100) % 2 ? 0.035 : 0)) * s, y + fy * s, 0.011 * s));
    var dibujo = []; for (fx = -0.25; fx < 0.25; fx += 0.06) dibujo.push(poli([[x + fx * s, y - 0.235 * s], [x + (fx + 0.03) * s, y - 0.262 * s], [x + (fx + 0.06) * s, y - 0.235 * s], [x + (fx + 0.03) * s, y - 0.208 * s]]));
    if (!op.sinPiernas) { E.f('sombraSuelo', elipse(x, y + 1, 0.3 * s, 0.04 * s)); E.f('oscuro', une([rect(x - 0.12 * s, y - 0.22 * s, 0.1 * s, 0.17 * s), rect(x + 0.02 * s, y - 0.22 * s, 0.1 * s, 0.17 * s)])); }
    E.f(color, parka); E.fEn('flor', une(flores), parka); E.fEn('pliegue', poli(L([[0.04, -0.78], [0.3, -0.78], [0.3, -0.18], [0.1, -0.18]])), parka);
    var costura = new Path2D(); costura.moveTo(x, y - 0.74 * s); costura.lineTo(x - 0.01 * s, y - 0.28 * s); E.fEn('pliegue', une([elipse(x - 0.12 * s, y - 0.5 * s, 0.02 * s, 0.2 * s)]), parka); E.f('ribete', poli(L([[-0.265, -0.27], [0.265, -0.27], [0.272, -0.2], [-0.272, -0.2]]))); E.f('oscuro', une(dibujo));
    var bal = op.balanceo || 0, mano;
    if (op.brazo !== 'abajo') { E.f(color, pata(L([[0.12, -0.7], [0.23, -0.5], [0.22, -0.36]]), [0.11 * s, 0.095 * s, 0.085 * s])); mano = [x + 0.22 * s, y - 0.34 * s]; }
    else { var mx = 0.17 + Math.sin(bal) * 0.12, my = -0.3 - (1 - Math.cos(bal)) * 0.1; E.f(color, pata(L([[0.12, -0.7], [0.15 + Math.sin(bal) * 0.06, -0.5], [mx, my]]), [0.11 * s, 0.095 * s, 0.085 * s])); mano = [x + mx * s, y + my * s]; }
    E.fEn('pliegue', pata(L([[0.12, -0.7], [0.18, -0.5]]), [0.05 * s, 0.04 * s]), parka);
    E.f('pielOscura', circulo(mano[0], mano[1], 0.055 * s)); E.f('piel', elipse(mano[0] - 0.01 * s, mano[1] + 0.03 * s, 0.05 * s, 0.018 * s));   // la manopla con su puño de piel
    if (!op.sinPiernas) { E.f('piel', une([elipse(x - 0.07 * s, y - 0.035 * s, 0.09 * s, 0.045 * s), elipse(x + 0.09 * s, y - 0.035 * s, 0.09 * s, 0.045 * s)])); E.f('ribete2', une([rect(x - 0.15 * s, y - 0.07 * s, 0.16 * s, 0.012 * s), rect(x + 0.01 * s, y - 0.07 * s, 0.16 * s, 0.012 * s)])); }
    E.f('piel', poli(rayos)); var mech = new Path2D(); for (i = 0; i < 26; i++) { var am = i / 26 * TAU; mech.moveTo(x + Math.cos(am) * 0.1 * s, y - 0.86 * s + Math.sin(am) * 0.1 * s); mech.lineTo(x + Math.cos(am + 0.05) * 0.168 * s, y - 0.86 * s + Math.sin(am + 0.05) * 0.168 * s); } E.l('pielOscura', mech, Math.max(0.6, s * 0.006)); E.f('pielOscura', poli(dentro)); E.f('oscuro', circulo(x + 0.005 * s, y - 0.86 * s, 0.098 * s)); E.f('cara', elipse(x + 0.014 * s, y - 0.857 * s, 0.062 * s, 0.074 * s));
    E.f('oscuro', une([circulo(x - 0.008 * s, y - 0.866 * s, 0.009 * s), circulo(x + 0.036 * s, y - 0.866 * s, 0.009 * s)]));
  };

  /* ================================================================== lo construido */
  // una casa de turba iñupiat (semienterrada): montículo de tepes, nieve encima, túnel de entrada con costillas de ballena,
  // claraboya de tripa encendida, chimenea, arpón y remo apoyados. Devuelve dónde están sus luces y su chimenea.
  A.casaTurba = function (c, x, y, w, h, s, P) {
    var E = A.pintor(c, P); sembrar(s);
    function Pt(t, hh, ww, xx) { return [xx - ww / 2 + ww * t, y - hh * Math.pow(Math.sin(Math.PI * t), 0.72) * (1 + 0.05 * Math.sin(t * 13 + s))]; }
    var monte = [], nieve = [], tunel = [], tnieve = [], t;
    for (t = 0; t <= 1.0001; t += 0.05) monte.push(Pt(t, h, w, x));
    for (t = 0.1; t <= 0.9; t += 0.04) nieve.push(Pt(t, h, w, x));
    for (t = 0.9; t >= 0.1; t -= 0.04) { var q = Pt(t, h, w, x); nieve.push([q[0], q[1] + h * (0.26 + 0.12 * Math.sin(t * 9 + s)) * Math.sin(Math.PI * t)]); }
    var tx = x - w * 0.5 - 10, tw = w * 0.42, th = h * 0.42;
    for (t = 0; t <= 1.0001; t += 0.1) tunel.push(Pt(t, th, tw, tx));
    for (t = 0.15; t <= 0.85; t += 0.1) tnieve.push(Pt(t, th, tw, tx)); for (t = 0.85; t >= 0.15; t -= 0.1) { var r = Pt(t, th, tw, tx); tnieve.push([r[0], r[1] + th * 0.32 * Math.sin(Math.PI * t)]); }
    var cx = x + w * 0.06, cy = y - h * 0.98, kc = w / 160, px = tx - tw * 0.42, kb = w / 250;
    var puerta = new Path2D(); puerta.moveTo(px - 7, y); puerta.lineTo(px - 7, y - 10); puerta.quadraticCurveTo(px, y - 19, px + 7, y - 10); puerta.lineTo(px + 7, y); puerta.closePath();
    // los tepes: bloques de turba irregulares, con tonos distintos y hierba seca entre ellos
    var tepes = new Path2D(), filas = [0.12, 0.31, 0.5, 0.68, 0.84], juntas = [], oscuros = [], matas = new Path2D();
    var ond = function (u, rr) { return Math.sin(u * 23 + rr * 1.7 + s) * 0.025; };
    sembrar(s + 5);
    filas.forEach(function (f, rr) { for (var u = 0.06; u <= 0.94; u += 0.02) { var q2 = Pt(u, h * (f + ond(u, rr)), w * 0.98, x); tepes[u === 0.06 ? 'moveTo' : 'lineTo'](q2[0], q2[1]); }
      var js = []; if (rr < filas.length - 1) for (var j = 0.08 + azar() * 0.06; j < 0.9; j += 0.07 + azar() * 0.08) { js.push(j); var q0 = Pt(j, h * (f + ond(j, rr)), w * 0.98, x), q1 = Pt(j + (azar() - 0.5) * 0.02, h * (filas[rr + 1] + ond(j, rr + 1)), w * 0.98, x); tepes.moveTo(q0[0], q0[1] - 1); tepes.lineTo(q1[0], q1[1] + 1); }
      juntas.push(js); });
    juntas.forEach(function (js, rr) { js.forEach(function (j) { if (azar() < 0.45) { var q3 = Pt(j, h * filas[rr], w * 0.98, x); for (var m2 = 0; m2 < 3; m2++) { matas.moveTo(q3[0] + m2 * 2 - 2, q3[1]); matas.lineTo(q3[0] + m2 * 3 - 4, q3[1] - 4 - azar() * 4); } } }); });
    sembrar(s + 11); filas.forEach(function (f, rr) { if (rr < filas.length - 1) for (var j = 0.1 + (rr % 2) * 0.05; j < 0.82; j += 0.1) if (azar() < 0.4) { var a = Pt(j, h * f, w * 0.98, x), b = Pt(j + 0.1, h * f, w * 0.98, x), c2 = Pt(j + 0.1, h * filas[rr + 1], w * 0.98, x), d = Pt(j, h * filas[rr + 1], w * 0.98, x); oscuros.push(poli([a, b, c2, d])); } });
    var costillas = new Path2D(); [12, 17].forEach(function (rr) { costillas.moveTo(px - rr * 0.62, y); costillas.quadraticCurveTo(px - rr * 0.7, y - rr * 1.6, px, y - rr * 1.3); costillas.quadraticCurveTo(px + rr * 0.7, y - rr * 1.6, px + rr * 0.62, y); });
    var marco = new Path2D(); marco.moveTo(cx, cy - 1); marco.lineTo(cx, cy + 8 * kc); marco.moveTo(cx - 12 * kc, cy + 4 * kc); marco.lineTo(cx + 12 * kc, cy + 2.5 * kc);
    var arpon = new Path2D(), ax = x + w * 0.46; arpon.moveTo(ax, y - 2); arpon.lineTo(ax - w * 0.1, y - h * 1.18); arpon.moveTo(ax + w * 0.07, y - 2); arpon.lineTo(ax + w * 0.02, y - h * 0.95);
    var palos = new Path2D(); palos.moveTo(x + w * 0.3, y - h * 0.62); palos.lineTo(x + w * 0.38, y - h * 1.3); palos.moveTo(x + w * 0.34, y - h * 0.55); palos.lineTo(x + w * 0.46, y - h * 1.16);
    E.f('casa', poli(tunel)); E.f('casaNieve', poli(tnieve)); E.f('luz', puerta); E.l('hueso', costillas, 2.6);
    E.f('casa', poli(monte)); E.f('casaTepeOscuro', une(oscuros)); E.l('casaTepe', tepes, 1.1); E.l('hierba', matas, 1);
    E.f('casaNieve', poli(nieve)); A.monton(c, x + w * 0.47, y + 2, w * 0.2, h * 0.16, P);
    // los carámbanos que cuelgan del borde de la nieve, en la cara que da a la luz de la casa
    sembrar(s + 17); var car = []; for (var u = 0.22; u < 0.8; u += 0.035 + azar() * 0.03) { var q4 = Pt(u, h, w, x), yb = q4[1] + h * (0.26 + 0.12 * Math.sin(u * 9 + s)) * Math.sin(Math.PI * u), lc = (3 + azar() * 7) * kc; car.push(poli([[q4[0] - 1.6 * kc, yb - 1], [q4[0] + 1.6 * kc, yb - 1], [q4[0], yb + lc]])); }
    E.f('hieloClaro', une(car));
    // la madera de deriva que asoma bajo la turba (el armazón de la casa) y unas piedras al pie
    var vigas = new Path2D(); [0.18, 0.82].forEach(function (u) { var q5 = Pt(u, h * 0.2, w, x); vigas.moveTo(q5[0] - 6 * kc, q5[1] + 2); vigas.lineTo(q5[0] + 6 * kc, q5[1] - 4 * kc); }); E.l('maderaClara', vigas, 3 * kc); E.l('madera', palos, 3); E.f('maderaSombra', rect(x - w * 0.18, y - h * 1.12, 5 * kc, 16 * kc));
    E.f('nieveTop', une([rect(px - 34 * kb, y - 11 * kb, 15 * kb, 11 * kb), rect(px - 50 * kb, y - 11 * kb, 15 * kb, 11 * kb), rect(px - 43 * kb, y - 21 * kb, 15 * kb, 10 * kb)]));
    E.f('luz', poli([[cx - 13 * kc, cy + 2], [cx + 13 * kc, cy - 1], [cx + 12 * kc, cy + 6 * kc], [cx - 12 * kc, cy + 9 * kc]])); E.l('maderaSombra', marco, 1.2);
    E.l('madera', arpon, 2.2); E.f('hueso', une([poli([[ax - w * 0.1 - 2.5, y - h * 1.16], [ax - w * 0.1 - 1, y - h * 1.32], [ax - w * 0.1 + 2.5, y - h * 1.17]]), elipse(ax + w * 0.02, y - h * 0.95 - 9 * kc, 4 * kc, 10 * kc, -0.08)]));
    return { claraboya: [cx, cy + 4], puerta: [px, y], chimenea: [x - w * 0.18 + 2.5 * kc, y - h * 1.12] };
  };
  // el arco de las mandíbulas de ballena (dos huesos que se cruzan arriba), con su cara en sombra y grietas
  A.arco = function (c, x, y, h, P) {
    var E = A.pintor(c, P), kk = h / 178;
    function cinta(sg, desde, hasta) {
      var izq = [], der = [], a = [x + sg * 44 * kk, y], cc = [x + sg * 56 * kk, y - h * 0.72], b = [x - sg * 4, y - h];
      for (var t = 0; t <= 1.0001; t += 0.05) {
        var u = 1 - t, px = u * u * a[0] + 2 * u * t * cc[0] + t * t * b[0], py = u * u * a[1] + 2 * u * t * cc[1] + t * t * b[1];
        var dx = 2 * u * (cc[0] - a[0]) + 2 * t * (b[0] - cc[0]), dy = 2 * u * (cc[1] - a[1]) + 2 * t * (b[1] - cc[1]), l = Math.hypot(dx, dy), w = (14 - 8 * t) * kk / 2;
        izq.push([px + dy / l * w * desde, py - dx / l * w * desde]); der.push([px + dy / l * w * hasta, py - dx / l * w * hasta]);
      }
      return poli(izq.concat(der.reverse()));
    }
    var grietas = new Path2D(); [[-1, 0.3], [-1, 0.62], [1, 0.45], [1, 0.8]].forEach(function (g) { var gy = y - h * g[1], gx = x + g[0] * (50 - 30 * g[1]) * kk; grietas.moveTo(gx - 3, gy); grietas.lineTo(gx + 1, gy - 6); grietas.lineTo(gx + 3, gy - 2); });
    E.f('huesoSombra', une([elipse(x - 44 * kk, y - 2, 14 * kk, 5 * kk), elipse(x + 44 * kk, y - 2, 14 * kk, 5 * kk)]));
    E.f('hueso', une([cinta(-1, -1, 1), cinta(1, -1, 1)])); E.f('huesoSombra', une([cinta(-1, 0.15, 1), cinta(1, 0.15, 1)])); E.l('huesoSombra', grietas, 1);
    A.monton(c, x - 44 * kk, y + 1, 26 * kk, 9 * kk, P); A.monton(c, x + 44 * kk, y + 1, 26 * kk, 9 * kk, P);
  };
  // el umiak (barca de piel de foca barbuda) boca abajo en su soporte, con costura, amarres y remos
  A.umiak = function (c, x, y, k, P) {
    var E = A.pintor(c, P); c.save(); c.translate(x, y); c.scale(k, k); c.translate(-x, -y);
    var postes = new Path2D(); [-64, 64].forEach(function (d) { postes.moveTo(x + d, y); postes.lineTo(x + d, y - 66); postes.moveTo(x + d - 14, y); postes.lineTo(x + d, y - 46); }); postes.moveTo(x - 76, y - 66); postes.lineTo(x + 76, y - 66);
    var b = new Path2D(); b.moveTo(x - 112, y - 78); b.lineTo(x - 92, y - 68); b.lineTo(x + 92, y - 68); b.lineTo(x + 108, y - 80); b.quadraticCurveTo(x + 96, y - 96, x + 72, y - 98); b.lineTo(x - 74, y - 98); b.quadraticCurveTo(x - 100, y - 96, x - 112, y - 78); b.closePath();
    var cuadernas = new Path2D(); for (var i = -4; i <= 4; i++) { cuadernas.moveTo(x + i * 19, y - 69); cuadernas.lineTo(x + i * 19.5, y - 97); }
    var costura = new Path2D(); costura.moveTo(x - 100, y - 82); costura.quadraticCurveTo(x, y - 86, x + 98, y - 84);
    var amarres = new Path2D(); [-64, 64].forEach(function (d) { amarres.moveTo(x + d - 6, y - 60); amarres.lineTo(x + d + 6, y - 72); amarres.moveTo(x + d + 6, y - 60); amarres.lineTo(x + d - 6, y - 72); });
    var remos = new Path2D(); remos.moveTo(x + 92, y); remos.lineTo(x + 70, y - 92); remos.moveTo(x + 100, y); remos.lineTo(x + 84, y - 86);
    E.l('madera', postes, 4); E.f('umiak', b); E.l('umiakSombra', cuadernas, 1.3); E.l('umiakSombra', costura, 1.6); E.f('umiakSombra', rect(x - 92, y - 74, 184, 6));
    E.f('casaNieve', poli([[x - 76, y - 98], [x + 74, y - 98], [x + 66, y - 104], [x + 20, y - 106], [x - 30, y - 105], [x - 68, y - 103]])); E.l('oscuro', amarres, 1.2); E.l('madera', remos, 2.6); E.f('madera', une([elipse(x + 94, y - 10, 4, 14, -0.24), elipse(x + 101, y - 9, 3.5, 13, -0.18)]));
    c.restore();
  };
  // el secadero: salmones abiertos colgados por la cola, de dos en dos, con la carne cortada en rombos
  A.secadero = function (c, x, y, k, P, t) {
    var E = A.pintor(c, P); c.save(); c.translate(x, y); c.scale(k, k); c.translate(-x, -y);
    var palos = new Path2D(); palos.moveTo(x - 46, y); palos.lineTo(x - 42, y - 80); palos.moveTo(x + 46, y); palos.lineTo(x + 42, y - 80); palos.moveTo(x - 54, y - 76); palos.lineTo(x + 54, y - 76);
    palos.moveTo(x - 46, y); palos.lineTo(x - 56, y - 40); palos.moveTo(x + 46, y); palos.lineTo(x + 56, y - 40);
    var piel = [], carne = [], cortes = new Path2D(), colas = [], cabezas = [], atados = new Path2D();
    for (var i = 0; i < 6; i++) {
      var px = x - 35 + i * 14, py = y - 72 + (i % 2) * 2, largo = 34 + (i % 3) * 3, abierto = i % 3 !== 1;
      atados.moveTo(px, y - 76); atados.lineTo(px, py);
      colas.push(poli([[px, py + 3], [px - 5, py - 3], [px - 1.5, py + 1], [px, py - 1], [px + 1.5, py + 1], [px + 5, py - 3]]));
      piel.push(suave([[px - 1.5, py + 3], [px + 1.5, py + 3], [px + 6, py + largo * 0.45], [px + 6.5, py + largo * 0.8], [px + 3, py + largo], [px - 3, py + largo], [px - 6.5, py + largo * 0.8], [px - 6, py + largo * 0.45]]));
      cabezas.push(suave([[px - 4, py + largo - 2], [px + 4, py + largo - 2], [px + 3, py + largo + 7], [px, py + largo + 9], [px - 3, py + largo + 7]]));
      if (abierto) { carne.push(suave([[px, py + 6], [px + 4.6, py + largo * 0.45], [px + 5, py + largo * 0.8], [px + 2, py + largo - 2], [px - 2, py + largo - 2], [px - 5, py + largo * 0.8], [px - 4.6, py + largo * 0.45]]));
        for (var j = 0; j < 4; j++) { var cy = py + 12 + j * 6; cortes.moveTo(px - 3.6, cy); cortes.lineTo(px + 3.6, cy + 3); cortes.moveTo(px + 3.6, cy); cortes.lineTo(px - 3.6, cy + 3); } }
    }
    E.l('madera', palos, 3.4);
    if (t == null) { E.l('oscuro', atados, 1); E.f('pezPiel', une(colas)); E.f('pezPiel', une(piel)); E.f('pezCabeza', une(cabezas)); E.f('pez', une(carne)); E.l('pezClaro', cortes, 0.9); }
    else for (i = 0; i < 6; i++) { var ax = x - 35 + i * 14, an = Math.sin(t * 1.4 + i * 0.9) * 0.07 + Math.sin(t * 0.37) * 0.05; c.save(); c.translate(ax, y - 76); c.rotate(an); c.translate(-ax, -(y - 76)); var at = new Path2D(); at.moveTo(ax, y - 76); at.lineTo(ax, y - 72 + (i % 2) * 2); E.l('oscuro', at, 1); E.f('pezPiel', colas[i]); E.f('pezPiel', piel[i]); E.f('pezCabeza', cabezas[i]); if (i % 3 !== 1) E.f('pez', carne[[0, 0, 1, 2, 2, 3][i]]); c.restore(); }
    c.restore();
  };
  // el almacén sobre postes (fuera del alcance de perros y zorros), con cuernos de caribú en el tejado
  A.almacen = function (c, x, y, P) {
    var E = A.pintor(c, P);
    var postes = new Path2D(); [-22, 22].forEach(function (d) { postes.moveTo(x + d, y); postes.lineTo(x + d, y - 62); });
    var escalera = new Path2D(); escalera.moveTo(x + 30, y); escalera.lineTo(x + 46, y - 60); escalera.moveTo(x + 40, y); escalera.lineTo(x + 54, y - 56); for (var i = 1; i < 5; i++) { escalera.moveTo(x + 32 + i * 3.4, y - i * 12); escalera.lineTo(x + 42 + i * 3, y - i * 12); }
    var tablas = new Path2D(); for (var k = 1; k < 4; k++) { tablas.moveTo(x - 30 + k * 15, y - 92); tablas.lineTo(x - 30 + k * 15, y - 60); }
    var cuernos = new Path2D(), cx = x - 6, cy = y - 116; [-1, 1].forEach(function (sg) { cuernos.moveTo(cx, cy); cuernos.quadraticCurveTo(cx + sg * 18, cy - 8, cx + sg * 22, cy - 26); cuernos.moveTo(cx + sg * 12, cy - 6); cuernos.lineTo(cx + sg * 8, cy - 18); cuernos.moveTo(cx + sg * 19, cy - 16); cuernos.lineTo(cx + sg * 28, cy - 22); });
    E.f('sombraSuelo', elipse(x, y + 1, 50, 5));
    E.l('madera', postes, 4); E.l('madera', escalera, 2.2); E.f('madera', rect(x - 30, y - 92, 60, 32)); E.l('maderaSombra', tablas, 1.2); E.f('maderaSombra', rect(x - 9, y - 88, 18, 26));
    E.f('maderaSombra', poli([[x - 36, y - 92], [x, y - 112], [x + 36, y - 92]])); E.f('casaNieve', poli([[x - 38, y - 91], [x - 34, y - 96], [x, y - 116], [x + 34, y - 96], [x + 38, y - 91], [x + 10, y - 104], [x - 12, y - 102]])); E.l('hueso', cuernos, 2.6);
  };
  // una piel de foca estirada en su aro, apoyada en el suelo
  A.pielEstirada = function (c, x, y, P) {
    var E = A.pintor(c, P), cu = new Path2D(), pie = new Path2D();
    for (var i = 0; i < 10; i++) { var a = i / 10 * TAU; cu.moveTo(x + Math.cos(a) * 13.4, y + Math.sin(a) * 16.8); cu.lineTo(x + Math.cos(a) * 15.6, y + Math.sin(a) * 19.6); }
    pie.moveTo(x - 6, y + 18); pie.lineTo(x - 10, y + 24); pie.moveTo(x + 6, y + 18); pie.lineTo(x + 10, y + 24);
    E.l('madera', pie, 2); E.f('foca', elipse(x, y, 13.4, 16.8)); E.f('focaClaro', une([elipse(x - 4, y - 5, 2, 1.4), elipse(x + 5, y + 2, 2.2, 1.5), elipse(x - 2, y + 8, 1.8, 1.2), elipse(x + 3, y - 10, 1.6, 1.1)])); E.l('piel', cu, 0.9); E.l('madera', elipse(x, y, 16, 20), 2.6);
  };
  // el trineo parado o en marcha, con su carga atada y el manillar; x = el centro del cesto
  A.trineo = function (c, x, y, k, P, op) {
    op = op || {}; var E = A.pintor(c, P); c.save(); c.translate(x, y); c.scale(k, k); c.translate(-x, -y);
    var patines = new Path2D(); patines.moveTo(x - 62, y); patines.lineTo(x + 40, y); patines.quadraticCurveTo(x + 60, y, x + 58, y - 22);
    var cesto = new Path2D(); [-40, -20, 0, 20].forEach(function (d) { cesto.moveTo(x + d, y); cesto.lineTo(x + d, y - 26); }); cesto.moveTo(x - 46, y - 30); cesto.lineTo(x + 42, y - 30); cesto.moveTo(x - 46, y - 20); cesto.lineTo(x + 40, y - 20);
    var manillar = new Path2D(); manillar.moveTo(x - 46, y - 2); manillar.quadraticCurveTo(x - 58, y - 30, x - 52, y - 56);
    var cuerdas = new Path2D(); [-30, -8, 14].forEach(function (d) { cuerdas.moveTo(x + d, y - 20); cuerdas.quadraticCurveTo(x + d + 4, y - 50, x + d + 8, y - 20); });
    E.f('sombraSuelo', elipse(x - 4, y + 2, 72, 5)); E.l('trineo', manillar, 3); E.l('trineo', cesto, 2.4); if (op.carga !== false) { E.f('umiak', elipse(x - 4, y - 34, 32, 10)); E.l('oscuro', cuerdas, 1.3); } E.l('trineo', patines, 3.2);
    c.restore();
    return { farol: [x - 52 * k, y - 60 * k] };
  };

  /* ================================================================== la punta, la pista y las montañas */
  // huesos de ballena en la playa de la punta (costillas que salen de la nieve, el cráneo, vértebras)
  A.huesosPlaya = function (c, x, y, P) {
    var E = A.pintor(c, P), cost = new Path2D();
    E.f('sombraSuelo', elipse(x + 60 + (P._sombra || 1) * 40, y + 3, 220, 8));
    // las costillas que asoman de la nieve, en arco
    for (var i = 0; i < 7; i++) { var bx = x - 110 + i * 30, h = 56 + Math.sin(i * 1.3) * 14 - Math.abs(i - 3) * 4; cost.moveTo(bx, y + 2); cost.quadraticCurveTo(bx + 8, y - h * 0.85, bx + 30, y - h); }
    E.l('huesoSombra', cost, 7.5); E.l('hueso', cost, 5);
    // dos mandíbulas largas, tiradas y cruzadas
    [[x + 90, y - 2, x + 330, y - 14, x + 210, y - 40, 15], [x + 140, y + 4, x + 360, y + 2, x + 250, y - 20, 12]].forEach(function (m) {
      var p = new Path2D(); p.moveTo(m[0], m[1]); p.quadraticCurveTo(m[4], m[5], m[2], m[3]); E.l('huesoSombra', p, m[6] + 3); E.l('hueso', p, m[6]);
      var g = new Path2D(); g.moveTo(m[0] + 20, m[1] - 3); g.quadraticCurveTo(m[4], m[5] - 4, m[2] - 20, m[3] - 4); E.l('huesoSombra', g, 1.2);
    });
    // las vértebras: discos con su apófisis
    [[-150, 6, 11], [-128, 9, 10], [-104, 6, 9], [380, 4, 10]].forEach(function (v) { E.f('huesoSombra', elipse(x + v[0] + 2, y + v[1] - 4, v[2], v[2] * 0.7)); E.f('hueso', elipse(x + v[0], y + v[1] - 6, v[2], v[2] * 0.7)); E.f('huesoSombra', elipse(x + v[0], y + v[1] - 6, v[2] * 0.3, v[2] * 0.22)); });
    var g2 = c.createLinearGradient(0, y - 8, 0, y + 6); g2.addColorStop(0, rgba(P.nieve, 0)); g2.addColorStop(1, rgba(P.nieve, 0.95)); c.fillStyle = g2; c.fillRect(x - 170, y - 8, 580, 14);
  };
  // un montón de troncos a la deriva (la madera que trae el mar a la costa, donde no crecen árboles)
  A.troncos = function (c, x, y, P) {
    var E = A.pintor(c, P); sembrar(x);
    E.f('sombraSuelo', elipse(x, y + 2, 90, 5));
    for (var i = 0; i < 7; i++) { var a = (azar() - 0.5) * 0.5, l = 80 + azar() * 70, cx = x + (azar() - 0.5) * 60, cy = y - i * 7 - azar() * 4, p = new Path2D(); p.moveTo(cx - Math.cos(a) * l / 2, cy - Math.sin(a) * l / 2); p.lineTo(cx + Math.cos(a) * l / 2, cy + Math.sin(a) * l / 2); E.l('maderaSombra', p, 9); E.l('maderaClara', p, 6); }
    E.f('casaNieve', une([elipse(x - 10, y - 50, 50, 5), elipse(x + 30, y - 26, 30, 4)]));
  };
  // la cabaña de troncos de la pista (un refugio de los correos de trineo), con ventana encendida y chimenea
  A.cabana = function (c, x, y, P) {
    var E = A.pintor(c, P), w = 220, h = 96, troncos = new Path2D(), testas = [];
    for (var i = 0; i < 8; i++) { var ty = y - 6 - i * 12; troncos.moveTo(x - w / 2, ty); troncos.lineTo(x + w / 2, ty); testas.push(circulo(x - w / 2 - 4, ty - 6, 6), circulo(x + w / 2 + 4, ty - 6, 6)); }
    E.f('sombraSuelo', elipse(x - 40, y + 3, 170, 8));
    E.f('maderaClara', rect(x - w / 2, y - h, w, h)); E.l('maderaSombra', troncos, 1.6); E.f('maderaSombra', une(testas)); E.f('madera', une(testas.map(function (t2) { return escalar(t2, 0, 0, 1); })));
    E.f('madera', poli([[x - w / 2 - 18, y - h], [x, y - h - 70], [x + w / 2 + 18, y - h]])); E.f('casaNieve', suave([[x - w / 2 - 22, y - h + 4], [x - w / 2 - 6, y - h - 10], [x, y - h - 76], [x + w / 2 + 6, y - h - 10], [x + w / 2 + 22, y - h + 4], [x + 20, y - h - 28], [x - 30, y - h - 22]]));
    E.f('oscuro', rect(x - 70, y - 70, 38, 46)); E.f('luz', rect(x - 66, y - 66, 30, 38)); E.l('maderaSombra', poli([[x - 51, y - 66], [x - 51, y - 28]], true), 2); E.l('maderaSombra', poli([[x - 66, y - 47], [x - 36, y - 47]], true), 2);
    E.f('maderaSombra', rect(x + 20, y - 78, 44, 78)); E.f('madera', rect(x + 24, y - 74, 36, 74));
    E.f('piedraChimenea' in P ? 'piedraChimenea' : 'huesoSombra', rect(x + 60, y - h - 60, 22, 70)); E.f('casaNieve', rect(x + 58, y - h - 64, 26, 6));
    E.f('nieve', suave([[x - w / 2 - 30, y + 4], [x - w / 2, y - 16], [x - 40, y - 8], [x + 20, y - 2], [x + w / 2 + 30, y + 4]]));
    return { ventana: [x - 51, y - 47], chimenea: [x + 71, y - h - 64] };
  };
  // un poste de telégrafo (la línea de Nome) con sus aisladores
  A.poste = function (c, x, y, h, P) {
    var E = A.pintor(c, P), p = new Path2D(); p.moveTo(x, y); p.lineTo(x, y - h); p.moveTo(x - 14, y - h + 8); p.lineTo(x + 14, y - h + 8);
    E.l('maderaSombra', p, 4.4); E.l('madera', p, 3); E.f('casaNieve', rect(x - 15, y - h + 5, 30, 3)); E.f('hueso', une([circulo(x - 11, y - h + 4, 2.2), circulo(x + 11, y - h + 4, 2.2)]));
    var g = c.createLinearGradient(0, y - 8, 0, y + 3); g.addColorStop(0, rgba(P.nieve, 0)); g.addColorStop(1, rgba(P.nieve, 1)); c.fillStyle = g; c.beginPath(); c.ellipse(x, y, 16, 8, 0, Math.PI, 0); c.fill();
  };
  // la tienda de lona del campamento de las montañas, con la estufa encendida (la lona brilla por dentro)
  A.tienda = function (c, x, y, P) {
    var E = A.pintor(c, P), w = 150, h = 100;
    E.f('sombraSuelo', elipse(x + 30, y + 3, 120, 7));
    E.f('lona', poli([[x - w / 2, y], [x - w / 2 + 6, y - h * 0.62], [x, y - h], [x + w / 2 - 6, y - h * 0.62], [x + w / 2, y]])); E.f('lonaSombra', poli([[x, y - h], [x + w / 2 - 6, y - h * 0.62], [x + w / 2, y], [x + 12, y]]));
    E.f('oscuro', poli([[x - 18, y], [x, y - h * 0.7], [x + 14, y]])); E.f('luz', poli([[x - 12, y], [x, y - h * 0.56], [x + 9, y]]));
    E.f('maderaSombra', rect(x + w * 0.24, y - h * 0.9 - 30, 5, 34)); E.f('casaNieve', poli([[x - w / 2 - 4, y - h * 0.62 + 2], [x, y - h - 4], [x + w / 2 + 4, y - h * 0.62 + 2], [x, y - h + 6]]));
    var vientos = new Path2D(); [-1, 1].forEach(function (sg) { vientos.moveTo(x + sg * (w / 2 - 6), y - h * 0.62); vientos.lineTo(x + sg * (w / 2 + 30), y); }); E.l('lonaSombra', vientos, 1.2);
    return { puerta: [x, y - 20], chimenea: [x + w * 0.24 + 2.5, y - h * 0.9 - 30] };
  };

  /* ================================================================== la tundra: bueyes almizcleros, sauces, perdices, trípodes */
  // un buey almizclero: la joroba, la falda de pelo largo hasta casi el suelo, la silla clara del lomo, los cuernos que bajan
  // pegados a la cara y suben en gancho, las patas cortas y claras (mira a la izquierda)
  A.buey = function (c, x, y, s, P, espejo) {
    var E = A.pintor(c, P), L = function (pts) { return lugar(pts, x, y, s, !espejo); }, X = function (d) { return x + (espejo ? d : -d) * s; };
    E.f('sombraSuelo', elipse(x, y + 1, 0.95 * s, 0.08 * s));
    E.f('bueySombra', une([rect(X(-0.3) - 0.055 * s, y - 0.34 * s, 0.11 * s, 0.34 * s), rect(X(0.5) - 0.055 * s, y - 0.34 * s, 0.11 * s, 0.34 * s)]));
    E.f('bueyClaro', une([rect(X(-0.46) - 0.06 * s, y - 0.36 * s, 0.12 * s, 0.36 * s), rect(X(0.36) - 0.06 * s, y - 0.36 * s, 0.12 * s, 0.36 * s), elipse(X(-0.46), y - 0.01 * s, 0.08 * s, 0.03 * s), elipse(X(0.36), y - 0.01 * s, 0.08 * s, 0.03 * s)]));
    var cuerpo = suave(L([[-0.78, -0.36], [-0.82, -0.64], [-0.6, -0.94], [-0.2, -1.12], [0.12, -1.04], [0.5, -0.96], [0.76, -0.8], [0.86, -0.54], [0.8, -0.34], [0.6, -0.26], [0.3, -0.3], [0, -0.24], [-0.3, -0.3], [-0.6, -0.24]]));
    E.f('buey', cuerpo);
    var pelo = new Path2D(); for (var t = -0.66; t < 0.76; t += 0.11) { pelo.moveTo(X(t), y - 0.7 * s); pelo.bezierCurveTo(X(t + 0.03), y - 0.56 * s, X(t - 0.03), y - 0.44 * s, X(t + 0.01), y - 0.3 * s); }
    E.fEn('bueyClaro', suave(L([[-0.4, -1.06], [-0.2, -1.12], [0.12, -1.04], [0.3, -0.98], [0.1, -0.9], [-0.3, -0.94]])), cuerpo); c.save(); c.clip(cuerpo); E.l('bueySombra', pelo, Math.max(1, 0.018 * s)); c.restore();
    E.f('buey', suave(L([[-0.74, -0.7], [-1.0, -0.7], [-1.14, -0.5], [-1.1, -0.36], [-0.86, -0.38]])));
    E.f('bueyClaro', une([elipse(X(-1.1), y - 0.42 * s, 0.07 * s, 0.05 * s), elipse(X(-0.98), y - 0.62 * s, 0.07 * s, 0.035 * s)]));
    var cuerno = new Path2D(); cuerno.moveTo(X(-0.8), y - 0.74 * s); cuerno.quadraticCurveTo(X(-1.0), y - 0.76 * s, X(-1.02), y - 0.56 * s); cuerno.quadraticCurveTo(X(-1.02), y - 0.44 * s, X(-0.92), y - 0.48 * s);
    E.l('cuerno', cuerno, Math.max(1.8, 0.08 * s)); E.f('hueso', elipse(X(-0.84), y - 0.74 * s, 0.11 * s, 0.05 * s)); E.f('oscuro', circulo(X(-0.95), y - 0.56 * s, 0.025 * s)); E.f('buho', circulo(X(-0.955), y - 0.565 * s, 0.008 * s));
  };
  // sauces enanos: ramitas que asoman de la nieve en la tundra
  A.sauces = function (c, x, y, k, P) {
    sembrar(x * 3 + y); var p = new Path2D(), E = A.pintor(c, P);
    for (var i = 0; i < 6; i++) { var bx = x + (azar() - 0.5) * 50 * k, a = -Math.PI / 2 + (azar() - 0.5) * 0.9, l = (24 + azar() * 30) * k, mx = bx + Math.cos(a) * l * 0.5, my = y + Math.sin(a) * l * 0.5; p.moveTo(bx, y); p.quadraticCurveTo(mx, my, bx + Math.cos(a) * l, y + Math.sin(a) * l); p.moveTo(mx, my); p.lineTo(mx + Math.cos(a + 0.6) * l * 0.35, my + Math.sin(a + 0.6) * l * 0.35); }
    E.l('madera', p, 1.6 * k); E.f('nieve', elipse(x, y + 2, 40 * k, 6 * k));
  };
  // una perdiz nival: blanca, con la cola y el ojo negros
  A.perdiz = function (c, x, y, s, P, espejo) {
    var E = A.pintor(c, P), L = function (pts) { return lugar(pts, x, y, s, espejo); }, X = function (d) { return x + (espejo ? -d : d) * s; };
    E.f('sombraSuelo', elipse(x, y + 1, 0.5 * s, 0.06 * s));
    E.f('buho', suave(L([[-0.5, -0.3], [-0.2, -0.56], [0.24, -0.58], [0.46, -0.78], [0.62, -0.7], [0.56, -0.5], [0.4, -0.2], [0, -0.06], [-0.4, -0.12]])));
    E.f('oscuro', une([poli(L([[-0.48, -0.32], [-0.7, -0.4], [-0.62, -0.22]])), circulo(X(0.52), y - 0.68 * s, 0.035 * s), poli(L([[0.62, -0.7], [0.72, -0.68], [0.62, -0.64]]))]));
    E.f('buhoSombra', suave(L([[-0.2, -0.46], [0.2, -0.48], [0.1, -0.24], [-0.24, -0.26]])));
  };
  // el trípode de palos que marca la pista en la nieve
  A.tripode = function (c, x, y, h, P) {
    var p = new Path2D(); p.moveTo(x - h * 0.22, y); p.lineTo(x + 2, y - h); p.moveTo(x + h * 0.2, y + 2); p.lineTo(x - 2, y - h); p.moveTo(x + 4, y - 4); p.lineTo(x, y - h * 1.04);
    var E = A.pintor(c, P); E.l('maderaSombra', p, 4); E.l('madera', p, 2.6); E.f('ribete2', rect(x - 6, y - h * 0.86, 12, 5));
  };
  // las huellas del trineo: dos rodadas que ondulan
  A.rodadas = function (c, x0, x1, y, P) {
    var p = new Path2D(); [-5, 5].forEach(function (d) { p.moveTo(x0, y + d); for (var x = x0; x <= x1; x += 40) p.lineTo(x, y + d + Math.sin(x / 190) * 7); });
    A.pintor(c, P).l('pista', p, 2);
  };
  // una duna de nieve: nace del suelo y vuelve a él (sin borde por debajo). La cara de barlovento, con luz; la cresta,
  // con su filo; la de sotavento, en sombra que se va fundiendo con el suelo
  A.loma = function (c, x, y, w, h, P) {
    var cx = x - w * 0.15, top = y - h, cara = new Path2D(), sombra = new Path2D(), filo = new Path2D();
    cara.moveTo(x - w, y); cara.bezierCurveTo(x - w * 0.6, y, cx - w * 0.25, top, cx, top); cara.bezierCurveTo(cx + w * 0.2, top, x + w * 0.6, y, x + w, y); cara.closePath();
    var g = c.createLinearGradient(0, top, 0, y); g.addColorStop(0, rgba(P.nieveTop, 0.95)); g.addColorStop(0.55, rgba(P.nieve, 0.6)); g.addColorStop(1, rgba(P.nieve, 0)); c.fillStyle = g; c.fill(cara);
    var lado = P._sombra || 1;
    sombra.moveTo(cx, top); sombra.bezierCurveTo(cx + lado * w * 0.2, top, cx + lado * w * 0.55, y - h * 0.15, cx + lado * w * 1.05, y); sombra.lineTo(cx + lado * w * 0.25, y); sombra.bezierCurveTo(cx + lado * w * 0.12, y - h * 0.4, cx + lado * w * 0.05, top + h * 0.2, cx, top); sombra.closePath();
    var g2 = c.createLinearGradient(0, top, 0, y); g2.addColorStop(0, rgba(P.tierraSombra, 0.85)); g2.addColorStop(1, rgba(P.tierraSombra, 0)); c.fillStyle = g2; c.fill(sombra);
    filo.moveTo(cx - w * 0.3, top + h * 0.3); filo.quadraticCurveTo(cx - w * 0.12, top, cx, top); c.strokeStyle = rgba(P._filo, 0.5); c.lineWidth = 1.2; c.stroke(filo);
  };
  // las ondas que el viento dibuja en la nieve: líneas finas, en luz y en sombra
  A.ondas = function (c, x0, x1, y, P, s) {
    sembrar(s || x0); var luz = new Path2D(), som = new Path2D();
    for (var x = x0; x < x1; x += 30 + azar() * 70) { var l = 40 + azar() * 90, yy = y + (azar() - 0.5) * 30; som.moveTo(x, yy); som.quadraticCurveTo(x + l * 0.5, yy - 3, x + l, yy + 1); luz.moveTo(x + 2, yy - 2); luz.quadraticCurveTo(x + l * 0.5, yy - 5, x + l - 4, yy - 1); }
    c.lineCap = 'round'; c.strokeStyle = rgba(P.tierraSombra, 0.55); c.lineWidth = 1.4; c.stroke(som); c.strokeStyle = rgba(P.nieveTop, 0.6); c.lineWidth = 1; c.stroke(luz);
  };
  // pisadas en la nieve, de x0 a x1 (las de una persona: pares alternos)
  A.pisadas = function (c, x0, x1, y, P, curva) {
    var l = [], n = Math.floor(Math.abs(x1 - x0) / 22);
    for (var i = 0; i < n; i++) { var u = i / n, x = x0 + (x1 - x0) * u, yy = y + Math.sin(u * Math.PI) * (curva || 0) + (i % 2 ? 4 : -2); l.push(elipse(x, yy, 4, 1.8, 0)); }
    A.pintor(c, P).f('huella', une(l));
  };
  // un cuervo (vuela; a = 0…1 el aleteo)
  A.cuervo = function (c, x, y, s, a, color) {
    var al = Math.sin(a * Math.PI * 2) * 0.9;
    c.fillStyle = color; c.beginPath(); c.ellipse(x, y, s * 0.5, s * 0.16, 0, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(x + s * 0.42, y - s * 0.04); c.lineTo(x + s * 0.7, y); c.lineTo(x + s * 0.42, y + s * 0.06); c.fill();
    c.beginPath(); c.moveTo(x - s * 0.45, y); c.lineTo(x - s * 0.72, y - s * 0.1); c.lineTo(x - s * 0.72, y + s * 0.1); c.fill();
    [-1, 1].forEach(function (sg) { c.beginPath(); c.moveTo(x - s * 0.15, y); c.quadraticCurveTo(x - s * 0.1, y - sg * s * 0.7 * al - s * 0.2, x + s * 0.15, y - sg * s * 0.9 * al - s * 0.15); c.lineTo(x + s * 0.12, y); c.fill(); });
  };

  // la manta del Nalukataq: pieles claras de foca cosidas en gajos, con su borde y las asas de cuerda, tendida en la nieve
  A.manta = function (c, x, y, rx, P) {
    var E = A.pintor(c, P), ry = rx * 0.28, cos = new Path2D();
    E.f('sombraSuelo', elipse(x, y + 3, rx * 1.06, ry * 1.12)); E.f('lona', elipse(x, y, rx, ry));
    E.f('lonaSombra', elipse(x + rx * 0.1, y + ry * 0.28, rx * 0.8, ry * 0.55)); E.f('lona', elipse(x - rx * 0.12, y - ry * 0.12, rx * 0.62, ry * 0.42));
    [-0.55, -0.18, 0.18, 0.55].forEach(function (u) { cos.moveTo(x + u * rx, y - ry * Math.sqrt(1 - u * u) * 0.98); cos.quadraticCurveTo(x + u * rx * 1.05, y, x + u * rx * 0.92, y + ry * Math.sqrt(1 - u * u) * 0.98); });
    E.l('lonaSombra', cos, 1.1); E.l('maderaSombra', elipse(x, y, rx * 1.02, ry * 1.05), 1.4);
    for (var i = 0; i < 14; i++) { var a = i / 14 * TAU, p = new Path2D(); p.arc(x + Math.cos(a) * rx * 1.05, y + Math.sin(a) * ry * 1.08, 3, 0, Math.PI); E.l('maderaSombra', p, 1.2); }
  };

  // una picea negra (el abeto del bosque boreal, estrecha como una aguja): pisos de ramas caídas, cada uno con su nieve
  // encima y su cara en sombra; el tronco apenas asoma
  A.abeto = function (c, x, y, h, P, s) {
    var E = A.pintor(c, P); sembrar((s || 0) + x * 0.37);
    var w = h * (0.16 + azar() * 0.05), pisos = 8 + Math.floor(h / 30);
    E.f('sombraSuelo', elipse(x + (P._sombra || 1) * h * 0.12, y + 1, w * 1.1, Math.max(2, h * 0.025)));
    E.f('maderaSombra', rect(x - h * 0.012, y - h * 0.14, h * 0.024, h * 0.15));
    // de abajo arriba: cada piso tapa el centro del de debajo, así de cada uno se ve el ala caída con la nieve encima
    for (var i = 0; i < pisos; i++) {
      var t = i / pisos, yy = y - h * 0.06 - t * h * 0.92, ww = w * (1 - t * 0.88) * (0.8 + azar() * 0.3), hh = h * 0.92 / pisos * 2.3, cae = hh * 0.3, tk = hh * 0.16;
      var izq = [x - ww, yy + cae * 0.3], der = [x + ww * (0.9 + azar() * 0.2), yy + cae * 0.2], arriba = [x + (azar() - 0.5) * 2, yy - hh];
      var mi = [x - ww * 0.5, yy - hh * 0.3], md = [x + ww * 0.5, yy - hh * 0.35];
      E.f('abeto', poli([izq, mi, arriba, md, der, [x + ww * 0.3, yy + cae * 0.05], [x - ww * 0.4, yy + cae * 0.1]]));
      E.f('abetoSombra', poli([arriba, md, der, [x + ww * 0.3, yy + cae * 0.05], [x + 1, yy - hh * 0.3]]));
      // la nieve sobre las dos alas: una banda fina por el borde de arriba, desde la punta hasta medio camino del tronco
      E.f('nieveTop', poli([[izq[0] + 1, izq[1] - 1], mi, [x - ww * 0.12, yy - hh * 0.78], [x - ww * 0.14, yy - hh * 0.78 + tk * 1.4], [mi[0] + 2, mi[1] + tk * 1.2], [izq[0] + ww * 0.12, izq[1] - 1 + tk * 0.3]]));
      E.f('nieveTop', poli([[der[0] - 1, der[1] - 1], md, [x + ww * 0.12, yy - hh * 0.8], [x + ww * 0.14, yy - hh * 0.8 + tk * 1.3], [md[0] - 2, md[1] + tk * 1.1], [der[0] - ww * 0.14, der[1] - 1 + tk * 0.3]]));
    }
    E.f('nieve', elipse(x, y + 1, w * 0.9, Math.max(2, h * 0.03)));
  };
  // un grupo de abetos: más altos en el medio, de distintos tamaños
  A.bosquete = function (c, x0, x1, y, h, n, P, s) {
    sembrar(s); var l = [];
    for (var i = 0; i < n; i++) { var u = (i + azar() * 0.8) / n; l.push([x0 + (x1 - x0) * u, y + azar() * h * 0.08, h * (0.55 + 0.45 * Math.sin(Math.PI * u)) * (0.75 + azar() * 0.4)]); }
    l.sort(function (a, b) { return a[1] - b[1]; }).forEach(function (q, k) { A.abeto(c, q[0], q[1], q[2], P, s + k); });
  };

  /* ================================================================== cosas del pueblo */
  // la escotilla de una bodega de hielo (siġļuaq: la despensa excavada en el permafrost), de tablas, con su nieve
  A.escotilla = function (c, x, y, P) {
    var E = A.pintor(c, P), tab = new Path2D(); for (var i = 1; i < 4; i++) { tab.moveTo(x - 22 + i * 11, y - 7); tab.lineTo(x - 22 + i * 11 + 3, y + 3); }
    E.f('sombraSuelo', elipse(x + 4, y + 3, 30, 5)); E.f('madera', poli([[x - 24, y + 4], [x + 22, y + 4], [x + 26, y - 6], [x - 20, y - 6]])); E.l('maderaSombra', tab, 1.2);
    E.f('maderaSombra', rect(x - 2, y - 9, 6, 4)); E.f('nieveTop', suave([[x - 20, y - 6], [x - 4, y - 9], [x + 14, y - 8], [x + 24, y - 6], [x + 6, y - 4]]));
  };
  // un kayak (qayaq) de piel sobre dos caballetes
  A.kayak = function (c, x, y, P) {
    var E = A.pintor(c, P), pa = new Path2D(); [-40, 40].forEach(function (d) { pa.moveTo(x + d - 8, y); pa.lineTo(x + d, y - 26); pa.lineTo(x + d + 8, y); });
    E.f('sombraSuelo', elipse(x, y + 2, 70, 4)); E.l('madera', pa, 2.4);
    var casco = suave([[x - 82, y - 40], [x - 62, y - 26], [x, y - 22], [x + 62, y - 26], [x + 86, y - 42], [x + 58, y - 40], [x, y - 42], [x - 56, y - 40]]); E.f('umiak', casco); E.fEn('umiakSombra', rect(x - 90, y - 30, 180, 10), casco);
    var cost = new Path2D(); for (var i = -3; i <= 3; i++) { cost.moveTo(x + i * 17, y - 40); cost.lineTo(x + i * 17.5, y - 24); } E.fEn('umiakSombra', une([]), casco); E.l('umiakSombra', cost, 0.8);
    E.f('oscuro', elipse(x + 4, y - 41, 10, 2.6)); E.l('madera', elipse(x + 4, y - 41.5, 11, 3), 1.4); E.f('nieveTop', poli([[x - 50, y - 41], [x - 14, y - 42], [x - 10, y - 45], [x - 40, y - 44]]));
    var remo = new Path2D(); remo.moveTo(x - 30, y - 47); remo.lineTo(x + 50, y - 38); E.l('madera', remo, 2); E.f('madera', une([elipse(x - 36, y - 48, 9, 2.6, 0.12), elipse(x + 56, y - 37, 9, 2.6, 0.12)]));
  };
  // huellas de zorro: una fila de pares pequeños
  A.huellasZorro = function (c, x0, x1, y, P) {
    var l = [], n = Math.floor(Math.abs(x1 - x0) / 14);
    for (var i = 0; i < n; i++) { var x = x0 + (x1 - x0) * i / n, yy = y + Math.sin(i * 0.4) * 6; l.push(elipse(x, yy - 2, 1.8, 1.2), elipse(x + 4, yy + 2, 1.8, 1.2)); }
    A.pintor(c, P).f('huella', une(l));
  };

  /* ================================================================== las piezas de las escenas grandes */
  // la ballena de Groenlandia entera, de lado (mira a la derecha), centrada en (x, y), largo l, girada ang: la cabeza enorme
  // (un tercio del cuerpo) con la boca en arco, la barbilla blanca, la aleta pectoral en pala y la cola ancha con su muesca
  A.ballenaEntera = function (c, x, y, l, ang, P) {
    var E = A.pintor(c, P); c.save(); c.translate(x, y); c.rotate(ang); var X = function (u) { return (u - 0.5) * l; }, Y = function (v) { return v * l; };
    var cuerpo = new Path2D();
    cuerpo.moveTo(X(0.98), Y(-0.01)); cuerpo.bezierCurveTo(X(0.97), Y(-0.1), X(0.84), Y(-0.15), X(0.68), Y(-0.15));
    cuerpo.bezierCurveTo(X(0.5), Y(-0.15), X(0.3), Y(-0.11), X(0.16), Y(-0.05)); cuerpo.lineTo(X(0.08), Y(-0.03));
    cuerpo.lineTo(X(0.0), Y(-0.1)); cuerpo.quadraticCurveTo(X(0.03), Y(-0.01), X(0.0), Y(0.08)); cuerpo.lineTo(X(0.08), Y(0.02));
    cuerpo.bezierCurveTo(X(0.25), Y(0.06), X(0.45), Y(0.13), X(0.66), Y(0.14)); cuerpo.bezierCurveTo(X(0.84), Y(0.15), X(0.96), Y(0.1), X(0.98), Y(-0.01)); cuerpo.closePath();
    E.f('ballena', cuerpo);
    c.save(); c.clip(cuerpo);
    E.f('ballenaVientre', elipse(X(0.6), Y(0.12), l * 0.3, l * 0.05));
    E.f('buho', elipse(X(0.92), Y(0.09), l * 0.07, l * 0.05, -0.3));   // la barbilla blanca
    var boca = new Path2D(); boca.moveTo(X(0.99), Y(0.0)); boca.bezierCurveTo(X(0.93), Y(-0.12), X(0.8), Y(-0.1), X(0.74), Y(0.04)); E.l('oscuro', boca, Math.max(1.2, l * 0.008));
    c.restore();
    E.f('oscuro', circulo(X(0.73), Y(0.05), Math.max(1, l * 0.006)));
    E.f('ballenaVientre', poli([[X(0.62), Y(0.1)], [X(0.56), Y(0.27)], [X(0.52), Y(0.25)], [X(0.55), Y(0.11)]]));
    c.restore();
  };
  // un iceberg varado (un trozo de banquisa vieja empujado contra la costa): paredes azules con cuevas y grietas,
  // la cima nevada, el reflejo en el hielo de abajo
  A.iceberg = function (c, x, y, w, h, P, s) {
    var E = A.pintor(c, P); sembrar(s || 5);
    var pts = [[x - w * 0.5, y]], n = 9;
    for (var i = 0; i <= n; i++) { var u = i / n; pts.push([x - w * 0.5 + w * u + (azar() - 0.5) * w * 0.04, y - h * (0.55 + 0.45 * Math.pow(Math.sin(Math.PI * (0.08 + u * 0.84)), 0.6)) * (0.9 + azar() * 0.12)]); }
    pts.push([x + w * 0.5, y]);
    var cuerpo = poli(pts);
    E.f('sombraSuelo', elipse(x + (P._sombra || 1) * w * 0.25, y + 3, w * 0.7, h * 0.08));
    E.f('iceberg', cuerpo);
    c.save(); c.clip(cuerpo);
    // las caras: luz a un lado, sombra al otro, en planos verticales
    for (i = 0; i < 7; i++) { var cx = x - w * 0.5 + w * (i + azar() * 0.6) / 7; E.f(i % 2 ? 'icebergSombra' : 'icebergLuz', poli([[cx, y + 4], [cx + w * 0.05, y - h * 1.1], [cx + w * 0.12, y - h * 1.1], [cx + w * 0.08, y + 4]])); }
    E.f('icebergSombra', poli([[x + w * 0.1, y + 4], [x + w * 0.2, y - h * 1.1], [x + w * 0.6, y - h * 1.1], [x + w * 0.6, y + 4]]));
    // las cuevas: arcos de azul hondo con su brillo dentro
    [[0.3, 0.32, 0.09], [0.62, 0.22, 0.06], [0.45, 0.18, 0.045]].forEach(function (q) { var cx2 = x - w * 0.5 + w * q[0], ch = h * q[1]; var cue = new Path2D(); cue.moveTo(cx2 - w * q[2], y + 2); cue.quadraticCurveTo(cx2 - w * q[2], y - ch, cx2, y - ch * 1.05); cue.quadraticCurveTo(cx2 + w * q[2], y - ch, cx2 + w * q[2], y + 2); cue.closePath(); E.f('icebergCueva', cue); E.f('icebergLuz', elipse(cx2 - w * q[2] * 0.3, y - ch * 0.5, w * q[2] * 0.25, ch * 0.3)); });
    var gr = new Path2D(); for (i = 0; i < 6; i++) { var gx = x - w * 0.4 + azar() * w * 0.8; gr.moveTo(gx, y - h * (0.4 + azar() * 0.5)); gr.lineTo(gx + (azar() - 0.5) * 8, y - h * 0.2); gr.lineTo(gx + (azar() - 0.5) * 12, y); }
    E.l('icebergCueva', gr, 1.2);
    c.restore();
    // la nieve de arriba, que cuelga un poco por el borde
    var top = pts.slice(1, pts.length - 1), nieve = top.map(function (q) { return [q[0], q[1] - 3]; }).concat(top.slice().reverse().map(function (q, i) { return [q[0], q[1] + h * (0.05 + 0.06 * Math.abs(Math.sin(i * 1.7)))]; }));
    E.f('nieveTop', suave(nieve));
    A.monton(c, x - w * 0.4, y + 2, w * 0.3, h * 0.12, P); A.monton(c, x + w * 0.35, y + 2, w * 0.35, h * 0.1, P);
  };
  // un caribú al trote largo (mira a la izquierda), con las patas en movimiento; f = fase de la zancada
  A.caribuCorre = function (c, x, y, s, f, P, cuernos, amp) {
    var E = A.pintor(c, P), w = TAU * f, L = function (pts) { return lugar(pts, x, y, s, true); }, am = amp == null ? 0.7 : amp;
    var pierna = function (hx, a, lejos) { a = a * am / 0.7; var k = [hx + Math.sin(a) * 0.42, -0.4], p = [k[0] + Math.sin(a * 1.4) * 0.4, -0.02 + Math.max(0, Math.sin(a)) * -0.12]; return pata(L([[hx, -0.8], k, p]), [Math.max(1.6, (lejos ? 0.11 : 0.13) * s), Math.max(1.2, 0.07 * s), Math.max(1.1, 0.06 * s)]); };
    var bote = Math.abs(Math.sin(w)) * 0.05 * s * am / 0.7;
    c.save(); c.translate(0, -bote);
    E.f('caribuSombra', une([pierna(-0.36, 0.7 * Math.sin(w + 1.2), 1), pierna(0.24, 0.7 * Math.sin(w + Math.PI + 1.2), 1)]));
    E.f('caribu', une([suave(L([[-0.62, -0.92], [-0.3, -1.06], [0.12, -1.06], [0.38, -1.14], [0.56, -1.0], [0.54, -0.78], [0.2, -0.7], [-0.3, -0.72], [-0.6, -0.76]])), poli(L([[0.4, -1.08], [0.72, -1.26], [0.86, -1.18], [0.6, -0.92]])), elipse(x - 0.84 * s, y - 1.2 * s, 0.17 * s, 0.09 * s, -0.25),
      pierna(-0.48, 0.7 * Math.sin(w)), pierna(0.36, 0.7 * Math.sin(w + Math.PI))]));
    E.f('caribuClaro', une([suave(L([[0.42, -1.06], [0.62, -1.2], [0.7, -1.06], [0.6, -0.9], [0.5, -0.94]])), elipse(x + 0.62 * s, y - 0.9 * s, 0.07 * s, 0.09 * s), elipse(x + 0.1 * s, y - 0.75 * s, 0.4 * s, 0.05 * s)]));
    if (cuernos !== false) {   // la cornamenta (machos y hembras de caribú la tienen): dos astas hacia atrás y arriba, con sus puntas y la pala de delante
      var cu = new Path2D();
      [[-0.78, 0], [-0.72, 0.05]].forEach(function (b) { var bx = x + b[0] * s, by = y - 1.28 * s + b[1] * s; cu.moveTo(bx, by); cu.bezierCurveTo(bx + 0.42 * s, by - 0.3 * s, bx + 0.32 * s, by - 0.95 * s, bx - 0.06 * s, by - 1.05 * s);
        [[0.35, 0.14], [0.62, 0.2], [0.86, 0.18]].forEach(function (t) { var px = bx + 0.42 * s * t[0] * (1 - t[0]) * 3, py = by - 1.0 * s * t[0]; cu.moveTo(px, py); cu.lineTo(px + t[1] * s, py - 0.06 * s); });
        cu.moveTo(bx + 0.05 * s, by - 0.12 * s); cu.quadraticCurveTo(bx - 0.12 * s, by - 0.3 * s, bx - 0.2 * s, by - 0.2 * s); });
      E.l('cuerno', cu, Math.max(1, s * 0.07));
    }
    c.restore();
    E.f('sombraSuelo', elipse(x, y + 1, 0.8 * s, 0.06 * s));
  };
  // una persona que camina (mira a la derecha; f = fase del paso): las piernas y el brazo se mueven, el cuerpo sube y baja
  A.personaAnda = function (c, x, y, s, color, f, P, amp) {
    var am = amp == null ? 1 : amp, w = TAU * f, E = A.pintor(c, P), bote = Math.abs(Math.sin(w)) * 0.015 * s * am;
    E.f('sombraSuelo', elipse(x, y + 1, 0.3 * s, 0.04 * s));
    [0, Math.PI].forEach(function (d, i) { var a = Math.sin(w + d) * am, px = x + (i ? 0.03 : -0.03) * s, alza = Math.max(0, Math.sin(w + d + 1.2)) * 0.03 * s * am, fx = px + a * 0.13 * s, fy = y - 0.035 * s - alza;
      E.f(i ? 'oscuro' : 'pielOscura', pata([[px, y - 0.22 * s - bote], [px + a * 0.07 * s, y - 0.12 * s - alza * 0.5], [fx, fy]], [0.1 * s, 0.09 * s, 0.085 * s]));
      E.f('piel', elipse(fx + 0.02 * s, fy + 0.005 * s, 0.085 * s, 0.04 * s)); });
    c.save(); c.translate(0, -bote); A.persona(c, x, y, s, color, P, { sinPiernas: true, brazo: 'abajo', balanceo: Math.sin(w) * 0.35 * am }); c.restore();
  };

  /* ================================================================== el suelo */
  // un ventisquero esculpido por el viento (más alto hacia el lado del viento) con su sombra
  A.ventisquero = function (c, a, b, y, P) {
    var E = A.pintor(c, P), m = a + (b - a) * 0.62;
    E.f('nieve', suave([[a, y + 40], [a + (b - a) * 0.15, y + 18], [m - 40, y - 4], [m, y - 10], [m + 30, y - 6], [b - (b - a) * 0.12, y + 22], [b, y + 40]]));
    E.f('nieveSombra', suave([[m + 10, y - 2], [m + 40, y + 2], [b - (b - a) * 0.1, y + 26], [b, y + 40], [m - 20, y + 40], [m, y + 20]]));
  };
  // un manojo de hierba seca que asoma de la nieve
  A.mata = function (c, x, y, k, P) {
    sembrar(x + y); var p = new Path2D();
    for (var i = 0; i < 7; i++) { var a = -Math.PI / 2 + (azar() - 0.5) * 1.1, l = (10 + azar() * 16) * k; p.moveTo(x + (azar() - 0.5) * 12 * k, y); p.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 2, y + Math.sin(a) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l); }
    A.pintor(c, P).l('hierba', p, 1.4 * Math.max(0.7, k));
  };
  // sastrugi: las crestas que el viento deja en la nieve
  A.sastrugi = function (c, x, y, l, P) { var p = new Path2D(); p.moveTo(x, y); p.quadraticCurveTo(x + l * 0.5, y - 6, x + l, y + 2); A.pintor(c, P).l('nieveSombra', p, 1.6); };
})();
