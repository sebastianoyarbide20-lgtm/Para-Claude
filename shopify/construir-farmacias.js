// FarmaGlass · genera las páginas de farmacia del tema de Shopify a partir del prototipo.
// Lee farmacia-<id>.html y escribe en shopify/tema/:
//   assets/farmacia-<id>.css · assets/farmacia-<id>.js · sections/farmacia-<id>.liquid
//   templates/collection.farmacia-<id>.json · layout/farmacia.liquid · assets/farmacias-red.js
// Uso: node shopify/construir-farmacias.js   (después de cambiar una página de farmacia)
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const THEME = path.join(__dirname, 'tema');
const IDS = { centro: 'Farmacia del Centro', plaza: 'Farmacia Plaza Palermo', norte: 'Farmacia Belgrano Norte', parque: 'Farmacia Parque Caballito' };
const write = (file, body) => { fs.mkdirSync(path.dirname(path.join(THEME, file)), { recursive: true }); fs.writeFileSync(path.join(THEME, file), body); };
const between = (s, a, b, from = 0) => {
    const i = s.indexOf(a, from), j = s.indexOf(b, i + a.length);
    if (i < 0 || j < 0) throw new Error(`no encontré ${a} … ${b}`);
    return s.slice(i + a.length, j);
};
const dedent = (s, n) => s.replace(new RegExp(`^ {${n}}`, 'gm'), '').replace(/^\n/, '').replace(/\s*$/, '\n');
const notice = id => `Generado por shopify/construir-farmacias.js a partir de farmacia-${id}.html: no editar a mano.`;
const PROTOTYPE = /\s*·\s*Prototipo: datos ilustrativos/g;

const heads = {};
for (const [id, name] of Object.entries(IDS)) {
    const html = fs.readFileSync(path.join(ROOT, `farmacia-${id}.html`), 'utf8');
    const head = between(html, '<head>', '</head>');
    heads[id] = {
        title: between(head, '<title>', '</title>'),
        description: between(head, '<meta name="description" content="', '"'),
        color: between(head, '<meta name="theme-color" content="', '"'),
        fonts: between(head, '<link href="https://fonts.googleapis.com/css2', '"').replace(/^/, 'https://fonts.googleapis.com/css2'),
    };

    // Estilos de la página, tal cual
    const css = between(html, '<style>', '</style>');
    write(`assets/farmacia-${id}.css`, `/* ${notice(id)} */\n${dedent(css, 8)}`);

    // El cuerpo de la página: enlaces a la web principal → la portada de la tienda
    let markup = between(html, '<body>', '<script src="productos-reales.js"></script>');
    if (/\{\{|\{%/.test(markup)) throw new Error(`farmacia-${id}.html tiene llaves que Liquid interpretaría`);
    markup = markup.replace(/href="farmacia_v2\.html#/g, 'href="{{ routes.root_url }}#').replace(PROTOTYPE, '');
    if (/farmacia_v2\.html|farmacia-\w+\.html/.test(markup)) throw new Error(`farmacia-${id}.html enlaza a una página del prototipo`);
    write(`sections/farmacia-${id}.liquid`, `{%- comment -%}
  ${name} · ${notice(id)}
  Los productos salen de la tienda: snippet farmaglass-datos → farmaglass-productos.js → farmacias-red.js.
{%- endcomment -%}
${dedent(markup, 4)}
{% render 'farmaglass-datos' %}
<script src="{{ 'farmaglass-productos.js' | asset_url }}" defer></script>
<script src="{{ 'fg-shop.js' | asset_url }}" defer></script>
<script src="{{ 'farmacias-red.js' | asset_url }}" defer></script>
<script src="{{ 'farmacia-${id}.js' | asset_url }}" defer></script>

{% schema %}
{
  "name": ${JSON.stringify(name)},
  "tag": "div",
  "class": "fg-farmacia",
  "settings": []
}
{% endschema %}
`);

    // El script de la página, en su propio alcance para no chocar con otros scripts de la tienda
    let js = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
    js = js.replace(PROTOTYPE, '');
    if (/farmacia_v2\.html/.test(js)) throw new Error(`farmacia-${id}.html: el script enlaza a farmacia_v2.html (usá FG.home)`);
    write(`assets/farmacia-${id}.js`, `// ${notice(id)}\n(() => {\n${dedent(js, 8).replace(/^(?=.)/gm, '    ')}})();\n`);

    write(`templates/collection.farmacia-${id}.json`, JSON.stringify({
        layout: 'farmacia',
        sections: { pagina: { type: `farmacia-${id}`, settings: {} } },
        order: ['pagina'],
    }, null, 2) + '\n');
}

// Datos y utilidades de las farmacias: el mismo archivo que usa el prototipo
fs.copyFileSync(path.join(ROOT, 'farmacias-red.js'), path.join(THEME, 'assets/farmacias-red.js'));

// Layout: el <head> de cada página (título, fuentes y color) según la plantilla
const cases = Object.entries(heads).map(([id, h]) => `        {%- when 'farmacia-${id}' -%}
            <title>${h.title}</title>
            <meta name="description" content="${h.description}">
            <meta name="theme-color" content="${h.color}">
            <link href="${h.fonts}" rel="stylesheet">`).join('\n');
write('layout/farmacia.liquid', `<!doctype html>
{%- comment -%}
  FarmaGlass · layout de las páginas de farmacia (templates/collection.farmacia-*.json).
  ${notice('<id>').replace('farmacia-<id>.html', 'las páginas farmacia-*.html')}
{%- endcomment -%}
<html lang="es-AR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    {%- case template.suffix %}
${cases}
        {%- else -%}
            <title>{{ page_title }} · FarmaGlass</title>
    {%- endcase %}
    <link rel="canonical" href="{{ canonical_url }}">
    {%- if template.suffix != blank %}
    {{ template.suffix | append: '.css' | asset_url | stylesheet_tag }}
    {%- endif %}
    {{ content_for_header }}
</head>
<body>
    {{ content_for_layout }}
</body>
</html>
`);
console.log('Listo:', Object.keys(IDS).map(id => `farmacia-${id}`).join(', '));
