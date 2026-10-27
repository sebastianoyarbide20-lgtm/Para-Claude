# FarmaGlass · prototipo

Farmacia online de prototipo: una web principal y una página propia para cada farmacia de la red.
Todo es HTML, CSS y JavaScript sin dependencias. Para verla, abrí `farmacia_v2.html` en el navegador.

## Páginas

| Archivo | Qué es |
| --- | --- |
| `farmacia_v2.html` | Web principal: catálogo, ofertas, farmacias de la red, recetas y ayuda |
| `farmacia-centro.html` · `farmacia-plaza.html` · `farmacia-norte.html` · `farmacia-parque.html` | Página de cada farmacia, con su estilo, su línea propia y los productos reales que despacha |
| `fg-shop.js` | Carrito, checkout, pedidos, favoritos, cupones y "Mi cuenta", compartidos por todas las páginas |
| `fg-receta.js` · `fg-receta.css` | La receta de la web principal: la franja de arriba con el envío rápido, el formulario con foto o archivo y "Tu obra social" |
| `farmacias-red.js` | Datos y utilidades de las páginas de farmacia |
| `productos-reales.js` | 58 productos reales de farmacia y cosmética con precio, oferta e imagen: 34 del catálogo y 24 de las líneas de cada farmacia |
| `scripts/actualizar-productos.js` | Actualiza precios e imágenes de esos productos |

## Las farmacias de la red

Cada farmacia tiene una página que es su propio mundo, con estructura, tipografía e interacciones distintas,
y un banner propio en la portada de la web principal:

| Farmacia | Concepto | Lo que tiene la página |
| --- | --- | --- |
| Farmacia del Centro | "La Gaceta de la Botica": un diario de 1962 | Cabecera con fecha y edición, nota principal con letra capital y sello de precio, cajonera de madera con plaquitas de bronce, vitrina con estantes y etiquetas colgantes, fórmulas para recortar (cupones troquelados que suman la fórmula completa), cotizaciones del mostrador (la página de bolsa del diario, ordenable), consultorio de cartas y horario de época |
| Plaza Palermo | "After Hours": la noche de una farmacia 24 h | Reloj en vivo, deslizador "¿A qué hora lo necesitás?" que muestra qué farmacias de la red están abiertas, rutina de noche en 2 preguntas, cartas holográficas, collage de polaroids, diccionario de ingredientes con pestañas de neón que encuentra los productos que los llevan, el ritual de noche con temporizador y cartel de neón |
| Belgrano Norte | "Training Club": una app de entrenamiento | Marcador LED, armador de kit por deporte, fichas técnicas, tabla de rendimiento (precio por comprimido, sobre o 100 g), calculadora de hidratación orientativa, el plan en una pista de atletismo y elongación de 3 minutos con cronómetro LED |
| Parque Caballito | "Un día en el parque": un libro ilustrado | Escena con barrilete y picnic, selector con dibujos, tendedero de marcas, las cuatro estaciones del parque (la escena cambia y arranca por la de hoy), mochila para el parque con checklist, cuánto duran las toallitas y notas del farmacéutico |

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
- **Recetas** (`fg-receta.js`):
  - **Franja de arriba de todo** con el botón "Enviar receta", que despliega un formulario rápido. También se abre
    desde "Receta" en la barra de abajo (celular) y "Enviar receta" en el encabezado (computadora).
  - **Sacar foto o subir archivo**: en el celular, "Sacar foto" abre la cámara del teléfono; en la computadora, la cámara
    web con vista previa, "Repetir" y "Usar esta foto". También se puede subir o arrastrar una foto o un PDF
    (hasta 3 archivos de 10 MB). Las fotos de más de 1,5 MB se achican antes de enviarlas.
  - **Solo el celular, sin email**: la confirmación, el precio y la cobertura llegan por WhatsApp, y así lo avisa
    el formulario y la confirmación.
  - **Obra social y plan**: al elegirlos, se ven los descuentos de ese plan. Sin plan se ven los máximos de la
    obra social ("hasta").
  - **Quedate ingresado / "Tu obra social"**: guarda nombre, celular, obra social, plan y n.º de afiliado en el
    dispositivo. Los formularios se completan solos, la franja saluda con el descuento en medicamentos, y la tarjeta
    muestra todos los descuentos del plan, con "Ver productos" (filtra el catálogo) y "Enviar receta". Los datos se
    editan o se borran con "Salir y olvidar mis datos".
  - **Seguimiento**: la receta queda en Mi cuenta con su código. Los convenios del prototipo son de ejemplo.
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
| `assets/fg-receta.js` · `assets/fg-receta.css` | La receta de la portada (copia de la del prototipo) |
| `assets/fg-receta-tienda.js` | El envío de la receta a la tienda: sube las fotos y manda el aviso por el formulario de contacto |
| `templates/collection.farmacia-*.json` | La página de cada farmacia, asignada a su colección |
| `layout/farmacia.liquid` · `sections/farmacia-*.liquid` · `assets/farmacia-*.css` · `assets/farmacia-*.js` | Las páginas de farmacia del prototipo, generadas con `node shopify/construir-farmacias.js` (que también copia `farmacias-red.js`, `fg-receta.js` y `fg-receta.css`) |
| `assets/farmacias-red.js` · `assets/farmaglass-productos.js` | Las utilidades de las farmacias (copia de las del prototipo) y la capa que les pasa los productos de la tienda |

Qué cambia respecto de la web:

- **Productos**: salen de la tienda (los 68 productos, con precio, precio de lista, stock e imagen).
  Cada uno se reconoce por el número de su SKU (`FG-12` es el 12) y sus etiquetas dicen la categoría (`cat-*`),
  la farmacia que lo despacha (`farmacia-*`), si va en las ofertas del día (`flash`), si es de la línea propia
  (`linea-propia`) y su sello (`badge:2x1`). Un producto nuevo aparece en la portada si tiene SKU `FG-<número>`.
- **Carrito y cupones**: son el carrito de Shopify (API Ajax) y los códigos `NUEVO20` y `FARMA10` de la tienda.
  "Iniciar compra" lleva al pago de Shopify, donde se eligen la entrega y el medio de pago.
- **Mi cuenta**: los pedidos son los de la cuenta del cliente, con su estado y el enlace al seguimiento.
- **Recetas**: llegan al email de la tienda por el formulario de contacto, con el código, el celular, la obra social,
  el plan, la farmacia y los enlaces a las fotos. El cliente no escribe su email: el formulario usa el de su cuenta
  o, si no entró, el de la tienda. Más abajo está cómo funciona.
- **Botón de arrepentimiento**: llega al email de la tienda por el formulario de contacto, con un código.
- **Newsletter**: da de alta al cliente como suscriptor, con la etiqueta `newsletter`.
- **Páginas de farmacia**: cada colección de farmacia usa la plantilla con su mundo (por ejemplo, la colección
  "Farmacia del Centro" usa `collection.farmacia-centro`), con los productos y el carrito de la tienda.
  Se generan a partir de `farmacia-*.html`: después de cambiar una página, se corre
  `node shopify/construir-farmacias.js` y se suben los archivos. Las demás páginas usan el diseño de Horizon.
- **Sin valoraciones**: la tienda no tiene reseñas, así que no se muestran estrellas.

### Recetas en la tienda

- **Las fotos**: la tienda tiene un producto oculto, **Receta para cotizar** (`receta-para-cotizar`). Tiene estado
  "No listado", precio $ 0, no lleva envío ni stock y no aparece en el catálogo. Al enviar, las fotos se suben como
  archivos de una línea de ese producto (`cart/add.js`): Shopify las guarda y devuelve un enlace a cada una. Enseguida
  la línea se quita del carrito. Si el producto no existe o la subida falla, la receta llega igual, con los nombres
  de los archivos y el aviso de pedir la foto por WhatsApp. **No hay que borrar ese producto ni cambiarle el identificador.**
- **El aviso**: el email de la tienda trae, además, un enlace `wa.me` para escribirle al cliente por WhatsApp.
  El WhatsApp con la confirmación, el precio y la cobertura lo manda el equipo de la farmacia. Para automatizarlo,
  hace falta una app de WhatsApp Business.
- **Los convenios**: en el editor del tema, la sección de la portada tiene un bloque **Convenio de obra social** por
  cada obra social y plan. Cada bloque lleva el porcentaje de descuento en medicamentos con receta, dermocosmética,
  cuidado personal, bebés, nutrición y farmacia, más la nota que se muestra debajo de los descuentos.
  Vienen cargados con valores de ejemplo, que hay que reemplazar por los convenios reales.
- **"Tu obra social"**: los datos del cliente quedan guardados en su dispositivo, igual que en el prototipo. Si no
  entró a su cuenta, el apartado le ofrece "Ingresá o creá tu cuenta" para ver sus pedidos en cualquier dispositivo.

Después de cambiar `fg-receta.js`, `fg-receta.css` o una página de farmacia, se corre `node shopify/construir-farmacias.js`.
Para actualizar el tema se suben los archivos de `shopify/tema/` al tema, por ejemplo con Shopify CLI:
`shopify theme push --path shopify/tema --theme <id del tema> --nodelete`. Para usarlo, se publica desde
Tienda online → Temas.

## Publicidad: story de Instagram

En `marketing/instagram-story/` está la story que publicita la web, armada con la misma identidad: el verde de marca,
el titular en Bricolage Grotesque con el acento en cursiva de Instrument Serif, el sol para la acción principal,
el rojo solo para los descuentos y los íconos duotono de la web.

| Archivo | Qué es |
| --- | --- |
| `story.png` | La story fija, en 1080 × 1920 |
| `story.mp4` | La misma story animada (8 s, 30 fps, H.264): entra el titular, el sello, se reparten las tarjetas y aparece el cupón |
| `story.html` | El diseño editable. Abierto en el navegador se ve animado y achicado a la ventana |
| `exportar.js` | Vuelve a generar el PNG y el MP4: `node marketing/instagram-story/exportar.js` (o `--png` para el PNG solo). Necesita Playwright y ffmpeg |
| `guia-instagram.jpg` | Cómo se ve en Instagram y las zonas de arriba y de abajo que tapa la interfaz |

- **El mensaje**: "La farmacia de tu barrio, en 2 horas", con el sello de envío gratis desde $ 15.000, las 4 farmacias de
  la red, tres productos reales en oferta (Nido 3 2x1, CeraVe y La Roche-Posay con 40 % off), la receta por WhatsApp,
  las 3 cuotas y el cupón `NUEVO20`.
- **Zonas seguras**: arriba queda libre la barra del perfil y abajo, la de respuesta. Entre "Tocá el enlace y pedí ahora"
  y la barra de respuesta queda el lugar para el **sticker de enlace** a la tienda, que se agrega al publicar.
- Los precios son los de `productos-reales.js`. Si cambian, se actualizan en `story.html` y se vuelve a exportar.

## Presentación de la plataforma en Instagram

En `marketing/presentacion/` están la story y la publicación que **presentan FarmaGlass sin precios ni productos**:
la estrella es la web, dibujada en un celular con las farmacias de la red, el botón de receta y el seguimiento del pedido.

| Archivo | Qué es |
| --- | --- |
| `story.png` · `story.jpg` | Story de 1080 × 1920: "Tu farmacia de siempre, ahora online." con el celular y cuatro beneficios a los costados (receta por WhatsApp, envío en 2 horas o retiro, 4 farmacias de tu barrio y seguimiento en vivo) |
| `post.png` · `post.jpg` | Publicación de 1080 × 1350 (4:5): "Sin filas. Sin vueltas. Tu farmacia, online." con los 3 pasos (elegí tu farmacia, pedí o mandá tu receta, recibilo en 2 horas) y "Link en la bio" |
| `presentacion.html` | El diseño editable de las dos piezas. Abierto en el navegador las muestra lado a lado |
| `exportar.js` | Vuelve a generar los PNG y los JPG: `node marketing/presentacion/exportar.js`. Necesita Playwright. Los JPG son los que se publican: Instagram, por API, solo acepta JPG |

- La web del celular es una sola plantilla (`#phone-ui`) que se copia en las dos piezas: si cambia la web, se cambia una vez.
- Las dos piezas cierran con "link en la bio", porque al publicar por API (Metricool) no se puede agregar el sticker de enlace a la story.
  El perfil de Instagram tiene que tener el enlace a la web en la bio.

## Campaña "4 farmacias, 4 mundos"

En `marketing/campana-mundos/` está la batería de presentación de la red: **5 publicaciones (3 posts y 2 reels) y 5 stories**,
sin precios. La idea es la misma de la web: cada farmacia es un mundo, y las piezas usan el estilo de su página
(tipografías, colores, componentes y productos reales recortados). Todas llevan el sello FarmaGlass y cierran con "link en la bio".

| Pieza | Formato | Qué muestra |
| --- | --- | --- |
| `f1-reel-cuatro-mundos` | Reel 9:16, 14 s | Gancho "4 farmacias. 4 mundos.", cada mundo entra a su manera (el diario aparece, la noche se abre desde la luna, el Training Club barre en diagonal, el parque sube) y la cámara se aleja hasta la grilla de los cuatro con "Una sola web." |
| `f2-post-gaceta-centro` | Post 4:5 | La tapa de "La Gaceta de la Botica" sobre el mostrador de roble: "La botica de 1962 ahora atiende *online*", con el sumario de su página |
| `f3-post-after-hours-plaza` | Post 4:5 | "¿3 AM y sin sérum?": la rutina de noche de Plaza en polaroids (limpiá, tratá, hidratá), la cinta amarilla y el neón "Abierto 24 h" |
| `f4-post-norte-parque` | Post 4:5 | Dos mundos en una pieza: el Training Club de Belgrano Norte (marcador LED, "Recuperá energía") y el libro ilustrado de Parque Caballito ("Bebés felices, familias tranquilas") |
| `f5-reel-todo-en-una-bolsa` | Reel 9:16, 10 s | La bolsa de FarmaGlass se llena con productos de las 4 farmacias y aparecen las categorías y el sello "En tu puerta en 2 h" |
| `s1-story-que-farmacia-sos` | Story | "¿Qué farmacia sos vos?": cuatro tarjetas, cada una en su estilo. Se responde contestando la story con una letra (no necesita stickers) |
| `s2-story-cajonera-centro` | Story | "Abrí la cajonera": la cajonera de madera con placas de bronce y los 6 clásicos de botica |
| `s3-story-24h-plaza` | Story | "¿A qué hora lo necesitás?": el selector de la web a las 03:00, con la red y Plaza como la única abierta |
| `s4-story-kit-norte` | Story | "Elegí tu deporte. Armamos tu kit.": antes, durante y después, y el marcador LED para elongar |
| `s5-story-mochila-parque` | Story | "¿Salen al parque?": la mochila con su lista y la escena ilustrada, en primavera |

- **Exportar**: `node marketing/campana-mundos/exportar.js` (o, por ejemplo, `… exportar.js f2 s3` para algunas).
  Deja todo en `exportados/`: PNG y JPG de cada pieza fija, y MP4 (H.264, 30 fps) más la portada en JPG de cada reel.
  Necesita Playwright y, para los reels, ffmpeg. Cada pieza abierta en el navegador se ve achicada; los reels, animados.
- **Base común**: `comun.css` (tokens de la marca y de cada farmacia, sello FarmaGlass, botón "link en la bio")
  y `comun.js` (marcas de las farmacias, vista previa y modo de exportación).
- **Productos**: `img/productos/` tiene 41 fotos de producto recortadas (sin fondo, en WebP), de las mismas fuentes que
  `productos-reales.js`. Las imágenes pertenecen a sus marcas.
- **Reels**: van sin música; se le agrega un audio de la biblioteca de Instagram al publicarlos. La portada es el último cuadro.
- **Vistas generales**: `exportados/bateria.jpg` muestra las 10 piezas juntas y `exportados/perfil.jpg`, cómo queda el perfil
  con las 5 publicaciones nuevas y la presentación ya publicada (Instagram recorta cada una a 3:4 en la grilla).

**Calendario sugerido** (una semana, de jueves a miércoles; hora de Buenos Aires):

| Día | Feed | Stories |
| --- | --- | --- |
| Jueves | F1 · Reel "4 farmacias, 4 mundos" (19:00) | S1 · ¿Qué farmacia sos? (19:30) |
| Viernes | F2 · La Gaceta (12:30) | S2 · La cajonera (13:00) |
| Sábado | — | S5 · La mochila para el parque (10:00) |
| Domingo | F4 · Norte y Parque (11:00) | S4 · Armá tu kit (18:00) |
| Lunes | F3 · After Hours (21:30) | S3 · ¿A qué hora lo necesitás? (23:30) |
| Miércoles | F5 · Reel "Todo en una bolsa" (19:00) | — |

## Campaña "Entre todas": la comunidad de farmacias

En `marketing/campana-comunidad/` está el segundo capítulo de la presentación: **3 publicaciones, 1 reel y 4 stories**, sin precios.
Si "4 farmacias, 4 mundos" mostró lo que hace distintas a las farmacias, esta campaña muestra lo que las une: **"Tu farmacia no está sola."**
Cuatro farmacias de barrio que *se cubren, se cuentan lo que saben y se dan una mano*. Todo el desarrollo (idea, pruebas, tono, sistema visual,
calendario, medición y textos para publicar) está en [`CONCEPTO.md`](marketing/campana-comunidad/CONCEPTO.md).

| Pieza | Formato | Qué muestra |
| --- | --- | --- |
| `r1-reel-cuando-una-cierra` | Reel 9:16, 16 s | "Cuando una cierra, otra abre.": una noche con los horarios reales de la red (cierran Centro a las 21, Parque a las 22 y Norte a las 23; Plaza no cierra) hasta que a la mañana vuelven a abrir. Termina con la cruz de cuatro armándose: "Entre todas, siempre hay una abierta." |
| `p1-manifiesto` | Post 4:5 | "Tu farmacia no está sola.": la cruz de farmacia armada por las cuatro farmacias, unidas por un hilo, y los tres verbos de la comunidad |
| `p2-mapa` | Post 4:5 | "Una comunidad, cuatro barrios.": mapa ilustrado con las cuatro farmacias unidas por el hilo y un punto "Vos" |
| `p3-cartelera` | Post 4:5 | "La cartelera de la comunidad.": un consejo de cada farmacia pegado en un corcho, cada uno con su estilo |
| `s1-cobertura` | Story | "A cualquier hora, hay una abierta.": tablero con las cuatro farmacias a las 6, 12, 18, 22:30 y 3 |
| `s2-cuatro-puertas` | Story | "Cuatro puertas. Una sola comunidad.": las cuatro fachadas abiertas, unidas por el hilo, en la hora dorada |
| `s3-guardapolvo` | Story | "Detrás de cada farmacia hay alguien que te conoce por tu nombre.": un guardapolvo con la identificación en blanco. Invita a escribirnos ese nombre |
| `s4-entra` | Story | "Entrá a la comunidad": decinos dónde estás, armá tu pedido, retirá o recibí, y la receta |

- **Exportar**: `node marketing/campana-comunidad/exportar.js` (o, por ejemplo, `… exportar.js p1 s2` para algunas). Deja todo en `exportados/`:
  PNG y JPG de cada pieza fija, y MP4 (H.264, 30 fps) más la portada en JPG del reel. Necesita Playwright y, para el reel, ffmpeg
  (el reel de 16 s se graba cuadro por cuadro y tarda unos minutos).
- **Piezas compartidas**: `comunidad.js` dibuja la cruz de cuatro (`FG.cruz`), las fachadas con persiana (`FG.fachada`), los banderines y la moto;
  `comunidad.css` suma sus estilos. Todo se apoya en `../campana-mundos/comun.css` y `comun.js` (tokens, marcas y sello).
- **Horarios**: los de `farmacias-red.js`. Si cambian, se actualizan `HORARIO` en `r1-reel-cuando-una-cierra.html` y `FARMACIAS` en `s1-cobertura.html`.
- **Reel**: va sin música; el audio se agrega al publicarlo a mano. Las stories terminan en "link en la bio" porque, por API, no se puede poner el sticker de enlace.
- **Vista general**: `exportados/bateria.jpg` muestra las 8 piezas juntas.
