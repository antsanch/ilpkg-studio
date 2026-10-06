# Política de Componentes Frontend, Estándares MUI v6 y Auditoría React Doctor

**Proyecto:** ILPKG Studio (Interactive Lesson Package Studio)  
**Versión:** 1.0  
**Fecha de Aprobación:** 2026-09-28  
**Ámbito:** Arquitectura frontend (`resources/js/`), componentes React, integración Material-UI (MUI v6) y ciclo de calidad de código.

---

## 1. Declaración de Propósito y Filosofía Arquitectónica

La estación de autoría y reproductor **ILPKG Studio** requiere un frontend modular, de alto rendimiento, accesible y de fácil mantenimiento a largo plazo. Esta política establece directrices obligatorias para:
1. **Erradicar los megacomponentes** mediante arquitectura de componentes atómicos, enfocados y con responsabilidad única (*Single Responsibility Principle*).
2. **Aplicar la sintaxis y estándares modernos de Material-UI v6 (MUI)** garantizando accesibilidad WAI-ARIA y ergonomía visual para estudiantes y docentes.
3. **Auditar de forma automatizada y continua el código React con React Doctor**, garantizando una calificación de salud de código de **100/100 (0 issues)** previa a la integración en la rama `develop`.

---

## 2. Prevención de Megacomponentes y Modularidad

### 2.1 Principio de Responsabilidad Única (SRP)
Cada componente debe realizar **una única función bien delimitada**:
* **Componentes de Presentación Puros (Dumb/Presentational Components):** Reciben datos e invierten dependencias mediante props, no contienen llamadas de red ni sincronizaciones complejas de ciclo de vida.
* **Componentes de Diálogo / Modal:** Gestionan exclusivamente la apertura/cierre y el layout del modal, delegando el contenido del formulario o visualización a subcomponentes dedicados.
* **Vistas Orquestadoras (Page Controllers):** Ubicadas en `resources/js/Pages/{Modulo}/Index.tsx`. Orquestan el estado global de la página, consumen servicios HTTP y coordinan los subcomponentes, pero no implementan lógica de marcado denso de tablas, filtros o formularios dentro de sí mismas.

### 2.2 Límites de Tamaño y Complejidad
* **Límite sugerido:** Ningún componente React individual debe superar las **150-200 líneas de código**. Si un componente supera este tamaño, debe ser descompuesto en subcomponentes especializados.
* Si una sección de JSX (ej. una fila de tabla, un diálogo, un resumen de métricas o una tarjeta de visualización) abarca más de 40 líneas de estructura, debe ser encapsulada en su propio componente reutilizable.

### 2.3 Estructura de Directorios Modular por Dominio
Todo nuevo módulo funcional debe organizarse en una carpeta dedicada dentro de `resources/js/Components/{Modulo}/` con la siguiente taxonomía:

```text
resources/js/Components/{Modulo}/
├── types.ts                    # Interfaces, tipos y contratos de datos específicos
├── {Modulo}ListTable.tsx       # Contenedor y cabeceras de tabla / listado
├── {Modulo}TableRow.tsx        # Fila individual con menú contextual y acciones
├── {Modulo}FormDialog.tsx      # Modal y formulario de creación/edición
├── {Modulo}ExportModal.tsx     # Diálogo de exportación o utilidades secundarias
├── {Modulo}AnalyticsModal.tsx  # Modal presentacional de telemetría / métricas
├── {Modulo}AnalyticsSummary.tsx# Tarjetas de indicadores KPI individuales
└── {Modulo}CustomInput.tsx     # Controles atómicos con reglas de entrada estrictas
```

---

## 3. Estándares y Sintaxis Correcta de Material-UI v6 (MUI)

Para evitar incompatibilidades con versiones obsoletas de Material-UI (MUI v4/v5) y mantener consistencia con React 19:

### 3.1 Uso Estricto de `slotProps` (Reemplazo de Props Deprecadas)
* En MUI v6, las propiedades `inputProps` e `InputProps` en componentes como `TextField`, `Select` o `Autocomplete` han sido deprecadas en favor del objeto unificado `slotProps`.
* **Regla:** Utilizar siempre `slotProps={{ htmlInput: { ... } }}` para atributos directos del `<input>` (como `data-testid`, `maxLength`, `pattern`), y `slotProps={{ input: { ... } }}` para el contenedor decorativo (`InputAdornment`, iconos).

```tsx
// ✅ Correcto (MUI v6)
<TextField
    fullWidth
    label="Alias de Acceso"
    value={code}
    onChange={(e) => onChange(e.target.value)}
    slotProps={{
        htmlInput: {
            'data-testid': 'custom-alias-input',
            maxLength: 12,
            style: { textTransform: 'uppercase' },
        },
    }}
/>

// ❌ Incorrecto (Sintaxis antigua / deprecada en MUI v6)
<TextField
    inputProps={{ 'data-testid': 'custom-alias-input' }}
    InputProps={{ startAdornment: <SearchIcon /> }}
/>
```

### 3.2 Integración con el Sistema de Diseño Ergonómico (`studioTheme.ts`)
* Los colores, sombras y radios deben provenir del tema institucional de ILPKG Studio (`resources/js/Theme/studioTheme.ts`), respetando los modos claro y oscuro (*Dark Clinical Theme*).
* Prohibido hardcodear colores hexadecimales o nombres directos de CSS (`style={{ color: '#1976d2' }}`). Usar la prop `sx` con tokens de tema (`sx={{ color: 'primary.main', bgcolor: 'background.default' }}`).

### 3.3 Sintaxis Moderna de `Grid` (MUI v6)
* En MUI v6, el sistema de cuadrícula se unifica bajo el nuevo motor `Grid` (anteriormente `Grid2`):
  1. Se **elimina la prop booleana `item`**.
  2. Las dimensiones responsivas ya no se declaran como props directas (`xs={12} sm={4}`); se utiliza obligatoriamente la prop unificada `size={{ xs: 12, sm: 4 }}` (o `size={12}`).
  3. El contenedor mantiene `<Grid container spacing={2}>`.

```tsx
// ✅ Correcto (MUI v6)
<Grid container spacing={2}>
    <Grid size={{ xs: 12, sm: 4 }}>
        <Card>...</Card>
    </Grid>
</Grid>

// ❌ Incorrecto (Sintaxis v5 deprecada en v6)
<Grid container spacing={2}>
    <Grid item xs={12} sm={4}>
        <Card>...</Card>
    </Grid>
</Grid>
```

### 3.4 Consulta Continua a la Documentación / MCP de MUI
* Antes de implementar nuevos componentes complejos (ej. *DataGrid*, *SpeedDial*, *TreeItem*, *Stepper*), se debe verificar la especificación vigente de MUI v6 para:
  1. Confirmar el árbol de props y slots válidos.
  2. Cumplir con los estándares de accesibilidad WAI-ARIA (roles nativos como `switch`, `dialog`, `progressbar`).

---

## 4. Prohibición Estricta de TailwindCSS (Zero-Tailwind Policy)

Queda **terminantemente prohibido el uso de TailwindCSS** en cualquier componente, página, layout o vista de la plataforma ILPKG Studio.

### 4.1 Fundamento y Justificación Técnica
1. **Evitar Conflictos de Especificidad:** La coexistencia de utilidades de Tailwind con el motor de estilos Emotion / MUI v6 genera colisiones en cascada y comportamientos visuales impredecibles al alternar entre temas claro y oscuro.
2. **Centralización del Sistema de Diseño:** Todos los tokens de espaciado, paleta cromática ergonómica, tipografía y bordes residen exclusivamente en `resources/js/Theme/studioTheme.ts`. El uso de clases utilitarias ad-hoc dispersa los valores de diseño y atenta contra la consistencia visual de la aplicación.
3. **Optimización del Bundle y Limpieza de Build:** Eliminar TailwindCSS suprime dependencias pesadas innecesarias (`tailwindcss`, `@tailwindcss/vite`) y erradica advertencias del minificador/bundler Vite (`lightningcss`).

### 4.2 Reglas de Estilizado Obligatorias
* **Componentes y Layouts:** Usar componentes estructurales de Material-UI (`Box`, `Container`, `Stack`, `Grid size={...}`, `Card`, `Paper`).
* **Estilos Dinámicos y Específicos:** Emplear la prop `sx` con acceso a los tokens del tema (`sx={{ display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'background.paper' }}`).
* **Estilos Globales de Reseteo:** Manejados a través de `<CssBaseline />` de MUI y Vanilla CSS puro en `resources/css/app.css` (fuentes globales, reseteo básico de márgenes).
* **Auditoría de Código:** Ningún archivo `.tsx` o `.jsx` debe contener cadenas de clases de utilidad de Tailwind en atributos `className`.

---

## 5. Protocolo Obligatorio de Auditoría con React Doctor

**React Doctor** (`npx -y react-doctor@latest .`) es la herramienta oficial del proyecto para la auditoría estática y dinámica de calidad, rendimiento y seguridad de componentes React.

### 4.1 Criterio de Aceptación (Health Score)
* **Objetivo:** Toda entrega en rama `feature/*` debe alcanzar un puntaje de **100 / 100 Great** con **0 advertencias (0 issues)** antes de autorizar la fusión con `develop`.

### 4.2 Catálogo de Reglas Críticas y Patrones de Resolución

| Regla React Doctor | Problema / Riesgo | Solución Canónica Obligatoria |
| :--- | :--- | :--- |
| **`rerender-memo-with-default-value`** | Declarar valores por defecto como literales (`items = []` o `config = {}`) crea nuevas referencias de memoria en cada render, rompiendo `React.memo` y re-renderizando a todos los hijos. | Declarar constantes estáticas congeladas fuera del cuerpo del componente: `const DEFAULT_ITEMS: Item[] = [];` y utilizarlas como valor por defecto (`items = DEFAULT_ITEMS`). |
| **`no-fetch-response-used-without-status-check`** | `fetch()` no rechaza la promesa en errores HTTP 4xx o 5xx. Leer el cuerpo con `.json()` sin validar `response.ok` procesa errores como éxito o genera excepciones no controladas. | Validar siempre `if (!res.ok) { ... }` antes de consumir el cuerpo. Manejar explícitamente status específicos (como `422 Unprocessable Entity` para errores de validación de Laravel). |
| **`no-array-index-as-key`** | Usar índices de iteración (`key={index}`) causa desincronización de estado interno y renderizado incorrecto cuando los elementos se filtran, eliminan o reordenan. | Usar siempre identificadores estables y únicos (`key={item.id}`, `key={item.code}` o claves compuestas estables `${item.country}-${item.region}`). |
| **`no-adjust-state-on-prop-change`** | Utilizar `useEffect` para actualizar un estado local cuando cambia un prop genera renders redundantes y muestra temporalmente datos obsoletos (*stale state*). | Desacoplar el formulario montándolo con la prop `key` en el contenedor padre: `<FormContent key={item?.id ?? 'new'} />` o derivar los valores durante el render sin estado duplicado. |
| **`no-effect-event-handler` y `no-fetch-in-effect`** | Ejecutar llamadas `fetch()` dentro de `useEffect` en respuesta a aperturas de modales o acciones del usuario provoca llamadas desincronizadas, renderizados tardíos y fugas de memoria. | Convertir el modal en puramente presentacional. El fetch debe dispararse directamente en el manejador de eventos del usuario (`onClick`) en el componente orquestador antes de abrir el modal. |

---

## 6. Estrategia de Pruebas Unitarias de Componentes (Vitest + Testing Library)

Cada componente interactivo debe contar con pruebas unitarias en `tests/Unit/`:
1. **Verificación de Renderizado Inicial:** Asegurar que los textos, campos y etiquetas requeridas estén en el documento.
2. **Interacciones de Usuario:** Probar eventos `fireEvent` o `userEvent` sobre elementos interactivos identificados por sus roles accesibles (`getByRole('switch')`, `getByRole('button')`).
3. **Manejo de Errores y Validaciones:** Comprobar que los mensajes de error retornados por Laravel se muestren correctamente bajo los campos afectados.
4. **Validación de Límites:** Probar límites de longitud (ej. 12 caracteres en alias QR) y transformaciones automáticas (forzado a mayúsculas).

---

## 7. Procedimiento de Verificación Previo a Commit / Fusión

Antes de solicitar la fusión de una rama `feature/*` a `develop`, el desarrollador o agente debe completar la siguiente secuencia de validación:

```bash
# 1. Ejecutar pruebas unitarias de frontend
npm run test

# 2. Validar compilación estricta de TypeScript y bundle de producción
npm run build

# 3. Ejecutar suite de pruebas de backend
/usr/bin/php8.4 vendor/bin/phpunit

# 4. Auditar la salud de los componentes con React Doctor
npx -y react-doctor@latest .
# -> Debe confirmar: "Score: 100 / 100 Great, ✔ No issues found!"
```

Cualquier desviación justificada de estas directrices debe registrarse de inmediato en la documentación arquitectónica del proyecto.
