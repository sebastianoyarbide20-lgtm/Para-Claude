// Generado por shopify/construir-farmacias.js a partir de farmacia-norte.html: no editar a mano.
(() => {
    const s = FG.store('norte');
    const brands = FG.brands('norte');
    const all = new Map([...s.items, ...brands].map(p => [p.id, p]));
    const st = FG.status('norte');
    const nm = p => p.fullName ? p.name : p.name.replace(new RegExp('^' + p.brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s', 'i'), '').replace(/^./, c => c.toUpperCase());
    const label = p => p.fullName || `${p.name} (${p.size})`;
    // En qué momento del entrenamiento va cada producto
    const MOMENT = { 109: 'Después', 110: 'Después', 111: 'Después', 112: 'Después', 121: 'Después', 122: 'Durante',
        26: 'Después', 30: 'Antes', 35: 'Después', 36: 'Todo el día', 37: 'Todo el día', 38: 'Después', 39: 'Después', 43: 'Durante' };
    const mClass = m => m.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');

    document.getElementById('brand').insertAdjacentHTML('afterbegin', FG.logo(s, 38, 'Barlow Condensed, sans-serif'));

    // Portada: el producto con más descuento de la línea
    const feat = all.get(112) || s.items[0], fd = FG.off(feat);
    document.getElementById('hero-art').innerHTML = `
        <div class="frame">${FG.photo(feat, 260).replace('loading="lazy"', '')}</div>
        ${fd > 0 ? `<span class="hero-off up">−${fd} %</span>` : ''}
        <p class="hero-price up"><span>${FG.esc(feat.brand)} · ${FG.esc(nm(feat))}</span><b>${FG.fmt(feat.price)}</b></p>`;

    // Marcador LED
    const led = document.getElementById('led-now');
    led.textContent = st.open ? 'Abierta' : 'Cerrada'; led.classList.add(st.open ? 'on' : 'off');
    const tick = ['En vivo', st.text, 'Retiro en 12 minutos', 'Envío gratis desde $ 15.000', 'Hasta 35 % off en colágeno'];
    document.getElementById('ticker').innerHTML = [...tick, ...tick].map(t => `<span>${FG.esc(t)}</span>`).join('');

    // Armá tu kit
    const ICON = {
        running: '<path d="M13 4a2 2 0 1 0 0-.01M7 21l3-6 3 2 1 4M10 15l1-5 4 2 3-2M6 9l4-2"/>',
        gym: '<path d="M3 10v4M6 8v8M18 8v8M21 10v4M6 12h12"/>',
        futbol: '<circle cx="12" cy="12" r="9"/><path d="m12 7 4 3-1.5 5h-5L8 10z"/>',
        ciclismo: '<circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="M6 16l4-7h5l3 7M10 9 8 5h3"/>',
    };
    const KITS = {
        running: { label: 'Running', ids: [30, 122, 121, 109] },
        gym: { label: 'Gym', ids: [30, 35, 112, 26] },
        futbol: { label: 'Fútbol', ids: [122, 43, 111, 110] },
        ciclismo: { label: 'Ciclismo', ids: [122, 37, 36, 38] },
    };
    const seg = document.getElementById('seg');
    seg.innerHTML = Object.entries(KITS).map(([k, v], i) => `<label><input type="radio" name="sport" value="${k}"${i === 0 ? ' checked' : ''}><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>${v.label}</span></label>`).join('');
    let kit = [];
    function paintKit() {
        const k = seg.querySelector('input:checked').value;
        kit = KITS[k].ids.map(id => all.get(id)).filter(Boolean);
        document.getElementById('kit-list').innerHTML = kit.map(p => {
            const m = MOMENT[p.id] || 'Después';
            return `<li class="kit-item ${mClass(m)}">
                <span class="ph">${FG.photo(p, 72)}</span>
                <div><span class="moment ${mClass(m)}">${m}</span><b>${FG.esc(nm(p))}</b><small>${FG.esc(p.brand)} · ${FG.esc(p.size)}</small></div>
                <span class="p">${FG.fmt(p.price)}</span></li>`;
        }).join('');
        const t = FG.total(kit), save = FG.totalList(kit) - t;
        document.getElementById('kit-sum').innerHTML = `<div><small>Kit ${KITS[k].label} · ${kit.length} productos</small><p class="tot up">${save > 0 ? `<s>${FG.fmt(t + save)}</s>` : ''}${FG.fmt(t)}</p>${save > 0 ? `<small>Ahorrás ${FG.fmt(save)}</small>` : ''}</div>
            <button class="skew-btn orange" type="button" id="kit-add"><span>Sumar el kit</span></button>`;
        document.getElementById('kit-add').addEventListener('click', () => FG.addAll(kit, `productos del kit ${KITS[k].label}`));
    }
    seg.addEventListener('change', paintKit);
    paintKit();

    // Fichas técnicas
    const specHTML = (p, i) => {
        const d = FG.off(p), m = MOMENT[p.id] || 'Después';
        return `<li class="spec">
            <div class="spec-top"><span class="spec-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>${d > 0 ? `<span class="spec-off up">−${d} %</span>` : ''}${FG.photo(p, 200)}</div>
            <div class="spec-body">
                <span class="spec-brand up">${FG.esc(p.brand)}</span>
                <h3 class="up">${FG.esc(nm(p))}</h3>
                <dl><dt>Momento</dt><dd><span class="moment ${mClass(m)}">${m}</span></dd><dt>Tamaño</dt><dd>${FG.esc(p.size || '—')}</dd>${p.cat ? `<dt>Categoría</dt><dd>${FG.esc(p.cat)}</dd>` : ''}</dl>
                <div class="spec-foot">
                    <div>${d > 0 ? `<s>${FG.fmt(p.list)}</s>` : ''}<span class="price up${d > 0 ? ' sale' : ''}">${FG.fmt(p.price)}</span></div>
                    <button class="skew-btn dark" type="button" data-add="${p.id}" aria-label="Agregar ${FG.esc(label(p))} al carrito"><span>Sumar</span></button>
                </div>
            </div>
        </li>`;
    };
    document.getElementById('lane').innerHTML = s.items.map(specHTML).join('');
    document.querySelectorAll('[data-lane]').forEach(b => b.addEventListener('click', () => {
        const lane = document.getElementById('lane');
        lane.scrollBy({ left: Number(b.dataset.lane) * lane.clientWidth * .8, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }));
    document.getElementById('marcas').hidden = !brands.length;
    document.getElementById('lane-brands').innerHTML = brands.map(specHTML).join('');

    // Calculadora de hidratación (orientativa)
    const peso = document.getElementById('peso'), mins = document.getElementById('mins');
    function paintWater() {
        const l = Math.round((Number(peso.value) * 0.035 + Number(mins.value) / 60 * 0.6) * 10) / 10;
        document.getElementById('peso-out').textContent = peso.value;
        document.getElementById('mins-out').textContent = mins.value;
        document.getElementById('liters').textContent = l.toFixed(1).replace('.', ',');
        document.getElementById('glasses').textContent = `Unos ${Math.round(l / .25)} vasos de 250 ml repartidos en el día.`;
        document.getElementById('water').style.setProperty('--fill', `${Math.min(100, Math.round(l / 6 * 100))}%`);
    }
    [peso, mins].forEach(i => i.addEventListener('input', paintWater));
    paintWater();

    // El plan, en la pista
    const LANES = [
        ['Antes', 'Llegá con la piel protegida y lista para transpirar.', [30, 122]],
        ['Durante', 'Si entrenás al aire libre, protección solar y repelente.', [122, 43]],
        ['Después', 'Alivio muscular, recuperación y descanso.', [111, 121, 109, 112, 35]],
    ];
    document.getElementById('track').innerHTML = LANES.map(([t, txt, ids], i) => `<div class="lane-row">
        <span class="num" aria-hidden="true">${i + 1}</span>
        <div><h3 class="up">${t}</h3><p>${txt}</p></div>
        <div class="chips">${ids.map(id => all.get(id)).filter(Boolean).map(p => `<button type="button" data-add="${p.id}" aria-label="Agregar ${FG.esc(label(p))} al carrito">${FG.esc(p.brand)} ${FG.esc(nm(p))}</button>`).join('')}</div>
    </div>`).join('');

    // Tabla de rendimiento: precio por comprimido, sobre o 100 g de los suplementos
    const UNITS = [
        [/(\d+)\s*comp/i, 'comp', 'Por comprimido', 'cada comprimido', 1],
        [/(\d+)\s*sobres?/i, 'sobre', 'Por sobre', 'cada sobre', 1],
        [/(\d+)\s*g\b/i, 'g', 'Cada 100 g', 'cada 100 g', 100],
    ];
    const isSupplement = p => /suplemento|col[áa]geno|multivitam/i.test(`${label(p)} ${p.desc}`);
    const groups = new Map();
    [...all.values()].filter(isSupplement).forEach(p => {
        for (const [re, key, title, per, base] of UNITS) {
            const m = (p.size || '').match(re);
            if (!m) continue;
            if (!groups.has(key)) groups.set(key, { title, per, rows: [] });
            groups.get(key).rows.push({ p, ppu: p.price / (Number(m[1]) / base), n: Number(m[1]) });
            break;
        }
    });
    const tables = [...groups.values()].filter(g => g.rows.length >= 2);
    document.getElementById('rendimiento').hidden = !tables.length;
    document.getElementById('stats').innerHTML = tables.map(g => {
        const rows = g.rows.sort((a, b) => a.ppu - b.ppu), max = rows[rows.length - 1].ppu;
        return `<section class="stat-group" aria-label="${g.title}">
            <h3 class="up">${g.title}<small>${rows.length} productos</small></h3>
            ${rows.map(({ p, ppu }, i) => `<div class="stat">
                <span class="rank" aria-hidden="true">${i + 1}</span>
                <div class="who"><b>${FG.esc(nm(p))}${i === 0 ? '<span class="best">Rinde más</span>' : ''}</b><small>${FG.esc(p.brand)} · ${FG.esc(p.size)} · ${FG.fmt(p.price)} el envase</small></div>
                <p class="val">${FG.fmt(ppu)}<small>${g.per}</small></p>
                <div class="meter" aria-hidden="true"><span style="--w:${Math.max(8, Math.round(ppu / max * 100))}%"></span></div>
                <div class="buy"><button class="skew-btn dark" type="button" data-add="${p.id}" aria-label="Agregar ${FG.esc(label(p))} al carrito"><span>Sumar</span></button></div>
            </div>`).join('')}
        </section>`;
    }).join('');

    // Elongá en 3 minutos: seis estiramientos de 30 segundos con cronómetro
    const MOVES = [
        ['Gemelos', 'Manos en la pared, una pierna atrás con el talón apoyado. Cambiá de pierna a la mitad.'],
        ['Cuádriceps', 'Parado, llevá el talón al glúteo y sostené el tobillo. Rodillas juntas.'],
        ['Isquiotibiales', 'Sentado con las piernas estiradas, llevá el pecho hacia las rodillas sin rebotar.'],
        ['Cadera', 'Estocada baja con la rodilla de atrás apoyada: empujá suave la cadera hacia adelante.'],
        ['Hombros', 'Cruzá un brazo por delante del pecho y acercalo con el otro. Cambiá a la mitad.'],
        ['Espalda', 'En cuatro apoyos, arqueá y redondeá la espalda despacio, al ritmo de la respiración.'],
    ];
    const SECS = 30;
    const $ = id => document.getElementById(id);
    $('moves').innerHTML = MOVES.map(([n, cue]) => `<li class="move"><div><b>${n}</b><small>${cue}</small></div><span class="secs">${SECS}"</span></li>`).join('');
    $('st-segs').innerHTML = MOVES.map(() => '<span></span>').join('');
    const after = [111, 121].map(id => all.get(id)).filter(Boolean);
    $('after').innerHTML = after.length ? `<p>Para después</p>${after.map(p => `<button type="button" data-add="${p.id}" aria-label="Agregar ${FG.esc(label(p))} al carrito">${FG.esc(p.brand)} ${FG.esc(nm(p))}</button>`).join('')}` : '';
    let mAt = -1, mLeft = 0, mTimer = null;
    const mmss = n => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
    function paintStretch() {
        const done = mAt >= MOVES.length, left = mAt < 0 ? MOVES.length * SECS : done ? 0 : (MOVES.length - mAt - 1) * SECS + mLeft;
        $('st-name').textContent = mAt < 0 ? 'Listos para elongar' : done ? '¡Terminaste!' : MOVES[mAt][0];
        $('st-time').textContent = mAt < 0 || done ? mmss(left) : mmss(mLeft);
        $('st-count').textContent = `${Math.min(MOVES.length, Math.max(0, mAt + (done ? 0 : 1)))}/${MOVES.length}`;
        $('st-cue').textContent = mAt < 0 ? 'Elongá con los músculos todavía calientes, respirando lento y sin rebotar.' : done ? 'Buen trabajo. Hidratate y date un descanso.' : MOVES[mAt][1];
        [...$('st-segs').children].forEach((sg, i) => { sg.className = i < mAt || done ? 'done' : i === mAt ? 'now' : ''; if (i === mAt) sg.style.setProperty('--w', `${Math.round((SECS - mLeft) / SECS * 100)}%`); });
        [...$('moves').children].forEach((li, i) => { li.classList.toggle('is-now', i === mAt); li.classList.toggle('is-done', i < mAt || done); });
        $('st-go').firstElementChild.textContent = done ? 'Otra vez' : mAt < 0 ? 'Empezar' : mTimer ? 'Pausa' : 'Seguir';
        $('st-skip').hidden = mAt < 0 || done;
        $('st-reset').hidden = mAt < 0;
    }
    const stopStretch = () => { clearInterval(mTimer); mTimer = null; };
    function goMove(i) {
        mAt = i;
        if (mAt >= MOVES.length) { stopStretch(); $('st-live').textContent = 'Terminaste la elongación.'; }
        else { mLeft = SECS; $('st-live').textContent = `${MOVES[mAt][0]}, ${SECS} segundos. ${MOVES[mAt][1]}`; }
        paintStretch();
    }
    $('st-go').addEventListener('click', () => {
        if (mTimer) { stopStretch(); paintStretch(); return; }
        if (mAt < 0 || mAt >= MOVES.length) goMove(0);
        mTimer = setInterval(() => { mLeft--; if (mLeft <= 0) goMove(mAt + 1); else paintStretch(); }, 1000);
        paintStretch();
    });
    $('st-skip').addEventListener('click', () => goMove(mAt + 1));
    $('st-reset').addEventListener('click', () => { stopStretch(); mAt = -1; $('st-live').textContent = 'Cronómetro reiniciado.'; paintStretch(); });
    paintStretch();

    // Pie: datos, horario y accesos
    document.getElementById('foot').innerHTML = `
        <div><h3 class="up">Belgrano Norte</h3><p>${FG.esc(s.street)}</p><p>${st.text}</p>
            <div class="foot-links"><a href="${FG.mapsUrl(s)}" target="_blank" rel="noopener">Cómo llegar ↗</a><a href="${FG.telUrl(s)}">Tel. ${s.phone}</a></div></div>
        <div><h3 class="up">Horario</h3><table><caption class="sr">Horario de la semana</caption><tbody>${FG.week('norte').map(d => `<tr class="${d.today ? 'today' : ''}"><td>${d.label}${d.today ? ' · hoy' : ''}</td><td>${d.hours}</td></tr>`).join('')}</tbody></table></div>
        <div><h3 class="up">Tu cuenta</h3><div class="foot-links"><button type="button" data-account-open="orders">Mis pedidos</button><a href="${FG.home}#farmacias">Volver a FarmaGlass</a></div><p style="margin-top:10px">Parte de la red FarmaGlass</p></div>`;
})();
