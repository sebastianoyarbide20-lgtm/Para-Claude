// FarmaGlass · campaña "Temporada de sol": productos, precios y tarjetas compartidas.
// Los precios salen de productos-reales.js (los mismos de la web); si cambian allá, se vuelve a exportar.
(function () {
    const V = (window.V = {});
    const todos = [...(window.FG_REAL_PRODUCTS || []), ...(window.FG_STORE_LINE || [])];
    const porId = id => todos.find(p => p.id === id) || {};

    // clave → id del producto en la web, foto recortada y nombre corto para la pieza
    const LISTA = {
        anthelios: [22, 'parque-22', 'La Roche-Posay Anthelios leche infantil FPS 50+', ''],
        d80: [23, 'dermaglos-80', 'Dermaglós protector solar FPS 80', '90 g'],
        sport: [122, 'norte-122', 'Dermaglós Sport protector solar FPS 50', ''],
        labial: [107, 'plaza-107', 'Acf protector labial FPS 35', ''],
        bruma: [108, 'plaza-108', 'Caviahue bruma facial Hidratermal', ''],
        avene: [18, 'centro-18', 'Avène agua termal', '150 ml'],
        cerave: [12, 'plaza-12', 'CeraVe crema hidratante intensiva', '236 ml'],
        offextra: [43, 'off-extra', 'OFF! Extra Duración repelente aerosol', '170 g'],
        offbebe: [34, 'parque-34', 'OFF! Defense Bebé gel repelente', '100 ml'],
        citronela: [123, 'parque-123', 'Repelente natural en crema con citronela', ''],
    };
    V.p = k => {
        const [id, img, nombre, tam] = LISTA[k], d = porId(id);
        const off = d.listPrice > d.price ? Math.round((1 - d.price / d.listPrice) * 100) : 0;
        return { id, img: 'img/productos/' + img + '.webp', nombre, tam, precio: d.price, lista: d.listPrice, off };
    };
    V.$ = n => '$ ' + Math.round(n).toLocaleString('es-AR');

    // Tarjeta de producto: foto, nombre, precio, precio de lista tachado y descuento
    V.card = (k, cls = '') => {
        const p = V.p(k);
        return `<div class="card ${cls}">
            ${p.off ? `<span class="off">-${p.off}%</span>` : ''}
            <div class="foto"><img src="${p.img}" alt=""></div>
            <p class="nom">${p.nombre}${p.tam ? ` <small>(${p.tam})</small>` : ''}</p>
            <p class="precio">${V.$(p.precio)}${p.off ? `<s>${V.$(p.lista)}</s>` : ''}</p>
        </div>`;
    };
    V.fill = () => document.querySelectorAll('[data-card]').forEach(el => { el.outerHTML = V.card(el.dataset.card, el.className); });
    V.precios = () => document.querySelectorAll('[data-precio]').forEach(el => { el.textContent = V.$(V.p(el.dataset.precio)[el.dataset.campo || 'precio']); });
    V.offs = () => document.querySelectorAll('[data-off]').forEach(el => { el.textContent = '-' + V.p(el.dataset.off).off + '%'; });
    V.init = () => { V.fill(); V.precios(); V.offs(); };
})();
// Fila horizontal de producto (stories): foto, nombre y precio a la derecha
window.V.fila = (k, extra = '') => {
    const p = V.p(k);
    return `<div class="fh">${extra}<div class="foto"><img src="${p.img}" alt=""></div><p class="nom">${p.nombre}${p.tam ? ` <small>(${p.tam})</small>` : ''}</p>
        <p class="pr">${p.off ? `<i>-${p.off}%</i><br>` : ''}${V.$(p.precio)}${p.off ? `<s>${V.$(p.lista)}</s>` : ''}</p></div>`;
};
