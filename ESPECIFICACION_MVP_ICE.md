# 📋 MVP Gestor de Tareas ICE - Especificación Técnica v2.0

## 🎯 Objetivo del MVP

Aplicación web 100% frontend que permite crear tareas y obtener **sugerencias automáticas de priorización ICE** usando Google Gemini API (Free Tier). El usuario puede ajustar manualmente la puntuación y visualizar las tareas ordenadas por prioridad.

**Público objetivo**: Usuarios sin experiencia técnica  
**Stack**: HTML, CSS, JavaScript vanilla (o framework SPA: React/Vue)  
**Backend**: Ninguno - 100% frontend

---

## 🏗️ Arquitectura Técnica

### Persistencia

- **localStorage** con clave `iceTasksApp`
- Estructura JSON: `{ tasks: [...], settings: {...} }`
- Sin migraciones de esquema en v1

### API de IA

- **Google Gemini API** (modelo `gemini-1.5-flash` - Free Tier)
- API Key almacenada en `localStorage` (clave: `geminiApiKey`)
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
- **Manejo de errores**: Alert simple al usuario + permitir edición manual

---

## 📐 Modelo de Datos

### Tarea (Task)

```javascript
{
  id: string,              // UUID generado en cliente
  title: string,           // Máximo 200 caracteres, obligatorio
  description: string,     // Máximo 500 caracteres, opcional
  impact: number,          // 0-10, nullable
  confidence: number,      // 0-10, nullable
  ease: number,            // 0-10, nullable
  iceScore: number,        // 0-100, calculado: (I + C + E) / 3 * 10
  aiJustification: string, // Texto generado por IA, opcional
  status: string,          // "esperando" | "en_curso" | "hecha"
  createdAt: timestamp,    // ISO 8601
  updatedAt: timestamp     // ISO 8601
}
```

### Configuración (Settings)

```javascript
{
  geminiApiKey: string,    // API Key de Google Gemini
  hasSeenWelcome: boolean  // Para mostrar tutorial inicial
}
```

---

## 🧮 Cálculo del ICE Score

### Fórmula

```javascript
iceScore = Math.round(((impact + confidence + ease) / 3) * 10);
```

**Rango**: 0-100 (sin decimales)

**Ejemplos**:

- I=10, C=10, E=10 → Score = 100
- I=5, C=8, E=7 → Score = 67
- I=1, C=1, E=1 → Score = 3

**Criterio de ordenamiento**:

1. Por `iceScore` descendente
2. Desempate: por `createdAt` ascendente (más antiguas primero)
3. Tareas sin ICE (`iceScore = null`) al final

---

## 🤖 Integración con Google Gemini API

### Prompt Template

```
Analiza esta tarea y sugiere valores ICE (Impact, Confidence, Ease) del 0 al 10:

Título: {title}
Descripción: {description}

Responde ÚNICAMENTE con un objeto JSON válido en este formato exacto:
{
  "impact": <número 0-10>,
  "confidence": <número 0-10>,
  "ease": <número 0-10>,
  "justification": "<máximo 150 caracteres explicando brevemente>"
}

No incluyas markdown, comentarios ni texto adicional.
```

### Flujo de Sugerencia ICE

1. Usuario completa formulario (título + descripción opcional)
2. Usuario hace clic en **"Sugerir ICE con IA"** (botón secundario)
3. **Estados de UI**:
   - `loading`: Spinner + texto "Consultando IA..."
   - `error`: Alert con mensaje + habilitar edición manual
   - `success`: Valores prellenados en formulario + justificación visible

4. **Manejo de errores**:

   ```javascript
   // Si API falla (red, límite, key inválida, etc.)
   alert(
     'No se pudo obtener sugerencia de IA. Por favor, ingresa los valores manualmente.'
   );
   // Habilitar inputs I/C/E para edición manual
   ```

5. **Validación de respuesta**:
   - Parsear JSON
   - Verificar que `impact`, `confidence`, `ease` estén entre 0-10
   - Si falla validación: mismo comportamiento que error de API

---

## 🎨 Pantallas y UX

### 1. Pantalla Principal (Lista de Tareas)

**Layout**:

```
┌─────────────────────────────────────┐
│  📋 Gestor ICE de Tareas           │
│  [+ Nueva Tarea]                    │
├─────────────────────────────────────┤
│  ┌─ Esperando (5) ─┐               │
│  │ □ Tarea 1    [ICE: 87] [⋮]     │
│  │ □ Tarea 2    [ICE: 65] [⋮]     │
│  └────────────────────────┘         │
│  ┌─ En Curso (2) ──┐               │
│  │ ◐ Tarea 3    [ICE: 78] [⋮]     │
│  └────────────────────────┘         │
│  ┌─ Hechas (12) ───┐ [Ocultar]     │
│  │ ☑ Tarea 4    [ICE: 92] [⋮]     │
│  └────────────────────────┘         │
└─────────────────────────────────────┘
```

**Agrupación**:

- Tareas agrupadas por estado (colapsables)
- Orden dentro de cada grupo: por ICE descendente
- Hechas colapsadas por defecto

**Menú de acciones [⋮]**:

```
┌──────────────────┐
│ ✏️ Editar        │
│ 🔄 Cambiar estado│
│ 🗑️ Eliminar      │
└──────────────────┘
```

### 2. Modal "Nueva Tarea / Editar Tarea"

**Formulario**:

```
┌──────────────────────────────────────┐
│  Nueva Tarea               [✕ Cerrar]│
├──────────────────────────────────────┤
│  Título *                             │
│  [_________________________] 0/200    │
│                                       │
│  Descripción (opcional)               │
│  [_________________________] 0/500    │
│  [_________________________]          │
│                                       │
│  ┌─ Valores ICE ─────────────────┐   │
│  │                                │   │
│  │  Impact (0-10):     [__]       │   │
│  │  Confidence (0-10): [__]       │   │
│  │  Ease (0-10):       [__]       │   │
│  │                                │   │
│  │  ICE Score: -- / 100           │   │
│  │                                │   │
│  │  [🤖 Sugerir ICE con IA]       │   │
│  └────────────────────────────────┘   │
│                                       │
│  💡 Justificación IA:                 │
│  [Aparecerá aquí después de sugerir]  │
│                                       │
│  [Cancelar]  [Guardar Tarea]         │
└──────────────────────────────────────┘
```

**Validaciones**:

- Título obligatorio (máx 200 caracteres)
- I, C, E deben estar entre 0-10 (enteros)
- Al menos uno de I/C/E debe tener valor para calcular score

### 3. Diálogo de Confirmación (Eliminar)

```
┌──────────────────────────────────┐
│  ⚠️ Eliminar tarea               │
├──────────────────────────────────┤
│  ¿Estás seguro de eliminar      │
│  esta tarea?                     │
│                                  │
│  "Título de la tarea..."         │
│                                  │
│  Esta acción no se puede        │
│  deshacer.                       │
│                                  │
│  [Cancelar]  [Sí, eliminar]     │
└──────────────────────────────────┘
```

### 4. Cambio de Estado (Sin confirmación)

**Click en checkbox/ícono de estado**:

```
esperando → en_curso → hecha → esperando (cíclico)
```

**O menú desplegable desde [⋮]**:

```
┌──────────────────┐
│ ○ Esperando      │
│ ◐ En Curso       │
│ ☑ Hecha          │
└──────────────────┘
```

### 5. Configuración Inicial (Primera Vez)

**Modal de Bienvenida**:

```
┌──────────────────────────────────────┐
│  👋 ¡Bienvenido al Gestor ICE!       │
├──────────────────────────────────────┤
│  Para usar la sugerencia con IA,     │
│  necesitas una API Key de Google     │
│  Gemini (gratis).                    │
│                                       │
│  [📝 Obtener API Key gratis]         │
│  (abre: ai.google.dev)               │
│                                       │
│  Google Gemini API Key:              │
│  [_____________________________]     │
│                                       │
│  □ No volver a mostrar este mensaje │
│                                       │
│  [Omitir]  [Guardar y Comenzar]     │
└──────────────────────────────────────┘
```

**Nota**: Si omite, puede configurar después desde menú ⚙️ (header)

---

## 🔧 Funcionalidades Detalladas

### 1. CRUD de Tareas

#### Crear Tarea

1. Click en "+ Nueva Tarea"
2. Abrir modal con formulario vacío
3. Estado inicial: `esperando`
4. **Opción A**: Ingresar I/C/E manualmente
5. **Opción B**: Click en "Sugerir ICE con IA" → ver sección API
6. Guardar → Cerrar modal → Actualizar lista

#### Editar Tarea

1. Click en menú [⋮] → "Editar"
2. Abrir modal prellenado con datos actuales
3. Permitir modificar todo (incluso recalcular con IA)
4. Guardar → Recalcular ICE Score → Actualizar lista

#### Marcar Estado

1. **Método 1**: Click en checkbox/ícono de tarea
   - Cambia: `esperando` → `en_curso` → `hecha` (cíclico)
   - Sin confirmación
2. **Método 2**: Menú [⋮] → "Cambiar estado" → Seleccionar
   - Sin confirmación

#### Eliminar Tarea

1. Click en menú [⋮] → "Eliminar"
2. **Mostrar diálogo de confirmación** (ver diseño arriba)
3. Si confirma → Borrar de localStorage → Actualizar lista

---

## 🎨 Guía de Diseño Visual

### Paleta de Colores

```css
--primary: #4f46e5 /* Índigo - botones principales */ --secondary: #10b981
  /* Verde - éxito, IA */ --danger: #ef4444 /* Rojo - eliminar */
  --warning: #f59e0b /* Ámbar - advertencias */ --bg-primary: #ffffff
  --bg-secondary: #f9fafb --text-primary: #111827 --text-secondary: #6b7280
  --border: #e5e7eb;
```

### Estados de Tarea (Iconos)

```
esperando  → ○  (círculo vacío, gris)
en_curso   → ◐  (medio círculo, azul)
hecha      → ☑  (check, verde)
```

### ICE Score (Badge)

```css
/* Color según rango */
80-100: Verde oscuro (#059669)
60-79:  Verde (#10B981)
40-59:  Amarillo (#F59E0B)
20-39:  Naranja (#F97316)
0-19:   Rojo (#EF4444)
```

### Responsive

- Desktop (>768px): Modal centrado, max-width 600px
- Mobile (<768px): Modal fullscreen, menú [⋮] como bottom sheet

---

## 🔒 Seguridad y Limitaciones

### ⚠️ Advertencias Explícitas al Usuario

**En pantalla de configuración**:

```
⚠️ Tu API Key se guarda en tu navegador local.
   No la compartas con nadie.
   Google limita a 15 peticiones/minuto en el plan gratuito.
```

### Límites Técnicos

- **localStorage**: ~5MB → aprox. 1000-2000 tareas
- **Google Gemini Free Tier**: 15 req/min, 1500 req/día
- **Sin autenticación**: Cualquiera con la key puede usarla
- **Sin backup**: Limpiar caché del navegador = pérdida de datos

### Manejo de Límites

```javascript
// Si localStorage está lleno
try {
  localStorage.setItem('iceTasksApp', data);
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    alert('Almacenamiento lleno. Elimina tareas completadas.');
  }
}
```

---

## 📊 Criterios de Éxito del MVP

1. ✅ Usuario puede crear tarea manualmente (sin IA)
2. ✅ Usuario puede obtener sugerencia ICE de Google Gemini
3. ✅ Lista se ordena correctamente por ICE Score
4. ✅ Cambio de estados funciona intuitivamente
5. ✅ Eliminación requiere confirmación
6. ✅ Datos persisten en localStorage entre sesiones
7. ✅ UI es usable en móvil y desktop

---

## 🚀 Fuera de Alcance (v2 futura)

- ❌ Tags/etiquetas
- ❌ Filtros avanzados
- ❌ Fechas límite
- ❌ Múltiples usuarios
- ❌ Sincronización en la nube
- ❌ Exportar/importar datos
- ❌ Historial de cambios
- ❌ Subtareas
- ❌ Backend/base de datos

---

## 📝 Notas de Implementación

### Stack Recomendado

```
Framework: React (hooks) o Vue 3
UI: Tailwind CSS + Headless UI (para modals/menús)
Estado: useState + localStorage
API: fetch nativo
Despliegue: Vercel/Netlify (static hosting gratuito)
```

### Estructura de Archivos Sugerida

```
src/
├── components/
│   ├── TaskList.jsx
│   ├── TaskItem.jsx
│   ├── TaskModal.jsx
│   ├── ConfirmDialog.jsx
│   └── WelcomeModal.jsx
├── hooks/
│   ├── useTasks.js
│   ├── useGemini.js
│   └── useLocalStorage.js
├── utils/
│   ├── iceCalculator.js
│   └── storage.js
├── App.jsx
└── main.jsx
```

### Prompt Engineering (Gemini)

```javascript
const systemInstruction = `Eres un asistente experto en priorización de tareas usando el método ICE.
Impact: Impacto/valor que genera (0=nulo, 10=crítico)
Confidence: Confianza en estimaciones (0=incierto, 10=seguro)
Ease: Facilidad de ejecución (0=muy difícil, 10=trivial)

Responde SOLO con JSON válido, sin markdown.`;
```

---

## ✅ Checklist de Implementación

### Fase 1: Base (sin IA)

- [ ] Setup proyecto + Tailwind CSS
- [ ] Modelo de datos + localStorage helpers
- [ ] Lista de tareas con ordenamiento
- [ ] CRUD completo (crear, editar, eliminar)
- [ ] Cambio de estados
- [ ] Confirmación de eliminación
- [ ] Responsive mobile

### Fase 2: Integración IA

- [ ] Hook useGemini con manejo de errores
- [ ] Modal de configuración de API Key
- [ ] Botón "Sugerir ICE con IA"
- [ ] Estados loading/error/success
- [ ] Parsing y validación de respuesta JSON
- [ ] Mostrar justificación en UI

### Fase 3: Polish

- [ ] Tutorial inicial (modal welcome)
- [ ] Animaciones de transición
- [ ] Accesibilidad (ARIA labels)
- [ ] Testing en Chrome/Safari/Firefox
- [ ] Deploy en producción

---

**Fin de especificación v2.0**

**Fecha**: 14 de febrero de 2026  
**Versión**: 2.0 - Arquitectura Revisada  
**Autor**: Arquitecto Senior - Revisión técnica completa
