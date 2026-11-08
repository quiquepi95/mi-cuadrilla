# Mi Cuadrilla — Contexto del Proyecto

## 🎯 Descripción general

**Mi Cuadrilla** es una aplicación móvil (PWA primero, luego Android) pensada para capataces y auxiliares de pasos de Semana Santa. Su objetivo es digitalizar y facilitar la gestión de la cuadrilla de costaleros: igualá, control de asistencia a ensayos y colocación en el paso.

El problema que resuelve: sustituir el uso de Excel en móvil (muy incómodo) por una app nativa diseñada específicamente para este dominio.

---

## 🏗️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Angular 22 + Ionic 9 |
| Mobile runtime | Capacitor 8 |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth (OAuth con Google) |
| Publicidad | Google AdMob (no intrusiva: banners) |
| Analítica | Firebase Analytics |
| Plataforma objetivo | PWA → Android (Google Play) |
| Lenguaje | TypeScript |

---

## 👥 Roles de usuario

| Rol | Descripción |
|-----|-------------|
| `owner` (Capataz) | Crea y gestiona el paso. Puede invitar auxiliares. Control total. |
| `auxiliar` | Ayudante del capataz. Permisos limitados definidos por el capataz. |

> Los **costaleros NO tienen acceso a la app**. Son datos gestionados por capataz/auxiliares.

---

## 📦 Entidades del dominio

### Paso
El proyecto principal. Un capataz puede tener varios pasos (ej: "Cristo de la Buena Muerte", "Virgen de la Esperanza").

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| nombre | string | Nombre del paso |
| descripcion | string? | Descripción opcional |
| imagen_url | string? | Foto del paso |
| owner_id | UUID | Capataz propietario |
| num_trabajaderas | number | Número de trabajaderas del paso |

### Trabajadera
Cada paso tiene N trabajaderas. La de referencia (la más alta) tiene `diferencia_altura_cm = 0`.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| paso_id | UUID | Paso al que pertenece |
| numero | number | Orden (1, 2, 3...) |
| diferencia_altura_cm | number | Diferencia respecto a la trabajadera de referencia. La más alta = 0. Valor introducido manualmente tras la igualá. |
| capacidad | number | Costaleros que caben en esta trabajadera |

### Costalero
Un costalero puede estar en varios pasos, en trabajaderas diferentes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| paso_id | UUID | Paso al que pertenece (esta asignación) |
| trabajadera_id | UUID | Trabajadera asignada en este paso |
| nombre | string | Nombre |
| apellidos | string | Apellidos |
| telefono | string? | Teléfono de contacto |
| calzo_cm | number | Suplemento en cm respecto al más alto de su trabajadera (0 = el más alto) |
| es_aspirante | boolean | Si es aspirante o titular |
| posicion | number? | Posición dentro de la trabajadera (para mapa visual) |
| notas | string? | Anotaciones libres |

### Ensayo
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| paso_id | UUID | Paso al que pertenece |
| fecha | date | Fecha del ensayo |
| descripcion | string? | Descripción opcional |
| lugar | string? | Lugar del ensayo |

### Asistencia
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| ensayo_id | UUID | Ensayo |
| costalero_id | UUID | Costalero |
| estado | enum | `presente` / `ausente` / `justificada` |
| notas | string? | Motivo de ausencia, etc. |

---

## 🗺️ Flujo principal de uso

1. **Crear paso**: el capataz crea un paso indicando nombre y número de trabajaderas
2. **Configurar trabajaderas**: indica la capacidad y diferencia de altura de cada una (tras la igualá)
3. **Añadir costaleros**: uno a uno o en batch (formulario de array), asignándolos a una trabajadera
4. **Compartir con auxiliares**: el capataz invita por email a auxiliares
5. **Programar ensayos**: añade fechas de ensayo
6. **Pase de lista**: el día del ensayo, marca asistencia costalero a costalero con un check
7. **Relevos**: pendiente de definir (fase futura)
8. **Marchas y recorrido**: pendiente de definir (fase muy futura)

---

## 💰 Modelo de negocio

- App **gratuita**
- Monetización con **Google AdMob** (banners no intrusivos, evitar intersticiales en flujos de trabajo críticos)

---

## 📁 Estructura de carpetas

```
src/app/
├── core/
│   ├── guards/          # Auth guards
│   ├── interceptors/    # HTTP interceptors
│   ├── services/        # Servicios globales (Supabase, Auth, etc.)
│   └── models/          # Interfaces y tipos TypeScript
├── shared/
│   ├── components/      # Componentes reutilizables
│   └── pipes/           # Pipes personalizados
└── features/
    ├── auth/            # Login, registro
    ├── pasos/           # CRUD de pasos
    ├── costaleros/      # CRUD de costaleros
    ├── trabajaderas/    # Configuración de trabajaderas
    └── ensayos/         # Ensayos y pase de lista
```

---

## 🔮 Pendiente / Futuro

- [ ] Sistema de relevos (definir lógica)
- [ ] Mapa visual de colocación en el paso
- [ ] Marchas musicales y recorrido de procesión
- [ ] Notificaciones push (recordatorio de ensayo)
- [ ] Exportar datos (PDF de la cuadrilla, lista de asistencia)
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
