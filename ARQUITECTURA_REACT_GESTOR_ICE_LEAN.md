# Arquitectura Lean - Gestor ICE (React + TypeScript)

Versión simplificada para MVP, priorizando mantenibilidad y velocidad de entrega sin perder calidad.

---

## Principios de esta versión

- Minimizar capas hasta que exista una necesidad real.
- Organizar por **feature** (dominio), no por tipo técnico.
- Mantener estado global pequeño; dejar UI efímera en estado local.
- Evitar “micro-componentes” prematuros.
- No usar Redux al inicio; dejar ruta de migración clara.

---

## 1) Estructura de carpetas (feature-first, simple)

```txt
src/
├── app/
│   ├── App.tsx
│   ├── AppProvider.tsx            # Context + reducer de dominio
│   └── routes.tsx                 # (opcional, si luego crece)
│
├── features/
│   ├── tasks/
│   │   ├── components/
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskModal.tsx
│   │   │   └── DeleteTaskDialog.tsx
│   │   ├── model/
│   │   │   ├── task.types.ts
│   │   │   ├── task.reducer.ts
│   │   │   └── task.selectors.ts
│   │   └── lib/
│   │       ├── ice.ts             # cálculo + color badge
│   │       └── validateTask.ts
│   │
│   ├── settings/
│   │   ├── components/
│   │   │   ├── WelcomeModal.tsx
│   │   │   └── SettingsModal.tsx
│   │   ├── model/
│   │   │   ├── settings.types.ts
│   │   │   └── settings.reducer.ts
│   │   └── lib/
│   │       └── validateApiKey.ts
│   │
│   └── ai/
│       ├── hooks/
│       │   └── useGeminiSuggestion.ts
│       └── services/
│           └── geminiClient.ts
│
├── services/
│   └── persistence/
│       ├── ports/
│       │   └── persistence.port.ts      # Contrato (interface) de persistencia
│       ├── adapters/
│       │   ├── localStorage.adapter.ts  # Implementación actual MVP
│       │   └── postgres.adapter.ts      # Placeholder para futuro backend
│       └── index.ts                     # Binding: exporta el adapter activo (único archivo a cambiar)
│
├── shared/
│   ├── ui/
│   │   ├── Modal.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Spinner.tsx
│   ├── lib/
│   │   ├── dates.ts
│   │   └── uuid.ts
│   └── types/
│       └── app.types.ts
│
├── main.tsx
└── index.css
```

### Por qué mejora mantenibilidad

- Todo lo de tareas vive en `features/tasks` (alta cohesión).
- Reducimos saltos mentales entre `hooks/`, `utils/`, `services/`, `context/` globales.
- Reutilizables reales en `shared/ui`; lo específico no se “sobre-abstrae”.

---

## 2) División de componentes (versión compacta)

### Dashboard

- `TaskList`
  - Renderiza grupos: Esperando / En Curso / Hechas.
  - Maneja colapso de “Hechas” (estado local del componente o persistido si hace falta).
- `TaskCard`
  - Título, descripción breve, badge ICE, icono de estado, menú acciones.
- `TaskModal`
  - Crear/editar en una sola pieza (sin fragmentar de inicio en 5 subcomponentes).
  - Integra inputs de I/C/E, score en vivo, botón IA, justificación IA.
- `DeleteTaskDialog`
  - Confirmación simple.

### Settings / bienvenida

- `WelcomeModal`
  - Primera ejecución, API key opcional, “no mostrar más”.
- `SettingsModal`
  - Cambio de API key posterior desde navbar.

### Shared UI (solo lo realmente común)

- `Modal`, `Button`, `Input`, `Spinner`

> Regla práctica: extraer componente solo cuando se reutiliza de verdad o reduce complejidad local.

---

## 3) Estado sin librerías externas (recomendado)

## 3.1 Estado global (solo dominio)

En `AppProvider` mantener únicamente:

- `tasks: Task[]`
- `settings: { geminiApiKey: string; hasSeenWelcome: boolean }`

Reducer con acciones de dominio:

- `task/add`
- `task/update`
- `task/delete`
- `task/changeStatus`
- `settings/updateApiKey`
- `settings/setWelcomeSeen`

## 3.2 Estado local (UI efímera)

Dejar en componentes:

- Apertura/cierre de modales.
- `editingTaskId`, `deletingTaskId`.
- Estado loading/error/success de sugerencia IA dentro de `TaskModal`.
- Estado colapsado de sección “Hechas” (si no requiere persistencia).

### Beneficio

- Menos rerenders globales.
- Menor acoplamiento entre pantallas.
- Reducer más estable y fácil de testear.

---

## 4) Persistencia (simple y robusta)

### 4.1 Inversión de dependencias (puerto + adapter)

Definir un **contrato estable** de persistencia y hacer que React dependa de ese contrato, no de `localStorage`.

- `services/persistence/ports/persistence.port.ts` define la interfaz (ej.: `loadState`, `saveState`).
- `services/persistence/adapters/localStorage.adapter.ts` implementa el contrato para navegador.
- `services/persistence/adapters/postgres.adapter.ts` implementará el mismo contrato cuando exista backend.
- `services/persistence/index.ts` hace el **binding** del adapter activo.

### 4.2 Regla de oro para migrar a PostgreSQL

Para cambiar de `localStorage` a PostgreSQL, la app React no se toca:

- `AppProvider`, reducers, hooks y componentes consumen solo el contrato.
- Se cambia únicamente `services/persistence/index.ts` para apuntar al nuevo adapter.

### 4.3 Flujo recomendado

1. `AppProvider` usa `persistenceService.loadState()` al arrancar.
2. En cambios de estado de dominio, invoca `persistenceService.saveState(state)`.
3. El adapter resuelve detalles técnicos (localStorage, HTTP API, etc.).

### 4.4 Beneficios directos

- Menor acoplamiento de React con infraestructura.
- Cambio de tecnología de persistencia con impacto mínimo.
- Mejor testeo (mock del puerto en tests de provider/hooks).
- Mantiene arquitectura lean, pero preparada para evolucionar.

---

## 5) IA (Gemini) con bajo acoplamiento

- `features/ai/services/geminiClient.ts`: hace fetch, parsea y valida respuesta.
- `useGeminiSuggestion`: orquesta llamada y expone `status`, `error`, `suggest`.
- `TaskModal` decide cómo aplicar sugerencia al formulario.

Así, la lógica de red queda separada de UI sin sobrediseñar.

---

## 6) ¿Redux merece la pena aquí?

### Decisión recomendada: **No, por ahora**

Con este alcance MVP (frontend-only, CRUD local, 1 integración API puntual), Context + reducer es suficiente.

### Señales para migrar a Redux Toolkit más adelante

- Múltiples features nuevas con estado compartido intenso (filtros complejos, vistas múltiples, analytics en vivo).
- Async workflows más complejos (colas, retry, cancelación, cache extensa).
- Necesidad fuerte de trazabilidad global de acciones y debugging avanzado.
- Equipo creciendo y necesidad de convención estricta.

---

## 7) Plan de evolución (sin reescribir)

1. Empezar con esta arquitectura lean.
2. Añadir tests de reducer/selectors en `features/tasks/model`.
3. Introducir puerto+adapter de persistencia desde el inicio (`services/persistence`).
4. Si crece complejidad, dividir contextos (`TasksContext`, `SettingsContext`).
5. Solo si sigue creciendo: migrar a Redux Toolkit manteniendo estructura por features.

---

## 8) Riesgos evitados con esta versión

- Evita “god reducer” mezclando dominio + UI.
- Evita explosion temprana de componentes pequeños.
- Evita dispersión de lógica en demasiadas carpetas horizontales.
- Evita acoplar React a `localStorage` o a una base concreta.
- Mantiene una ruta de escalado clara sin coste inicial alto.

---

**Conclusión:**  
Para el Gestor ICE actual, una arquitectura lean por features con Context + reducer y UI local es la opción con mejor balance entre simplicidad, mantenibilidad y capacidad de crecimiento.
