// FarmaGlass · envío de recetas en la tienda (lo usa fg-receta.js). Se carga antes que fg-receta.js.
// 1. Las fotos se suben a Shopify como archivos de una línea del producto oculto "Receta para cotizar"
//    (POST cart/add.js con FormData): Shopify guarda cada archivo y devuelve su enlace. La línea se quita enseguida.
// 2. La receta llega al email de la tienda con el formulario de contacto #rx-send: celular (WhatsApp), obra social,
//    plan, farmacia, los enlaces a las fotos y un enlace para escribirle al cliente por WhatsApp.
//    No se le pide email al cliente: el formulario usa el de su cuenta o el de la tienda.
// 3. El formulario recarga la página: resume() le dice a fg-receta.js si llegó bien o qué error dio la tienda.
window.FG_RECETA_TRANSPORT = (() => {
    const CONF = window.FG_RECETA || {};
    const ROOT = (window.FG_SHOPIFY && window.FG_SHOPIFY.root) || '/';
    const KEY = 'fg-rx-pending', TTL = 15 * 60000;
    const session = {
        get() { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; } },
        set(v) { try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch {} },
        clear() { try { sessionStorage.removeItem(KEY); } catch {} },
    };
    const json = { 'Content-Type': 'application/json', Accept: 'application/json' };
    const absolute = u => (u.startsWith('//') ? 'https:' + u : u);

    // Sube las fotos y devuelve sus enlaces
    async function upload(r) {
        if (!CONF.variant || !r.files.length) return [];
        const fd = new FormData();
        fd.append('id', CONF.variant);
        fd.append('quantity', '1');
        fd.append('properties[_Código]', r.id);
        r.files.forEach((f, i) => fd.append(`properties[Receta ${i + 1}]`, f, f.name));
        const res = await fetch(`${ROOT}cart/add.js`, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`cart/add ${res.status}`);
        const data = await res.json();
        const item = data.items ? data.items[0] : data;
        const links = Object.entries(item.properties || {})
            .filter(([k, v]) => /^Receta \d+$/.test(k) && typeof v === 'string' && /^(https?:)?\/\//.test(v))
            .map(([, v]) => absolute(v));
        // La receta no se compra: la línea sale del carrito
        if (item.key) await fetch(`${ROOT}cart/change.js`, { method: 'POST', headers: json, body: JSON.stringify({ id: item.key, quantity: 0 }) }).catch(() => {});
        return links;
    }
    // Si una línea de receta quedó en el carrito (por ejemplo, se cortó la conexión), se quita
    async function tidy() {
        if (!CONF.variant) return;
        try {
            const cart = await (await fetch(`${ROOT}cart.js`, { headers: json })).json();
            for (const it of cart.items.filter(i => String(i.variant_id) === String(CONF.variant))) {
                await fetch(`${ROOT}cart/change.js`, { method: 'POST', headers: json, body: JSON.stringify({ id: it.key, quantity: 0 }) });
            }
        } catch {}
    }
    // Enlace para escribirle al cliente por WhatsApp (Argentina: 54 9 + característica + número)
    function whatsapp(phone) {
        let d = String(phone).replace(/\D/g, '');
        if (d.startsWith('54')) d = d.slice(2);
        if (d.startsWith('9')) d = d.slice(1);
        if (d.startsWith('0')) d = d.slice(1);
        return `https://wa.me/549${d}`;
    }
    function fill(form, fields) {
        form.querySelectorAll('[data-rx-field]').forEach(el => el.remove());
        Object.entries(fields).forEach(([name, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden'; input.name = `contact[${name}]`; input.value = value; input.dataset.rxField = '';
            form.appendChild(input);
        });
    }

    async function send(r) {
        const form = document.getElementById('rx-send');
        if (!form) throw new Error('falta el formulario rx-send');
        let links = [], failed = false;
        try { links = await upload(r); } catch { failed = true; }
        const os = r.os === 'Otra' ? `Otra: ${r.osOther}` : r.os;
        const files = links.length
            ? links.map((u, i) => `${r.names[i] || `Archivo ${i + 1}`}: ${u}`).join('\n')
            : `${r.names.join(', ')} (no se pudieron subir: pedile la foto por WhatsApp)`;
        fill(form, {
            'Tipo': 'Receta',
            'Código': r.id,
            'Celular (WhatsApp)': r.phone,
            'Escribirle por WhatsApp': whatsapp(r.phone),
            'Obra social': os,
            'Plan': r.plan || '—',
            'N.º de afiliado': r.member || '—',
            'Farmacia': r.storeName,
            'Archivos': files,
            'Enviada desde': r.from === 'quick' ? 'Envío rápido (arriba de todo)' : 'Apartado de recetas',
            'Quiere novedades por WhatsApp': r.news ? 'Sí' : 'No',
            'Autorización': 'Sí, autoriza a un farmacéutico a revisar la receta',
        });
        const { files: _files, ...keep } = r;
        session.set({ ...keep, uploaded: links.length, failed, at: Date.now() });
        form.submit();
        // La página se va: el botón queda en "Enviando…" hasta que vuelve
        return new Promise(() => {});
    }

    function resume() {
        const r = session.get();
        if (!r) return null;
        session.clear();
        if (Date.now() - (r.at || 0) > TTL) return null;
        if (new URLSearchParams(location.search).get('contact_posted') === 'true') { tidy(); return { receta: r, ok: true }; }
        const errors = document.querySelector('[data-rx-errors]');
        if (errors) return { receta: r, ok: false, error: `No pudimos enviar la receta: ${errors.textContent.trim().replace(/\s+/g, ' ')}` };
        return null;
    }

    return { send, resume };
})();
