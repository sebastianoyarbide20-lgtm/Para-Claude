// FarmaGlass · capa de compra compartida por la web principal y las páginas de cada farmacia (prototipo).
// Carrito, checkout, pedidos, favoritos, cupones, recetas y "Mi cuenta". No hay backend: todo se guarda
// en el localStorage del navegador y ningún pago es real.
//
// Uso desde cada página:
//   FGShop.register([{ id, name, size, price, list, img, store }])   productos que se pueden agregar
//   <button data-add="12">            agrega al carrito        <button data-fav="12">   favorito
//   <button data-cart-open>           abre el carrito          <button data-account-open="favs">   Mi cuenta
//   <span data-cart-count hidden>     contador del carrito     <span data-fav-count hidden>        favoritos
// Colores: cada página puede redefinir --fgs-accent, --fgs-accent-2, --fgs-sale, --fgs-display, --fgs-toast-bottom.
window.FGShop = (() => {
    const FREE_FROM = 15000, SHIP_COST = 1990, MAX_QTY = 10, HOME = 'farmacia_v2.html';
    const K = { cart: 'fg-cart', coupon: 'fg-coupon', orders: 'fg-orders', favs: 'fg-favs', rx: 'fg-recetas', address: 'fg-address', contact: 'fg-contact' };
    const ZONES = ['Palermo', 'Belgrano', 'Caballito', 'Recoleta', 'Almagro', 'Villa Urquiza', 'San Isidro', 'Vicente López', 'Avellaneda'];

    const db = {
        get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    };
    try { localStorage.removeItem('fg-cart-units'); } catch {} // contador de la versión anterior

    const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
    const fmt = n => money.format(Math.round(n));
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    const hhmm = t => new Date(t).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateText = t => new Date(t).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
    const rand = n => String(Math.floor(Math.random() * 10 ** n)).padStart(n, '0');

    // ── FARMACIAS: horario real para saber si están abiertas ──
    const PHARM = {
        centro: { name: 'Farmacia del Centro', street: 'Av. Callao 1450, Recoleta', days: [1, 2, 3, 4, 5, 6], from: 8, to: 21 },
        plaza: { name: 'Farmacia Plaza Palermo', street: 'Av. Santa Fe 3720, Palermo', allDay: true },
        norte: { name: 'Farmacia Belgrano Norte', street: 'Av. Cabildo 2300, Belgrano', days: [0, 1, 2, 3, 4, 5, 6], from: 7, to: 23 },
        parque: { name: 'Farmacia Parque Caballito', street: 'Av. Rivadavia 5200, Caballito', days: [1, 2, 3, 4, 5, 6], from: 8, to: 22 },
    };
    const DAY = ['el domingo', 'el lunes', 'el martes', 'el miércoles', 'el jueves', 'el viernes', 'el sábado'];
    function openStatus(id, now = new Date()) {
        const p = PHARM[id];
        if (!p) return null;
        if (p.allDay) return { open: true, short: 'Abierta 24 h', text: 'Abierta las 24 h' };
        const h = now.getHours() + now.getMinutes() / 60, day = now.getDay();
        if (p.days.includes(day) && h >= p.from && h < p.to) return { open: true, short: 'Abierta', text: `Abierta · cierra a las ${p.to} h` };
        for (let i = 0; i < 8; i++) {
            const d = (day + i) % 7;
            if (!p.days.includes(d) || (i === 0 && h >= p.from)) continue;
            return { open: false, short: 'Cerrada', text: `Cerrada · abre ${i === 0 ? 'hoy' : i === 1 ? 'mañana' : DAY[d]} a las ${p.from} h` };
        }
        return { open: false, short: 'Cerrada', text: 'Cerrada' };
    }

    // ── PRODUCTOS QUE CADA PÁGINA REGISTRA ──
    const REG = new Map();
    const snap = i => ({ id: Number(i.id), name: String(i.name), size: i.size || '', price: Number(i.price), list: Number(i.list || i.price), img: i.img || '', store: i.store || '' });
    function register(items) { items.forEach(i => REG.set(Number(i.id), snap(i))); paint(); }

    const subs = new Set();
    const on = fn => { subs.add(fn); return () => subs.delete(fn); };
    function changed() {
        paint();
        if (sheet && sheet.open) view === 'checkout' ? refreshCheckout() : render();
        subs.forEach(fn => fn());
    }

    // ── CARRITO ──
    let lines = db.get(K.cart, []).filter(l => l && Number(l.qty) > 0);
    let bump = false;
    const saveCart = () => { db.set(K.cart, lines); changed(); };
    const lineOf = id => lines.find(l => l.id === Number(id));
    const cart = {
        lines: () => lines.map(l => ({ ...l })),
        count: () => lines.reduce((n, l) => n + l.qty, 0),
        add(item, qty = 1) {
            const s = snap(item), l = lineOf(s.id);
            if (l && l.qty >= MAX_QTY) return false;
            if (l) l.qty = Math.min(MAX_QTY, l.qty + qty); else lines.push({ ...s, qty: Math.min(MAX_QTY, qty) });
            bump = true; saveCart();
            return true;
        },
        setQty(id, q) {
            const l = lineOf(id);
            if (!l) return;
            if (q <= 0) { cart.remove(id); return; }
            l.qty = Math.min(MAX_QTY, q); saveCart();
        },
        remove(id) {
            const i = lines.findIndex(l => l.id === Number(id));
            if (i < 0) return null;
            const [line] = lines.splice(i, 1);
            saveCart();
            return { line, index: i };
        },
        restore(r) {
            if (!r || lineOf(r.line.id)) return;
            lines.splice(Math.min(r.index, lines.length), 0, r.line);
            saveCart();
        },
        clear() { lines = []; saveCart(); },
    };

    // ── CUPONES ──
    const COUPONS = {
        NUEVO20: { pct: 20, label: '20 % off en tu primera compra', firstOnly: true },
        FARMA10: { pct: 10, label: '10 % off en toda la compra' },
    };
    let couponCode = db.get(K.coupon, null), couponMsg = '', couponDraft = '';
    const activeCoupon = () => {
        const c = COUPONS[couponCode];
        return c && !(c.firstOnly && orders.list().length) ? { code: couponCode, ...c } : null;
    };
    const coupon = {
        active: activeCoupon,
        apply(raw) {
            const code = String(raw || '').trim().toUpperCase();
            const c = COUPONS[code];
            let res;
            if (!code) res = { ok: false, msg: 'Ingresá el código de tu cupón.' };
            else if (!c) res = { ok: false, msg: `El código ${code} no existe o ya venció.` };
            else if (c.firstOnly && orders.list().length) res = { ok: false, msg: `${code} es solo para tu primera compra.` };
            else { couponCode = code; db.set(K.coupon, code); res = { ok: true, msg: `Cupón ${code} aplicado: ${c.label}.` }; }
            couponMsg = res.ok ? '' : res.msg;
            couponDraft = res.ok ? '' : code;
            changed();
            return res;
        },
        remove() { couponCode = null; couponMsg = ''; db.set(K.coupon, null); changed(); },
    };

    function totals(mode = 'envio') {
        const sub = lines.reduce((s, l) => s + l.price * l.qty, 0);
        const list = lines.reduce((s, l) => s + l.list * l.qty, 0);
        const c = activeCoupon();
        const couponOff = c ? Math.round(sub * c.pct / 100) : 0;
        const ship = mode === 'retiro' || !sub || sub >= FREE_FROM ? 0 : SHIP_COST;
        return { sub, savings: list - sub, coupon: c, couponOff, ship, total: sub - couponOff + ship, missing: Math.max(0, FREE_FROM - sub) };
    }

    // ── PEDIDOS ──
    const orders = {
        list: () => db.get(K.orders, []),
        get: id => orders.list().find(o => o.id === String(id).trim().toUpperCase()),
        cancel(id) {
            const all = orders.list(), o = all.find(x => x.id === String(id).trim().toUpperCase());
            if (!o || o.cancelled) return false;
            o.cancelled = Date.now();
            db.set(K.orders, all); changed();
            return true;
        },
    };
    // Prototipo: el estado avanza con el tiempo que pasó desde la compra.
    function trackOf(o, now = Date.now()) {
        if (o.cancelled) return { steps: [], index: -1, label: 'Cancelado', k: 'off' };
        const steps = o.mode === 'retiro' ? ['Recibido', 'Preparando', 'Listo para retirar'] : ['Recibido', 'Preparando', 'En camino', 'Entregado'];
        const at = o.mode === 'retiro' ? [0, 2, 20] : [0, 2, 15, 110];
        const min = (now - o.date) / 60000;
        const index = at.reduce((i, t, k) => (min >= t ? k : i), 0);
        return { steps, index, label: steps[index], k: index === steps.length - 1 ? 'ok' : 'wait' };
    }

    // ── FAVORITOS ──
    let favs = db.get(K.favs, []);
    const saveFavs = () => { db.set(K.favs, favs); changed(); };
    const fav = {
        list: () => favs.map(f => ({ ...f })),
        count: () => favs.length,
        has: id => favs.some(f => f.id === Number(id)),
        toggle(item) {
            const s = snap(item), i = favs.findIndex(f => f.id === s.id);
            if (i >= 0) favs.splice(i, 1); else favs.unshift(s);
            saveFavs();
            return i < 0;
        },
        remove(id) { favs = favs.filter(f => f.id !== Number(id)); saveFavs(); },
    };

    // ── RECETAS (la web principal las carga; acá solo se listan) ──
    const rx = {
        list: () => db.get(K.rx, []),
        add(r) {
            const rec = { id: 'RX-' + rand(5), date: Date.now(), ...r };
            const all = rx.list(); all.unshift(rec); db.set(K.rx, all); changed();
            return rec;
        },
    };
    const rxStatus = (r, now = Date.now()) => (now - r.date) / 60000 < 3
        ? { label: 'En revisión', k: 'wait' } : { label: 'Aprobada · lista para comprar', k: 'ok' };

    // ── PINTADO DE CONTADORES Y BOTONES ──
    function paint() {
        const n = cart.count();
        document.querySelectorAll('[data-cart-count]').forEach(b => {
            b.textContent = n; b.hidden = n === 0;
            if (bump) { b.classList.remove('fgs-bump'); void b.offsetWidth; b.classList.add('fgs-bump'); }
        });
        bump = false;
        document.querySelectorAll('[data-cart-open][aria-label]').forEach(b => b.setAttribute('aria-label', `Carrito, ${plural(n, 'producto', 'productos')}`));
        document.querySelectorAll('[data-fav-count]').forEach(b => { b.textContent = favs.length; b.hidden = favs.length === 0; });
        document.querySelectorAll('[data-fav]').forEach(b => {
            const id = Number(b.dataset.fav), is = fav.has(id), name = REG.get(id)?.name || 'este producto';
            b.setAttribute('aria-pressed', String(is));
            b.setAttribute('aria-label', is ? `Quitar ${name} de favoritos` : `Guardar ${name} en favoritos`);
        });
    }

    // ── AVISOS (toast con acción opcional) ──
    let toastEl, toastTimer;
    function hideToast() { if (toastEl) toastEl.classList.remove('show'); }
    function toast(msg, opts = {}) {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.className = 'fgs-toast';
            toastEl.setAttribute('role', 'status');
            toastEl.setAttribute('aria-live', 'polite');
        }
        // Dentro de un <dialog> abierto, para que no quede debajo del fondo oscuro
        const host = [...document.querySelectorAll('dialog[open]')].pop() || document.body;
        if (toastEl.parentNode !== host) host.appendChild(toastEl);
        toastEl.classList.add('show');
        toastEl.classList.toggle('has-action', !!opts.action);
        toastEl.innerHTML = `<span>${esc(msg)}</span>${opts.action ? `<button type="button">${esc(opts.action)}</button>` : ''}`;
        if (opts.action) toastEl.querySelector('button').addEventListener('click', () => { hideToast(); opts.onAction(); });
        clearTimeout(toastTimer);
        toastTimer = setTimeout(hideToast, opts.action ? 5000 : 2800);
    }

    // ── ÍCONOS PROPIOS (no depende del sprite de cada página) ──
    const I = {
        x: '<path d="M18 6 6 18M6 6l12 12"/>',
        back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
        arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
        trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
        minus: '<path d="M5 12h14"/>',
        plus: '<path d="M12 5v14M5 12h14"/>',
        check: '<path d="m5 12 5 5L20 7"/>',
        cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2.5 3h2.2l2.6 12.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.5L21.5 8H6"/>',
        truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/>',
        store: '<path d="M4 10v10h16V10"/><path d="M3 5h18l-1.5 5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0z"/><path d="M10 20v-5h4v5"/>',
        heart: '<path d="M12 20s-7.5-4.6-9.2-9.4C1.6 7.2 3.8 4 7.1 4c2 0 3.6 1.1 4.9 2.8C13.3 5.1 14.9 4 16.9 4c3.3 0 5.5 3.2 4.3 6.6C19.5 15.4 12 20 12 20z"/>',
        tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
        card: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
        wallet: '<path d="M4 7h15a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M4 7l11-3v3M16 13.5h.01"/>',
        cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9.5v5M18 9.5v5"/>',
        lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
        repeat: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
        doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h4"/>',
        bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    };
    const ico = (n, cls = '') => `<svg class="fgs-i ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${I[n]}</svg>`;
    const thumb = (img, size = 64) => `<span class="fgs-thumb"><img src="${esc(img)}" alt="" width="${size}" height="${size}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()"></span>`;
    // En la web principal los enlaces van a su sección; en las páginas de farmacia, a la web principal
    const here = (hash, fallback) => document.getElementById(hash) ? `#${hash}` : fallback;
    const empty = (icon, title, text, cta, href) => `<div class="fgs-empty"><span class="fgs-empty-ico">${ico(icon)}</span><p class="fgs-empty-t">${title}</p><p>${text}</p>${cta ? (href
        ? `<a class="fgs-cta" href="${href}" data-fgs-close>${cta}</a>`
        : `<button type="button" class="fgs-cta" data-fgs-close>${cta}</button>`) : ''}</div>`;

    // ── HOJA LATERAL: carrito, checkout, confirmación y Mi cuenta ──
    let sheet, view = 'cart', tab = 'orders', lastOrder = null, homeStore = null, coMode = 'envio', coStore = null;
    const TITLES = { cart: 'Tu carrito', checkout: 'Finalizar compra', done: 'Pedido confirmado', account: 'Mi cuenta' };

    function ensureSheet() {
        if (sheet) return;
        sheet = document.createElement('dialog');
        sheet.className = 'fgs-sheet';
        sheet.setAttribute('aria-labelledby', 'fgs-title');
        sheet.innerHTML = `<div class="fgs-head">
                <button type="button" class="fgs-iconbtn" data-fgs-back hidden aria-label="Volver al carrito">${ico('back')}</button>
                <h2 class="fgs-title" id="fgs-title" tabindex="-1"></h2>
                <button type="button" class="fgs-iconbtn" data-fgs-close aria-label="Cerrar">${ico('x')}</button>
                <p class="fgs-sr" aria-live="polite" id="fgs-live"></p>
            </div><div class="fgs-body"></div><div class="fgs-foot"></div>`;
        document.body.appendChild(sheet);
        sheet.addEventListener('click', onSheetClick);
        sheet.addEventListener('submit', onSheetSubmit);
        sheet.addEventListener('change', onSheetChange);
        sheet.addEventListener('keydown', onSheetKey);
        sheet.addEventListener('close', () => { if (view === 'done') view = 'cart'; });
    }
    const live = msg => { const el = sheet.querySelector('#fgs-live'); el.textContent = ''; setTimeout(() => { el.textContent = msg; }, 30); };
    const focusTitle = () => sheet.querySelector('.fgs-title').focus();

    function open(v = 'cart', opts = {}) {
        ensureSheet();
        view = v;
        if (opts.tab) tab = opts.tab;
        if (v === 'checkout' && !lines.length) view = 'cart';
        render();
        if (!sheet.open) sheet.showModal();
        focusTitle();
    }
    function close() { if (sheet && sheet.open) sheet.close(); }
    function go(v) { view = v; render(); focusTitle(); sheet.querySelector('.fgs-body').scrollTop = 0; }

    function render() {
        const active = document.activeElement;
        const fk = active && sheet.contains(active) ? active.dataset.fk : null;
        if (view === 'checkout' && !lines.length) view = 'cart';
        if (view === 'done' && !orders.get(lastOrder)) view = 'cart';
        const n = cart.count();
        sheet.dataset.view = view;
        sheet.querySelector('.fgs-title').textContent = TITLES[view] + (view === 'cart' && n ? ` (${n})` : '');
        sheet.querySelector('[data-fgs-back]').hidden = view !== 'checkout';
        const [body, foot] = { cart: viewCart, checkout: viewCheckout, done: viewDone, account: viewAccount }[view]();
        sheet.querySelector('.fgs-body').innerHTML = body;
        const footEl = sheet.querySelector('.fgs-foot');
        footEl.innerHTML = foot; footEl.hidden = !foot;
        if (view === 'checkout') syncCheckout();
        if (fk) (sheet.querySelector(`[data-fk="${fk}"]:not([disabled])`) || sheet.querySelector('.fgs-title')).focus();
    }

    // Carrito
    function lineHTML(l) {
        const off = l.list > l.price;
        return `<li class="fgs-line">
            ${thumb(l.img)}
            <div class="fgs-line-info">
                <p class="fgs-line-name">${esc(l.name)}${l.size ? ` <span>· ${esc(l.size)}</span>` : ''}</p>
                <p class="fgs-line-price"><b class="${off ? 'sale' : ''}">${fmt(l.price * l.qty)}</b>${off ? `<s><span class="fgs-sr">Antes </span>${fmt(l.list * l.qty)}</s>` : ''}${l.qty > 1 ? `<small>${fmt(l.price)} c/u</small>` : ''}</p>
                <div class="fgs-line-ctrl">
                    <div class="fgs-step" role="group" aria-label="Cantidad de ${esc(l.name)}">
                        <button type="button" data-fgs-dec="${l.id}" data-fk="dec-${l.id}" aria-label="${l.qty === 1 ? `Eliminar ${esc(l.name)}` : 'Quitar uno'}">${ico(l.qty === 1 ? 'trash' : 'minus')}</button>
                        <output>${l.qty}</output>
                        <button type="button" data-fgs-inc="${l.id}" data-fk="inc-${l.id}" aria-label="Agregar uno"${l.qty >= MAX_QTY ? ' aria-disabled="true"' : ''}>${ico('plus')}</button>
                    </div>
                    <button type="button" class="fgs-link fgs-save" data-fgs-save="${l.id}" data-fk="save-${l.id}" aria-label="Guardar ${esc(l.name)} para después">${ico('heart')}Para después</button>
                </div>
            </div>
        </li>`;
    }
    function upsellHTML(t) {
        if (!t.missing || !REG.size) return '';
        const inCart = new Set(lines.map(l => l.id));
        const pool = [...REG.values()].filter(p => !inCart.has(p.id));
        const cover = pool.filter(p => p.price >= t.missing).sort((a, b) => a.price - b.price);
        const picks = (cover.length ? cover : pool.sort((a, b) => b.price - a.price)).slice(0, 3);
        if (!picks.length) return '';
        return `<section class="fgs-upsell" aria-labelledby="fgs-up-t"><h3 id="fgs-up-t">${cover.length ? 'Sumá uno y llegá al envío gratis' : 'Te puede interesar'}</h3><ul>${picks.map(p => `<li>
            ${thumb(p.img, 48)}<div><p>${esc(p.name)}</p><b>${fmt(p.price)}</b></div>
            <button type="button" class="fgs-add" data-fgs-add="${p.id}" data-fk="up-${p.id}" aria-label="Agregar ${esc(p.name)} al carrito">${ico('plus')}</button></li>`).join('')}</ul></section>`;
    }
    function couponHTML(t) {
        if (t.coupon) return `<p class="fgs-coupon-on">${ico('tag')}<span><b>${esc(t.coupon.code)}</b> · ${esc(t.coupon.label)}</span><button type="button" class="fgs-link" data-fgs-coupon-rm data-fk="coupon-rm">Quitar</button></p>`;
        return `<details class="fgs-coupon"${couponMsg ? ' open' : ''}>
            <summary data-fk="coupon-sum">${ico('tag')}¿Tenés un cupón de descuento?</summary>
            <form class="fgs-coupon-form" data-fgs-form="coupon" novalidate>
                <label class="fgs-sr" for="fgs-coupon">Código del cupón</label>
                <input id="fgs-coupon" name="code" data-fk="coupon-in" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Ej.: NUEVO20" value="${esc(couponDraft)}"${couponMsg ? ' aria-invalid="true" aria-describedby="fgs-coupon-msg"' : ''}>
                <button type="submit" data-fk="coupon-apply">Aplicar</button>
            </form>
            ${couponMsg ? `<p class="fgs-err" id="fgs-coupon-msg">${esc(couponMsg)}</p>` : ''}
        </details>`;
    }
    function sumHTML(t, mode) {
        return `<dl class="fgs-sum">
            <div><dt>Productos (${cart.count()})</dt><dd>${fmt(t.sub)}</dd></div>
            ${t.couponOff ? `<div class="fgs-ok"><dt>Cupón ${esc(t.coupon.code)}</dt><dd>−${fmt(t.couponOff)}</dd></div>` : ''}
            <div><dt>${mode === 'retiro' ? 'Retiro en farmacia' : 'Envío'}</dt><dd>${t.ship ? fmt(t.ship) : '<span class="fgs-ok">Gratis</span>'}</dd></div>
            <div class="fgs-total"><dt>Total</dt><dd>${fmt(t.total)}</dd></div>
        </dl>
        <div class="fgs-meta-row">${t.savings + t.couponOff > 0 ? `<span class="fgs-saving">${ico('tag')}Ahorrás ${fmt(t.savings + t.couponOff)}</span>` : '<span></span>'}<span>o 3 cuotas sin interés de ${fmt(t.total / 3)}</span></div>`;
    }
    function viewCart() {
        if (!lines.length) return [empty('cart', 'Tu carrito está vacío', 'Sumá productos de cualquier farmacia de la red: los agrupamos por farmacia y los recibís juntos.', 'Ver productos', here('catalogo', null)), ''];
        const t = totals();
        const pct = Math.min(100, Math.round(t.sub / FREE_FROM * 100));
        const groups = new Map();
        lines.forEach(l => { const k = PHARM[l.store] ? l.store : ''; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(l); });
        const ship = `<div class="fgs-ship${t.missing ? '' : ' is-free'}">
            <p>${t.missing ? `${ico('truck')}<span>Te faltan <b>${fmt(t.missing)}</b> para el envío gratis</span>` : `${ico('check')}<b>¡Tu pedido tiene envío gratis!</b>`}</p>
            <div class="fgs-bar" role="progressbar" aria-label="Avance hacia el envío gratis" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div>
        </div>`;
        const body = ship + [...groups].map(([id, ls]) => {
            const st = openStatus(id);
            return `<section class="fgs-group" aria-label="${id ? `Productos de ${esc(PHARM[id].name)}` : 'Productos'}">
                <h3 class="fgs-group-h">${ico('store')}<span>${id ? `Despacha ${esc(PHARM[id].name)}` : 'FarmaGlass'}</span>${st ? `<span class="fgs-dot${st.open ? ' on' : ''}">${st.short}</span>` : ''}</h3>
                <ul class="fgs-lines">${ls.map(lineHTML).join('')}</ul>
            </section>`;
        }).join('') + upsellHTML(t);
        const foot = couponHTML(t) + sumHTML(t, 'envio') +
            `<button type="button" class="fgs-cta" data-fgs-go="checkout" data-fk="go-checkout">Iniciar compra ${ico('arrow')}</button>`;
        return [body, foot];
    }

    // Checkout
    const field = (name, label, control) => `<div class="fgs-field" data-field="${name}"><label for="fgs-${name}">${label}</label>${control}<p class="fgs-err" id="fgs-err-${name}"></p></div>`;
    const opt = (name, value, cur, icon, title, sub, extra = '') => `<label class="fgs-opt"><input type="radio" name="${name}" value="${value}"${value === cur ? ' checked' : ''}${extra}><span class="fgs-opt-box">${ico(icon)}<span><b>${title}</b><small${name === 'pay' && value === 'credito' ? ' data-cuotas' : ''}>${sub}</small></span></span></label>`;
    function slots() {
        const h = new Date().getHours(), s = ['Lo antes posible (llega en ~2 h)'];
        if (h < 16) s.push('Hoy de 18 a 20 h');
        if (h < 18) s.push('Hoy de 20 a 22 h');
        return s.concat('Mañana de 9 a 12 h', 'Mañana de 14 a 18 h');
    }
    function viewCheckout() {
        const a = db.get(K.address, null) || {}, c = db.get(K.contact, null) || {};
        const street = /\d/.test(a.street || '') ? a.street : '';
        const pick = coStore || homeStore || 'plaza';
        const t = totals(coMode);
        const body = `<form id="fgs-form" class="fgs-form" data-fgs-form="checkout" novalidate>
            <fieldset class="fgs-fs"><legend><span class="fgs-n">1</span>Entrega</legend>
                <div class="fgs-opts">
                    ${opt('mode', 'envio', coMode, 'truck', 'Envío a domicilio', t.sub >= FREE_FROM ? 'Gratis · llega en ~2 h' : `${fmt(SHIP_COST)} · gratis desde ${fmt(FREE_FROM)}`)}
                    ${opt('mode', 'retiro', coMode, 'store', 'Retiro en farmacia', 'Gratis · listo en 30 min')}
                </div>
                <div class="fgs-when" data-when="envio">
                    ${field('street', 'Calle y número', `<input id="fgs-street" name="street" autocomplete="street-address" placeholder="Ej.: Av. Corrientes 1234" value="${esc(street)}">`)}
                    <div class="fgs-row">
                        ${field('zone', 'Barrio o localidad', `<select id="fgs-zone" name="zone" autocomplete="address-level2"><option value="">Elegí una opción</option>${ZONES.map(z => `<option${z === a.zone ? ' selected' : ''}>${z}</option>`).join('')}</select>`)}
                        ${field('floor', 'Piso y depto. <span>(opcional)</span>', '<input id="fgs-floor" name="floor" autocomplete="address-line2" placeholder="Ej.: 3.º B">')}
                    </div>
                    ${field('slot', 'Horario de entrega', `<select id="fgs-slot" name="slot">${slots().map(s => `<option>${s}</option>`).join('')}</select>`)}
                </div>
                <div class="fgs-when" data-when="retiro">
                    <p class="fgs-label" id="fgs-store-l">¿En qué farmacia lo retirás?</p>
                    <div class="fgs-stores" role="radiogroup" aria-labelledby="fgs-store-l">${Object.entries(PHARM).map(([id, p]) => {
                        const st = openStatus(id);
                        return `<label class="fgs-opt"><input type="radio" name="store" value="${id}"${id === pick ? ' checked' : ''}><span class="fgs-opt-box">${ico('store')}<span><b>${esc(p.name)}</b><small>${esc(p.street)}</small><small class="fgs-dot${st.open ? ' on' : ''}">${esc(st.text)}</small></span></span></label>`;
                    }).join('')}</div>
                </div>
            </fieldset>
            <fieldset class="fgs-fs"><legend><span class="fgs-n">2</span>Tus datos</legend>
                ${field('name', 'Nombre y apellido', `<input id="fgs-name" name="name" autocomplete="name" value="${esc(c.name || '')}">`)}
                <div class="fgs-row">
                    ${field('email', 'Email', `<input id="fgs-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="nombre@correo.com" value="${esc(c.email || '')}">`)}
                    ${field('phone', 'Celular', `<input id="fgs-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="11 2345-6789" value="${esc(c.phone || '')}">`)}
                </div>
            </fieldset>
            <fieldset class="fgs-fs"><legend><span class="fgs-n">3</span>Pago</legend>
                <div class="fgs-opts">
                    ${opt('pay', 'credito', 'credito', 'card', 'Tarjeta de crédito', `3 cuotas sin interés de ${fmt(t.total / 3)}`)}
                    ${opt('pay', 'debito', 'credito', 'card', 'Tarjeta de débito', 'En un pago')}
                    ${opt('pay', 'mp', 'credito', 'wallet', 'Mercado Pago', 'Dinero en cuenta o tarjetas guardadas')}
                    ${opt('pay', 'efectivo', 'credito', 'cash', 'Efectivo al retirar', 'Solo con retiro en farmacia')}
                </div>
                <p class="fgs-note">${ico('lock')}Prototipo: no se cobra nada ni se piden datos de tarjeta.</p>
            </fieldset>
            <div class="fgs-field" data-field="terms">
                <label class="fgs-check"><input type="checkbox" name="terms" id="fgs-terms"><span>Acepto los términos y condiciones y la política de privacidad.</span></label>
                <p class="fgs-err" id="fgs-err-terms"></p>
            </div>
        </form>`;
        return [body, checkoutFoot()];
    }
    function checkoutFoot() {
        const t = totals(coMode);
        return sumHTML(t, coMode) + `<button type="submit" form="fgs-form" class="fgs-cta" data-fk="confirm">Confirmar pedido · ${fmt(t.total)}</button>`;
    }
    function refreshCheckout() {
        if (!lines.length) { render(); return; }
        sheet.querySelector('.fgs-foot').innerHTML = checkoutFoot();
        const cuotas = sheet.querySelector('[data-cuotas]');
        if (cuotas) cuotas.textContent = `3 cuotas sin interés de ${fmt(totals(coMode).total / 3)}`;
    }
    function syncCheckout() {
        const f = sheet.querySelector('#fgs-form');
        if (!f) return;
        sheet.querySelectorAll('[data-when]').forEach(el => { el.hidden = el.dataset.when !== coMode; });
        const cash = f.querySelector('input[name="pay"][value="efectivo"]');
        cash.disabled = coMode !== 'retiro';
        if (cash.disabled && cash.checked) f.querySelector('input[name="pay"][value="credito"]').checked = true;
        refreshCheckout();
    }
    function validateCheckout(f) {
        const v = n => (f.elements[n]?.value || '').trim();
        const errs = {};
        if (coMode === 'envio') {
            if (!v('street') || !/\d/.test(v('street'))) errs.street = 'Ingresá la calle y el número, por ejemplo: Av. Corrientes 1234.';
            if (!v('zone')) errs.zone = 'Elegí tu barrio o localidad.';
        }
        if (v('name').length < 3) errs.name = 'Ingresá tu nombre y apellido.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email'))) errs.email = 'Ingresá un email válido, por ejemplo nombre@correo.com.';
        if (v('phone').replace(/\D/g, '').length < 8) errs.phone = 'Ingresá un celular con código de área.';
        if (!f.elements.terms.checked) errs.terms = 'Para continuar tenés que aceptar los términos.';
        ['street', 'zone', 'name', 'email', 'phone', 'terms'].forEach(n => {
            const el = f.elements[n], err = sheet.querySelector('#fgs-err-' + n);
            if (!el || !err) return;
            err.textContent = errs[n] || '';
            if (errs[n]) { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', 'fgs-err-' + n); }
            else { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); }
        });
        const keys = Object.keys(errs);
        if (keys.length) { f.elements[keys[0]].focus(); live(`Revisá ${plural(keys.length, 'dato', 'datos')} del formulario.`); }
        return !keys.length;
    }
    function etaOf(mode, slot, storeId, now) {
        if (mode === 'retiro') {
            const p = PHARM[storeId], st = openStatus(storeId);
            return st.open
                ? { title: `Listo para retirar desde las ${hhmm(now + 30 * 60000)}`, text: `${p.name} · ${p.street}` }
                : { title: 'Lo preparamos para cuando abra', text: `${p.name} · ${st.text}` };
        }
        if (slot.startsWith('Lo antes')) return { title: `Llega entre las ${hhmm(now + 100 * 60000)} y las ${hhmm(now + 130 * 60000)}`, text: 'Te avisamos por email cuando el repartidor salga.' };
        return { title: `Llega ${slot.charAt(0).toLowerCase() + slot.slice(1)}`, text: 'Te avisamos por email cuando el repartidor salga.' };
    }
    function placeOrder(f) {
        const btn = sheet.querySelector('.fgs-foot .fgs-cta');
        btn.disabled = true; btn.textContent = 'Confirmando tu pedido…';
        const v = n => (f.elements[n]?.value || '').trim();
        setTimeout(() => {
            const now = Date.now(), t = totals(coMode);
            const o = {
                id: 'FG-' + rand(6), date: now, mode: coMode,
                lines: lines.map(l => ({ ...l })), count: cart.count(),
                sub: t.sub, coupon: t.coupon ? t.coupon.code : null, couponOff: t.couponOff, ship: t.ship, total: t.total,
                pay: f.elements.pay.value, name: v('name'), email: v('email'), phone: v('phone'),
                address: coMode === 'envio' ? { street: v('street'), floor: v('floor'), zone: v('zone') } : null,
                store: coMode === 'retiro' ? f.elements.store.value : null,
                slot: coMode === 'envio' ? v('slot') : null,
            };
            o.eta = etaOf(o.mode, o.slot || '', o.store, now);
            const all = orders.list(); all.unshift(o); db.set(K.orders, all);
            db.set(K.contact, { name: o.name, email: o.email, phone: o.phone });
            if (o.address) db.set(K.address, { street: o.address.street, zone: o.address.zone });
            lastOrder = o.id; lines = []; db.set(K.cart, lines);
            couponCode = null; db.set(K.coupon, null);
            view = 'done'; changed(); focusTitle();
        }, 700);
    }
    const PAY = { credito: 'Tarjeta de crédito · 3 cuotas sin interés', debito: 'Tarjeta de débito', mp: 'Mercado Pago', efectivo: 'Efectivo al retirar' };
    function trackHTML(o) {
        const tr = trackOf(o);
        return `<ol class="fgs-track" aria-label="Estado del pedido">${tr.steps.map((s, i) => `<li class="${i < tr.index ? 'done' : i === tr.index ? 'now' : ''}"${i === tr.index ? ' aria-current="step"' : ''}><span></span>${s}</li>`).join('')}</ol>`;
    }
    function viewDone() {
        const o = orders.get(lastOrder);
        const body = `<div class="fgs-done">
                <span class="fgs-done-ico">${ico('check')}</span>
                <p class="fgs-done-t">¡Gracias, ${esc(o.name.split(' ')[0])}! Recibimos tu pedido</p>
                <p>Pedido <b>${o.id}</b> · te mandamos el detalle a <b>${esc(o.email)}</b></p>
            </div>
            <div class="fgs-eta">${ico(o.mode === 'retiro' ? 'store' : 'truck')}<div><b>${esc(o.eta.title)}</b><span>${esc(o.eta.text)}</span></div></div>
            ${trackHTML(o)}
            <dl class="fgs-sum">
                <div><dt>Productos (${o.count})</dt><dd>${fmt(o.sub)}</dd></div>
                ${o.couponOff ? `<div class="fgs-ok"><dt>Cupón ${esc(o.coupon)}</dt><dd>−${fmt(o.couponOff)}</dd></div>` : ''}
                <div><dt>${o.mode === 'retiro' ? 'Retiro en farmacia' : 'Envío'}</dt><dd>${o.ship ? fmt(o.ship) : 'Gratis'}</dd></div>
                <div class="fgs-total"><dt>Total</dt><dd>${fmt(o.total)}</dd></div>
                <div><dt>Pago</dt><dd>${PAY[o.pay]}</dd></div>
            </dl>`;
        const foot = `<button type="button" class="fgs-cta" data-fgs-close data-fk="done-close">Seguir comprando</button>
            <button type="button" class="fgs-ghost" data-fgs-go="account" data-tab="orders" data-fk="done-orders">Ver mis pedidos</button>`;
        return [body, foot];
    }

    // Mi cuenta
    function viewAccount() {
        const os = orders.list(), rs = rx.list();
        const tabs = [['orders', 'Pedidos', os.length], ['favs', 'Favoritos', favs.length], ['rx', 'Recetas', rs.length]];
        let content = '';
        if (tab === 'orders') {
            content = os.length ? `<ul class="fgs-orders">${os.map(o => {
                const tr = trackOf(o);
                return `<li class="fgs-order">
                    <div class="fgs-order-top"><b>Pedido ${o.id}</b><span class="fgs-chip ${tr.k}">${tr.label}</span></div>
                    <p class="fgs-order-meta">${dateText(o.date)} · ${plural(o.count, 'producto', 'productos')} · <b>${fmt(o.total)}</b></p>
                    <p class="fgs-order-meta">${o.mode === 'retiro' ? `Retiro en ${esc(PHARM[o.store]?.name || 'farmacia')}` : `Envío a ${esc(o.address.street)}, ${esc(o.address.zone)}`}</p>
                    <div class="fgs-thumbs">${o.lines.slice(0, 5).map(l => thumb(l.img, 44)).join('')}${o.lines.length > 5 ? `<span class="fgs-more">+${o.lines.length - 5}</span>` : ''}</div>
                    ${o.cancelled ? '' : trackHTML(o)}
                    <button type="button" class="fgs-ghost sm" data-fgs-reorder="${o.id}" data-fk="re-${o.id}">${ico('repeat')}Volver a pedir</button>
                </li>`;
            }).join('')}</ul>` : empty('bag', 'Todavía no hiciste pedidos', 'Cuando compres vas a poder seguir el envío desde acá.', 'Ir a comprar', here('catalogo', null));
        } else if (tab === 'favs') {
            content = favs.length ? `<ul class="fgs-lines">${favs.map(f0 => {
                const f = REG.get(f0.id) || f0, off = f.list > f.price;
                return `<li class="fgs-line">${thumb(f.img)}<div class="fgs-line-info">
                    <p class="fgs-line-name">${esc(f.name)}${f.size ? ` <span>· ${esc(f.size)}</span>` : ''}</p>
                    <p class="fgs-line-price"><b class="${off ? 'sale' : ''}">${fmt(f.price)}</b>${off ? `<s><span class="fgs-sr">Antes </span>${fmt(f.list)}</s>` : ''}</p>
                    <div class="fgs-line-ctrl">
                        <button type="button" class="fgs-mini" data-fgs-fav-add="${f.id}" data-fk="fa-${f.id}">${ico('cart')}Agregar</button>
                        <button type="button" class="fgs-link" data-fgs-fav-rm="${f.id}" data-fk="fr-${f.id}" aria-label="Quitar ${esc(f.name)} de favoritos">Quitar</button>
                    </div></div></li>`;
            }).join('')}</ul>${favs.length > 1 ? `<button type="button" class="fgs-ghost" data-fgs-fav-all data-fk="fav-all">${ico('cart')}Agregar todos al carrito</button>` : ''}`
                : empty('heart', 'No guardaste favoritos', 'Tocá el corazón de un producto para tenerlo a mano la próxima vez.', 'Ver productos', here('catalogo', null));
        } else {
            content = rs.length ? `<ul class="fgs-orders">${rs.map(r => {
                const st = rxStatus(r);
                return `<li class="fgs-order">
                    <div class="fgs-order-top"><b>Receta ${esc(r.id)}</b><span class="fgs-chip ${st.k}">${st.label}</span></div>
                    <p class="fgs-order-meta">${dateText(r.date)} · ${plural(r.files.length, 'archivo', 'archivos')} · ${esc(r.os)}</p>
                    <p class="fgs-order-meta">La prepara ${esc(PHARM[r.store]?.name || 'la farmacia')}</p>
                </li>`;
            }).join('')}</ul><a class="fgs-ghost" href="${here('receta', `${HOME}#receta`)}" data-fgs-close>${ico('doc')}Subir otra receta</a>`
                : empty('doc', 'No subiste recetas', 'Subí la foto de tu receta: un farmacéutico la revisa y te confirma precio y cobertura.', 'Subir una receta', here('receta', `${HOME}#receta`));
        }
        const body = `<p class="fgs-note">${ico('lock')}Prototipo: tus pedidos, favoritos y recetas se guardan solo en este navegador.</p>
            <div class="fgs-tabs" role="tablist" aria-label="Secciones de tu cuenta">${tabs.map(([id, label, n]) =>
                `<button type="button" role="tab" id="fgs-tab-${id}" aria-selected="${tab === id}" aria-controls="fgs-panel" tabindex="${tab === id ? 0 : -1}" data-fgs-tab="${id}" data-fk="tab-${id}">${label}${n ? `<span>${n}</span>` : ''}</button>`).join('')}</div>
            <div class="fgs-panel" id="fgs-panel" role="tabpanel" aria-labelledby="fgs-tab-${tab}">${content}</div>`;
        return [body, ''];
    }

    // ── EVENTOS DE LA HOJA ──
    function removeWithUndo(id) {
        const r = cart.remove(id);
        if (r) toast(`Quitaste ${r.line.name}`, { action: 'Deshacer', onAction: () => cart.restore(r) });
    }
    function onSheetClick(e) {
        if (e.target === sheet) { close(); return; }
        const b = e.target.closest('button, a');
        if (!b || !sheet.contains(b)) return;
        const d = b.dataset;
        if ('fgsClose' in d) { close(); return; }
        if ('fgsBack' in d) { go('cart'); return; }
        if (d.fgsGo) { if (d.tab) tab = d.tab; go(d.fgsGo); return; }
        if (d.fgsTab) { tab = d.fgsTab; render(); sheet.querySelector(`#fgs-tab-${tab}`).focus(); return; }
        if (b.getAttribute('aria-disabled') === 'true') { live(`Podés llevar hasta ${MAX_QTY} unidades de cada producto.`); return; }
        if (d.fgsInc) { const l = lineOf(d.fgsInc); cart.setQty(l.id, l.qty + 1); live(`${l.name}: ${plural(l.qty, 'unidad', 'unidades')}`); return; }
        if (d.fgsDec) {
            const l = lineOf(d.fgsDec);
            if (l.qty === 1) removeWithUndo(l.id); else { cart.setQty(l.id, l.qty - 1); live(`${l.name}: ${plural(l.qty, 'unidad', 'unidades')}`); }
            return;
        }
        if (d.fgsSave) {
            const l = lineOf(d.fgsSave);
            if (!fav.has(l.id)) fav.toggle(l);
            cart.remove(l.id);
            toast(`Guardamos ${l.name} en tus favoritos`, { action: 'Ver', onAction: () => open('account', { tab: 'favs' }) });
            return;
        }
        if (d.fgsAdd) { const p = REG.get(Number(d.fgsAdd)); if (p && cart.add(p)) live(`${p.name} agregado al carrito`); return; }
        if ('fgsCouponRm' in d) { coupon.remove(); live('Quitaste el cupón'); return; }
        if (d.fgsReorder) {
            const o = orders.get(d.fgsReorder);
            o.lines.forEach(l => cart.add(REG.get(l.id) || l, l.qty));
            toast(`Sumamos ${plural(o.count, 'producto', 'productos')} de tu pedido ${o.id}`);
            go('cart');
            return;
        }
        if (d.fgsFavAdd) {
            const f = REG.get(Number(d.fgsFavAdd)) || favs.find(x => x.id === Number(d.fgsFavAdd));
            toast(cart.add(f) ? `${f.name} agregado al carrito` : `Ya tenés ${MAX_QTY} unidades de ${f.name}`, { action: 'Ver carrito', onAction: () => go('cart') });
            return;
        }
        if (d.fgsFavRm) { fav.remove(d.fgsFavRm); live('Quitado de favoritos'); return; }
        if ('fgsFavAll' in d) { favs.forEach(f => cart.add(REG.get(f.id) || f)); go('cart'); }
    }
    function onSheetSubmit(e) {
        e.preventDefault();
        const f = e.target;
        if (f.dataset.fgsForm === 'coupon') {
            const res = coupon.apply(f.elements.code.value);
            if (res.ok) { live(res.msg); toast(res.msg); }
            else sheet.querySelector('#fgs-coupon')?.focus();
        }
        if (f.dataset.fgsForm === 'checkout' && validateCheckout(f)) placeOrder(f);
    }
    function onSheetChange(e) {
        const t = e.target;
        if (t.name === 'mode') { coMode = t.value; syncCheckout(); }
        if (t.name === 'store') coStore = t.value;
        if (t.getAttribute('aria-invalid') === 'true' && (t.type === 'checkbox' ? t.checked : t.value.trim())) {
            t.removeAttribute('aria-invalid');
            const err = sheet.querySelector('#fgs-err-' + t.name);
            if (err) err.textContent = '';
        }
    }
    function onSheetKey(e) {
        const t = e.target.closest('[role="tab"]');
        if (!t || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        const ids = ['orders', 'favs', 'rx'], i = ids.indexOf(tab);
        tab = e.key === 'Home' ? ids[0] : e.key === 'End' ? ids[2] : ids[(i + (e.key === 'ArrowRight' ? 1 : 2)) % 3];
        render();
        sheet.querySelector(`#fgs-tab-${tab}`).focus();
    }

    // ── CLICS EN CUALQUIER PÁGINA ──
    document.addEventListener('click', e => {
        const t = e.target.closest('[data-cart-open], [data-account-open], [data-add], [data-fav]');
        if (!t || (sheet && sheet.contains(t))) return;
        if (t.matches('[data-cart-open]')) { e.preventDefault(); open('cart'); return; }
        if (t.matches('[data-account-open]')) { e.preventDefault(); open('account', { tab: t.dataset.accountOpen || 'orders' }); return; }
        if (t.matches('[data-add]')) {
            const p = REG.get(Number(t.dataset.add));
            if (!p) return;
            const q = Number(t.dataset.qty) || 1;
            if (cart.add(p, q)) toast(`${q > 1 ? q + ' × ' : ''}${p.name} agregado al carrito`, { action: 'Ver carrito', onAction: () => open('cart') });
            else toast(`Podés llevar hasta ${MAX_QTY} unidades de ${p.name}`);
            return;
        }
        e.preventDefault();
        const p = REG.get(Number(t.dataset.fav));
        if (!p) return;
        const added = fav.toggle(p);
        toast(added ? `Guardaste ${p.name} en favoritos` : `Quitaste ${p.name} de favoritos`,
            added ? { action: 'Ver favoritos', onAction: () => open('account', { tab: 'favs' }) } : {});
    });

    // Otra pestaña cambió el carrito, los favoritos o los pedidos
    window.addEventListener('storage', e => {
        if (e.key === K.cart) lines = db.get(K.cart, []);
        else if (e.key === K.favs) favs = db.get(K.favs, []);
        else if (e.key === K.coupon) couponCode = db.get(K.coupon, null);
        else if (e.key !== K.orders && e.key !== K.rx) return;
        changed();
    });

    // #carrito y #cuenta abren la hoja (sirve para enlaces desde otras páginas)
    function fromHash() {
        if (location.hash === '#carrito') open('cart');
        if (location.hash === '#cuenta') open('account', { tab: 'orders' });
    }
    window.addEventListener('hashchange', fromHash);

    // ── ESTILOS (con tokens que cada página puede redefinir) ──
    const css = `
    :where(html) {
        --fgs-accent: #0A3D2E; --fgs-accent-2: #0B5D45; --fgs-on-accent: #fff;
        --fgs-ink: #10261F; --fgs-muted: #4A5C55; --fgs-bg: #fff; --fgs-soft: #F3F5EF; --fgs-line: #E3E6DD;
        --fgs-sale: #C4302B; --fgs-ok: #0B6B4F; --fgs-ok-soft: #E3F4EA; --fgs-warn: #7A5200; --fgs-warn-soft: #FFF2D2;
        --fgs-display: inherit; --fgs-r: 16px; --fgs-toast-bottom: 24px;
    }
    .fgs-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; margin: 0; }
    .fgs-i { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
    .fgs-sheet { box-sizing: border-box; position: fixed; inset: 0 0 0 auto; margin: 0 0 0 auto; width: min(440px, 100%); max-width: 100%; height: 100%; max-height: 100%; padding: 0; border: 0;
        background: var(--fgs-bg); color: var(--fgs-ink); font: 400 15px/1.45 Inter, system-ui, -apple-system, 'Segoe UI', sans-serif; text-align: left; letter-spacing: normal; text-transform: none;
        box-shadow: -24px 0 60px rgba(0,0,0,.22); overflow: hidden; }
    .fgs-sheet *, .fgs-sheet *::before, .fgs-sheet *::after { box-sizing: border-box; }
    .fgs-sheet[open] { display: flex; flex-direction: column; animation: fgs-in .35s cubic-bezier(.16,1,.3,1); }
    .fgs-sheet::backdrop { background: rgba(8, 14, 12, .52); }
    @keyframes fgs-in { from { transform: translateX(48px); opacity: 0; } }
    :where(.fgs-sheet) :where(p, h2, h3, dl, dd, ul, ol) { margin: 0; padding: 0; }
    :where(.fgs-sheet) :where(h2, h3) { font-family: inherit; font-size: inherit; line-height: 1.25; }
    :where(.fgs-sheet) img { display: block; max-width: 100%; }
    :where(.fgs-sheet) :where(button, input, select) { font: inherit; color: inherit; }
    :where(.fgs-sheet) button { cursor: pointer; border: 0; background: none; }
    :where(.fgs-sheet) a { color: inherit; }
    .fgs-sheet :focus-visible { outline: 3px solid var(--fgs-accent); outline-offset: 2px; }
    .fgs-head { position: relative; display: flex; align-items: center; gap: 4px; min-height: 64px; padding: 8px 8px 8px 20px; border-bottom: 1px solid var(--fgs-line); }
    .fgs-sheet[data-view="checkout"] .fgs-head { padding-left: 8px; }
    .fgs-title { flex: 1; font: 800 1.25rem/1.2 var(--fgs-display); letter-spacing: -.01em; }
    .fgs-title:focus { outline: none; }
    .fgs-iconbtn { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; color: var(--fgs-muted); }
    .fgs-iconbtn:hover { background: var(--fgs-soft); color: var(--fgs-ink); }
    .fgs-body { flex: 1; overflow-y: auto; overscroll-behavior: contain; padding: 16px 20px 24px; display: grid; align-content: start; gap: 16px; }
    .fgs-foot { display: grid; gap: 10px; padding: 14px 20px calc(16px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid var(--fgs-line); box-shadow: 0 -10px 30px rgba(0,0,0,.05); }
    .fgs-foot[hidden] { display: none; }
    .fgs-cta { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; min-height: 52px; padding: 0 20px; border-radius: 999px;
        background: var(--fgs-accent); color: var(--fgs-on-accent); font-weight: 700; font-size: 16px; text-decoration: none; transition: background .2s, transform .2s; }
    .fgs-cta:hover { background: var(--fgs-accent-2); }
    .fgs-cta:disabled { opacity: .75; cursor: progress; }
    .fgs-ghost { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; min-height: 48px; padding: 0 18px; border-radius: 999px;
        border: 1.5px solid var(--fgs-line); font-weight: 700; font-size: 15px; color: var(--fgs-ink); text-decoration: none; background: var(--fgs-bg); }
    .fgs-ghost:hover { border-color: var(--fgs-ink); }
    .fgs-ghost.sm { width: auto; justify-self: start; min-height: 44px; font-size: 14px; }
    .fgs-ghost .fgs-i { width: 18px; height: 18px; }
    .fgs-link { min-height: 44px; padding: 0 4px; font-size: 13px; font-weight: 600; color: var(--fgs-muted); text-decoration: underline; text-underline-offset: 3px; }
    .fgs-link:hover { color: var(--fgs-ink); }
    .fgs-save { display: inline-flex; align-items: center; gap: 5px; }
    .fgs-save .fgs-i { width: 15px; height: 15px; }
    .fgs-mini { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 14px; border-radius: 999px; background: var(--fgs-accent); color: var(--fgs-on-accent); font-size: 13px; font-weight: 700; }
    .fgs-mini .fgs-i { width: 16px; height: 16px; }
    .fgs-note { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--fgs-muted); }
    .fgs-note .fgs-i { width: 15px; height: 15px; }

    .fgs-ship { display: grid; gap: 8px; padding: 12px 14px; border-radius: var(--fgs-r); background: var(--fgs-soft); font-size: 14px; }
    .fgs-ship p { display: flex; align-items: center; gap: 8px; }
    .fgs-ship .fgs-i { width: 18px; height: 18px; color: var(--fgs-accent); }
    .fgs-ship.is-free { background: var(--fgs-ok-soft); color: var(--fgs-ok); }
    .fgs-ship.is-free .fgs-i { color: var(--fgs-ok); stroke-width: 3; }
    .fgs-bar { height: 8px; border-radius: 99px; background: rgba(0,0,0,.08); overflow: hidden; }
    .fgs-bar span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--fgs-accent-2), var(--fgs-accent)); transition: width .5s cubic-bezier(.16,1,.3,1); }
    .fgs-ship.is-free .fgs-bar span { background: var(--fgs-ok); }

    .fgs-group { display: grid; gap: 2px; }
    .fgs-group-h { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: var(--fgs-muted); }
    .fgs-group-h .fgs-i { width: 16px; height: 16px; color: var(--fgs-accent); }
    .fgs-dot { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--fgs-muted); }
    .fgs-dot::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: #A9B0A6; flex-shrink: 0; }
    .fgs-dot.on { color: var(--fgs-ok); }
    .fgs-dot.on::before { background: #1FA971; box-shadow: 0 0 0 3px rgba(31,169,113,.18); }
    .fgs-group-h .fgs-dot { margin-left: auto; white-space: nowrap; }
    .fgs-lines, .fgs-orders { list-style: none; display: grid; }
    .fgs-line { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--fgs-line); }
    .fgs-line:last-child { border-bottom: 0; }
    .fgs-thumb { width: 64px; height: 64px; border-radius: 12px; background: var(--fgs-soft); display: grid; place-items: center; overflow: hidden; flex-shrink: 0; }
    .fgs-thumb img { width: 86%; height: 86%; object-fit: contain; mix-blend-mode: multiply; }
    .fgs-line-name { font-size: 14px; font-weight: 600; line-height: 1.3; }
    .fgs-line-name span { color: var(--fgs-muted); font-weight: 500; }
    .fgs-line-price { display: flex; align-items: baseline; flex-wrap: wrap; gap: 2px 8px; margin-top: 4px; }
    .fgs-line-price b { font: 800 1.05rem/1.1 var(--fgs-display); font-variant-numeric: tabular-nums; }
    .fgs-line-price b.sale { color: var(--fgs-sale); }
    .fgs-line-price s, .fgs-line-price small { font-size: 12px; color: var(--fgs-muted); }
    .fgs-line-ctrl { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 10px; margin-top: 6px; }
    .fgs-step { display: inline-flex; align-items: center; border-radius: 999px; background: var(--fgs-soft); }
    .fgs-step button { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; }
    .fgs-step button:hover { background: var(--fgs-bg); box-shadow: 0 1px 3px rgba(0,0,0,.1); }
    .fgs-step button[aria-disabled="true"] { opacity: .4; cursor: not-allowed; }
    .fgs-step .fgs-i { width: 16px; height: 16px; }
    .fgs-step output { min-width: 20px; text-align: center; font-weight: 700; font-variant-numeric: tabular-nums; }

    .fgs-upsell { padding: 14px; border-radius: var(--fgs-r); background: var(--fgs-soft); }
    .fgs-upsell h3 { font-size: 14px; font-weight: 700; margin-bottom: 10px; }
    .fgs-upsell ul { list-style: none; display: grid; gap: 8px; }
    .fgs-upsell li { display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 6px 6px 6px 8px; border-radius: 12px; background: var(--fgs-bg); }
    .fgs-upsell .fgs-thumb { width: 48px; height: 48px; }
    .fgs-upsell p { font-size: 13px; font-weight: 600; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .fgs-upsell b { font-size: 13px; }
    .fgs-add { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: var(--fgs-accent); color: var(--fgs-on-accent); }

    .fgs-coupon summary { list-style: none; display: flex; align-items: center; gap: 8px; min-height: 44px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .fgs-coupon summary::-webkit-details-marker { display: none; }
    .fgs-coupon summary::after { content: '+'; margin-left: auto; font-size: 20px; line-height: 1; color: var(--fgs-muted); }
    .fgs-coupon[open] summary::after { content: '−'; }
    .fgs-coupon summary .fgs-i { width: 18px; height: 18px; color: var(--fgs-accent); }
    .fgs-coupon-form { display: flex; gap: 6px; margin: 2px 0 6px; }
    .fgs-coupon-form input { flex: 1; min-width: 0; min-height: 46px; padding: 0 14px; border: 1.5px solid #CDD3CA; border-radius: 12px; background: #fff; text-transform: uppercase; letter-spacing: .06em; font-weight: 700; }
    .fgs-coupon-form input::placeholder { text-transform: none; letter-spacing: 0; font-weight: 400; color: #6B7670; }
    .fgs-coupon-form button { min-height: 46px; padding: 0 18px; border-radius: 12px; background: var(--fgs-ink); color: #fff; font-weight: 700; }
    .fgs-coupon-on { display: flex; align-items: center; gap: 8px; padding: 2px 4px 2px 12px; border: 1.5px dashed var(--fgs-ok); border-radius: 12px; background: var(--fgs-ok-soft); color: var(--fgs-ok); font-size: 13px; }
    .fgs-coupon-on span { flex: 1; }
    .fgs-coupon-on .fgs-i { width: 16px; height: 16px; }
    .fgs-coupon-on .fgs-link { color: var(--fgs-ok); }

    .fgs-sum { display: grid; gap: 4px; font-size: 14px; }
    .fgs-sum div { display: flex; justify-content: space-between; gap: 12px; }
    .fgs-sum dt { color: var(--fgs-muted); }
    .fgs-sum dd { font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; }
    .fgs-sum .fgs-ok dt, .fgs-sum .fgs-ok dd, .fgs-ok { color: var(--fgs-ok); }
    .fgs-sum .fgs-total { margin-top: 4px; padding-top: 8px; border-top: 1px solid var(--fgs-line); align-items: baseline; }
    .fgs-sum .fgs-total dt { color: var(--fgs-ink); font-weight: 700; font-size: 16px; }
    .fgs-sum .fgs-total dd { font: 800 1.4rem/1 var(--fgs-display); }
    .fgs-meta-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; color: var(--fgs-muted); }
    .fgs-saving { display: inline-flex; align-items: center; gap: 5px; padding: 2px 9px; border-radius: 999px; background: var(--fgs-ok-soft); color: var(--fgs-ok); font-weight: 700; }
    .fgs-saving .fgs-i { width: 13px; height: 13px; }

    .fgs-form { display: grid; gap: 22px; }
    .fgs-fs { border: 0; margin: 0; padding: 0; min-width: 0; display: grid; gap: 12px; }
    .fgs-fs legend { display: flex; align-items: center; gap: 10px; padding: 0; margin-bottom: 12px; font: 800 1.05rem/1.2 var(--fgs-display); }
    .fgs-n { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: var(--fgs-accent); color: var(--fgs-on-accent); font: 700 13px/1 Inter, system-ui, sans-serif; }
    .fgs-when { display: grid; gap: 12px; }
    .fgs-when[hidden] { display: none; }
    .fgs-field { display: grid; gap: 5px; min-width: 0; }
    .fgs-field label, .fgs-label { font-size: 13px; font-weight: 600; }
    .fgs-field label span { font-weight: 400; color: var(--fgs-muted); }
    .fgs-field input:not([type="checkbox"]), .fgs-field select { width: 100%; min-height: 48px; padding: 0 14px; border: 1.5px solid #CDD3CA; border-radius: 12px; background: #fff; font-size: 16px; }
    .fgs-field input::placeholder { color: #6B7670; }
    .fgs-field input:focus, .fgs-field select:focus, .fgs-coupon-form input:focus { outline: none; border-color: var(--fgs-accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--fgs-accent) 18%, transparent); }
    .fgs-sheet .fgs-field [aria-invalid="true"], .fgs-coupon-form [aria-invalid="true"] { border-color: var(--fgs-sale); }
    .fgs-err { font-size: 13px; font-weight: 600; color: var(--fgs-sale); }
    .fgs-err:empty { display: none; }
    .fgs-row { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
    @media (min-width: 400px) { .fgs-row { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
    .fgs-opts, .fgs-stores { display: grid; gap: 8px; }
    .fgs-opt { position: relative; display: block; cursor: pointer; }
    .fgs-opt input { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
    .fgs-opt-box { display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 10px 14px; border: 1.5px solid var(--fgs-line); border-radius: 14px; background: #fff; transition: border-color .2s, box-shadow .2s; }
    .fgs-opt-box > span { display: grid; gap: 1px; min-width: 0; flex: 1; }
    .fgs-opt-box b { font-size: 14px; }
    .fgs-opt-box small { font-size: 12px; color: var(--fgs-muted); }
    .fgs-opt-box small.fgs-dot.on { color: var(--fgs-ok); }
    .fgs-opt-box > .fgs-i { width: 22px; height: 22px; color: var(--fgs-accent); }
    .fgs-opt-box::after { content: ''; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #A9B0A6; flex-shrink: 0; transition: border .15s; }
    .fgs-opt:hover .fgs-opt-box { border-color: #B7BDB3; }
    .fgs-opt input:checked + .fgs-opt-box { border-color: var(--fgs-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--fgs-accent) 14%, transparent); }
    .fgs-opt input:checked + .fgs-opt-box::after { border: 6px solid var(--fgs-accent); }
    .fgs-opt input:focus-visible + .fgs-opt-box { outline: 3px solid var(--fgs-accent); outline-offset: 2px; }
    .fgs-opt input:disabled + .fgs-opt-box { opacity: .5; }
    .fgs-opt input:disabled { cursor: not-allowed; }
    .fgs-check { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; cursor: pointer; min-height: 44px; padding-top: 10px; }
    .fgs-check input { width: 20px; height: 20px; margin-top: 1px; accent-color: var(--fgs-accent); flex-shrink: 0; }

    .fgs-done { display: grid; justify-items: center; gap: 6px; padding: 12px 0 0; text-align: center; }
    .fgs-done-ico { width: 72px; height: 72px; border-radius: 50%; display: grid; place-items: center; background: var(--fgs-ok-soft); color: var(--fgs-ok); animation: fgs-pop .55s cubic-bezier(.16,1,.3,1); }
    .fgs-done-ico .fgs-i { width: 36px; height: 36px; stroke-width: 3; }
    @keyframes fgs-pop { from { transform: scale(.4); opacity: 0; } }
    .fgs-done-t { margin-top: 6px; font: 800 1.35rem/1.2 var(--fgs-display); text-wrap: balance; }
    .fgs-done p:not(.fgs-done-t) { font-size: 14px; color: var(--fgs-muted); }
    .fgs-eta { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: var(--fgs-r); background: var(--fgs-soft); }
    .fgs-eta > .fgs-i { width: 28px; height: 28px; color: var(--fgs-accent); }
    .fgs-eta b { display: block; }
    .fgs-eta span { font-size: 13px; color: var(--fgs-muted); }
    .fgs-track { list-style: none; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 4px; }
    .fgs-track li { display: grid; gap: 6px; font-size: 11px; font-weight: 600; line-height: 1.2; color: var(--fgs-muted); }
    .fgs-track li span { height: 6px; border-radius: 99px; background: var(--fgs-line); }
    .fgs-track li.done span, .fgs-track li.now span { background: var(--fgs-ok); }
    .fgs-track li.now { color: var(--fgs-ink); }
    .fgs-track li.now span { animation: fgs-pulse 1.6s ease-in-out infinite; }
    @keyframes fgs-pulse { 50% { opacity: .45; } }

    .fgs-tabs { display: flex; gap: 4px; padding: 4px; border-radius: 999px; background: var(--fgs-soft); }
    .fgs-tabs button { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px; border-radius: 999px; font-size: 14px; font-weight: 700; color: var(--fgs-muted); }
    .fgs-tabs button[aria-selected="true"] { background: var(--fgs-bg); color: var(--fgs-ink); box-shadow: 0 1px 3px rgba(0,0,0,.12); }
    .fgs-tabs span { min-width: 20px; height: 20px; padding: 0 6px; border-radius: 99px; display: grid; place-items: center; background: var(--fgs-accent); color: var(--fgs-on-accent); font-size: 11px; }
    .fgs-panel { display: grid; gap: 12px; }
    .fgs-panel:focus { outline: none; }
    .fgs-orders { gap: 12px; }
    .fgs-order { display: grid; gap: 8px; padding: 14px; border: 1px solid var(--fgs-line); border-radius: var(--fgs-r); }
    .fgs-order-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .fgs-order-meta { font-size: 13px; color: var(--fgs-muted); }
    .fgs-order-meta b { color: var(--fgs-ink); }
    .fgs-chip { padding: 3px 10px; border-radius: 999px; background: var(--fgs-soft); font-size: 12px; font-weight: 700; white-space: nowrap; }
    .fgs-chip.ok { background: var(--fgs-ok-soft); color: var(--fgs-ok); }
    .fgs-chip.wait { background: var(--fgs-warn-soft); color: var(--fgs-warn); }
    .fgs-chip.off { background: #FDECEA; color: #A3261F; }
    .fgs-thumbs { display: flex; gap: 6px; }
    .fgs-thumbs .fgs-thumb { width: 44px; height: 44px; border-radius: 10px; }
    .fgs-more { width: 44px; height: 44px; border-radius: 10px; display: grid; place-items: center; background: var(--fgs-soft); font-size: 13px; font-weight: 700; }
    .fgs-empty { display: grid; justify-items: center; gap: 8px; padding: 36px 12px; text-align: center; font-size: 14px; color: var(--fgs-muted); }
    .fgs-empty-ico { width: 72px; height: 72px; border-radius: 50%; display: grid; place-items: center; background: var(--fgs-soft); color: var(--fgs-accent); margin-bottom: 4px; }
    .fgs-empty-ico .fgs-i { width: 32px; height: 32px; }
    .fgs-empty-t { font: 800 1.15rem/1.2 var(--fgs-display); color: var(--fgs-ink); }
    .fgs-empty .fgs-cta { width: auto; margin-top: 8px; }

    .fgs-toast { position: fixed; left: 50%; bottom: calc(var(--fgs-toast-bottom) + env(safe-area-inset-bottom, 0px)); z-index: 3000; transform: translate(-50%, 16px);
        display: flex; align-items: center; gap: 10px; width: max-content; max-width: calc(100vw - 32px); min-height: 48px; padding: 12px 20px; border-radius: 999px;
        background: #10261F; color: #fff; font: 600 14px/1.3 Inter, system-ui, sans-serif; text-align: left; box-shadow: 0 16px 40px rgba(0,0,0,.28);
        opacity: 0; visibility: hidden; transition: opacity .25s, transform .3s cubic-bezier(.16,1,.3,1), visibility 0s .3s; }
    .fgs-toast.show { opacity: 1; visibility: visible; transform: translate(-50%, 0); transition-delay: 0s; }
    .fgs-toast.has-action { padding: 4px 4px 4px 18px; }
    .fgs-toast span { min-width: 0; }
    .fgs-toast button { min-height: 44px; padding: 0 16px; border: 0; border-radius: 999px; background: rgba(255,255,255,.16); color: #fff; font: inherit; font-weight: 700; white-space: nowrap; cursor: pointer; }
    .fgs-toast button:hover { background: rgba(255,255,255,.26); }
    .fgs-toast button:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
    .fgs-bump { animation: fgs-bump .45s cubic-bezier(.16,1,.3,1); }
    @keyframes fgs-bump { 40% { transform: scale(1.4); } }
    @media (prefers-reduced-motion: reduce) {
        .fgs-sheet[open], .fgs-bump, .fgs-done-ico, .fgs-track li.now span { animation: none !important; }
        .fgs-toast, .fgs-bar span { transition: none; }
    }`;
    const style = document.createElement('style');
    style.id = 'fgs-styles';
    style.textContent = css;
    document.head.appendChild(style);

    function init() { paint(); fromHash(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init);

    return {
        fmt, esc, register, cart, totals, coupon, orders, fav, rx, openStatus, PHARM, on, toast,
        open, close, refresh: paint,
        setStore(id) { if (PHARM[id]) homeStore = id; },
        FREE_FROM,
    };
})();
