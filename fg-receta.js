// FarmaGlass · recetas: el botón desplegable de arriba de todo, el apartado "Subí tu receta" y "Tu obra social".
// Lo usan la web (farmacia_v2.html) y la tienda de Shopify (shopify/tema). Necesita fg-shop.js (farmacias y "Mi cuenta").
//
// En la página:
//   <div id="rx-quick"></div>      la franja de arriba con el formulario rápido desplegable
//   <div id="rx-app"></div>        el formulario completo del apartado #receta
//   <div id="rx-club"></div>       tu obra social: quedar ingresado y ver tus descuentos
//   <button data-rx-open>          abre el desplegable rápido (por ejemplo, desde el encabezado)
// Configuración opcional (window.FG_RECETA): convenios, nota de los descuentos, enlace a la cuenta de la tienda.
// Envío: window.FG_RECETA_TRANSPORT = { send(receta) → Promise<{ done }>, resume() → { receta, ok, error } | null }.
// Sin transporte (el prototipo), la receta queda guardada solo en este navegador.
// Al tocar "Ver productos" en un descuento se emite el evento "fg:categoria" con la categoría.
window.FGReceta = (() => {
    const CONF = window.FG_RECETA || {};
    const MAX_FILES = 3, MAX_MB = 10;
    const K = { profile: 'fg-perfil' };
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const db = {
        get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
        del(k) { try { localStorage.removeItem(k); } catch {} },
    };
    const rand = n => String(Math.floor(Math.random() * 10 ** n)).padStart(n, '0');
    const kb = n => n < 1048576 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1048576).toFixed(1).replace('.', ',')} MB`;
    const $ = (root, sel) => root.querySelector(sel);

    // ── CONVENIOS DE OBRAS SOCIALES (ejemplo del prototipo; la tienda los carga desde el editor del tema) ──
    const EXAMPLE = [
        ['OSDE', '210', 40, 10, 0, 10], ['OSDE', '310', 40, 15, 0, 10], ['OSDE', '410', 50, 15, 5, 10], ['OSDE', '450', 50, 20, 5, 15], ['OSDE', '510', 60, 20, 10, 15],
        ['Swiss Medical', 'SMG02', 40, 10, 0, 0], ['Swiss Medical', 'SMG20', 50, 15, 0, 10], ['Swiss Medical', 'SMG30', 50, 15, 5, 10], ['Swiss Medical', 'SMG40', 60, 20, 10, 15],
        ['Galeno', 'Azul 220', 40, 10, 0, 0], ['Galeno', 'Plata 330', 45, 10, 0, 10], ['Galeno', 'Oro 440', 50, 15, 5, 10],
        ['Medifé', 'Bronce', 40, 0, 0, 0], ['Medifé', 'Plata', 40, 10, 0, 5], ['Medifé', 'Oro', 50, 15, 5, 10],
        ['PAMI', 'Afiliado PAMI', 50, 0, 10, 0], ['IOMA', 'Afiliado IOMA', 40, 0, 5, 0], ['OSECAC', 'Afiliado OSECAC', 40, 5, 10, 0],
    ].map(([os, plan, medicamentos, dermocosmetica, cuidado, bebes]) => ({ os, plan, medicamentos, dermocosmetica, cuidado, bebes }));
    const CATS = [
        ['medicamentos', 'Medicamentos con receta', 'Al cotizar tu receta, según el medicamento'],
        ['dermocosmetica', 'Dermocosmética', 'Cremas, sérums y protección solar'],
        ['cuidado', 'Cuidado personal', 'Higiene y cuidado del pelo y el cuerpo'],
        ['bebes', 'Bebés', 'Higiene y cuidado del bebé'],
        ['nutricion', 'Nutrición', 'Suplementos y vitaminas'],
        ['farmacia', 'Farmacia y botiquín', 'Botiquín de venta libre'],
    ];
    const CONVENIOS = (Array.isArray(CONF.convenios) && CONF.convenios.length ? CONF.convenios : EXAMPLE)
        .filter(c => c && String(c.os || '').trim())
        .map(c => ({ os: String(c.os).trim(), plan: String(c.plan || '').trim(), pct: Object.fromEntries(CATS.map(([k]) => [k, Math.max(0, Math.min(100, Math.round(Number(c[k]) || 0)))])) }));
    const NOTE = CONF.note ?? 'Convenios de ejemplo del prototipo. Los descuentos se confirman al cotizar tu receta.';
    const OTHER = 'Otra', NONE = 'Particular (sin cobertura)';
    const OBRAS = [...new Set(CONVENIOS.map(c => c.os))];
    const plansOf = os => CONVENIOS.filter(c => c.os === os && c.plan).map(c => c.plan);
    // Descuentos de una obra social y plan; sin plan, el máximo de la obra social ("hasta")
    function benefitsOf(os, plan) {
        const rows = CONVENIOS.filter(c => c.os === os);
        if (!rows.length) return { known: false, upTo: false, items: [] };
        const row = rows.find(c => c.plan === plan);
        const pick = row ? [row] : rows;
        const items = CATS.map(([key, label, sub]) => ({ key, label, sub, pct: Math.max(...pick.map(c => c.pct[key])) })).filter(b => b.pct > 0);
        return { known: true, upTo: !row && rows.length > 1, items };
    }
    const osLabel = p => p ? (p.os === OTHER ? (p.osOther || 'Otra obra social') : p.os) : '';
    const planLabel = p => p && p.plan ? (/^\d/.test(p.plan) ? `Plan ${p.plan}` : p.plan) : '';
    function perksText(os, plan, osOther) {
        if (!os) return '';
        if (os === NONE) return 'Sin obra social: igual te cotizamos la receta y te mostramos las ofertas del día.';
        const b = benefitsOf(os, plan);
        if (!b.known) return `Te confirmamos la cobertura de ${esc(osOther || 'tu obra social')} por WhatsApp.`;
        if (!b.items.length) return `Te confirmamos la cobertura de ${esc(os)} por WhatsApp.`;
        return `<b>Con ${esc(os)}${plan ? ' ' + esc(plan) : ''}:</b> ${b.items.map(i => `${b.upTo ? 'hasta ' : ''}${i.pct} % en ${i.label.toLowerCase()}`).join(' · ')}`;
    }

    // ── TU PERFIL: quedar ingresado en este dispositivo con la obra social y el plan ──
    let profile = db.get(K.profile, null);
    const subs = new Set();
    function setProfile(p) {
        profile = p ? { ...p, savedAt: Date.now() } : null;
        if (profile) db.set(K.profile, profile); else db.del(K.profile);
        subs.forEach(fn => fn(profile));
        paintQuickBar(); paintClub(); paintForms();
    }
    const firstName = () => (profile && profile.name ? profile.name.trim().split(/\s+/)[0] : '') || CONF.customerName || '';

    // ── CELULAR (WhatsApp) ──
    const digits = s => String(s || '').replace(/\D/g, '');
    function phoneOk(s) {
        let d = digits(s);
        if (d.startsWith('54')) d = d.slice(2);
        if (d.startsWith('9')) d = d.slice(1);
        if (d.startsWith('0')) d = d.slice(1);
        return d.length >= 10 && d.length <= 12;
    }
    const phoneText = s => String(s || '').trim().replace(/\s+/g, ' ');

    // ── ÍCONOS ──
    const I = {
        cam: '<svg class="rxi" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5h3.2L9 5.8h6l1.8 2.7H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.6"/></svg>',
        up: '<svg class="rxi" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M7 9l5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/></svg>',
        x: '<svg class="rxi" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
        down: '<svg class="rxi rxi-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
        check: '<svg class="rxi" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>',
        rx: '<svg class="rxi" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 12h3a2 2 0 0 1 0 4h-3v-4zm0 4v3m2.4-3 2.6 3"/></svg>',
        wa: '<svg class="rxi-wa" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6A9.4 9.4 0 0 0 3.9 16.8L2.6 21.4l4.7-1.2A9.4 9.4 0 1 0 12 2.6z" fill="#25D366"/><path d="M9.1 7.5c-.2-.5-.4-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.5 1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.5 2.6 1 3.1.8 3.6.8.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4l-.6-.4-2-1c-.3-.1-.5-.2-.7.1l-.9 1.1c-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6l.5-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.4z" fill="#fff"/></svg>',
    };

    // ── ARCHIVOS: subir, arrastrar o sacar una foto ──
    // Las fotos grandes se achican (2000 px, JPEG) antes de enviarlas: llegan más rápido y se leen igual
    async function prepare(file) {
        if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 1.5e6 || !window.createImageBitmap) return file;
        try {
            const bmp = await createImageBitmap(file);
            const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
            const c = document.createElement('canvas');
            c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
            c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
            const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .85));
            return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file;
        } catch { return file; }
    }
    async function addFiles(f, list, fromCamera = false) {
        const problems = [];
        for (const raw of list) {
            if (f.files.length >= MAX_FILES) { problems.push(`Podés enviar hasta ${MAX_FILES} archivos.`); break; }
            if (!/^image\/|^application\/pdf$/.test(raw.type)) { problems.push(`${raw.name}: solo se aceptan fotos (JPG, PNG) o PDF.`); continue; }
            const file = await prepare(raw);
            if (file.size > MAX_MB * 1048576) { problems.push(`${raw.name}: supera los ${MAX_MB} MB.`); continue; }
            f.files.push({ file, camera: fromCamera, url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null });
        }
        paintFiles(f);
        setErr(f, problems.join(' '));
        if (f.files.length) $(f.root, '[data-rx-pick]').removeAttribute('aria-invalid');
    }
    function paintFiles(f) {
        const list = $(f.root, '[data-rx-list]');
        list.innerHTML = f.files.map((x, i) => `<li class="rx-file">
            ${x.url ? `<img src="${x.url}" alt="">` : '<span class="rx-pdf" aria-hidden="true">PDF</span>'}
            <span class="rx-file-name"><b>${esc(x.file.name)}</b><small>${x.camera ? 'Foto de la cámara · ' : ''}${kb(x.file.size)}</small></span>
            <button class="rx-file-rm" type="button" data-rx-rm="${i}" aria-label="Quitar ${esc(x.file.name)}">${I.x}</button></li>`).join('');
        $(f.root, '[data-rx-count]').textContent = f.files.length ? `${f.files.length} de ${MAX_FILES}` : '';
    }

    // Cámara: en el celular abre la cámara del teléfono; en la computadora, la cámara web en vivo
    const coarse = () => matchMedia('(pointer: coarse)').matches;
    let cam, camStream, camDone, camShot;
    function stopCam() { if (camStream) camStream.getTracks().forEach(t => t.stop()); camStream = null; }
    function ensureCam() {
        if (cam) return;
        cam = document.createElement('dialog');
        cam.className = 'rx-cam';
        cam.setAttribute('aria-labelledby', 'rx-cam-t');
        cam.innerHTML = `<div class="rx-cam-in">
            <div class="rx-cam-top"><h2 id="rx-cam-t">Sacale una foto a la receta</h2><button type="button" class="rx-cam-x" data-cam="close" aria-label="Cerrar la cámara">${I.x}</button></div>
            <div class="rx-cam-view"><video playsinline muted autoplay></video><img alt="Vista previa de la foto" hidden><span class="rx-cam-guide" aria-hidden="true"></span></div>
            <p class="rx-cam-tip">Apoyá la receta sobre una superficie plana y con buena luz. Que se lean el nombre, la firma y el sello.</p>
            <p class="rx-err" data-cam-err aria-live="polite"></p>
            <div class="rx-cam-actions">
                <button type="button" class="addr-submit" data-cam="shoot">${I.cam}Sacar foto</button>
                <button type="button" class="text-btn" data-cam="retake" hidden>Repetir</button>
                <button type="button" class="addr-submit" data-cam="use" hidden>${I.check}Usar esta foto</button>
            </div>
        </div>`;
        document.body.appendChild(cam);
        const video = $(cam, 'video'), img = $(cam, 'img');
        const show = shot => {
            img.hidden = !shot; video.hidden = !!shot;
            $(cam, '[data-cam="shoot"]').hidden = !!shot;
            $(cam, '[data-cam="retake"]').hidden = $(cam, '[data-cam="use"]').hidden = !shot;
        };
        cam.addEventListener('close', () => { stopCam(); if (camShot) URL.revokeObjectURL(img.src); camShot = null; show(false); });
        cam.addEventListener('click', e => {
            if (e.target === cam) { cam.close(); return; }
            const b = e.target.closest('[data-cam]');
            if (!b) return;
            if (b.dataset.cam === 'close') cam.close();
            if (b.dataset.cam === 'shoot') {
                if (!video.videoWidth) { $(cam, '[data-cam-err]').textContent = 'La cámara todavía no está lista. Probá de nuevo en un segundo.'; return; }
                const c = document.createElement('canvas');
                c.width = video.videoWidth; c.height = video.videoHeight;
                c.getContext('2d').drawImage(video, 0, 0);
                c.toBlob(blob => {
                    const t = new Date();
                    camShot = new File([blob], `receta-${String(t.getHours()).padStart(2, '0')}${String(t.getMinutes()).padStart(2, '0')}${String(t.getSeconds()).padStart(2, '0')}.jpg`, { type: 'image/jpeg' });
                    img.src = URL.createObjectURL(camShot);
                    show(true);
                    $(cam, '[data-cam="use"]').focus();
                }, 'image/jpeg', .9);
            }
            if (b.dataset.cam === 'retake') { URL.revokeObjectURL(img.src); camShot = null; show(false); $(cam, '[data-cam="shoot"]').focus(); }
            if (b.dataset.cam === 'use' && camShot) { const file = camShot; camShot = null; cam.close(); camDone(file); }
        });
    }
    async function takePhoto(f) {
        const native = $(f.root, '[data-rx-capture]');
        if (coarse() || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { native.click(); return; }
        ensureCam();
        $(cam, '[data-cam-err]').textContent = '';
        try {
            camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
            $(cam, 'video').srcObject = camStream;
            camDone = file => { addFiles(f, [file], true); $(f.root, '[data-rx-cam]').focus(); };
            cam.showModal();
            $(cam, '[data-cam="shoot"]').focus();
        } catch {
            stopCam();
            setErr(f, 'No pudimos abrir la cámara: elegí una foto de la receta.');
            native.click();
        }
    }

    // ── FORMULARIOS: el rápido (franja de arriba) y el completo (apartado #receta) ──
    let store = CONF.store || 'plaza';
    const forms = [];
    const opt = (v, cur, label = v) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(label)}</option>`;
    function fieldsHTML(kind, p) {
        const id = n => `rx-${kind}-${n}`;
        const full = kind === 'full';
        return `<form class="rx-form rxf rxf-${kind}" data-rx-form="${kind}" novalidate>
            <div class="rxf-pickzone" data-rx-pick>
                <p class="rxf-step"><span>1</span>Tu receta <small data-rx-count aria-live="polite"></small></p>
                <div class="rxf-pick">
                    <button type="button" class="rxf-btn rxf-cam" data-rx-cam>${I.cam}<span>Sacar foto</span></button>
                    <label class="rxf-btn rxf-up">${I.up}<span>Subir archivo</span><input type="file" class="rxf-sr" accept="image/*,application/pdf" multiple data-rx-file aria-describedby="${id('help')}"></label>
                </div>
                <input type="file" accept="image/*" capture="environment" hidden data-rx-capture tabindex="-1" aria-hidden="true">
                <p class="rxf-help" id="${id('help')}"><span class="rxf-mouse">O arrastrala acá. </span>Foto o PDF · hasta ${MAX_FILES} archivos de ${MAX_MB} MB</p>
                <ul class="rx-files" data-rx-list></ul>
                ${full ? '' : `<ul class="rxf-tips" aria-label="Para que la foto salga bien">
                    <li>Que se lean el nombre, el medicamento, la firma y el sello.</li>
                    <li>Con buena luz, sobre una mesa y sin dedos encima.</li>
                    <li>¿Es una receta electrónica? Subí el PDF o una captura.</li>
                </ul>`}
            </div>
            <div class="rxf-data">
            <p class="rxf-step"><span>2</span>Tus datos</p>
            <div class="rx-grid">
                <div class="addr-field${full ? '' : ' rx-wide'}">
                    <label for="${id('phone')}">Celular <span class="rxf-wa-tag">${I.wa}WhatsApp</span></label>
                    <input id="${id('phone')}" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="Ej.: 11 2345-6789" data-rx="phone" value="${esc(p?.phone || '')}">
                </div>
                <div class="addr-field">
                    <label for="${id('os')}">Obra social o prepaga</label>
                    <select id="${id('os')}" data-rx="os">${opt('', p?.os, 'Elegí una opción')}${OBRAS.map(o => opt(o, p?.os)).join('')}${opt(OTHER, p?.os, 'Otra obra social')}${opt(NONE, p?.os)}</select>
                </div>
                <div class="addr-field" data-rx-plan-field>
                    <label for="${id('plan')}">Plan</label>
                    <select id="${id('plan')}" data-rx="plan"></select>
                </div>
                <div class="addr-field" data-rx-other-field hidden>
                    <label for="${id('other')}">¿Cuál es tu obra social?</label>
                    <input id="${id('other')}" type="text" autocomplete="off" placeholder="Nombre y plan" data-rx="osOther" value="${esc(p?.osOther || '')}">
                </div>
                ${full ? `<div class="addr-field" data-rx-member-field>
                    <label for="${id('member')}">N.º de afiliado <span class="optional">(opcional)</span></label>
                    <input id="${id('member')}" type="text" inputmode="numeric" autocomplete="off" placeholder="Como figura en tu credencial" data-rx="member" value="${esc(p?.member || '')}">
                </div>
                <div class="addr-field rx-wide">
                    <label for="${id('store')}">Farmacia que la prepara</label>
                    <select id="${id('store')}" data-rx="store"></select>
                </div>` : ''}
            </div>
            <p class="rxf-perks" data-rx-perks aria-live="polite"></p>
            <label class="rx-check rxf-save" data-rx-save-field><input type="checkbox" data-rx="save"><span><b>Quedate ingresado:</b> guardamos tu obra social y tu plan en este dispositivo y te mostramos todos tus descuentos.</span></label>
            <label class="rx-check"><input type="checkbox" data-rx="consent"><span>Autorizo a un farmacéutico de la red a revisar mi receta para cotizarla.</span></label>
            <p class="rx-err" data-rx-err aria-live="polite"></p>
            <button class="addr-submit rx-submit" type="submit">${I.rx}<span>Enviar receta</span></button>
            <p class="rxf-wa">${I.wa}<span>Te llega un <b>WhatsApp</b> con la confirmación, el precio y la cobertura.</span></p>
            </div>
        </form>
        <div class="rx-done rxf-done" data-rx-done hidden tabindex="-1"></div>`;
    }
    const val = (f, n) => { const el = $(f.root, `[data-rx="${n}"]`); return el ? (el.type === 'checkbox' ? el.checked : el.value.trim()) : ''; };
    function setErr(f, msg) { $(f.root, '[data-rx-err]').textContent = msg || ''; }
    function syncPlan(f, keep) {
        const os = val(f, 'os'), planSel = $(f.root, '[data-rx="plan"]'), cur = keep ?? planSel.value;
        const plans = plansOf(os);
        $(f.root, '[data-rx-plan-field]').hidden = !plans.length;
        $(f.root, '[data-rx-other-field]').hidden = os !== OTHER;
        const member = $(f.root, '[data-rx-member-field]');
        if (member) member.hidden = !os || os === NONE;
        planSel.innerHTML = opt('', cur, plans.length > 1 ? 'Elegí tu plan' : 'Tu plan') + plans.map(p => opt(p, cur)).join('') + (plans.length ? opt('?', cur, 'No sé mi plan') : '');
        if (plans.length === 1 && !cur) planSel.value = plans[0];
        $(f.root, '[data-rx-perks]').innerHTML = perksText(os, planSel.value === '?' ? '' : planSel.value, val(f, 'osOther'));
    }
    function syncStores(f) {
        const sel = $(f.root, '[data-rx="store"]');
        if (!sel || !window.FGShop) return;
        const cur = sel.value || store;
        sel.innerHTML = Object.entries(FGShop.PHARM).map(([id, s]) => `<option value="${id}"${id === cur ? ' selected' : ''}>${esc(s.name)}${id === store ? ' (la más cercana)' : ''} · ${FGShop.openStatus(id).short}</option>`).join('');
    }
    function paintForms() {
        forms.forEach(f => {
            $(f.root, '[data-rx-save-field]').hidden = !!profile;
            // Con los datos guardados, los formularios vacíos se completan solos
            if (profile) {
                const phone = $(f.root, '[data-rx="phone"]'), os = $(f.root, '[data-rx="os"]'), member = $(f.root, '[data-rx="member"]');
                if (!phone.value) phone.value = profile.phone || '';
                if (!os.value && profile.os) {
                    os.value = profile.os;
                    $(f.root, '[data-rx="osOther"]').value = profile.osOther || '';
                    if (member && !member.value) member.value = profile.member || '';
                    syncPlan(f, profile.plan || '');
                }
            }
            syncStores(f);
        });
    }
    function mountForm(host, kind) {
        if (!host) return null;
        const wrap = document.createElement('div');
        wrap.className = `rxf-wrap rxf-wrap-${kind}`;
        wrap.innerHTML = fieldsHTML(kind, profile);
        host.appendChild(wrap);
        const f = { kind, root: wrap, files: [], form: $(wrap, 'form') };
        f.form.addEventListener('change', e => {
            const t = e.target;
            if (t.matches('[data-rx-file], [data-rx-capture]')) { addFiles(f, [...t.files], t.matches('[data-rx-capture]')); t.value = ''; return; }
            if (t.matches('[data-rx="os"]')) syncPlan(f, '');
            if (t.matches('[data-rx="plan"]')) syncPlan(f);
            if (t.getAttribute('aria-invalid') === 'true') t.removeAttribute('aria-invalid');
        });
        f.form.addEventListener('input', e => { if (e.target.matches('[data-rx="osOther"]')) syncPlan(f); });
        f.form.addEventListener('click', e => {
            const rm = e.target.closest('[data-rx-rm]');
            if (rm) {
                const [x] = f.files.splice(Number(rm.dataset.rxRm), 1);
                if (x && x.url) URL.revokeObjectURL(x.url);
                paintFiles(f);
                $(f.root, '[data-rx-cam]').focus();
                return;
            }
            if (e.target.closest('[data-rx-cam]')) takePhoto(f);
        });
        // Arrastrar y soltar (en la computadora)
        const pick = $(wrap, '[data-rx-pick]');
        ['dragenter', 'dragover'].forEach(ev => pick.addEventListener(ev, e => { e.preventDefault(); pick.classList.add('is-over'); }));
        ['dragleave', 'drop'].forEach(ev => pick.addEventListener(ev, () => pick.classList.remove('is-over')));
        pick.addEventListener('drop', e => { e.preventDefault(); addFiles(f, [...e.dataTransfer.files]); });
        f.form.addEventListener('submit', e => { e.preventDefault(); submit(f); });
        wrap.addEventListener('click', e => {
            if (e.target.closest('[data-rx-again]')) again(f);
            if (e.target.closest('[data-rx-keep]')) keepFromLast(f);
        });
        syncPlan(f, profile?.plan || '');
        $(wrap, '[data-rx-save-field]').hidden = !!profile;
        syncStores(f);
        forms.push(f);
        return f;
    }

    let last = null;
    async function submit(f) {
        const v = { phone: val(f, 'phone'), os: val(f, 'os'), osOther: val(f, 'osOther'), plan: val(f, 'plan'), member: val(f, 'member'), store: val(f, 'store') || store, save: val(f, 'save'), consent: val(f, 'consent') };
        const invalid = [];
        f.root.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
        if (!f.files.length) invalid.push(['[data-rx-pick]', '[data-rx-cam]', 'Sacale una foto a la receta o subí el archivo.']);
        if (!phoneOk(v.phone)) invalid.push(['[data-rx="phone"]', '[data-rx="phone"]', 'Ingresá tu celular con código de área, por ejemplo 11 2345-6789: ahí te llega el WhatsApp.']);
        if (!v.os) invalid.push(['[data-rx="os"]', '[data-rx="os"]', 'Elegí tu obra social o “Particular”.']);
        else if (v.os === OTHER && !v.osOther) invalid.push(['[data-rx="osOther"]', '[data-rx="osOther"]', 'Contanos cuál es tu obra social.']);
        if (!v.consent) invalid.push(['[data-rx="consent"]', '[data-rx="consent"]', 'Necesitamos tu autorización para revisar la receta.']);
        if (invalid.length) {
            invalid.forEach(([el]) => $(f.root, el).setAttribute('aria-invalid', 'true'));
            setErr(f, invalid.map(x => x[2]).join(' '));
            $(f.root, invalid[0][1]).focus();
            return;
        }
        setErr(f, '');
        const plan = v.plan === '?' ? '' : v.plan;
        const receta = {
            id: 'RX-' + rand(6), from: f.kind, at: Date.now(), phone: phoneText(v.phone),
            os: v.os, osOther: v.os === OTHER ? v.osOther : '', plan, member: v.os === NONE ? '' : v.member,
            store: v.store, storeName: window.FGShop && FGShop.PHARM[v.store] ? FGShop.PHARM[v.store].name : v.store,
            files: f.files.map(x => x.file), names: f.files.map(x => x.file.name), news: !!(profile && profile.news),
        };
        // Quedar ingresado: los datos se guardan en este dispositivo
        if (v.save) setProfile({ ...(profile || {}), phone: receta.phone, os: receta.os, osOther: receta.osOther, plan: receta.plan, member: receta.member || (profile && profile.member) || '' });
        const btn = $(f.root, '.rx-submit');
        btn.disabled = true; btn.lastElementChild.textContent = 'Enviando tu receta…';
        try {
            const res = await (window.FG_RECETA_TRANSPORT || localTransport).send(receta);
            if (res && res.done) done(f, receta);
        } catch {
            setErr(f, 'No pudimos enviar la receta. Revisá tu conexión y probá de nuevo.');
        } finally {
            btn.disabled = false; btn.lastElementChild.textContent = 'Enviar receta';
        }
    }
    // El prototipo no tiene servidor: la receta queda en este navegador
    const localTransport = { send: () => new Promise(r => setTimeout(() => r({ done: true }), 400)) };

    function done(f, r) {
        last = r;
        if (window.FGShop) FGShop.rx.add({ id: r.id, files: r.names || [], os: [osLabel(r), r.plan].filter(Boolean).join(' '), store: r.store, phone: r.phone });
        f.files.forEach(x => x.url && URL.revokeObjectURL(x.url));
        f.files = []; paintFiles(f);
        f.form.reset(); syncPlan(f, profile?.plan || '');
        if (profile) { $(f.root, '[data-rx="phone"]').value = profile.phone || ''; $(f.root, '[data-rx="os"]').value = profile.os || ''; syncPlan(f, profile.plan || ''); }
        const invite = !profile ? `<div class="rxd-invite">
                <p><b>¿Te quedás ingresado?</b> Guardamos ${r.os && r.os !== NONE ? `tu ${esc(osLabel(r))}${r.plan ? ' ' + esc(r.plan) : ''}` : 'tus datos'} en este dispositivo y te mostramos todos los descuentos de tu obra social.</p>
                <button type="button" class="addr-submit" data-rx-keep>Guardar mis datos y ver mis descuentos</button>
            </div>` : '';
        const box = $(f.root, '[data-rx-done]');
        box.innerHTML = `<span class="rx-done-ico" aria-hidden="true">${I.check}</span>
            <h3>¡Listo! Recibimos tu receta</h3>
            <p>Código <span class="rx-code">${esc(r.id)}</span> · la prepara ${esc(r.storeName)}.</p>
            <p class="rxd-wa">${I.wa}<span>Te va a llegar un <b>WhatsApp al ${esc(r.phone)}</b> con la confirmación, el precio y la cobertura de tu obra social.</span></p>
            ${invite}
            <div class="rx-done-actions">
                <button class="text-btn" type="button" data-account-open="rx">Ver mis recetas</button>
                <button class="text-btn" type="button" data-rx-again>Enviar otra receta</button>
            </div>`;
        f.form.hidden = true; box.hidden = false;
        box.focus({ preventScroll: true });
    }
    function again(f) {
        $(f.root, '[data-rx-done]').hidden = true;
        f.form.hidden = false;
        $(f.root, '[data-rx-cam]').focus();
    }
    function keepFromLast(f) {
        if (!last) return;
        setProfile({ ...(profile || {}), phone: last.phone, os: last.os, osOther: last.osOther, plan: last.plan, member: last.member });
        const inv = $(f.root, '.rxd-invite');
        if (inv) inv.innerHTML = `<p>${I.check} Guardamos tus datos. Mirá tus descuentos en <a href="#rx-club">Tu obra social</a>.</p>`;
    }

    // ── LA FRANJA DE ARRIBA: acceso rápido desplegable ──
    let quick, quickForm;
    function paintQuickBar() {
        if (!quick) return;
        const name = firstName();
        const b = profile && profile.os ? benefitsOf(profile.os, profile.plan) : null;
        const meds = b && b.items.find(i => i.key === 'medicamentos');
        // Texto largo para la pantalla grande y corto para el celular
        const [long, short] = profile && profile.os
            ? [`${meds ? `Con ${esc(osLabel(profile))}${profile.plan ? ' ' + esc(profile.plan) : ''} tenés ${b.upTo ? 'hasta ' : ''}${meds.pct} % en tus medicamentos. ` : ''}Mandá tu receta y te respondemos por WhatsApp.`,
                meds ? `${b.upTo ? 'Hasta ' : ''}${meds.pct} % en tus medicamentos` : 'Te respondemos por WhatsApp']
            : ['Sacale una foto y mandala en 1 minuto: te respondemos por WhatsApp.', 'Te respondemos por WhatsApp'];
        $(quick, '.rxq-text').innerHTML = `<b>${profile && profile.os ? (name ? `Hola, ${esc(name)}.` : 'Hola de nuevo.') : '¿Tenés una receta?'}</b> <span class="rxq-long">${long}</span><span class="rxq-short">${short}</span>`;
    }
    function setQuick(open, { focus = true, scroll = false } = {}) {
        if (!quick) return;
        const btn = $(quick, '.rxq-toggle'), panel = $(quick, '.rxq-panel');
        btn.setAttribute('aria-expanded', String(open));
        panel.hidden = !open;
        quick.classList.toggle('is-open', open);
        if (open && scroll) window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        if (open && focus) setTimeout(() => { const d = $(quick, '[data-rx-done]:not([hidden])'); (d || $(quick, '[data-rx-cam]')).focus({ preventScroll: true }); }, scroll ? 300 : 0);
        if (!open && focus) btn.focus();
    }
    function mountQuick(host) {
        if (!host) return;
        quick = host;
        quick.classList.add('rxq');
        quick.innerHTML = `<div class="rxq-bar"><div class="rxq-in">
                <span class="rxq-ico" aria-hidden="true">${I.rx}</span>
                <p class="rxq-text"></p>
                <button class="rxq-toggle" type="button" aria-expanded="false" aria-controls="rxq-panel"><span>Enviar receta</span>${I.down}</button>
            </div></div>
            <div class="rxq-panel" id="rxq-panel" role="region" aria-label="Enviar una receta" hidden>
                <div class="rxq-panel-in">
                    <div class="rxq-head"><p class="rxq-title">Enviá tu receta en 1 minuto</p>
                        <button type="button" class="rxq-close" data-rxq-close aria-label="Cerrar">${I.x}</button></div>
                    <div data-rxq-form></div>
                    <a class="rxq-more" href="#receta" data-rxq-more>¿Querés elegir la farmacia o sumar tu n.º de afiliado? Usá el formulario completo →</a>
                </div>
            </div>`;
        quickForm = mountForm($(quick, '[data-rxq-form]'), 'quick');
        $(quick, '.rxq-toggle').addEventListener('click', () => setQuick($(quick, '.rxq-panel').hidden));
        quick.addEventListener('click', e => {
            if (e.target.closest('[data-rxq-close]')) setQuick(false);
            if (e.target.closest('[data-rxq-more]')) setQuick(false, { focus: false });
        });
        quick.addEventListener('keydown', e => { if (e.key === 'Escape' && !$(quick, '.rxq-panel').hidden && !(cam && cam.open)) { e.preventDefault(); setQuick(false); } });
        paintQuickBar();
    }
    document.addEventListener('click', e => {
        const t = e.target.closest('[data-rx-open]');
        if (t && quick) { e.preventDefault(); setQuick(true, { scroll: true }); }
    });

    // ── TU OBRA SOCIAL: quedar ingresado y ver tus descuentos ──
    let club, clubEditing = false;
    function benefitsHTML(p) {
        if (p.os === NONE) return '<p class="rxc-empty">Sin obra social igual te cotizamos tus recetas, y en el catálogo tenés las ofertas del día.</p>';
        const b = benefitsOf(p.os, p.plan);
        if (!b.known || !b.items.length) return `<p class="rxc-empty">Todavía no tenemos cargado el convenio de ${esc(osLabel(p))}. Mandanos tu receta y te confirmamos la cobertura por WhatsApp.</p>`;
        return `<ul class="rxc-perks">${b.items.map(i => `<li class="rxc-perk">
                <b class="rxc-pct">${b.upTo ? '<small>hasta</small>' : ''}${i.pct}<span>%</span></b>
                <span class="rxc-what"><strong>${esc(i.label)}</strong><small>${esc(i.sub)}</small></span>
                ${i.key === 'medicamentos'
                    ? '<button type="button" class="text-btn" data-rx-open>Enviar receta</button>'
                    : `<a class="text-btn" href="#catalogo" data-rx-cat="${i.key}">Ver productos</a>`}
            </li>`).join('')}</ul>
            ${b.upTo ? '<p class="rxc-note">Elegí tu plan para ver tus descuentos exactos.</p>' : ''}`;
    }
    function clubFormHTML(p) {
        return `<form class="rxc-form" data-rxc-form novalidate>
            <div class="rx-grid">
                <div class="addr-field"><label for="rxc-name">¿Cómo te llamás? <span class="optional">(opcional)</span></label>
                    <input id="rxc-name" type="text" autocomplete="given-name" data-rxc="name" value="${esc(p?.name || '')}"></div>
                <div class="addr-field"><label for="rxc-phone">Celular <span class="rxf-wa-tag">${I.wa}WhatsApp</span></label>
                    <input id="rxc-phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="Ej.: 11 2345-6789" data-rxc="phone" value="${esc(p?.phone || '')}"></div>
                <div class="addr-field"><label for="rxc-os">Obra social o prepaga</label>
                    <select id="rxc-os" data-rxc="os">${opt('', p?.os, 'Elegí una opción')}${OBRAS.map(o => opt(o, p?.os)).join('')}${opt(OTHER, p?.os, 'Otra obra social')}${opt(NONE, p?.os)}</select></div>
                <div class="addr-field" data-rxc-plan-field><label for="rxc-plan">Plan</label><select id="rxc-plan" data-rxc="plan"></select></div>
                <div class="addr-field" data-rxc-other-field hidden><label for="rxc-other">¿Cuál es tu obra social?</label>
                    <input id="rxc-other" type="text" autocomplete="off" placeholder="Nombre y plan" data-rxc="osOther" value="${esc(p?.osOther || '')}"></div>
                <div class="addr-field" data-rxc-member-field><label for="rxc-member">N.º de afiliado <span class="optional">(opcional)</span></label>
                    <input id="rxc-member" type="text" inputmode="numeric" autocomplete="off" data-rxc="member" value="${esc(p?.member || '')}"></div>
            </div>
            <p class="rxf-perks" data-rxc-perks aria-live="polite"></p>
            <label class="rx-check"><input type="checkbox" data-rxc="news"${p?.news ? ' checked' : ''}><span>Quiero recibir por WhatsApp los descuentos de mi obra social y las ofertas de la semana.</span></label>
            <p class="rx-err" data-rxc-err aria-live="polite"></p>
            <div class="rxc-actions">
                <button class="addr-submit" type="submit">${I.check}<span>${p ? 'Guardar cambios' : 'Ver mis descuentos'}</span></button>
                ${p ? '<button type="button" class="text-btn" data-rxc="cancel">Cancelar</button>' : ''}
            </div>
        </form>`;
    }
    function paintClub() {
        if (!club) return;
        const p = profile;
        const account = CONF.login && !CONF.customerName
            ? `<p class="rxc-account">¿Querés ver tus pedidos en cualquier dispositivo? <a href="${esc(CONF.login)}">Ingresá o creá tu cuenta</a>.</p>` : '';
        if (p && !clubEditing) {
            const name = firstName();
            club.innerHTML = `<div class="rxc-card is-in">
                <div class="rxc-head">
                    <span class="rxc-avatar" aria-hidden="true">${esc((name || osLabel(p) || '?').charAt(0).toUpperCase())}</span>
                    <div><p class="rxc-kicker">Estás ingresado en este dispositivo</p>
                        <h3 class="rxc-title">${name ? `Hola, ${esc(name)}` : 'Tus descuentos'}</h3>
                        <p class="rxc-id">${esc(osLabel(p))}${p.plan ? ` · ${esc(planLabel(p))}` : ''}${p.member ? ` · afiliado ···${esc(digits(p.member).slice(-4) || p.member.slice(-4))}` : ''}${p.phone ? ` · ${esc(p.phone)}` : ''}</p></div>
                </div>
                <h4 class="rxc-sub">Tus descuentos con ${esc(osLabel(p))}${p.plan ? ' ' + esc(p.plan) : ''}</h4>
                ${benefitsHTML(p)}
                ${p.news ? `<p class="rxc-news">${I.wa}<span>Te avisamos por WhatsApp de los descuentos de tu obra social.</span></p>` : ''}
                ${NOTE ? `<p class="rxc-note">${esc(NOTE)}</p>` : ''}
                <div class="rxc-actions">
                    <button type="button" class="text-btn" data-rxc="edit">Editar mis datos</button>
                    <button type="button" class="text-btn" data-rxc="logout">Salir y olvidar mis datos</button>
                </div>
                ${account}
            </div>`;
            return;
        }
        club.innerHTML = `<div class="rxc-card">
            <div class="rxc-head">
                <span class="rxc-avatar is-icon" aria-hidden="true">${I.rx}</span>
                <div><p class="rxc-kicker">${p ? 'Tus datos' : 'Tu obra social, siempre a mano'}</p>
                    <h3 class="rxc-title">${p ? 'Editá tus datos' : 'Quedate ingresado y mirá todos tus descuentos'}</h3>
                    ${p ? '' : `<p class="rxc-lead">Guardá tu obra social y tu plan: completamos tus recetas solos y te mostramos los descuentos de tu plan en medicamentos, dermocosmética, bebés y más.</p>
                    <ul class="rxc-chips" aria-label="Obras sociales con convenio">${OBRAS.slice(0, 6).map(o => `<li>${esc(o)}</li>`).join('')}${OBRAS.length > 6 ? '<li>y más</li>' : ''}</ul>`}</div>
            </div>
            ${clubFormHTML(p)}
            ${NOTE ? `<p class="rxc-note">${esc(NOTE)}</p>` : ''}
            <p class="rxc-note">Tus datos quedan guardados solo en este dispositivo y los podés borrar cuando quieras.</p>
            ${account}
        </div>`;
        syncClubPlan(p?.plan || '');
    }
    const cv = n => { const el = club.querySelector(`[data-rxc="${n}"]`); return el ? (el.type === 'checkbox' ? el.checked : el.value.trim()) : ''; };
    function syncClubPlan(keep) {
        const os = cv('os'), sel = club.querySelector('[data-rxc="plan"]'), cur = keep ?? sel.value;
        const plans = plansOf(os);
        club.querySelector('[data-rxc-plan-field]').hidden = !plans.length;
        club.querySelector('[data-rxc-other-field]').hidden = os !== OTHER;
        club.querySelector('[data-rxc-member-field]').hidden = !os || os === NONE;
        sel.innerHTML = opt('', cur, plans.length > 1 ? 'Elegí tu plan' : 'Tu plan') + plans.map(p => opt(p, cur)).join('');
        if (plans.length === 1 && !cur) sel.value = plans[0];
        club.querySelector('[data-rxc-perks]').innerHTML = perksText(os, sel.value, cv('osOther'));
    }
    function mountClub(host) {
        if (!host) return;
        club = host;
        club.classList.add('rxc');
        club.addEventListener('change', e => {
            if (e.target.matches('[data-rxc="os"]')) syncClubPlan('');
            if (e.target.matches('[data-rxc="plan"]')) syncClubPlan();
            if (e.target.getAttribute('aria-invalid') === 'true') e.target.removeAttribute('aria-invalid');
        });
        club.addEventListener('input', e => { if (e.target.matches('[data-rxc="osOther"]')) syncClubPlan(); });
        club.addEventListener('submit', e => {
            e.preventDefault();
            const errs = [];
            club.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
            if (!phoneOk(cv('phone'))) errs.push(['phone', 'Ingresá tu celular con código de área, por ejemplo 11 2345-6789.']);
            if (!cv('os')) errs.push(['os', 'Elegí tu obra social o “Particular”.']);
            else if (cv('os') === OTHER && !cv('osOther')) errs.push(['osOther', 'Contanos cuál es tu obra social.']);
            if (errs.length) {
                errs.forEach(([n]) => club.querySelector(`[data-rxc="${n}"]`).setAttribute('aria-invalid', 'true'));
                club.querySelector('[data-rxc-err]').textContent = errs.map(x => x[1]).join(' ');
                club.querySelector(`[data-rxc="${errs[0][0]}"]`).focus();
                return;
            }
            clubEditing = false;
            setProfile({ name: cv('name'), phone: phoneText(cv('phone')), os: cv('os'), osOther: cv('os') === OTHER ? cv('osOther') : '', plan: cv('plan'), member: cv('os') === NONE ? '' : cv('member'), news: cv('news') });
            club.querySelector('.rxc-title').setAttribute('tabindex', '-1');
            club.querySelector('.rxc-title').focus();
        });
        club.addEventListener('click', e => {
            const b = e.target.closest('[data-rxc]');
            const cat = e.target.closest('[data-rx-cat]');
            if (cat) { document.dispatchEvent(new CustomEvent('fg:categoria', { detail: cat.dataset.rxCat })); return; }
            if (!b || b.tagName === 'INPUT' || b.tagName === 'SELECT') return;
            if (b.dataset.rxc === 'edit') { clubEditing = true; paintClub(); club.querySelector('[data-rxc="phone"]').focus(); }
            if (b.dataset.rxc === 'cancel') { clubEditing = false; paintClub(); }
            if (b.dataset.rxc === 'logout') { clubEditing = false; setProfile(null); club.querySelector('[data-rxc="phone"]').focus(); }
        });
        paintClub();
    }

    // ── ARRANQUE ──
    function init() {
        mountQuick(document.getElementById('rx-quick'));
        mountForm(document.getElementById('rx-app'), 'full');
        mountClub(document.getElementById('rx-club'));
        // Vuelta de un envío de la tienda (el formulario recarga la página)
        const back = window.FG_RECETA_TRANSPORT && window.FG_RECETA_TRANSPORT.resume ? window.FG_RECETA_TRANSPORT.resume() : null;
        if (back && back.receta) {
            const f = forms.find(x => x.kind === back.receta.from) || forms[0];
            if (!f) return;
            if (f.kind === 'quick') setQuick(true, { focus: false });
            else document.getElementById('receta')?.scrollIntoView({ behavior: 'auto' });
            if (back.ok) done(f, back.receta);
            else { setErr(f, back.error || 'No pudimos enviar la receta. Probá de nuevo.'); if (f.kind === 'quick') $(f.root, '[data-rx-cam]').focus(); }
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

    return {
        setStore(id) { if (id) { store = id; forms.forEach(syncStores); } },
        open: () => setQuick(true, { scroll: true }),
        profile: () => profile, onProfile: fn => subs.add(fn), benefitsOf, convenios: CONVENIOS,
    };
})();
