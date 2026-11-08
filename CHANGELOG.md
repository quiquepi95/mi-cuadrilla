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
