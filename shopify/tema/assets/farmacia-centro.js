// Generado por shopify/construir-farmacias.js a partir de farmacia-centro.html: no editar a mano.
(() => {
    const s = FG.store('centro');
    const st = FG.status('centro');
    const roman = n => [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
        .reduce((r, [v, l]) => { while (n >= v) { r += l; n -= v; } return r; }, '');
    const now = new Date();
    const year = roman(now.getFullYear() - 1962 + 1);
    const edition = Math.floor((now - new Date(1962, 3, 2)) / 86400000).toLocaleString('es-AR');
    const shortName = p => p.name.replace(new RegExp('^' + p.brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s', 'i'), '').replace(/^./, c => c.toUpperCase());

    // Cabecera de diario: fecha, estado de hoy y número de edición
    document.getElementById('logo').innerHTML = FG.logo(s, 58, 'DM Serif Display, Georgia, serif');
    document.getElementById('date').textContent = `Recoleta, ${now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
    document.querySelectorAll('[data-ear="left"]').forEach(e => { e.innerHTML = `<b>Hoy</b>${st.text}`; });
    document.querySelectorAll('[data-ear="right"]').forEach(e => { e.innerHTML = `<b>Año ${year}</b>Edición n.º ${edition}`; });

    // Nota principal: agua de rosas
    const feat = s.items.find(p => p.id === 102) || s.items[0];
    const fd = FG.off(feat);
    const leadImg = document.getElementById('lead-img');
    leadImg.src = feat.img; leadImg.alt = `${feat.name} (${feat.size})`;
    document.getElementById('lead-cap').textContent = `Fig. 1 — ${feat.name}, ${feat.size}`;
    document.getElementById('lead-stamp').innerHTML = fd > 0
        ? `<small>Oferta −${fd} %</small><b>${FG.fmt(feat.price)}</b><s>${FG.fmt(feat.list)}</s>`
        : `<small>Precio de</small><b>${FG.fmt(feat.price)}</b><small>mostrador</small>`;
    document.getElementById('lead-price').innerHTML = `<b>${FG.esc(feat.name)}, ${feat.size}:</b> ${fd > 0 ? `antes ${FG.fmt(feat.list)}, ahora ` : ''}<b>${FG.fmt(feat.price)}</b>.`;
    const leadAdd = document.getElementById('lead-add');
    leadAdd.dataset.add = feat.id;
    leadAdd.setAttribute('aria-label', `Agregar ${feat.name} a mi pedido`);
    const ns = document.getElementById('notice-status');
    ns.textContent = st.text; ns.classList.toggle('on', st.open);

    // La cajonera: la selección de la botica
    const drawers = [102, 101, 103, 104, 117, 118].map(id => s.items.find(p => p.id === id)).filter(Boolean);
    document.getElementById('drawers').innerHTML = drawers.map((p, i) => {
        const d = FG.off(p);
        return `<li class="drawer">
            <div class="drawer-inside">
                <span class="drawer-num">N.º ${String(i + 1).padStart(2, '0')}</span>
                ${d > 0 ? `<span class="drawer-off">−${d} %</span>` : ''}
                ${FG.photo(p, 200)}
            </div>
            <div class="drawer-front">
                <span class="label-plate"><b>${FG.esc(shortName(p))}</b><small>${FG.esc(p.brand)} · ${FG.esc(p.size)}</small></span>
                <span class="drawer-price">${d > 0 ? `<s><span class="sr">Antes </span>${FG.fmt(p.list)}</s>` : ''}<b>${FG.fmt(p.price)}</b></span>
                <button class="knob" type="button" data-add="${p.id}" aria-label="Agregar ${FG.esc(p.name)} (${p.size}) a mi pedido">Agregar</button>
            </div>
        </li>`;
    }).join('');

    // La vitrina: marcas del catálogo, cada una con su etiqueta colgante
    const shelf = FG.brands('centro');
    document.getElementById('vitrina').hidden = !shelf.length;
    document.getElementById('shelf').innerHTML = shelf.map(p => {
        const d = FG.off(p);
        return `<li class="bottle">
            <div class="bottle-art">${FG.photo(p, 160)}</div>
            <div class="tag">
                <p class="tag-brand smallcaps">${FG.esc(p.brand)}</p>
                <h3>${FG.esc(p.name)}</h3>
                ${p.size ? `<p class="tag-size">${FG.esc(p.size)}</p>` : ''}
                <p class="tag-price">${d > 0 ? `<s><span class="sr">Antes </span>${FG.fmt(p.list)}</s>` : ''}<b class="${d > 0 ? 'sale' : ''}">${FG.fmt(p.price)}</b></p>
                <button class="add" type="button" data-add="${p.id}" aria-label="Agregar ${FG.esc(p.fullName)} a mi pedido">Agregar</button>
            </div>
        </li>`;
    }).join('');

    // Todo lo que despacha la botica: su línea y las marcas de la vitrina
    const stock = new Map([...s.items, ...shelf].map(p => [p.id, p]));
    const full = p => p.fullName || `${p.name} (${p.size})`;
    const plainName = p => p.fullName ? p.name : shortName(p);

    // Recortables: fórmulas de la botica que se suman juntas al pedido
    const FORMULAS = [
        { title: 'Manos de invierno', ids: [27, 104], how: 'De noche, crema en manos y codos, y una capa fina de vaselina en los nudillos resecos.' },
        { title: 'Pies frescos', ids: [103, 118], how: 'Lavá con jabón neutro, secá bien entre los dedos y terminá con un poco de talco.' },
        { title: 'El rostro de siempre', ids: [15, 102, 18], how: 'Limpiá con un gel suave, pasá agua de rosas con un algodón y cerrá con una bruma de agua termal.' },
    ].map(f => ({ ...f, items: f.ids.map(id => stock.get(id)).filter(Boolean) })).filter(f => f.items.length >= 2);
    document.getElementById('recortables').hidden = !FORMULAS.length;
    document.getElementById('coupons').innerHTML = FORMULAS.map((f, i) => {
        const t = FG.total(f.items), list = FG.totalList(f.items);
        return `<li class="coupon">
            <span class="scissors" aria-hidden="true">✂</span>
            <p class="smallcaps coupon-n">Fórmula n.º ${i + 1}</p>
            <h3>${FG.esc(f.title)}</h3>
            <ul class="recipe">${f.items.map(p => `<li><span>${FG.esc(p.brand)} · ${FG.esc(plainName(p))}</span><i aria-hidden="true"></i><b>${FG.fmt(p.price)}</b></li>`).join('')}</ul>
            <p class="how">${FG.esc(f.how)}</p>
            <div class="coupon-foot">
                <p><small>La fórmula completa</small><b>${FG.fmt(t)}</b>${list > t ? `<s><span class="sr">Antes </span>${FG.fmt(list)}</s>` : ''}</p>
                <button class="btn" type="button" data-formula="${i}">Agregar la fórmula</button>
            </div>
        </li>`;
    }).join('');
    document.getElementById('coupons').addEventListener('click', e => {
        const b = e.target.closest('[data-formula]');
        if (b) FG.addAll(FORMULAS[Number(b.dataset.formula)].items, `productos de "${FORMULAS[Number(b.dataset.formula)].title}"`);
    });

    // Cotizaciones del mostrador: precio de hoy frente al de lista, ordenable
    const quotes = [...stock.values()];
    const quoteBody = document.getElementById('quotes');
    const SORTS = {
        name: (a, b) => plainName(a).localeCompare(plainName(b), 'es'),
        price: (a, b) => a.price - b.price,
        off: (a, b) => FG.off(a) - FG.off(b) || b.price - a.price,
    };
    let sortKey = 'off', sortDir = -1;
    function paintQuotes() {
        const rows = quotes.slice().sort((a, b) => SORTS[sortKey](a, b) * sortDir);
        quoteBody.innerHTML = rows.map(p => {
            const d = FG.off(p);
            return `<tr>
                <th scope="row"><span class="q-name">${FG.esc(plainName(p))}</span><span class="q-brand">${FG.esc(p.brand)}${p.size ? ` · ${FG.esc(p.size)}` : ''}</span></th>
                <td class="num col-list">${d > 0 ? FG.fmt(p.list) : '—'}</td>
                <td class="num"><b>${FG.fmt(p.price)}</b>${d > 0 ? `<s class="was"><span class="sr">Antes </span>${FG.fmt(p.list)}</s>` : ''}</td>
                <td class="num"><span class="var ${d > 0 ? 'down' : 'flat'}">${d > 0 ? `▼ ${d} %` : '='}</span><span class="sr">${d > 0 ? ' de descuento' : ' sin cambios'}</span></td>
                <td><button class="pedir" type="button" data-add="${p.id}" aria-label="Agregar ${FG.esc(full(p))} a mi pedido">Pedir</button></td>
            </tr>`;
        }).join('');
        document.querySelectorAll('.quotes thead th[aria-sort]').forEach(th => {
            const k = th.querySelector('[data-sort]').dataset.sort;
            th.setAttribute('aria-sort', k === sortKey ? (sortDir > 0 ? 'ascending' : 'descending') : 'none');
        });
    }
    document.querySelector('.quotes thead').addEventListener('click', e => {
        const b = e.target.closest('[data-sort]');
        if (!b) return;
        const k = b.dataset.sort;
        sortDir = k === sortKey ? -sortDir : (k === 'off' ? -1 : 1);
        sortKey = k;
        paintQuotes();
    });
    paintQuotes();
    const down = quotes.filter(p => FG.off(p) > 0), best = down.slice().sort((a, b) => FG.off(b) - FG.off(a))[0];
    document.getElementById('market-sum').innerHTML = `<span>Cotizaciones: <b>${quotes.length}</b></span><span class="down">En baja: <b>${down.length}</b></span><span>Sin cambios: <b>${quotes.length - down.length}</b></span>${best ? `<span>La mayor baja: ${FG.esc(plainName(best))} <b class="down">−${FG.off(best)} %</b></span>` : ''}`;
    document.getElementById('market-foot').textContent = `Cierre de mostrador del ${now.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })} · Precios en pesos argentinos.`;

    // Visitanos: tarjeta y horario de la semana
    document.getElementById('visit-card').innerHTML = `
        <div class="logo">${FG.logo(s, 48, 'DM Serif Display, Georgia, serif')}</div>
        <h3>Farmacia del Centro</h3>
        <p class="tagline">${FG.esc(s.tagline)}</p>
        <p>${FG.esc(s.street)}</p>
        <p>Tel. <a href="${FG.telUrl(s)}">${s.phone}</a></p>
        <a class="btn" href="${FG.mapsUrl(s)}" target="_blank" rel="noopener">Cómo llegar ↗</a>`;
    document.getElementById('week').innerHTML = FG.week('centro').map(d =>
        `<tr class="${d.today ? 'today' : ''}"><td>${d.label}</td><td class="${d.hours === 'Cerrado' ? 'closed' : ''}">${d.hours}</td></tr>`).join('');
    const ws = document.getElementById('week-status');
    ws.textContent = st.text; ws.classList.toggle('on', st.open);
    document.getElementById('colophon').textContent = `Gaceta de la Botica · Año ${year} · Edición n.º ${edition} · Impresa en Recoleta, Av. Callao 1450`;
})();
