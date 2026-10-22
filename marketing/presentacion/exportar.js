// FarmaGlass · exporta la presentación de Instagram (presentacion.html) a PNG.
//
//   node marketing/presentacion/exportar.js   → story.png (1080 × 1920) y post.png (1080 × 1350)
//
// Necesita Playwright (npm i -D playwright).

const path = require('path');
const { execFileSync } = require('child_process');

let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(execFileSync('npm', ['root', '-g']).toString().trim(), 'playwright'))); }

const DIR = __dirname;

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    await page.goto('file://' + path.join(DIR, 'presentacion.html') + '?export', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    for (const [id, file] of [['story', 'story.png'], ['post', 'post.png']]) {
        await page.locator('#' + id).screenshot({ path: path.join(DIR, file) });
        console.log(file + ' listo');
    }
    await browser.close();
})();
