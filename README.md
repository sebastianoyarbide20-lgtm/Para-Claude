# FarmaGlass · prototipo

Farmacia online de prototipo: una web principal y una página propia para cada farmacia de la red.
Todo es HTML, CSS y JavaScript sin dependencias. Para verla, abrí `farmacia_v2.html` en el navegador.

## Páginas

| Archivo | Qué es |
| --- | --- |
| `farmacia_v2.html` | Web principal: catálogo, ofertas, farmacias de la red, recetas y ayuda |
| `farmacia-centro.html` · `farmacia-plaza.html` · `farmacia-norte.html` · `farmacia-parque.html` | Página de cada farmacia, con su estilo, su línea propia y los productos reales que despacha |
| `fg-shop.js` | Carrito, checkout, pedidos, favoritos, cupones y "Mi cuenta", compartidos por todas las páginas |
| `farmacias-red.js` | Datos y utilidades de las páginas de farmacia |
| `productos-reales.js` | 58 productos reales de farmacia y cosmética con precio, oferta e imagen: 34 del catálogo y 24 de las líneas de cada farmacia |
| `scripts/actualizar-productos.js` | Actualiza precios e imágenes de esos productos |

## Las farmacias de la red

Cada farmacia tiene una página que es su propio mundo, con estructura, tipografía e interacciones distintas,
y un banner propio en la portada de la web principal:

| Farmacia | Concepto | Lo que tiene la página |
| --- | --- | --- |
| Farmacia del Centro | "La Gaceta de la Botica": un diario de 1962 | Cabecera con fecha y edición, nota principal con letra capital y sello de precio, cajonera de madera con plaquitas de bronce, vitrina con estantes y etiquetas colgantes, consultorio de cartas y horario de época |
| Plaza Palermo | "After Hours": la noche de una farmacia 24 h | Reloj en vivo, deslizador "¿A qué hora lo necesitás?" que muestra qué farmacias de la red están abiertas, rutina de noche en 2 preguntas, cartas holográficas, collage de polaroids y cartel de neón |
| Belgrano Norte | "Training Club": una app de entrenamiento | Marcador LED, armador de kit por deporte, fichas técnicas, calculadora de hidratación orientativa y el plan en una pista de atletismo |
| Parque Caballito | "Un día en el parque": un libro ilustrado | Escena con barrilete y picnic, selector con dibujos, tendedero de marcas, mochila para el parque con checklist y notas del farmacéutico |

## Funciones

- **Carrito real** compartido entre páginas: cantidades, quitar con "Deshacer", guardar para después,
  productos agrupados por farmacia, barra de envío gratis y sugerencias para llegar al mínimo.
- **Cupones**: `NUEVO20` (20 % en la primera compra) y `FARMA10`.
- **Checkout** en un paso: envío a domicilio con franja horaria o retiro en farmacia, datos de contacto,
  medio de pago y confirmación con número de pedido y seguimiento.
- **Mi cuenta**: pedidos con estado, "Volver a pedir", favoritos y recetas.
- **Buscador con sugerencias** de productos, categorías y farmacias, búsquedas recientes y atajo `/`.
- **Catálogo**: orden por precio, descuento o valoración; filtros de envío gratis, farmacia más cercana y favoritos.
- **Producto**: favorito, compartir, cuotas, productos relacionados y enlace directo (`#producto-4`).
- **Dirección**: escrita o con "Usar mi ubicación actual"; muestra la farmacia más cercana y si está abierta.
- **Recetas**: carga de foto o PDF con obra social; queda "En revisión" en Mi cuenta.
- **Botón de arrepentimiento** con código de trámite, preguntas frecuentes y "Volver arriba".

## Productos reales

Los productos de `productos-reales.js` salen del catálogo público de Farmacity. Como es una tienda hecha
con VTEX, responde a `https://www.farmacity.com/api/catalog_system/pub/products/search?ft=<búsqueda>`
con nombre, marca, imagen, precio de lista, precio final y stock. Farmacias del Pueblo
(`farmaciasdelpueblo.com.ar`) y Farmaonline (`farmaonline.com`) usan la misma API y sirven como alternativa.

- Son productos de venta libre que no son medicamentos: dermocosmética, cuidado personal y capilar,
  bebés, suplementos dietarios y botiquín. Los medicamentos no se venden directo en el carrito.
- Los nombres se ordenaron como "Marca producto (tamaño)" y las descripciones están escritas para el
  prototipo. Las imágenes se cargan desde el CDN de la tienda y pertenecen a sus marcas.
- Las valoraciones con estrellas de los 10 productos originales son ilustrativas; los productos reales
  muestran solo la marca.
- Cada producto tiene asignada la farmacia de la red que lo despacha (`pharmacy`) y aparece también en
  la página de esa farmacia, con su estilo: vitrina en Centro, "Marcas que amamos" en Plaza,
  "Marcas para tu rutina" en Norte y "Marcas que elegimos para la familia" en Parque.
- La línea propia de cada farmacia (ids 101–124) también usa productos reales del mismo tipo, en lugar de los
  productos dibujados del principio. Los dibujos quedan solo como respaldo si no carga `productos-reales.js`.
- Para actualizar precios e imágenes (Node 18 o superior): `node scripts/actualizar-productos.js`.

Prototipo: no hay servidor. Los datos se guardan solo en el navegador (`localStorage`) y no se cobra nada.

## Tienda en Shopify

La web principal también está en la tienda de Shopify, como portada del tema **FarmaGlass (web principal)**,
que es una copia de Horizon sin publicar. Los archivos están en `shopify/tema/`, con la misma estructura que un tema:

| Archivo | Qué es |
| --- | --- |
| `templates/index.json` | La portada: usa el layout y la sección de FarmaGlass |
| `layout/farmaglass.liquid` | El `<head>` de la web, sin el encabezado ni el pie de Horizon |
| `sections/farmaglass-home.liquid` | El HTML de `farmacia_v2.html`, con los formularios de la tienda |
| `snippets/farmaglass-datos.liquid` | Pasa a la página los productos, el cliente y sus pedidos |
| `assets/farmaglass.css` | Los estilos de la web, con unos pocos agregados al final |
| `assets/farmaglass-home.js` | El script de la web, con los datos de la tienda |
| `assets/fg-shop.js` | El carrito, los cupones y "Mi cuenta", conectados a Shopify |

Qué cambia respecto de la web:

- **Productos**: salen de la tienda (los 68 productos, con precio, precio de lista, stock e imagen).
  Cada uno se reconoce por el número de su SKU (`FG-12` es el 12) y sus etiquetas dicen la categoría (`cat-*`),
  la farmacia que lo despacha (`farmacia-*`), si va en las ofertas del día (`flash`), si es de la línea propia
  (`linea-propia`) y su sello (`badge:2x1`). Un producto nuevo aparece en la portada si tiene SKU `FG-<número>`.
- **Carrito y cupones**: son el carrito de Shopify (API Ajax) y los códigos `NUEVO20` y `FARMA10` de la tienda.
  "Iniciar compra" lleva al pago de Shopify, donde se eligen la entrega y el medio de pago.
- **Mi cuenta**: los pedidos son los de la cuenta del cliente, con su estado y el enlace al seguimiento.
- **Recetas y botón de arrepentimiento**: llegan al email de la tienda por el formulario de contacto, con un código.
  La foto de la receta no viaja con el formulario: si el farmacéutico la necesita, se la pide al cliente por email.
- **Newsletter**: da de alta al cliente como suscriptor, con la etiqueta `newsletter`.
- **Páginas de farmacia**: son sus colecciones en la tienda. Las demás páginas de la tienda usan el diseño de Horizon.
- **Sin valoraciones**: la tienda no tiene reseñas, así que no se muestran estrellas.

Para actualizar el tema se suben los archivos de `shopify/tema/` al tema, por ejemplo con Shopify CLI:
`shopify theme push --path shopify/tema --theme <id del tema> --nodelete`. Para usarlo, se publica desde
Tienda online → Temas.
