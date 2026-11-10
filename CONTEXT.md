# Mi Cuadrilla — Contexto del Proyecto

## 🎯 Descripción general

**Mi Cuadrilla** es una aplicación móvil (PWA primero, luego Android) pensada para capataces y auxiliares de pasos de Semana Santa. Su objetivo es digitalizar y facilitar la gestión de la cuadrilla de costaleros: igualá, control de asistencia a ensayos y colocación en el paso.

El problema que resuelve: sustituir el uso de Excel en móvil (muy incómodo) por una app diseñada específicamente para este dominio.

> **Estado actual:** toda la interfaz funciona con **datos de prueba (mock)** en memoria. Supabase, login y AdMob/Analytics están pendientes. Al recargar el navegador los cambios se pierden.

### 🤝 Cómo trabajamos
- **Siempre se actualizan `CONTEXT.md` y `CHANGELOG.md`** al terminar un cambio. Si queda una duda, se deja escrita en "Preguntas pendientes de responder" y se tacha cuando se decide.
- Los textos de la app y los documentos van en **español**. Los avisos solo aparecen cuando hay algo que avisar.
- Comprobación de cada cambio: `npx ng build --configuration development` y `npx ng lint`. `ng test` no arranca en este entorno (ver pendientes), así que la lógica se comprueba con scripts temporales fuera del proyecto, que se borran al terminar.
- Servidor de desarrollo: `npm start` (http://localhost:4200). Para probar en el móvil se genera el APK (ver "Probar en el móvil").

### 📌 Dónde lo dejamos (para retomar)
1. **Siguiente tarea acordada:** decisiones de duplicados **de dos en dos** (pregunta 7).
2. **Relevos:** el capataz hará más pruebas con las dos pestañas ("Relevos" y "Relevos (nuevo)") y decidirá cuál se queda (pregunta 16). Pendiente su respuesta sobre el paso "Cristo del Perdón" (pregunta 12).
3. Preguntas 1 a 8 sin responder; mientras tanto vale el comportamiento descrito en cada una.
4. Sin hacer todavía: Supabase, login, Equipo (auxiliares) y el build de producción (ver "Pendiente / Futuro").
5. **Sesión 9 (v0.9.0):** menú sin "Trabajaderas" ni subtítulo "Semana Santa", flechas en las pestañas del detalle del paso, versión visible en el menú (sale de `package.json`) e icono del llamador del Gran Poder. APK de pruebas regenerado, **pendiente de probar en el móvil** (¿se lee bien el icono? ¿salen las flechas?).
6. **Pendiente de la sesión 9:** guardar la vista "en fila" de los relevos de cada paso (cuando haya base de datos).

### 🚀 Publicación y cuentas (decisiones y dudas, sin cerrar)
- **Cuenta de desarrollador:** se usará el Gmail `enriqueprogrammer` (sirve para varias apps futuras, no solo cofrades). El canal de YouTube "Madrid entre costales" no se usa para publicar; se puede enlazar desde la ficha. Falta decidir el **nombre público** del desarrollador.
- **Google Play:** cuota única de 25 $, sin vía gratuita. Se deja para más adelante. Comprobar antes las condiciones vigentes para cuentas personales (fase de pruebas con testers, datos de contacto públicos). El id `com.micuadrilla.app` no se puede cambiar una vez subido.
- **App Store:** unos 99 $ al año, sin vía gratuita. Como particular se muestra el nombre legal; una marca exige cuenta de organización. Hace falta Mac o un servicio de compilación en la nube. Apple suele pedir también "Iniciar sesión con Apple" si hay login con Google. No existe carpeta `ios/` todavía.
- **Mientras tanto:** pruebas con el **APK** y con una **PWA** gratuita (hosting gratis; en iPhone se instala desde Safari con "Añadir a pantalla de inicio"). La PWA hay que probarla en un iPhone real.

### 🎨 Icono de la app
- Elegido: **llamador del Gran Poder** (balaustres, volutas, escudo con corona y angelitos), dorado sobre fondo `#12121f`. Fuentes SVG en `resources/` (`icon-only`, `icon-foreground`, `icon-background`); otras variantes y la foto de referencia en `resources/variantes/`. Alternativa por si se ve muy cargado en el móvil: `resources/variantes/2-simplificado/`.
- Regenerar: `npx @capacitor/assets generate --android --pwa --iconBackgroundColor "#12121f"` (después, revertir el reformateo que hace en `AndroidManifest.xml`). Favicon: `src/assets/icon/favicon.svg` (copia de `icon-only.svg`).
- Manifiesto web: `src/manifest.webmanifest` (copiado al build desde `angular.json`).

### 🔢 Versión
- La versión sale de `package.json` y se muestra en el menú lateral (`v0.9.0`; en móvil el pie del menú está oculto). Se sube al terminar cada sesión y se anota en `CHANGELOG.md`.

### Datos de prueba actuales (se quitarán al conectar Supabase)
| Paso | Trabajaderas | Relevos de prueba |
|------|--------------|-------------------|
| 1. Cristo de la Buena Muerte | 10 de 6 | **Ninguno** (a propósito, para ver la pantalla "¿cuántos relevos?") |
| 2. Virgen de la Esperanza | 7 de 5 | 20 relevos, **todos vacíos** |
| 3. Gran Poder | 7 de 6 | 20 relevos; solo **Salida, Relevo 1 y Entrada** tienen gente (30 de 42 puestos). Trabajaderas 1-5 con 8 costaleros para 6 puestos (rotan: los 10 que no salen entran en el Relevo 1 y en la Entrada). Los 8 costaleros de las trabajaderas 6 y 7 **quedan fuera** de todos los relevos |
| 4. Cristo del Perdón | 4 de 3 (4×3) | 18 costaleros (5+5+4+4): 12 salen, los 6 que quedan fuera entran en el Relevo 1 y también hacen la Entrada. 4 relevos. Tiene **3 ensayos pasados con asistencia** (fechas relativas a hoy, listas completas) para ver cómo influye la asistencia |
| 5. Virgen de la Alegría | 4 de 3 (4×3) | 24 costaleros = dos cuadrillas completas (6 por trabajadera). 4 relevos: cuadrilla A, B, A, B, **cada costalero siempre en el mismo puesto** |

- Los pasos 4 y 5 y los costaleros extra del Gran Poder son inventados (generados en `datos-prueba-relevos.ts`); los relevos de los pasos 4 y 5 salen de aplicar "Sugerir relevo".
- **Ensayos y listas pasadas en todos los pasos** (fechas relativas a hoy, siempre pasadas): Cristo (e12 completa y e13 sin lista), Esperanza (una completa y otra al 60 %), Gran Poder (una completa, una al 70 % y e15 casi vacía), Cristo del Perdón (tres completas) y Virgen de la Alegría (una completa y otra al 50 %). Sirven para probar la pantalla de Ensayos ("Lista incompleta" / "Sin pasar lista"), el pase de lista y la influencia de la asistencia en los relevos.
- Cristo, Esperanza y Gran Poder tienen pocos costaleros comparados con sus puestos (Cristo: 13 activos para 60 puestos), así que en ellos la sugerencia deja muchos puestos vacíos.
- En el listado de costaleros hay dos parejas de **duplicados de prueba** (Antonio García Pérez y Andrés Medina Ríos) para probar la fusión.

---

## 🏗️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Angular 22 + Ionic 9 |
| Mobile runtime | Capacitor 8 |
| Base de datos | Supabase (PostgreSQL) — pendiente |
| Autenticación | Supabase Auth (OAuth con Google) — pendiente |
| Publicidad | Google AdMob (no intrusiva: banners) — pendiente |
| Analítica | Firebase Analytics — pendiente |
| Plataforma objetivo | PWA → Android (Google Play) |
| Lenguaje | TypeScript |

---

## 🎨 Diseño

- Tema único: **Cofrade Clásico** (fondo oscuro, dorado como acento, solemne). Variables CSS en `src/global.scss` (`--mc-*`).
- **Sidebar lateral** colapsable al estilo GitHub (ancho con iconos y texto / estrecho solo con iconos). En móvil pasa a barra superior.
- **Color por paso**: el capataz elige el color de cada paso y tiñe sus tarjetas, números de trabajadera, etc.
- Los costaleros dados de baja se muestran **apagados** (sin colores de alarma) con una etiqueta "Baja" legible. Lo mismo con los ensayos cancelados.
- Los **avisos solo aparecen cuando hay algo que avisar** (duplicados, ensayos sin lista, costaleros sin marcar...). Nada de etiquetas tipo "todo correcto".

---

## 👥 Roles de usuario

| Rol | Descripción |
|-----|-------------|
| `owner` (Capataz) | Crea y gestiona el paso. Puede invitar auxiliares. Control total. |
| `auxiliar` | Ayudante del capataz. Permisos por definir (posible sistema de permisos). |

> Los **costaleros NO tienen acceso a la app**. Son datos gestionados por capataz/auxiliares.

### Varias cuentas y visibilidad de costaleros (propuesta, pendiente de decidir)

Cuando haya Supabase habrá **varias cuentas de capataz independientes**, cada una con sus pasos. Propuesta:

- **El "catálogo global" de personas es global dentro de una cuenta**, no entre cuentas. Cada capataz ve y edita solo su propio catálogo (`persona.owner_id`). Un capataz **no** puede ver la lista de costaleros de otro capataz ajeno: son datos personales (nombre, apellidos, teléfono) que recogió otra persona/hermandad, y compartirlos sin permiso es un riesgo de privacidad (RGPD/LOPDGDD). La detección de duplicados y la fusión trabajan solo dentro del catálogo propio.
- **Un auxiliar** de un paso ve los costaleros de **ese paso** (por ser miembro del paso), pero solo en el contexto de ese paso. No se mezclan con su propio catálogo.
- **Auxiliar en un paso y capataz en otro** (decisión): los catálogos no se mezclan automáticamente. Al **añadir un costalero** en su propio paso, el auxiliar va **escribiendo el nombre** y, si ese costalero aparece en un paso donde él es auxiliar, la sugerencia lo muestra indicando **en qué paso está** y ofrece **"Añadir a mi nómina"**. Eso **copia** nombre, apellidos y teléfono a su catálogo (copia independiente: los cambios posteriores no se sincronizan). Si el teléfono ya existe en su catálogo, se vincula en vez de duplicar. El capataz dueño del paso original **no puede prohibirlo**: no son datos sensibles y el auxiliar ya los ve en su paso.
- En Supabase: RLS por `owner_id` y por pertenencia a `paso_miembros`. Ver preguntas pendientes 9 a 11.

---

## 📦 Entidades del dominio

### Persona (catálogo global **de la cuenta del capataz**)
Identidad real de un costalero, **independiente de los pasos de ese capataz**. Los datos personales se editan una sola vez (desde el listado global de costaleros) y se ven en todos sus pasos. No se comparte entre cuentas de capataz distintas (ver "Roles de usuario").

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Inmutable, generado al crear la persona (no basado en el nombre) |
| nombre | string | |
| apellidos | string | |
| telefono | string | **Identificador humano** de la persona. Se puede modificar si cambia de número. No se pide DNI (invasivo) |
| alias | string? | Apodo, solo informativo (no es un identificador) |

### Paso
El proyecto principal. Un capataz puede tener varios pasos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| nombre | string | Nombre del paso (único campo obligatorio al crearlo) |
| descripcion | string? | Hermandad (ej: "Hermandad de los Estudiantes") |
| imagen_url | string? | Foto del paso |
| owner_id | UUID | Capataz propietario |
| num_trabajaderas | number | Número de trabajaderas |
| capacidad_trabajadera | number | Costaleros que caben en cada trabajadera (**igual en todas**, dato global del paso) |
| color | string? | Color elegido por el capataz (hex) |
| fecha_procesion | date? | Fecha de la procesión (opcional) |

### Trabajadera
Tiene una **identidad** (id) y una **posición** (`numero`). Sus costaleros y su diferencia de altura van ligados al id; el número que se muestra es solo la posición.
Reordenar trabajaderas = cambiar `numero`; los costaleros y las medidas se quedan con su trabajadera.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identidad de la trabajadera |
| paso_id | UUID | Paso al que pertenece |
| numero | number | **Posición** en el paso (1, 2, 3...). Cambia al reordenar |
| diferencia_altura_cm | number | Diferencia respecto a la trabajadera de referencia (la más alta = 0). **La app no la calcula**: se mide en la igualá y se introduce a mano |

### Costalero (registro de una persona en un paso)
Una misma persona puede estar en varios pasos, en trabajaderas distintas y con calzo distinto.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Registro de esta persona en este paso |
| persona_id | UUID | Persona real (fuente de verdad de nombre, apellidos, teléfono, alias) |
| paso_id | UUID | Paso |
| trabajadera_id | UUID | Trabajadera asignada en este paso |
| calzo_cm | number | Suplemento en cm (admite decimales: 0.5, 1.5...) respecto al más alto de su trabajadera. 0 = el más alto |
| es_aspirante | boolean | Etiqueta "Aspirante". Cuenta igual que un costalero normal |
| activo | boolean | `false` = dado de baja o aspirante descartado **en este paso** |
| posicion | number? | Posición dentro de la trabajadera (mapa visual, futuro) |
| notas | string? | Libre. Se usa también como **motivo de la baja** |

Reglas:
- Los **inactivos** se ven apagados en el detalle del paso (al final de su trabajadera) pero **no cuentan** en totales, contadores ni pase de lista.
- En el listado global, una persona solo muestra los pasos en los que está **activa**. Si solo estaba en un paso y se dio de baja, aparece "Sin pasos asignados".
- Al **quitar la baja** se borra el motivo (notas).
- Dentro de una trabajadera se ordenan por `calzo_cm` ascendente y, si empatan, por apellidos.
- Nombre, apellidos y teléfono se leen siempre de la **Persona**, no del registro.

### Ensayo
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| paso_id | UUID | Paso |
| fecha | date | Fecha del ensayo (**obligatoria**) |
| descripcion | string | Nombre libre: "Ensayo 1", "Mudá", "Retranqueo"... |
| lugar | string? | Lugar (la mudá o el retranqueo pueden ser en sitios distintos) |
| cancelado | boolean? | Ensayo cancelado (lluvia, etc.): no cuenta como próximo ni se pasa lista |
| motivo_cancelacion | string? | Se borra al quitar la cancelación |

El **próximo ensayo** es el de fecha más cercana a hoy (o posterior), con fecha puesta y no cancelado. Cambia solo al pasar el día.

### Asistencia
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| ensayo_id | UUID | Ensayo |
| costalero_id | UUID | Registro de costalero |
| estado | enum | `presente` / `ausente` / `justificada`. Si no hay registro, el costalero está **sin marcar** |
| notas | string? | Motivo de la ausencia o justificación (solo para ausente y justificada) |

### Relevo
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| paso_id | UUID | Paso |
| orden | number | 1 = Salida ... N = Entrada. El nombre no se guarda, se deduce del orden |
| calle_inicio | string? | Calle donde empieza el relevo |
| calle_fin | string? | Calle donde termina el relevo |

### Asignación de relevo (puesto ocupado)
Si no hay registro, el puesto está vacío.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| relevo_id | UUID | Relevo |
| trabajadera_id | UUID | Trabajadera (fila) donde va en ESTE relevo, que puede no ser la suya |
| columna | number | Puesto dentro de la trabajadera (0, 1, 2...) |
| costalero_id | UUID | Costalero. **Único dentro de un relevo**, pero puede estar en N relevos |
| nota | string? | Ej: "va con calzo de 2 cm" |

---

## 🔍 Identificación de personas y duplicados

- Al añadir un costalero se **autocompleta** por nombre/apellidos con las personas ya en nómina. Al elegir una sugerencia se rellenan nombre, apellidos, teléfono y alias; el calzo y si es aspirante se ponen a mano.
- Si se escribe a mano y el **teléfono ya existe** en otra persona → aviso "¿es la misma persona?".
- Si el **nombre es similar** pero el teléfono distinto → aviso de posible duplicado.
- El listado global marca los posibles duplicados (mismo nombre, distinto teléfono) con un icono de alerta y un filtro para revisarlos.
- Pendiente: guardar en Supabase la decisión "no son la misma persona" para no volver a preguntar, y decidir las fusiones de grupos de 3 o más fichas del mismo nombre (de dos en dos).

---

## 🗺️ Flujo principal de uso

1. **Crear paso** (wizard de 2 pasos): datos del paso (solo el nombre es obligatorio) y después, opcionalmente, los ensayos.
2. **Igualá**: el capataz apunta cada costalero (nombre, apellidos, teléfono, calzo, si es aspirante, trabajadera) y la diferencia de altura de cada trabajadera.
3. **Editar paso**: nombre, hermandad, color, fecha de procesión, costaleros por trabajadera, nº de trabajaderas, diferencia de altura y **orden** de las trabajaderas (flechas subir/bajar).
   - Al **quitar** una trabajadera que tiene costaleros, la app avisa y deja elegir a qué otra trabajadera se mueven.
4. **Ensayos**: crear, editar, borrar y marcar como cancelado. Hay una **pantalla general de Ensayos** (menú lateral) con los de todos los pasos: por defecto los futuros (hoy incluido, del más cercano al más lejano); filtros Futuros / Pasados / Todos, por paso y por rango de fechas; también se pueden crear desde ahí eligiendo el paso. Los cancelados salen apagados y los pasados con la lista **pendiente** se marcan: "Sin pasar lista" si no hay nadie marcado y "Lista incompleta" si faltan costaleros activos por marcar (una lista a medias cuenta como pendiente). Arriba hay un aviso, que solo aparece si hay alguno, que filtra esos ensayos.
5. **Pase de lista**: todos parten **sin marcar**; se marca presente / justificada / ausente (pulsar de nuevo el botón activo lo desmarca), con nota para ausentes y justificados. Se puede guardar con costaleros sin marcar (avisa de cuántos quedan) y retomarlo después. Los sin marcar no cuentan como nada.
6. **Equipo**: pendiente (ver más abajo).
7. **Relevos** (pestaña del paso): al entrar por primera vez se pregunta cuántos relevos se harán (de **2 a 20**; se puede escribir el número o usar los botones − / +). El primero se llama **Salida**, el último **Entrada** y los de en medio **Relevo 1, 2...**. Se puede cambiar el número en cualquier momento con "Cambiar nº de relevos":
   - **Al reducir** se avisa de que se quitan relevos **de en medio** (los más cercanos a la Entrada; la Salida y la Entrada se mantienen) y de cuántos puestos ya colocados se pierden.
   - **Al aumentar** se avisa de que los nuevos se añaden **al final, justo antes de la Entrada** (la Entrada sigue siendo el último). Ver pregunta pendiente 1.

   La pestaña muestra una **tarjeta por relevo** con una miniatura de la parihuela vista desde arriba (filas = trabajaderas, columnas = puestos) y el contador de puestos. Al pulsar una tarjeta se abre el editor del relevo:
   - **Calle donde empieza** y **calle donde termina** el relevo.
   - Cuadrícula de puestos: se toca un puesto y se elige al costalero (primero salen los de esa trabajadera; con un botón se ven los de otras). Un costalero **no puede estar dos veces en el mismo relevo**; si ya está en otro puesto, elegirlo lo **cambia de sitio** (intercambia con quien hubiera).
   - Si se pone a alguien en una **trabajadera que no es la suya** se avisa y se puede dejar una **nota** (ej: "va con calzo de 2 cm"). El puesto queda marcado con la T de su trabajadera de origen.
   - El capataz coloca libremente (no hay orden obligatorio por calzo). Los costaleros de baja no se ofrecen.
   - **Copiar el relevo anterior**, **Vaciar** y **Sugerir relevo**.
   - **Sugerir relevo** (sin IA, reglas fijas): rellena solo los puestos vacíos y no toca lo que el capataz ya haya colocado. Para cada trabajadera elige entre **sus propios costaleros activos** que aún no estén en ese relevo. Prioridad, de mayor a menor:
     1. **Salida / Entrada**: quien no hace la Salida **tiene que hacer la Entrada** (y al revés). Se aplica cuando el otro extremo ya tiene gente colocada.
     2. **Trabajadera doblada** (al menos el doble de costaleros activos que puestos, p. ej. 6 para 3 puestos): el relevo es un **cambio completo**; salen los que estaban y entran los otros, que son los que no estuvieron en el relevo anterior.
     3. Los que **menos relevos llevan** debajo del paso.
     4. Los que **no estuvieron en el relevo anterior** (descansan los que acaban de salir).
     5. Los de **mejor asistencia** a ensayos (presente 1, justificada 0,5, ausente 0; sin datos = 0,5).
     6. Los que **menos pasos sacan** en total (en todos los pasos en los que están activos): se da descanso a quien saca más pasos, porque puede venir más cansado de otros días.
     7. **Al azar**, para no favorecer siempre a los mismos. Por eso el resultado puede cambiar al repetir la sugerencia. **El calzo y el orden alfabético ya no cuentan.**

     Nunca mueve a nadie a otra trabajadera: si faltan costaleros, el puesto queda vacío y se avisa. Si una trabajadera tiene **tantos costaleros como puestos (o menos)** también se avisa, porque son los mismos en todos los relevos y no hay a quién dar descanso. En la pestaña hay también "Sugerir los que faltan" para todos los relevos a la vez (en orden, de la Salida a la Entrada).

   **Posición:** cada costalero **mantiene su puesto durante toda la procesión**. Al sugerir un relevo, cada uno vuelve al puesto que ya ocupó en esa trabajadera (el del relevo más cercano) si está libre; quien entra releva a quien sale en su mismo puesto. Con "Sugerir los que faltan" (todos los relevos a la vez) se hace además un ajuste final por trabajadera para que **el mayor número posible** de costaleros quede en el mismo puesto en todos sus relevos. Con dos cuadrillas completas (como la Virgen de la Alegría) es siempre el 100 %. Si una trabajadera rota con menos costaleros de los que harían falta como puestos fijos (por ejemplo 4 para 3 puestos), algún costalero tiene que moverse al hueco del que sale. Si el capataz ya había colocado a alguien en una trabajadera, el ajuste no la toca.

   **Cuadrícula:** casillas **rectangulares y compactas**, para que una cuadrícula pequeña (p. ej. 4×3) no se estire en pantallas grandes.
   - **Vista general** (pestaña Relevos, una tarjeta por relevo): miniatura con las **iniciales** del costalero (nombre + primer apellido) en cada puesto ocupado, pintadas con el color del paso (texto claro u oscuro según el color).
   - **Detalle del relevo** (editor): cada puesto ocupado muestra el **nombre completo** (primer apellido arriba, nombre debajo; casilla de hasta 104 px de ancho y 44-46 px de alto). Si no cabe, se recorta con "…" y el nombre entero sale al tocar o al pasar el ratón. En la esquina inferior derecha de cada casilla hay, muy discreto, un número pequeño con la **asistencia a ensayos** ("asistidos/total", solo ensayos ya celebrados y marcados); si hay algún dato, una línea de leyenda lo explica bajo la cuadrícula. El detalle (asistidos, justificadas, ausencias) sale en el aviso emergente de la casilla. En el selector de costalero también aparece a la derecha de cada nombre. El selector ya no indica en qué otro puesto está colocado cada uno.

   **Pestaña "Relevos (nuevo)"** (prueba, convive con la anterior y usa los mismos datos): muestra **todos los relevos a la vez**, cada uno en una tarjeta con su cuadrícula completa y con **nombres completos** (sin iniciales; primer apellido arriba, nombre debajo, asistencia en la esquina). Dos formas de verlos, con un conmutador: **Cuadrícula** (las tarjetas se reparten por la pantalla y bajan de línea; una por línea en el móvil) y **Fila** (una sola fila que se desliza a los lados, para ver el relevo vecino mientras se coloca). Cada tarjeta lleva sus acciones como iconos: **sugerir** este relevo (✨), **copiar el anterior**, **vaciar** (ambos piden confirmación si hay gente colocada) y **calles** (📍, se editan en la propia tarjeta). Arriba: "Sugerir los que faltan" y "Cambiar nº de relevos" (con los mismos avisos). Al tocar un puesto se abre la ventana de selección de costalero (`SelectorCostaleroComponent`, la misma que usa el editor de la pestaña "Relevos"): buscador, primero los costaleros de esa trabajadera, otras trabajaderas bajo petición (con aviso y nota opcional) y asistencia a la derecha de cada nombre. **Quien ya está en el puesto sale el primero de la lista con el mismo tamaño y datos que los demás**, más suave y con una línea de color en el borde izquierdo; al tocarlo se edita su nota o se deja el puesto vacío. No hace falta entrar a cada relevo.
8. **Marchas y recorrido**: pendiente de definir (fase muy futura).

---

## 🤝 Equipo / invitar auxiliares (pendiente, para más adelante)

Idea acordada: la invitación se hará por **enlace compartido por WhatsApp**. La persona abre el enlace, le aparece una alerta y debe **aceptar unirse** al paso. Requiere Supabase (login con Google) para funcionar de verdad. De momento el botón "Invitar auxiliar" es solo maqueta.
Pendiente definir qué puede hacer un auxiliar (permisos).

---

## 💰 Modelo de negocio

- App **gratuita**
- Monetización con **Google AdMob** (banners no intrusivos, evitar intersticiales en flujos de trabajo críticos)

---

## 🧭 Convenciones de código

- Inyección de dependencias con `inject()`, no por parámetros del constructor.
- Plantillas con la sintaxis nueva `@if` / `@for` (no `*ngIf` / `*ngFor`, obsoletos en Angular 22).
- Componentes standalone con carga diferida (`loadComponent`) desde `app-routing.module.ts`.

---

## 📁 Estructura de carpetas

```
src/app/
├── core/
│   ├── constants/       # Constantes (paleta de colores de los pasos)
│   ├── models/          # Interfaces y tipos TypeScript
│   └── services/        # MockDataService, PersonasService, RelevosService, AtrasService, ThemeService
│                        # + datos-prueba-relevos.ts (costaleros, ensayos y relevos de prueba)
├── shared/
│   └── components/      # Sidebar, MainLayout
└── features/
    ├── pasos/           # Lista, detalle (con sus pestañas), nuevo y editar paso
    ├── costaleros/      # Listado global (con el asistente de duplicados), nuevo costalero, costalero en un paso, editar datos personales
    ├── relevos/         # components/: relevos-tab, relevo-miniatura, tablero-relevos, selector-costalero · pages/: editor-relevo
    └── ensayos/         # Pantalla general de ensayos, formulario de ensayo (crear/editar) y pase de lista
```

Rutas principales: `/pasos`, `/pasos/nuevo`, `/pasos/:id`, `/pasos/:id/editar`, `/pasos/:pasoId/costaleros/nuevo`, `/pasos/:pasoId/costaleros/:id`, `/pasos/:pasoId/ensayos/nuevo`, `/pasos/:pasoId/ensayos/:id/editar`, `/pasos/:pasoId/relevos/:id`, `/ensayos`, `/ensayos/:id/lista`, `/costaleros`, `/costaleros/:id/editar`.

---

## ❓ Preguntas pendientes de responder

Dudas abiertas. Mientras no se respondan, el comportamiento actual es el que se indica.

1. **Aumentar el nº de relevos ("se ponen al final")**: hoy los nuevos se añaden **al final de los de en medio, justo antes de la Entrada**, y la Entrada sigue siendo el último relevo (así no se pierde lo que ya tenía). ¿Querías eso, o que se añadan **después** de la Entrada (la antigua Entrada pasaría a ser un relevo de en medio y el nuevo último sería la Entrada)?
2. **Trabajadera "doblada"**: se ha definido como tener **al menos el doble** de costaleros activos que puestos (6 para 3). ¿Qué hacer con los casos intermedios (4 o 5 para 3 puestos) y con los que superan el doble (7 para 3)? Hoy los intermedios se tratan como una trabajadera normal (rotan por carga) y los que superan el doble como doblada (entran los que no estuvieron en el relevo anterior; sobran algunos).
3. **Doblada + número impar de relevos**: con A, B, A, B, A la Entrada sería la misma cuadrilla que la Salida y chocaría con "quien no hace la Salida hace la Entrada". Hoy **gana la regla de la Entrada**, así que puede haber dos relevos seguidos con la misma cuadrilla justo antes de la Entrada. ¿Es lo que quieres?
4. **"Quien no hace la Salida hace la Entrada"**: solo se aplica cuando el otro extremo ya tiene gente colocada, y si no caben en la trabajadera se quedan fuera sin más aviso que "puestos sin cubrir". ¿Quieres un aviso tipo "N costaleros no han entrado en ningún relevo"?
5. **Asistencia en la sugerencia**: ya está decidido que se premia la asistencia **antes** que los pasos que saca. Sigue abierta la duda de si debe pesar más que la carga de relevos y el descanso (hoy desempata después de ellos): ¿debe pesar más, por ejemplo no sugerir nunca a quien falte mucho a los ensayos?
6. **Datos de prueba del Gran Poder**: se interpretó "unos cuantos relevos con gente y otros costaleros fuera" como Salida, Relevo 1 y Entrada con gente y los costaleros de las trabajaderas 6 y 7 fuera de todos (y las trabajaderas 1 a 5 con 8 costaleros para 6 puestos para que roten). ¿Es lo que esperabas?
7. **Duplicados** (**es la siguiente tarea acordada**): decidir las fusiones "de dos en dos" para grupos de 3 o más fichas del mismo nombre y guardar la decisión "no son la misma persona".
8. **Orden de los puestos** dentro de una trabajadera: hoy el capataz coloca libremente. ¿Debe haber una opción para ordenar por calzo?
9. ~~**Varias cuentas de capataz**~~ **Decidido:** cada capataz ve solo su propio catálogo de costaleros (privados). Ver "Roles de usuario".
10. ~~**Auxiliar que es capataz en otro paso**~~ **Decidido:** el capataz dueño del paso original **no** puede prohibir que se copien sus costaleros. No son datos sensibles (no se pide DNI), el objetivo es facilitar la vida a los capataces y el auxiliar ya puede ver esos datos en su paso.
11. **Vincular la misma persona entre cuentas** por el teléfono: de momento no se hace (cada catálogo es independiente). ¿Alguna vez debe poder saberse que dos capataces tienen al mismo costalero?
12. **Fallo en "Cristo del Perdón"** (Salida y Relevo 1 con los mismos costaleros): el capataz **ya vio los relevos con nombres completos y los da por buenos**, pero notó que un costalero de la trabajadera 1 salía en 3 de los 4 relevos y quiso ver la asistencia al lado del nombre (hecho, ver cuadrícula). Explicación: la trabajadera 1 tiene 5 costaleros para 3 puestos y 4 relevos = 12 puestos, así que dos de ellos tienen que salir 3 veces. El paso 4 ahora tiene 3 ensayos pasados con asistencia para que se vea cómo influye. Pendiente de que lo confirme tras probar la nueva versión.
13. ~~**Peso de "pasos que saca"**~~ **Decidido:** se premia siempre la asistencia y el compromiso: **primero la asistencia y después los pasos que saca** (es el orden actual de la sugerencia).
14. ~~**Menú en el móvil**~~ **Decidido:** se queda arriba. Probado en el móvil: se ve y funciona bien.
15. ~~**Cuadrícula con iniciales**~~ **Decidido:** iniciales solo en la vista general de relevos; en el detalle, el nombre completo.
16. **Funcionalidad de relevos en revisión**: el capataz probó la versión actual (tarjetas + editor por relevo + sugerencia) y la asistencia al lado del nombre le parece bien, pero **no le convence tener que entrar a cada relevo**: hay que recordar quién estaba en el anterior o volver atrás, y se pierde el hilo al navegar. Pidió probar otra forma en una **pestaña nueva** ("Relevos (nuevo)", ya hecha): ver **todos los relevos a la vez**, con los "+" y las acciones (sugerir, copiar, vaciar, calles) como iconos en cada tarjeta, y **sin iniciales** (se pueden repetir y no son claras). Las dos pestañas conviven y comparten los mismos datos, para compararlas. Cuando el capataz decida cuál se queda, se borra la otra (y el código que quede sin uso).

---

## 🔮 Pendiente / Futuro

- [ ] **Botón atrás del móvil = flecha "volver" de cada pantalla**: hoy el botón atrás vuelve a la pantalla anterior visitada y la flecha de arriba va a la pantalla "padre" lógica. El capataz dice que no le importa como está; se haría con un mapa de pantalla → pantalla padre.
- [ ] **Build de producción roto por los límites de estilos** (`anyComponentStyle` 4 kB en `angular.json`): decidir si se sube el límite o se parten los estilos de las páginas grandes. Imprescindible antes de publicar en Google Play. Los componentes nuevos de relevos (tablero, selector, editor) también superan los 4 kB
- [ ] Decidir si la carpeta `android/` se sube a git
- [ ] **Hacer commit**: todo el trabajo de la sesión 8 (duplicados, relevos, APK, datos de prueba) está sin commit en git
- [ ] `ng test` no arranca (no encuentra `vitest`): revisar la versión de vitest con Angular 22
- [ ] Conectar Supabase (esquema SQL, RLS) y sustituir los datos de prueba
- [ ] Login con Google y protección de rutas
- [ ] Equipo: invitación de auxiliares por enlace de WhatsApp + permisos
- [x] Fusionar costaleros duplicados desde el listado global (asistente "¿son la misma persona? / ¿cuál es el correcto?"). Falta guardar las decisiones y tratar grupos de 3 o más fichas de dos en dos
- [ ] **Decidir cómo tratar los años / temporadas.** Hoy los datos no tienen idea de temporada: los ensayos solo tienen fecha y la pantalla de Ensayos enseña todos los guardados. Pendiente decidir si hace falta un selector de año (ensayos de la temporada actual vs histórico) y si la nómina de costaleros y las bajas también deben ir por temporada
- [x] Fechas y meses en español (hecho: idioma `es` registrado en `app.module.ts`)
- [ ] **Menú "Trabajaderas"** (decidir): hoy no lleva a ninguna pantalla (redirige a Mis Pasos) y nació como hueco de la primera maqueta, sin un uso concreto. Las trabajaderas pertenecen a un paso y ya se gestionan dentro de cada uno (detalle y editar). Propuesta: quitarlo del menú y reservar la idea para el futuro mapa visual de colocación y los relevos, que irían dentro de cada paso
- [ ] **Menú "Auxiliares"** (decidir): hoy redirige a Mis Pasos. Idea: vista global del equipo con todos los auxiliares de todos tus pasos, a qué pasos tiene acceso cada uno, invitaciones pendientes, invitar a varios pasos de una vez y quitar accesos. Complementa la pestaña "Equipo" de cada paso. Depende de Supabase y de la invitación por WhatsApp; decidir si el enlace se queda o se quita hasta entonces
- [ ] Relevos: guardar en Supabase; decidir si el orden de los puestos debe seguir el calzo; exportar/compartir los relevos (imagen o PDF)
- [ ] Mapa visual de colocación en el paso
- [ ] Marchas musicales y recorrido de procesión
- [ ] Notificaciones push (recordatorio de ensayo)
- [ ] Exportar datos (PDF de la cuadrilla, lista de asistencia)
- [ ] AdMob y Firebase Analytics
- [ ] Plataforma iOS (App Store)

---

## 📱 Probar en el móvil (APK de pruebas)

Requisitos ya instalados en el PC: JDK 21 (Amazon Corretto, `C:\Program Files\Amazon Corretto\jdk21.0.13_0`) y Android SDK en `%LOCALAPPDATA%\Android\Sdk` (plataforma `android-36`, build-tools 36.0.0). Capacitor 8 compila contra la API 36.

Para generar un APK nuevo (en PowerShell, desde la raíz del proyecto):

```powershell
$env:JAVA_HOME = "C:\Program Files\Amazon Corretto\jdk21.0.13_0"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"
npx ng build --configuration development
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

El APK queda en `android\app\build\outputs\apk\debug\app-debug.apk`. Para tenerlo con el nombre que se pasa al móvil, se copia como **`mi-cuadrilla.apk`** en la misma carpeta (firmado con la clave de depuración: sirve para probar, no para Google Play):

```powershell
Copy-Item android\app\build\outputs\apk\debug\app-debug.apk android\app\build\outputs\apk\debug\mi-cuadrilla.apk -Force
```

Hay que repetirlo y reinstalar tras cada cambio. Los datos siguen siendo de prueba en memoria: al cerrar la app vuelven al estado inicial.

Notas:
- **Pestañas de un paso en el móvil:** la barra de pestañas (Trabajaderas, Ensayos, Relevos, Relevos (nuevo), Equipo) **se desliza hacia los lados** y la pestaña elegida se centra a la vista, porque ya no caben todas.
- **Android (zona segura):** la app se dibuja a pantalla completa, también bajo la barra de estado y la de gestos. La barra superior del móvil y el contenedor principal usan `env(safe-area-inset-top/bottom)` para dejar sitio; los botones del menú tienen zona táctil de 44 px. En `capacitor.config.ts`, `SystemBars.style = 'DARK'` pone los iconos claros sobre el fondo oscuro.
- **Android (botón atrás):** lo gestiona `AppComponent` con `@capacitor/app`: 1) cierra la ventana emergente abierta si la hay (`AtrasService`: asistente de duplicados y selector de costalero se registran ahí), 2) si hay pantalla anterior, vuelve, 3) si no y no se está en Mis Pasos, va a Mis Pasos, 4) si ya se está en Mis Pasos, **pregunta "¿Salir de la aplicación?"** (Quedarme / Salir; el botón atrás con el aviso abierto equivale a "Quedarme"). El `hardwareBackButton` de Ionic está desactivado (`app.module.ts`) para que no compita. **Probado en el móvil: funciona.** Hoy vuelve a la pantalla anterior visitada; ver pendiente por si se quiere que equivalga a la flecha "volver" de cada pantalla.
- Se usa `--configuration development` porque `npm run build` (producción) **falla** por el límite de tamaño de estilos por componente (4 kB): `detalle-paso`, `editar-paso`, `lista-ensayos`, `nuevo-costalero` y `detalle-costalero` lo superan. Ya fallaba antes de los relevos. Ver pendiente.
- La carpeta `android/` está sin versionar en git (decidir si se sube).
- `ng test` no arranca en este entorno (dice que no encuentra `vitest` aunque está instalado).

---

## 🔑 Variables de entorno necesarias

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
FIREBASE_API_KEY=
FIREBASE_APP_ID=
ADMOB_APP_ID=
```

> Configurar en `src/environments/environment.ts` y `environment.prod.ts`
