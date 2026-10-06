# Especificación Técnica: Formato .ilpkg (Interactive Lesson Package)
**Plataforma:** Libro Aumentado de Anatomía Biomédica (LAAB)  
**Versión del Estándar:** 1.0.0  
**Fecha de Publicación:** 3 de octubre de 2026  
**Clasificación:** Estándar Abierto de Distribución Multimedia e Interactiva

---

## 1. Resumen Ejecutivo y Filosofía de Diseño

El formato **`.ilpkg`** (*Interactive Lesson Package*) es un contenedor de empaquetado portátil, determinista y autocontenido diseñado para almacenar cápsulas educativas interactivas de alta fidelidad. 

A diferencia de los formatos de video convencionales (MP4, WebM codificado), el `.ilpkg` implementa la arquitectura **Master Clock**, donde una pista de audio nativa actúa como el reloj maestro del sistema. Este reloj orquesta en tiempo real el renderizado WebGL (mallas 3D anatómicas), transformaciones cinemáticas de cámara, animaciones vectoriales SVG, diapositivas de soporte diagnóstico y checkpoints evaluativos formativos con retroalimentación inmediata.

### Principios Fundamentales
1. **Separación de Medios y Lógica:** Los activos pesados (audio, modelos 3D binarios, imágenes) residen en subdirectorios aislados, mientras que la orquestación temporal y los reactivos pedagógicos se modelan en esquemas JSON declarativos.
2. **Cero Dependencia de Red (Offline First):** Un paquete `.ilpkg` puede ser procesado e indexado en el servidor (Laravel) o ser descomprimido directamente en memoria en el cliente web/PWA mediante Web Workers e IndexedDB (con librerías como JSZip).
3. **Determinismo Temporal:** La línea de tiempo permite reconstruir retrospectivamente el estado visual del escenario tridimensional (opacidades, visibilidad, posición de cámara) ante saltos temporales (*scrubbing*).

---

## 2. Anatomía del Contenedor

El archivo `.ilpkg` es físicamente un archivo ZIP estándar (RFC 1951 / Deflate) renombrado con la extensión `.ilpkg`. Su estructura interna sigue la siguiente jerarquía de archivos estricta:

```text
nombre_de_la_leccion.ilpkg  (Contenedor ZIP)
│
├── manifest.json              # Descriptor raíz, metadatos, requisitos y firma de integridad
├── lesson.json                # Orquestación de la línea de tiempo, eventos y checkpoints
├── thumb.webp                 # Imagen de portada en miniatura (aspect ratio 16:9)
│
├── audio/
│   └── narration.webm         # Reloj maestro de audio (WebM Opus o M4A AAC, 48 kHz)
│
├── models/
│   ├── anatomy.glb            # Modelo anatómico maestro (GLTF binario optimizado)
│   └── textures/              # Texturas adicionales no incrustadas (opcional)
│
└── slides/
    ├── corte_axial_rmn.webp   # Imágenes radiológicas/histológicas en alta fidelidad
    └── circuito_flujo.svg     # Esquemas vectoriales con rutas dinámicas animables
```

---

## 3. Especificación de Descriptores

### 3.1 `manifest.json` (Firma y Metadatos)

Debe ubicarse en la raíz del contenedor. Permite validar compatibilidad, requerimientos de hardware y verificar la integridad de los activos sin procesar la línea de tiempo completa.

#### Esquema de Referencia:
```json
{
  "$schema": "https://laab.app/schemas/v1/ilpkg-manifest.json",
  "formatVersion": "1.0.0",
  "packageId": "laab-anat-neuro-042",
  "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "metadata": {
    "title": "Fosa Pterigopalatina: Relaciones y Abordajes",
    "slug": "fosa-pterigopalatina-relaciones-abordajes",
    "description": "Estudio anatómico tridimensional de los límites, forámenes y contenido neurovascular de la fosa pterigopalatina.",
    "authors": [
      {
        "name": "Dr. Antonio Sánchez Uresti",
        "role": "Autor de Contenido / Anatomista",
        "institution": "UANL"
      }
    ],
    "discipline": "Anatomía Humana",
    "subdiscipline": "Neuroanatomía / Cabeza y Cuello",
    "targetAudience": "Pregrado Medicina / Ingeniería Biomédica",
    "language": "es-MX",
    "license": "CC-BY-NC-SA-4.0",
    "createdAt": "2026-10-03T15:13:00Z",
    "updatedAt": "2026-10-03T15:13:00Z"
  },
  "pedagogy": {
    "estimatedDurationSeconds": 245.5,
    "passingScore": 80,
    "totalCheckpoints": 2,
    "maxAttemptsAllowed": 0,
    "allowScrubbingAfterPass": true,
    "learningObjectives": [
      "Identificar los límites óseos de la fosa pterigopalatina.",
      "Reconocer las ramas terminales del nervio maxilar (V2)."
    ]
  },
  "runtimeRequirements": {
    "engineVersion": ">=1.0.0",
    "webglVersion": 2,
    "audioContext": true,
    "requiredExtensions": [
      "KHR_draco_mesh_compression",
      "EXT_meshopt_compression"
    ],
    "targetHardwareClass": "medium"
  },
  "assets": {
    "entrypoint": "lesson.json",
    "thumbnail": "thumb.webp",
    "masterAudio": {
      "path": "audio/narration.webm",
      "mimeType": "audio/webm; codecs=opus",
      "duration": 245.5,
      "sampleRate": 48000
    },
    "models3D": [
      {
        "id": "pterygoid_fossa_main",
        "path": "models/anatomy.glb",
        "format": "gltf-binary",
        "dracoCompressed": true,
        "polyCount": 184500,
        "structures": [
          "os_sphenoidale",
          "os_palatinum",
          "maxilla",
          "arteria_maxillaris",
          "nervus_maxillaris"
        ]
      }
    ],
    "staticSlides": [
      {
        "id": "slide_corte_coronal_rmn",
        "path": "slides/corte_axial_rmn.webp",
        "mimeType": "image/webp",
        "dimensions": { "width": 1920, "height": 1080 }
      }
    ]
  }
}
```

---

### 3.2 `lesson.json` (Línea de Tiempo y Evaluación)

Contiene la secuencia cronológica indexada por segundos y milisegundos (`timestamp`) y el banco de reactivos formativos integrados.

#### Tipos de Eventos (`event_type`):
* `camera_transform`: Interpola posición tridimensional de la cámara y punto focal (`target`).
* `mesh_opacity`: Controla la transparencia gradual de estructuras para revelar planos profundos.
* `mesh_visibility`: Conmutación booleana inmediata de visibilidad de nodos.
* `mesh_highlight`: Modifica canales emisivos o capas de resaltado para destacar vasos, nervios o huesos.
* `slide_display` / `slide_dismiss`: Monta o desmonta gráficos 2D superpuestos (Picture-in-Picture o panel lateral).

#### Tipos de Checkpoints Evaluativos (`questionType`):
* `single_choice`: Opción múltiple tradicional con selección única.
* `multiple_choice`: Selección múltiple de varias respuestas válidas.
* `mesh_click`: El alumno debe identificar la estructura anatómica haciendo clic directamente sobre la malla WebGL 3D.
* `boolean`: Conmutador binario (Verdadero / Falso).

#### Esquema de Referencia:
```json
{
  "$schema": "https://laab.app/schemas/v1/ilpkg-lesson.json",
  "version": "1.0.0",
  "timeline": {
    "duration": 245.5,
    "events": [
      {
        "id": "evt_001",
        "timestamp": 0.0,
        "type": "camera_transform",
        "payload": {
          "position": [0.0, 1.2, 4.5],
          "target": [0.0, 0.0, 0.0],
          "duration": 0.0
        }
      },
      {
        "id": "evt_002",
        "timestamp": 14.25,
        "type": "camera_transform",
        "payload": {
          "position": [1.45, 0.82, -2.1],
          "target": [0.05, 0.12, 0.0],
          "duration": 2.5,
          "easing": "power2.inOut"
        }
      },
      {
        "id": "evt_003",
        "timestamp": 22.0,
        "type": "mesh_opacity",
        "payload": {
          "modelId": "pterygoid_fossa_main",
          "structures": [
            { "name": "maxilla", "opacity": 0.25 }
          ],
          "duration": 1.2
        }
      },
      {
        "id": "evt_004",
        "timestamp": 35.8,
        "type": "mesh_highlight",
        "payload": {
          "modelId": "pterygoid_fossa_main",
          "structures": ["arteria_maxillaris"],
          "emissiveColor": "#ff1744",
          "intensity": 0.8,
          "duration": 0.8
        }
      }
    ],
    "checkpoints": [
      {
        "id": "chk_001",
        "timestamp": 62.0,
        "title": "Control Clínico: Irrigación Pterigomaxilar",
        "prompt": "¿Cuál es la rama terminal de la arteria maxilar que ingresa a la fosa nasal?",
        "questionType": "single_choice",
        "points": 10,
        "rewindTimestamp": 34.0,
        "allowFreeExploration": true,
        "options": [
          {
            "id": "opt_01",
            "text": "Arteria esfenopalatina",
            "isCorrect": true,
            "feedback": "Correcto. Atraviesa el foramen esfenopalatino hacia las cavidades nasales."
          },
          {
            "id": "opt_02",
            "text": "Arteria infraorbitaria",
            "isCorrect": false,
            "feedback": "Incorrecto. Se dirige hacia anterior por el conducto infraorbitario."
          }
        ]
      },
      {
        "id": "chk_002",
        "timestamp": 115.5,
        "title": "Identificación Anatómica Tridimensional",
        "prompt": "Haga clic sobre el nervio maxilar (V2) antes de su división terminal.",
        "questionType": "mesh_click",
        "points": 15,
        "rewindTimestamp": 95.0,
        "allowFreeExploration": true,
        "targetMesh": {
          "modelId": "pterygoid_fossa_main",
          "structureName": "nervus_maxillaris"
        },
        "feedback": {
          "success": "Excelente localización del trayecto del nervio maxilar.",
          "failure": "Estructura incorrecta. Revise el foramen redondo en el fondo de la fosa."
        }
      }
    ]
  }
}
```

---

## 4. Requisitos de Activos y Convenciones Técnicas

### 4.1 Pista de Audio Maestra (`audio/`)
* **Códec preferido:** Opus en contenedor WebM (`audio/webm; codecs=opus`) o AAC en MP4 (`audio/mp4`).
* **Frecuencia de muestreo:** 48,000 Hz estéreo o mono voz.
* **Control:** El archivo no debe contener pausas artificiales añadidas para preguntas; las pausas son controladas programáticamente por la máquina de estados.

### 4.2 Modelos Tridimensionales (`models/`)
* **Formato:** Exclusivamente GLTF 2.0 binario (`.glb`).
* **Compresión:** Uso obligatorio de extensión `KHR_draco_mesh_compression` o `EXT_meshopt_compression` para mallas densas anatómicas.
* **Nomenclatura Semántica:** Cada submalla (*Mesh/Node*) debe nombrarse usando Snake Case anatómico estándar (ejemplo: `arteria_meningea_media`, `os_frontale`). Prohibido usar nombres genéricos de exportador (`Mesh_001`, `Cube.004`).
* **Materiales PBR:** Deben instanciarse con soporte de transparencia (`alphaMode: BLEND`, `depthWrite: true` administrado dinámicamente) para evitar artefactos de ordenamiento visual durante el desvanecimiento de órganos.

---

## 5. Reglas de Validación de Integridad Referencial

Antes de que un archivo `.ilpkg` sea aceptado por el backend de Laravel o procesado por el reproductor cliente, debe superar las siguientes comprobaciones atómicas:

1. **Inspección de Cabeceras:** Existencia física en la raíz del archivo de `manifest.json` y `lesson.json`.
2. **Consistencia de Rutas Internas:** Todas las rutas listadas en `manifest.assets.masterAudio.path`, `manifest.assets.models3D[].path`, y `manifest.assets.staticSlides[].path` deben resolverse exitosamente dentro del archivo ZIP.
3. **Consistencia de Nodos 3D:** Toda estructura anatómica referenciada en `lesson.timeline.events[].payload.structures` o `lesson.timeline.checkpoints[].targetMesh.structureName` debe estar declarada en el arreglo `manifest.assets.models3D[].structures`.
4. **Validación Temporal:**
   * Todos los eventos deben satisfacer $0.0 \le \text{timestamp} \le \text{manifest.pedagogy.estimatedDurationSeconds}$.
   * El parámetro `rewindTimestamp` de cualquier checkpoint debe ser estrictamente menor al `timestamp` de detención del propio checkpoint: $\text{rewindTimestamp} < \text{timestamp}$.