// FarmaGlass · datos y utilidades compartidas por las páginas de cada farmacia (prototipo).
// Las farmacias, productos, direcciones y horarios son inventados.
// El carrito, el checkout y los avisos vienen de fg-shop.js, que se carga antes que este archivo.
window.FG = (() => {
    const STORES = {
        centro: {
            name: 'Farmacia del Centro', zone: 'Recoleta', rating: 4.9, line: 'Botica del Centro', short: 'BOTICA', letter: 'C', shape: 'arch',
            tagline: 'Botica tradicional desde 1962', hours: 'Lun a sáb · 8 a 21 h', street: 'Av. Callao 1450, Recoleta', phone: '11 4800-1962',
            colors: { primary: '#14284B', accent: '#C9A227', bg: '#FBF6EA', ink: '#1B2238', sale: '#9B2335' }, labelFont: 'Georgia, serif',
            products: [
                [101, 'Crema de caléndula', '100 g', 6900, 6900, 'jar', 'Crema suave de caléndula para pieles sensibles e irritadas.'],
                [102, 'Agua de rosas', '250 ml', 5400, 4320, 'bottle', 'Tónico facial refrescante de agua de rosas, receta tradicional.'],
                [103, 'Jabón de glicerina y avena', 'x3', 7800, 7800, 'box', 'Jabones de glicerina con avena coloidal, sin perfume.'],
                [104, 'Vaselina sólida', '100 g', 3200, 3200, 'jar', 'Vaselina pura para proteger e hidratar la piel.'],
                [117, 'Alcohol de romero', '250 ml', 4600, 4600, 'bottle', 'Loción de romero para masajes revitalizantes.'],
                [118, 'Talco mentolado', '150 g', 3800, 3400, 'box', 'Talco refrescante para pies y cuerpo.'],
            ],
        },
        plaza: {
            name: 'Farmacia Plaza Palermo', zone: 'Palermo', rating: 4.7, line: 'Plaza Lab', short: 'PLAZA LAB', letter: 'P', shape: 'blob',
            tagline: 'Abierta 24 h en el corazón de Palermo', hours: 'Todos los días · 24 h', street: 'Av. Santa Fe 3720, Palermo', phone: '11 4777-2424',
            colors: { primary: '#C2185B', accent: '#FFD23F', bg: '#FFF0F6', ink: '#2B1240', sale: '#C2185B' }, labelFont: 'Arial Black, sans-serif',
            products: [
                [105, 'Sérum vitamina C', '30 ml', 14900, 11920, 'dropper', 'Sérum antioxidante con vitamina C al 10 % para dar luminosidad.'],
                [106, 'Parches para granitos', 'x24', 5600, 5600, 'box', 'Parches hidrocoloides invisibles para usar de día o de noche.'],
                [107, 'Bálsamo labial FPS 15', '4 g', 3900, 3900, 'tube', 'Bálsamo hidratante con protección solar y aroma a frutilla.'],
                [108, 'Bruma facial hidratante', '120 ml', 8700, 8700, 'bottle', 'Bruma con ácido hialurónico para refrescar el rostro.'],
                [119, 'Mascarilla de noche', '50 ml', 9900, 7920, 'jar', 'Mascarilla en gel para usar mientras dormís.'],
                [120, 'Contorno de ojos frío', '15 ml', 8200, 8200, 'tube', 'Roll-on con cafeína para descongestionar la mirada.'],
            ],
        },
        norte: {
            name: 'Farmacia Belgrano Norte', zone: 'Belgrano', rating: 4.6, line: 'Norte Active', short: 'NORTE', letter: 'N', shape: 'hex',
            tagline: 'Rendimiento y bienestar para tu día', hours: 'Lun a dom · 7 a 23 h', street: 'Av. Cabildo 2300, Belgrano', phone: '11 4788-2300',
            colors: { primary: '#1F4FD8', accent: '#FF7A2E', bg: '#EEF3FF', ink: '#0B1B3F', sale: '#C2410C' }, labelFont: 'Impact, Arial Narrow, sans-serif',
            products: [
                [109, 'Magnesio + B6', '60 comp.', 9800, 8330, 'bottle', 'Suplemento dietario de magnesio con vitamina B6.'],
                [110, 'Sales de rehidratación', '10 sobres', 4500, 4500, 'box', 'Sobres para preparar bebida de rehidratación oral sabor limón.'],
                [111, 'Gel frío de árnica', '120 g', 6200, 5270, 'tube', 'Gel de efecto frío con árnica para después del ejercicio.'],
                [112, 'Colágeno hidrolizado', '300 g', 16500, 16500, 'jar', 'Suplemento dietario de colágeno en polvo, sin sabor.'],
                [121, 'Cinta kinesiológica', '5 m', 7400, 6290, 'box', 'Cinta elástica adhesiva para soporte muscular.'],
                [122, 'Protector solar sport FPS 50', '120 ml', 15800, 15800, 'tube', 'Resistente al agua y al sudor, toque seco.'],
            ],
        },
        parque: {
            name: 'Farmacia Parque Caballito', zone: 'Caballito', rating: 4.8, line: 'Parque Familia', short: 'FAMILIA', letter: 'P', shape: 'leaf',
            tagline: 'Cuidamos a toda la familia, frente al parque', hours: 'Lun a sáb · 8 a 22 h', street: 'Av. Rivadavia 5200, Caballito', phone: '11 4902-5200',
            colors: { primary: '#4E6B3D', accent: '#B5532A', bg: '#F8F1E4', ink: '#2E3326', sale: '#B5532A' }, labelFont: 'Verdana, sans-serif',
            products: [
                [113, 'Shampoo bebé sin lágrimas', '400 ml', 6400, 6400, 'bottle', 'Shampoo suave para bebés, fórmula sin lágrimas.'],
                [114, 'Óleo calcáreo', '500 ml', 7200, 5400, 'bottle', 'Limpia y protege la zona del pañal en cada cambio.'],
                [115, 'Crema para paspaduras', '90 g', 5900, 5900, 'tube', 'Crema con óxido de zinc que forma una barrera protectora.'],
                [116, 'Toallitas húmedas', 'x50', 3600, 3600, 'box', 'Toallitas sin alcohol ni perfume para piel sensible.'],
                [123, 'Repelente familiar en crema', '120 g', 6800, 5780, 'tube', 'Repelente suave, apto para toda la familia.'],
                [124, 'Jabón líquido de avena', '500 ml', 5200, 5200, 'bottle', 'Jabón líquido de pH neutro para manos y cuerpo.'],
            ],
        },
    };

    const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
    const fmt = n => money.format(Math.round(n));
    const off = p => Math.round((1 - p.price / p.list) * 100);
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    // Producto ilustrado (SVG) con los colores de la farmacia
    function packshot(kind, s, label) {
        const c = s.colors;
        const rect = (x, y, w, h, r, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
        const lab = (x, y, w, h) => rect(x, y, w, h, 6, '#fff') +
            `<text x="${x + w / 2}" y="${y + h / 2 - 2}" text-anchor="middle" font-family="${s.labelFont}" font-size="${Math.min(13, w / 6)}" font-weight="700" fill="${c.ink}">${s.short}</text>` +
            `<text x="${x + w / 2}" y="${y + h / 2 + 12}" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="${c.ink}" opacity=".7">${label}</text>`;
        const shine = (x, y, h) => rect(x, y, 7, h, 3.5, '#fff', 'opacity=".28"');
        const shapes = {
            bottle: rect(86, 30, 28, 20, 5, c.ink) + rect(64, 46, 72, 118, 20, c.primary) + lab(70, 86, 60, 44) + shine(70, 54, 90),
            jar: rect(46, 64, 108, 24, 8, c.accent) + rect(50, 84, 100, 80, 18, c.primary) + lab(62, 100, 76, 44) + shine(58, 92, 60),
            box: rect(52, 40, 96, 124, 8, c.primary) + rect(52, 62, 96, 18, 0, c.accent) + lab(62, 96, 76, 44) + shine(58, 46, 110),
            tube: `<g transform="rotate(-16 100 100)">${rect(72, 30, 56, 116, 18, c.primary)}${rect(80, 144, 40, 22, 5, c.ink)}${lab(78, 64, 44, 50)}${shine(78, 38, 96)}</g>`,
            dropper: rect(92, 22, 16, 34, 7, c.ink) + rect(80, 52, 40, 16, 5, c.ink) + rect(66, 66, 68, 98, 18, c.primary) + lab(72, 96, 56, 44) + shine(72, 72, 80),
        };
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><ellipse cx="100" cy="176" rx="54" ry="8" fill="${c.ink}" opacity=".14"/>${shapes[kind]}<circle cx="148" cy="44" r="10" fill="${c.accent}"/></svg>`;
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    const LOGO_SHAPES = {
        arch: 'M6 45V24a18 18 0 0 1 36 0v21z',
        blob: 'M24 3c12 0 21 8 21 20 0 13-9 22-21 22S3 37 3 25C3 12 12 3 24 3z',
        hex: 'M24 2l19 11v22L24 46 5 35V13z',
        leaf: 'M4 44V24C4 12 12 4 24 4h20v20c0 12-8 20-20 20z',
    };
    function logo(s, size, font) {
        return `<svg viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true" style="flex-shrink:0">
            <path d="${LOGO_SHAPES[s.shape]}" fill="${s.colors.primary}"/>
            <circle cx="39" cy="9" r="6" fill="${s.colors.accent}" stroke="${s.colors.bg}" stroke-width="2.5"/>
            <text x="24" y="${s.shape === 'arch' ? 37 : 32}" text-anchor="middle" font-size="22" fill="#fff" style="font-family:${font}">${s.letter}</text></svg>`;
    }

    // Carga la farmacia de la página: sus productos quedan disponibles para los botones data-add
    // y la farmacia queda elegida por defecto para "Retiro en farmacia".
    function store(id) {
        const s = STORES[id];
        s.id = id;
        // Productos reales de la línea (productos-reales.js); si el archivo no está, quedan los dibujados
        const real = (window.FG_STORE_LINE || []).filter(p => p.pharmacy === id);
        s.items = real.length
            ? real.map(p => ({ id: p.id, name: p.name, size: p.size, brand: p.brand, list: p.listPrice, price: p.price, desc: p.desc, img: p.img, real: true }))
            : s.products.map(([pid, name, size, list, price, kind, desc]) => ({ id: pid, name, size, list, price, kind, desc, img: packshot(kind, s, size) }));
        FGShop.register(s.items.map(p => ({ id: p.id, name: p.real ? `${p.name} (${p.size})` : p.name, size: p.real ? '' : p.size, price: p.price, list: p.list, img: p.img, store: id })));
        FGShop.setStore(id);
        return s;
    }

    // Productos reales del catálogo general (productos-reales.js) que despacha esta farmacia.
    // Se separa el tamaño y se quita la marca del nombre para mostrarla aparte.
    function brands(id) {
        const list = (window.FG_REAL_PRODUCTS || []).filter(p => p.pharmacy === id).map(p => {
            const m = p.name.match(/^(.*?)\s*\(([^)]+)\)$/);
            let name = m ? m[1] : p.name;
            if (name.toLowerCase().startsWith(p.brand.toLowerCase() + ' ')) name = name.slice(p.brand.length + 1);
            return { id: p.id, fullName: p.name, name: name.charAt(0).toUpperCase() + name.slice(1), size: m ? m[2] : '',
                brand: p.brand, cat: p.cat, desc: p.desc, list: p.listPrice, price: p.price, img: p.img };
        });
        // Mismo id y nombre que en la web principal: el carrito los reconoce como el mismo producto
        FGShop.register(list.map(p => ({ id: p.id, name: p.fullName, price: p.price, list: p.list, img: p.img, store: id })));
        return list;
    }
    // Las fotos reales vienen del CDN de la tienda; si no cargan, queda el fondo de la tarjeta
    const photo = (p, size) => `<img src="${p.img}" alt="" width="${size}" height="${size}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">`;

    // Abierta o cerrada según el horario y la hora actual
    const status = id => FGShop.openStatus(id);
    const mapsUrl = s => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${s.street}, Buenos Aires`);
    const telUrl = s => 'tel:+54' + s.phone.replace(/\D/g, '');

    return { store, brands, photo, fmt, off, esc, logo, status, mapsUrl, telUrl, toast: FGShop.toast };
})();
