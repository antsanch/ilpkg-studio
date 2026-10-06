# Especificación Técnica y de Interfaz: ILPKG Studio
**Módulo de Autoría:** Creación y Edición de Paquetes `.ilpkg`  
**Ecosistema:** Libro Aumentado de Anatomía Biomédica (LAAB)  
**Stack de Implementación:** React 18+, TypeScript, Material UI (MUI v5/v6), React Three Fiber (R3F), Drei, Wavesurfer.js / Web Audio API, JSZip, Laravel (Inertia.js)

---

## 1. Visión General y Filosofía de Diseño

El **ILPKG Studio** es la estación de trabajo (*Digital Audio & 3D Workstation*) orientada a docentes, anatomistas e instructores clínicos. Su propósito fundamental es permitir la creación de lecciones interactivas sin necesidad de escribir código JSON manualmente ni manipular matrices matemáticas tridimensionales a bajo nivel.

### Principios de UX/UI
1. **WYSIWYG Sincrónico (*What You Hear Is What You See*):** La barra de tiempo vincula directamente la reproducción auditiva con la posición espacial de la cámara y el estado visual de cada órgano o estructura anatómica.
2. **Grabación por Captura de Estado (*State Snapping*):** En lugar de requerir complejas curvas de animación tradicionales, el docente coloca la cámara o ajusta las transparencias de los órganos en el visor 3D y pulsa un atajo de teclado para grabar un fotograma clave (*keyframe*) en el segundo exacto del audio.
3. **Validación en Tiempo de Edición:** La herramienta previene errores de empaquetado (como mallas inexistentes o preguntas con saltos temporales ilógicos) antes de exportar el paquete `.ilpkg`.

---

## 2. Arquitectura de Layout y Distribución de Paneles

La interfaz adopta una distribución de escritorio profesional de cinco cuadrantes (*Workspace Grid*), desarrollada con componentes de Material UI y contenedores flexibles:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [A] TOP BAR: Metadatos, Estado de Validación, Modos (Preview/Edit), Botón Exportar    │
├────────────────────┬───────────────────────────────────┬───────────────────────────────┤
│                    │                                   │                               │
│  [B] OUTLINER      │  [C] 3D VIEWPORT DE AUTORÍA       │  [D] INSPECTOR DE PROPIEDADES │
│  Jerarquía de      │      Lienzo R3F con Gizmo de      │      Configuración de Eventos,│
│  Mallas GLTF       │      Cámara, Hotspots 3D y        │      Preguntas, Opciones y    │
│  (Visibilidad,     │      Herramientas de Captura      │      Retroalimentación        │
│  Opacidad, Color)  │                                   │                               │
│                    │                                   │                               │
├────────────────────┴───────────────────────────────────┴───────────────────────────────┤
│  [E] TIMELINE MULTI-PISTA (AUDIO WAVEFORM + PISTAS DE EVENTOS)                         │
│  [▶] [❚❚] 01:24.35 / 04:05.50  |--|---[Cám]---[Malla]---[❓ Quiz]---[Slide]---|         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### [A] Barra Superior (Header & Actions)
* **Indicador de Proyecto:** Título de la lección, slug, ID del paquete y estado de guardado en borrador (`Guardado localmente`, `Sincronizando con Laravel`).
* **Selector de Modo de Trabajo:**
  * **Modo Autoría (Edit Mode):** Despliega gizmos de transformación, marcadores de eventos y controles manuales de escena.
  * **Modo Simulación Alumno (Player Preview):** Ejecuta la experiencia exactamente como la vivirá el estudiante, activando la detención obligatoria de checkpoints y bloqueando el adelantado rápido si aplica.
* **Consola de Validación:** Chip interactivo (verde = *Válido para empaquetar*, naranja = *Advertencias pedagógicas*, rojo = *Errores críticos* como checkpoints sin opciones correctas).
* **Acciones Principales:** Botón `Guardar Borrador`, `Probar Lección` y `Compilar .ilpkg` (descarga directa del contenedor ZIP).

---

### [B] Panel Izquierdo: Jerarquía de Estructuras Anatómicas (Outliner)
Permite inspeccionar y manipular en lote todas las submallas del archivo `anatomy.glb`.

* **Buscador Semántico:** Filtrado instantáneo por nombre anatómico (ejemplo: buscar `"maxill"` resalta `arteria_maxillaris` y `nervus_maxillaris`).
* **Columnas de Acción Rápida por Estructura:**
  * **Ícono de Ojo:** Alterna visibilidad booleana (`visible: true/false`).
  * **Control Deslizante Compacto (Mini-Slider):** Nivel de opacidad actual de la malla ($0.0$ a $1.0$).
  * **Indicador de Resaltado:** Selector de color de canal emisivo (*Highlight*).
* **Acción de Lote:** Botón **"Insertar Clave de Malla en Timestamp Actual"** que inyecta en la línea de tiempo un evento `mesh_opacity` o `mesh_visibility` con los valores seleccionados.

---

### [C] Panel Central: Visor 3D WebGL (R3F Viewport)
Lienzo tridimensional donde el autor interactúa con el modelo anatómico y compone los planos cinemáticos.

* **Barra Flotante de Herramientas de Cámara (HUD Superior Izquierdo):**
  * **Botón "Capturar Pose de Cámara":** Lee la posición actual de la cámara virtual `[x, y, z]` y el punto focal `target [tx, ty, tz]` del `OrbitControls` y los estampa como un evento `camera_transform` en la posición actual de la aguja de reproducción.
  * **Selector de Vistas Rápidas:** Botones para vista Anterior, Posterior, Lateral Izquierda/Derecha, Superior y Corte Transversal.
  * **Modo Marcador de Spot (Hotspot 3D):** Al activarse, permite hacer clic sobre cualquier vértice de una malla anatómica para anclar un punto de interés tridimensional indexado temporalmente.
* **Ayudas Visuales Desactivables:** Malla de referencia en el piso, ejes de coordenadas ($X, Y, Z$) y visualización en alambre (*wireframe*).

---

### [D] Panel Derecho: Inspector de Propiedades Contextual
Su contenido muta dinámicamente según lo que esté seleccionado en la línea de tiempo o en la escena 3D.

#### 1. Cuando se selecciona un Evento de Cámara:
* Coordenadas numéricas de posición y punto focal (editables manualmente para máxima precisión).
* Duración de la interpolación de movimiento (en segundos).
* Selector de curva de animación (*Easing Curve*): `linear`, `power2.inOut`, `power3.out`, `sine.inOut`.
* Botón **"Teletransportar Cámara a esta Pose"** para previsualizar el encuadre exacto.

#### 2. Cuando se selecciona un Checkpoint Evaluativo:
* **Formulario Pedagógico:**
  * Tipo de Reactivo: Opción Múltiple (`single_choice`), Selección Múltiple (`multiple_choice`), Clic en Malla 3D (`mesh_click`), o Falso/Verdadero (`boolean`).
  * Enunciado / Planteamiento Clínico (con soporte de texto enriquecido y fórmulas LaTeX si aplica).
  * Puntaje otorgado ($pts$).
  * **Punto de Rebobinado Pedagógico (`rewindTimestamp`):** Campo numérico con botón **"Fijar en Segundo Actual"** para definir a dónde regresa el alumno si responde incorrectamente.
  * Casilla de verificación: *Permitir al estudiante orbitar y explorar libremente el modelo 3D mientras responde la pregunta*.
* **Editor de Opciones:**
  * Lista dinámica de respuestas con casilla de selección para indicar cuál es la correcta.
  * Campo de texto para la retroalimentación médica explicativa de cada alternativa.
* **Configuración para `mesh_click`:**
  * Selector desplegable de la estructura correcta o botón **"Seleccionar malla en el visor 3D"**.

#### 3. Cuando se selecciona una Diapositiva / Slide:
* Vista previa del gráfico 2D (corte radiológico, SVG o esquema histológico).
* Selector de disposición en pantalla: *Overlay Izquierdo*, *Overlay Derecho*, *Picture-in-Picture (PiP) esquina inferior*, o *Pantalla Completa*.
* Tiempo de permanencia en pantalla antes del desvanecimiento automático (`slide_dismiss`).

---

### [E] Panel Inferior: Línea de Tiempo Multi-Pista (Timeline & Master Clock)
El núcleo operativo de la sincronización multimedia.

* **Pista 0: Regla de Tiempo y Aguja de Reproducción (Playhead):**
  * Marcado de tiempo en minutos, segundos y centésimas (`MM:SS.ss`).
  * Control de zoom temporal (desde ver la lección completa de 10 minutos hasta resolución por milisegundos).
* **Pista 1: Master Audio Waveform:**
  * Renderizado de la forma de onda de la narración en Web Audio API (con librerías como Wavesurfer.js).
  * Permite al autor correlacionar visualmente los silencios y las pausas del locutor con el inicio de giros de cámara o aparición de preguntas.
* **Pista 2: Cámara (Cinemática):** Bloques rectangulares azules que indican cuándo inicia y concluye una interpolación cinemática.
* **Pista 3: Anatomía (Mallas y Transparencias):** Bloques verdes con marcadores de cambios de visibilidad o desvanecimiento.
* **Pista 4: Apoyos Gráficos (Slides & SVGs):** Marcadores amarillos que delimitan el período de visibilidad de diapositivas complementarias.
* **Pista 5: Checkpoints (Evaluaciones):** Marcadores rojos en forma de rombo. Cada rombo está visualmente conectado con una línea punteada que apunta hacia atrás en la línea de tiempo hasta su respectivo `rewindTimestamp`.

---

## 3. Flujos de Trabajo Operativos (Workflows de Autoría)

```text
       [ Cargar Audio + GLB ]
                 │
                 ▼
     [ Reproducir Narración ] ──(Pausa en concepto clave)
                 │
                 ├────────────────────────┬────────────────────────┐
                 ▼                        ▼                        ▼
        [ Encuadrar 3D ]         [ Ajustar Mallas ]        [ Crear Quiz ]
                 │                        │                        │
       "Capturar Pose Cámara"    "Grabar Opacidad/Color"  "Configurar Opciones +
                 │                        │               Rewind Timestamp"
                 └────────────────────────┼────────────────────────┘
                                          │
                                          ▼
                            [ Simular en Modo Alumno ]
                                          │
                                          ▼
                            [ Exportar Paquete .ilpkg ]
```

### Flujo 1: Coreografía de Cámara Sincronizada
1. El docente pulsa `Espacio` para reproducir el audio de la narración.
2. Al escuchar *"observemos ahora la cara infratemporal del maxilar"*, presiona `Espacio` para pausar.
3. Rota y hace zoom sobre el maxilar en el visor tridimensional hasta lograr el encuadre perfecto.
4. Hace clic en el botón **"Capturar Cámara"** (o atajo `Ctrl + K`).
5. En el inspector derecho, define que la transición durará `2.0` segundos con curvatura suave (`power2.inOut`).

### Flujo 2: Revelación de Estructuras Profundas (Transparencia)
1. Con la aguja en el segundo deseado, el autor selecciona en el árbol de mallas el `musculo_masetero`.
2. Reduce el deslizador de opacidad de $1.0$ a $0.2$.
3. Pulsa **"Registrar Clave de Malla"**. El sistema crea automáticamente un evento `mesh_opacity` en `lesson.json` con una duración de transición por defecto de $1.0$ segundo.

### Flujo 3: Creación de Reactivo con Rebobinado Pedagógico
1. El docente sitúa la aguja al finalizar la explicación de la arteria esfenopalatina (segundo `01:02.0`).
2. Pulsa el botón **"Nuevo Checkpoint"** (atajo `Ctrl + Q`).
3. El sistema congela la reproducción, crea un marcador rojo y despliega el formulario de preguntas en el inspector.
4. Redacta la pregunta y las opciones de respuesta.
5. El docente arrastra el marcador secundario de rebobinado hacia el segundo `00:34.0` (donde comienza la explicación teórica de dicha arteria). Si el alumno reprueba, el reproductor volverá a ese punto exacto.

---

## 4. Estado Global del Studio (Zustand Store)

La arquitectura de datos de la interfaz de autoría se modela de forma centralizada para garantizar sincronía entre el reproductor de audio, el lienzo Three.js y el árbol de eventos:

```typescript
// resources/js/Stores/useStudioStore.ts
import { create } from 'zustand';
import { IlpkgManifest } from '@/types/ilpkg-manifest';
import { IlpkgLesson, TimelineEvent, LessonCheckpoint } from '@/types/ilpkg-lesson';

interface StudioState {
  // Estado del proyecto cargado
  manifest: IlpkgManifest | null;
  lesson: IlpkgLesson | null;
  audioBlobUrl: string | null;
  modelBlobUrl: string | null;
  
  // Estado del Reloj Maestro de Edición
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  
  // Selección y contexto de UI
  selectedEventId: string | null;
  selectedCheckpointId: string | null;
  selectedMeshNames: string[];
  activeEditorMode: 'edit' | 'preview';
  
  // Acciones de reproducción y transporte
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  seekTo: (time: number) => void;
  
  // Manipulación de la Línea de Tiempo
  addTimelineEvent: (event: TimelineEvent) => void;
  updateTimelineEvent: (id: string, updated: Partial<TimelineEvent>) => void;
  deleteTimelineEvent: (id: string) => void;
  
  addCheckpoint: (checkpoint: LessonCheckpoint) => void;
  updateCheckpoint: (id: string, updated: Partial<LessonCheckpoint>) => void;
  deleteCheckpoint: (id: string) => void;
  
  // Compilación y validación
  validatePackage: () => { isValid: boolean; errors: string[]; warnings: string[] };
}
```

---

## 5. Módulo de Empaquetado y Exportación (`.ilpkg Builder`)

El Studio cuenta con un motor de compilación que puede operar directamente en el navegador del cliente mediante `JSZip` o delegar la compresión final al backend de Laravel:

```typescript
// resources/js/Services/IlpkgPacker.ts
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { IlpkgManifest } from '@/types/ilpkg-manifest';
import { IlpkgLesson } from '@/types/ilpkg-lesson';

export class IlpkgPacker {
  public static async buildAndDownload(
    manifest: IlpkgManifest,
    lesson: IlpkgLesson,
    audioFile: File | Blob,
    modelFile: File | Blob,
    slideFiles: { [filename: string]: File | Blob },
    thumbFile?: File | Blob
  ): Promise<void> {
    const zip = new JSZip();

    // 1. Inyectar descriptores JSON
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));
    zip.file('lesson.json', JSON.stringify(lesson, null, 2));

    // 2. Inyectar activos binarios
    zip.file(manifest.assets.masterAudio.path, audioFile);
    zip.file(manifest.assets.models3D[0].path, modelFile);

    if (thumbFile) {
      zip.file(manifest.assets.thumbnail, thumbFile);
    }

    // 3. Inyectar diapositivas complementarias
    const slidesFolder = zip.folder('slides');
    for (const [filename, blob] of Object.entries(slideFiles)) {
      slidesFolder?.file(filename, blob);
    }

    // 4. Generar paquete comprimido
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    // 5. Descargar con extensión .ilpkg
    const fileName = `${manifest.metadata.slug || 'leccion_interactiva'}.ilpkg`;
    saveAs(zipBlob, fileName);
  }
}
```

---

## 6. Atajos de Teclado del Studio (Shortcuts Ergonómicos)

| Atajo | Acción | Contexto |
| :--- | :--- | :--- |
| `Espacio` | Alternar Reproducción / Pausa del Master Clock | Global |
| `J` / `L` | Rebobinar 1 segundo / Avanzar 1 segundo | Global |
| `K` | Pausar audio | Global |
| `Ctrl + K` / `Cmd + K` | **Capturar pose de cámara actual** en el timestamp de la aguja | Visor 3D |
| `Ctrl + M` / `Cmd + M` | **Capturar estado de mallas** seleccionadas | Árbol de mallas |
| `Ctrl + Q` / `Cmd + Q` | **Insertar Checkpoint Evaluativo** en el segundo actual | Línea de tiempo |
| `Ctrl + Z` / `Cmd + Z` | Deshacer última acción de línea de tiempo | Global |
| `F` | Encuadrar la cámara sobre la malla anatómica seleccionada | Visor 3D |
| `Tab` | Alternar entre Modo Edición y Modo Simulación Alumno | Global |