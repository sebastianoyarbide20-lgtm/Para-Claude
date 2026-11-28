// Exporta los banners (PNG y JPG a 2x) y los 5 productos en crudo (PNG transparente, cuadrado de 1200 px).
//   node marketing/banners-web/exportar.js
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const DIR = __dirname, OUT = path.join(DIR, 'exportados');
(async () => {
  fs.mkdirSync(path.join(OUT, 'productos'), { recursive: true });
  const b = await chromium.launch(), page = await b.newPage({ viewport: { width: 1200, height: 600 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(DIR, 'banners.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  for (const [id, nombre] of [['largo', 'banner-alargado-1068x220'], ['chico', 'banner-chico-320x100']]) {
    await page.locator('#' + id).screenshot({ path: path.join(OUT, nombre + '@2x.png'), omitBackground: true });
    await page.locator('#' + id).screenshot({ path: path.join(OUT, nombre + '@2x.jpg'), type: 'jpeg', quality: 92 });
  }
  // productos: centrados en un cuadrado transparente, con aire alrededor
  const p2 = await b.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 1 });
  for (const n of ['solenna', 'brisasport', 'nopica', 'aquaterma', 'velum']) {
    const src = 'data:image/png;base64,' + fs.readFileSync(path.join(DIR, 'img', n + '.png')).toString('base64');
    await p2.setContent(`<body style="margin:0;width:1200px;height:1200px;display:grid;place-items:center;background:transparent"><img src="${src}" style="max-height:1080px;max-width:1080px"></body>`);
    await p2.screenshot({ path: path.join(OUT, 'productos', n + '.png'), omitBackground: true });
  }
  await b.close();
})();
