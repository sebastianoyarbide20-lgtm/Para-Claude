// FarmaGlass · portada en Shopify. Es el script de farmacia_v2.html con los datos de la tienda:
// productos y precios (snippet farmaglass-datos), carrito, cupones y pedidos reales (fg-shop.js),
// recetas y botón de arrepentimiento por el formulario de contacto, y newsletter como alta de suscriptor.
// Las páginas de cada farmacia son sus colecciones en la tienda.
// ── CONFIGURACIÓN ──
const FREE_SHIPPING_FROM = 15000;

// ── ÚNICA FUENTE DE DATOS: los productos de la tienda Shopify (snippet farmaglass-datos) ──
// listPrice: precio de lista (compare_at_price) · price: precio final · el descuento se calcula.
// Las etiquetas de cada producto dicen su categoría (cat-*), la farmacia que lo despacha (farmacia-*),
// si está en las ofertas del día (flash), si es de la línea propia de la farmacia (linea-propia) y su sello (badge:*).
const SHOP = window.FG_SHOPIFY || { products: [], customer: null, root: '/', collections: '/collections' };
const PHARMACY_IDS = ['centro', 'plaza', 'norte', 'parque'];
const PRODUCTS = SHOP.products.map(sp => {
    const tags = sp.tags || [];
    const tagged = prefix => tags.filter(t => t.startsWith(prefix)).map(t => t.slice(prefix.length));
    const badge = tagged('badge:')[0];
    const line = tags.includes('linea-propia');
    return {
        id: sp.id, variantId: sp.variantId, url: sp.url, available: sp.available, stock: sp.stock,
        name: sp.name, brand: sp.brand, listPrice: Math.max(sp.listPrice, sp.price), price: sp.price,
        cat: sp.type || 'Farmacia', categories: tagged('cat-'),
        pharmacy: PHARMACY_IDS.find(id => tags.includes('farmacia-' + id)) || 'centro',
        flash: tags.includes('flash'), badge, badgeType: badge === 'Nuevo' ? 'new' : undefined,
        sale: 'Venta libre', desc: sp.desc, img: sp.img, storeOnly: line, line,
    };
}).sort((a, b) => a.id - b.id); // el orden de la web: "Más vendidos"
const byId = new Map(PRODUCTS.map(p => [p.id, p]));

// ── FARMACIAS (prototipo) ──
// Identidad de cada farmacia (ver hojas de estilo en Figma: "FarmaGlass · Farmacias de la red")
const PHARMACIES = [
    { id: 'centro', name: 'Farmacia del Centro', zone: 'Recoleta', rating: 4.9, recommended: true,
      style: 'Clásica · boticaria', tagline: 'Botica tradicional desde 1962', line: 'Botica del Centro', short: 'BOTICA',
      hours: 'Lun a sáb · 8 a 21 h', street: 'Av. Callao 1450, Recoleta', letter: 'C', shape: 'arch',
      colors: { primary: '#14284B', accent: '#C9A227', bg: '#FBF6EA', ink: '#1B2238', sale: '#9B2335' }, labelFont: 'Georgia, serif',
      banner: { eyebrow: 'Selección Botica del Centro', title: 'Clásicos de botica, como siempre', text: 'Caléndula, agua de rosas, glicerina y vaselina elegidas por nuestros farmacéuticos.', featured: 101, cta: 'Ver la botica' } },
    { id: 'plaza', name: 'Farmacia Plaza Palermo', zone: 'Palermo', rating: 4.7,
      style: 'Urbana · pop', tagline: 'Abierta 24 h en el corazón de Palermo', line: 'Plaza Lab', short: 'PLAZA LAB',
      hours: 'Todos los días · 24 h', street: 'Av. Santa Fe 3720, Palermo', letter: 'P', shape: 'blob',
      colors: { primary: '#C2185B', accent: '#FFD23F', bg: '#FFF0F6', ink: '#2B1240', sale: '#C2185B' }, labelFont: 'Arial Black, sans-serif',
      banner: { eyebrow: 'Plaza Lab · 24 h', title: 'Skincare de noche, entrega de noche', text: 'Sérums, brumas y labiales con entrega a cualquier hora.', featured: 108, cta: 'Ver Plaza Lab' } },
    { id: 'norte', name: 'Farmacia Belgrano Norte', zone: 'Belgrano', rating: 4.6,
      style: 'Deportiva · activa', tagline: 'Rendimiento y bienestar para tu día', line: 'Norte Active', short: 'NORTE',
      hours: 'Lun a dom · 7 a 23 h', street: 'Av. Cabildo 2300, Belgrano', letter: 'N', shape: 'hex',
      colors: { primary: '#1F4FD8', accent: '#FF7A2E', bg: '#EEF3FF', ink: '#0B1B3F', sale: '#C2410C' }, labelFont: 'Impact, Arial Narrow, sans-serif',
      banner: { eyebrow: 'Norte Active', title: 'Recuperá energía para entrenar', text: 'Suplementos, hidratación y alivio muscular para tu rutina.', featured: 112, cta: 'Ver Norte Active' } },
    { id: 'parque', name: 'Farmacia Parque Caballito', zone: 'Caballito', rating: 4.8,
      style: 'Familiar · natural', tagline: 'Cuidamos a toda la familia, frente al parque', line: 'Parque Familia', short: 'FAMILIA',
      hours: 'Lun a sáb · 8 a 22 h', street: 'Av. Rivadavia 5200, Caballito', letter: 'P', shape: 'leaf',
      colors: { primary: '#4E6B3D', accent: '#B5532A', bg: '#F8F1E4', ink: '#2E3326', sale: '#B5532A' }, labelFont: 'Verdana, sans-serif',
      banner: { eyebrow: 'Parque Familia', title: 'Bebés felices, familias tranquilas', text: 'Higiene y cuidado suave para los más chicos y toda la casa.', featured: 113, cta: 'Ver Parque Familia' } },
];
const pharmById = new Map(PHARMACIES.map(f => [f.id, f]));
// Página de cada farmacia en la tienda: su colección
const PHARM_URL = { centro: 'farmacia-del-centro', plaza: 'farmacia-plaza-palermo', norte: 'farmacia-belgrano-norte', parque: 'farmacia-parque-caballito' };
const pharmUrl = id => `${SHOP.collections}/${PHARM_URL[id]}`;
// Coordenadas aproximadas (prototipo) para calcular distancias reales cuando se usa la ubicación
const PHARM_GEO = { centro: [-34.5947, -58.3937], plaza: [-34.5869, -58.4113], norte: [-34.5604, -58.4565], parque: [-34.6182, -58.4370] };
const ZONE_GEO = {
    'Palermo': [-34.5889, -58.4306], 'Belgrano': [-34.5627, -58.4583], 'Caballito': [-34.6187, -58.4404],
    'Recoleta': [-34.5875, -58.3974], 'Almagro': [-34.6092, -58.4211], 'Villa Urquiza': [-34.5733, -58.4877],
    'San Isidro': [-34.4708, -58.5276], 'Vicente López': [-34.5266, -58.4797], 'Avellaneda': [-34.6625, -58.3653],
};
function haversineKm([la1, lo1], [la2, lo2]) {
    const r = Math.PI / 180, a = Math.sin((la2 - la1) * r / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin((lo2 - lo1) * r / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(a));
}
const addrStore = {
    get() { try { return JSON.parse(localStorage.getItem('fg-address')); } catch { return null; } },
    set(v) { try { localStorage.setItem('fg-address', JSON.stringify(v)); } catch {} },
};
let address = addrStore.get();

// Prototipo: distancia simulada a partir de la dirección. En producción se calcula con geocodificación.
function distanceKm(pharm) {
    if (!address) return null;
    // Con ubicación real: distancia en línea recta × 1,25 por el trazado de las calles
    if (address.geo) return Math.max(0.2, Math.round(haversineKm(address.geo, PHARM_GEO[pharm.id]) * 1.25 * 10) / 10);
    const key = (address.zone + '|' + address.street + '|' + pharm.id).toLowerCase();
    let h = 0; for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const base = pharm.zone === address.zone ? 0.3 : 1.2;
    return Math.round((base + (h % 260) / 100) * 10) / 10;
}
const kmText = km => km.toFixed(1).replace('.', ',') + ' km';
function nearestPharmacy() {
    if (!address) return null;
    return PHARMACIES.reduce((a, b) => distanceKm(a) <= distanceKm(b) ? a : b);
}
function pharmHTML(p) {
    const f = pharmById.get(p.pharmacy);
    if (!f) return '';
    const near = nearestPharmacy();
    const km = distanceKm(f);
    let tag = '';
    if (near && near.id === f.id) tag = '<span class="pharm-tag tag-nearest"><svg class="icon" aria-hidden="true"><use href="#i-pin"/></svg><span class="tag-long">Tu farmacia más cercana</span><span class="tag-short">Más cercana</span></span>';
    else if (f.recommended) tag = '<span class="pharm-tag tag-recommended"><svg class="icon" aria-hidden="true"><use href="#i-star"/></svg><span class="tag-long">Farmacia recomendada</span><span class="tag-short">Recomendada</span></span>';
    return `${tag}<p class="card-pharm-name"><svg class="icon" aria-hidden="true"><use href="#i-store"/></svg><span><button type="button" class="pharm-go" data-store-go="${f.id}" aria-label="Ver ${esc(f.name)}">${esc(f.name)}</button></span>${km != null ? `<span class="km">${kmText(km)}</span>` : ''}</p>`;
}

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const fmt = n => money.format(Math.round(n));
const discountOf = p => Math.round((1 - p.price / p.listPrice) * 100);
const freeShipping = p => p.price >= FREE_SHIPPING_FROM;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const normalize = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function badgeHTML(p) {
    const d = discountOf(p);
    if (!p.available) return '<span class="card-badge badge-info">Sin stock</span>';
    if (p.badge) return `<span class="card-badge ${p.badgeType === 'new' ? 'badge-new' : d > 0 ? 'badge-sale' : 'badge-info'}">${esc(p.badge)}</span>`;
    if (d >= 20) return '<span class="card-badge badge-sale">Oferta</span>';
    return '';
}

function cardHTML(p) {
    const d = discountOf(p);
    return `
    <article class="product-card${d > 0 ? ' is-deal' : ''}">
        <div class="card-img-wrap">
            ${badgeHTML(p)}
            ${d > 0 ? '<span class="price-drop"><svg class="icon" aria-hidden="true"><use href="#i-down"/></svg>Bajó</span>' : ''}
            <img src="${esc(p.img)}" alt="" loading="lazy" referrerpolicy="no-referrer" width="200" height="200">
            <button class="card-fav" type="button" data-fav="${p.id}" aria-pressed="false" aria-label="Guardar ${esc(p.name)} en favoritos">
                <svg class="icon" aria-hidden="true"><use href="#i-heart"/></svg>
            </button>
            <button class="card-add" type="button" data-add="${p.id}" aria-label="Agregar ${esc(p.name)} al carrito">
                <svg class="icon" aria-hidden="true"><use href="#i-plus"/></svg>
            </button>
        </div>
        <div class="card-body">
            <div class="card-pharm" data-pharm-for="${p.id}">${pharmHTML(p)}</div>
            <h3 class="card-title"><a class="card-link" href="${esc(p.url)}" data-open="${p.id}">${esc(p.name)}</a></h3>
            <p class="card-rating"><span class="card-brand">${esc(p.brand)}</span>${p.rating ? `<span class="card-stars"><svg class="icon" aria-hidden="true"><use href="#i-star"/></svg><b>${p.rating.toFixed(1).replace('.', ',')}</b><span>(${p.reviews})</span><span class="sr-only"> reseñas</span></span>` : ''}</p>
            <div class="card-price-block">
                <p class="card-price-old">${d > 0 ? `<span class="sr-only">Antes </span>${fmt(p.listPrice)}` : ''}</p>
                <p class="card-price-row"><span class="card-price${d > 0 ? ' on-sale' : ''}">${fmt(p.price)}</span>${d > 0 ? `<span class="card-off">−${d} %</span>` : ''}</p>
                ${d > 0 ? `<p class="card-save">Ahorrás ${fmt(p.listPrice - p.price)}</p>` : '<p class="card-save-empty"></p>'}
            </div>
            <p class="card-shipping">${freeShipping(p) ? '<svg class="icon" aria-hidden="true"><use href="#i-truck"/></svg>Envío gratis' : ''}</p>
        </div>
    </article>`;
}

// ── BANNER DERMO: precios calculados con los productos reales ──
(() => {
    const dermo = PRODUCTS.filter(p => ['CeraVe', 'La Roche-Posay', 'Vichy'].includes(p.brand));
    if (!dermo.length) { document.querySelector('.promo-derma').remove(); return; }
    const cheapest = dermo.reduce((a, b) => (a.price <= b.price ? a : b));
    const maxOff = Math.max(...dermo.map(p => Math.round((1 - p.price / p.listPrice) * 100)));
    document.getElementById('promo-derma-kicker').textContent = maxOff > 0 ? `Semana dermo · hasta ${maxOff} % off` : 'Semana dermo';
    document.getElementById('promo-derma-price').textContent = money.format(cheapest.price);
    if (cheapest.img) document.getElementById('promo-derma-img').src = cheapest.img;
})();

// ── BANNERS SECUNDARIOS: imagen y precios de los productos de la tienda ──
document.querySelectorAll('[data-promo-img]').forEach(img => {
    const p = byId.get(Number(img.dataset.promoImg));
    if (p && p.img) img.src = p.img; else img.hidden = true;
});
document.querySelectorAll('[data-promo-price]').forEach(el => {
    const p = byId.get(Number(el.dataset.promoPrice));
    if (!p) return;
    const old = el.querySelector('.promo-old');
    if (old) { if (discountOf(p) > 0) old.textContent = fmt(p.listPrice); else old.remove(); }
    el.querySelector('.promo-new').textContent = fmt(p.price);
});
document.querySelectorAll('[data-promo-off]').forEach(el => {
    const p = byId.get(Number(el.dataset.promoOff));
    if (p) el.textContent = discountOf(p);
});

// ── RENDER ──
const grid = document.getElementById('products-container');
const flashList = document.getElementById('flash-carousel');
const CATALOG = PRODUCTS.filter(p => !p.storeOnly);
grid.innerHTML = CATALOG.map(p => `<li data-id="${p.id}">${cardHTML(p)}</li>`).join('') +
    `<li class="no-results" id="no-results" hidden><strong>No encontramos productos</strong>Probá con otro término o elegí otra categoría.<br><button type="button" id="reset-filters">Ver todos los productos</button></li>`;
flashList.innerHTML = PRODUCTS.filter(p => p.flash).sort((a, b) => discountOf(b) - discountOf(a)).map(p => `<li>${cardHTML(p)}</li>`).join('');

document.querySelectorAll('.card-img-wrap img, .hero-visual img').forEach(img => {
    const fail = () => img.parentElement.classList.add('img-failed');
    if (img.complete && img.naturalWidth === 0) fail();
    else img.addEventListener('error', fail, { once: true });
});

// ── CARRITO, CHECKOUT, FAVORITOS Y CUENTA: fg-shop.js ──
// Se comparten con las páginas de cada farmacia (farmacia-*.html). Los botones con
// data-add, data-fav, data-cart-open y data-account-open los atiende fg-shop.js.
const shopItem = p => ({ id: p.id, name: p.name, price: p.price, list: p.listPrice, img: p.img, store: p.pharmacy, variantId: p.variantId, stock: p.stock, available: p.available, url: p.url });
FGShop.register(PRODUCTS.map(shopItem));
const showToast = (msg, opts) => FGShop.toast(msg, opts);
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function addToCart(id, qty = 1) {
    const p = byId.get(id);
    if (!p) return;
    if (!p.available) { showToast(`${p.name} no tiene stock por ahora`); return; }
    if (FGShop.cart.add(shopItem(p), qty)) showToast(`${qty > 1 ? qty + ' × ' : ''}${p.name} agregado al carrito`, { action: 'Ver carrito', onAction: () => FGShop.open('cart') });
    else showToast(`Podés llevar hasta ${FGShop.maxQty(shopItem(p))} unidades de ${p.name}`);
}

// ── MODAL DE PRODUCTO ──
const dialog = document.getElementById('product-dialog');
const qtyVal = document.getElementById('qty-val');
const qtyMinus = document.getElementById('qty-minus');
let current = null, qty = 1;

function setQty(n) {
    qty = Math.max(1, Math.min(FGShop.maxQty(shopItem(current)), n));
    qtyVal.textContent = qty;
    qtyMinus.disabled = qty === 1;
    document.getElementById('qty-plus').disabled = qty >= FGShop.maxQty(shopItem(current));
    document.getElementById('dialog-add-label').textContent = current.available ? `Agregar al carrito · ${fmt(current.price * qty)}` : 'Sin stock por ahora';
}

let hashBeforeDialog = '';
function openProduct(id) {
    const p = byId.get(id);
    if (!p) return;
    current = p;
    pushRecent(p.id);
    const d = discountOf(p);
    const img = document.getElementById('dialog-img');
    img.src = p.img; img.alt = p.name;
    document.getElementById('dialog-meta').innerHTML =
        `<span class="pill">${esc(p.cat)}</span>` + (d > 0 ? `<span class="pill sale">${p.badge ? esc(p.badge) + ' · ' : ''}${d} % off</span>` : '');
    document.getElementById('dialog-title').textContent = p.name;
    document.getElementById('dialog-desc').textContent = p.desc;
    document.getElementById('dialog-facts').innerHTML =
        `<dt>Marca</dt><dd>${esc(p.brand)}</dd>` +
        `<dt>Condición de venta</dt><dd>${esc(p.sale)}</dd>` +
        `<dt>Farmacia</dt><dd>${esc(pharmById.get(p.pharmacy).name)}${address ? ` · ${kmText(distanceKm(pharmById.get(p.pharmacy)))}` : ''}</dd>` +
        `<dt>Envío</dt><dd>${freeShipping(p) ? 'Gratis, en 2 horas' : `En 2 horas · gratis desde ${fmt(FREE_SHIPPING_FROM)}`}</dd>`;
    document.getElementById('dialog-price-old').innerHTML = d > 0 ? `<s><span class="sr-only">Antes </span>${fmt(p.listPrice)}</s><b>Ahorrás ${fmt(p.listPrice - p.price)}</b>` : '';
    const price = document.getElementById('dialog-price');
    price.textContent = fmt(p.price);
    price.classList.toggle('on-sale', d > 0);
    document.getElementById('dialog-cuotas').innerHTML = `<b>3 cuotas sin interés</b> de ${fmt(p.price / 3)}`;
    document.getElementById('dialog-fav').dataset.fav = p.id;
    document.getElementById('dialog-page').href = p.url;
    document.getElementById('dialog-add').disabled = !p.available;
    // Relacionados: misma categoría o misma farmacia, primero los que tienen descuento
    const related = CATALOG.filter(o => o.id !== p.id && (o.categories.some(c => p.categories.includes(c)) || o.pharmacy === p.pharmacy))
        .sort((a, b) => discountOf(b) - discountOf(a)).slice(0, 3);
    document.getElementById('dialog-related').hidden = !related.length;
    document.getElementById('related-list').innerHTML = related.map(o => `<li><button class="related-item" type="button" data-open="${o.id}">
        <img src="${esc(o.img)}" alt="" loading="lazy" referrerpolicy="no-referrer" width="120" height="120">
        <span>${esc(o.name)}</span><b class="${discountOf(o) > 0 ? 'on-sale' : ''}">${fmt(o.price)}</b></button></li>`).join('');
    setQty(1);
    FGShop.refresh();
    if (!dialog.open) { hashBeforeDialog = location.hash.startsWith('#producto-') ? '' : location.hash; dialog.showModal(); }
    dialog.scrollTop = 0;
    // Enlace directo al producto (se puede compartir o recargar)
    history.replaceState(null, '', '#producto-' + p.id);
}

document.getElementById('dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => { history.replaceState(null, '', location.pathname + location.search + hashBeforeDialog); });
qtyMinus.addEventListener('click', () => setQty(qty - 1));
document.getElementById('qty-plus').addEventListener('click', () => setQty(qty + 1));
document.getElementById('dialog-add').addEventListener('click', () => { const id = current.id, n = qty; dialog.close(); addToCart(id, n); });
document.getElementById('dialog-share').addEventListener('click', () => {
    const url = location.href.split('#')[0] + '#producto-' + current.id;
    const text = `${current.name} a ${fmt(current.price)} en FarmaGlass`;
    if (navigator.share) { navigator.share({ title: current.name, text, url }).catch(() => {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => showToast('Copiamos el enlace del producto'), () => showToast(url));
    else showToast(url);
});

document.addEventListener('click', e => {
    const open = e.target.closest('[data-open]');
    if (open) { e.preventDefault(); openProduct(Number(open.dataset.open)); }
});

// ── VISTOS RECIENTEMENTE ──
const recentBox = document.getElementById('recent');
const recentList = document.getElementById('recent-list');
const recentStore = {
    get() { try { return (JSON.parse(localStorage.getItem('fg-recent')) || []).filter(id => byId.has(id)); } catch { return []; } },
    set(v) { try { localStorage.setItem('fg-recent', JSON.stringify(v)); } catch {} },
};
function pushRecent(id) { recentStore.set([id, ...recentStore.get().filter(x => x !== id)].slice(0, 8)); renderRecent(); }
function renderRecent() {
    const ids = recentStore.get();
    recentBox.hidden = !ids.length;
    recentList.innerHTML = ids.map(id => `<li>${cardHTML(byId.get(id))}</li>`).join('');
    FGShop.refresh();
}
document.getElementById('recent-clear').addEventListener('click', () => { recentStore.set([]); renderRecent(); showToast('Borramos tu historial de productos vistos'); });
renderRecent();

// ── FILTROS, ORDEN Y BÚSQUEDA ──
const chips = document.querySelectorAll('.cat-chip');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('product-search');
const searchClear = document.getElementById('search-clear');
const catalog = document.getElementById('catalogo');
const noResults = document.getElementById('no-results');
const itemCount = document.getElementById('item-count');
const sortSelect = document.getElementById('sort-select');
const toolsReset = document.getElementById('tools-reset');
const toggleBtns = document.querySelectorAll('[data-toggle]');
const toggles = { envio: false, cerca: false, favs: false };
let activeCat = 'todos', query = '';

function matches(p) {
    const inCat = activeCat === 'todos' || (activeCat === 'ofertas' ? discountOf(p) > 0 : p.categories.includes(activeCat));
    const q = normalize(query.trim());
    const inSearch = !q || q.split(/\s+/).every(w => normalize(`${p.name} ${p.brand} ${p.cat} ${p.desc} ${pharmById.get(p.pharmacy).name}`).includes(w));
    const near = nearestPharmacy();
    return inCat && inSearch
        && (!toggles.envio || freeShipping(p))
        && (!toggles.cerca || (near && p.pharmacy === near.id))
        && (!toggles.favs || FGShop.fav.has(p.id));
}

// De a una página por vez; cualquier cambio de filtro, búsqueda u orden vuelve a la primera
const pageSize = () => matchMedia('(min-width: 1024px)').matches ? 15 : 12;
const moreBox = document.getElementById('catalog-more');
let shown = pageSize(), lastFilter = '';
function filterProducts() {
    const signature = JSON.stringify([activeCat, query, toggles, sortSelect.value]);
    if (signature !== lastFilter) { shown = pageSize(); lastFilter = signature; }
    let count = 0;
    grid.querySelectorAll('li[data-id]').forEach(li => {
        const show = matches(byId.get(Number(li.dataset.id)));
        if (show) count++;
        li.hidden = !show || count > shown;
    });
    noResults.hidden = count > 0;
    itemCount.textContent = `${count} ${count === 1 ? 'producto' : 'productos'}`;
    const visible = Math.min(count, shown);
    moreBox.hidden = count <= shown;
    document.getElementById('catalog-more-info').textContent = `Estás viendo ${visible} de ${count} productos`;
    document.getElementById('catalog-more-bar').style.width = `${count ? Math.round(visible / count * 100) : 0}%`;
    document.getElementById('catalog-more-btn').textContent = `Mostrar ${Math.min(pageSize(), count - visible)} productos más`;
    toolsReset.hidden = !(Object.values(toggles).some(Boolean) || activeCat !== 'todos' || query || sortSelect.value !== 'relevancia');
}

const SORTS = {
    'precio-asc': (a, b) => a.price - b.price,
    'precio-desc': (a, b) => b.price - a.price,
    'descuento': (a, b) => discountOf(b) - discountOf(a) || a.price - b.price,
};
function sortProducts() {
    const items = new Map([...grid.querySelectorAll('li[data-id]')].map(li => [Number(li.dataset.id), li]));
    const order = CATALOG.slice();
    if (SORTS[sortSelect.value]) order.sort(SORTS[sortSelect.value]);
    order.forEach(p => grid.insertBefore(items.get(p.id), noResults));
}
sortSelect.addEventListener('change', () => { sortProducts(); filterProducts(); });
document.getElementById('catalog-more-btn').addEventListener('click', () => {
    const before = shown;
    shown += pageSize();
    filterProducts();
    // El foco pasa al primer producto nuevo para seguir navegando con teclado
    const next = [...grid.querySelectorAll('li[data-id]:not([hidden])')][before];
    if (next) next.querySelector('.card-link').focus({ preventScroll: true });
});

toggleBtns.forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.toggle;
    if (k === 'cerca' && !address) {
        showToast('Ingresá tu dirección para saber cuál es tu farmacia más cercana');
        document.getElementById('addr-btn').click();
        return;
    }
    toggles[k] = !toggles[k];
    b.setAttribute('aria-pressed', String(toggles[k]));
    filterProducts();
}));
// Si cambia la lista de favoritos con el filtro activo, se actualiza la grilla
FGShop.on(() => { if (toggles.favs) filterProducts(); });

// Si el catálogo no está a la vista, lo traemos para que el filtro tenga respuesta visible.
function revealResults() {
    const top = catalog.getBoundingClientRect().top;
    if (top > window.innerHeight * .5 || top < -catalog.offsetHeight + 200) {
        catalog.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' });
    }
}

function setCategory(cat) {
    activeCat = cat;
    chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.cat === cat)));
    filterProducts();
}

function resetFilters() {
    searchInput.value = ''; query = ''; searchClear.hidden = true; searchForm.classList.remove('has-value');
    Object.keys(toggles).forEach(k => { toggles[k] = false; });
    toggleBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
    sortSelect.value = 'relevancia'; sortProducts();
    setCategory('todos');
}

chips.forEach(chip => chip.addEventListener('click', () => { setCategory(chip.dataset.cat); revealResults(); }));
document.querySelectorAll('[data-go-cat]').forEach(b => b.addEventListener('click', () => { setCategory(b.dataset.goCat); catalog.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' }); }));
document.getElementById('reset-filters').addEventListener('click', resetFilters);
toolsReset.addEventListener('click', () => { resetFilters(); showToast('Mostramos todo el catálogo'); });

// ── BÚSQUEDA: filtra el catálogo y sugiere productos, categorías y farmacias ──
const suggestBox = document.getElementById('search-suggest');
const CATEGORIES = { dermocosmetica: 'Dermocosmética', cuidado: 'Cuidado personal', farmacia: 'Farmacia y botiquín', bebes: 'Bebés', nutricion: 'Nutrición', ofertas: 'Ofertas' };
const POPULAR = ['Protector solar', 'CeraVe', 'Sérum', 'Repelente', 'Magnesio'];
const recentSearches = {
    get() { try { return JSON.parse(localStorage.getItem('fg-searches')) || []; } catch { return []; } },
    add(q) { const v = [q, ...this.get().filter(x => normalize(x) !== normalize(q))].slice(0, 5); try { localStorage.setItem('fg-searches', JSON.stringify(v)); } catch {} },
};
let suggestions = [], activeSg = -1, searchScrolled = false;

function highlight(text, q) {
    const n = normalize(text), i = q ? n.indexOf(normalize(q)) : -1;
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
}
function buildSuggestions() {
    const q = searchInput.value.trim(), nq = normalize(q);
    const groups = [];
    if (!q) {
        const recent = recentSearches.get();
        if (recent.length) groups.push(['Búsquedas recientes', recent.map(t => ({ kind: 'query', value: t, icon: 'i-history', label: esc(t) }))]);
        groups.push(['Lo más buscado', POPULAR.map(t => ({ kind: 'query', value: t, icon: 'i-trend', label: esc(t) }))]);
    } else {
        const words = nq.split(/\s+/);
        const prods = PRODUCTS.filter(p => words.every(w => normalize(`${p.name} ${p.brand} ${p.cat}`).includes(w)))
            .sort((a, b) => normalize(a.name).indexOf(words[0]) - normalize(b.name).indexOf(words[0])).slice(0, 5);
        if (prods.length) groups.push(['Productos', prods.map(p => ({ kind: 'product', value: p.id, p }))]);
        const cats = Object.entries(CATEGORIES).filter(([, label]) => normalize(label).includes(nq));
        if (cats.length) groups.push(['Categorías', cats.map(([id, label]) => ({ kind: 'cat', value: id, icon: 'i-grid', label: highlight(label, q) }))]);
        const stores = PHARMACIES.filter(f => normalize(`${f.name} ${f.zone} ${f.line}`).includes(nq));
        if (stores.length) groups.push(['Farmacias', stores.map(f => ({ kind: 'store', value: f.id, icon: 'i-store', label: highlight(f.name, q), sub: `${f.zone} · ${f.line}` }))]);
        groups.push(['', [{ kind: 'query', value: q, icon: 'i-search', label: `<span class="sg-all">Ver todos los resultados para “${esc(q)}”</span>` }]]);
    }
    suggestions = [];
    suggestBox.innerHTML = groups.map(([title, items]) => {
        const head = title ? `<div class="sg-head" id="sg-h-${suggestions.length}">${title}</div>` : '';
        return `<div class="sg-group" role="group"${title ? ` aria-labelledby="sg-h-${suggestions.length}"` : ' aria-label="Buscar"'}>${head}${items.map(it => {
            const i = suggestions.push(it) - 1;
            if (it.kind === 'product') {
                const p = it.p, d = discountOf(p);
                return `<div class="sg-item" role="option" id="sg-${i}" data-sg="${i}" aria-selected="false">
                    <span class="sg-thumb"><img src="${esc(p.img)}" alt="" referrerpolicy="no-referrer" width="40" height="40" loading="lazy"></span>
                    <span class="sg-text"><span class="sg-name">${highlight(p.name, q)}</span><span class="sg-sub">${esc(pharmById.get(p.pharmacy).name)}${d > 0 ? ` · −${d} %` : ''}</span></span>
                    <span class="sg-price${d > 0 ? ' on-sale' : ''}">${fmt(p.price)}</span></div>`;
            }
            return `<div class="sg-item" role="option" id="sg-${i}" data-sg="${i}" aria-selected="false">
                <span class="sg-ico"><svg class="icon" aria-hidden="true"><use href="#${it.icon}"/></svg></span>
                <span class="sg-text"><span class="sg-name">${it.label}</span>${it.sub ? `<span class="sg-sub">${esc(it.sub)}</span>` : ''}</span></div>`;
        }).join('')}</div>`;
    }).join('');
    activeSg = -1;
    searchInput.removeAttribute('aria-activedescendant');
}
function openSuggest() {
    buildSuggestions();
    suggestBox.hidden = false;
    searchInput.setAttribute('aria-expanded', 'true');
}
function closeSuggest() {
    suggestBox.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
    searchInput.removeAttribute('aria-activedescendant');
    activeSg = -1;
}
function setActiveSg(i) {
    const items = suggestBox.querySelectorAll('[data-sg]');
    if (!items.length) return;
    activeSg = (i + items.length) % items.length;
    items.forEach((el, k) => el.setAttribute('aria-selected', String(k === activeSg)));
    const el = items[activeSg];
    searchInput.setAttribute('aria-activedescendant', el.id);
    el.scrollIntoView({ block: 'nearest' });
}
function runQuery(q) {
    searchInput.value = q;
    query = q;
    searchClear.hidden = !q;
    searchForm.classList.toggle('has-value', !!q);
    if (q.trim()) recentSearches.add(q.trim());
    if (activeCat !== 'todos') setCategory('todos'); else filterProducts();
    closeSuggest();
    revealResults();
}
function pickSuggestion(i) {
    const it = suggestions[i];
    if (!it) return;
    if (it.kind === 'query') { runQuery(it.value); searchInput.blur(); return; }
    closeSuggest();
    if (searchInput.value.trim()) recentSearches.add(searchInput.value.trim());
    if (it.kind === 'product') openProduct(it.value);
    if (it.kind === 'cat') { setCategory(it.value); catalog.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' }); }
    if (it.kind === 'store') location.href = pharmUrl(it.value);
}

searchInput.addEventListener('input', () => {
    query = searchInput.value;
    searchClear.hidden = !query;
    searchForm.classList.toggle('has-value', !!query);
    // Una búsqueda nueva parte de todas las categorías
    if (query && activeCat !== 'todos') setCategory('todos'); else filterProducts();
    if (query && !searchScrolled) { revealResults(); searchScrolled = true; }
    if (!query) searchScrolled = false;
    openSuggest();
});
searchInput.addEventListener('focus', openSuggest);
searchInput.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (suggestBox.hidden) openSuggest(); setActiveSg(activeSg + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSg(activeSg - 1); }
    else if (e.key === 'Escape') { if (!suggestBox.hidden) { e.preventDefault(); closeSuggest(); } else if (searchInput.value) { e.preventDefault(); searchClear.click(); } }
    else if (e.key === 'Enter' && activeSg >= 0 && !suggestBox.hidden) { e.preventDefault(); pickSuggestion(activeSg); }
    else if (e.key === 'Tab') closeSuggest();
});
// mousedown evita que el campo pierda el foco antes del clic
suggestBox.addEventListener('mousedown', e => e.preventDefault());
suggestBox.addEventListener('click', e => { const it = e.target.closest('[data-sg]'); if (it) pickSuggestion(Number(it.dataset.sg)); });
document.addEventListener('click', e => { if (!searchForm.contains(e.target)) closeSuggest(); });
searchForm.addEventListener('submit', e => { e.preventDefault(); runQuery(searchInput.value); searchInput.blur(); });
searchClear.addEventListener('click', () => { searchInput.value = ''; searchInput.dispatchEvent(new Event('input')); searchInput.focus(); });

// Atajo: "/" lleva al buscador
document.addEventListener('keydown', e => {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || document.querySelector('dialog[open]')) return;
    if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    e.preventDefault();
    searchInput.focus();
});

filterProducts();

// Borde de la barra de categorías cuando queda fija
const header = document.querySelector('.global-header');
const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── CARRUSEL DE BANNERS ──
(() => {
    const track = document.getElementById('promo-track');
    const slides = [...track.children];
    const dotsBox = document.getElementById('promo-dots');
    const pauseBtn = document.getElementById('promo-pause');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const perView = () => Math.max(1, Math.round(track.clientWidth / slides[0].getBoundingClientRect().width));
    const pages = () => Math.max(1, slides.length - perView() + 1);
    let page = 0, timer = null, paused = reduce.matches;

    function renderDots() {
        dotsBox.innerHTML = Array.from({ length: pages() }, (_, i) =>
            `<button class="promo-dot" type="button" aria-label="Ir al banner ${i + 1}" data-page="${i}"></button>`).join('');
        syncDots();
    }
    function syncDots() {
        dotsBox.querySelectorAll('.promo-dot').forEach((d, i) => d.setAttribute('aria-current', String(i === page)));
    }
    function goTo(i) {
        page = (i + pages()) % pages();
        track.scrollTo({ left: slides[page].offsetLeft - slides[0].offsetLeft, behavior: reduce.matches ? 'auto' : 'smooth' });
        syncDots();
    }
    function start() { stop(); if (!paused) timer = setInterval(() => goTo(page + 1), 5000); }
    function stop() { clearInterval(timer); timer = null; }

    document.getElementById('promo-prev').addEventListener('click', () => { goTo(page - 1); start(); });
    document.getElementById('promo-next').addEventListener('click', () => { goTo(page + 1); start(); });
    dotsBox.addEventListener('click', e => { const d = e.target.closest('[data-page]'); if (d) { goTo(Number(d.dataset.page)); start(); } });
    pauseBtn.addEventListener('click', () => {
        paused = !paused;
        pauseBtn.setAttribute('aria-pressed', String(paused));
        pauseBtn.setAttribute('aria-label', paused ? 'Reanudar banners' : 'Pausar banners');
        start();
    });
    pauseBtn.setAttribute('aria-pressed', String(paused));
    if (paused) pauseBtn.setAttribute('aria-label', 'Reanudar banners');

    // Pausa mientras la persona interactúa
    const carousel = track.closest('.promo-carousel');
    ['mouseenter', 'focusin', 'touchstart'].forEach(ev => carousel.addEventListener(ev, stop, { passive: true }));
    ['mouseleave', 'focusout', 'touchend'].forEach(ev => carousel.addEventListener(ev, start, { passive: true }));

    // Sincroniza los puntos cuando se desliza a mano
    let t;
    track.addEventListener('scroll', () => {
        clearTimeout(t);
        t = setTimeout(() => {
            const w = slides[1].offsetLeft - slides[0].offsetLeft;
            page = Math.min(pages() - 1, Math.round(track.scrollLeft / w));
            syncDots();
        }, 80);
    }, { passive: true });
    window.addEventListener('resize', () => { renderDots(); goTo(Math.min(page, pages() - 1)); });

    renderDots();
    start();
})();

// ── CARRUSEL DE OFERTAS: flechas en escritorio ──
const arrows = document.querySelectorAll('.carousel-arrow');
function updateArrows() {
    const max = flashList.scrollWidth - flashList.clientWidth - 2;
    arrows[0].disabled = flashList.scrollLeft <= 2;
    arrows[1].disabled = flashList.scrollLeft >= max;
}
arrows.forEach(a => a.addEventListener('click', () => flashList.scrollBy({ left: Number(a.dataset.dir) * flashList.clientWidth * .8, behavior: 'smooth' })));
flashList.addEventListener('scroll', updateArrows, { passive: true });
window.addEventListener('resize', updateArrows);
updateArrows();

// ── RELOJ REAL: las ofertas del día vencen a las 23:59:59 ──
const flashEnd = new Date(); flashEnd.setHours(23, 59, 59, 999);
const pad = n => String(n).padStart(2, '0');
function updateFlashTimer() {
    const diff = Math.max(0, flashEnd - Date.now());
    document.getElementById('flash-h').textContent = pad(Math.floor(diff / 3600000));
    document.getElementById('flash-m').textContent = pad(Math.floor(diff % 3600000 / 60000));
    document.getElementById('flash-s').textContent = pad(Math.floor(diff % 60000 / 1000));
}
updateFlashTimer();
setInterval(updateFlashTimer, 1000);

// ── BANDA DE BIENVENIDA: tras 50 % de scroll, una sola vez ──
const welcome = document.getElementById('welcome-bar');
const storage = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};
if (!storage.get('fg-welcome-dismissed')) {
    const maybeShow = () => {
        const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        if (progress > .5) { welcome.classList.add('show'); window.removeEventListener('scroll', maybeShow); }
    };
    window.addEventListener('scroll', maybeShow, { passive: true });
}
document.getElementById('welcome-close').addEventListener('click', () => {
    welcome.classList.remove('show');
    storage.set('fg-welcome-dismissed', '1');
});
document.getElementById('welcome-copy').addEventListener('click', async () => {
    const res = await FGShop.coupon.apply('NUEVO20');
    showToast(res.msg, res.ok ? { action: 'Ver carrito', onAction: () => FGShop.open('cart') } : {});
    if (res.ok) { welcome.classList.remove('show'); storage.set('fg-welcome-dismissed', '1'); }
});

// ── FARMACIAS DE LA RED ──
const storeTabs = document.getElementById('store-tabs');
const storePanel = document.getElementById('store-panel');
let activeStore = null, storeChosen = false;
const LOGO_SHAPES = {
    arch: 'M6 45V24a18 18 0 0 1 36 0v21z',
    blob: 'M24 3c12 0 21 8 21 20 0 13-9 22-21 22S3 37 3 25C3 12 12 3 24 3z',
    hex: 'M24 2l19 11v22L24 46 5 35V13z',
    leaf: 'M4 44V24C4 12 12 4 24 4h20v20c0 12-8 20-20 20z',
};
function logoSVG(f, size) {
    return `<svg class="store-logo" viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true">
        <path d="${LOGO_SHAPES[f.shape]}" fill="${f.colors.primary}"/>
        <circle cx="39" cy="9" r="6" fill="${f.colors.accent}" stroke="${f.colors.bg}" stroke-width="2.5"/>
        <text x="24" y="${f.shape === 'arch' ? 37 : 32}" text-anchor="middle" font-size="22" fill="#fff">${f.letter}</text></svg>`;
}
const storeDefault = () => (nearestPharmacy() || PHARMACIES.find(f => f.recommended)).id;
// Horario real de cada farmacia (fg-shop.js)
const openHTML = (id, short) => { const st = FGShop.openStatus(id); return `<span class="open-dot${st.open ? ' on' : ''}">${esc(short ? st.short : st.text)}</span>`; };

function renderStores() {
    if (!storeChosen || !activeStore) activeStore = storeDefault();
    const near = nearestPharmacy();
    storeTabs.innerHTML = PHARMACIES.map(f => {
        const km = distanceKm(f);
        const sel = f.id === activeStore;
        const flag = near && near.id === f.id
            ? '<span class="store-flag tag-nearest">Más cercana</span>'
            : f.recommended ? '<span class="store-flag tag-recommended">Recomendada</span>' : '';
        return `<button class="store-tab" type="button" role="tab" id="tab-${f.id}" aria-selected="${sel}" aria-controls="store-panel" tabindex="${sel ? 0 : -1}" data-theme="${f.id}" data-store-tab="${f.id}">
            ${flag}${logoSVG(f, 44)}
            <span class="store-tab-text"><span class="store-tab-name">${esc(f.name)}</span>
            <span class="store-tab-meta">${esc(f.style)}${km != null ? ` · ${kmText(km)}` : ''}</span>
            <span class="store-tab-meta">${openHTML(f.id, true)}</span></span>
        </button>`;
    }).join('');
    renderStorePanel();
}

// ── BANNER DE CADA FARMACIA: se usa en la portada y en "Farmacias de la red" ──
// Cada farmacia tiene su propia composición (no solo sus colores):
// Centro = gaceta de 1962 · Plaza = noche de neón · Norte = marcador deportivo · Parque = escena ilustrada.
const hhmm = d => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
const shortProduct = p => p.name.replace(/\s*\([^)]*\)$/, '');
const featuredOf = f => byId.get(f.banner.featured) || PRODUCTS.filter(p => p.pharmacy === f.id).sort((a, b) => discountOf(b) - discountOf(a))[0];
function bannerCtx(f) {
    const feat = featuredOf(f);
    const km = distanceKm(f);
    return {
        feat, d: discountOf(feat), st: FGShop.openStatus(f.id),
        eta: km != null ? `${kmText(km)} · llega en ~${Math.round(25 + km * 12)} min` : 'Ingresá tu dirección para ver el tiempo de entrega',
        img: (p, w = 220) => `<img src="${esc(p.img)}" alt="" width="${w}" height="${w}" loading="lazy" referrerpolicy="no-referrer">`,
        add: (p, text, cls) => `<button class="sb-btn ${cls}" type="button" data-add="${p.id}" aria-label="Agregar ${esc(p.name)} al carrito">${text}</button>`,
        page: pharmUrl(f.id),
    };
}
const BANNERS = {
    centro(f, tag, c) {
        const date = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
        return `<div class="sb sb-centro">
            <div class="sbc-top">${logoSVG(f, 40)}<p class="store-name">${esc(f.name)}</p><span class="sbc-date">Recoleta · ${date}</span></div>
            <div class="sbc-body">
                <div class="sbc-text">
                    <p class="sbc-kicker">${esc(f.banner.eyebrow)}</p>
                    <${tag} class="sbc-title">${esc(f.banner.title)}</${tag}>
                    <p class="sbc-lead">${esc(f.banner.text)}</p>
                    <div class="sbc-actions">${c.add(c.feat, 'Agregar a mi pedido', 'sbc-btn')}<a class="sbc-link" href="${c.page}">Leer la gaceta →</a></div>
                </div>
                <figure class="sbc-fig">
                    <div class="sbc-arch">${c.img(c.feat)}</div>
                    <figcaption>Fig. 1 — ${esc(shortProduct(c.feat))}</figcaption>
                    <p class="sbc-stamp">${c.d > 0 ? `<small>Oferta −${c.d} %</small><b>${fmt(c.feat.price)}</b><s><span class="sr-only">Antes </span>${fmt(c.feat.listPrice)}</s>` : `<small>Precio</small><b>${fmt(c.feat.price)}</b>`}</p>
                </figure>
            </div>
            <p class="sbc-colophon">${esc(f.hours)} · <span class="open-dot${c.st.open ? ' on' : ''}">${esc(c.st.text)}</span><span class="sbc-more"> · ${esc(f.street)} · ${esc(c.eta)}</span></p>
        </div>`;
    },
    plaza(f, tag, c) {
        const title = esc(f.banner.title).replace('entrega', '<mark>entrega</mark>').replace(/^([^,]+,)/, '<span class="glow">$1</span>');
        return `<div class="sb sb-plaza">
            <span class="sbp-moon" aria-hidden="true"></span><span class="sbp-24" aria-hidden="true">24</span>
            <div class="sbp-text">
                <div class="sbp-top">${logoSVG(f, 40)}<div><p class="store-name">Plaza Palermo</p><p class="sbp-clock"><time data-live-clock>${hhmm(new Date())}</time> · Abierto ahora</p></div></div>
                <p class="sbp-kicker">${esc(f.banner.eyebrow)}</p>
                <${tag} class="sbp-title">${title}</${tag}>
                <p class="sbp-lead">${esc(f.banner.text)}</p>
                <div class="sbp-actions">${c.add(c.feat, `Agregar · ${fmt(c.feat.price)}`, 'sbp-btn')}<a class="sbp-link" href="${c.page}">Entrar a Plaza →</a></div>
            </div>
            <div class="sbp-card">
                ${c.d > 0 ? `<span class="sbp-off">−${c.d} %</span>` : ''}
                <div class="sbp-card-in"><span class="sbp-code">PL-${c.feat.id} · ★</span><div class="sbp-art">${c.img(c.feat)}</div><p class="sbp-name">${esc(shortProduct(c.feat))}</p>
                <p class="sbp-price">${c.d > 0 ? `<s><span class="sr-only">Antes </span>${fmt(c.feat.listPrice)}</s>` : ''}${fmt(c.feat.price)}</p></div>
            </div>
            <ul class="sbp-chips" aria-label="Datos de la farmacia"><li>${esc(f.hours)}</li><li>${esc(f.street)}</li><li>${esc(c.eta)}</li></ul>
        </div>`;
    },
    norte(f, tag, c) {
        const title = esc(f.banner.title).replace('energía', '<i>energía</i>');
        return `<div class="sb sb-norte">
            <div class="sbn-main">
                <div class="sbn-top">${logoSVG(f, 40)}<p class="store-name">Belgrano Norte</p><span class="sbn-tag">Training Club</span></div>
                <${tag} class="sbn-title">${title}</${tag}>
                <p class="sbn-lead">${esc(f.banner.text)}</p>
                <div class="sbn-actions">${c.add(c.feat, `<span>Sumar · ${fmt(c.feat.price)}</span>`, 'sbn-btn')}<a class="sbn-link" href="${c.page}">Armá tu kit →</a></div>
            </div>
            <div class="sbn-art">
                <div class="sbn-frame">${c.img(c.feat)}</div>
                ${c.d > 0 ? `<span class="sbn-off">−${c.d} %</span>` : ''}
                <p class="sbn-price"><span>${esc(shortProduct(c.feat))}</span>${c.d > 0 ? `<s><span class="sr-only">Antes </span>${fmt(c.feat.listPrice)}</s> ` : ''}<b>${fmt(c.feat.price)}</b></p>
            </div>
            <dl class="sbn-board">
                <div><dt>Horario</dt><dd>07–23</dd></div>
                <div><dt>Ahora</dt><dd class="${c.st.open ? 'on' : 'off'}">${c.st.open ? 'Abierta' : 'Cerrada'}</dd></div>
                <div><dt>Retiro</dt><dd>12'</dd></div>
                <div><dt>Envío</dt><dd>${distanceKm(f) != null ? `~${Math.round(25 + distanceKm(f) * 12)}'` : '2 h'}</dd></div>
            </dl>
        </div>`;
    },
    parque(f, tag, c) {
        const title = esc(f.banner.title).replace(/,\s*(.+)$/, ', <span>$1</span>');
        const picnic = [114, c.feat.id, 115].map(id => byId.get(id)).filter(Boolean);
        return `<div class="sb sb-parque">
            <svg class="sbk-scene" viewBox="0 0 800 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
                <defs><pattern id="sbk-checks" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="skewX(-30)"><rect width="24" height="24" fill="#FFF4E6"/><rect width="12" height="12" fill="#E8896A"/><rect x="12" y="12" width="12" height="12" fill="#E8896A"/></pattern></defs>
                <circle cx="690" cy="70" r="40" fill="#F6C760"/><circle cx="690" cy="70" r="58" fill="#F6C760" opacity=".25"/>
                <g fill="#fff" opacity=".9"><ellipse cx="420" cy="70" rx="46" ry="16"/><ellipse cx="450" cy="60" rx="30" ry="18"/></g>
                <path d="M560 70 l20 28 -20 34 -20 -34z" fill="#B5532A"/><path d="M560 132 c -14 26 22 40 0 70" stroke="#3A5230" stroke-width="2" fill="none"/>
                <path d="M0 290 Q 200 240 420 280 T 800 260 V400 H0Z" fill="#A9C98E"/>
                <path d="M0 330 Q 260 300 520 330 T 800 320 V400 H0Z" fill="#8DB572"/>
                <g><rect x="740" y="230" width="10" height="70" rx="5" fill="#7A5634"/><circle cx="745" cy="214" r="40" fill="#6E9A57"/></g>
                <path d="M430 390 L770 390 L735 340 L470 340 Z" fill="url(#sbk-checks)"/>
            </svg>
            <div class="sbk-card">
                <div class="sbk-top">${logoSVG(f, 40)}<div><p class="store-name">Parque Caballito</p><p class="sbk-hand">frente a Parque Rivadavia</p></div></div>
                <${tag} class="sbk-title">${title}</${tag}>
                <p class="sbk-lead">${esc(f.banner.text)}</p>
                <div class="sbk-deal"><span class="sbk-deal-name">${esc(shortProduct(c.feat))}</span><span class="sbk-bubble">${c.d > 0 ? `<s><span class="sr-only">Antes </span>${fmt(c.feat.listPrice)}</s>` : ''}${fmt(c.feat.price)}</span>${c.d > 0 ? `<em>−${c.d} %</em>` : ''}</div>
                <div class="sbk-actions">${c.add(c.feat, 'Agregar', 'sbk-btn')}<a class="sbk-link" href="${c.page}">Visitar la farmacia →</a></div>
                <p class="sbk-info"><span class="open-dot${c.st.open ? ' on' : ''}">${esc(c.st.text)}</span> · ${esc(c.eta)}</p>
            </div>
            <div class="sbk-picnic" aria-hidden="true">${picnic.map(p => `<span>${c.img(p, 160)}</span>`).join('')}</div>
        </div>`;
    },
};
function storeBannerHTML(f, tag) { return BANNERS[f.id](f, tag, bannerCtx(f)); }
// El reloj de Plaza en el banner se mantiene en hora
setInterval(() => document.querySelectorAll('[data-live-clock]').forEach(t => { t.textContent = hhmm(new Date()); }), 20000);

// ── PORTADA: rota entre las farmacias de la red (7 s, se pausa al interactuar) ──
const heroBox = document.getElementById('hero-stores');
const heroSlide = document.getElementById('hero-slide');
const heroSwitch = document.getElementById('hero-switch');
const heroPause = document.getElementById('hero-pause');
let heroIndex = 0, heroTimer = null, heroPaused = matchMedia('(prefers-reduced-motion: reduce)').matches, heroHold = false;
function renderHero(animate) {
    const f = PHARMACIES[heroIndex];
    heroSlide.dataset.theme = f.id;
    heroSlide.setAttribute('aria-label', `${heroIndex + 1} de ${PHARMACIES.length}: ${f.name}`);
    heroSlide.innerHTML = storeBannerHTML(f, 'h2');
    heroSlide.classList.remove('is-in');
    if (animate) { void heroSlide.offsetWidth; heroSlide.classList.add('is-in'); }
    heroSwitch.innerHTML = PHARMACIES.map((p, i) => `<button class="hero-pick" type="button" data-hero="${i}" aria-pressed="${i === heroIndex}">${logoSVG(p, 34)}${esc(p.name.replace(/^Farmacia (del )?/, ''))}</button>`).join('');
    heroBox.classList.toggle('is-playing', !!heroTimer);
}
function heroGo(i, animate = true) { heroIndex = (i + PHARMACIES.length) % PHARMACIES.length; renderHero(animate); }
function heroStart() {
    clearInterval(heroTimer); heroTimer = null;
    if (!heroPaused && !heroHold) heroTimer = setInterval(() => heroGo(heroIndex + 1), 7000);
    heroBox.classList.toggle('is-playing', !!heroTimer);
}
heroSwitch.addEventListener('click', e => {
    const b = e.target.closest('[data-hero]');
    if (!b) return;
    heroGo(Number(b.dataset.hero)); heroStart();
    heroSwitch.querySelector(`[data-hero="${heroIndex}"]`).focus();
});
heroPause.addEventListener('click', () => {
    heroPaused = !heroPaused;
    heroPause.setAttribute('aria-pressed', String(heroPaused));
    heroPause.setAttribute('aria-label', heroPaused ? 'Reanudar portada' : 'Pausar portada');
    heroStart();
});
heroPause.setAttribute('aria-pressed', String(heroPaused));
if (heroPaused) heroPause.setAttribute('aria-label', 'Reanudar portada');
// Mientras la persona lee o usa la portada, no cambia sola
heroSlide.addEventListener('mouseenter', () => { heroHold = true; heroStart(); });
heroSlide.addEventListener('mouseleave', () => { heroHold = false; heroStart(); });
heroSlide.addEventListener('focusin', () => { heroHold = true; heroStart(); });
heroSlide.addEventListener('focusout', () => { heroHold = false; heroStart(); });

function renderStorePanel() {
    const f = pharmById.get(activeStore);
    const line = PRODUCTS.filter(p => p.storeOnly && p.pharmacy === f.id);
    // Productos del catálogo que despacha esta farmacia, primero los de mayor descuento
    const brands = PRODUCTS.filter(p => !p.storeOnly && p.pharmacy === f.id).sort((a, b) => discountOf(b) - discountOf(a));
    const alsoCount = CATALOG.filter(p => p.pharmacy === f.id).length;
    storePanel.dataset.theme = f.id;
    storePanel.setAttribute('aria-labelledby', 'tab-' + f.id);
    storePanel.innerHTML = `
        ${storeBannerHTML(f, 'h3')}
        ${brands.length ? `<div class="store-line-head">
            <h3>Marcas en ${esc(f.name)}</h3>
            <a href="${pharmUrl(f.id)}">Ver los ${brands.length} productos en la farmacia →</a>
        </div>
        <ul class="product-grid store-grid">${brands.slice(0, 4).map(p => `<li>${cardHTML(p)}</li>`).join('')}</ul>` : ''}
        <div class="store-line-head" id="store-line">
            <h3>Línea ${esc(f.line)}</h3>
            <p>${line.length} productos seleccionados · también despacha ${alsoCount} productos del catálogo</p>
        </div>
        <ul class="product-grid store-grid">${line.map(p => `<li>${cardHTML(p)}</li>`).join('')}</ul>`;
    FGShop.refresh();
}

function selectStore(id, { scroll = false, focus = false } = {}) {
    if (!pharmById.has(id)) return;
    activeStore = id; storeChosen = true;
    renderStores();
    if (scroll) document.getElementById('farmacias').scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' });
    if (focus) document.getElementById('tab-' + id).focus();
}
storeTabs.addEventListener('click', e => {
    const t = e.target.closest('[data-store-tab]');
    if (t) selectStore(t.dataset.storeTab, { focus: true });
});
// Flechas izquierda/derecha entre pestañas
storeTabs.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const i = PHARMACIES.findIndex(f => f.id === activeStore);
    const n = PHARMACIES.length;
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + n) % n;
    selectStore(PHARMACIES[next].id, { focus: true });
});
// Cualquier enlace a una farmacia (tarjetas, lista de cercanas) lleva a su página
document.addEventListener('click', e => {
    const go = e.target.closest('[data-store-go]');
    if (go && pharmById.has(go.dataset.storeGo)) { e.preventDefault(); location.href = pharmUrl(go.dataset.storeGo); }
});
const fromHash = () => { if (location.hash.startsWith('#farmacia-')) selectStore(location.hash.slice(10), { scroll: true }); };
window.addEventListener('hashchange', fromHash);

// ── DIRECCIÓN DEL VISITANTE ──
const addrPanel = document.getElementById('addr-panel');
const addrForm = document.getElementById('addr-form');
const addrResult = document.getElementById('addr-result');
function renderAddress() {
    const btn = document.getElementById('addr-btn');
    const label = document.getElementById('addr-label');
    btn.classList.toggle('is-set', !!address);
    label.textContent = address ? `${address.street}, ${address.zone}` : 'Ingresá tu dirección';
    btn.setAttribute('aria-label', address ? `Entregar en ${address.street}, ${address.zone}. Cambiar dirección` : 'Ingresá tu dirección de entrega');
    addrForm.hidden = !!address;
    addrResult.hidden = !address;
    document.getElementById('addr-sub').textContent = address
        ? 'Estas son las farmacias de la red que llegan a tu dirección.'
        : 'Ingresá tu dirección y te mostramos la farmacia más cercana, con tiempos y precios de tu zona.';
    if (address) {
        document.getElementById('addr-current').textContent = `${address.street}, ${address.zone}`;
        const near = nearestPharmacy();
        const list = [...PHARMACIES].sort((a, b) => distanceKm(a) - distanceKm(b)).slice(0, 3);
        document.getElementById('pharm-list').innerHTML = list.map(f => {
            const km = distanceKm(f);
            const mins = Math.round(25 + km * 12);
            const flag = f.id === near.id
                ? '<span class="pharm-flag tag-nearest">Más cercana</span>'
                : f.recommended ? '<span class="pharm-flag tag-recommended">Recomendada</span>' : '';
            return `<li class="pharm-item${f.id === near.id ? ' is-nearest' : ''}">${flag}
                <span class="ico-tile"><svg class="icon" aria-hidden="true"><use href="#i-store"/></svg></span>
                <div><p class="pharm-name">${esc(f.name)}</p>
                <p class="pharm-meta">${kmText(km)} · llega en ~${mins} min</p>
                <p class="pharm-meta">${openHTML(f.id)}</p></div>
                <button type="button" class="pharm-see" data-store-go="${f.id}" aria-label="Ver ${esc(f.name)}">Ver</button></li>`;
        }).join('');
    }
    // La más cercana queda elegida para "Retiro en farmacia" y para las recetas
    const near = nearestPharmacy();
    if (near) { FGShop.setStore(near.id); FGReceta.setStore(near.id); }
    // Actualiza la farmacia en todas las tarjetas, la portada y las pestañas de farmacias
    renderHero(false);
    renderStores();
    document.querySelectorAll('[data-pharm-for]').forEach(el => { el.innerHTML = pharmHTML(byId.get(Number(el.dataset.pharmFor))); });
}
addrForm.addEventListener('submit', e => {
    e.preventDefault();
    const street = document.getElementById('addr-street');
    const zone = document.getElementById('addr-zone');
    const msg = document.getElementById('addr-msg');
    if (!street.value.trim() || !/\d/.test(street.value)) { msg.textContent = 'Ingresá la calle y el número, por ejemplo: Av. Corrientes 1234.'; street.focus(); return; }
    if (!zone.value) { msg.textContent = 'Elegí tu barrio o localidad.'; zone.focus(); return; }
    msg.textContent = '';
    address = { street: street.value.trim(), zone: zone.value };
    addrStore.set(address);
    renderAddress();
    showToast(`Listo: tu farmacia más cercana es ${nearestPharmacy().name}`);
});
// Ubicación actual: elige el barrio más cercano y calcula distancias reales
const geoBtn = document.getElementById('addr-geo');
geoBtn.addEventListener('click', () => {
    const msg = document.getElementById('addr-msg');
    const label = geoBtn.querySelector('span');
    if (!navigator.geolocation) { msg.textContent = 'Tu navegador no permite compartir la ubicación. Escribí tu dirección.'; return; }
    geoBtn.disabled = true; label.textContent = 'Buscando tu ubicación…';
    const done = () => { geoBtn.disabled = false; label.textContent = 'Usar mi ubicación actual'; };
    navigator.geolocation.getCurrentPosition(pos => {
        done();
        const here = [pos.coords.latitude, pos.coords.longitude];
        const [zone, km] = Object.entries(ZONE_GEO).map(([z, g]) => [z, haversineKm(here, g)]).sort((a, b) => a[1] - b[1])[0];
        if (km > 25) { msg.textContent = 'Todavía no llegamos a tu zona: por ahora entregamos en CABA y GBA.'; return; }
        msg.textContent = '';
        // Se guarda redondeada (unos 100 m) y solo en este navegador
        address = { street: 'Mi ubicación actual', zone, geo: here.map(n => Math.round(n * 1000) / 1000) };
        addrStore.set(address);
        renderAddress();
        showToast(`Listo: tu farmacia más cercana es ${nearestPharmacy().name}`);
    }, err => {
        done();
        msg.textContent = err.code === 1
            ? 'No diste permiso para usar tu ubicación. Podés escribir tu dirección.'
            : 'No pudimos obtener tu ubicación. Probá escribiendo tu dirección.';
    }, { timeout: 10000, maximumAge: 300000 });
});
document.getElementById('addr-change').addEventListener('click', () => {
    document.getElementById('addr-street').value = address && /\d/.test(address.street) ? address.street : '';
    document.getElementById('addr-zone').value = address ? address.zone : '';
    addrForm.hidden = false; addrResult.hidden = true;
    document.getElementById('addr-street').focus();
});
document.getElementById('addr-btn').addEventListener('click', () => {
    addrPanel.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    if (!address) setTimeout(() => document.getElementById('addr-street').focus({ preventScroll: true }), 350);
});
// ── RECETAS: fg-receta.js arma la franja de arriba, el formulario y "Tu obra social" (envío: fg-receta-tienda.js) ──
// "Ver productos" en un descuento de la obra social filtra el catálogo por esa categoría
document.addEventListener('fg:categoria', e => { if (CATEGORIES[e.detail]) setCategory(e.detail); });

// Los formularios de la tienda recargan la página: lo que hay que mostrar al volver queda en la sesión
const pending = {
    get() { try { return JSON.parse(sessionStorage.getItem('fg-pending')); } catch { return null; } },
    set(v) { try { sessionStorage.setItem('fg-pending', JSON.stringify(v)); } catch {} },
    clear() { try { sessionStorage.removeItem('fg-pending'); } catch {} },
};
const code = prefix => prefix + '-' + String(Math.floor(Math.random() * 1e6)).padStart(6, '0');
const sending = (form, text) => { const b = form.querySelector('[type="submit"]'); b.disabled = true; b.lastChild.textContent = text; };

// ── BOTÓN DE ARREPENTIMIENTO (Res. 424/2020) ──
const regretDialog = document.getElementById('regret-dialog');
const regretForm = document.getElementById('regret-form');
const regretDone = document.getElementById('regret-done');
function openRegret() {
    const orders = FGShop.orders.list().filter(o => !o.cancelled);
    document.getElementById('regret-orders').innerHTML = orders.map(o => `<option value="${o.id}">${new Date(o.date).toLocaleDateString('es-AR')} · ${fmt(o.total)}</option>`).join('');
    const order = document.getElementById('regret-order'), email = document.getElementById('regret-email');
    if (orders.length && !order.value) order.value = orders[0].id;
    if (orders.length && !email.value) email.value = orders[0].email;
    regretForm.hidden = false; regretDone.hidden = true;
    document.getElementById('regret-err').textContent = '';
    regretDialog.showModal();
}
document.addEventListener('click', e => { if (e.target.closest('[data-regret-open]')) { e.preventDefault(); openRegret(); } });
regretDialog.addEventListener('click', e => { if (e.target === regretDialog || e.target.closest('[data-close]')) regretDialog.close(); });
regretForm.noValidate = true;
regretForm.addEventListener('submit', e => {
    e.preventDefault();
    const order = document.getElementById('regret-order'), email = document.getElementById('regret-email');
    const id = order.value.trim().replace(/^(\d+)$/, '#$1');
    const errs = [];
    [order, email].forEach(el => el.removeAttribute('aria-invalid'));
    if (id.replace(/\W/g, '').length < 3) errs.push([order, 'Ingresá el número de pedido, por ejemplo #1001.']);
    if (!email.value.trim() || !email.checkValidity()) errs.push([email, 'Ingresá el email que usaste en la compra.']);
    if (errs.length) {
        errs.forEach(([el]) => el.setAttribute('aria-invalid', 'true'));
        document.getElementById('regret-err').textContent = errs.map(x => x[1]).join(' ');
        errs[0][0].focus();
        return;
    }
    order.value = id;
    const r = { kind: 'regret', code: code('ARR'), order: id, email: email.value.trim() };
    document.getElementById('regret-code-field').value = r.code;
    pending.set(r);
    sending(regretForm, 'Enviando tu solicitud…');
    regretForm.submit();
});

function showRegretDone(r) {
    document.getElementById('regret-code').textContent = r.code;
    document.getElementById('regret-done-text').textContent = `Te escribimos a ${r.email} dentro de las 24 h para confirmar la cancelación de ${r.order}. Si ya lo recibiste, coordinamos el retiro sin costo.`;
    regretForm.hidden = true; regretDone.hidden = false;
    regretDialog.showModal();
    regretDone.focus();
}

// Vuelta de un formulario de la tienda: confirmación o errores
(() => {
    const r = pending.get();
    if (!r) return;
    if (new URLSearchParams(location.search).get('contact_posted') === 'true') {
        pending.clear();
        if (r.kind === 'regret') showRegretDone(r);
        return;
    }
    const errors = document.querySelector(`[data-form-errors="${r.kind}"]`);
    if (!errors) return;
    pending.clear();
    if (r.kind === 'regret') { openRegret(); document.getElementById('regret-err').textContent = errors.textContent.trim(); }
})();

// ── VOLVER ARRIBA ──
const toTop = document.getElementById('to-top');
window.addEventListener('scroll', () => toTop.classList.toggle('show', window.scrollY > 1200), { passive: true });
toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
    document.querySelector('.brand-logo').focus({ preventScroll: true });
});

// La portada arranca con la farmacia más cercana (o la recomendada)
heroIndex = Math.max(0, PHARMACIES.findIndex(f => f.id === storeDefault()));
renderAddress();
heroStart();
fromHash();
// Enlace directo a un producto: /#producto-4
const productFromHash = () => { const m = location.hash.match(/^#producto-(\d+)$/); if (m && byId.has(Number(m[1]))) openProduct(Number(m[1])); };
window.addEventListener('hashchange', productFromHash);
productFromHash();

// ── NEWSLETTER con validación ──
const nlForm = document.getElementById('newsletter-form');
const nlInput = document.getElementById('newsletter-email');
const nlMsg = document.getElementById('newsletter-msg');
nlForm.noValidate = true;
nlForm.addEventListener('submit', e => {
    if (!nlInput.value.trim() || !nlInput.checkValidity()) {
        e.preventDefault();
        nlMsg.textContent = 'Ingresá un email válido, por ejemplo nombre@correo.com.';
        nlMsg.className = 'newsletter-msg error';
        nlInput.setAttribute('aria-invalid', 'true');
        nlInput.focus();
        return;
    }
    nlInput.removeAttribute('aria-invalid');
    nlMsg.textContent = 'Suscribiéndote…';
    nlMsg.className = 'newsletter-msg';
});
// Al volver del alta, el mensaje queda a la vista
if (nlMsg.textContent.trim()) nlForm.scrollIntoView({ block: 'center' });
    