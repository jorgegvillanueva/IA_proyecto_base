# Propuesta Arquitectónica - Gestor ICE (React + TypeScript)

Documento generado a partir del flujo definido del Gestor ICE, diagramas y wireframes del proyecto.  
**Stack:** React con TypeScript. **Estado:** sin librerías externas (Context API + useReducer).

---

## 1. Estructura de Carpetas

```
src/
├── types/                              # Tipos e interfaces TypeScript
│   ├── index.ts                        # Barrel export
│   ├── task.ts                         # Task, TaskStatus, ICEValues
│   └── settings.ts                     # Settings, AppState, UI state
│
├── constants/                          # Constantes de la aplicación
│   ├── index.ts                        # Barrel export
│   ├── iceRanges.ts                    # Rangos de color ICE (0-19, 20-39...)
│   └── storage.ts                      # Claves localStorage, límites
│
├── utils/                              # Funciones puras (sin side effects)
│   ├── iceCalculator.ts                # Cálculo: (I+C+E)/3*10
│   ├── taskSorter.ts                   # Ordenamiento por ICE desc + agrupación por estado
│   ├── validators.ts                   # Validación de formularios (título, ICE 0-10)
│   └── uuid.ts                         # Generación de UUID en cliente
│
├── services/                           # Integraciones con servicios externos
│   └── geminiService.ts                # Llamadas a Google Gemini API + parsing JSON
│
├── hooks/                              # Custom hooks
│   ├── useLocalStorage.ts              # Hook genérico de sincronización con localStorage
│   ├── useTasks.ts                     # Operaciones CRUD de tareas (consume contexto)
│   ├── useSettings.ts                  # Gestión de configuración (consume contexto)
│   └── useGemini.ts                    # Sugerencia IA con estados loading/error/success
│
├── context/                            # Estado global con Context API
│   ├── AppContext.tsx                   # Definición del contexto + tipos
│   └── AppProvider.tsx                 # Provider con useReducer + sync localStorage
│
├── components/                         # Componentes de UI
│   ├── layout/                         # Estructura general
│   │   ├── Navbar.tsx                  # Barra superior: Logo + "Nueva Tarea" + Settings
│   │   └── Layout.tsx                  # Wrapper principal del dashboard
│   │
│   ├── common/                         # Componentes reutilizables genéricos
│   │   ├── Modal.tsx                   # Modal base (overlay + contenedor)
│   │   ├── Button.tsx                  # Botón con variantes (primary, secondary, danger)
│   │   ├── Input.tsx                   # Input con contador de caracteres
│   │   ├── Textarea.tsx                # Textarea con contador de caracteres
│   │   ├── Badge.tsx                   # Badge ICE Score con colores por rango
│   │   ├── Spinner.tsx                 # Indicador de carga
│   │   └── ConfirmDialog.tsx           # Diálogo de confirmación genérico
│   │
│   ├── tasks/                          # Componentes específicos de tareas
│   │   ├── TaskList.tsx                # Lista principal con agrupación por estado
│   │   ├── TaskGroup.tsx               # Sección colapsable (Esperando, En Curso, Hechas)
│   │   ├── TaskCard.tsx                # Tarjeta individual de tarea
│   │   ├── TaskActionMenu.tsx          # Menú contextual [⋮] (editar, estado, eliminar)
│   │   ├── TaskModal.tsx               # Modal crear/editar (orquestador)
│   │   ├── TaskForm.tsx                # Formulario dentro del modal
│   │   ├── ICEInputs.tsx              # Grupo de inputs Impact/Confidence/Ease
│   │   ├── ICEScoreDisplay.tsx        # Visualización del score calculado + badge
│   │   ├── AIJustification.tsx        # Caja de justificación IA (texto verde)
│   │   ├── AISuggestButton.tsx        # Botón "Sugerir ICE con IA" con estados
│   │   ├── StatusIcon.tsx             # Icono de estado (○ ◐ ☑)
│   │   ├── EmptyState.tsx             # Vista cuando no hay tareas
│   │   └── DeleteTaskDialog.tsx       # Diálogo de confirmación de eliminación
│   │
│   └── settings/                       # Componentes de configuración
│       ├── WelcomeModal.tsx            # Modal de bienvenida (primera vez)
│       ├── SettingsModal.tsx           # Modal de configuración (API Key)
│       └── ApiKeyInput.tsx             # Input de API Key con advertencia de seguridad
│
├── App.tsx                             # Componente raíz (orquesta modales + dashboard)
├── main.tsx                            # Entry point (ReactDOM.createRoot)
└── index.css                           # Estilos globales / imports de Tailwind
```

---

## 2. División en Componentes (Mapa Visual)

Basado en los diagramas y wireframes, esta es la jerarquía de componentes y cómo se mapean a las 6 pantallas del diagrama `pantallas_componentes_app.png`.

### Pantalla 1 - Modal de Bienvenida

```
WelcomeModal
├── Modal (common)
├── Button ("Obtener API Key gratis") → link externo
├── ApiKeyInput
├── Input (checkbox "No volver a mostrar")
├── Button ("Omitir")
└── Button ("Guardar y Empezar")
```

### Pantallas 2 y 3 - Dashboard (Vacío y con Tareas)

```
App
├── AppProvider (context)
│   ├── Layout
│   │   ├── Navbar
│   │   │   ├── Logo/Título "Gestor ICE"
│   │   │   ├── Button ("+ Nueva Tarea")
│   │   │   └── Button (Settings ⚙️)
│   │   │
│   │   └── [Contenido condicional]
│   │       ├── EmptyState (si no hay tareas)
│   │       │
│   │       └── TaskList (si hay tareas)
│   │           ├── TaskGroup ("Esperando")
│   │           │   └── TaskCard (×N)
│   │           │       ├── StatusIcon (○)
│   │           │       ├── Título + descripción
│   │           │       ├── Badge (ICE Score)
│   │           │       └── TaskActionMenu [⋮]
│   │           │
│   │           ├── TaskGroup ("En Curso")
│   │           │   └── TaskCard (×N)
│   │           │       ├── StatusIcon (◐)
│   │           │       └── ...
│   │           │
│   │           └── TaskGroup ("Hechas") [colapsada por defecto]
│   │               └── TaskCard (×N)
│   │                   ├── StatusIcon (☑)
│   │                   └── ...
│   │
│   ├── WelcomeModal (condicional: primera vez)
│   ├── SettingsModal (condicional: click en ⚙️)
│   ├── TaskModal (condicional: crear/editar)
│   └── DeleteTaskDialog (condicional: eliminar)
```

### Pantallas 4 y 5 - Modal de Tarea (Vacío y con IA)

```
TaskModal
├── Modal (common)
├── TaskForm
│   ├── Input (Título, max 200, obligatorio)
│   ├── Textarea (Descripción, max 500, opcional)
│   ├── AISuggestButton
│   │   ├── Spinner (estado: loading)
│   │   └── Texto dinámico ("Sugerir ICE con IA" / "Volver a sugerir")
│   ├── ICEInputs
│   │   ├── Input (Impact 0-10)
│   │   ├── Input (Confidence 0-10)
│   │   └── Input (Ease 0-10)
│   ├── ICEScoreDisplay
│   │   └── Badge (score calculado en tiempo real)
│   ├── AIJustification (visible solo tras sugerencia IA)
│   ├── Button ("Cancelar")
│   └── Button ("Guardar Tarea" - deshabilitado si validación falla)
```

### Pantalla 6 - Diálogo de Eliminación

```
DeleteTaskDialog
├── ConfirmDialog (common)
│   ├── Icono de advertencia
│   ├── Título de la tarea a eliminar
│   ├── Mensaje "Esta acción no se puede deshacer"
│   ├── Button ("Cancelar")
│   └── Button ("Sí, eliminar" - variante danger)
```

---

## 3. Gestión del Estado (sin librerías externas)

La estrategia se basa en **3 capas** usando solo React nativo.

### Capa 1: `useReducer` — Estado centralizado

Un reducer principal en `AppProvider` gestiona **todo** el estado de la aplicación.

**Estado (AppState):**

| Propiedad                 | Tipo           | Descripción                           |
| ------------------------- | -------------- | ------------------------------------- |
| `tasks`                   | `Task[]`       | Array de todas las tareas             |
| `settings.geminiApiKey`   | `string`       | API Key de Gemini                     |
| `settings.hasSeenWelcome` | `boolean`      | Si ya vio el modal de bienvenida      |
| `ui.isTaskModalOpen`      | `boolean`      | Control del modal crear/editar        |
| `ui.editingTask`          | `Task \| null` | Tarea en edición (null = crear nueva) |
| `ui.isDeleteDialogOpen`   | `boolean`      | Control del diálogo de eliminación    |
| `ui.deletingTask`         | `Task \| null` | Tarea pendiente de eliminar           |
| `ui.isWelcomeModalOpen`   | `boolean`      | Control del modal de bienvenida       |
| `ui.isSettingsModalOpen`  | `boolean`      | Control del modal de settings         |

**Acciones del Reducer:**

| Acción                | Payload             | Efecto                               |
| --------------------- | ------------------- | ------------------------------------ |
| `ADD_TASK`            | `Task`              | Agrega tarea al array                |
| `UPDATE_TASK`         | `Task`              | Actualiza tarea existente por id     |
| `DELETE_TASK`         | `string (id)`       | Elimina tarea del array              |
| `CHANGE_STATUS`       | `{ id, newStatus }` | Cambia estado de la tarea            |
| `UPDATE_API_KEY`      | `string`            | Actualiza la API Key                 |
| `SET_WELCOME_SEEN`    | `boolean`           | Marca bienvenida como vista          |
| `OPEN_TASK_MODAL`     | `Task \| null`      | Abre modal (null=crear, Task=editar) |
| `CLOSE_TASK_MODAL`    | -                   | Cierra modal y limpia editingTask    |
| `OPEN_DELETE_DIALOG`  | `Task`              | Abre diálogo con la tarea a eliminar |
| `CLOSE_DELETE_DIALOG` | -                   | Cierra diálogo y limpia deletingTask |
| `TOGGLE_SETTINGS`     | `boolean`           | Abre/cierra modal de configuración   |
| `TOGGLE_WELCOME`      | `boolean`           | Abre/cierra modal de bienvenida      |

### Capa 2: `createContext` — Distribución del estado

```
AppContext provee:
├── state         → Estado completo (AppState)
└── dispatch      → Función dispatch del reducer
```

`AppProvider` envuelve `App` y se encarga de:

- Inicializar el estado desde `localStorage` al montar
- Sincronizar a `localStorage` en cada cambio vía `useEffect`
- Detectar si es primera visita (`hasSeenWelcome === false`) para abrir el modal

### Capa 3: Custom Hooks — Interfaz de dominio

Los hooks encapsulan la lógica de negocio y exponen operaciones de alto nivel.

**`useTasks()`** — Consume AppContext

| Método                     | Descripción                                     |
| -------------------------- | ----------------------------------------------- |
| `tasks`                    | Array de tareas                                 |
| `groupedTasks`             | Tareas agrupadas por estado y ordenadas por ICE |
| `addTask(data)`            | Crea tarea con UUID + timestamps + calcula ICE  |
| `updateTask(id, data)`     | Actualiza tarea + recalcula ICE + updatedAt     |
| `deleteTask(id)`           | Elimina tarea                                   |
| `changeStatus(id, status)` | Cambia estado de la tarea                       |

**`useSettings()`** — Consume AppContext

| Método              | Descripción                 |
| ------------------- | --------------------------- |
| `apiKey`            | API Key actual              |
| `hasSeenWelcome`    | Si ya vio la bienvenida     |
| `updateApiKey(key)` | Guarda nueva API Key        |
| `markWelcomeSeen()` | Marca bienvenida como vista |

**`useGemini()`** — Hook independiente (estado local)

| Método                           | Descripción                                           |
| -------------------------------- | ----------------------------------------------------- |
| `status`                         | `'idle' \| 'loading' \| 'success' \| 'error'`         |
| `suggestion`                     | `{ impact, confidence, ease, justification } \| null` |
| `error`                          | Mensaje de error                                      |
| `suggestICE(title, description)` | Llama a Gemini API + parsea respuesta                 |
| `reset()`                        | Limpia el estado de sugerencia                        |

Este hook usa `useState` local (no contexto global) porque el estado de la llamada IA es transitorio y solo relevante dentro de `TaskForm`.

**`useLocalStorage(key)`** — Hook utilitario

| Método           | Descripción                     |
| ---------------- | ------------------------------- |
| `value`          | Valor actual desde localStorage |
| `setValue(data)` | Persiste en localStorage        |

### Flujo de datos simplificado

```
localStorage (persistencia)
    ↕ useLocalStorage (sincronización)
AppProvider + useReducer (estado centralizado)
    ↕ AppContext (distribución)
Custom Hooks: useTasks, useSettings (lógica de dominio)
    ↕
Componentes (UI)
    ↕ useState local
useGemini (estado transitorio de IA)
```

---

## 4. Decisiones Arquitectónicas Clave

| Decisión                                             | Justificación                                                                                                                                                                                      |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Un solo Context** en lugar de múltiples            | La app es pequeña (MVP). Un contexto evita complejidad innecesaria. Si escala, se puede dividir en `TaskContext` y `SettingsContext`.                                                              |
| **`useReducer` sobre `useState`** para estado global | Las operaciones sobre tareas son múltiples (CRUD + estados). Un reducer centraliza las transiciones y facilita la depuración.                                                                      |
| **`useGemini` con estado local**                     | El estado de la llamada IA (loading/error/success) es efímero y solo lo consume `TaskForm`. No necesita ser global.                                                                                |
| **Componentes `common/` separados**                  | `Modal`, `Button`, `Badge`, etc. se reutilizan en múltiples pantallas. Separarlos facilita la consistencia visual.                                                                                 |
| **`services/` separado de `hooks/`**                 | `geminiService.ts` contiene solo la lógica de fetch + parsing (sin React). `useGemini` lo consume y maneja el ciclo de vida React. Esto permite testear el servicio independientemente.            |
| **`types/` en carpeta propia**                       | Los tipos de `Task`, `Settings` y `AppState` se comparten entre hooks, context, utils y componentes. Centralizarlos evita importaciones circulares.                                                |
| **Modales como hijos de `App`**                      | Los modales se renderizan al nivel de `App` (no dentro de los componentes que los disparan). Esto simplifica el z-index y el manejo de overlay. El estado UI del reducer controla cuál se muestra. |

---

**Fin del documento.**  
Referencias: `ESPECIFICACION_MVP_ICE.md`, carpeta `diagramas/`, carpeta `wireframes/`.
