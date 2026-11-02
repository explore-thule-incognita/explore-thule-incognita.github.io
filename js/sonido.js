/* Thule Incognita · sonido
   Todo sintetizado con Web Audio, sin archivos (como en Vaccaria, con lo que le gustó a Pau: un fondo único y pocas cosas).
   - El recorrido: el viento del Ártico como fondo; de vez en cuando, el hielo de la banquisa que cruje, el soplo de las
     ballenas cuando salen (por el lado de la pantalla donde están), algún aullido de perro a lo lejos y el de tu husky
     cuando aúla a la aurora; de noche, un brillo suave como de cristal que crece con la aurora; y, cada 28–45 s, un
     tambor de marco.
   - Cada escena con lo suyo, al compás de lo que se ve.
   Empieza apagado: el botón ♪ lo enciende y se recuerda. Los navegadores solo dejan sonar después de un gesto.
   Las escenas suenan por su propio canal: si se salta la escena, su sonido se apaga con ella. */
(function () {
  'use strict';
  var TH = window.TH, E = TH.motor, U = TH.util, PA = TH.paisaje, CLAVE = 'thule-incognita.sonido';
  var S = TH.sonido = { activo: false };
  var ac = null, master, salaEnv, ruido, musica, AMB = null, bus = null, escBus = null;
  // la escala del brillo de la aurora: re mayor pentatónica, aguda
  var CRISTAL = [587.33, 659.25, 739.99, 880.0, 987.77, 1174.66, 1318.51];

  function crear() {
    var Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return false;
    ac = new Ctx();
    master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
    var conv = ac.createConvolver(); conv.buffer = impulso(4.5, 2.6);   // el eco largo de la nieve abierta
    salaEnv = ac.createGain(); salaEnv.gain.value = 0.5; salaEnv.connect(conv); var rv = ac.createGain(); rv.gain.value = 0.45; conv.connect(rv); rv.connect(master);
    musica = ac.createGain(); musica.gain.value = 1; musica.connect(master);
    AMB = { seco: master, sala: salaEnv }; bus = AMB;
    ruido = bufferRuido(4);
    S.viento = bucle(ruido, 'bandpass', 380, 0.7, 0);
    S.silbo = bucle(ruido, 'bandpass', 1400, 6, 1.7);   // el silbido del viento entre el hielo
    // el brillo de la aurora: dos tonos agudos casi iguales que laten, con su eco
    var g = ac.createGain(); g.gain.value = 0; g.connect(master); var gs = ac.createGain(); gs.gain.value = 0.8; g.connect(gs); gs.connect(salaEnv);
    [1174.66, 1177.2, 1760.0].forEach(function (f, i) { var o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f; var og = ac.createGain(); og.gain.value = i === 2 ? 0.25 : 0.5; o.connect(og); og.connect(g); o.start(); });
    S.brilloAurora = g;
    return true;
  }
  function bucle(buf, tipo, frec, q, desde) {
    var s = ac.createBufferSource(); s.buffer = buf; s.loop = true;
    var f = ac.createBiquadFilter(); f.type = tipo; f.frequency.value = frec; f.Q.value = q;
    var g = ac.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(master); s.start(0, desde || 0);
    return { f: f, g: g };
  }
  function bufferRuido(seg) {
    var n = Math.floor(ac.sampleRate * seg), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0), b0 = 0, b1 = 0, b2 = 0;
    for (var i = 0; i < n; i++) { var w = Math.random() * 2 - 1; b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2; }
    return b;
  }
  function impulso(seg, caida) {
    var n = Math.floor(ac.sampleRate * seg), b = ac.createBuffer(2, n, ac.sampleRate);
    for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, caida); }
    return b;
  }
  function salida(nodo, sala, pan) {
    var n = nodo;
    if (pan && ac.createStereoPanner) { var p = ac.createStereoPanner(); p.pan.value = U.clamp(pan, -1, 1); nodo.connect(p); n = p; }
    n.connect(bus.seco);
    if (sala) { var g = ac.createGain(); g.gain.value = sala; n.connect(g); g.connect(bus.sala); }
  }
  function env(g, t, ataque, vol, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + ataque); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  function tono(tipo, f, t, dur, vol, op) {
    op = op || {};
    var o = ac.createOscillator(), g = ac.createGain(); o.type = tipo; o.frequency.setValueAtTime(f, t);
    if (op.f2) o.frequency.exponentialRampToValueAtTime(op.f2, t + (op.glide || dur));
    env(g, t, op.ataque || 0.01, vol, dur);
    if (op.filtro) { var fl = ac.createBiquadFilter(); fl.type = op.tipoFiltro || 'lowpass'; fl.frequency.value = op.filtro; fl.Q.value = op.q || 0.7; o.connect(fl); fl.connect(g); } else o.connect(g);
    if (op.musica) { g.connect(musica); var g2 = ac.createGain(); g2.gain.value = 0.5; g.connect(g2); g2.connect(salaEnv); } else salida(g, op.sala == null ? 0.4 : op.sala, op.pan);
    o.start(t); o.stop(t + dur + 0.05);
    return o;
  }
  function golpe(t, dur, frec, vol, tipo, op) {
    op = op || {};
    var s = ac.createBufferSource(); s.buffer = ruido; var f = ac.createBiquadFilter(); f.type = tipo || 'lowpass'; f.frequency.setValueAtTime(frec, t); f.Q.value = op.q || (tipo === 'bandpass' ? 2 : 0.7);
    if (op.f2) f.frequency.exponentialRampToValueAtTime(op.f2, t + (op.barre || dur));
    var g = ac.createGain(); env(g, t, op.ataque || Math.min(0.02, dur * 0.2), vol, dur);
    s.loop = true; s.connect(f); f.connect(g);
    if (op.musica) { g.connect(musica); var g2 = ac.createGain(); g2.gain.value = 0.4; g.connect(g2); g2.connect(salaEnv); } else salida(g, op.sala == null ? 0.3 : op.sala, op.pan);
    s.start(t, Math.random() * 2); s.stop(t + dur + 0.05);
  }

  /* --- las piezas del Ártico --- */
  // el tambor de marco: un golpe grave de piel tensa (tono que cae) con el chasquido del palo en el aro
  function tambor(t, vol, op) {
    op = op || {};
    tono('sine', op.f || 92, t, 0.9, vol, { f2: (op.f || 92) * 0.6, glide: 0.5, ataque: 0.004, musica: true });
    tono('triangle', (op.f || 92) * 2.1, t, 0.25, vol * 0.25, { f2: (op.f || 92) * 1.4, glide: 0.2, ataque: 0.004, musica: true });
    golpe(t, 0.06, 1800, vol * 0.35, 'bandpass', { q: 1.2, musica: true });
  }
  // una frase de tambor: los golpes y sus acentos (1 = fuerte)
  var FRASES = [[1, 0, 0.5, 0, 1, 0, 0.5, 0.5], [1, 0.5, 0.5, 1, 0, 0.5, 1], [1, 0, 0, 0.5, 1, 0, 0, 0.5, 1, 0.5, 1], [1, 0.5, 1, 0.5, 1, 0, 0, 1]];
  function frase(t, vol) { var f = FRASES[Math.floor(Math.random() * FRASES.length)], paso = 0.42; f.forEach(function (a, i) { if (a) tambor(t + i * paso, vol * a, { f: a === 1 ? 90 : 104 }); }); return f.length * paso; }
  // el aullido de un perro: sube, se sostiene con vibrato y cae, con el soplo del aire
  function aullido(t, vol, pan, lejos) {
    var o = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain(), vib = ac.createOscillator(), vg = ac.createGain(), base = lejos ? 470 : 520;
    o.type = 'sawtooth'; o.frequency.setValueAtTime(base * 0.8, t); o.frequency.linearRampToValueAtTime(base * 1.35, t + 0.5); o.frequency.setValueAtTime(base * 1.35, t + 1.6); o.frequency.linearRampToValueAtTime(base * 0.9, t + 2.4);
    vib.frequency.value = 5.2; vg.gain.value = base * 0.02; vib.connect(vg); vg.connect(o.frequency);
    fl.type = 'bandpass'; fl.frequency.value = lejos ? 900 : 1300; fl.Q.value = 1.6;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.4); g.gain.setValueAtTime(vol, t + 1.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    o.connect(fl); fl.connect(g); salida(g, lejos ? 1.2 : 0.6, pan); o.start(t); vib.start(t); o.stop(t + 2.7); vib.stop(t + 2.7);
  }
  // el hielo que cruje: un crujido grave que se arrastra y un chasquido
  function crujido(t, vol, pan) {
    tono('sawtooth', 70 + Math.random() * 30, t, 1.1, vol, { f2: 40, glide: 1, ataque: 0.15, filtro: 260, q: 5, tipoFiltro: 'bandpass', sala: 0.9, pan: pan });
    golpe(t + 0.9 + Math.random() * 0.3, 0.12, 900, vol * 1.4, 'bandpass', { q: 1.5, sala: 1.2, pan: pan });
  }
  // el soplo de la ballena: un chorro de aire que sale con fuerza y se deshace
  function soplo(t, vol, pan) { golpe(t, 1.6, 900, vol, 'bandpass', { q: 0.6, ataque: 0.06, f2: 2600, barre: 0.4, sala: 0.6, pan: pan }); golpe(t, 0.5, 200, vol * 0.8, 'lowpass', { sala: 0.4, pan: pan }); }
  // un destello de cristal: una nota aguda con su eco
  function cristal(t, i, vol) { var f = CRISTAL[i % CRISTAL.length] * (i >= CRISTAL.length ? 2 : 1); tono('sine', f, t, 2.4, vol, { ataque: 0.005, sala: 1.2, musica: true }); tono('sine', f * 2.01, t, 0.8, vol * 0.25, { ataque: 0.005, sala: 1, musica: true }); }
  function pasos(t0, t1, cada, vol, pan) { for (var t = t0; t < t1; t += cada * (0.9 + Math.random() * 0.2)) golpe(t, 0.09, 1600 + Math.random() * 800, vol, 'bandpass', { q: 0.8, sala: 0.2, pan: pan }); }
  function metal(t, vol, f, pan) { [1, 2.76, 5.4].forEach(function (m, i) { tono('sine', f * m, t, 0.8 / (i + 1), vol / (i + 1), { ataque: 0.002, sala: 0.6, pan: pan }); }); }

  /* --- el recorrido --- */
  var prox = { crujido: 0, perro: 0, tambor: 0 }, ballenaAntes = {}, aullaba = false;
  E.en('cuadro', function () {
    if (!ac || !S.activo) return;
    var t = ac.currentTime, l = E.centro ? E.centro() : 0, noche = PA.peso('noche'), tt = E.t / 1000;
    // el viento: siempre; más en la banquisa y en las montañas, en ráfagas lentas
    var fuerza = 0.1 + 0.05 * Math.sin(tt * 0.11) + 0.04 * Math.sin(tt * 0.37 + 1) + (l < 2.6 ? 0.04 : 0) + (l > 10 ? 0.05 : 0);
    S.viento.g.gain.setTargetAtTime(fuerza, t, 0.6); S.viento.f.frequency.setTargetAtTime(320 + 160 * (0.5 + 0.5 * Math.sin(tt * 0.23)), t, 0.8);
    S.silbo.g.gain.setTargetAtTime(Math.max(0, 0.018 * Math.sin(tt * 0.17) + 0.006), t, 0.8); S.silbo.f.frequency.setTargetAtTime(1200 + 500 * Math.sin(tt * 0.07), t, 1);
    // el brillo de la aurora, que crece con ella
    S.brilloAurora.gain.setTargetAtTime(E.escena ? 0 : 0.012 * noche * PA.auroraFuerza(), t, 1.2);
    if (E.escena) return;
    // el hielo que cruje (solo en la banquisa)
    if (l < 2.7 && t > prox.crujido) { if (prox.crujido) crujido(t + 0.05, 0.05, Math.random() * 1.4 - 0.7); prox.crujido = t + 10 + Math.random() * 12; }
    // un perro que aúlla a lo lejos
    if (t > prox.perro) { if (prox.perro && l > 2.4) aullido(t + 0.05, 0.022, Math.random() * 1.6 - 0.8, true); prox.perro = t + 22 + Math.random() * 20; }
    // el tambor de marco
    if (t > prox.tambor) { if (prox.tambor) frase(t + 0.05, 0.12); prox.tambor = t + 28 + Math.random() * 17; }
    // las ballenas: el soplo cuando empiezan a soplar y se ven
    (PA.BALLENAS || []).forEach(function (b, i) {
      var f = PA.ballena(b), sop = f && f.fase === 'sopla';
      if (sop && !ballenaAntes[i]) { var x = TH.esc.pant(b.x, 700, 1)[0]; if (x > -200 && x < E.W + 200) soplo(t + 0.02, 0.07, U.clamp((x / E.W) * 2 - 1, -0.9, 0.9)); }
      ballenaAntes[i] = sop;
    });
    // el salto de la ballena: el chorro al salir y el golpe al caer (si se ve)
    var us = PA.salto ? PA.salto() : null, xs = TH.esc.pant(760, 700, 1)[0], visto = xs > -300 && xs < E.W + 300, pan = U.clamp((xs / E.W) * 2 - 1, -0.9, 0.9);
    if (us != null && visto) { if (us < 0.05 && !S._salto) { S._salto = 1; golpe(t, 1.2, 1200, 0.08, 'bandpass', { q: 0.6, sala: 0.6, pan: pan }); } if (us > 0.76 && S._salto === 1) { S._salto = 2; golpe(t, 0.5, 160, 0.3, 'lowpass', { sala: 1.2, pan: pan }); golpe(t + 0.02, 2.4, 1800, 0.1, 'bandpass', { q: 0.5, f2: 600, barre: 2, sala: 1, pan: pan }); } }
    if (us == null) S._salto = 0;
    // tu husky, cuando aúlla a la aurora
    var C = TH.companero, aulla = !!(C && C.aullando);
    if (aulla && !aullaba) { var xh = TH.esc.pant(C.x, 0, 1)[0]; aullido(t + 0.05, 0.06, U.clamp((xh / E.W) * 2 - 1, -0.8, 0.8), false); }
    aullaba = aulla;
  });

  /* --- las escenas --- */
  var ESCENAS = {
    aurora: function (t) {
      tono('sine', 293.66, t + 0.4, 9, 0.05, { ataque: 2.5, sala: 1, musica: true }); tono('sine', 440, t + 1.2, 8, 0.035, { ataque: 2.5, sala: 1, musica: true });
      for (var i = 0; i < 16; i++) cristal(t + 1.6 + i * 0.42 + Math.random() * 0.1, [0, 2, 4, 3, 5, 4, 6, 5][i % 8] + (i > 8 ? 1 : 0), 0.035);
      golpe(t + 0.5, 8, 2400, 0.03, 'bandpass', { ataque: 2, q: 3, f2: 5200, barre: 6, sala: 1 });   // el viento solar
    },
    suero: function (t) {
      golpe(t, 7, 600, 0.14, 'bandpass', { ataque: 0.8, q: 0.5, f2: 1400, barre: 3, sala: 0.6 });   // la ventisca
      pasos(t + 0.2, t + 2.9, 0.09, 0.05, -0.6); pasos(t + 3.3, t + 6.4, 0.09, 0.05, 0.6);   // las patas en la nieve
      golpe(t + 0.2, 2.7, 3000, 0.04, 'highpass', { ataque: 0.3 }); golpe(t + 3.3, 3, 3000, 0.04, 'highpass', { ataque: 0.3 });   // los patines
      golpe(t + 2.95, 0.3, 300, 0.12, 'lowpass');   // el paquete, en el otro trineo
      for (var i = 0; i < 20; i++) tambor(t + 0.9 + i * 0.3, 0.035, { f: 120 });   // los relevos que se encienden
    },
    ballena: function (t) {
      soplo(t + 0.4, 0.1, 0);
      tono('sine', 70, t + 1.8, 3.6, 0.09, { f2: 120, glide: 1.6, ataque: 0.6, sala: 1.2 }); tono('sine', 140, t + 2.4, 2.6, 0.04, { f2: 90, glide: 2.2, ataque: 0.5, sala: 1.2 });   // el canto grave
      cristal(t + 2.6, 3, 0.05); for (var i = 0; i < 6; i++) tambor(t + 3.2 + i * 0.45, 0.05 * (1 - i * 0.12), { f: 80 });   // los años que pasan
    },
    thule: function (t) {
      for (var i = 0; i < 5; i++) golpe(t + 0.4 + i * 1.3, 1.6, 500, 0.08, 'lowpass', { ataque: 0.6, sala: 0.6 });   // el mar
      for (i = 0; i < 4; i++) tono('sawtooth', 160 + i * 14, t + 1 + i * 1.6, 0.5, 0.012, { f2: 210, glide: 0.4, ataque: 0.1, filtro: 700, q: 8, tipoFiltro: 'bandpass', sala: 0.6 });   // la madera del barco
      for (i = 0; i < 5; i++) cristal(t + 5.6 + i * 0.3, [0, 2, 4, 5, 6][i], 0.035);
    },
    viaje: function (t) {
      var d = 0; for (var k = 0; k < 3; k++) d += frase(t + 1.2 + d, 0.11) + 0.4;
      golpe(t + 1, 6, 400, 0.05, 'bandpass', { ataque: 1, q: 0.6, f2: 900, barre: 5, sala: 0.6 });
    },
    'noche-polar': function (t) {
      tono('sine', 55, t + 0.3, 10, 0.11, { ataque: 2, sala: 0.8 }); tono('sine', 82.4, t + 0.3, 10, 0.06, { ataque: 2.5, sala: 0.8 });
      tono('sine', 220, t + 1, 6, 0.03, { f2: 440, glide: 3.2, ataque: 1.5, sala: 1 });   // casi sale…
      tono('sine', 440, t + 4.6, 3, 0.025, { f2: 196, glide: 2.4, ataque: 0.4, sala: 1 });   // …y no sale
      for (var i = 0; i < 6; i++) tambor(t + 4.4 + i * 0.75, 0.03, { f: 70 });   // los días que se cuentan
    },
    oso: function (t) {
      pasos(t + 0.3, t + 2.6, 0.55, 0.08, -0.2); golpe(t + 2.8, 0.5, 300, 0.07, 'lowpass', { sala: 0.4 });   // un resoplido
      for (var i = 0; i < 8; i++) cristal(t + 2.6 + i * 0.22, 6 - (i % 7), 0.02);   // los pelos huecos, como de cristal
    },
    diomedes: function (t) {
      for (var i = 0; i < 18; i++) { tono('sine', 1800, t + 2 + i * 0.5, 0.05, 0.03, { ataque: 0.002, sala: 0.3, pan: -0.5 }); tono('sine', 1350, t + 2.25 + i * 0.5, 0.05, 0.03, { ataque: 0.002, sala: 0.3, pan: 0.5 }); }   // dos relojes
      tono('sine', 196, t + 0.8, 3, 0.04, { f2: 98, glide: 2, ataque: 0.2, sala: 1 });   // la línea que baja
    },
    'alaska-1867': function (t) {
      golpe(t + 0.4, 0.9, 2400, 0.05, 'bandpass', { f2: 900, q: 0.8 });   // el papel que cae
      golpe(t + 2.4, 0.2, 220, 0.2, 'lowpass'); golpe(t + 3.0, 0.2, 220, 0.2, 'lowpass');   // los sellos
      for (var i = 0; i < 12; i++) metal(t + 1.7 + i * 0.16, 0.025, 2200 + Math.random() * 600, Math.random() - 0.5);   // las monedas
      golpe(t + 4.8, 0.3, 160, 0.3, 'lowpass');   // SEWARD'S FOLLY
    },
    nalukataq: function (t) {
      var sal = [[1.6, 120], [2.8, 210], [4.2, 320]];
      for (var i = 0; i < 14; i++) tambor(t + 0.6 + i * 0.42, i % 2 ? 0.06 : 0.1, { f: i % 2 ? 104 : 90 });
      sal.forEach(function (q, k) { golpe(t + q[0], 0.4, 400, 0.12, 'lowpass'); tono('sine', 300, t + q[0], 0.7 + k * 0.2, 0.03, { f2: 700 + k * 150, glide: 0.5 + k * 0.15, sala: 0.6 }); golpe(t + q[0] + 0.15, 0.7, 1200, 0.03 + k * 0.01, 'bandpass', { q: 0.7, sala: 0.8 }); });   // ¡arriba!
      for (i = 0; i < 18; i++) metal(t + 4.8 + Math.random() * 1.2, 0.012, 3000 + Math.random() * 1500, Math.random() - 0.5);   // los caramelos
    },
    final: function (t) {
      tono('sine', 146.83, t + 0.3, 14, 0.05, { ataque: 3, sala: 1, musica: true }); tono('sine', 220, t + 0.6, 14, 0.04, { ataque: 3, sala: 1, musica: true }); tono('sine', 293.66, t + 1, 13, 0.03, { ataque: 3, sala: 1, musica: true });
      for (var i = 0; i < 10; i++) cristal(t + 2.6 + i * 0.18 + 2.4, i % 7, 0.04);   // las diez luces
      for (i = 0; i < 8; i++) cristal(t + 6.4 + i * 0.22, [0, 2, 4, 6, 5, 3, 4, 6][i] + 7, 0.03);   // las estrellas que se unen
      var d = 0; for (var k = 0; k < 3; k++) d += frase(t + 7.6 + d, 0.1) + 0.3;
      pasos(t + 7.6, t + 13.6, 0.09, 0.03, 0); aullido(t + 12.4, 0.05, 0.4, false);
    }
  };
  E.en('escena', function (d) {
    if (!ac || !S.activo) return;
    var t = ac.currentTime;
    if (d.fase === 'fin') { if (escBus) { escBus.seco.gain.setTargetAtTime(0, t, 0.25); escBus.sala.gain.setTargetAtTime(0, t, 0.25); escBus = null; } return; }
    if (d.fase !== 'inicio') return;
    escBus = { seco: ac.createGain(), sala: ac.createGain() }; escBus.seco.connect(master); escBus.sala.connect(salaEnv);
    bus = escBus;
    // al empezar cualquier secreto: un golpe de tambor y una nota de cristal
    try { tambor(t + 0.05, 0.12); cristal(t + 0.1, 3, 0.04); var f = ESCENAS[d.huevo && d.huevo.id]; if (f) f(t); }
    finally { bus = AMB; }
  });

  /* --- encender y apagar --- */
  S.encender = function () {
    if (!ac && !crear()) return;
    if (ac.state === 'suspended') ac.resume();
    S.activo = true; master.gain.setTargetAtTime(0.9, ac.currentTime, 0.6);
    try { localStorage.setItem(CLAVE, '1'); } catch (e) { /* nada */ }
    pintarBoton();
  };
  S.apagar = function () {
    S.activo = false; if (ac) master.gain.setTargetAtTime(0, ac.currentTime, 0.25);
    try { localStorage.setItem(CLAVE, '0'); } catch (e) { /* nada */ }
    pintarBoton();
  };
  S.alternar = function () { if (S.activo) S.apagar(); else S.encender(); };
  S.medidor = function () { if (!ac) return null; var an = ac.createAnalyser(); an.fftSize = 2048; master.connect(an); return function () { var d = new Float32Array(an.fftSize); an.getFloatTimeDomainData(d); var q = 0; for (var i = 0; i < d.length; i++) q += d[i] * d[i]; return Math.sqrt(q / d.length); }; };
  function pintarBoton() { var b = document.getElementById('b-sonido'); if (b) { b.setAttribute('aria-pressed', S.activo ? 'true' : 'false'); b.classList.toggle('activo', S.activo); } }
  // el botón va a la izquierda del del cuaderno (en el móvil, debajo)
  function colocar() {
    var b = document.getElementById('b-sonido'), c = document.getElementById('b-cuaderno'); if (!b || !c) return;
    var r = c.getBoundingClientRect(), movil = innerWidth < 640;
    b.style.top = (movil ? r.bottom + 8 : r.top) + 'px'; b.style.height = (movil ? 44 : r.height) + 'px';
    b.style.right = (movil ? innerWidth - r.right : innerWidth - r.left + 8) + 'px';
  }
  var quiere = false; try { quiere = localStorage.getItem(CLAVE) === '1'; } catch (e) { /* nada */ }
  function primerGesto() { if (quiere && !S.activo) S.encender(); window.removeEventListener('pointerdown', primerGesto, true); window.removeEventListener('keydown', primerGesto, true); }
  window.addEventListener('pointerdown', primerGesto, true); window.addEventListener('keydown', primerGesto, true);
  var b = document.getElementById('b-sonido');
  if (b) b.addEventListener('click', function (ev) { ev.stopPropagation(); quiere = false; S.alternar(); });
  window.addEventListener('resize', colocar); colocar(); setTimeout(colocar, 600);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(colocar);
  pintarBoton();
})();
