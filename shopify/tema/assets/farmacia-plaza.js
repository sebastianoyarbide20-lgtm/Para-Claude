// Generado por shopify/construir-farmacias.js a partir de farmacia-plaza.html: no editar a mano.
(() => {
    const s = FG.store('plaza');
    const brands = FG.brands('plaza');
    const all = new Map([...s.items, ...brands].map(p => [p.id, p]));
    const pad = n => String(n).padStart(2, '0');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const label = p => p.fullName || `${p.name} (${p.size})`;
    // En la línea propia el nombre empieza con la marca: se muestra aparte
    const nm = p => p.fullName ? p.name : p.name.replace(new RegExp('^' + p.brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s', 'i'), '').replace(/^./, c => c.toUpperCase());
    const priceHTML = p => { const d = FG.off(p); return `<span class="price">${d > 0 ? `<s><span class="sr">Antes </span>${FG.fmt(p.list)}</s>` : ''}${FG.fmt(p.price)}</span>`; };

    document.getElementById('brand').insertAdjacentHTML('afterbegin', FG.logo(s, 34, 'Unbounded, sans-serif'));

    // Reloj en vivo
    const clock = document.getElementById('clock');
    const tick = () => { const d = new Date(); clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; clock.dateTime = d.toISOString(); };
    tick(); setInterval(tick, 1000);

    // Carta holográfica: la bruma Caviahue (la que más baja de precio)
    const feat = all.get(108) || s.items[0];
    const fd = FG.off(feat);
    document.getElementById('holo-in').innerHTML = `
        <div class="holo-top"><span></span><span>PL-${feat.id} · ★ Favorito</span></div>
        <div class="holo-art">${FG.photo(feat, 260)}</div>
        <h2 id="holo-title">${FG.esc(feat.brand)} · ${FG.esc(nm(feat))}</h2><p class="size">${FG.esc(feat.size)} · ${FG.esc(feat.desc)}</p>
        <div class="holo-row">${priceHTML(feat)}<button class="add" type="button" data-add="${feat.id}" aria-label="Agregar ${FG.esc(label(feat))} al carrito">+</button></div>`;
    if (fd > 0) { const o = document.getElementById('holo-off'); o.hidden = false; o.textContent = `−${fd} %`; }
    // Se inclina siguiendo el puntero (solo con mouse y sin "reducir movimiento")
    const holo = document.getElementById('holo');
    if (!reduce && matchMedia('(pointer: fine)').matches) {
        holo.addEventListener('pointermove', e => {
            const r = holo.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
            holo.style.setProperty('--ry', `${x * 14}deg`); holo.style.setProperty('--rx', `${-y * 14}deg`);
            document.getElementById('holo-in').style.setProperty('--sx', `${(x + .5) * 100}%`);
        });
        holo.addEventListener('pointerleave', () => { holo.style.setProperty('--rx', '0deg'); holo.style.setProperty('--ry', '0deg'); });
    }

    const words = ['Abierto 24 h', '✦', 'Plaza Lab', '✦', 'Entrega en 2 h', '✦', 'Envío gratis desde $ 15.000', '✦'];
    document.getElementById('marquee').innerHTML = [...words, ...words, ...words, ...words].map(w => `<span>${w}</span>`).join('');

    // ¿A qué hora lo necesitás? Cielo, hora de llegada y qué farmacias están abiertas
    const SKY = h => h < 5 || h >= 22 ? 'linear-gradient(160deg, #120520, #2B1240 70%, #3B1A56)'
        : h < 8 ? 'linear-gradient(160deg, #3B1A56, #C2185B 60%, #FF9E6B)'
        : h < 18 ? 'linear-gradient(160deg, #6A3FD6, #C2185B 70%, #FF5FA2)'
        : 'linear-gradient(160deg, #2B1240, #8E1145 55%, #FF7A59)';
    const NAMES = { centro: 'Farmacia del Centro', plaza: 'Plaza Palermo', norte: 'Belgrano Norte', parque: 'Parque Caballito' };
    const hourInput = document.getElementById('hour');
    function paintHour() {
        const h = Number(hourInput.value), at = new Date(); at.setHours(h, 0, 0, 0);
        document.getElementById('hour-big').textContent = pad(h);
        hourInput.setAttribute('aria-valuetext', `${pad(h)}:00`);
        document.getElementById('hour-eta').innerHTML = `Pedí a las ${pad(h)}:00 y llega a las <b>${pad((h + 2) % 24)}:00</b>`;
        document.getElementById('hora').style.setProperty('--sky', SKY(h));
        document.getElementById('net').innerHTML = Object.keys(NAMES).map(id => {
            const st = FGShop.openStatus(id, at);
            return `<li class="${id === 'plaza' ? 'me' : ''}"><b>${NAMES[id]}</b><span class="st${st.open ? ' on' : ''}">${st.open ? 'Abierta' : 'Cerrada'}</span></li>`;
        }).join('');
    }
    hourInput.value = new Date().getHours();
    hourInput.addEventListener('input', paintHour);
    paintHour();

    // Tu rutina en 2 preguntas
    const LIMPIA = { seca: 13, mixta: 11, grasa: 11, sensible: 16 };
    const TRATA = { hidratacion: 17, granitos: 106, manchas: 20, ojeras: 120 };
    const CIERRA = { seca: 12, mixta: 14, grasa: 14, sensible: 108 };
    const quiz = document.getElementById('quiz');
    let routine = [];
    function paintRoutine() {
        const piel = quiz.elements.piel.value, foco = quiz.elements.foco.value;
        const ids = [LIMPIA[piel], TRATA[foco], CIERRA[piel]];
        routine = [...new Set(ids)].map(id => all.get(id)).filter(Boolean);
        const times = ['22:00 · Limpiá', '22:05 · Tratá', '22:10 · Hidratá'];
        const total = FG.total(routine), save = FG.totalList(routine) - total;
        const pielTxt = { seca: 'seca', mixta: 'mixta', grasa: 'grasa', sensible: 'sensible' }[piel];
        const focoTxt = { hidratacion: 'más hidratación', granitos: 'menos granitos', manchas: 'un tono más parejo', ojeras: 'una mirada descansada' }[foco];
        document.getElementById('routine').innerHTML = `
            <h3>Piel ${pielTxt}, para ${focoTxt}</h3>
            <p>Una propuesta orientativa. Si tenés dudas, consultá en el mostrador.</p>
            <ol class="steps">${routine.map((p, i) => `<li>
                <span class="ph">${FG.photo(p, 64)}</span>
                <div><span class="t">${times[i] || times[2]}</span><b>${FG.esc(p.brand)} · ${FG.esc(nm(p))}</b><small>${FG.esc(p.size)}</small></div>
                <span class="p">${FG.fmt(p.price)}</span></li>`).join('')}</ol>
            <div class="routine-total"><div><small>La rutina completa</small><br>${save > 0 ? `<span class="price"><s>${FG.fmt(total + save)}</s>${FG.fmt(total)}</span>` : `<span class="price">${FG.fmt(total)}</span>`}</div>
            <button class="routine-add" type="button" id="routine-add">Sumar la rutina al carrito</button></div>`;
        document.getElementById('routine-add').addEventListener('click', () => FG.addAll(routine, 'productos de tu rutina'));
    }
    quiz.addEventListener('change', paintRoutine);
    paintRoutine();

    // Plaza Lab: cartas holográficas
    document.getElementById('bento').innerHTML = [108, 105, 106, 107, 119, 120].map(id => all.get(id)).filter(Boolean).map(p => {
        const d = FG.off(p);
        return `<li class="tcard"><div class="tcard-in">
            <div class="tcard-top"><span>PL-${p.id}</span>${d > 0 ? `<span class="b">−${d} %</span>` : '<span>★</span>'}</div>
            <div class="tcard-art">${FG.photo(p, 200)}</div>
            <span class="brand">${FG.esc(p.brand)}</span>
            <h3>${FG.esc(nm(p))}</h3><span class="size">${FG.esc(p.size)}</span>
            <div class="row">${priceHTML(p)}<button class="add" type="button" data-add="${p.id}" aria-label="Agregar ${FG.esc(label(p))} al carrito">+</button></div>
        </div></li>`;
    }).join('');

    // Marcas que amamos: collage de polaroids
    document.getElementById('marcas').hidden = !brands.length;
    document.getElementById('brands').innerHTML = brands.map(p => {
        const d = FG.off(p);
        return `<li class="pola">
            ${d > 0 ? `<span class="off">−${d} %</span>` : ''}
            <div class="pola-art">${FG.photo(p, 200)}</div>
            <p class="brand">${FG.esc(p.brand)}</p>
            <h3>${FG.esc(p.name)}</h3>${p.size ? `<p class="size">${FG.esc(p.size)}</p>` : ''}
            <div class="row">${priceHTML(p)}<button class="add" type="button" data-add="${p.id}" aria-label="Agregar ${FG.esc(p.fullName)} al carrito">+</button></div>
        </li>`;
    }).join('');

    // Diccionario de la noche: cada ingrediente encuentra los productos de Plaza que lo llevan
    const INGREDIENTS = [
        { name: 'Niacinamida', glow: '#5CF2E6', re: /niacinamida/i, when: 'De día y de noche', what: 'Es vitamina B3. Ayuda a regular el sebo, a disimular los poros y a emparejar el tono.' },
        { name: 'Ácido hialurónico', glow: '#B79CFF', re: /hialur/i, when: 'De día y de noche', what: 'Retiene agua en la superficie de la piel: la hidrata y la deja más jugosa.' },
        { name: 'Ceramidas', glow: '#FFD23F', re: /ceramida/i, when: 'Todos los días', what: 'Forman parte de la barrera natural de la piel. Ayudan a que no pierda agua ni se reseque.' },
        { name: 'Vitamina C', glow: '#FF9E6B', re: /vitamina c\b/i, when: 'Mejor de día, con protector solar', what: 'Antioxidante que le da luminosidad a la piel y ayuda a atenuar las manchas.' },
        { name: 'Centella asiática', glow: '#7CF5B4', re: /centella/i, when: 'Cuando la piel lo pida', what: 'Una planta de efecto calmante: alivia la piel irritada o con granitos.' },
        { name: 'Agua termal', glow: '#8FD3FF', re: /termal|volc[áa]nica/i, when: 'A cualquier hora', what: 'Agua rica en minerales que calma y refresca la piel sensible.' },
        { name: 'Coenzima Q10', glow: '#FF5FA2', re: /q10/i, when: 'De noche', what: 'Antioxidante que acompaña el cuidado de las líneas de expresión.' },
    ].map(i => ({ ...i, items: [...all.values()].filter(p => i.re.test(`${label(p)} ${p.desc}`)) })).filter(i => i.items.length);
    const dictTabs = document.getElementById('dict-tabs'), dictPanel = document.getElementById('dict-panel');
    let dictAt = 0;
    function paintDict(focus) {
        const ing = INGREDIENTS[dictAt];
        dictTabs.innerHTML = INGREDIENTS.map((x, i) => `<button class="dict-tab" type="button" role="tab" id="ing-${i}" aria-controls="dict-panel" aria-selected="${i === dictAt}" tabindex="${i === dictAt ? 0 : -1}" style="--g:${x.glow}">${FG.esc(x.name)}</button>`).join('');
        dictPanel.style.setProperty('--g', ing.glow);
        dictPanel.setAttribute('aria-labelledby', `ing-${dictAt}`);
        dictPanel.innerHTML = `<div>
                <p class="dict-word">${FG.esc(ing.name)}</p>
                <p class="dict-what">${FG.esc(ing.what)}</p>
                <p class="dict-when">${FG.esc(ing.when)}</p>
            </div>
            <div>
                <p class="dict-found">Lo encontrás en ${ing.items.length} ${ing.items.length === 1 ? 'producto' : 'productos'}</p>
                <ul class="dict-list">${ing.items.map(p => `<li class="dict-item">
                    <span class="ph">${FG.photo(p, 60)}</span>
                    <div><span class="brand">${FG.esc(p.brand)}</span><b>${FG.esc(nm(p))}</b></div>
                    <div class="buy">${priceHTML(p)}<button class="add" type="button" data-add="${p.id}" aria-label="Agregar ${FG.esc(label(p))} al carrito">+</button></div>
                </li>`).join('')}</ul>
            </div>`;
        if (focus) document.getElementById(`ing-${dictAt}`).focus();
    }
    dictTabs.addEventListener('click', e => { const t = e.target.closest('[role="tab"]'); if (t) { dictAt = Number(t.id.slice(4)); paintDict(true); } });
    dictTabs.addEventListener('keydown', e => {
        const n = INGREDIENTS.length, keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        if (e.key in keys) dictAt = (dictAt + keys[e.key] + n) % n; else if (e.key === 'Home') dictAt = 0; else if (e.key === 'End') dictAt = n - 1; else return;
        e.preventDefault();
        paintDict(true);
    });
    document.getElementById('ingredientes').hidden = !INGREDIENTS.length;
    if (INGREDIENTS.length) paintDict(false);

    // El ritual de noche con temporizador: 1 minuto para limpiar, 30 segundos para tratar y para hidratar
    const RITUAL = [
        { step: 'Limpiá', secs: 60, tip: 'Masajeá el limpiador con movimientos circulares y enjuagá con agua tibia.' },
        { step: 'Tratá', secs: 30, tip: 'Dos o tres gotas de sérum, a toques. El contorno de ojos, con el dedo anular.' },
        { step: 'Hidratá', secs: 30, tip: 'Una capa fina de crema, de adentro hacia afuera, y a dormir.' },
    ];
    const TOTAL = RITUAL.reduce((t, r) => t + r.secs, 0);
    const el = id => document.getElementById(id);
    const steps = [...el('timeline').children];
    let rAt = -1, rLeft = 0, rTimer = null;
    const mmss = n => `${Math.floor(n / 60)}:${pad(n % 60)}`;
    function paintRitual() {
        const done = rAt >= RITUAL.length;
        const elapsed = rAt < 0 ? 0 : done ? TOTAL : RITUAL.slice(0, rAt).reduce((t, r) => t + r.secs, 0) + RITUAL[rAt].secs - rLeft;
        el('ring').style.setProperty('--p', Math.round(elapsed / TOTAL * 100));
        el('ring-time').textContent = rAt < 0 ? mmss(TOTAL) : done ? '✦' : mmss(rLeft);
        el('ring-step').textContent = rAt < 0 ? 'Ritual de 2 minutos' : done ? 'Buenas noches' : `Paso ${rAt + 1} · ${RITUAL[rAt].step}`;
        el('ritual-tip').textContent = rAt < 0 ? 'Dejá el celular en el lavabo y seguí el anillo: te avisa cuándo pasar al paso siguiente.' : done ? 'Ritual terminado. Tu piel ya está lista para la noche.' : RITUAL[rAt].tip;
        steps.forEach((li, i) => { li.classList.toggle('is-now', i === rAt); li.classList.toggle('is-done', i < rAt); });
        el('ritual-go').textContent = done ? 'Repetir el ritual' : rAt < 0 ? 'Empezar el ritual' : rTimer ? 'Pausar' : 'Seguir';
        el('ritual-next').hidden = rAt < 0 || done;
        el('ritual-reset').hidden = rAt < 0;
    }
    const stopRitual = () => { clearInterval(rTimer); rTimer = null; };
    function goStep(i) {
        rAt = i;
        if (rAt >= RITUAL.length) { stopRitual(); el('ritual-live').textContent = 'Ritual terminado. Buenas noches.'; }
        else { rLeft = RITUAL[rAt].secs; el('ritual-live').textContent = `Paso ${rAt + 1}: ${RITUAL[rAt].step}. ${RITUAL[rAt].tip}`; }
        paintRitual();
    }
    el('ritual-go').addEventListener('click', () => {
        if (rTimer) { stopRitual(); paintRitual(); return; }
        if (rAt < 0 || rAt >= RITUAL.length) goStep(0);
        rTimer = setInterval(() => { rLeft--; if (rLeft <= 0) goStep(rAt + 1); else paintRitual(); }, 1000);
        paintRitual();
    });
    el('ritual-next').addEventListener('click', () => goStep(rAt + 1));
    el('ritual-reset').addEventListener('click', () => { stopRitual(); rAt = -1; el('ritual-live').textContent = 'Ritual reiniciado.'; paintRitual(); });
    paintRitual();

    document.getElementById('info').innerHTML = `<span>${FG.status('plaza').text}</span>
        <a href="${FG.mapsUrl(s)}" target="_blank" rel="noopener">${FG.esc(s.street)} · Cómo llegar ↗</a>
        <a href="${FG.telUrl(s)}">Llamar al ${s.phone}</a>
        <span>Retiro en 30 min</span>`;
})();
