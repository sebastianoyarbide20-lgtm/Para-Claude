// FarmaGlass · campaña "Entre todas": piezas gráficas compartidas.
//
//   FG.cruz(opciones)         → la cruz de farmacia armada con las 4 farmacias (SVG en texto)
//   FG.fachada(id)            → fachada ilustrada de una farmacia; su estado se maneja con --open (0 a 1)
//   FG.setFachada(el, open)   → pone una fachada abierta (1) o cerrada (0), o en un punto intermedio
//   FG.banderines(opciones)   → guirnalda de banderines con los colores de las 4 farmacias
//   FG.moto()                 → el repartidor en moto con la caja de FarmaGlass
//
// Los colores y las tipografías salen de las páginas de cada farmacia.

(function () {
    const FG = (window.FG = window.FG || {});
    const R = x => Math.round(x * 100) / 100;

    FG.P = {
        centro: { name: 'Farmacia del Centro', barrio: 'Recoleta', fill: '#14284B', accent: '#C9A227', ink: '#FBF6EA', hours: '8 a 21 h', days: 'Lun a sáb' },
        plaza: { name: 'Plaza Palermo', barrio: 'Palermo', fill: '#C2185B', accent: '#FFD23F', ink: '#FFF0F6', hours: '24 h', days: 'Todos los días' },
        norte: { name: 'Belgrano Norte', barrio: 'Belgrano', fill: '#1F4FD8', accent: '#FF7A2E', ink: '#EEF3FF', hours: '7 a 23 h', days: 'Todos los días' },
        parque: { name: 'Parque Caballito', barrio: 'Caballito', fill: '#4E6B3D', accent: '#B5532A', ink: '#F8F1E4', hours: '8 a 22 h', days: 'Lun a sáb' },
    };

    // ───────────────────────── LA CRUZ DE CUATRO ─────────────────────────
    // Una cruz de farmacia en 3 × 3 celdas. Cada brazo es de una farmacia y tiene la forma de su marca:
    // arriba Belgrano Norte (punta de flecha del hexágono), a la derecha Farmacia del Centro (el arco),
    // abajo Parque Caballito (la hoja) y a la izquierda Plaza Palermo (la forma blanda). En el medio, FarmaGlass.
    FG.cruz = function (o = {}) {
        const s = o.s || 190, g = o.gap ?? 6, bg = o.bg || '#F6F4EC', S = 3 * s, lbl = o.labels !== false;
        const st = `stroke="${bg}" stroke-width="${g * 2}" stroke-linejoin="round" paint-order="stroke"`;
        const kk = s * 0.0215;
        const n = `<g class="arm arm-n"><path d="M${s} ${s}V${R(.46 * s)}L${R(1.5 * s)} 0L${2 * s} ${R(.46 * s)}V${s}Z" fill="#1F4FD8" ${st}/>` +
            (lbl ? `<text x="${R(1.5 * s)}" y="${R(.76 * s)}" text-anchor="middle" font-family="'Barlow Condensed',Impact,sans-serif" font-style="italic" font-weight="900" font-size="${R(.225 * s)}" letter-spacing="1" fill="#fff">BELGRANO</text>` +
                `<g transform="translate(${R(1.5 * s)} ${R(.84 * s)}) skewX(-14)"><rect x="${R(-.28 * s)}" width="${R(.56 * s)}" height="${R(.045 * s)}" fill="#FF7A2E"/></g>` : '') + '</g>';
        const e = `<g class="arm arm-e"><path d="M${2 * s} ${s}H${R(2.5 * s)}A${R(.5 * s)} ${R(.5 * s)} 0 0 1 ${R(2.5 * s)} ${2 * s}H${2 * s}Z" fill="#14284B" ${st}/>` +
            (lbl ? `<text x="${R(2.47 * s)}" y="${R(1.5 * s + .075 * s)}" text-anchor="middle" font-family="'DM Serif Display',Georgia,serif" font-size="${R(.2 * s)}" fill="#FBF6EA">Recoleta</text>` +
                `<rect x="${R(2.47 * s - .16 * s)}" y="${R(1.5 * s - .14 * s)}" width="${R(.32 * s)}" height="${R(.03 * s)}" fill="#C9A227"/>` : '') + '</g>';
        const r = R(.72 * s);
        const so = `<g class="arm arm-s"><path d="M${s} ${2 * s}H${2 * s}V${3 * s}H${R(s + r)}A${r} ${r} 0 0 1 ${s} ${R(3 * s - r)}Z" fill="#4E6B3D" ${st}/>` +
            (lbl ? `<text x="${R(1.55 * s)}" y="${R(2.5 * s + .06 * s)}" text-anchor="middle" font-family="Fredoka,Verdana,sans-serif" font-weight="700" font-size="${R(.17 * s)}" fill="#F8F1E4">Caballito</text>` +
                `<circle cx="${R(1.55 * s)}" cy="${R(2.5 * s - .12 * s)}" r="${R(.035 * s)}" fill="#B5532A"/>` : '') + '</g>';
        const k = R(.42 * s);
        const w = `<g class="arm arm-w"><path d="M${s} ${s}H${k}A${k} ${k} 0 0 0 0 ${R(s + k)}V${R(2 * s - k)}A${k} ${k} 0 0 0 ${k} ${2 * s}H${s}Z" fill="#C2185B" ${st}/>` +
            (lbl ? `<text x="${R(.52 * s)}" y="${R(1.5 * s + .05 * s)}" text-anchor="middle" font-family="Unbounded,'Arial Black',sans-serif" font-weight="900" font-size="${R(.125 * s)}" fill="#FFD23F">PALERMO</text>` : '') + '</g>';
        const hub = `<g class="hub"><rect x="${s}" y="${s}" width="${s}" height="${s}" rx="${R(.16 * s)}" fill="#0A3D2E" stroke="${bg}" stroke-width="${g * 2}" stroke-linejoin="round" paint-order="stroke"/>` +
            `<circle cx="${R(1.5 * s)}" cy="${R(1.5 * s)}" r="${R(.36 * s)}" fill="none" stroke="#B8F04A" stroke-width="${R(.018 * s)}" stroke-dasharray="${R(.035 * s)} ${R(.06 * s)}" stroke-linecap="round" opacity=".8"/>` +
            `<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" transform="translate(${R(1.5 * s - 12 * kk)} ${R(1.5 * s - 12 * kk)}) scale(${R(kk)})" fill="#B8F04A"/></g>`;
        return `<svg class="cruz" viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cruz de farmacia formada por las cuatro farmacias de la comunidad">${n}${e}${so}${w}${hub}</svg>`;
    };

    // ───────────────────────── LAS FACHADAS ─────────────────────────
    // 468 × 372. Cada una trae: pared y cartel, vidrios apagados, vidrios prendidos (con la vidriera por dentro),
    // marcos, persiana, una capa oscura para cuando está cerrada y la etiqueta ABIERTA / CERRADA.
    function persiana(id) {
        let slats = '';
        for (let y = 160; y < 336; y += 11) slats += `<rect x="24" y="${y}" width="420" height="9" fill="#b6bec3"/><rect x="24" y="${y + 9}" width="420" height="2" fill="#7b848a"/>`;
        return `<clipPath id="cp-${id}"><rect x="20" y="158" width="428" height="182"/></clipPath>` +
            `<g clip-path="url(#cp-${id})"><g class="fx-shutter">${slats}<rect x="24" y="326" width="420" height="10" rx="2" fill="#5d666c"/><rect x="222" y="313" width="24" height="9" rx="4.5" fill="#3d4449"/></g></g>`;
    }
    const etiqueta = `<g class="fx-tag" transform="translate(328 88)">` +
        `<g class="tag-open"><rect width="124" height="32" rx="16" fill="#139A6B"/><circle cx="19" cy="16" r="5" fill="#B8F04A"/><text x="75" y="21.5" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="15" letter-spacing="1.6" fill="#fff">ABIERTA</text></g>` +
        `<g class="tag-closed"><rect width="124" height="32" rx="16" fill="#C4302B"/><text x="62" y="21.5" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="15" letter-spacing="1.6" fill="#fff">CERRADA</text></g></g>`;

    const FACHADAS = {
        // Botica clásica: azul noche, latón, toldo a rayas y frascos en la vidriera
        centro() {
            const jars = (y, xs) => xs.map((x, i) => {
                const c = ['#C97B2A', '#4E8A5E', '#3E6DB5', '#F1E6CB', '#9B2335', '#C9A227'][i % 6];
                return i % 2 ? `<rect x="${x}" y="${y - 28}" width="18" height="28" rx="4" fill="${c}"/><rect x="${x + 3}" y="${y - 33}" width="12" height="6" rx="2" fill="#8F5F38"/>`
                    : `<circle cx="${x + 9}" cy="${y - 14}" r="14" fill="${c}"/><rect x="${x + 2}" y="${y - 33}" width="14" height="6" rx="2" fill="#8F5F38"/>`;
            }).join('');
            let awning = ''; const nn = 9, w = 436 / nn;
            for (let i = 0; i < nn; i++) { const x0 = R(16 + i * w), x1 = R(x0 + w); awning += `<path d="M${x0} 100H${x1}V142A${R(w / 2)} 11 0 0 1 ${x0} 142Z" fill="${i % 2 ? '#9B2335' : '#FBF6EA'}"/>`; }
            return {
                defs: `<linearGradient id="brass-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9CF72"/><stop offset=".55" stop-color="#C9A227"/><stop offset="1" stop-color="#9C7A16"/></linearGradient>` +
                    `<linearGradient id="gl-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF0C4"/><stop offset="1" stop-color="#FFC962"/></linearGradient>` +
                    `<linearGradient id="sh-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`,
                wall: `<rect width="468" height="336" fill="#14284B"/><rect width="14" height="336" fill="#1E3A6B"/><rect x="454" width="14" height="336" fill="#1E3A6B"/><rect width="468" height="8" fill="#0E1E3A"/>` +
                    `<rect y="336" width="468" height="36" fill="#B9B093"/><path d="M0 354H468M78 336V354M156 354V372M234 336V354M312 354V372M390 336V354" stroke="#9f967b" stroke-width="2"/>` +
                    `<rect x="16" y="14" width="436" height="86" rx="8" fill="url(#brass-c)"/><rect x="22" y="20" width="424" height="74" rx="5" fill="none" stroke="#14284B" stroke-width="2.5"/>` +
                    `<use href="#m-centro" x="30" y="26" width="62" height="62"/>` +
                    `<text x="102" y="62" font-family="'DM Serif Display',Georgia,serif" font-size="34" fill="#14284B">Farmacia del Centro</text>` +
                    `<text x="104" y="84" font-family="Inter,sans-serif" font-weight="700" font-size="12" letter-spacing="2.6" fill="#7A5C12">BOTICA · DESDE 1962</text>` +
                    awning + `<rect x="16" y="148" width="436" height="16" fill="url(#sh-c)"/>` +
                    `<path d="M290 336V234A69 62 0 0 1 428 234V336Z" fill="#6E4529"/>`,
                off: `<rect x="38" y="178" width="206" height="150" fill="#0E1822"/><path d="M302 304V236A57 50 0 0 1 416 236V304Z" fill="#0E1822"/>`,
                on: `<rect x="38" y="178" width="206" height="150" fill="url(#gl-c)"/>` +
                    `<path d="M38 224H244M38 268H244M38 312H244" stroke="#8F5F38" stroke-width="5"/>` +
                    jars(224, [50, 78, 106, 134, 162, 190, 216]) + jars(268, [56, 84, 112, 140, 168, 196, 220]) + jars(312, [48, 76, 104, 132, 160, 188, 216]) +
                    `<path d="M302 304V236A57 50 0 0 1 416 236V304Z" fill="url(#gl-c)"/><path d="M359 186V304M302 246H416" stroke="#6E4529" stroke-width="4" opacity=".7"/>`,
                trim: `<rect x="33" y="173" width="216" height="160" fill="none" stroke="#6E4529" stroke-width="10"/><rect x="38" y="178" width="206" height="150" fill="none" stroke="#C9A227" stroke-width="2"/><rect x="138" y="178" width="6" height="150" fill="#6E4529"/>` +
                    `<path d="M302 304V236A57 50 0 0 1 416 236V304Z" fill="none" stroke="#C9A227" stroke-width="3"/><rect x="302" y="304" width="114" height="26" fill="#5a3820"/><circle cx="406" cy="320" r="6" fill="#E9CF72"/>`,
            };
        },
        // Farmacia 24 h: noche, neón rosa y celeste, polaroids pegadas en la vidriera
        plaza() {
            let bulbs = '', dots = '';
            for (let i = 0; i < 16; i++) { const t = i / 15, x = R(30 + 408 * t), y = R(124 + 22 * 4 * t * (1 - t)); dots += `<circle cx="${x}" cy="${y}" r="5" fill="${i % 2 ? '#FFD23F' : '#5CF2E6'}"/>`; }
            bulbs = `<path d="M30 124Q234 168 438 124" fill="none" stroke="#FF5FA2" stroke-width="2" opacity=".55"/>` + dots;
            const pola = (x, y, r, c) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect width="54" height="66" fill="#fff"/><rect x="5" y="5" width="44" height="44" fill="${c}"/></g>`;
            return {
                defs: `<filter id="neon-p" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
                    `<radialGradient id="wg-p" cx=".15" cy=".1" r="1"><stop offset="0" stop-color="#C2185B" stop-opacity=".55"/><stop offset="1" stop-color="#C2185B" stop-opacity="0"/></radialGradient>` +
                    `<linearGradient id="gl-p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE3F1"/><stop offset="1" stop-color="#FF8FC2"/></linearGradient>`,
                wall: `<rect width="468" height="336" fill="#2B1240"/><rect width="468" height="336" fill="url(#wg-p)"/>` +
                    `<rect y="336" width="468" height="36" fill="#1B0B2A"/><rect y="336" width="468" height="3" fill="#FF5FA2" opacity=".6"/>` +
                    `<rect x="16" y="14" width="436" height="86" rx="16" fill="#14071F" stroke="#FF5FA2" stroke-width="3.5" filter="url(#neon-p)"/>` +
                    `<use href="#m-plaza" x="28" y="26" width="62" height="62"/>` +
                    `<text x="106" y="60" font-family="Unbounded,'Arial Black',sans-serif" font-weight="900" font-size="28" fill="#FFE4F0" filter="url(#neon-p)">PLAZA PALERMO</text>` +
                    `<text x="108" y="84" font-family="'Space Mono',monospace" font-weight="700" font-size="14" letter-spacing="3" fill="#FFD23F">PLAZA LAB · 24 H</text>` +
                    `<path d="M16 112H452" stroke="#FF5FA2" stroke-width="5" stroke-linecap="round" filter="url(#neon-p)"/>` + bulbs,
                off: `<rect x="38" y="178" width="206" height="150" fill="#170A25"/><rect x="288" y="176" width="142" height="156" fill="#170A25"/>`,
                on: `<rect x="38" y="178" width="206" height="150" fill="url(#gl-p)"/>` +
                    `<text x="141" y="214" text-anchor="middle" font-family="Unbounded,sans-serif" font-weight="900" font-size="21" fill="#C2185B">ABIERTO</text>` +
                    pola(54, 236, -8, '#FFB8D9') + pola(114, 232, 3, '#B79CFF') + pola(176, 238, 9, '#5CF2E6') +
                    `<rect x="288" y="176" width="142" height="156" fill="url(#gl-p)"/><path d="M359 176V332" stroke="#C2185B" stroke-width="3" opacity=".5"/>` +
                    `<circle cx="324" cy="214" r="17" fill="#FFF3C4"/><circle cx="318" cy="208" r="4" fill="#E6D6A0"/>`,
                trim: `<rect x="32" y="172" width="218" height="162" rx="10" fill="none" stroke="#5CF2E6" stroke-width="3.5" filter="url(#neon-p)"/>` +
                    `<rect x="286" y="174" width="146" height="160" rx="10" fill="none" stroke="#FFD23F" stroke-width="6"/><rect x="408" y="236" width="6" height="52" rx="3" fill="#fff"/>`,
            };
        },
        // Club de entrenamiento: cobalto con rayas, toldo naranja inclinado y marcador LED
        norte() {
            let stripes = '';
            for (let i = 0; i < 9; i++) { const x = 24 + i * 50; stripes += `<path d="M${x} 104H${x + 24}L${x + 12} 150H${x - 12}Z" fill="#fff" opacity=".22"/>`; }
            let dots = '';
            return {
                defs: `<pattern id="pt-n" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(-62)"><rect width="22" height="44" fill="#fff" opacity=".07"/></pattern>` +
                    `<pattern id="led-n" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="#FF7A2E" opacity=".25"/></pattern>` +
                    `<filter id="glow-n" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
                    `<linearGradient id="gl-n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F6FF"/><stop offset="1" stop-color="#B9CEFF"/></linearGradient>`,
                wall: `<rect width="468" height="336" fill="#1F4FD8"/><rect width="468" height="336" fill="url(#pt-n)"/>` +
                    `<rect y="336" width="468" height="36" fill="#7585B5"/><path d="M0 354H468" stroke="#5f6f9f" stroke-width="2"/>` +
                    `<rect x="16" y="14" width="436" height="86" rx="4" fill="#0B1B3F"/><use href="#m-norte" x="28" y="26" width="62" height="62"/>` +
                    `<text x="104" y="64" font-family="'Barlow Condensed',Impact,sans-serif" font-style="italic" font-weight="900" font-size="52" fill="#fff">BELGRANO NORTE</text>` +
                    `<path d="M106 72H236L228 92H98Z" fill="#FF7A2E"/><text x="166" y="88" text-anchor="middle" font-family="'Barlow Condensed',sans-serif" font-style="italic" font-weight="800" font-size="16" letter-spacing="1.5" fill="#0B1B3F">TRAINING CLUB</text>` +
                    `<path d="M16 104H452L440 150H28Z" fill="#FF7A2E"/>` + stripes + `<path d="M28 150H440L441 160H27Z" fill="#000" opacity=".22"/>`,
                off: `<rect x="38" y="178" width="206" height="150" fill="#060B1A"/><rect x="288" y="176" width="142" height="156" fill="#0B1428"/>`,
                on: `<rect x="38" y="178" width="206" height="150" fill="#060B1A"/><rect x="38" y="178" width="206" height="150" fill="url(#led-n)"/>` +
                    `<text x="52" y="206" font-family="'Barlow Condensed',sans-serif" font-weight="700" font-size="17" letter-spacing="3" fill="#8EA0C9">HORARIO</text>` +
                    `<text x="141" y="282" text-anchor="middle" font-family="'Barlow Condensed',sans-serif" font-weight="800" font-size="84" letter-spacing="2" fill="#FF7A2E" filter="url(#glow-n)">07–23</text>` +
                    `<text x="52" y="316" font-family="'Barlow Condensed',sans-serif" font-weight="700" font-size="17" letter-spacing="3" fill="#6BF59A">TODOS LOS DÍAS</text>` +
                    `<rect x="288" y="176" width="142" height="156" fill="url(#gl-n)"/><path d="M359 176V332" stroke="#1F4FD8" stroke-width="3" opacity=".5"/>`,
                trim: `<rect x="34" y="174" width="214" height="158" fill="none" stroke="#0B1B3F" stroke-width="8"/>` +
                    `<rect x="286" y="174" width="146" height="160" fill="none" stroke="#FF7A2E" stroke-width="7"/><rect x="334" y="232" width="8" height="58" rx="4" fill="#fff"/><rect x="376" y="232" width="8" height="58" rx="4" fill="#fff"/>`,
            };
        },
        // Un día en el parque: verde salvia, toldo terracota, barrilete en la vidriera y macetas
        parque() {
            let awning = ''; const nn = 9, w = 436 / nn;
            for (let i = 0; i < nn; i++) { const x0 = R(16 + i * w), x1 = R(x0 + w); awning += `<path d="M${x0} 100H${x1}V142A${R(w / 2)} 12 0 0 1 ${x0} 142Z" fill="${i % 2 ? '#F8F1E4' : '#B5532A'}"/>`; }
            let lines = ''; for (let y = 16; y < 336; y += 18) lines += `M0 ${y}H468`;
            const planta = (x, y) => `<rect x="${x - 17}" y="${y - 24}" width="34" height="24" rx="3" fill="#B5532A"/><path d="M${x} ${y - 24}C${x - 26} ${y - 44} ${x - 24} ${y - 66} ${x - 10} ${y - 70}C${x - 4} ${y - 52} ${x - 2} ${y - 40} ${x} ${y - 24}Z M${x} ${y - 24}C${x + 24} ${y - 40} ${x + 28} ${y - 62} ${x + 14} ${y - 70}C${x + 6} ${y - 54} ${x + 2} ${y - 40} ${x} ${y - 24}Z" fill="#7BA864"/>`;
            return {
                defs: `<linearGradient id="gl-k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6D2"/><stop offset="1" stop-color="#FFD98A"/></linearGradient>` +
                    `<linearGradient id="sh-k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`,
                wall: `<rect width="468" height="336" fill="#4E6B3D"/><path d="${lines}" stroke="#000" stroke-opacity=".1" stroke-width="2"/>` +
                    `<rect y="336" width="468" height="36" fill="#A9C98E"/><g fill="#F7C9A8"><circle cx="40" cy="356" r="4"/><circle cx="120" cy="352" r="3.5"/><circle cx="214" cy="358" r="4"/><circle cx="330" cy="354" r="3.5"/><circle cx="420" cy="357" r="4"/></g>` +
                    `<rect x="16" y="14" width="436" height="86" rx="20" fill="#F8F1E4" stroke="#B5532A" stroke-width="3" stroke-dasharray="9 7"/><use href="#m-parque" x="30" y="26" width="62" height="62"/>` +
                    `<text x="106" y="66" font-family="Caveat,cursive" font-weight="700" font-size="56" fill="#B5532A">Parque Caballito</text>` +
                    `<text x="108" y="88" font-family="Fredoka,sans-serif" font-weight="500" font-size="13" letter-spacing="1.5" fill="#4E6B3D">UN DÍA EN EL PARQUE</text>` +
                    awning + `<rect x="16" y="148" width="436" height="16" fill="url(#sh-k)"/>` +
                    `<path d="M286 336V232Q286 172 346 172H432V336Z" fill="#B5532A"/>`,
                off: `<rect x="38" y="178" width="206" height="150" rx="22" fill="#14201A"/><circle cx="352" cy="232" r="26" fill="#14201A"/>`,
                on: `<rect x="38" y="178" width="206" height="150" rx="22" fill="url(#gl-k)"/>` +
                    `<path d="M141 188V222" stroke="#8a6a3a" stroke-width="2"/><path d="M141 222L163 246L141 276L119 246Z" fill="#B5532A"/><path d="M141 222V276M119 246H163" stroke="#FFF4E6" stroke-width="2"/>` +
                    `<path d="M141 276C128 292 154 300 141 314" stroke="#4E6B3D" stroke-width="2.5" fill="none"/><path d="M134 292l12 4M135 306l12-4" stroke="#F7C9A8" stroke-width="5" stroke-linecap="round"/>` +
                    `<g fill="#7BA864"><circle cx="64" cy="310" r="16"/><circle cx="84" cy="300" r="12"/></g><g fill="#F6C760"><circle cx="210" cy="292" r="14"/></g><path d="M44 198H238" stroke="#4E6B3D" stroke-width="2" opacity=".5"/>` +
                    `<circle cx="352" cy="232" r="26" fill="url(#gl-k)"/>`,
                trim: `<rect x="33" y="173" width="216" height="160" rx="26" fill="none" stroke="#F8F1E4" stroke-width="10"/>` +
                    `<circle cx="352" cy="232" r="26" fill="none" stroke="#F8F1E4" stroke-width="5"/><circle cx="414" cy="290" r="7" fill="#F8F1E4"/>` + planta(262, 336) + planta(446, 336),
            };
        },
    };

    FG.fachada = function (id) {
        const b = FACHADAS[id]();
        return `<svg class="fx fx-${id}" viewBox="0 0 468 372" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fachada de ${FG.P[id].name}">` +
            `<defs>${b.defs}</defs>${b.wall}<g class="fx-glass-off">${b.off}</g><g class="fx-glass-on">${b.on}</g>${b.trim}${persiana(id)}` +
            `<rect class="fx-dim" width="468" height="372" fill="#050913"/>${etiqueta}</svg>`;
    };
    FG.setFachada = function (el, open) { el.style.setProperty('--open', String(R(open))); };

    // ───────────────────────── BANDERINES ─────────────────────────
    FG.banderines = function (o = {}) {
        const W = o.w ?? 1140, sag = o.sag ?? 46, n = o.n ?? 15, size = o.size ?? 54, H = R(sag + size * 1.5 + 14);
        const cols = ['#14284B', '#C9A227', '#C2185B', '#FFD23F', '#1F4FD8', '#FF7A2E', '#4E6B3D', '#B5532A'];
        const P = t => ({ x: W * t, y: 6 + 4 * sag * t * (1 - t) });
        let flags = '';
        for (let i = 1; i <= n; i++) {
            const t = i / (n + 1), p = P(t), dx = W, dy = 4 * sag * (1 - 2 * t), L = Math.hypot(dx, dy), tx = dx / L, ty = dy / L, nx = -ty, ny = tx;
            const a = [p.x - tx * size * .42, p.y - ty * size * .42], b = [p.x + tx * size * .42, p.y + ty * size * .42], c = [p.x + nx * size * 1.05, p.y + ny * size * 1.05];
            flags += `<path class="bf" data-i="${i}" d="M${R(a[0])} ${R(a[1])}L${R(b[0])} ${R(b[1])}L${R(c[0])} ${R(c[1])}Z" fill="${cols[(i - 1) % cols.length]}"/>`;
        }
        return `<svg class="banderines" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
            `<path class="bs" d="M0 6Q${W / 2} ${6 + 2 * sag} ${W} 6" fill="none" stroke="${o.string || '#F6F4EC'}" stroke-width="3" stroke-opacity=".85"/>${flags}</svg>`;
    };

    // ───────────────────────── LA MOTO DE ENTREGA ─────────────────────────
    FG.moto = function () {
        const rueda = (x) => `<circle cx="${x}" cy="116" r="22" fill="#1a1f24"/><circle cx="${x}" cy="116" r="10" fill="#cfd6da"/><circle cx="${x}" cy="116" r="3.5" fill="#6d777d"/>`;
        return `<svg class="moto" width="240" height="150" viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
            `<polygon class="faro" points="204,50 246,36 246,72 204,60" fill="#FFE680" opacity=".35"/>` +
            rueda(56) + rueda(188) +
            `<path d="M28 116A28 28 0 0 1 84 116" fill="none" stroke="#0A3D2E" stroke-width="6" stroke-linecap="round"/>` +
            `<path d="M58 114L64 86Q66 76 80 76H148Q160 76 166 88L182 114Z" fill="#139A6B"/><path d="M58 114H182" stroke="#0A3D2E" stroke-width="6" stroke-linecap="round"/>` +
            `<path d="M160 80L172 46H186V52L178 84Z" fill="#0A3D2E"/><path d="M176 44H204" stroke="#0A3D2E" stroke-width="7" stroke-linecap="round"/><circle cx="198" cy="56" r="7" fill="#FFE680"/>` +
            `<rect x="86" y="68" width="60" height="12" rx="6" fill="#0A3D2E"/>` +
            `<rect x="4" y="34" width="78" height="60" rx="10" fill="#139A6B"/><rect x="4" y="34" width="78" height="14" rx="7" fill="#5FE0A8"/><path d="M36 54h12v10h10v12H48v10H36V76H26V64h10z" fill="#fff"/>` +
            `<rect x="108" y="22" width="30" height="50" rx="14" fill="#FFD23F"/><circle cx="126" cy="12" r="13" fill="#F2C29B"/><path d="M112 12a14 14 0 0 1 28 0z" fill="#B8F04A"/>` +
            `<path d="M134 40L176 45" stroke="#FFD23F" stroke-width="9" stroke-linecap="round"/><path d="M120 72L148 92L136 108" fill="none" stroke="#1c3a5a" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    };
})();
