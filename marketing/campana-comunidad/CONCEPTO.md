# Campaña "Entre todas" · La comunidad de farmacias FarmaGlass

> **Tu farmacia no está sola.**
> Cuatro farmacias de barrio, cuatro estilos, una sola comunidad: se cubren, se cuentan lo que saben y se dan una mano.

Segundo capítulo de la presentación de FarmaGlass. El primero, **"4 farmacias, 4 mundos"** (`../campana-mundos/`), mostró
lo que las hace *distintas*: cada farmacia es un mundo, con su estilo, su página y su carácter. Este capítulo muestra
lo que las **une**. Sin precios, sin descuentos y sin promesas médicas.

## 1. Objetivo

| | |
| --- | --- |
| **Objetivo principal** | Instalar la idea de **comunidad de farmacias**: FarmaGlass no es un mostrador anónimo en internet, es una red de farmacias de barrio que se respaldan entre sí. |
| **Objetivos de apoyo** | 1) Llevar tráfico a la web (todas las piezas cierran con "link en la bio"). 2) Abrir conversación con la gente (la story 3 invita a contestar). 3) Dejar instalada la idea para una segunda fase: sumar más farmacias a la comunidad. |
| **A quién le habla** | Vecinos y vecinas de Recoleta, Palermo, Belgrano y Caballito (y alrededores) que ya compran en su farmacia de barrio y desconfían de las plataformas impersonales. |
| **Qué queremos que piensen** | "Mi farmacia de siempre tiene respaldo: si cierra, hay otra; si no tiene, la tiene otra; y siempre hay alguien que me conoce." |

## 2. El insight

La farmacia de barrio es de las pocas cosas del barrio que *te conocen por tu nombre*. Pero está sola: tiene su horario, su stock
y su mostrador, y cuando cierra, cierra. Las cadenas resuelven eso con sucursales todas iguales; FarmaGlass lo resuelve de otra
manera: **sumando farmacias distintas que se cubren entre sí**. Por eso la comunidad no es un eslogan: está en el funcionamiento de la web.

## 3. La idea: "Entre todas."

**Entre todas.** Es el lema y el cierre de cada pieza (siempre en dos tonos: *Entre* en la tipografía de marca y *todas.* en la cursiva).
Funciona de tres maneras: es femenino plural (son *farmacias*), es de barrio ("lo resolvemos entre todos") y se completa solo con la
prueba de turno: "Entre todas, siempre hay una abierta."

El gancho es **"Tu farmacia no está sola."** y se explica con tres verbos, que son el manifiesto:

| Verbo | Qué significa en FarmaGlass | Dónde está en la web |
| --- | --- | --- |
| **Se cubren.** | Los horarios están escalonados: cierra una y sigue otra. Plaza Palermo atiende las 24 h. | Horarios de cada farmacia y selector "¿A qué hora lo necesitás?" |
| **Se cuentan lo que saben.** | Cada farmacia comparte los consejos de su farmacéutico en su página, con su estilo. | "Notas del farmacéutico", rutinas, elongación, consejos de bebés y de piel |
| **Se dan una mano.** | Un solo carrito para toda la red, agrupado por farmacia; retiro o envío; la receta la revisa un farmacéutico de la red. | Carrito ("Sumá productos de cualquier farmacia de la red…"), "Retiro en farmacia", receta con foto |

## 4. Pruebas que se pueden verificar

Todo lo que dicen las piezas sale del código de la web. Si algo cambia allá, se corrige acá.

| Dato | Cómo aparece en las piezas | De dónde sale |
| --- | --- | --- |
| Farmacia del Centro (Recoleta): lunes a sábado, 8 a 21 h | S1, R1 | `farmacias-red.js` |
| Parque Caballito: lunes a sábado, 8 a 22 h | S1, R1 | `farmacias-red.js` |
| Belgrano Norte: todos los días, 7 a 23 h | S1, R1 | `farmacias-red.js` |
| Plaza Palermo: 24 h, todos los días | S1, R1 | `farmacias-red.js` |
| La web muestra la farmacia más cercana al ingresar la dirección | P2, S4 | `farmaglass-home.js` ("Más cercana") |
| "Sumá productos de cualquier farmacia de la red: los agrupamos por farmacia y los recibís juntos." | S4 | `fg-shop.js` |
| Retiro en el mostrador en 30 minutos o envío en 2 horas (CABA y GBA) | S4, R1 ("Entrega en 2 h") | páginas de farmacia |
| Un farmacéutico de la red revisa la receta para cotizarla | S4 | `fg-receta.js` |
| Los consejos de P3 | P3 | páginas de Centro, Plaza, Norte y Parque |

## 5. Tono de voz

- **Vecinal y cálido**: voseo rioplatense, frases cortas, como si lo dijera el farmacéutico del barrio. "Contanos", "Entrá", "Retirá o recibí".
- **Sin tecnicismos ni promesas de salud**: los consejos son orientativos y llevan la leyenda *"Información orientativa. Ante cualquier duda, consultá a tu médico o farmacéutico."*
- **Sin precios, descuentos ni urgencias falsas** (continuidad de la presentación).
- **Sin testimonios inventados**: los vecinos de la web (Marta, Julián, Elena) son ficticios y no se muestran como gente real.

## 6. Sistema visual: la cruz de cuatro y el hilo

- **La cruz de cuatro** (`FG.cruz` en `comunidad.js`): la cruz de farmacia, armada por las cuatro farmacias. Cada brazo tiene la forma y el
  color de la marca de una farmacia (Belgrano Norte arriba, Farmacia del Centro a la derecha, Parque Caballito abajo, Plaza Palermo a la izquierda)
  y en el centro queda FarmaGlass. Es el emblema de la comunidad: aparece en el manifiesto (P1) y en el cierre del reel (R1).
- **El hilo**: una línea punteada que une a las farmacias (el anillo de P1, el recorrido de P2, el cruce de S2). Es la costura de la comunidad.
- **Las fachadas** (`FG.fachada`): una por farmacia, con su estilo (letrero de bronce, neón, marcador LED, tablero de madera), con persiana
  que sube y baja. Sirven para mostrar "abierta" y "cerrada" sin texto (R1, S1, S2).
- **Los banderines** (`FG.banderines`): una guirnalda con los colores de las cuatro farmacias. Es la fiesta de barrio cuando todas están abiertas.
- **Paleta y tipografía**: verde de marca (bosque y lima) como base y los cuatro colores de las farmacias como acentos. Titulares en
  Bricolage Grotesque, el acento en Instrument Serif cursiva (igual que la web) y, cuando aparece una farmacia, su propia tipografía.
- **Firma**: el sello FarmaGlass en cada pieza, el lema "Entre todas." al pie y el llamado "link en la bio".

## 7. Las piezas

Una batería de **8 piezas** (3 publicaciones, 1 reel y 4 stories). El reel abre y las demás desarrollan cada pilar.

| Pieza | Formato | Pilar | Qué dice y qué muestra |
| --- | --- | --- | --- |
| **R1** · `r1-reel-cuando-una-cierra` | Reel 9:16, 16 s | Se cubren | "Cuando una cierra, otra abre." Una noche en la comunidad, con los horarios reales: a las 21 baja la persiana Farmacia del Centro, a las 22 Parque Caballito, a las 23 Belgrano Norte; a las 3 sigue abierta Plaza Palermo, con la moto de entrega; a las 7 abre Belgrano Norte y a las 8 abren Centro y Parque. Cierra con la cruz armándose: "Entre todas, siempre hay una abierta." |
| **P1** · `p1-manifiesto` | Post 4:5 | La idea | "Tu farmacia no está sola." La cruz de cuatro rodeada por el hilo y los tres verbos. |
| **P2** · `p2-mapa` | Post 4:5 | Cercanía | "Una comunidad, cuatro barrios." Mapa ilustrado con las cuatro farmacias unidas por el hilo y un punto "Vos". Invita a ingresar la dirección para ver la más cercana. |
| **P3** · `p3-cartelera` | Post 4:5 | Se cuentan lo que saben | "La cartelera de la comunidad." Un consejo de cada farmacia pegado en un corcho, cada uno con el estilo de su farmacia. Es un contenido para **guardar**. |
| **S1** · `s1-cobertura` | Story | Se cubren | "A cualquier hora, hay una abierta." Tablero con las cuatro farmacias a las 6, 12, 18, 22:30 y 3: cuántas están abiertas en cada momento (1, 4, 4, 2, 1). |
| **S2** · `s2-cuatro-puertas` | Story | Se dan una mano | "Cuatro puertas. Una sola comunidad." Las cuatro fachadas abiertas, unidas por el hilo, en la hora dorada. "Entrá por la que quieras. Adentro, la misma comunidad." |
| **S3** · `s3-guardapolvo` | Story | Las personas | "Detrás de cada farmacia hay alguien que te conoce por tu nombre." Un guardapolvo con la identificación en blanco ("Hola, soy…"). Invita a **escribirnos el nombre** de la persona de su farmacia. |
| **S4** · `s4-entra` | Story | Cómo entrar | "Entrá a la comunidad": tres pasos (decinos dónde estás, armá tu pedido, retirá o recibí) y la receta. Cierra con "Empezá: link en la bio". |

Los reels y las stories se miran 3 segundos antes de decidir: por eso cada una trabaja una sola idea, con un titular grande y el color de la marca.

## 8. Calendario

Cuatro días, de miércoles a sábado, con los horarios de mayor actividad que informa Metricool para la cuenta (de lunes a viernes, alrededor de las 10 y las 18 h;
los fines de semana, las 10 h y la tarde). Hora de Buenos Aires.

| Día | Feed | Story |
| --- | --- | --- |
| Miércoles 28/10 | **R1** · Reel "Cuando una cierra, otra abre" (10:00) | **S1** · A cualquier hora, hay una abierta (12:30) |
| Jueves 29/10 | **P1** · Tu farmacia no está sola (10:00) | **S2** · Cuatro puertas, una sola comunidad (18:00) |
| Viernes 30/10 | **P2** · Una comunidad, cuatro barrios (10:00) | **S3** · Por tu nombre (12:30) |
| Sábado 31/10 | **P3** · La cartelera de la comunidad (10:30) | **S4** · Entrá a la comunidad (18:00) |

**Lógica del recorrido**: el reel presenta la idea con una prueba concreta (siempre hay una abierta) → el manifiesto la pone en palabras →
el mapa la acerca al barrio → la cartelera la vuelve útil → la última story muestra cómo se entra.

## 9. Cómo medimos

| Pieza | Qué miramos |
| --- | --- |
| R1 | Alcance, retención (¿llegan al final y a la cruz?), compartidos y guardados |
| P1 | Interacciones y comentarios ("la mía es…") |
| P2 | Comentarios con el barrio y compartidos con alguien del barrio |
| P3 | **Guardados** (es el contenido que se guarda) y compartidos |
| S1, S2, S4 | Toques adelante y atrás, salidas y visitas al perfil → toques en el enlace de la bio |
| S3 | **Respuestas por mensaje directo** (cuántos nombres llegan) |
| Toda la campaña | Visitas a la web desde el enlace de la bio, seguidores nuevos y menciones a las farmacias |

## 10. Cuidados

- **Los horarios son los de la web.** Si una farmacia cambia su horario, hay que rehacer R1 (`HORARIO`) y S1 (`FARMACIAS`) y volver a exportar.
- **Domingos y feriados**: Farmacia del Centro y Parque Caballito no abren los domingos. S1 lo aclara al pie; R1 muestra un día de lunes a sábado.
- **Salud**: los consejos de P3 son informativos y llevan la leyenda. No se promete ningún resultado.
- **Mapa ilustrativo** (P2): no es la ubicación real de cada farmacia.
- **Personas**: S3 no muestra rostros ni nombres. Si se hace la serie con farmacéuticos reales (fase 2), se necesita su consentimiento.
- **Alguien tiene que contestar**: S3 invita a escribir por mensaje directo; hay que responder y agradecer.
- **Enlace**: al publicar por API no se puede agregar el sticker de enlace a las stories, por eso todas dicen "link en la bio". El perfil tiene que tener el enlace a la web.
- **Reel sin música**: se publica en silencio. Para agregar un audio de la biblioteca de Instagram hay que publicarlo a mano.

## 11. Segunda fase (ideas)

1. **"Hola, soy…"**: la serie que completa S3 con farmacéuticos reales ("Hola, soy Marta, de Parque Caballito"), con su consentimiento.
2. **"¿Quién está de turno hoy?"**: una story diaria con la farmacia abierta de madrugada, domingos y feriados. Usa la lógica de S1 con datos del día.
3. **El consejo de la semana**: P3 como formato fijo, una farmacia por semana.
4. **Sumá tu farmacia**: la misma idea ("Tu farmacia no está sola") dicha a otros farmacéuticos de barrio, para ampliar la comunidad. Solo cuando la red pueda recibirlos.
5. **Mi farmacia es…**: los vecinos cuentan la suya y se arma un mapa con sus respuestas (con permiso).

## 12. Textos para publicar

Los textos de cada publicación (las stories van sin texto). Todos terminan en "link en la bio".

**R1 · Reel**

> Cuando una cierra, otra abre. 🌙☀️
>
> Mirá una noche en la comunidad FarmaGlass: Farmacia del Centro cierra a las 21, Parque Caballito a las 22 y Belgrano Norte a las 23… pero Plaza Palermo no cierra. Entre todas, siempre hay una abierta.
>
> Conocé las cuatro en el link de la bio. (Horarios de lunes a sábado.)
>
> #EntreTodas #ComunidadFarmaGlass #FarmaGlass #FarmaciaDeBarrio #FarmaciaOnline #Farmacia24hs

**P1 · Manifiesto**

> Tu farmacia no está sola. 💚
>
> Cuatro farmacias de barrio, cuatro estilos, una sola comunidad: Belgrano Norte, Farmacia del Centro, Parque Caballito y Plaza Palermo.
> Se cubren. Se cuentan lo que saben. Se dan una mano.
>
> Entre todas. Conocé la comunidad en el link de la bio.
>
> #EntreTodas #ComunidadFarmaGlass #FarmaGlass #FarmaciaDeBarrio #FarmaciaOnline

**P2 · Mapa**

> Una comunidad, cuatro barrios. 📍
>
> Recoleta, Palermo, Belgrano y Caballito: la farmacia de tu barrio y las otras tres para darte una mano. Ingresá tu dirección en la web y te mostramos la que te queda más cerca.
>
> ¿Cuál es la tuya? Contanos en los comentarios. 👇 Link en la bio.
>
> #EntreTodas #ComunidadFarmaGlass #FarmaGlass #Recoleta #Palermo #Belgrano #Caballito #FarmaciaDeBarrio

**P3 · Cartelera**

> La cartelera de la comunidad. 📌 Un consejo de cada farmacia, pegado en el mostrador:
> · Recoleta: el agua de rosas puede servir como tónico (probala antes en una zona chica).
> · Palermo: limpiá, tratá, hidratá. En ese orden.
> · Belgrano: seis estiramientos de 30 segundos después de entrenar.
> · Caballito: baño sin llanto, con agua tibia y baños cortos.
>
> Información orientativa. Ante cualquier duda, consultá a tu médico o farmacéutico.
> Guardala y mirá más consejos en el link de la bio.
>
> #EntreTodas #ComunidadFarmaGlass #FarmaGlass #ConsejosDeFarmacia #FarmaciaDeBarrio
