// Arma los envases genéricos de la campaña: toma solo la silueta de cada foto original,
// la pinta con otro color, le da volumen con un sombreado de cilindro y le pone una etiqueta de marca inventada.
// No queda nada del rótulo original. Uso: node img/genericos/generar.js <carpeta con las fotos originales .webp>
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const SRC = process.argv[2];
const P = {
  solenna:   { f: 'parque-22',    c: ['#FFFFFF', '#F2F4F6'], cap: ['bottom', .11, '#F5A623'], lab: { y: .18, h: .5, bg: '#FFB52E', fg: '#0B3A55' }, marca: 'Solenna', linea: 'KIDS', big: '50+', sub: '250 ml' },
  brisa80:   { f: 'dermaglos-80', rect: true, c: ['#F7FAFC', '#E9EEF2'], lab: { y: .12, h: .7, bg: '#0E2F5A', fg: '#FFFFFF' }, marca: 'Brisa Sur', linea: 'SOLAR', big: '80', sub: 'Muy alta · 90 g' },
  brisasport:{ f: 'norte-122',    c: ['#1E7FC4', '#0F4F86'], lab: { y: .15, h: .62, bg: 'rgba(255,255,255,.0)', fg: '#FFFFFF' }, marca: 'Brisa Sur', linea: 'SPORT', big: '50', sub: 'Resistente al agua' },
  labiosol:  { f: 'plaza-107',    c: ['#FFE7DF', '#FFD3C4'], lab: { y: .2, h: .55, bg: '#FF6B4A', fg: '#FFFFFF' }, marca: 'Labiosol', linea: 'LABIAL', big: '35', sub: 'FPS · Stick 4 g' },
  aquaterma: { f: 'plaza-108',    c: ['#2FB5B0', '#127C7A'], cap: ['top', .3, '#D9DEE2'], lab: { y: .42, h: .4, bg: 'rgba(255,255,255,0)', fg: '#FFFFFF' }, marca: 'Aquaterma', linea: 'BRUMA', big: '', sub: 'Facial', vert: true },
  termalia:  { f: 'centro-18',    c: ['#FFFFFF', '#EEF3F6'], cap: ['top', .13, '#BFD9EA'], lab: { y: .28, h: .45, bg: '#7CC3E8', fg: '#0B3A55' }, marca: 'Termalia', linea: 'AGUA TERMAL', big: '', sub: '150 ml', vert: true },
  velum:     { f: 'plaza-12',     c: ['#FFFFFF', '#F1F4F7'], cap: ['top', .3, '#F1F4F7'], lab: { y: .38, h: .44, bg: '#6C5CE7', fg: '#FFFFFF' }, marca: 'Velum', linea: 'HIDRATANTE', big: '', sub: 'Crema intensiva · 236 ml' },
  nopica:    { f: 'off-extra',    c: ['#2E8B57', '#1D5E3A'], cap: ['top', .15, '#F2C230'], lab: { y: .25, h: .45, bg: '#F2C230', fg: '#123D27' }, marca: 'NoPica', linea: 'EXTRA', big: '8 h', sub: 'Aerosol · 170 g' },
  nopicabebe:{ f: 'parque-34',    c: ['#FFFFFF', '#F3EEF8'], lab: { y: .22, h: .5, bg: '#A98BD8', fg: '#FFFFFF' }, marca: 'NoPica', linea: 'BEBÉ', big: '', sub: 'Gel repelente · 100 ml' },
  verdemonte:{ f: 'parque-123',   c: ['#E9F1D9', '#CFE0B2'], lab: { y: .2, h: .6, bg: '#5C7F2E', fg: '#FFFFFF' }, marca: 'Verde Monte', linea: 'CITRONELA', big: '', sub: 'Repelente en crema · 70 g' },
};
(async () => {
  const b = await chromium.launch(), page = await b.newPage();
  await page.setContent(`<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Inter:wght@600;800&display=swap" rel="stylesheet"><p style="font-family:'Bricolage Grotesque';font-weight:800">a</p><p style="font-family:Inter;font-weight:800">a</p><p style="font-family:Inter;font-weight:600">a</p>`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  for (const [k, d] of Object.entries(P)) {
    const src = 'data:image/webp;base64,' + fs.readFileSync(path.join(SRC, d.f + '.webp')).toString('base64');
    const png = await page.evaluate(async ({ src, d }) => {
      const im = new Image(); im.src = src; await im.decode();
      const S = 2, w = im.width * S, h = im.height * S;
      const c = Object.assign(document.createElement('canvas'), { width: w, height: h }), x = c.getContext('2d');
      // caja de la silueta (para ubicar etiqueta y sombreado)
      const t = Object.assign(document.createElement('canvas'), { width: w, height: h }).getContext('2d'); t.drawImage(im, 0, 0, w, h);
      const a = t.getImageData(0, 0, w, h).data; let x0 = w, x1 = 0, y0 = h, y1 = 0;
      for (let yy = 0; yy < h; yy += 2) for (let xx = 0; xx < w; xx += 2) if (a[(yy * w + xx) * 4 + 3] > 40) { x0 = Math.min(x0, xx); x1 = Math.max(x1, xx); y0 = Math.min(y0, yy); y1 = Math.max(y1, yy); }
      if (d.rect) { const m = (x1 - x0) * .08; x0 += m; x1 -= m; }
      const bw = x1 - x0, bh = y1 - y0;
      // máscara rellena: en cada fila, de la primera a la última parte opaca (tapa los huecos que dejaba el texto del rótulo)
      const mk = Object.assign(document.createElement('canvas'), { width: w, height: h }), mx = mk.getContext('2d'); mx.fillStyle = '#000';
      if (d.rect) { mx.beginPath(); mx.roundRect(x0, y0, bw, bh, bw * .03); mx.fill(); } else for (let yy = 0; yy < h; yy++) { let l = -1, r = -1; for (let xx = 0; xx < w; xx++) if (a[(yy * w + xx) * 4 + 3] > 40) { if (l < 0) l = xx; r = xx; } if (l >= 0) mx.fillRect(l, yy, r - l + 1, 1); }
      // color base
      let g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, d.c[0]); g.addColorStop(1, d.c[1]); x.fillStyle = g; x.fillRect(0, 0, w, h);
      if (d.cap) { const [lado, fr, col] = d.cap; x.fillStyle = col; lado === 'top' ? x.fillRect(0, 0, w, y0 + bh * fr) : x.fillRect(0, y1 - bh * fr, w, h); }
      // etiqueta inventada
      const L = d.lab, ly = y0 + bh * L.y, lh = bh * L.h, pad = bw * .08;
      x.fillStyle = L.bg; x.fillRect(0, ly, w, lh);
      x.fillStyle = L.fg; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      const cx = x0 + bw / 2, fit = (txt, font, max) => { let s = max; do { x.font = font.replace('#', s); s -= 1; } while (x.measureText(txt).width > bw - pad * 2 && s > 6); return s; };
      if (d.vert) {
        x.save(); x.translate(cx, ly + lh / 2); x.rotate(-Math.PI / 2);
        const m = Math.min(lh * .9, 9999); let s = bw * .42; x.font = `800 ${s}px 'Bricolage Grotesque'`; while (x.measureText(d.marca).width > m && s > 6) { s--; x.font = `800 ${s}px 'Bricolage Grotesque'`; }
        x.fillText(d.marca, 0, -s * .05); x.font = `800 ${s * .38}px Inter`; x.fillText(d.linea + (d.sub ? ' · ' + d.sub : ''), 0, s * .5); x.restore();
      } else {
        let yy = ly + lh * .2; const s1 = fit(d.marca, "800 #px 'Bricolage Grotesque'", bw * .22); x.fillText(d.marca, cx, yy); yy += s1 * .75;
        const s2 = fit(d.linea, '800 #px Inter', bw * .09); x.globalAlpha = .85; x.fillText(d.linea, cx, yy); x.globalAlpha = 1; yy += s2 * .45;
        if (d.big) { const s3 = fit(d.big, "800 #px 'Bricolage Grotesque'", Math.min(bw * .5, lh * .42)); yy += s3 * .95; x.fillText(d.big, cx, yy); if (/^\d/.test(d.big) && !/h/.test(d.big)) { x.font = `800 ${s3 * .2}px Inter`; x.fillText('FPS', cx, yy - s3 * .82); } }
        const s4 = fit(d.sub, '600 #px Inter', bw * .07); x.fillText(d.sub, cx, ly + lh - s4 * .9);
      }
      // volumen: sombra de cilindro + brillo
      x.globalCompositeOperation = 'multiply';
      g = x.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, 'rgb(150,155,165)'); g.addColorStop(.22, 'rgb(235,237,240)'); g.addColorStop(.42, '#fff'); g.addColorStop(.78, 'rgb(225,228,232)'); g.addColorStop(1, 'rgb(140,145,155)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.globalCompositeOperation = 'screen';
      g = x.createLinearGradient(x0, 0, x1, 0); g.addColorStop(.25, 'rgba(255,255,255,0)'); g.addColorStop(.32, 'rgba(255,255,255,.35)'); g.addColorStop(.38, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      // recorte con la silueta original
      x.globalCompositeOperation = 'destination-in'; x.filter = 'blur(1px)'; x.drawImage(mk, 0, 0);
      return c.toDataURL('image/png');
    }, { src, d });
    fs.writeFileSync(path.join(__dirname, k + '.png'), Buffer.from(png.split(',')[1], 'base64'));
    console.log(k);
  }
  await b.close();
})();
