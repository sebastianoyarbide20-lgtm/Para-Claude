// Exporta la foto de perfil de Instagram: node marketing/perfil/exportar.js → perfil.png y perfil.jpg (1080 × 1080)
const path = require('path'); const { execFileSync } = require('child_process');
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(execFileSync('npm', ['root', '-g']).toString().trim(), 'playwright'))); }
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  await p.goto('file://' + path.join(__dirname, 'perfil.html')); await p.screenshot({ path: path.join(__dirname, 'perfil.png') });
  await p.screenshot({ path: path.join(__dirname, 'perfil.jpg'), type: 'jpeg', quality: 95 });
  await p.screenshot({ path: path.join(__dirname, 'perfil-vista-circulo.png') }); await b.close(); })();
