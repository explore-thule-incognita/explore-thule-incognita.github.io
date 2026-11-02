/* Thule Incognita · el paisaje
   El Ártico de Alaska en la noche polar, recorrido de lado: el estrecho de Bering (con las Diómedes en el horizonte) y la
   banquisa → Nuvuk, la punta Barrow → Utqiaġvik → la tundra → la pista de los trineos → las montañas. Cinco capas con
   paralaje (montes, lejos, medio, el camino y el primer plano). Lo fijo se pinta por teselas de 512 px y por paleta
   (mediodía polar y noche), con el taller de Vaccaria; entre las dos paletas las teselas se funden. Lo vivo (cielo,
   estrellas, Vía Láctea, luna, la aurora, las ballenas que respiran, el humo, las luces y la nieve) se pinta en cada
   fotograma. Las piezas dibujan en unidades de lámina (900 = la altura de la pantalla): ver js/arte.js. */
(function () {
  'use strict';
  var TH = window.TH, U = TH.util, E = TH.motor, A = TH.arte;
  var TAU = Math.PI * 2, K = 900, TW = 512;
  var PA = TH.paisaje = {};
  E.largo = 12;
  var LARGO = E.largo * K, HOR = A.HOR;
  PA.HOR = HOR / K;
  // (Thule no tiene tinta: el interfaz común la pregunta)
  PA.conTinta = function () { return false; }; PA.tinta = function () {}; PA.tintaGuardada = function () { return false; };

  var PAL = PA.PALETAS = { mediodia: A.MEDIODIA, noche: A.NOCHE };

  /* ================================================================== las capas y sus piezas */
  var CAPAS = [
    { id: 'montes', p: 0.1, y0: 0.4, y1: 0.64, res: 1, els: [] },
    { id: 'lejos', p: 0.35, y0: 0.46, y1: 0.7, res: 1, els: [] },
    { id: 'medio', p: 0.65, y0: 0.5, y1: 0.86, res: 1, els: [] },
    { id: 'camino', p: 1, y0: 0.5, y1: 1, res: 1, els: [] },
    { id: 'cerca', p: 1.3, y0: 0.6, y1: 1, res: 1, els: [] }
  ];
  var CAPA = {}; CAPAS.forEach(function (c) { CAPA[c.id] = c; });
  function pieza(capa, x0, x1, f) { CAPA[capa].els.push({ l0: x0 / K, l1: x1 / K, f: function (c, P, u, t0, t1) { c.scale(u / K, u / K); f(c, P, t0 * K - 60, t1 * K + 60); } }); }
  // la sombra de una cosa en el suelo, hacia donde la manda la luz de la paleta (P._sombra: -1 izquierda, 1 derecha)
  function sombra(c, P, x, y, largo, alto) { A.pintor(c, P).f('sombraSuelo', A.elipse(x + P._sombra * largo * 0.75, y, largo, alto)); }

  /* ================================================================== el recorrido */
  var LUGARES = [[0, 'El estrecho de Bering'], [2.6, 'Nuvuk · la punta Barrow'], [3.55, 'Utqiaġvik'], [6.5, 'La tundra'], [8.55, 'La pista de Nome'], [10.5, 'La cordillera Brooks']];
  PA.nombreLugar = function (l) { var n = LUGARES[0][1]; for (var i = 0; i < LUGARES.length; i++) if (l >= LUGARES[i][0]) n = LUGARES[i][1]; return n; };
  PA.LUGARES = LUGARES;
  PA.CANAL = { x0: -300, x1: 2280, y: 718, ancho: 54 };
  // las luces que se encienden (claraboyas, puertas, ventanas, la tienda) y las chimeneas que echan humo, en el camino
  var LUCES = [], CHIMENEAS = [];
  var r0 = U.azar(71), MATAS = [];
  for (var mx = 2400; mx < LARGO + 400; mx += 70 + r0() * 160) MATAS.push([mx, 800 + r0() * 90, r0()]);

  function construir() {
    /* ---- los montes: el horizonte del mar helado y, más allá, la cordillera Brooks ---- */
    pieza('montes', -200, 3200, function (c, P) {
      A.cordillera(c, A.puntosCordillera(560, 3200, HOR - 4, 80, 41), HOR, P, true);
      A.cordillera(c, A.puntosCordillera(1100, 3200, HOR, 120, 43), HOR, P);
    });
    /* ---- lejos: las Diómedes en el horizonte, las crestas del mar, la costa y montañas más cerca al final ---- */
    pieza('lejos', -200, 1500, function (c, P) {
      var E2 = A.pintor(c, P);
      // la Diómedes Grande (Rusia) y la Pequeña (Alaska): dos mesetas de roca con nieve, a 4 km una de otra
      E2.f('montLejos2', A.poli([[250, HOR + 2], [268, HOR - 22], [282, HOR - 46], [300, HOR - 52], [360, HOR - 56], [420, HOR - 52], [452, HOR - 40], [470, HOR - 20], [500, HOR + 2]])); E2.f('montSombra', A.poli([[420, HOR - 52], [452, HOR - 40], [470, HOR - 20], [500, HOR + 2], [440, HOR + 2], [430, HOR - 30]])); E2.f('montNieve2', A.poli([[282, HOR - 46], [300, HOR - 52], [360, HOR - 56], [420, HOR - 52], [400, HOR - 46], [340, HOR - 49], [300, HOR - 44]]));
      E2.f('montLejos2', A.poli([[556, HOR + 2], [566, HOR - 18], [580, HOR - 30], [620, HOR - 34], [656, HOR - 28], [668, HOR - 12], [684, HOR + 2]])); E2.f('montSombra', A.poli([[656, HOR - 28], [668, HOR - 12], [684, HOR + 2], [646, HOR + 2], [640, HOR - 18]])); E2.f('montNieve2', A.poli([[580, HOR - 30], [620, HOR - 34], [656, HOR - 28], [630, HOR - 27], [600, HOR - 28]]));
      A.crestas(c, -200, 1220, HOR + 8, 6, 9, P); A.crestas(c, -200, 1220, HOR + 24, 9, 11, P);
    });
    pieza('lejos', 1500, 3100, function (c, P) { A.sembrar(5); for (var x = 1500; x < 3100; x += 140 + A.azar() * 160) A.loma(c, x, HOR + 14, 120 + A.azar() * 120, 22 + A.azar() * 14, P); });
    pieza('lejos', 3000, 5800, function (c, P) { A.cordillera(c, A.puntosCordillera(3000, 5800, HOR + 24, 150, 47), HOR + 24, P); });
    // el bosque boreal al pie de la cordillera: una franja de piceas pequeñas
    pieza('lejos', 3150, 5800, function (c, P) { A.sembrar(77); for (var x = 3160; x < 5780; x += 5 + A.azar() * 9) A.abeto(c, x, HOR + 30 + A.azar() * 4, 12 + A.azar() * 12, P, x); });
    // lejos en la tundra: una manada de caribúes pequeña

    /* ---- medio: crestas cercanas, las casas del fondo del pueblo, caribúes y la línea del telégrafo ---- */
    pieza('medio', -200, 1700, function (c, P) { A.crestas(c, -200, 1700, 640, 13, 17, P); A.bloques(c, 420, 640, 4, 3, 0.7, P); A.bloques(c, 1300, 646, 5, 9, 0.65, P); });
    pieza('medio', 2100, 3900, function (c, P) {
      [[2300, 0.55], [2560, 0.5], [2840, 0.6], [3200, 0.48], [3520, 0.56]].forEach(function (q, i) {
        var y = 650 + i % 2 * 8; c.save(); c.translate(q[0], y); c.scale(q[1], q[1]); c.translate(-q[0], -y);
        sombra(c, P, q[0], y, 120, 9); var L = A.casaTurba(c, q[0], y, 200, 80, 20 + i, P); c.restore();
      });
      A.almacen(c, 2700, 652, P); A.umiak(c, 3020, 660, 0.6, P); A.secadero(c, 3360, 660, 0.7, P);
    });
    pieza('medio', 5000, 7400, function (c, P) {
      var cab = new Path2D(); for (var x = 5040; x < 7400; x += 230) { cab.moveTo(x, 546 + 4); cab.quadraticCurveTo(x + 115, 562, x + 230, 546 + 4); }
      for (x = 5040; x < 7400; x += 230) A.poste(c, x, 664, 118, P);
      A.pintor(c, P).l('maderaSombra', cab, 1);
    });
    // el plano medio de la pista y las montañas: grupos de piceas
    [[5180, 5420, 690, 70, 7], [5700, 5860, 686, 56, 5], [6150, 6480, 694, 80, 9], [6800, 7000, 688, 62, 6], [7200, 7480, 696, 84, 8]].forEach(function (b, i) { pieza('medio', b[0] - 40, b[1] + 40, function (c, P) { A.bosquete(c, b[0], b[1], b[2], b[3], b[4], P, 300 + i * 17); }); });

    /* ---- el camino: el estrecho y la banquisa ---- */
    pieza('camino', -300, 2400, function (c, P, xa, xb) {
      var C = PA.CANAL, E2 = A.pintor(c, P), agua = A.canal(C.x0, C.x1, C.y, C.ancho), Q = A.canalPts(C.x0, C.x1, C.y, C.ancho);
      E2.f('agua', agua);
      c.save(); c.clip(agua);
      // el agua refleja el cielo: más clara junto al hielo de enfrente
      var g = c.createLinearGradient(0, C.y - 4, 0, C.y + C.ancho); g.addColorStop(0, A.rgba(P.aguaBrillo, 0.22)); g.addColorStop(0.5, A.rgba(P.aguaBrillo, 0.04)); g.addColorStop(1, 'rgba(0,0,0,0.12)'); c.fillStyle = g; c.fillRect(xa, C.y - 20, xb - xa, C.ancho + 40);
      // la sombra que hace el canto del hielo de enfrente sobre el agua
      c.fillStyle = 'rgba(0,6,24,.28)'; c.beginPath(); Q.arriba.forEach(function (q, i) { c[i ? 'lineTo' : 'moveTo'](q[0], q[1] + 9); }); for (var i = Q.arriba.length - 1; i >= 0; i--) c.lineTo(Q.arriba[i][0], Q.arriba[i][1] - 4); c.fill();
      // reflejos horizontales y placas de hielo que flotan
      A.sembrar(91); c.lineCap = 'round';
      for (var x = C.x0; x < C.x1; x += 18 + A.azar() * 40) { var yy = C.y + 14 + A.azar() * (C.ancho - 22), l = 10 + A.azar() * 40; c.strokeStyle = A.rgba(P.aguaBrillo, 0.12 + A.azar() * 0.2); c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, yy); c.lineTo(x + l, yy); c.stroke(); }
      A.sembrar(93); for (x = C.x0 + 60; x < C.x1 - 60; x += 70 + A.azar() * 160) { var py = C.y + 16 + A.azar() * (C.ancho - 26), pr = 6 + A.azar() * 12; E2.f('agua', A.elipse(x + 2, py + 2.5, pr, pr * 0.3)); E2.f('hieloClaro', A.elipse(x, py, pr, pr * 0.3)); E2.f('nieveTop', A.elipse(x - pr * 0.2, py - pr * 0.08, pr * 0.6, pr * 0.16)); }
      c.restore();
      // el canto del hielo de enfrente (se ve su grosor) y el labio de nieve del borde de acá
      var canto = Q.arriba.map(function (q) { return [q[0], q[1] - 1]; }).concat(Q.arriba.slice().reverse().map(function (q) { return [q[0], q[1] + 7]; })); E2.f('bloqueLado', A.poli(canto));
      c.strokeStyle = A.rgba(P.nieveTop, 0.9); c.lineWidth = 2; c.beginPath(); Q.abajo.forEach(function (q, i) { c[i ? 'lineTo' : 'moveTo'](q[0], q[1] - 0.5); }); c.stroke();
    });
    pieza('camino', -100, 400, function (c, P) { A.bloques(c, 150, 700, 7, 21, 1.45, P); });
    pieza('camino', 800, 1150, function (c, P) { A.bloques(c, 980, 694, 5, 5, 1.2, P); });
    pieza('camino', 1380, 1640, function (c, P) { A.bloques(c, 1520, 712, 4, 13, 0.9, P); });
    pieza('camino', 2000, 2400, function (c, P) { A.bloques(c, 2180, 700, 6, 8, 1.3, P); });
    /* ---- Nuvuk, la punta Barrow: la playa de huesos de ballena y los troncos que trae el mar ---- */
    pieza('camino', 2380, 3150, function (c, P) { A.huesosPlaya(c, 2560, 772, P); A.troncos(c, 3020, 786, P); A.bloques(c, 2440, 706, 3, 31, 0.8, P); });

    /* ---- Utqiaġvik ---- */
    pieza('camino', 3150, 3720, function (c, P) { sombra(c, P, 3420, 782, 150, 12); A.casaTurba(c, 3420, 782, 250, 100, 7, P); });
    pieza('camino', 3560, 3860, function (c, P) { A.arco(c, 3700, 796, 268, P); });
    pieza('camino', 3380, 3560, function (c, P) { A.manta(c, 3470, 858, 62, P); });
    pieza('camino', 3860, 4120, function (c, P) { sombra(c, P, 3990, 740, 90, 6); A.casaTurba(c, 3990, 740, 160, 60, 2, P); A.pielEstirada(c, 4096, 720, P); });
    pieza('camino', 4100, 4280, function (c, P) { A.almacen(c, 4190, 728, P); });
    pieza('camino', 4260, 4560, function (c, P) { sombra(c, P, 4410, 760, 120, 7); A.umiak(c, 4410, 760, 1.22, P); });
    pieza('camino', 4760, 5150, function (c, P) { sombra(c, P, 4960, 792, 140, 11); A.casaTurba(c, 4960, 792, 230, 92, 11, P); });
    pieza('camino', 5150, 5650, function (c, P) {
      A.trineo(c, 5310, 834, 1.36, P);
    });
    pieza('camino', 5600, 5900, function (c, P) { A.umiak(c, 5760, 752, 1.05, P); });

    /* ---- la tundra: caribúes, un lago helado, un búho en su poste ---- */
    pieza('camino', 6800, 7300, function (c, P) { A.lagoHelado(c, 7040, 806, 230, 26, 3, P); });
    pieza('camino', 7300, 7480, function (c, P) { var E2 = A.pintor(c, P), p = new Path2D(); p.moveTo(7390, 800); p.lineTo(7390, 700); E2.l('maderaSombra', p, 6); E2.l('madera', p, 4); });
    pieza('camino', 5900, 6100, function (c, P) { A.sauces(c, 6000, 812, 1.1, P); A.perdiz(c, 5960, 840, 22, P); A.perdiz(c, 6010, 846, 20, P, true); });
    pieza('camino', 6700, 6900, function (c, P) { A.sauces(c, 6800, 842, 1.3, P); });
    pieza('camino', 7700, 8000, function (c, P) { A.sauces(c, 7720, 860, 1, P); });

    /* ---- la pista de Nome: el refugio de troncos, un trineo al galope ---- */
    pieza('camino', 7900, 8550, function (c, P) { A.cabana(c, 8200, 784, P); A.trineo(c, 8460, 808, 1.1, P); A.sauces(c, 8010, 800, 1, P); });
    pieza('camino', 8000, 10700, function (c, P, xa, xb) { A.rodadas(c, Math.max(8000, xa), Math.min(10700, xb), 842, P); });
    [8560, 9620, 10560].forEach(function (x) { pieza('camino', x - 40, x + 40, function (c, P) { A.tripode(c, x, 812, 90, P); }); });
    // piceas junto a la pista
    [[7720, 7900, 742, 150, 4], [8620, 8700, 760, 170, 2], [9480, 9640, 748, 180, 4], [10380, 10560, 752, 200, 5]].forEach(function (b, i) { pieza('camino', b[0] - 60, b[1] + 60, function (c, P) { A.bosquete(c, b[0], b[1], b[2], b[3], b[4], P, 500 + i * 13); }); });
    /* ---- la cordillera: la tienda del campamento con su estufa ---- */
    pieza('camino', 9600, 10500, function (c, P) {
      A.tienda(c, 9900, 792, P);
      A.trineo(c, 10180, 826, 1.2, P, { carga: true });
    });
    for (var lx = 2500; lx < LARGO; lx += 340) (function (lx) { pieza('camino', lx - 260, lx + 260, function (c, P) { A.loma(c, lx + (lx * 13 % 90), 800 + (lx * 7 % 60), 180 + (lx % 4) * 40, 14 + (lx % 3) * 4, P); }); })(lx);
    for (var ox = -200; ox < LARGO + 200; ox += 600) (function (ox) { pieza('camino', ox, ox + 600, function (c, P) { A.ondas(c, ox, ox + 600, 816 + (ox % 7) * 6, P, ox + 7); A.ondas(c, ox + 100, ox + 560, 868, P, ox + 11); }); })(ox);
    pieza('camino', 3250, 5000, function (c, P) { A.pisadas(c, 3320, 3590, 842, P, 8); A.pisadas(c, 3640, 4040, 828, P, -10); A.pisadas(c, 4120, 4560, 826, P, 6); A.pisadas(c, 4620, 4960, 838, P, -6); });
    pieza('camino', 4800, 6300, function (c, P, xa, xb) { A.rodadas(c, Math.max(4900, xa), Math.min(6250, xb), 852, P); });
    pieza('camino', 5800, 6080, function (c, P) {
      var E2 = A.pintor(c, P), cu = new Path2D(); cu.moveTo(5960, 790); cu.quadraticCurveTo(5920, 820, 5880, 826); E2.l('oscuro', cu, 1.4);
    });
    // escenas grandes fijas: un iceberg varado lejos y otro más cerca, frente a la punta
    pieza('lejos', 840, 1180, function (c, P) { A.iceberg(c, 1010, HOR + 34, 260, 84, P, 3); });
    pieza('medio', 1300, 1720, function (c, P) { A.iceberg(c, 1510, 662, 320, 128, P, 8); });
    // el pueblo, más vivo: bodegas de hielo, un kayak, bloques de hielo de agua dulce, vértebras de ballena como asientos
    pieza('camino', 3280, 5760, function (c, P) {
      A.escotilla(c, 3330, 846, P); A.escotilla(c, 4140, 832, P); A.escotilla(c, 5060, 850, P);
      A.kayak(c, 5660, 868, P);
      var E2 = A.pintor(c, P); [[3880, 816], [3906, 818], [3893, 806]].forEach(function (q) { E2.f('hieloClaro', A.rect(q[0] - 10, q[1] - 10, 20, 12)); E2.f('bloqueSombra', A.rect(q[0] + 4, q[1] - 10, 6, 12)); E2.f('nieveTop', A.rect(q[0] - 10, q[1] - 12, 20, 3)); });
      [[4240, 860], [4268, 864]].forEach(function (q) { E2.f('sombraSuelo', A.elipse(q[0] + 4, q[1] + 2, 14, 3)); E2.f('hueso', A.elipse(q[0], q[1] - 6, 12, 8)); E2.f('huesoSombra', A.elipse(q[0] + 3, q[1] - 4, 5, 3)); });
    });
    pieza('camino', 6000, 7900, function (c, P) { A.huellasZorro(c, 6020, 6700, 848, P); A.huellasZorro(c, 7300, 7880, 872, P); });
    // las matas y las crestas del viento por todo el camino (desde la punta)
    MATAS.forEach(function (q) { pieza('camino', q[0] - 30, q[0] + 30, function (c, P) { A.mata(c, q[0], q[1], 0.7 + q[2] * 0.6, P); }); });
    for (var sx = 0; sx < LARGO; sx += 260) (function (sx) { pieza('camino', sx - 10, sx + 170, function (c, P) { A.sastrugi(c, sx + (sx * 7 % 60), 830 + (sx % 3) * 22, 120 + (sx % 5) * 10, P); }); })(sx);

    /* ---- las luces y las chimeneas (calculadas con las mismas medidas que las piezas) ---- */
    [[3420, 782, 250, 100], [3990, 740, 160, 60], [4960, 792, 230, 92]].forEach(function (q) {
      var w = q[2], h = q[3], kc = w / 160, tx = q[0] - w * 0.5 - 10, px = tx - w * 0.42 * 0.42;
      LUCES.push({ x: q[0] + w * 0.06, y: q[1] - h * 0.98 + 4, r: 46 + w * 0.06, haz: kc }, { x: px, y: q[1] - 8, r: 34, suelo: true });
      CHIMENEAS.push({ x: q[0] - w * 0.18 + 2.5 * kc, y: q[1] - h * 1.12 });
    });
    LUCES.push({ x: 8149, y: 737, r: 60, suelo: true }, { x: 9900, y: 772, r: 70, suelo: true });
    CHIMENEAS.push({ x: 8271, y: 784 - 96 - 64 }, { x: 9938, y: 792 - 120 });
    LUCES.push({ x: 5310 - 52 * 1.36, y: 834 - 60 * 1.36, r: 30 });

    /* ---- el primer plano: ventisqueros, losas de hielo grandes en el mar, matas ---- */
    var CERCA = LARGO * 1.3 + 2600;
    for (var vx = -200, k2 = 0; vx < CERCA; vx += 520 + U._h(k2) * 600, k2++) (function (vx, k2) {
      pieza('cerca', vx - 40, vx + 480, function (c, P) {
        A.ventisquero(c, vx, vx + 360 + (k2 % 3) * 60, 862 + (k2 % 2) * 14, P);
        if (vx < 2600 && k2 % 2 === 0) A.bloques(c, vx + 220, 950, 4, 60 + k2, 1.9, P);
        else if (vx > 10200 && k2 % 2 === 0) A.abeto(c, vx + 260, 940, 270 + (k2 % 3) * 30, P, k2);
        else A.mata(c, vx + 300, 880, 1.6, P);
      });
    })(vx, k2);
  }

  /* ================================================================== la hora: la noche polar */
  // el sol no sale en dos meses; a mediodía el horizonte del sur se enciende y la nieve se vuelve lila
  var RITMO = [[0, 6], [8.6, 14], [10.4, 12], [13.6, 14], [15.4, 6]];   // segundos reales por hora (la noche va deprisa)
  PA.hora = 11.6; PA.velocidad = 1;
  function segPorHora(h) { var s = RITMO[0][1]; for (var i = 0; i < RITMO.length; i++) if (h >= RITMO[i][0]) s = RITMO[i][1]; return s; }
  var HORARIO = [[8.6, 'noche', 'mediodia'], [10.4, 'mediodia'], [13.6, 'mediodia', 'noche'], [15.4, 'noche']];
  PA.mezcla = function (h) {
    h = h == null ? PA.hora : h;
    var i = HORARIO.length - 1; for (var j = 0; j < HORARIO.length; j++) if (h >= HORARIO[j][0]) i = j;
    if (h < HORARIO[0][0]) i = HORARIO.length - 1;
    var q = HORARIO[i], fin = HORARIO[(i + 1) % HORARIO.length][0];
    if (!q[2]) return { a: q[1], b: null, k: 0 };
    return { a: q[1], b: q[2], k: U.suave(U.tramo(h, q[0], fin)) };
  };
  PA.peso = function (nombre, h) { var m = PA.mezcla(h); return (m.a === nombre ? 1 - m.k : 0) + (m.b === nombre ? m.k : 0); };
  PA.franja = function (h) { h = h == null ? PA.hora : h; return h >= 10.4 && h < 13.6 ? 'mediodía polar' : (h >= 8.6 && h < 10.4) || (h >= 13.6 && h < 15.4) ? 'penumbra' : 'noche polar'; };
  // la fuerza de la aurora (0…1): solo de noche, y va y viene en oleadas lentas
  PA.auroraFuerza = function () { var n = PA.peso('noche'), t = E.t / 1000; return U.clamp(n * (0.55 + 0.45 * Math.sin(t * 0.09) * Math.sin(t * 0.031 + 1)) + (1 - n) * 0.05, 0, 1); };
  // la temperatura: más frío de noche y en la banquisa
  PA.temperatura = function () { var l = E.centro ? E.centro() : 0; return Math.round(-22 - PA.peso('noche') * 9 - (l < 2.6 ? 4 : 0) - (l > 10 ? 6 : 0)); };
  function siguiente(h) { var m = PA.mezcla(h); if (m.b) return m.b; for (var d = 0.2; d < 12; d += 0.2) { var n = PA.mezcla((h + d) % 24); if (n.a !== m.a) return n.a; if (n.b && n.b !== m.a) return n.b; } return m.a; }
  // la paleta mezclada (para lo que se pinta en vivo)
  var mezclada = {}, mezclaClave = '';
  function hexDe(v) { var m = /^rgb\((\d+),(\d+),(\d+)\)$/.exec(v); return m ? '#' + [m[1], m[2], m[3]].map(function (x) { return ('0' + (+x).toString(16)).slice(-2); }).join('') : v; }
  function remuestrea(arr, n) {
    if (arr.length === n) return arr;
    var out = []; for (var i = 0; i < n; i++) { var t = i / (n - 1) * (arr.length - 1), j = Math.min(arr.length - 2, Math.floor(t)); out.push(hexDe(A.mezcla(arr[j], arr[j + 1], t - j))); }
    return out;
  }
  function mezclaValor(va, vb, k) {
    if (typeof va === 'string' && /^#[0-9a-f]{6}$/i.test(va) && typeof vb === 'string' && /^#[0-9a-f]{6}$/i.test(vb)) return hexDe(A.mezcla(va, vb, k));
    if (typeof va === 'number' && typeof vb === 'number') return va + (vb - va) * k;
    if (Array.isArray(va) && Array.isArray(vb)) { var n = Math.max(va.length, vb.length); va = remuestrea(va, n); vb = remuestrea(vb, n); return va.map(function (x, i) { return mezclaValor(x, vb[i], k); }); }
    return k > 0.5 ? vb : va;
  }
  PA.paleta = function () {
    var m = PA.mezcla(), clave = m.a + (m.b || '') + Math.round(m.k * 40);
    if (clave === mezclaClave) return mezclada;
    mezclaClave = clave; var a = PAL[m.a], b = m.b ? PAL[m.b] : null, out = {};
    for (var q in a) out[q] = b ? mezclaValor(a[q], b[q], m.k) : a[q];
    mezclada = out; return out;
  };

  /* ================================================================== las teselas (el taller de Vaccaria) */
  var cache = {}, pxGuardados = 0;
  var LIMITE = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ? 26e6 : 40e6;
  function resCapa(capa) { return Math.min(2, E.dpr * capa.res); }
  function clave(capa, i, pal) { return capa.id + '|' + i + '|' + pal; }
  function pintarTesela(capa, i, pal) {
    var d = resCapa(capa), H = E.H, u = E.u, w = Math.ceil(TW * d), h = Math.ceil((capa.y1 - capa.y0) * H * d);
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    var c = cv.getContext('2d'), P = PAL[pal];
    c.setTransform(d, 0, 0, d, -i * TW * d, -capa.y0 * H * d); c.lineJoin = 'round'; c.lineCap = 'round';
    var x0 = i * TW, x1 = x0 + TW, t0 = x0 / u, t1 = x1 / u;
    c.beginPath(); c.rect(x0, capa.y0 * H, TW, (capa.y1 - capa.y0) * H); c.clip();
    for (var k = 0; k < capa.els.length; k++) {
      var el = capa.els[k];
      if (el.l1 < t0 || el.l0 > t1) continue;
      c.save(); try { el.f(c, P, u, t0, t1); } catch (err) { console.error(err); } c.restore();
    }
    var T = { c: cv, px: w * h, usado: E.t };
    var k2 = clave(capa, i, pal); if (cache[k2]) pxGuardados -= cache[k2].px;
    cache[k2] = T; pxGuardados += T.px;
    return T;
  }
  function rango(capa, margen) { var base = (E.W / 2 + E.camX) * capa.p - E.W / 2; return [Math.floor((base - (margen || 0)) / TW), Math.floor((base + E.W + (margen || 0)) / TW)]; }
  function tieneContenido(capa, i) { var t0 = i * TW / E.u, t1 = (i + 1) * TW / E.u; for (var k = 0; k < capa.els.length; k++) if (!(capa.els[k].l1 < t0 || capa.els[k].l0 > t1)) return true; return false; }
  function liberar() {
    if (pxGuardados <= LIMITE) return;
    var lista = []; for (var q in cache) lista.push([q, cache[q]]);
    lista.sort(function (a, b) { return a[1].usado - b[1].usado; });
    for (var j = 0; j < lista.length && pxGuardados > LIMITE * 0.85; j++) { if (E.t - lista[j][1].usado < 400) break; pxGuardados -= lista[j][1].px; delete cache[lista[j][0]]; }
  }
  PA.olvidar = function () { cache = {}; pxGuardados = 0; mezclaClave = ''; aurora.cv = null; via = null; };
  var pendientes = 0;
  function tareas() {
    var m = PA.mezcla(), pals = [m.a], lista = [];
    if (m.b) pals.push(m.b);
    var sig = siguiente(PA.hora); if (pals.indexOf(sig) < 0) pals.push(sig);
    var dir = E.velX > 0.05 || (E.camObj != null && E.camObj > E.camX) ? 1 : E.velX < -0.05 || (E.camObj != null && E.camObj < E.camX) ? -1 : 0;
    pals.forEach(function (pal, pi) {
      CAPAS.forEach(function (capa) {
        var vr = rango(capa, 0), cr = rango(capa, E.W * 0.9);
        for (var i = cr[0]; i <= cr[1]; i++) {
          if (cache[clave(capa, i, pal)] || !tieneContenido(capa, i)) continue;
          var visible = i >= vr[0] && i <= vr[1], dist = visible ? 0 : (i < vr[0] ? vr[0] - i : i - vr[1]);
          lista.push({ capa: capa, i: i, pal: pal, prio: (visible ? 0 : 10 + dist * 2 - (dir && (i - vr[0]) * dir > 0 ? 1 : 0)) + pi * 4 + (pi === 2 ? 20 : 0) });
        }
      });
    });
    lista.sort(function (a, b) { return a.prio - b.prio; });
    return lista;
  }
  function taller() {
    var presupuesto = E.bloqueado ? 40 : (E.camObj != null || Math.abs(E.velX) > 0.02) ? 4 : 10;
    var t0 = performance.now(), lista = tareas(), j = 0;
    pendientes = lista.filter(function (x) { return x.prio < 30; }).length;
    while (j < lista.length && performance.now() - t0 < presupuesto) { var tt = lista[j++]; pintarTesela(tt.capa, tt.i, tt.pal).usado = E.t; E.vaciar(); }
    liberar();
  }
  PA.ocupado = function () { return pendientes > 0; };
  PA._taller = { tareas: tareas, cache: function () { return cache; }, px: function () { return pxGuardados; }, capas: CAPAS };
  PA.preparar = function () {
    var m = PA.mezcla();
    [m.a].concat(m.b ? [m.b] : []).forEach(function (pal) { CAPAS.forEach(function (capa) { var vr = rango(capa, 0); for (var i = vr[0]; i <= vr[1]; i++) if (!cache[clave(capa, i, pal)] && tieneContenido(capa, i)) pintarTesela(capa, i, pal); }); });
    E.vaciar();
  };

  /* ================================================================== lo vivo: el cielo */
  PA.luna = function (h) { h = h == null ? PA.hora : h; var s = ((h - 14.5 + 24) % 24) / 16; return { x: E.W * (0.12 + 0.76 * s), y: E.H * (HOR / K - Math.sin(Math.PI * U.clamp(s, -0.1, 1.1)) * 0.42), r: E.H * 0.028, visible: s > -0.05 && s < 1.05 }; };
  var estrellas = []; (function () { var r2 = U.azar(9); for (var i = 0; i < 460; i++) estrellas.push({ x: r2(), y: Math.pow(r2(), 1.25) * 0.58, s: r2() < 0.06 ? 2.2 : 1.1, f: r2() * TAU, v: 0.6 + r2() * 1.8, b: r2() }); })();
  // la Vía Láctea: una banda de polvo de estrellas en diagonal, pintada una vez
  var via = null;
  function viaLactea() {
    if (via) return via;
    var d = Math.min(2, E.dpr), w = E.W, h = E.H * HOR / K, cv = document.createElement('canvas'); cv.width = Math.ceil(w * d); cv.height = Math.ceil(h * d);
    var c = cv.getContext('2d'); c.scale(d, d); c.translate(w * 0.52, h * 0.42); c.rotate(-0.42);
    var g = c.createLinearGradient(0, -h * 0.17, 0, h * 0.17); g.addColorStop(0, 'rgba(150,170,230,0)'); g.addColorStop(0.5, 'rgba(150,170,230,.1)'); g.addColorStop(1, 'rgba(150,170,230,0)'); c.fillStyle = g; c.fillRect(-w, -h * 0.17, w * 2, h * 0.34);
    var r = U.azar(61); for (var i = 0; i < 1400; i++) { var u = (r() - 0.5) * w * 1.6, v = (r() + r() + r() - 1.5) * h * 0.13; c.fillStyle = 'rgba(220,230,255,' + (0.15 + r() * 0.4) + ')'; c.fillRect(u, v, 1, 1); }
    return (via = cv);
  }
  // la aurora: cortinas con pliegues que se mueven despacio. Se pinta a media resolución en un lienzo propio y se renueva
  // unas doce veces por segundo (rayos con su degradado de verde a violeta, y el borde de abajo magenta)
  var aurora = { cv: null, t: -1e9 };
  var CORT = [[-0.25, 0.66, 0.41, 0.28, 0.28, 0.033, 0.6, 0.019], [0.32, 1.28, 0.27, 0.22, 0.21, 0.027, 2.1, 0.021], [-0.2, 0.46, 0.52, 0.5, 0.16, 0.016, 4.2, 0.01], [0.05, 1.12, 0.17, 0.13, 0.15, 0.02, 5.3, 0.014]];
  function pintarAurora(fuerza) {
    var W = E.W, H = E.H, s = 0.5, w = Math.ceil(W * s), h = Math.ceil(H * HOR / K * s);
    if (!aurora.cv || aurora.cv.width !== w || aurora.cv.height !== h) { aurora.cv = document.createElement('canvas'); aurora.cv.width = w; aurora.cv.height = h; }
    var c = aurora.cv.getContext('2d'), t = E.t / 1000; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
    if (fuerza < 0.02) return;
    c.globalCompositeOperation = 'lighter'; c.lineCap = 'butt';
    var desp = -(E.camX / Math.max(1, E.maxCam())) * 0.18, estrecha = U.clamp(W / (H * 1.6), 0.4, 1);
    CORT.forEach(function (k, j) {
      var nn = PA.peso('noche'), x0 = k[0], x1 = k[1], b0 = k[2], b1 = k[3], h0 = k[4], amp = k[5], fase = k[6] + t * 0.05, pl = k[7], fj = [1, 1, 0.8 * (0.25 + 0.75 * nn), 0.42][j], n = 0;
      for (var q = 0; q <= 1.0001; q += 0.0045, n++) {
        var x = (x0 + (x1 - x0) * q + pl * Math.sin(q * 17 + fase + t * 0.13) * (0.55 + 0.45 * Math.sin(q * 5 + fase)) + desp) * W;
        var y = (b0 + (b1 - b0) * q + amp * Math.sin(q * 8.2 + fase) + amp * 0.35 * Math.sin(q * 23 + fase * 2.3)) * H;
        var alto = h0 * H * (0.42 + 0.58 * (0.5 + 0.5 * Math.sin(q * 11 + fase * 1.7 + t * 0.2)) * (0.72 + 0.28 * Math.sin(q * 41 + fase))) * Math.pow(Math.sin(Math.PI * q), 0.45);
        var al = Math.min(1.6, fuerza) * (0.55 + 0.45 * estrecha) * fj * (0.3 + 0.7 * Math.pow((0.5 + 0.5 * Math.sin(n * 0.11 + j * 1.3 + t * 0.4)) * (0.6 + 0.4 * Math.sin(n * 0.37 + j - t * 0.3)), 1.2));
        if (al < 0.01) continue;
        var g = c.createLinearGradient(0, y * s, 0, (y - alto) * s);
        g.addColorStop(0, 'rgba(93,255,174,0)'); g.addColorStop(0.05, 'rgba(93,255,174,' + (0.55 * al).toFixed(3) + ')'); g.addColorStop(0.3, 'rgba(47,220,174,' + (0.32 * al).toFixed(3) + ')'); g.addColorStop(0.68, 'rgba(106,108,255,' + (0.12 * al).toFixed(3) + ')'); g.addColorStop(1, 'rgba(160,102,255,0)');
        c.strokeStyle = g; c.lineWidth = (7 + 5 * (0.5 + 0.5 * Math.sin(n * 0.31))) * s * E.u / K * 1.4 * estrecha; c.beginPath(); c.moveTo(x * s, (y + 3) * s); c.lineTo(x * s, (y - alto) * s); c.stroke();
        if (n % 2 === 0 && j < 3) { c.strokeStyle = 'rgba(255,90,180,' + (0.2 * al).toFixed(3) + ')'; c.lineWidth = 2 * s; c.beginPath(); c.moveTo(x * s, (y - 2) * s); c.lineTo(x * s, (y + 9 * E.u / K) * s); c.stroke(); }
        if (n % 3 === 0) { c.strokeStyle = 'rgba(210,255,230,' + (0.35 * al).toFixed(3) + ')'; c.lineWidth = 1.4 * s; c.beginPath(); c.moveTo(x * s, (y + 2) * s); c.lineTo(x * s, (y - alto * 0.35) * s); c.stroke(); }
      }
    });
  }
  PA.aurora = aurora;

  /* ================================================================== lo vivo: las ballenas, el humo y la nieve */
  // dos ballenas que salen a respirar en el canal: sale el lomo, sopla, se hunde y enseña la cola (ciclo de 26 s)
  var BALLENAS = PA.BALLENAS = [{ x: 420, t0: 0 }, { x: 1680, t0: 13000 }], CICLO_B = 26000;
  PA.ballena = function (b, t) {
    var k = ((t == null ? E.t : t) + b.t0) % CICLO_B;
    if (k < 3000) return { fase: 'sale', u: k / 3000 };
    if (k < 7000) return { fase: 'sopla', u: (k - 3000) / 4000 };
    if (k < 9000) return { fase: 'baja', u: (k - 7000) / 2000 };
    if (k < 12500) return { fase: 'cola', u: (k - 9000) / 3500 };
    return null;
  };
  function pintarBallenas(ctx, P) {
    var C = PA.CANAL, y = C.y + 34, E2 = A.pintor(ctx, P);
    BALLENAS.forEach(function (b) {
      var f = PA.ballena(b); if (!f) return;
      ctx.save(); ctx.beginPath(); ctx.rect(b.x - 200, y - 260, 400, 260 + 2); ctx.clip();
      if (f.fase !== 'cola') {
        var alto = f.fase === 'sale' ? U.suave(f.u) : f.fase === 'baja' ? 1 - U.suave(f.u) : 1;
        ctx.save(); ctx.translate(0, (1 - alto) * 30); E2.f('ballena', A.lomoBallena(b.x, y, 1.3)); ctx.restore();
        ctx.strokeStyle = A.rgba(P.espuma[0] === '#' ? P.espuma : '#dceeff', 0.5); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(b.x, y + 2, 110 * (0.6 + alto * 0.4), 5, 0, Math.PI, TAU); ctx.stroke();
        if (f.fase === 'sopla') vaho(ctx, b.x - 48, y - 26, f.u, P);
      } else {
        var sube = f.u < 0.4 ? U.suave(f.u / 0.4) : 1 - U.suave((f.u - 0.4) / 0.6);
        ctx.save(); ctx.translate(0, (1 - sube) * 110); E2.f('ballena', A.colaBallena(b.x + 40, y, 1)); ctx.restore();
        ctx.fillStyle = 'rgba(220,240,255,' + (0.6 * sube).toFixed(3) + ')'; for (var i = 0; i < 8; i++) { var gx = b.x + 40 + (i - 3.5) * 16, gy = y - 70 * sube + ((E.t / 4 + i * 37) % 70); if (gy < y) { ctx.beginPath(); ctx.arc(gx, gy, 1.6, 0, TAU); ctx.fill(); } }
      }
      ctx.restore();
      ctx.fillStyle = 'rgba(230,244,255,.35)'; ctx.beginPath(); ctx.ellipse(b.x + (f.fase === 'cola' ? 40 : 0), y + 4, 50, 4, 0, 0, TAU); ctx.fill();
    });
  }
  // el soplo: dos chorros de niebla en V que se abren y se deshacen (u: 0…1 de la vida del soplo)
  function vaho(c, x, y, u, P) {
    var col = PA.peso('noche') > 0.5 ? '225,240,255' : '255,240,246', vida = Math.sin(Math.PI * Math.min(1, u * 1.1));
    [-0.4, 0.4].forEach(function (a) { for (var j = 0; j < 9; j++) { var t = j / 8 * Math.min(1, u * 2.4), px = x + Math.sin(a) * 78 * t + (a > 0 ? 6 : -6), py = y - 6 - Math.cos(a) * 82 * t - u * 14, r = 5 + t * 18 + u * 10, g = c.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(' + col + ',' + ((0.42 - t * 0.3) * vida).toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); c.fillStyle = g; c.fillRect(px - r, py - r, r * 2, r * 2); } });
  }
  // el humo de las chimeneas: bocanadas blandas que suben y se tuercen con el viento
  var humo = [], ultHumo = 0;
  function moverHumo(dt) {
    if (E.t - ultHumo > 520) { ultHumo = E.t; CHIMENEAS.forEach(function (ch) { humo.push({ x: ch.x, y: ch.y, t: E.t, r: 4 + Math.random() * 3, vx: 6 + Math.random() * 6, vy: -16 - Math.random() * 6 }); }); }
    for (var i = humo.length - 1; i >= 0; i--) { var q = humo[i]; if (E.t - q.t > 6500) { humo.splice(i, 1); continue; } q.x += (q.vx + vientoNieve * 14) * dt / 1000; q.y += q.vy * dt / 1000; q.vy *= Math.pow(0.995, dt / 16); }
  }
  function pintarHumo(ctx) {
    var noche = PA.peso('noche'), col = noche > 0.5 ? '170,190,220' : '235,215,230';
    for (var i = 0; i < humo.length; i++) { var q = humo[i], k = (E.t - q.t) / 6500; if (k < 0 || k > 1) continue; var r = q.r + 26 * Math.sqrt(k), a = Math.pow(1 - k, 1.4) * 0.16, g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, r); g.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); ctx.fillStyle = g; ctx.fillRect(q.x - r, q.y - r, r * 2, r * 2); }
  }
  // las luces: halo en tres capas, la luz en la nieve y el haz que sube de las claraboyas; parpadean un poco
  function pintarLuces(ctx, xa, xb) {
    var noche = PA.peso('noche'), k = 0.55 + noche * 0.45, t = E.t / 1000;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    LUCES.forEach(function (L, i) {
      if (L.x < xa - 300 || L.x > xb + 300) return;
      var f = k * (0.92 + 0.08 * Math.sin(t * 7 + i * 3) * Math.sin(t * 3.1 + i)), r = L.r, g;
      g = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, r * 3); g.addColorStop(0, 'rgba(255,180,90,' + (0.12 * f).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,170,80,0)'); ctx.fillStyle = g; ctx.fillRect(L.x - r * 3, L.y - r * 3, r * 6, r * 6);
      g = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, r); g.addColorStop(0, 'rgba(255,200,110,' + (0.5 * f).toFixed(3) + ')'); g.addColorStop(0.35, 'rgba(255,170,80,' + (0.16 * f).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = g; ctx.fillRect(L.x - r, L.y - r, r * 2, r * 2);
      g = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, r * 0.3); g.addColorStop(0, 'rgba(255,245,220,' + (0.7 * f).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,220,160,0)'); ctx.fillStyle = g; ctx.fillRect(L.x - r * 0.3, L.y - r * 0.3, r * 0.6, r * 0.6);
      if (L.suelo) { ctx.save(); ctx.translate(L.x, L.y + 12); ctx.scale(1, 0.24); g = ctx.createRadialGradient(0, 0, 2, 0, 0, r * 1.4); g.addColorStop(0, 'rgba(255,190,100,' + (0.4 * f).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,190,100,0)'); ctx.fillStyle = g; ctx.fillRect(-r * 1.4, -r * 1.4, r * 2.8, r * 2.8); ctx.restore(); }
      if (L.haz) for (var j = 0; j < 6; j++) { var a = 0.03 * f * (1 - j / 7), d = 4 + j * 7, kh = L.haz; g = ctx.createLinearGradient(0, L.y, 0, L.y - 120 * kh); g.addColorStop(0, 'rgba(255,200,120,' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(L.x - 8 * kh, L.y); ctx.lineTo(L.x + 8 * kh, L.y); ctx.lineTo(L.x + (8 + d) * kh, L.y - 120 * kh); ctx.lineTo(L.x - (2 + d) * kh, L.y - 120 * kh); ctx.closePath(); ctx.fill(); }
    });
    ctx.restore();
  }
  // la nieve que cae (en pantalla) y la que el viento arrastra a ras de suelo
  var copos = []; (function () { var r = U.azar(23); for (var i = 0; i < 170; i++) copos.push({ x: r(), y: r(), r: 0.6 + r() * 1.7, v: 0.012 + r() * 0.03, f: r() * TAU, a: 0.25 + r() * 0.5 }); })();
  var rafagas = []; (function () { var r = U.azar(29); for (var i = 0; i < 46; i++) rafagas.push({ x: r(), y: 0.84 + r() * 0.16, l: 0.05 + r() * 0.07, v: 0.06 + r() * 0.1 }); })();

  // el viento de la nieve y del humo: propio, suave, que sube y baja solo (no hace caso al ratón); desp es lo que ha
  // empujado hasta ahora, así un cambio de viento no hace saltar los copos (Pau 02/11: «si paso el cursor, se mueve la nieve»)
  var vientoNieve = 0.4, desp = 0;
  /* ---- las escenas vivas grandes ---- */
  // el salto de la ballena: cada 46 s, una ballena sale del agua casi entera en el canal y cae de lado
  var SALTO = { x: 760, ciclo: 46000, dur: 4200 };
  PA.salto = function (t) { var k = ((t == null ? E.t : t) + 9000) % SALTO.ciclo; return k < SALTO.dur ? k / SALTO.dur : null; };
  var spray = [];
  function pintarSalto(ctx, P) {
    var u = PA.salto(), C = PA.CANAL, agua = C.y + 30; if (u == null) { spray.length = 0; return; }
    // la trayectoria: sale inclinada, sube, gira en el aire y cae de lado
    var sube = Math.sin(Math.PI * Math.min(1, u / 0.78)), x = SALTO.x + u * 70, y = agua + 70 - sube * 210, ang = -1.25 + u * 1.9, l = 250;
    ctx.save(); ctx.beginPath(); ctx.rect(x - 400, agua - 600, 800, 600 + 6); ctx.clip(); A.ballenaEntera(ctx, x, y, l, ang, P); ctx.restore();
    // el agua que chorrea al salir y la explosión al caer
    if (u < 0.35) for (var i = 0; i < 4; i++) spray.push({ x: x + (Math.random() - 0.5) * 70, y: agua, vx: (Math.random() - 0.5) * 140, vy: -160 - Math.random() * 300, t: E.t, r: 0.8 + Math.random() * 1.8 });
    if (u > 0.74 && u < 0.9) for (i = 0; i < 10; i++) spray.push({ x: SALTO.x + 60 + (Math.random() - 0.5) * 180, y: agua, vx: (Math.random() - 0.5) * 340, vy: -220 - Math.random() * 480, t: E.t, r: 0.8 + Math.random() * 2.4 });
    var col = PA.peso('noche') > 0.5 ? '225,240,255' : '255,244,248';
    // la nube de espuma que queda en el aire tras la caída
    if (u > 0.76) { var kn = (u - 0.76) / 0.24, rn = 60 + kn * 110, gn = ctx.createRadialGradient(SALTO.x + 60, agua - 30 - kn * 30, 0, SALTO.x + 60, agua - 30 - kn * 30, rn); gn.addColorStop(0, 'rgba(' + (PA.peso('noche') > 0.5 ? '225,240,255' : '255,244,248') + ',' + (0.45 * (1 - kn)).toFixed(3) + ')'); gn.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gn; ctx.fillRect(SALTO.x + 60 - rn, agua - 30 - kn * 30 - rn, rn * 2, rn * 2); }
    for (i = spray.length - 1; i >= 0; i--) { var q = spray[i], k = (E.t - q.t) / 1000; var px = q.x + q.vx * k, py = q.y + q.vy * k + 520 * k * k; if (py > agua + 4 || k > 2) { spray.splice(i, 1); continue; } ctx.strokeStyle = 'rgba(' + col + ',' + (0.8 - k * 0.3).toFixed(3) + ')'; ctx.lineWidth = q.r; ctx.lineCap = 'round'; var vy2 = q.vy + 1040 * k; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - q.vx * 0.012, py - vy2 * 0.012); ctx.stroke(); }
    // la espuma en la superficie
    var e = Math.max(Math.sin(Math.PI * Math.min(1, u / 0.3)) * (u < 0.3 ? 1 : 0), u > 0.74 ? 1 - (u - 0.74) / 0.26 : 0);
    if (e > 0) { var ex = u > 0.6 ? SALTO.x + 60 : SALTO.x; ctx.fillStyle = 'rgba(' + col + ',' + (0.7 * e).toFixed(3) + ')'; ctx.beginPath(); ctx.ellipse(ex, agua + 2, 90 * (0.6 + e), 7, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(' + col + ',' + (0.5 * e).toFixed(3) + ')'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(ex, agua + 4, 150 * (0.6 + (1 - e)), 10, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); }
  }
  // la migración: cada 60 s cruza la tundra (en el plano medio) una manada de caribúes al trote
  var MANADA = (function () { var r = U.azar(41), l = []; for (var i = 0; i < 24; i++) l.push({ dx: i * 34 + r() * 30, y: 692 + r() * 30, s: 14 + r() * 5, f: r(), cu: r() < 0.6 }); l.sort(function (a, b) { return a.y - b.y; }); return l; })();
  function pintarMigracion(ctx, P) {
    var k = (E.t % 60000) / 30000; if (k > 1) return;
    var x0 = U.lerp(5200, 3000, k), tt = E.t / 1000;
    MANADA.forEach(function (c2) { A.caribuCorre(ctx, x0 + c2.dx, c2.y, c2.s, (tt * 1.7 + c2.f) % 1, P, c2.cu); });
    // el polvo de nieve que levantan
    ctx.fillStyle = PA.peso('noche') > 0.5 ? 'rgba(220,235,255,.18)' : 'rgba(255,245,250,.25)';
    for (var i = 0; i < 10; i++) { ctx.beginPath(); ctx.ellipse(x0 + 30 + i * 80 + Math.sin(tt * 3 + i) * 10, 716, 50, 7, 0, 0, TAU); ctx.fill(); }
  }
  /* ---- todo lo que se mueve (antes quieto) ---- */
  // un paseo de ida y vuelta (Pau 02/11: «más fluidos»): arranca y frena con suavidad, se para y se da la vuelta girando.
  // Devuelve x, hacia dónde mira (sx de 1 a −1, pasando por el giro) y cuánto anda ahora (amp, 0…1, para las patas)
  function patrulla(t, x0, x1, v, pausa, fase) {
    var L = x1 - x0, tw = L / v, ciclo = 2 * (tw + pausa), u = (((t + (fase || 0) * ciclo) % ciclo) + ciclo) % ciclo, a = 0.18, vm = 1 / (1 - a);
    function pos(k) { return k < a ? vm * k * k / (2 * a) : k < 1 - a ? vm * (a / 2 + (k - a)) : 1 - vm * (1 - k) * (1 - k) / (2 * a); }
    function vel(k) { return k < a ? k / a : k > 1 - a ? (1 - k) / a : 1; }
    function giro(q) { return Math.cos(Math.PI * U.clamp((q - pausa * 0.3) / (pausa * 0.4), 0, 1)); }
    if (u < tw) return { x: x0 + L * pos(u / tw), sx: 1, amp: vel(u / tw) };
    u -= tw; if (u < pausa) return { x: x1, sx: giro(u), amp: 0 };
    u -= pausa; if (u < tw) return { x: x1 - L * pos(u / tw), sx: -1, amp: vel(u / tw) };
    u -= tw; return { x: x0, sx: -giro(u), amp: 0 };
  }
  // dibuja con la cara hacia sx (1 = la de su dibujo, −1 = al revés; en medio, el giro)
  function girado(ctx, x, sx, f) { ctx.save(); ctx.translate(x, 0); ctx.scale(Math.abs(sx) < 0.12 ? (sx < 0 ? -0.12 : 0.12) : sx, 1); ctx.translate(-x, 0); f(); ctx.restore(); }
  function suaveOnda(t) { var v = 0.5 - 0.5 * Math.cos(t); return v * v * (3 - 2 * v); }
  // el oso camina por la banquisa de un lado a otro, se para a olfatear y vuelve
  var OSO = { x0: 1080, x1: 1460, y: 714, s: 1.25 };
  PA.osoPos = function (t) {
    if (PA.osoQuieto) return PA.osoQuieto;
    var p = patrulla((t == null ? E.t : t) / 1000, OSO.x0, OSO.x1, 22, 6, 0.3);
    return { x: p.x, y: OSO.y, dir: p.sx >= 0 ? 1 : -1, sx: p.sx, amp: p.amp, anda: p.amp > 0.02, f: ((p.x / 64) % 1 + 1) % 1 };
  };
  var vahosVivos = [];
  function vahoVivo(id, x, y, dir, cada) { var v = vahosVivos[id] || (vahosVivos[id] = { t: -1e9, l: [] }); if (E.t - v.t > cada) { v.t = E.t; v.l.push({ x: x, y: y, d: dir, t: E.t }); } }
  function pintarVahos(ctx) { var col = PA.peso('noche') > 0.5 ? '230,240,255' : '255,245,250'; for (var id in vahosVivos) { var l = vahosVivos[id].l; for (var i = l.length - 1; i >= 0; i--) { var q = l[i], k = (E.t - q.t) / 1700; if (k > 1 || k < 0) { l.splice(i, 1); continue; } var r = 3 + k * 14, x = q.x + q.d * k * 12, y = q.y - k * 9, g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + col + ',' + (0.38 * (1 - k)).toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); } } }
  function vaiven(t, x0, x1, v, fase) { var l = x1 - x0, d = ((t * v + fase * l * 2) % (l * 2) + l * 2) % (l * 2); return d < l ? { x: x0 + d, dir: 1 } : { x: x1 - (d - l), dir: -1 }; }
  function espejo(ctx, x, dir, f) { ctx.save(); if (dir < 0) { ctx.translate(x * 2, 0); ctx.scale(-1, 1); } f(); ctx.restore(); }
  var OSO_VIVO = function (ctx, P) { var tt = E.t / 1000; var o = PA.osoPos(), sx = o.sx == null ? o.dir : o.sx; girado(ctx, o.x, -sx, function () { A.oso(ctx, o.x, o.y, OSO.s, P, false, o.f || 0, o.amp || 0); }); vahoVivo('oso', o.x + o.dir * 92, o.y - 58, o.dir, 2300); };
  var VIVOS = [
    // la foca respira, levanta la cabeza a ratos
    [1680, 1880, function (ctx, P, tt) { var sube = suaveOnda(tt * 0.5) * 0.1; ctx.save(); ctx.translate(1780 - 46 * 1.1, 830); ctx.rotate(-sube * 0.5); ctx.translate(-(1780 - 46 * 1.1), -830); A.foca(ctx, 1780, 830, 46, P); ctx.restore(); }],
    // dos zorros: uno trota cerca de la foca, otro cruza la tundra
    [1800, 2140, function (ctx, P, tt) { var z = patrulla(tt, 1880, 2100, 34, 3, 0); girado(ctx, z.x, -z.sx, function () { A.zorro(ctx, z.x, 866, 36, P, ((z.x / 30) % 1 + 1) % 1, z.amp); }); }],
    [7380, 7900, function (ctx, P, tt) { var z = patrulla(tt, 7420, 7860, 40, 2.5, 0.4); girado(ctx, z.x, -z.sx, function () { A.zorro(ctx, z.x, 862, 34, P, ((z.x / 28) % 1 + 1) % 1, z.amp); }); }],
    // la gente del pueblo: quieta, pero se mueve (balancea los brazos, respira); le sale el vaho
    [3500, 3680, function (ctx, P, tt) { A.persona(ctx, 3612, 808, 98, 'parka', P, { brazo: 'abajo', balanceo: Math.sin(tt * 0.9) * 0.18 }); var sal = Math.pow(Math.abs(Math.sin(tt * 2.2)), 1.6) * 3; ctx.save(); ctx.translate(0, -sal); A.persona(ctx, 3560, 818, 60, 'parka4', P, { brazo: 'abajo', balanceo: Math.sin(tt * 4.4) * 0.5 }); ctx.restore(); vahoVivo('p1', 3618, 808 - 98 * 0.85, 1, 2600); }],
    [4520, 4640, function (ctx, P, tt) { A.persona(ctx, 4580, 766, 72, 'parka3', P, { brazo: 'abajo', balanceo: 0.5 + Math.sin(tt * 1.6) * 0.35 }); }],
    [4590, 4790, function (ctx, P, tt) { A.secadero(ctx, 4680, 764, 1.3, P, tt); }],
    [5130, 5260, function (ctx, P, tt) { A.persona(ctx, 5190, 830, 86, 'parka2', P, { brazo: 'abajo', balanceo: Math.sin(tt * 0.7) * 0.2 }); vahoVivo('p2', 5196, 830 - 86 * 0.85, 1, 2900); }],
    [5920, 6040, function (ctx, P, tt) { A.persona(ctx, 5980, 836, 84, 'parka3', P, { brazo: 'abajo', balanceo: Math.sin(tt * 0.4) * 0.12 }); vahoVivo('caz', 5986, 836 - 84 * 0.85, -1, 3100); }],
    [5800, 5900, function (ctx, P, tt) { var sube = suaveOnda(tt * 0.6 + 1) * 0.12; ctx.save(); ctx.translate(5850 - 32 * 1.1, 834); ctx.rotate(-sube * 0.5); ctx.translate(-(5850 - 32 * 1.1), -834); A.foca(ctx, 5850, 834, 32, P); ctx.restore(); }],
    [9730, 9850, function (ctx, P, tt) { A.persona(ctx, 9790, 804, 84, 'parka', P, { brazo: 'abajo', balanceo: 0.9 + Math.sin(tt * 2) * 0.25 }); vahoVivo('p3', 9796, 804 - 84 * 0.85, 1, 2500); }],
    // los perros dormidos respiran
    [3760, 3880, function (ctx, P, tt) { respira(ctx, 3820, 846, tt, 0, function () { A.perroDormido(ctx, 3820, 846, 44, P); }); }],
    [5400, 5620, function (ctx, P, tt) { [[5440, 852, 0], [5510, 840, 1], [5580, 858, 0]].forEach(function (q, i) { respira(ctx, q[0], q[1], tt, i, function () { A.perroDormido(ctx, q[0], q[1], 40, P, q[2]); }); }); }],
    [10290, 10440, function (ctx, P, tt) { [[10330, 846, 1], [10400, 838, 0]].forEach(function (q, i) { respira(ctx, q[0], q[1], tt, i + 3, function () { A.perroDormido(ctx, q[0], q[1], 40, P, q[2]); }); }); }],
    // el husky del pueblo pasea junto al umiak, se para y sigue
    [4140, 4520, function (ctx, P, tt) { var z = patrulla(tt, 4180, 4480, 26, 3.5, 0.1); girado(ctx, z.x, z.sx, function () { A.perroGalope(ctx, z.x, 812, 30, ((z.x / 26) % 1 + 1) % 1, P, false, 0.06 + 0.36 * z.amp); }); }],
    // los búhos: parpadean y giran la cabeza
    [4180, 4260, function (ctx, P, tt) { A.buho(ctx, 4216, 622, 20, P, buhoOp(tt, 0)); }],
    [7350, 7430, function (ctx, P, tt) { A.buho(ctx, 7390, 702, 24, P, buhoOp(tt, 2.1)); }],
    // los caribúes de la tundra: unos pastan y otros caminan despacio
    [6000, 6820, function (ctx, P, tt) {
      [[6160, 782, 30, 0], [6380, 790, 34, 0], [6560, 778, 28, 0]].forEach(function (q, i) { var kp = pastar(tt, i); A.caribu(ctx, q[0], q[1], q[2], kp, P, i === 1); if (kp < 0.3) vahoVivo('cb' + i, q[0] + (i === 1 ? -1 : 1) * q[2] * 0.95, q[1] - q[2] * 1.3, i === 1 ? -1 : 1, 2600); });
      [[6060, 6400, 772, 26, 0.2], [6420, 6760, 796, 32, 0.6], [6250, 6600, 768, 24, 0.9]].forEach(function (q, i) { var z = patrulla(tt, q[0], q[1], 11, 5, q[4]); girado(ctx, z.x, -z.sx, function () { A.caribuCorre(ctx, z.x, q[2], q[3], ((z.x / (q[3] * 1.6)) % 1 + 1) % 1, P, true, 0.08 + 0.26 * z.amp); }); });
    }],
    // los bueyes almizcleros: quietos, con el vaho del aliento y la cabeza que sube y baja
    [7700, 8000, function (ctx, P, tt) { [[7770, 820, 52, 0], [7880, 808, 46, 1], [7930, 836, 56, 0]].forEach(function (q, i) { var cab = suaveOnda(tt * 0.5 + i * 1.7) * 0.05; ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(q[3] ? -cab : cab); ctx.translate(-q[0], -q[1]); A.buey(ctx, q[0], q[1], q[2], P, !!q[3]); ctx.restore(); var dx = (q[3] ? 1 : -1) * q[2] * 1.12; vahoVivo('bu' + i, q[0] + dx, q[1] - q[2] * 0.42, q[3] ? 1 : -1, 2400 + i * 300); }); }],
    // el trineo de la pista: ahora corre de verdad
    [8200, 10800, function (ctx, P, tt) { var k = (E.t % 42000) / 24000; if (k > 1) return; var x = U.lerp(8250, 10500, U.suave(k)), y = 846; A.trineo(ctx, x, y, 1.36, P); A.persona(ctx, x - 70, y - 4, 92, 'parka2', P); var cu = new Path2D(); cu.moveTo(x + 80, y - 19); cu.lineTo(x + 80 + 7 * 64, y - 19); A.pintor(ctx, P).l('oscuro', cu, 1.4); for (var i = 0; i < 7; i++) A.perroGalope(ctx, x + 140 + i * 64, y + (i % 2 ? 6 : -6), i % 2 ? 37 : 34, (tt * 2.4 + i * 0.27) % 1, P); }]
  ];
  function respira(ctx, x, y, tt, i, f) { var k = 1 + Math.sin(tt * 1.6 + i * 1.3) * 0.035; ctx.save(); ctx.translate(x, y); ctx.scale(1, k); ctx.translate(-x, -y); f(); ctx.restore(); }
  function buhoOp(tt, f) { var g = U.clamp(Math.sin(tt * 0.23 + f) * 1.8, -1, 1), b = (tt + f * 3) % 4.2; return { giro: g * Math.abs(g) * (3 - 2 * Math.abs(g)) * Math.sign(g) * Math.sign(g), ojos: b < 0.26 ? 1 - Math.sin(Math.PI * b / 0.26) : 1 }; }
  // cuánto tiene la cabeza baja un caribú que pasta (0…1), con subidas y bajadas suaves
  function pastar(tt, i) { var v = U.clamp(Math.sin(tt * 0.22 + i * 2.1) * 1.6 + 0.5, 0, 1); return v * v * (3 - 2 * v); }
  // los caribúes de las capas de atrás: también pastan y caminan (Pau 02/11: «los de atrás no se mueven»)
  var RESMEDIO = [[4000, 18], [4070, 16], [4150, 20], [4230, 15], [4320, 19], [4420, 17], [4500, 21]], RESLEJOS = [[2150, 0.9], [2190, 1], [2235, 0.85], [2290, 1.1], [2340, 0.9], [2400, 1], [2460, 0.8]];
  function pintarRebanos(ctx, P, capa, lista, y0, esc) {
    var tt = E.t / 1000, k = E.u / K, c0 = ((E.W / 2 + E.camX) * capa.p - E.W / 2) / k, c1 = c0 + E.W / k;
    if (lista[lista.length - 1][0] + 200 < c0 || lista[0][0] - 200 > c1) return;
    ctx.save(); enCapa(ctx, capa.p);
    lista.forEach(function (q, i) { var s2 = esc ? esc * q[1] : q[1], y = y0 + (i % 3) * (esc ? 4 : 5);
      if (i % 3 === 1) { var z = patrulla(tt, q[0] - 50, q[0] + 50, esc ? 3 : 5, 6, i * 0.17); girado(ctx, z.x, -z.sx, function () { A.caribuCorre(ctx, z.x, y, s2, ((z.x / (s2 * 1.6)) % 1 + 1) % 1, P, true, 0.08 + 0.26 * z.amp); }); }
      else A.caribu(ctx, q[0], y, s2, pastar(tt, i + 5), P, i % 2 === 1); });
    ctx.restore();
  }
  function pintarVivos(ctx, P, xa, xb) { var tt = E.t / 1000; for (var i = 0; i < VIVOS.length; i++) { var v = VIVOS[i]; if (v[1] < xa - 60 || v[0] > xb + 60) continue; v[2](ctx, P, tt); } pintarVahos(ctx); }
  // la gente que camina por el pueblo (va y vuelve) y un trineo que cruza la tundra
  var CAMINANTES = [{ x0: 3560, x1: 4080, y: 834, s: 82, col: 'parka2', v: 0.034, f: 0 }, { x0: 4620, x1: 5120, y: 820, s: 76, col: 'parka4', v: 0.03, f: 0.5 }, { x0: 3950, x1: 4300, y: 870, s: 50, col: 'parka3', v: 0.045, f: 0.2 }];
  function pintarCaminantes(ctx, P, xa, xb) {
    CAMINANTES.forEach(function (w) {
      var z = patrulla(E.t / 1000, w.x0, w.x1, w.v * 900, 3, w.f), x = z.x;
      if (x < xa - 100 || x > xb + 100) return;
      girado(ctx, x, z.sx, function () { A.personaAnda(ctx, x, w.y, w.s, w.col, ((x / (w.s * 0.55)) % 1 + 1) % 1, P, z.amp); });
    });
  }
  function pintarTrineoVivo(ctx, P, xa, xb) {
    var k = (E.t % 50000) / 22000; if (k > 1) return;
    var x = U.lerp(5900, 8300, k), y = 878, tt = E.t / 1000;
    if (x + 520 < xa || x - 160 > xb) return;
    A.trineo(ctx, x, y, 1.2, P); A.persona(ctx, x - 70, y - 4, 80, 'parka', P);
    var cu = new Path2D(); cu.moveTo(x + 66, y - 16); cu.lineTo(x + 66 + 6 * 56, y - 16); A.pintor(ctx, P).l('oscuro', cu, 1.3);
    for (var i = 0; i < 6; i++) A.perroGalope(ctx, x + 104 + i * 56, y + (i % 2 ? 5 : -5), i % 2 ? 32 : 30, (tt * 2.6 + i * 0.27) % 1, P);
    ctx.fillStyle = 'rgba(235,242,255,.35)'; for (i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(x - 80 - i * 14, y - 4 - (i % 2) * 5, 4 + i * 1.5, 0, TAU); ctx.fill(); }
  }
  // los destellos de la nieve: puntos fijos del camino que brillan un instante
  var GLITTER = (function () { var r = U.azar(57), l = []; for (var x = 0; x < LARGO; x += 18 + r() * 30) l.push([x, 800 + r() * 95, r() * TAU, 0.5 + r() * 1.5]); return l; })();
  function pintarGlitter(ctx, xa, xb) {
    var tt = E.t / 1000, noche = PA.peso('noche');
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < GLITTER.length; i++) { var g = GLITTER[i]; if (g[0] < xa || g[0] > xb) continue; var a = Math.pow(Math.max(0, Math.sin(tt * g[3] + g[2])), 12); if (a < 0.05) continue; var r = 1.5 + a * 3; ctx.fillStyle = noche > 0.5 ? 'rgba(200,240,255,' + a.toFixed(3) + ')' : 'rgba(255,240,250,' + a.toFixed(3) + ')'; ctx.fillRect(g[0] - r, g[1] - 0.5, r * 2, 1); ctx.fillRect(g[0] - 0.5, g[1] - r, 1, r * 2); }
    ctx.restore();
  }
  // la bruma entre capas (perspectiva aérea) y la niebla baja que corre
  function bruma(ctx, P, y0, y1, a) {
    var H = E.H, g = ctx.createLinearGradient(0, H * y0 / K, 0, H * y1 / K); g.addColorStop(0, A.rgba(P.bruma, 0)); g.addColorStop(0.45, A.rgba(P.bruma, a)); g.addColorStop(1, A.rgba(P.bruma, 0));
    ctx.fillStyle = g; ctx.fillRect(0, H * y0 / K, E.W, H * (y1 - y0) / K);
  }
  var NIEBLA = [[0.1, 0.62, 0.5], [0.45, 0.66, 0.4], [0.8, 0.6, 0.55], [1.15, 0.64, 0.45]];
  function pintarNiebla(ctx, P) {
    var W = E.W, H = E.H, tt = E.t / 1000;
    NIEBLA.forEach(function (n, i) { var x = (((n[0] + tt * 0.004 * (1 + i * 0.3) - E.camX / W * 0.5) % 1.5) + 1.5) % 1.5 * W - W * 0.25, y = H * n[1], rx = W * n[2] * 0.6, g = ctx.createRadialGradient(x, y, 0, x, y, rx); g.addColorStop(0, A.rgba(P.bruma, 0.16)); g.addColorStop(1, A.rgba(P.bruma, 0)); ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.12); ctx.translate(-x, -y); ctx.fillStyle = g; ctx.fillRect(x - rx, y - rx, rx * 2, rx * 2); ctx.restore(); });
  }

  PA.actualizar = function (dt) {
    var tv = E.t / 1000; vientoNieve = 0.42 + 0.22 * Math.sin(tv * 0.07) + 0.1 * Math.sin(tv * 0.23 + 1); desp += vientoNieve * dt / 1000;
    if (!E.escena || !E.escena.s.detenerDia) PA.hora = (PA.hora + dt / 1000 / segPorHora(PA.hora) * PA.velocidad) % 24;
    moverHumo(dt);
    taller();
  };
  function capaTeselas(ctx, capa, m) {
    var vr = rango(capa, 0), bandaY = capa.y0 * E.H, bandaH = (capa.y1 - capa.y0) * E.H;
    for (var i = vr[0]; i <= vr[1]; i++) {
      if (!tieneContenido(capa, i)) continue;
      var x = E.W / 2 + i * TW - (E.W / 2 + E.camX) * capa.p;
      var ta = cache[clave(capa, i, m.a)], tb = m.b && m.k > 0.004 ? cache[clave(capa, i, m.b)] : null;
      if (!ta && !tb) ta = pintarTesela(capa, i, m.a);
      if (ta) { ta.usado = E.t; ctx.globalAlpha = 1; ctx.drawImage(ta.c, x, bandaY, TW, bandaH); }
      if (tb) { tb.usado = E.t; ctx.globalAlpha = ta ? m.k : 1; ctx.drawImage(tb.c, x, bandaY, TW, bandaH); }
    }
    ctx.globalAlpha = 1;
  }
  function enCapa(ctx, p) { var k = E.u / K; ctx.translate(E.W / 2 - (E.W / 2 + E.camX) * p, 0); ctx.scale(k, k); }

  PA.dibujar = function (ctx, s, t) {
    var W = E.W, H = E.H, m = PA.mezcla(), P = PA.paleta(), noche = PA.peso('noche'), k = E.u / K, tt = E.t / 1000, Hh = H * HOR / K;
    /* el cielo */
    var g = ctx.createLinearGradient(0, 0, 0, Hh); P.cielo.forEach(function (q, i) { g.addColorStop(i / (P.cielo.length - 1), q); }); ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh + 2);
    var dia = 1 - noche;
    if (dia > 0.02) { var rs = ctx.createRadialGradient(W * 0.24, Hh + H * 0.06, 10, W * 0.24, Hh + H * 0.06, W * 0.5); rs.addColorStop(0, 'rgba(255,200,150,' + (0.75 * dia).toFixed(3) + ')'); rs.addColorStop(0.35, 'rgba(255,160,150,' + (0.3 * dia).toFixed(3) + ')'); rs.addColorStop(1, 'rgba(255,140,160,0)'); ctx.fillStyle = rs; ctx.fillRect(0, 0, W, Hh); }
    if (noche > 0.05) { ctx.globalAlpha = noche; ctx.drawImage(viaLactea(), 0, 0, W, Hh); ctx.globalAlpha = 1; }
    for (var i = 0; i < estrellas.length; i++) {
      var st = estrellas[i], vis = noche + (1 - noche) * Math.max(0, 0.6 - st.y * 1.6) * st.b; if (vis < 0.03) continue;
      var a = vis * (0.55 + 0.45 * Math.sin(tt * st.v + st.f)); ctx.fillStyle = 'rgba(240,242,255,' + a.toFixed(3) + ')'; ctx.fillRect(((st.x * W - E.camX * 0.02) % W + W) % W, st.y * H, st.s, st.s);
    }
    var lu = PA.luna();
    if (lu.visible && noche > 0.05) { ctx.globalAlpha = noche; var gl = ctx.createRadialGradient(lu.x, lu.y, lu.r, lu.x, lu.y, lu.r * 6); gl.addColorStop(0, 'rgba(200,225,255,.24)'); gl.addColorStop(1, 'rgba(200,225,255,0)'); ctx.fillStyle = gl; ctx.fillRect(lu.x - lu.r * 6, lu.y - lu.r * 6, lu.r * 12, lu.r * 12); ctx.fillStyle = '#f2efe2'; ctx.beginPath(); ctx.arc(lu.x, lu.y, lu.r, 0, TAU); ctx.fill(); ctx.fillStyle = '#d9d6c8'; [[-0.3, -0.25, 0.25], [0.35, 0.3, 0.19], [0.25, -0.45, 0.13]].forEach(function (q) { ctx.beginPath(); ctx.arc(lu.x + q[0] * lu.r, lu.y + q[1] * lu.r, q[2] * lu.r, 0, TAU); ctx.fill(); }); ctx.globalAlpha = 1; }
    // la aurora (se renueva cada 80 ms; si la escena la pide más fuerte, s.aurora(t))
    var fa = s && s.aurora ? s.aurora(t) : PA.auroraFuerza();
    if (E.t - aurora.t > 80 || !aurora.cv) { aurora.t = E.t; pintarAurora(fa); }
    if (aurora.cv && fa > 0.02) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(aurora.cv, 0, 0, W, Hh); ctx.restore(); }
    if (noche > 0.05 && fa > 0.05) { var ga = ctx.createLinearGradient(0, Hh - H * 0.28, 0, Hh); ga.addColorStop(0, 'rgba(60,220,160,0)'); ga.addColorStop(1, 'rgba(60,220,160,' + (0.12 * fa).toFixed(3) + ')'); ctx.fillStyle = ga; ctx.fillRect(0, Hh - H * 0.28, W, H * 0.28); }
    if (s && s.cielo) s.cielo(ctx, t);
    /* el suelo */
    var gsu = ctx.createLinearGradient(0, Hh, 0, H); P.suelo.forEach(function (q, i) { gsu.addColorStop(i / (P.suelo.length - 1), q); }); ctx.fillStyle = gsu; ctx.fillRect(0, Hh, W, H - Hh);
    /* las capas */
    capaTeselas(ctx, CAPA.montes, m);
    var gh = ctx.createLinearGradient(0, H * (HOR - 30) / K, 0, H * (HOR + 30) / K); gh.addColorStop(0, 'rgba(255,255,255,0)'); gh.addColorStop(0.5, P.calima); gh.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gh; ctx.fillRect(0, H * (HOR - 30) / K, W, H * 60 / K);
    bruma(ctx, P, HOR - 50, HOR + 40, 0.4);
    capaTeselas(ctx, CAPA.lejos, m);
    pintarRebanos(ctx, P, CAPA.lejos, RESLEJOS, HOR + 30, 9);
    bruma(ctx, P, HOR - 20, HOR + 120, 0.3);
    if (s && s.detras) s.detras(ctx, t);
    capaTeselas(ctx, CAPA.medio, m);
    pintarRebanos(ctx, P, CAPA.medio, RESMEDIO, 676);
    ctx.save(); enCapa(ctx, CAPA.medio.p); if (!(s && s.sinMigracion)) pintarMigracion(ctx, P); ctx.restore();
    bruma(ctx, P, HOR + 20, HOR + 260, 0.16); pintarNiebla(ctx, P);
    capaTeselas(ctx, CAPA.camino, m);
    // la luz de la aurora y de la luna sobre la nieve
    if (noche > 0.05) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      var gn = ctx.createLinearGradient(0, Hh, 0, H); gn.addColorStop(0, 'rgba(70,230,170,' + (0.1 * fa * noche).toFixed(3) + ')'); gn.addColorStop(1, 'rgba(70,230,170,0)'); ctx.fillStyle = gn; ctx.fillRect(0, Hh, W, H - Hh);
      if (lu.visible) { ctx.translate(lu.x, H * 0.78); ctx.scale(1, 0.3); var gm = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.3); gm.addColorStop(0, 'rgba(200,220,255,' + (0.1 * noche).toFixed(3) + ')'); gm.addColorStop(1, 'rgba(200,220,255,0)'); ctx.fillStyle = gm; ctx.fillRect(-W * 0.3, -W * 0.3, W * 0.6, W * 0.6); }
      ctx.restore();
    }
    // lo vivo del camino: las ballenas, el humo y las luces
    var xa = E.camX / k, xb = (E.camX + W) / k;
    ctx.save(); enCapa(ctx, 1);
    if (xa < 1600 && xb > 950) OSO_VIVO(ctx, P);
    if (xa < PA.CANAL.x1 + 300) { pintarBallenas(ctx, P); pintarSalto(ctx, P); }
    pintarGlitter(ctx, xa, xb); pintarVivos(ctx, P, xa, xb); pintarCaminantes(ctx, P, xa, xb); pintarTrineoVivo(ctx, P, xa, xb);
    pintarHumo(ctx); pintarLuces(ctx, xa, xb);
    if (xb > 3000 && xa < 6400) { var colC = noche > 0.5 ? '#0a0b16' : '#2a2433'; [[3700, 470, 0], [4300, 430, 2.1], [4900, 500, 4.2]].forEach(function (q, i) { var an = tt * (0.22 + i * 0.05) + q[2]; A.cuervo(ctx, q[0] + Math.cos(an) * 260, q[1] + Math.sin(an * 1.3) * 40, 22, (tt * 2.4 + i * 0.37) % 1, colC); }); }
    ctx.restore();
    if (PA.companero) PA.companero(ctx, t);
    if (s && s.camino) s.camino(ctx, t);
    capaTeselas(ctx, CAPA.cerca, m);
    // la nieve: copos que caen y ráfagas a ras de suelo
    for (i = 0; i < copos.length; i++) { var q = copos[i], y = ((q.y + tt * q.v) % 1) * H, x = (((q.x + desp * q.v * 1.5 + Math.sin(tt + q.f) * 0.004 - E.camX / W * 0.2) % 1) + 1) % 1 * W; ctx.fillStyle = 'rgba(240,246,255,' + (q.a * (0.6 + noche * 0.4)).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(x, y, q.r * Math.max(1, k * 1.2), 0, TAU); ctx.fill(); }
    ctx.lineWidth = 1;
    for (i = 0; i < rafagas.length; i++) { var rf = rafagas[i], rx = ((((rf.x + desp * rf.v * 2.5 - E.camX / W * 1.1) % 1.3) + 1.3) % 1.3 - 0.15) * W, ry = rf.y * H, gr = ctx.createLinearGradient(rx, ry, rx + rf.l * W, ry); gr.addColorStop(0, 'rgba(230,240,255,0)'); gr.addColorStop(0.5, 'rgba(230,240,255,.18)'); gr.addColorStop(1, 'rgba(230,240,255,0)'); ctx.strokeStyle = gr; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + rf.l * W, ry - 2); ctx.stroke(); }
    // la viñeta
    var v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.55, W / 2, H / 2, Math.max(W, H) * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, P.vineta); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    // la entrada: la escena aparece desde la noche
    if (entrada) { var ke = U.tramo(E.t - entrada.t0, 0, 1600); ctx.fillStyle = 'rgba(4,8,20,' + (1 - U.suave(ke)).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); if (ke >= 1) entrada = null; }
  };
  var entrada = null;
  PA.imprimir = function () { entrada = { t0: E.t }; };
  PA.dibujarImpresion = function () {};
  PA.imprimiendo = function () { return !!entrada; };

  E.en('tamano', function () { PA.olvidar(); });
  construir();
})();
