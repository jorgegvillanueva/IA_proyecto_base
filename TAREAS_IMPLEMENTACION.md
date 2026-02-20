# 8 tareas de implementación — Gestor ICE

Orden recomendado. Cada tarea debe dejar el proyecto ejecutable o al menos compilable donde aplique.

---

## Tarea 1 — Setup del proyecto y tipos base

- Inicializar proyecto React + TypeScript (Vite o CRA).
- Configurar Tailwind CSS y variables de diseño (paleta del README).
- Crear estructura de carpetas según README (app, features, services, shared).
- Definir tipos en código:
  - `Task`, `TaskStatus` en `features/tasks/model/task.types.ts` (o `shared/types` si se comparten).
  - `Settings` en `features/settings/model/settings.types.ts`.
  - Tipo del estado persistido `{ tasks: Task[]; settings: Settings }` para el puerto de persistencia.
- Punto de entrada `main.tsx` y `App.tsx` mínimo que renderice un título.

**Entregable:** Proyecto que compila y muestra una pantalla básica con estilos.

---

## Tarea 2 — Capa de persistencia (puerto + adapter)

- Definir el **contrato** en `services/persistence/ports/persistence.port.ts`:
  - `loadState(): Promise<{ tasks: Task[]; settings: Settings }>`
  - `saveState(state): Promise<void>`
- Implementar `localStorage.adapter.ts`: clave `iceTasksApp`, serialización JSON, manejo de `QuotaExceededError` (alert).
- Añadir `postgres.adapter.ts` como placeholder que implemente la misma interfaz (puede devolver/rechazar con mensaje "No implementado").
- Crear `services/persistence/index.ts` que exporte una instancia del adapter (por defecto localStorage).
- Añadir en `shared/lib`: `uuid.ts` (generar id), `dates.ts` (ISO 8601 para createdAt/updatedAt) si se usan.

**Entregable:** Módulo de persistencia importable; tests unitarios opcionales del adapter.

---

## Tarea 3 — Componentes shared UI

- Implementar en `shared/ui/`:
  - `Modal`: overlay + contenedor centrado, prop `onClose`, children.
  - `Button`: variantes primary, secondary, danger; disabled.
  - `Input`: controlado, maxLength, contador opcional (ej. "0/200").
  - `Spinner`: indicador de carga (texto "Consultando IA..." opcional como prop).
- Usar la paleta y tokens del README (primary, danger, etc.).
- Asegurar que los componentes sean utilizables desde `features` sin depender de lógica de negocio.

**Entregable:** Componentes reutilizables listos para usar en modales y formularios.

---

## Tarea 4 — Modelo de dominio (reducers y lógica pura)

- **Tasks:** `task.reducer.ts` con acciones add, update, delete, changeStatus. Estado: `Task[]`. Cálculo de `iceScore` y `updatedAt` en reducer o en helpers.
- **Tasks:** `features/tasks/lib/ice.ts`: función para calcular ICE Score; función para obtener color del badge según rango (0–19, 20–39, …).
- **Tasks:** `features/tasks/lib/validateTask.ts`: validación título (obligatorio, max 200) y valores I/C/E en 0–10; indicar si el formulario puede guardarse.
- **Tasks:** `task.selectors.ts`: agrupar tareas por estado y ordenar por ICE desc, createdAt asc, sin ICE al final.
- **Settings:** `settings.reducer.ts` (o estado dentro del mismo store): acciones updateApiKey, setWelcomeSeen. Estado: `Settings`.
- Unificar en un solo estado global si se usa un único reducer (tasks + settings); definir tipo `AppState`.

**Entregable:** Lógica de dominio testeable sin UI; selectors que devuelven datos listos para listas y formularios.

---

## Tarea 5 — AppProvider e hidratación

- Crear `AppProvider` que use `useReducer` con el estado de dominio (tasks + settings).
- Al montar: llamar `loadState()` del servicio de persistencia (importando desde `services/persistence`) e inicializar el estado. Manejar estado vacío (array vacío, settings por defecto: `hasSeenWelcome: false`, `geminiApiKey: ''`).
- En cada cambio de estado relevante (tras dispatch de acciones de dominio), llamar `saveState(state)`.
- Exponer estado y dispatch vía Context. Crear un hook (ej. `useAppState`) para consumir el contexto.
- `App.tsx`: envolver la app con `AppProvider` y preparar el lugar donde se renderizarán navbar, lista y modales (sin implementar aún la UI de tareas).

**Entregable:** Estado global funcionando con persistencia; app que carga y guarda en localStorage.

---

## Tarea 6 — Feature tasks: lista, tarjetas, CRUD y eliminación

- **TaskList:** leer tareas del contexto usando selectors; renderizar tres grupos (Esperando, En Curso, Hechas). Sección Hechas colapsable (estado local), colapsada por defecto.
- **TaskCard:** mostrar título, descripción breve, badge ICE (usar colores de `ice.ts`), ícono de estado (○ / ◐ / ☑). Menú [⋮] con opciones: Editar, Cambiar estado, Eliminar. Al clic en ícono de estado: cambiar estado cíclico (esperando → en_curso → hecha → esperando).
- **TaskModal:** formulario crear/editar (título, descripción, Impact, Confidence, Ease). ICE Score calculado en vivo. Botones Cancelar y Guardar; Guardar habilitado solo si validación OK. Por ahora **no** integrar botón de IA (se deja para tarea 8). Al guardar: dispatch add o update, cerrar modal.
- **DeleteTaskDialog:** mostrar título de la tarea y mensaje "Esta acción no se puede deshacer". Cancelar / Sí, eliminar; al confirmar, dispatch delete y cerrar.
- Estado local en `App` o en un contenedor: qué modal está abierto, `editingTaskId`, `deletingTaskId`. Navbar con "Gestor ICE", botón "+ Nueva Tarea" (abre TaskModal en modo crear) y botón Settings (abrir en tarea 7).
- Vista vacía cuando no hay tareas: mensaje "Crea tu primera tarea".

**Entregable:** CRUD completo de tareas, cambio de estado y eliminación con confirmación; lista ordenada y agrupada.

---

## Tarea 7 — Feature settings: bienvenida y configuración

- **WelcomeModal:** mostrado cuando `!settings.hasSeenWelcome`. Contenido: explicación breve, enlace "Obtener API Key gratis" (ai.google.dev), input para API Key, checkbox "No volver a mostrar", botones Omitir y Guardar y Comenzar. Al guardar: dispatch updateApiKey y setWelcomeSeen(true); al omitir: setWelcomeSeen(true). Cerrar y pasar al dashboard.
- **SettingsModal:** abierto desde el botón Settings del navbar. Campo para cambiar API Key y advertencia de seguridad (texto del README). Guardar actualiza solo la API Key en settings.
- Asegurar que en la primera carga se muestre WelcomeModal y que, tras omitir o guardar, no vuelva a mostrarse (según `hasSeenWelcome`).

**Entregable:** Flujo de primera vez y cambio de API Key sin tocar código de tareas ni de IA.

---

## Tarea 8 — Feature AI: Gemini y sugerencia ICE en el formulario

- **geminiClient.ts:** función que recibe `apiKey`, `title`, `description` y llama al endpoint de Gemini con el prompt del README. Parsear respuesta JSON y validar que `impact`, `confidence`, `ease` estén en 0–10. Devolver `{ impact, confidence, ease, justification }` o lanzar/retornar error.
- **useGeminiSuggestion:** hook que expone `status` (idle | loading | success | error), `error` (mensaje), `suggestion` (objeto o null), y función `suggest(title, description)` que usa la API Key del contexto. Al llamar a `suggest`, poner loading; en éxito, success y guardar suggestion; en error, error y mensaje para el usuario.
- **TaskModal (integrar):** botón "Sugerir ICE con IA". Al clic, llamar `suggest` con título y descripción actuales. Mostrar Spinner + "Consultando IA..." en loading; en error, alert y dejar inputs editables; en success, prellenar Impact/Confidence/Ease y mostrar la justificación en una caja debajo. Opcional: "Volver a sugerir" si ya hay sugerencia.
- Manejar ausencia de API Key (mensaje o deshabilitar botón si no hay key).

**Entregable:** Sugerencia ICE con IA funcionando; persistencia y resto de la app sin cambios.

---

## Resumen del orden

| #   | Tarea                                        | Dependencias                               |
| --- | -------------------------------------------- | ------------------------------------------ |
| 1   | Setup y tipos base                           | —                                          |
| 2   | Persistencia (puerto + adapter)              | Tipos Task, Settings                       |
| 3   | Shared UI                                    | —                                          |
| 4   | Modelo de dominio (reducers, ICE, selectors) | Tipos                                      |
| 5   | AppProvider e hidratación                    | Persistencia, modelo                       |
| 6   | Feature tasks (lista, CRUD, eliminar)        | AppProvider, shared UI, modelo             |
| 7   | Feature settings (welcome + settings)        | AppProvider, shared UI                     |
| 8   | Feature AI (Gemini en TaskModal)             | AppProvider, settings (API Key), shared UI |
