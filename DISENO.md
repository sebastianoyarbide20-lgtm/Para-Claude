# FarmaGlass · Rediseño "Bento clínico suave"

Documento de trabajo del rediseño de `farmacia_v2.html`: diagnóstico del estado anterior (v3), guía de estilo, cambios aplicados y pendientes.

## 1. Diagnóstico del sitio actual (v3, antes de este rediseño)

| Área | Estado | Decisión |
|---|---|---|
| **Iconografía** | Un solo set de línea (estilo Lucide) para interfaz y categorías. Consistente, pero las categorías no tienen jerarquía visual: se ven igual que un botón de filtro. | **Se conserva** el set de línea para la interfaz. **Se agrega** un segundo nivel: íconos 3D translúcidos (cápsula, gel, vidrio) para categorías. |
| **Hero / banners** | Un hero único con tres packshots sobre tarjetas blancas. Sin carrusel (ya se había quitado). En móvil las fotos quedan chicas y el bloque ocupa casi una pantalla. | **Se reemplaza** por un hero bento de 4 bloques, tipográfico, sin fotos de stock. |
| **Estructura del home** | Secciones apiladas: hero → beneficios → ofertas del día → catálogo. Todo tiene el mismo peso y el catálogo aparece recién en la 3.ª pantalla. | **Se reemplaza** por un bento grid modular + módulo "¿Qué necesitás hoy?" + categorías + más elegidos. |
| **Paleta** | Verde bosque + crema + amarillo sol + rojo de descuento. Es la combinación verde-farmacia que se busca evitar como protagonista. | **Se reemplaza**: fondo cálido casi blanco, neutros arena y **un solo acento coral**. El verde queda solo como color semántico ("en stock"). |
| **Tipografía** | Bricolage Grotesque + Inter + Instrument Serif itálica. 6 pasos de escala, mínimo 12 px en metadatos. | **Se conserva** Bricolage para titulares. **Se reemplaza** Inter por Figtree (más amable) y se sube el cuerpo a **16 px mínimo**. Se quita la serif. |
| **Navegación** | Header con buscador y carrito, barra inferior en móvil, categorías como chips sticky junto al catálogo. No hay página de categoría, ni carrito navegable, ni cuenta, ni carga de recetas. | **Se conserva** buscador, carrito y barra inferior. **Se agrega** menú de categorías, página de categoría, cajón de carrito, checkout, cuenta y carga de receta (a nivel prototipo). |
| **Accesibilidad** | Buena base: zoom habilitado, `<dialog>`, botones reales, 44 px táctiles, contraste AA. Faltaba modo oscuro y el cuerpo usaba 14 px en tarjetas. | **Se conserva** todo. **Se agrega** modo oscuro, cuerpo 16 px y foco gestionado al cambiar de vista. |

**Funcionalidad que se mantiene:** catálogo con filtros y búsqueda, agregar al carrito desde la tarjeta y desde el detalle, detalle de producto con cantidad, newsletter con validación, datos legales y botón de arrepentimiento.

**Se quitó (sin pérdida de función):** el reloj de "Ofertas del día" (aunque era real, era presión de tiempo innecesaria) y la banda de bienvenida (el código pasa a un bloque del hero).

## 2. Guía de estilo

Todos los valores viven como variables CSS en `:root` de `farmacia_v2.html`. El modo oscuro redefine solo los colores.

### Color

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--bg` | `#FAF7F2` | `#16130F` | Fondo general (cálido, no blanco clínico) |
| `--surface` | `#FFFFFF` | `#211C18` | Tarjetas de producto, diálogos |
| `--surface-2` | `#F3EEE6` | `#2A241F` | Bloques bento neutros (arena) |
| `--surface-3` | `#EAE3D8` | `#342D27` | Pozos de imagen, campos |
| `--ink` | `#221E1B` | `#F4EEE7` | Texto principal |
| `--ink-2` | `#5C554E` | `#CFC6BC` | Texto secundario |
| `--ink-3` | `#6E665E` | `#ADA398` | Metadatos (≥ 4,8:1 en todas las superficies) |
| `--line` | `#E6DFD4` | `#3A322B` | Bordes |
| `--accent` | `#FF6B57` | `#FF7A66` | **Único acento**: CTA y destacados. Siempre con texto `--on-accent` |
| `--on-accent` | `#221E1B` | `#221E1B` | Texto sobre acento (5,9:1) |
| `--accent-ink` | `#B63A26` | `#FF9A88` | Precio en oferta y enlaces (5,8:1) |
| `--accent-soft` | `#FFE4DD` | `#40241E` | Fondos de badge de descuento |
| `--ok` | `#1F7A4D` | `#6FD39C` | Semántico: en stock |
| `--warn` | `#9A5B00` | `#F0B45A` | Semántico: últimas unidades |

### Tipografía

- Titulares: **Bricolage Grotesque** 700/800, `letter-spacing: -0.03em`, `text-wrap: balance`.
- Cuerpo e interfaz: **Figtree** 400–700.
- Escala: 14 (solo etiquetas cortas) · **16 (mínimo de cuerpo)** · 18 · 22 · 28 · 40 · 56 (`--t-*`). Interlineado de cuerpo 1,55.

### Forma, sombra y espacio

- Radios: `--r-sm` 12 · `--r-md` 16 · `--r-lg` 22 · `--r-xl` 28 · `--r-pill`. Bloques bento usan 28, tarjetas 22, controles pill.
- Sombras: `--shadow-1` (reposo) y `--shadow-2` (hover). Suaves, con tinte cálido.
- Espacio: escala de 4 px (`--s-1` 4 … `--s-8` 48). Gap del bento: 12 px en móvil, 16 px desde 768 px.

### Iconos

- **Nivel 1 · Interfaz:** línea redondeada, trazo 2 px, una familia (estilo Lucide), como `<symbol>` SVG.
- **Nivel 2 · Categorías:** SVG 3D translúcidos (cápsula, gota de gel, mamadera, frasco con dosificador, cruz de vidrio) con degradés, brillo especular y sombra suave. Vectoriales: no suman peso de imagen.

### Glass

Solo en header, barra inferior, chips de necesidades y badges. Precios, stock, advertencias y botones de compra van siempre sobre superficies opacas.

## 3. Cambios realizados

- **Home en bento grid:** bloque de campaña tipográfico, "Repetí tu última compra" / "Tu botiquín" (según sesión), bloque de código promocional y bloque "Subí tu receta / Consultá al farmacéutico".
- **"¿Qué necesitás hoy?":** 6 chips (dormir mejor, resfrío, piel seca, viaje con chicos, cuidado del bebé, defensas). Cada uno reorganiza el bento con una transición suave y muestra consejo breve, productos **solo de venta libre** y acceso al farmacéutico.
- **Categorías con íconos 3D** y **página de categoría** (`#/categoria/…`) con filtros (en oferta, envío gratis, en stock), orden y contador.
- **Tarjeta de producto nueva** con container queries: vertical en espacios chicos, horizontal cuando la tarjeta tiene ancho. Precio, stock y botón siempre visibles; "Sin stock" deshabilita la compra.
- **Carrito** en cajón lateral con cantidades, envío y total; **checkout** de un paso (prototipo) sin casillas premarcadas; el pedido confirmado alimenta "Repetí tu última compra".
- **Cuenta** (ingreso de demostración) y **carga de receta** (imagen o PDF, con obra social opcional).
- **Modo oscuro** automático según el sistema.
- Todos los productos nuevos son venta libre, suplementos o cuidado personal, sin marcas de medicamentos.

## 4. Pendientes y recomendaciones

1. **Datos legales reales** en el footer (director técnico, matrícula, habilitación, CUIT, Data Fiscal).
2. **Imágenes propias** en WebP/AVIF con `srcset`. Los productos nuevos usan el ícono 3D de su categoría como imagen provisoria, y las fotos existentes siguen enlazadas desde terceros.
3. **Backend**: carrito, cuenta, recetas y checkout son de demostración (usan `localStorage`). La carga de recetas necesita almacenamiento seguro y validación farmacéutica.
4. **Video del hero** (opcional del brief): no se incluyó porque no hay material propio. Si se suma, que sea < 1 MB, sin audio, con `poster` y pausado con `prefers-reduced-motion`.
5. **Medir Core Web Vitals** en producción. El hero es solo tipografía (LCP liviano), las imágenes tienen dimensiones fijas (CLS) y son `lazy`.
6. **Revisión legal** de los textos de consejos de "¿Qué necesitás hoy?" por un farmacéutico matriculado.
