// Generado por shopify/construir-farmacias.js a partir de farmacia-parque.html: no editar a mano.
(() => {
    const s = FG.store('parque');
    const brands = FG.brands('parque');
    const all = new Map([...s.items, ...brands].map(p => [p.id, p]));
    const st = FG.status('parque');
    const nm = p => p.fullName ? p.name : p.name.replace(new RegExp('^' + p.brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s', 'i'), '').replace(/^./, c => c.toUpperCase());
    const label = p => p.fullName || `${p.name} (${p.size})`;
    const bubble = p => { const d = FG.off(p); return `<span class="bubble">${d > 0 ? `<s><span class="sr">Antes </span>${FG.fmt(p.list)}</s>` : ''}${FG.fmt(p.price)}</span>`; };

    document.getElementById('brand').insertAdjacentHTML('afterbegin', FG.logo(s, 40, 'Fredoka, sans-serif'));

    // Picnic en la escena y oferta destacada
    document.getElementById('packs').innerHTML = [113, 114, 115].map(id => all.get(id)).filter(Boolean).map(p => `<span class="frame">${FG.photo(p, 146).replace('loading="lazy"', '')}</span>`).join('');
    const feat = all.get(113) || s.items[0], fd = FG.off(feat);
    document.getElementById('deal').innerHTML = `<span class="t">${FG.esc(feat.brand)} · ${FG.esc(nm(feat))} · ${FG.esc(feat.size)}</span>
        ${fd > 0 ? `<s>${FG.fmt(feat.list)}</s>` : ''}<b>${FG.fmt(feat.price)}</b>${fd > 0 ? `<em>−${fd} %</em>` : ''}
        <button class="add" type="button" data-add="${feat.id}" aria-label="Agregar ${FG.esc(label(feat))} al carrito">Agregar</button>`;

    // Para quién es cada producto (línea propia y marcas del catálogo)
    const FOR = { 113: 'bebe', 114: 'bebe', 115: 'bebe', 116: 'bebe', 123: 'bebe', 124: 'familia',
        22: 'bebe', 31: 'bebe', 33: 'bebe', 34: 'bebe', 41: 'bebe', 23: 'familia', 25: 'familia', 28: 'familia', 29: 'familia' };
    function render(filter) {
        document.getElementById('grid').innerHTML = s.items.filter(p => filter === 'todos' || FOR[p.id] === filter).map(p => {
            const d = FG.off(p);
            return `<li class="card">
                <div class="art">${d > 0 ? `<span class="off-badge">−${d} %</span>` : ''}${FG.photo(p, 150)}</div>
                <div>
                    <span class="for">${FOR[p.id] === 'bebe' ? 'Para bebés y chicos' : 'Para toda la familia'} · ${FG.esc(p.brand)}</span>
                    <h3>${FG.esc(nm(p))}</h3><p>${FG.esc(p.size)} · ${FG.esc(p.desc)}</p>
                    <div class="foot">${bubble(p)}<button class="add" type="button" data-add="${p.id}" aria-label="Agregar ${FG.esc(label(p))} al carrito">Agregar</button></div>
                </div>
            </li>`;
        }).join('');
        const shown = brands.filter(p => filter === 'todos' || (FOR[p.id] || 'familia') === filter);
        document.getElementById('marcas').hidden = !shown.length;
        document.getElementById('brands').innerHTML = shown.map(p => {
            const d = FG.off(p);
            return `<li class="shirt">
                ${d > 0 ? `<span class="off-badge">−${d} %</span>` : ''}
                <div class="art">${FG.photo(p, 140)}</div>
                <p class="brand">${FG.esc(p.brand)}</p>
                <h3>${FG.esc(p.name)}</h3>${p.size ? `<p class="size">${FG.esc(p.size)}</p>` : ''}
                <div class="row"><span class="price${d > 0 ? ' sale' : ''}">${d > 0 ? `<s><span class="sr">Antes </span>${FG.fmt(p.list)}</s>` : ''}${FG.fmt(p.price)}</span>
                <button class="add" type="button" data-add="${p.id}" aria-label="Agregar ${FG.esc(p.fullName)} al carrito">Agregar</button></div>
            </li>`;
        }).join('');
    }
    document.querySelectorAll('[data-for]').forEach(b => b.addEventListener('click', () => {
        document.querySelectorAll('[data-for]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        render(b.dataset.for);
    }));
    render('todos');

    // La mochila para el parque
    const BAG = [[22, 'Protector solar'], [34, 'Repelente para el bebé'], [116, 'Toallitas húmedas'], [41, 'Curitas'], [124, 'Jabón para las manos']]
        .map(([id, what]) => ({ p: all.get(id), what })).filter(x => x.p);
    const list = document.getElementById('checklist');
    list.innerHTML = BAG.map(({ p, what }, i) => `<li><label class="check">
        <input type="checkbox" data-bag="${i}"><span class="sr">Ya tengo: </span>
        <span class="ph">${FG.photo(p, 52)}</span>
        <span><b>${what}</b><small>${FG.esc(p.brand)} · ${FG.esc(nm(p))}</small></span>
        <span class="p">${FG.fmt(p.price)}</span></label></li>`).join('') +
        `<li><label class="check"><input type="checkbox"><span class="sr">Ya tengo: </span><span class="ph" aria-hidden="true">💧</span><span><b>Botella de agua</b><small>Traela llena de casa</small></span><span class="p"></span></label></li>`;
    const go = document.getElementById('bag-go');
    const missing = () => BAG.filter((x, i) => !list.querySelector(`[data-bag="${i}"]`).checked).map(x => x.p);
    function paintBag() {
        const m = missing();
        document.getElementById('bag-count').textContent = m.length;
        go.disabled = !m.length;
        go.textContent = m.length ? `Sumar lo que me falta (${m.length}) · ${FG.fmt(FG.total(m))}` : '¡Tu mochila está lista!';
    }
    list.addEventListener('change', paintBag);
    go.addEventListener('click', () => FG.addAll(missing(), 'productos para la mochila'));
    paintBag();

    // Las cuatro estaciones del parque (hemisferio sur): arranca por la de hoy
    const SEASONS = [
        { id: 'primavera', label: 'Primavera', ico: '✿', months: [8, 9, 10], when: 'de septiembre a noviembre', title: 'Vuelven las flores, el sol y los mosquitos',
          tips: ['Repelente apto para la edad de cada chico, solo en la piel que queda al aire.', 'Protector solar media hora antes de salir, y otra vez después de jugar con agua.'], ids: [123, 34, 22] },
        { id: 'verano', label: 'Verano', ico: '☀', months: [11, 0, 1], when: 'de diciembre a febrero', title: 'Sol fuerte, sombra y mucha agua',
          tips: ['Evitá el sol fuerte entre las 11 y las 16 h: es el momento de la sombra.', 'Renová el protector cada 2 horas y siempre después del agua.'], ids: [22, 23, 116] },
        { id: 'otono', label: 'Otoño', ico: '❦', months: [2, 3, 4], when: 'de marzo a mayo', title: 'Hojas en el piso y baños tibios',
          tips: ['Cuando refresca, baños cortos con agua tibia y shampoo suave.', 'Curitas en la mochila: con las hojas mojadas hay más de un raspón.'], ids: [113, 33, 41] },
        { id: 'invierno', label: 'Invierno', ico: '☁', months: [5, 6, 7], when: 'de junio a agosto', title: 'Abrigo, manos limpias y piel protegida',
          tips: ['La calefacción reseca el aire: baños cortos y cremas suaves.', 'Manos lavadas al volver de la plaza y antes de comer.'], ids: [115, 114, 124] },
    ].map(x => ({ ...x, items: x.ids.map(id => all.get(id)).filter(Boolean) }));
    const today = SEASONS.find(x => x.months.includes(new Date().getMonth()));
    let seasonAt = SEASONS.indexOf(today);
    const seasonsEl = document.getElementById('seasons'), pick = document.getElementById('season-pick');
    function paintSeason(focus) {
        const x = SEASONS[seasonAt];
        seasonsEl.dataset.season = x.id;
        pick.innerHTML = SEASONS.map((y, i) => `<button type="button" role="tab" id="season-${y.id}" aria-controls="season-panel" aria-selected="${i === seasonAt}" tabindex="${i === seasonAt ? 0 : -1}">
            <span class="ico" aria-hidden="true">${y.ico}</span>${y.label}${y === today ? '<span class="now-tag">hoy</span>' : ''}</button>`).join('');
        document.getElementById('season-panel').setAttribute('aria-labelledby', `season-${x.id}`);
        document.getElementById('season-text').innerHTML = `
            <p class="hand season-months">${x === today ? 'Estamos en ' + x.label.toLowerCase() + ', ' : ''}${x.when}</p>
            <h3>${FG.esc(x.title)}</h3>
            <ul class="season-tips">${x.tips.map(t => `<li>${FG.esc(t)}</li>`).join('')}</ul>
            ${x.items.length ? `<ul class="season-items">${x.items.map(p => `<li class="season-item">
                <span class="ph">${FG.photo(p, 52)}</span>
                <span><b>${FG.esc(nm(p))}</b><small>${FG.esc(p.brand)}${p.size ? ` · ${FG.esc(p.size)}` : ''}</small></span>
                <span class="p">${FG.fmt(p.price)}</span></li>`).join('')}</ul>
            <button class="season-go" type="button" id="season-go">Sumar los de ${x.label.toLowerCase()} · ${FG.fmt(FG.total(x.items))}</button>` : ''}`;
        if (focus) document.getElementById(`season-${x.id}`).focus();
    }
    pick.addEventListener('click', e => { const b = e.target.closest('[role="tab"]'); if (b) { seasonAt = SEASONS.findIndex(x => `season-${x.id}` === b.id); paintSeason(true); } });
    pick.addEventListener('keydown', e => {
        const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        if (!(e.key in keys)) return;
        e.preventDefault();
        seasonAt = (seasonAt + keys[e.key] + SEASONS.length) % SEASONS.length;
        paintSeason(true);
    });
    document.getElementById('season-text').addEventListener('click', e => {
        if (e.target.closest('#season-go')) FG.addAll(SEASONS[seasonAt].items, `productos para ${SEASONS[seasonAt].label.toLowerCase()}`);
    });
    paintSeason(false);

    // ¿Cuánto te duran las toallitas? Rinde de cada paquete según los cambios del día
    const countOf = p => Number(((p.size || '') + ' ' + label(p)).match(/x\s?(\d+)/i)?.[1] || 0);
    const WIPES = [...all.values()].filter(p => /toallitas/i.test(label(p)) && countOf(p) > 0);
    const cambios = document.getElementById('cambios'), porCambio = document.getElementById('porcambio');
    function paintWipes() {
        const perDay = Number(cambios.value) * Number(porCambio.value);
        document.getElementById('cambios-out').textContent = cambios.value;
        document.getElementById('porcambio-out').textContent = porCambio.value;
        document.getElementById('per-day').innerHTML = `Usás <b>${perDay}</b> toallitas por día, unas ${perDay * 30} por mes`;
        const rows = WIPES.map(p => ({ p, n: countOf(p), unit: p.price / countOf(p) })).sort((a, b) => a.unit - b.unit);
        document.getElementById('wipes').innerHTML = rows.map(({ p, n, unit }, i) => {
            const days = Math.floor(n / perDay), month = Math.min(10, Math.ceil(perDay * 30 / n));
            return `<li class="pack">
                ${i === 0 && rows.length > 1 ? '<span class="value">Rinde más</span>' : ''}
                <div class="art">${FG.photo(p, 96)}</div>
                <div>
                    <p class="brand">${FG.esc(p.brand)}</p>
                    <h3>${FG.esc(nm(p))}</h3>
                    <p class="lasts">${days >= 1 ? `Te dura ${days} ${days === 1 ? 'día' : 'días'}` : 'Te dura menos de un día'}<small>${n} toallitas · ${FG.fmt(unit)} cada una · ${FG.fmt(p.price)} el paquete</small></p>
                    <div class="foot">
                        <button class="add" type="button" data-add="${p.id}" aria-label="Agregar un paquete de ${FG.esc(label(p))} al carrito">Sumar 1</button>
                        ${month > 1 ? `<button class="add month" type="button" data-add="${p.id}" data-qty="${month}" aria-label="Agregar ${month} paquetes de ${FG.esc(label(p))} al carrito">Sumar ${month} para el mes · ${FG.fmt(p.price * month)}</button>` : ''}
                    </div>
                </div>
            </li>`;
        }).join('');
    }
    document.getElementById('toallitas').hidden = !WIPES.length;
    [cambios, porCambio].forEach(i => i.addEventListener('input', paintWipes));
    if (WIPES.length) paintWipes();

    // Visita
    document.getElementById('visit-street').textContent = s.street;
    document.getElementById('week').innerHTML = FG.week('parque').map(d => `<tr class="${d.today ? 'today' : ''}"><td>${d.label}${d.today ? ' · hoy' : ''}</td><td>${d.hours}</td></tr>`).join('');
    const vn = document.getElementById('visit-now'); vn.textContent = st.text; vn.classList.toggle('on', st.open);
    document.getElementById('visit-actions').innerHTML = `<a href="${FG.mapsUrl(s)}" target="_blank" rel="noopener">Cómo llegar ↗</a><a href="${FG.telUrl(s)}">Llamar al ${s.phone}</a>`;
})();
