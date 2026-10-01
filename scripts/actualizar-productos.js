// Actualiza precios e imágenes de productos-reales.js con el catálogo público de Farmacity (VTEX).
// Uso (Node 18 o superior):   node scripts/actualizar-productos.js
// Solo cambia precio de lista, precio final e imagen de cada línea que tenga "fcId"; los nombres,
// descripciones y categorías se mantienen. Si un producto no aparece o no tiene stock, lo avisa y lo deja igual.
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'productos-reales.js');
const API = 'https://www.farmacity.com/api/catalog_system/pub/products/search?fq=productId:';

// La imagen se pide a 500 × 500 px al CDN de VTEX
const imgUrl = raw => {
    const m = raw.match(/\/arquivos\/ids\/(\d+)\//);
    return m ? `https://farmacityar.vtexassets.com/arquivos/ids/${m[1]}-500-500` : raw;
};

async function fetchProduct(fcId) {
    const res = await fetch(API + fcId, { headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) });
    const [p] = await res.json();
    if (!p) return null;
    const item = p.items[0];
    const offer = item.sellers[0].commertialOffer;
    return { price: Math.round(offer.Price), list: Math.round(offer.ListPrice), stock: offer.AvailableQuantity, img: imgUrl(item.images[0].imageUrl) };
}

(async () => {
    let src = fs.readFileSync(FILE, 'utf8');
    const ids = [...src.matchAll(/fcId: (\d+)/g)].map(m => Number(m[1]));
    let changed = 0;
    for (const fcId of ids) {
        const p = await fetchProduct(fcId).catch(e => { console.warn(`  ${fcId}: error (${e.message})`); return null; });
        if (!p) { console.warn(`  ${fcId}: no se encontró, queda igual`); continue; }
        if (!p.stock) console.warn(`  ${fcId}: sin stock en Farmacity`);
        const line = new RegExp(`(fcId: ${fcId},[^\\n]*?listPrice: )\\d+(, price: )\\d+([^\\n]*?img: ')[^']*(')`);
        const next = src.replace(line, `$1${p.list}$2${p.price}$3${p.img}$4`);
        if (next !== src) { changed++; src = next; }
    }
    const today = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    src = src.replace(/Precios al \d{2}\/\d{2}\/\d{4}/, `Precios al ${today}`);
    fs.writeFileSync(FILE, src);
    console.log(`Listo: ${changed} de ${ids.length} productos con cambios. Precios al ${today}.`);
})();
