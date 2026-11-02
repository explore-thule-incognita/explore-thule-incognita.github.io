/* Thule Incognita · el husky que te acompaña
   Va contigo por delante del camino (el método del caballo de Vaccaria): si avanzas, trota a tu lado o galopa si vas
   rápido (y si te alejas mucho, llega corriendo desde fuera de la pantalla); si te paras, se sienta mirando hacia donde
   ibas y le sale el vaho del aliento con el frío. De noche, con la aurora fuerte, al rato levanta el hocico y aúlla; lo
   repite de vez en cuando. Durante los secretos se aparta y vuelve después. */
(function () {
  'use strict';
  var TH = window.TH, U = TH.util, E = TH.motor, A = TH.arte, PA = TH.paisaje, S = TH.esc;
  var Y = 876, CRUZ = 50, SENTADO = 70, VMAX = 1.5;
  var C = { x: null, v: 0, dir: 1, fase: 0, quieto: 0, rumbo: 1, a: 1, aulla: 0, sentado: 0, vahos: [] };

  // a dónde quiere ir: un poco por detrás del centro, según hacia dónde vas
  function objetivo() { return S.lam(E.W * (C.rumbo > 0 ? 0.38 : 0.62), 0, 1)[0]; }
  E.en('cuadro', function (d) {
    var dt = Math.min(50, d.dt);
    if (Math.abs(d.movido) > 0.5) C.rumbo = d.movido > 0 ? 1 : -1;
    var tx = objetivo(), ancho = E.W / S.k();
    if (C.x == null || Math.abs(tx - C.x) > ancho * 1.05) { C.x = tx - C.rumbo * ancho * 0.72; C.v = C.rumbo * VMAX * 0.8; }
    // si tú estás quieto, se para donde llegue (sin darse la vuelta para volver al sitio exacto)
    var quieta = Math.abs(d.movido) < 0.5, dx = tx - C.x, zona = quieta ? 220 : 30, vd = Math.abs(dx) < zona || (quieta && dx * C.dir < 0 && Math.abs(dx) < ancho * 0.4) ? 0 : U.clamp(dx * 0.0045, -VMAX, VMAX);
    C.v += (vd - C.v) * Math.min(1, dt / 220);
    C.x += C.v * dt;
    var sp = Math.abs(C.v); C.marcha = sp < 0.03 ? 'quieto' : sp < 0.42 ? 'trote' : 'galope';
    if (sp > 0.1) C.dir = C.v > 0 ? 1 : -1;
    C.fase = (C.fase + sp * dt / (CRUZ * (C.marcha === 'galope' ? 2.4 : 1.4))) % 1;
    // quieto: se sienta; de noche, con aurora, al rato aúlla (3 s de cada 11)
    if (C.marcha === 'quieto') C.quieto += dt; else C.quieto = 0;
    C.sentado += ((C.quieto > 500 ? 1 : 0) - C.sentado) * Math.min(1, dt / 180);
    var quiere = C.quieto > 6000 && PA.peso('noche') > 0.7 && PA.auroraFuerza() > 0.35 && ((C.quieto - 6000) % 11000) < 3000 ? 1 : 0;
    C.aulla += (quiere - C.aulla) * Math.min(1, dt / (quiere ? 500 : 350));
    C.aullando = C.aulla > 0.6;
    // el vaho del aliento: una nubecita cada 2,4 s (más seguida si corre)
    if (C.nariz && E.t - (C.ultVaho || 0) > (C.marcha === 'quieto' ? 2400 : 900)) { C.ultVaho = E.t; C.vahos.push({ x: C.nariz[0], y: C.nariz[1], t: E.t, d: C.dir }); }
    for (var i = C.vahos.length - 1; i >= 0; i--) if (E.t - C.vahos[i].t > 1800) C.vahos.splice(i, 1);
  });
  E.en('escena', function (d) { if (d.fase === 'fin') C.x = null; });

  PA.companero = function (ctx, t) {
    C.a += ((E.escena ? 0 : 1) - C.a) * 0.15;
    if (C.x == null || C.a < 0.02) return;
    var p = S.pant(C.x, Y, 1); if (p[0] < -CRUZ * 4 || p[0] > E.W + CRUZ * 4) return;
    var P = PA.paleta();
    ctx.save(); ctx.globalAlpha = C.a; S.enCapa(ctx, 1);
    // el vaho, detrás de todo
    C.vahos.forEach(function (v) { var k = (E.t - v.t) / 1800, r = 4 + k * 16, g = ctx.createRadialGradient(v.x + v.d * k * 14, v.y - k * 10, 0, v.x + v.d * k * 14, v.y - k * 10, r); g.addColorStop(0, 'rgba(235,242,255,' + (0.35 * (1 - k)).toFixed(3) + ')'); g.addColorStop(1, 'rgba(235,242,255,0)'); ctx.fillStyle = g; ctx.fillRect(v.x - 40, v.y - 50, 100, 80); });
    // de pie (trote o galope) o sentado; se mira hacia donde va (el sentado mira a la izquierda: se le da la vuelta)
    var sentado = C.marcha === 'quieto' && C.sentado > 0.5, vuelta = sentado ? C.dir > 0 : C.dir < 0;
    ctx.save(); ctx.translate(C.x, 0); if (vuelta) ctx.scale(-1, 1); ctx.translate(-C.x, 0);
    var n;
    if (sentado) n = A.huskySentado(ctx, C.x, Y, SENTADO, P, { aulla: C.aulla });
    else {
      var bote = C.marcha === 'galope' ? Math.abs(Math.sin(C.fase * Math.PI * 2)) * 4 : C.marcha === 'trote' ? Math.abs(Math.sin(C.fase * Math.PI * 4)) * 1.5 : 0;
      A.perroGalope(ctx, C.x - CRUZ * 0.2, Y - bote, CRUZ, C.marcha === 'quieto' ? 0.25 : C.fase, P, false, C.marcha === 'galope' ? 0.85 : C.marcha === 'trote' ? 0.42 : 0.1);
      n = [C.x + CRUZ * 0.95, Y - CRUZ * 1.12];
    }
    C.nariz = [vuelta ? 2 * C.x - n[0] : n[0], n[1]];
    ctx.restore();
    // la nieve que levanta al correr
    if (C.marcha === 'galope') { ctx.fillStyle = 'rgba(230,240,255,.45)'; for (var i = 0; i < 4; i++) { var px = C.x - C.dir * (CRUZ * 0.8 + i * 9), py = Y - 2 - (i % 2) * 4; ctx.beginPath(); ctx.arc(px, py, 3 + i, 0, Math.PI * 2); ctx.fill(); } }
    ctx.restore();
  };
  TH.companero = C;
})();
