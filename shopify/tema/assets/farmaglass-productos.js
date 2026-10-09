// FarmaGlass · en la tienda, arma con los productos de Shopify (snippet farmaglass-datos) las mismas
// listas que productos-reales.js le da al prototipo. Así farmacias-red.js y el script de cada farmacia
// funcionan igual en la web y en la tienda.
//   FG_REAL_PRODUCTS: el catálogo (todo lo que no es de la línea propia de una farmacia)
//   FG_STORE_LINE:    la línea propia de cada farmacia, con el tamaño aparte
(() => {
    const SHOP = window.FG_SHOPIFY || { products: [], root: '/' };
    const PHARMACIES = ['centro', 'plaza', 'norte', 'parque'];
    const tagged = (p, prefix) => p.tags.filter(t => t.startsWith(prefix)).map(t => t.slice(prefix.length));
    const base = p => ({
        id: p.id, brand: p.brand, listPrice: Math.max(p.listPrice, p.price), price: p.price, desc: p.desc, img: p.img,
        pharmacy: PHARMACIES.find(id => p.tags.includes('farmacia-' + id)) || 'centro',
    });
    const products = SHOP.products.slice().sort((a, b) => a.id - b.id);
    window.FG_REAL_PRODUCTS = products.filter(p => !p.tags.includes('linea-propia')).map(p => ({
        ...base(p), name: p.name, cat: p.type || 'Farmacia', categories: tagged(p, 'cat-'), flash: p.tags.includes('flash'), sale: 'Venta libre',
    }));
    window.FG_STORE_LINE = products.filter(p => p.tags.includes('linea-propia')).map(p => {
        const m = p.name.match(/^(.*?)\s*\(([^)]+)\)$/);
        return { ...base(p), name: m ? m[1] : p.name, size: m ? m[2] : '' };
    });
    window.FG_HOME = SHOP.root || '/';
})();
