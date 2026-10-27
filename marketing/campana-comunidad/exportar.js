// FarmaGlass · exporta las piezas de la campaña "Entre todas".
//
//   node marketing/campana-comunidad/exportar.js            → todas las piezas
//   node marketing/campana-comunidad/exportar.js p1 s2      → solo las que empiezan con esos nombres
//
// Piezas: p = publicación (1080 × 1350), s = story (1080 × 1920), r = reel (1080 × 1920).
// Cada pieza fija sale en PNG y en JPG (Instagram publica por API solo JPG), en exportados/.
// Los reels (data-dur) salen en MP4 (H.264, 30 fps) y con su portada en JPG, que es el cuadro de data-cover.
// El reel se graba cuadro por cuadro: si la página define window.__render(segundos), se la llama con el instante de
// cada cuadro; si no, se adelantan las animaciones CSS. Necesita Playwright y, para el reel, ffmpeg con libx264.

const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');

let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(execFileSync('npm', ['root', '-g']).toString().trim(), 'playwright'))); }

const DIR = __dirname;
const OUT = path.join(DIR, 'exportados');
const FPS = 30;
const filtro = process.argv.slice(2);
const piezas = fs.readdirSync(DIR).filter(f => /^[psr]\d.*\.html$/.test(f) && (!filtro.length || filtro.some(p => f.startsWith(p)))).sort();

async function abrir(browser, file, query) {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    const errores = [];
    page.on('pageerror', e => errores.push(e.message));
    await page.goto('file://' + path.join(DIR, file) + query, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const faltan = await page.evaluate(() => [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.getAttribute('src')));
    if (faltan.length) console.warn(`  ${file}: no cargaron ${faltan.join(', ')}`);
    if (errores.length) console.warn(`  ${file}: errores de la página: ${errores.join(' | ')}`);
    return page;
}

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const browser = await chromium.launch();
    for (const file of piezas) {
        const base = file.replace(/\.html$/, '');
        const quieta = await abrir(browser, file, '?export');
        const dur = await quieta.evaluate(() => +document.querySelector('.art').dataset.dur || 0);
        const art = quieta.locator('.art');

        if (!dur) {
            await art.screenshot({ path: path.join(OUT, base + '.png') });
            await art.screenshot({ path: path.join(OUT, base + '.jpg'), type: 'jpeg', quality: 92 });
            console.log(`${base}: PNG y JPG`);
            await quieta.close();
            continue;
        }

        // Portada del reel: la página, sin animar, queda en el cuadro de data-cover
        await art.screenshot({ path: path.join(OUT, base + '-portada.jpg'), type: 'jpeg', quality: 92 });
        await quieta.close();

        const page = await abrir(browser, file, '?export&anim');
        const porTiempo = await page.evaluate(() => typeof window.__render === 'function');
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-reel-'));
        const cuadros = Math.round(dur * FPS);
        for (let i = 0; i < cuadros; i++) {
            const t = i / FPS;
            if (porTiempo) await page.evaluate(seg => window.__render(seg), t);
            else await page.evaluate(ms => document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms; }), t * 1000);
            await page.locator('.art').screenshot({ path: path.join(tmp, `c${String(i).padStart(4, '0')}.png`) });
        }
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, 'c%04d.png'),
            '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', path.join(OUT, base + '.mp4')]);
        fs.rmSync(tmp, { recursive: true, force: true });
        console.log(`${base}: MP4 de ${dur} s y portada`);
        await page.close();
    }
    await browser.close();
})();
