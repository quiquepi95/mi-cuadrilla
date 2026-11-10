# CHANGELOG — Mi Cuadrilla

Registro de cambios por sesión de trabajo. Cada entrada indica la fecha, lo que se hizo y el estado actual del proyecto.

---

## [0.1.0] — 2026-11-07 · Sesión 1: Scaffolding inicial

### ✅ Hecho
- Definición completa del dominio de negocio (pasos, trabajaderas, costaleros, ensayos, asistencia)
- Decisiones de arquitectura:
  - Angular 22 + Ionic 9 + Capacitor 8
  - Supabase como backend (Auth + DB)
  - Auth con Google OAuth via Supabase
  - AdMob para monetización (banners no intrusivos)
  - Firebase Analytics
  - Estrategia PWA primero → Android después
- Creación del proyecto con `ionic start` (plantilla blank)
- Configuración del `capacitor.config.ts` (appId: `com.micuadrilla.app`)
- Instalación de dependencias base:
  - `@supabase/supabase-js@2.50.5`
  - `@capacitor/android` y `@capacitor/ios` (v8)
- Estructura de carpetas del proyecto (`core`, `shared`, `features`)
- Modelos TypeScript completos en `src/app/core/models/index.ts`
- Creación de `CONTEXT.md` (documento vivo del proyecto)
- Creación de `CHANGELOG.md` (este archivo)

### 📍 Estado actual
> **Scaffolding completado.** El proyecto arranca pero no tiene pantallas funcionales todavía.
> Siguiente paso: configurar entornos (Supabase keys), servicio de autenticación y pantalla de login.

### ⏭️ Próxima sesión
- [ ] Crear cuenta en Supabase y obtener URL + anon key
- [ ] Configurar `environment.ts` con las claves
- [ ] Crear esquema de base de datos en Supabase (tablas, RLS policies)
- [ ] Servicio de autenticación (`AuthService`) con Google OAuth
- [ ] Pantalla de login
- [ ] Guard de autenticación para rutas protegidas

---

## [0.2.0] — 2026-11-07 · Sesión 2: Maquetación y sistema de temas

### ✅ Hecho
- Sistema de 3 temas visuales con CSS custom properties:
  - **Cofrade Clásico**: fondo oscuro, dorado, solemne
  - **Moderno Cofrade**: blanco, morado, elegante
  - **Bold & Clean**: burdeos, negro, funcional
- Sidebar colapsable al estilo GitHub (icono + texto / solo iconos)
  - Responsive: sidebar lateral en escritorio/tablet, barra superior en móvil
  - Selector de tema integrado en el sidebar
- Mock data service con datos de ejemplo (3 pasos, 4 trabajaderas, 10 costaleros, 4 ensayos)
- Pantallas implementadas con diseño completo:
  - **Lista de pasos**: grid de cards con color del paso, stats rápidas
  - **Detalle del paso**: hero, tabs (trabajaderas/ensayos/equipo), costaleros por trabajadera
  - **Pase de lista**: lista de costaleros con botones presente/ausente/justificada, resumen en tiempo real
- Routing completo con lazy loading
- Campo `color` añadido al modelo `Paso`

### 📍 Estado actual
> **Maquetación completa navegable.** Puedes ver los 3 temas, navegar entre pantallas y simular el pase de lista. Sin conexión a base de datos real todavía.
> Accede en: `http://localhost:8100`

### ⏭️ Próxima sesión (opciones)
- [ ] Elegir tema definitivo y refinar diseño ✅ Hecho en sesión 3
- [ ] Crear cuenta en Supabase y configurar backend
- [ ] Pantalla de nuevo paso / formulario de costaleros

---

## [0.3.0] — 2026-11-07 · Sesión 3: Tema definitivo — Cofrade Clásico

### ✅ Hecho
- Tema **Cofrade Clásico** elegido como definitivo
- Eliminados los temas Moderno Cofrade y Bold & Clean
- Variables CSS refinadas y ampliadas:
  - Nueva paleta de fondos en capas (`--mc-bg`, `--mc-bg-surface`, `--mc-bg-card`, `--mc-bg-elevated`)
  - Sombras específicas incluida `--mc-shadow-gold`
  - Colores de estado con variantes sutiles (`--mc-success-subtle`, etc.)
- Sidebar rediseñado:
  - Logo con llama dorada y subtítulo "Semana Santa"
  - Barra indicadora lateral en ítem activo (al estilo GitHub)
  - Punto indicador cuando está colapsado
  - Avatar con gradiente dorado en el footer
  - Adaptación móvil como barra superior fija
- Clases utilitarias globales: `.btn-primary`, `.btn-outline`, `.btn-ghost`, `.mc-card`, `.badge-*`, `.gold-divider`, `.fade-in`
- Animación `fadeIn` global

### 📍 Estado actual
> **Tema definitivo consolidado.** Diseño coherente y refinado en todas las pantallas.
> Siguiente paso: formularios (nuevo paso, añadir costalero) y conexión con Supabase.

### ⏭️ Próxima sesión
- [ ] Crear cuenta en Supabase y obtener credenciales
- [ ] Esquema de base de datos (tablas + RLS)
- [ ] Pantalla de login con Google
- [ ] Formulario de nuevo paso
- [ ] Formulario de añadir costaleros (array)

---

## [0.4.0] — 2026-11-07 · Sesión 4: Mock data completo y navegación entre pasos

### ✅ Hecho
- Campo `persona_id` añadido al modelo `Costalero` para identificar personas reales entre pasos
- Mock data ampliado con los 3 pasos completos:
  - Cristo de la Buena Muerte: 4 trabajaderas, 13 costaleros, 4 ensayos
  - Virgen de la Esperanza: 3 trabajaderas, 10 costaleros, 3 ensayos
  - Gran Poder: 5 trabajaderas, 16 costaleros, 4 ensayos
- Costaleros repetidos entre pasos (5 personas en 2 pasos distintos): Antonio, Manuel, Carlos, Rafael, Pablo
- Asistencias del primer ensayo de cada paso
- Stats de la lista de pasos ahora son dinámicas por paso (costaleros reales, ensayos reales)
- Stat global de "costaleros únicos" (cuenta por persona_id, no por registros)
- Badge "Varios pasos" visible en costaleros que pertenecen a más de un paso
- Nuevo método `getPasosByPersona()` en el servicio para futuro uso en perfil de costalero
- Nuevo método `getResumenAsistencia()` para stats rápidas de ensayo

### 📍 Estado actual
> **3 pasos navegables con datos reales de prueba.** Puedes ver la lista, entrar en cada paso, ver sus trabajaderas y costaleros, y navegar al pase de lista.

### ⏭️ Próxima sesión
- [ ] Crear cuenta en Supabase y obtener credenciales
- [ ] Esquema de base de datos en Supabase (tablas + RLS policies)
- [ ] Pantalla de login con Google OAuth
- [ ] Formulario de nuevo paso
- [ ] Formulario de añadir costaleros en array

---

## [0.5.0] — 2026-11-08 · Sesión 5: Identidad de personas, formularios y listado global

### ✅ Hecho
- **PersonasService** nuevo: catálogo global de personas únicas con UUID real como `persona_id`
  - UUIDs fijos en el mock (formato `a1b2c3d4-0001-0000-0000-XXXXXXXXXXXX`)
  - Métodos: `buscar()` (autocompletar), `buscarPorTelefono()`, `getDuplicados()`, `crearPersona()`, `actualizarPersona()`, `fusionar()`
- **Teléfono** como identificador humano único de persona
- **Formulario nuevo costalero** (`/pasos/:pasoId/costaleros/nuevo`):
  - Autocompletar por nombre/apellidos → sugerencias debajo de los campos (no flotando encima)
  - Badge "vinculado" al seleccionar una sugerencia
  - Validación de duplicado al salir del campo teléfono:
    - Teléfono exacto de otra persona → alerta roja con "¿Es la misma persona?"
    - Nombre similar con teléfono distinto → alerta amarilla
  - Campos específicos del paso: trabajadera, calzo (decimal), aspirante
- **Listado global de costaleros** (`/costaleros`):
  - Ordenado alfabéticamente por nombre (A→Z)
  - Buscador por nombre, teléfono o alias
  - Alerta amarilla si hay duplicados detectados + filtro "Ver duplicados"
  - Badge "X pasos" en costaleros que participan en varios
  - Botón lápiz para editar datos personales
  - Personas sin paso asignado (Bernardo Ruiz, Esteban Campos) visibles en el listado
- **Formulario editar costalero** (`/costaleros/:id/editar`):
  - Edita nombre, apellidos, teléfono y alias
  - Cambio de teléfono valida que no coincida con otra persona
  - Cambios afectan a todos los pasos del costalero
- **Formulario nuevo paso** (`/pasos/nuevo`):
  - Wizard en 2 pasos: datos del paso → ensayos
  - Campos: nombre*, hermandad, nº trabajaderas, costaleros/trabajadera, color (paleta + personalizado), fecha procesión
  - Paso 2: array dinámico de ensayos con nombre, fecha y lugar
- **Modelo actualizado**: `persona_id` UUID, `activo` en costalero, `capacidad_trabajadera` en paso, `calzo_cm` decimal, `capacidad` eliminado de trabajadera
- Dos costaleros sin paso asignado añadidos al mock (Bernardo y Esteban)

### 📍 Estado actual
> **Formularios de nuevo paso, nuevo costalero y edición funcionando con mock data.**
> Navegación completa entre todas las pantallas implementadas.
> Siguiente gran bloque: conectar Supabase (auth + base de datos real).

### ⏭️ Próxima sesión
- [ ] Crear cuenta en Supabase y obtener credenciales (URL + anon key)
- [ ] Esquema SQL en Supabase (tablas personas, pasos, trabajaderas, costaleros, ensayos, asistencias + RLS)
- [ ] Pantalla de login con Google OAuth via Supabase
- [ ] Guard de autenticación para rutas protegidas
- [ ] Reemplazar mock data por llamadas reales a Supabase

---

## [0.6.0] — 2026-11-08 · Sesión 6: Costalero en el paso, ensayos y edición del paso

### ✅ Hecho
- **Pantalla del costalero dentro de un paso** (flecha del detalle): datos personales de solo lectura con botón al editor global; datos del paso editables (trabajadera, calzo, aspirante, baja, notas)
- **Bajas**: los costaleros de baja se ven apagados con etiqueta "Baja" al final de su trabajadera; no cuentan en totales. Al quitar la baja se borra el motivo
- **Listado global**: solo muestra los pasos donde la persona está activa
- Corregido: nombre/apellidos/teléfono se leen de la **Persona**, así que editar en el listado global se refleja en todos los pasos
- Selector de trabajadera sin "(referencia)" ni "(+X cm)"; "Calzo: 0 cm" en lugar de "Referencia"
- **Próximo ensayo**: ahora es el más cercano por fecha, con fecha local, ignorando cancelados
- **Ensayos**: crear, editar, borrar (con confirmación) y marcar como **cancelado** (con motivo). Lista ordenada por fecha
- **Pase de lista**: nota para ausentes y justificados; el botón **ya guarda** la asistencia; corregida la etiqueta de trabajadera (salía "Te1"/"Tp3")
- **Editar paso**: nombre, hermandad, color, fecha de procesión, costaleros por trabajadera, nº de trabajaderas (− / +), diferencia de altura de cada trabajadera y **reordenar con flechas**. Al quitar una trabajadera con costaleros se pregunta a cuál se mueven
- Corregido: la **fecha de procesión** del formulario de nuevo paso no se guardaba
- Quitado el botón "Compartir" del detalle del paso
- `CONTEXT.md` actualizado (personas, bajas, ensayos cancelados, orden de trabajaderas, idea de invitación por WhatsApp)
- **La fecha del ensayo es obligatoria** (formulario de ensayo y ensayos del formulario de nuevo paso). En el nuevo paso, "Ahora no, añadir más tarde" crea el paso sin ensayos y descarta las filas a medias
- Migrada la inyección por constructor a `inject()` en todos los componentes de `src/app` (esquema oficial `ng generate @angular/core:inject`), para quitar el aviso del editor
- Migradas todas las plantillas de `*ngIf`/`*ngFor` (obsoletos en Angular 22) a la sintaxis nueva `@if`/`@for` con el esquema oficial `ng generate @angular/core:control-flow`

### 🧪 Pruebas pendientes de revisar
Cosas hechas pero **no comprobadas todavía en el navegador**. Marcar al probarlas:
- [ ] Editar paso (Cristo): reordenar trabajaderas con las flechas, guardar y comprobar que los costaleros y la diferencia de altura siguen con su trabajadera
- [ ] Editar paso: bajar de 4 a 3 trabajaderas y comprobar que el aviso mueve los costaleros a la trabajadera elegida
- [ ] Marcar un ensayo como cancelado y comprobar que "Próximo ensayo" salta al siguiente
- [ ] Pase de lista: escribir una nota a un ausente, guardar, salir y volver a entrar; la nota se conserva
- [ ] Intentar guardar un ensayo sin fecha (formulario de ensayo y nuevo paso): debe mostrar "La fecha es obligatoria"
- [ ] Nuevo paso: "Ahora no, añadir más tarde" crea el paso sin ensayos
- [ ] Comprobar que el aviso de `inject()` ya no aparece en el editor
- [ ] Comprobar que los avisos de `ngIf`/`ngFor` obsoletos ya no aparecen en el editor
- [ ] Recorrer todas las pantallas tras la migración a `@if`/`@for` y comprobar que se ven igual: lista de pasos, detalle (las 3 pestañas), editar paso, formularios de costalero y de ensayo, pase de lista, listado de costaleros y sidebar

### 📍 Estado actual
> Toda la gestión de un paso funciona con datos de prueba: crear/editar paso, trabajaderas, costaleros, bajas, ensayos y pase de lista. Falta Supabase, login y el apartado Equipo.

### ⏭️ Próxima sesión
- [ ] Conectar Supabase (cuenta, esquema SQL, RLS) y sustituir los datos de prueba
- [ ] Login con Google + guard de rutas
- [ ] Equipo: invitación por enlace de WhatsApp y permisos
- [ ] Fusionar duplicados desde el listado global

---

## [0.7.0] — 2026-11-09 · Sesión 7: Pantalla de Ensayos y pase de lista sin marcar

### ✅ Hecho
- **Pase de lista**: todos los costaleros parten **sin marcar** (antes todos eran "ausente"). Pulsar de nuevo el botón activo lo desmarca; nuevo contador "Sin marcar"; se puede guardar con gente sin marcar y avisa de cuántos quedan; los sin marcar no se guardan
- **Listado de costaleros**: quitada la etiqueta "sin incidencias"; solo se muestran avisos cuando hay algo que avisar ("a revisar" si hay duplicados)
- **Pantalla de Ensayos** (menú lateral → `/ensayos`, antes redirigía a Mis Pasos):
  - Todos los ensayos de todos los pasos, con el paso y su color
  - Por defecto **Futuros** (hoy incluido, del más cercano al más lejano); filtros **Futuros / Pasados / Todos**, por paso y por rango de fechas desde-hasta. Los pasados van del más reciente al más antiguo
  - Cancelados apagados, como los costaleros de baja
  - Ensayos pasados con la lista **pendiente** (nadie marcado → "Sin pasar lista"; algunos costaleros activos sin marcar → "Lista incompleta"): etiqueta en la fila y un aviso arriba (solo si hay alguno) que filtra esos ensayos. Una lista a medias cuenta como pendiente
  - Crear ensayo desde aquí eligiendo el paso, y editar con el lápiz; al terminar se vuelve a esta pantalla
- Datos de prueba nuevos: ensayos pasados (uno con lista completa, uno sin lista y uno con la lista a medias), uno cancelado y uno **de hoy**
- Corregido: al pulsar "Pasar lista" desde la pantalla de Ensayos, **volver** lleva de vuelta a Ensayos (antes llevaba al detalle del paso). Desde el detalle del paso, volver lleva a su pestaña Ensayos
- Utilidad `origenInterno()` (`core/utils/navegacion.ts`) para validar la ruta de origen que viaja en la URL
- Utilidad `hoyLocal()` compartida (`core/utils/fechas.ts`)
- Apuntado en `CONTEXT.md`: decidir cómo tratar años/temporadas, y que las fechas salgan en español

### 🧪 Pruebas pendientes de revisar
- [ ] Pase de lista: al entrar, ningún botón marcado y contador "Sin marcar" igual al total
- [ ] Pase de lista: marcar a un costalero y pulsar otra vez el mismo botón lo deja sin marcar
- [ ] Pase de lista: guardar con gente sin marcar funciona y muestra "Quedan N sin marcar"; al volver a entrar, los sin marcar siguen sin marcar
- [ ] Listado de costaleros: ya no aparece "sin incidencias"
- [ ] Menú lateral → Ensayos abre la pantalla nueva (ya no te lleva a Mis Pasos)
- [ ] Por defecto salen solo los futuros, y el primero es "Ensayo de hoy" con la etiqueta "Hoy"
- [ ] Filtro Pasados: salen del más reciente al más antiguo; el cancelado (Esperanza, lluvia) sale apagado
- [ ] El aviso "2 ensayos pasados pendientes de pasar lista" aparece; "Ensayo de trabajaderas" (Cristo) sale con "Sin pasar lista" y "Ensayo de presentación" (Gran Poder) con "Lista incompleta". El "Ensayo de costal" (Cristo, lista completa) y el cancelado de la Esperanza no cuentan
- [ ] Al pulsar el aviso, se enseñan solo esos dos ensayos
- [ ] Rango de fechas y filtro por paso funcionan, y "Limpiar filtros" vuelve a Futuros
- [ ] Nuevo ensayo desde esta pantalla: pide el paso, crea el ensayo y vuelve a la pantalla de Ensayos
- [ ] Editar un ensayo desde esta pantalla y volver a ella
- [ ] Pasar lista a "Ensayo de trabajaderas" (todos los costaleros) y completar la de "Ensayo de presentación": el aviso baja a 0 y desaparece
- [ ] Desde la pantalla de Ensayos, "Pasar lista" y luego volver lleva a Ensayos; desde el detalle del paso, volver lleva a la pestaña Ensayos de ese paso

### 📍 Estado actual
> La gestión de ensayos está completa con datos de prueba: por paso y de forma general. Falta Supabase, login, el apartado Equipo y decidir lo de los años/temporadas.

### ⏭️ Próxima sesión
- [ ] Decidir qué hacer con los enlaces **Trabajaderas** y **Auxiliares** del menú lateral (hoy no llevan a ninguna pantalla: redirigen a Mis Pasos). Ver detalle en `CONTEXT.md`
- [ ] Decidir cómo tratar años/temporadas
- [ ] Fechas y meses en español
- [ ] Conectar Supabase (cuenta, esquema SQL, RLS) y sustituir los datos de prueba
- [ ] Login con Google + guard de rutas
- [ ] Equipo: invitación por enlace de WhatsApp y permisos

---

## [0.8.0] — 2026-11-09 · Sesión 8: Duplicados, relevos, APK de Android y datos de prueba

### ✅ Hecho
- **Fechas y meses en español** en toda la app (idioma `es` registrado en `app.module.ts`)
- **Duplicados de costaleros** (listado global): asistente de dos preguntas, "¿son la misma persona?" y "¿cuál es el correcto?". Si es la misma, la ficha elegida absorbe los pasos y la asistencia de la otra (`MockDataService.fusionarPersonas`); si no, se deja de avisar de ese caso. Dos parejas de duplicados de prueba (Antonio García Pérez, Andrés Medina Ríos)
- **Trabajaderas de los pasos**: Cristo 10 de 6, Esperanza 7 de 5, Gran Poder 7 de 6. Dos pasos nuevos de prueba: **Cristo del Perdón** y **Virgen de la Alegría** (4×3)
- **Relevos** (pestaña nueva del paso). Detalle completo en `CONTEXT.md`:
  - De 2 a 20 relevos; Salida, Relevo 1, 2... y Entrada. Al reducir se quitan los de en medio; al aumentar se añaden antes de la Entrada, con aviso en ambos casos
  - Cuadrícula de la parihuela (filas = trabajaderas), calles de inicio y fin, nota si va en una trabajadera que no es la suya, copiar el anterior, vaciar
  - **Sugerir relevo** (sin IA): quien no hace la Salida hace la Entrada; trabajaderas dobladas = cambio completo; menos relevos hechos, descanso, mejor asistencia, menos pasos que saca y azar. Cada costalero mantiene su puesto durante toda la procesión
  - **Asistencia a ensayos** discreta en cada casilla y en el selector de costalero
  - Pestaña **"Relevos (nuevo)"** (prueba): todos los relevos a la vez con acciones por icono, en vista Cuadrícula o Fila deslizante. Convive con la anterior para compararlas
  - Ventana de selección de costalero compartida (`SelectorCostaleroComponent`): quien ya está en el puesto sale en la lista con el mismo tamaño que los demás, más suave y con una línea de color en el borde
- **Datos de prueba**: relevos de ejemplo en los pasos 2 a 5 (Cristo sin relevos a propósito), costaleros extra y **ensayos con listas pasadas en todos los pasos** (completas y a medias)
- **App de Android (APK de pruebas)**: JDK 21 + Android SDK instalados, proyecto `android/` creado con Capacitor y APK `mi-cuadrilla.apk`. Cómo generarlo, en `CONTEXT.md`
  - Zona segura: la barra superior y el contenido respetan la barra de estado y la de gestos; botones del menú de 44 px; iconos claros en la barra de estado
  - **Botón atrás** del móvil: cierra la ventana abierta, vuelve a la pantalla anterior y, en Mis Pasos, pregunta "¿Salir de la aplicación?"
  - La barra de pestañas de un paso **se desliza** en el móvil
- **Decisiones**: cada capataz ve solo su propio catálogo de costaleros; un auxiliar puede añadir a su nómina a un costalero de un paso donde es auxiliar escribiendo su nombre (copia, sin que el dueño pueda prohibirlo); se premia primero la asistencia y después los pasos que saca; el menú del móvil se queda arriba

### 🐛 Problemas conocidos
- `npm run build` (producción) **falla** por el límite de 4 kB de estilos por componente (`anyComponentStyle`); para el APK se usa el build de desarrollo. Hay que resolverlo antes de publicar en Google Play
- `ng test` no arranca ("no se encuentra `vitest`") aunque está instalado. La lógica de relevos se comprobó con scripts temporales fuera del proyecto
- Todo lo de esta sesión está **sin commit** en git; la carpeta `android/` tampoco está versionada

### 🧪 Pruebas pendientes de revisar
- [ ] Duplicados: las dos parejas de prueba se resuelven bien (fusionar a los Antonios, descartar a los Andrés) y el aviso desaparece
- [ ] Relevos: Virgen de la Alegría (A, B, A, B) con cada costalero siempre en el mismo puesto
- [ ] Relevos: Cristo del Perdón, con la asistencia visible, y confirmar si lo que se veía era el caso de la trabajadera 1 (pregunta 12 de `CONTEXT.md`)
- [ ] Pestaña "Relevos (nuevo)": comparar con la anterior y decidir cuál se queda
- [ ] Móvil: menú deslizable de pestañas, botón atrás y alerta de salida, selector de costalero
- [ ] Ensayos: las listas a medias salen como "Lista incompleta" y las completas no

### 📍 Estado actual
> La parte de relevos funciona con datos de prueba y hay dos versiones de la pantalla para elegir. La app ya se puede probar en el móvil con un APK. Sigue sin haber Supabase, login ni Equipo.

### ⏭️ Próxima sesión
- [ ] Tomar las decisiones de duplicados **de dos en dos** (grupos de 3 o más fichas del mismo nombre)
- [ ] Decidir qué pestaña de relevos se queda y borrar la otra
- [ ] Responder las preguntas abiertas de `CONTEXT.md` (relevos, sugerencia, trabajaderas dobladas)
- [ ] Resolver el build de producción (límites de estilos)
- [ ] Hacer commit de lo hecho; decidir si `android/` se versiona
- [ ] Conectar Supabase, login con Google y Equipo (invitación por WhatsApp + permisos)

---

## [0.9.0] — 2026-11-10 · Sesión 9: Limpieza de menú, versión e icono

### ✅ Hecho
- Menú lateral: quitado "Trabajaderas" (y la carpeta vacía `features/trabajaderas`) y el subtítulo "Semana Santa" del logo
- Título de la pestaña del navegador: "Mi Cuadrilla" (antes "Ionic App")
- Detalle del paso: flechas a los lados de la barra de pestañas cuando hay más pestañas ocultas (solo aparecen si hace falta)
- Versión visible en el menú lateral (`vX.Y.Z`), leída de `package.json` (`src/app/core/constants/version.ts`). `package.json` pasa a 0.9.0
- Icono nuevo: **llamador del Gran Poder** (dorado sobre fondo oscuro). Fuentes en `resources/*.svg`, generado para Android (normal, redondo y adaptativo), PWA (`manifest.webmanifest`) y favicon SVG. Variantes descartadas y foto de referencia en `resources/variantes/`
- APK de pruebas regenerado con todo lo anterior (`android\app\build\outputs\apk\debug\mi-cuadrilla.apk`)

### 💬 Decisiones
- Publicación: Google Play (25 $ únicos) y App Store (99 $/año) no tienen vía gratuita; de momento se prueba con APK y PWA. Cuenta de desarrollador: Gmail `enriqueprogrammer`; nombre público por decidir. Detalle en `CONTEXT.md`

### 📍 Estado actual
> Para regenerar iconos: ver `CONTEXT.md` (sección "Icono de la app"). El APK ya incluye el icono nuevo; falta probarlo en el móvil.

### ⏭️ Pendiente
- [ ] Guardar la vista "en fila" de los relevos de cada paso (cuando haya base de datos)

---

<!-- PLANTILLA para próximas sesiones:

## [0.x.0] — YYYY-MM-DD · Sesión N: Título

### ✅ Hecho
- 

### 🐛 Bugs corregidos
- 

### 📍 Estado actual
> 

### ⏭️ Próxima sesión
- [ ] 

-->
