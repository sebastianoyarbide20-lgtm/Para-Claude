// FarmaGlass · exporta la story de Instagram (story.html) a PNG y a MP4.
//
//   node marketing/instagram-story/exportar.js          → story.png y story.mp4
//   node marketing/instagram-story/exportar.js --png    → solo story.png
//
// Necesita Playwright (npm i -D playwright) y, para el video, ffmpeg con libx264.
// El video se arma cuadro por cuadro: en cada uno se adelantan las animaciones CSS al
// instante exacto, así sale fluido aunque la captura sea lenta.

const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');

let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(execFileSync('npm', ['root', '-g']).toString().trim(), 'playwright'))); }

const DIR = __dirname;
const PAGE = 'file://' + path.join(DIR, 'story.html');
const SECONDS = 8;
const FPS = 30;

async function open(browser, query) {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    await page.goto(PAGE + query, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const missing = await page.evaluate(() => [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src));
    if (missing.length) console.warn('No cargaron estas imágenes:\n  ' + missing.join('\n  '));
    return page;
}

(async () => {
    const browser = await chromium.launch();

    const still = await open(browser, '?export');
    await still.locator('#story').screenshot({ path: path.join(DIR, 'story.png') });
    console.log('story.png listo');

    if (!process.argv.includes('--png')) {
        const page = await open(browser, '?export&anim');
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-story-'));
        const frames = SECONDS * FPS;
        for (let i = 0; i < frames; i++) {
            await page.evaluate(ms => document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms; }), (i / FPS) * 1000);
            await page.locator('#story').screenshot({ path: path.join(tmp, `f${String(i).padStart(4, '0')}.png`) });
        }
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, 'f%04d.png'),
            '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart',
            path.join(DIR, 'story.mp4')]);
        fs.rmSync(tmp, { recursive: true, force: true });
        console.log('story.mp4 listo');
    }

    await browser.close();
})();
