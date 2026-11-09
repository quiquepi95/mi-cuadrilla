# Mi Cuadrilla — Contexto del Proyecto

## 🎯 Descripción general

**Mi Cuadrilla** es una aplicación móvil (PWA primero, luego Android) pensada para capataces y auxiliares de pasos de Semana Santa. Su objetivo es digitalizar y facilitar la gestión de la cuadrilla de costaleros: igualá, control de asistencia a ensayos y colocación en el paso.

El problema que resuelve: sustituir el uso de Excel en móvil (muy incómodo) por una app diseñada específicamente para este dominio.

> **Estado actual:** toda la interfaz funciona con **datos de prueba (mock)** en memoria. Supabase, login y AdMob/Analytics están pendientes. Al recargar el navegador los cambios se pierden.

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

---

## 📦 Entidades del dominio

### Persona (catálogo global)
Identidad real de un costalero, **independiente de los pasos**. Los datos personales se editan una sola vez (desde el listado global de costaleros) y se ven en todos los pasos.

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

---

## 🔍 Identificación de personas y duplicados

- Al añadir un costalero se **autocompleta** por nombre/apellidos con las personas ya en nómina. Al elegir una sugerencia se rellenan nombre, apellidos, teléfono y alias; el calzo y si es aspirante se ponen a mano.
- Si se escribe a mano y el **teléfono ya existe** en otra persona → aviso "¿es la misma persona?".
- Si el **nombre es similar** pero el teléfono distinto → aviso de posible duplicado.
- El listado global marca los posibles duplicados (mismo nombre, distinto teléfono) con un icono de alerta y un filtro para revisarlos.
- Pendiente: fusionar duplicados desde el listado.

---

## 🗺️ Flujo principal de uso

1. **Crear paso** (wizard de 2 pasos): datos del paso (solo el nombre es obligatorio) y después, opcionalmente, los ensayos.
2. **Igualá**: el capataz apunta cada costalero (nombre, apellidos, teléfono, calzo, si es aspirante, trabajadera) y la diferencia de altura de cada trabajadera.
3. **Editar paso**: nombre, hermandad, color, fecha de procesión, costaleros por trabajadera, nº de trabajaderas, diferencia de altura y **orden** de las trabajaderas (flechas subir/bajar).
   - Al **quitar** una trabajadera que tiene costaleros, la app avisa y deja elegir a qué otra trabajadera se mueven.
4. **Ensayos**: crear, editar, borrar y marcar como cancelado. Hay una **pantalla general de Ensayos** (menú lateral) con los de todos los pasos: por defecto los futuros (hoy incluido, del más cercano al más lejano); filtros Futuros / Pasados / Todos, por paso y por rango de fechas; también se pueden crear desde ahí eligiendo el paso. Los cancelados salen apagados y los pasados con la lista **pendiente** se marcan: "Sin pasar lista" si no hay nadie marcado y "Lista incompleta" si faltan costaleros activos por marcar (una lista a medias cuenta como pendiente). Arriba hay un aviso, que solo aparece si hay alguno, que filtra esos ensayos.
5. **Pase de lista**: todos parten **sin marcar**; se marca presente / justificada / ausente (pulsar de nuevo el botón activo lo desmarca), con nota para ausentes y justificados. Se puede guardar con costaleros sin marcar (avisa de cuántos quedan) y retomarlo después. Los sin marcar no cuentan como nada.
6. **Equipo**: pendiente (ver más abajo).
7. **Relevos**: pendiente de definir (fase futura).
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
│   └── services/        # MockDataService, PersonasService, ThemeService
├── shared/
│   └── components/      # Sidebar, MainLayout
└── features/
    ├── pasos/           # Lista, detalle, nuevo y editar paso
    ├── costaleros/      # Listado global, nuevo costalero, costalero en un paso, editar datos personales
    └── ensayos/         # Pantalla general de ensayos, formulario de ensayo (crear/editar) y pase de lista
```

Rutas principales: `/pasos`, `/pasos/nuevo`, `/pasos/:id`, `/pasos/:id/editar`, `/pasos/:pasoId/costaleros/nuevo`, `/pasos/:pasoId/costaleros/:id`, `/pasos/:pasoId/ensayos/nuevo`, `/pasos/:pasoId/ensayos/:id/editar`, `/ensayos`, `/ensayos/:id/lista`, `/costaleros`, `/costaleros/:id/editar`.

---

## 🔮 Pendiente / Futuro

- [ ] Conectar Supabase (esquema SQL, RLS) y sustituir los datos de prueba
- [ ] Login con Google y protección de rutas
- [ ] Equipo: invitación de auxiliares por enlace de WhatsApp + permisos
- [ ] Fusionar costaleros duplicados desde el listado global
- [ ] **Decidir cómo tratar los años / temporadas.** Hoy los datos no tienen idea de temporada: los ensayos solo tienen fecha y la pantalla de Ensayos enseña todos los guardados. Pendiente decidir si hace falta un selector de año (ensayos de la temporada actual vs histórico) y si la nómina de costaleros y las bajas también deben ir por temporada
- [ ] Fechas y meses en español (la app no tiene registrado el idioma `es`, así que salen "Feb", "Wed"...)
- [ ] **Menú "Trabajaderas"** (decidir): hoy no lleva a ninguna pantalla (redirige a Mis Pasos) y nació como hueco de la primera maqueta, sin un uso concreto. Las trabajaderas pertenecen a un paso y ya se gestionan dentro de cada uno (detalle y editar). Propuesta: quitarlo del menú y reservar la idea para el futuro mapa visual de colocación y los relevos, que irían dentro de cada paso
- [ ] **Menú "Auxiliares"** (decidir): hoy redirige a Mis Pasos. Idea: vista global del equipo con todos los auxiliares de todos tus pasos, a qué pasos tiene acceso cada uno, invitaciones pendientes, invitar a varios pasos de una vez y quitar accesos. Complementa la pestaña "Equipo" de cada paso. Depende de Supabase y de la invitación por WhatsApp; decidir si el enlace se queda o se quita hasta entonces
- [ ] Sistema de relevos (definir lógica)
- [ ] Mapa visual de colocación en el paso
- [ ] Marchas musicales y recorrido de procesión
- [ ] Notificaciones push (recordatorio de ensayo)
- [ ] Exportar datos (PDF de la cuadrilla, lista de asistencia)
- [ ] AdMob y Firebase Analytics
- [ ] Plataforma iOS (App Store)

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
