// Campaña "Temporada de sol" · versión genérica: marcas inventadas, envases editados (img/genericos) y sin marca de farmacia.
// Los precios son de referencia y están escritos acá.
(function () {
    const V = (window.V = {});
    // clave → [envase genérico, nombre inventado, tamaño, precio, precio de lista]
    const LISTA = {
        kids: ['solenna', 'Solenna Kids leche protectora FPS 50+', '250 ml', 55994, 93323],
        d80: ['brisa80', 'Brisa Sur protector solar FPS 80', '90 g', 29342, 36678],
        sport: ['brisasport', 'Brisa Sur Sport protector FPS 50', '', 20308, 29012],
        labial: ['labiosol', 'Labiosol protector labial FPS 35', '', 14900, 14900],
        bruma: ['aquaterma', 'Aquaterma bruma facial hidratante', '', 24500, 35000],
        termal: ['termalia', 'Termalia agua termal', '150 ml', 47000, 47000],
        crema: ['velum', 'Velum crema hidratante intensiva', '236 ml', 28538, 47563],
        aerosol: ['nopica', 'NoPica Extra repelente aerosol', '170 g', 9868, 13158],
        bebe: ['nopicabebe', 'NoPica Bebé gel repelente', '100 ml', 14429, 19239],
        citronela: ['verdemonte', 'Verde Monte repelente con citronela', '70 g', 9018, 9018],
    };
    V.p = k => {
        const [img, nombre, tam, precio, lista] = LISTA[k];
        const off = lista > precio ? Math.round((1 - precio / lista) * 100) : 0;
        return { img: 'img/genericos/' + img + '.png', nombre, tam, precio, lista, off };
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
