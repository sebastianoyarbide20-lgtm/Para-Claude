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
