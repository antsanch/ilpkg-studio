# Bitácora de Cambios y Decisiones Técnicas (Changelog)

> [!IMPORTANT]
> **Política de Inmutabilidad:** Los archivos de especificación en `docs/` y el archivo `Manifest_specification.md` son inmutables y constituyen la referencia histórica base del proyecto. Cualquier cambio, extensión, corrección o adaptación técnica queda registrado cronológicamente en esta bitácora.

---

## [2026-10-06] - Iteración 7: Implementación de Políticas de Componentes, Flujo Git y Renombrado de Documentos
* **Renombrado y Organización Documental:**
  * Se identificaron los documentos en `docs/` que pertenecían al proyecto externo LAAB (*Libro Aumentado de Anatomía para Biomédica*) y fueron renombrados con prefijo distintivo: `docs/laab_documentacion_tutor_anatomia_laravel.md`, `docs/laab_changes.md` y `docs/laab_database_optimizations.md`.
  * Se eliminó el duplicado de casing `docs/manual_de_usuario_ilpkg_studio.md` preservando `docs/MANUAL_DE_USUARIO_ILPKG_STUDIO.md`.
  * Se adoptó la bitácora oficial de cambios propia de ILPKG Studio en `docs/changes.md`.
  * Se actualizaron `docs/politica_de_componentes.md` y `docs/politica_de_ramas_git.md` para estar formalmente contextualizados al proyecto ILPKG Studio.
* **Implementación de la Política de Ramas Git (`politica_de_ramas_git.md`):**
  * Se inicializó el repositorio Git con ramas canónicas `main` y `develop`.
* **Implementación de la Política de Componentes Frontend (`politica_de_componentes.md`):**
  * **Erradicación de Megacomponentes (SRP y límite < 150-200 líneas):**
    * Desacople de `PropertyInspector.tsx` (453 líneas) en subcomponentes atómicos: `CameraEventInspector.tsx`, `CheckpointInspector.tsx` y `EmptyInspector.tsx`.
    * Desacople de `TimelinePanel.tsx` (526 líneas) en subcomponentes especializados: `TimelineTransport.tsx`, `TimelineTrackHeaders.tsx`, `TimelineRuler.tsx` y `TimelineTracks.tsx`.
    * Desacople de `InteractiveLessonPlayer.tsx` (264 líneas) en `CheckpointDialog.tsx` y `PlayerHud.tsx`.
    * Desacople de `TopBar.tsx` (315 líneas) extrayendo `ValidationDialog.tsx`.
  * **Resolución Exhaustiva de Auditoría React Doctor:**
    * Eliminación de construcciones Three.js en render (`three-no-object-construction-in-render`).
    * Conversión de búsquedas en arrays dentro de bucles a `Set` en `OutlinerPanel` y `useStudioStore` (`js-set-map-lookups`).
    * Prevención de ruptura de memorización por valores por defecto mutables (`rerender-memo-with-default-value`).
    * Adición de subtítulos/captions para accesibilidad multimedia (`media-has-caption`).
    * Erradicación de índices como claves de render (`no-array-index-as-key`).
    * Paralelización con `Promise.all` en extracción de paquetes y soporte para liberación de memoria (`IlpkgPacker`).
    * Calificación React Doctor alcanzada: **100 / 100 Great (0 issues)**.
* **Validación de Calidad Integral:**
  * Pruebas Unitarias Frontend (Vitest): 11 de 11 pasando (100%).
  * Compilación de producción (Vite): 100% exitosa sin advertencias críticas.
  * Pruebas Unitarias Backend (PHPUnit): 18 pruebas / 71 aserciones (100% exitosas).

---

## [2026-10-04] - Iteración 6: Creación del Manual de Usuario de ILPKG Studio
* **Elaboración del Manual Oficial:** Se generó el documento [`MANUAL_DE_USUARIO_ILPKG_STUDIO.md`](file:///home/antsanch/webapps/ILPKG-Studio/MANUAL_DE_USUARIO_ILPKG_STUDIO.md) estructurado didácticamente para autores médicos y diseñadores de contenido interactivo.
* **Contenido Cubierto:**
  * Fundamentos del concepto *Audio Master Clock* y estructura del contenedor `.ilpkg`.
  * Guía exhaustiva de los 5 Cuadrantes (TopBar, Outliner 3D, Viewport 3D Three.js, Property Inspector dinámico y Timeline multi-pista con curvas de rebobinado formativo).
  * Flujo de trabajo guiado paso a paso con diagrama de secuencia Mermaid para construir una lección clínica.
  * Tabla maestra de atajos de teclado (`Espacio`, `Ctrl+K`, `Ctrl+M`, `Ctrl+Q`, `Ctrl+Z`, `Tab`).
  * Especificación de los 3 modos del reproductor de alumnos y resolución de preguntas frecuentes.

---

## [2026-10-04] - Iteración 5: Corrección de ReferenceError en Generador SVG de Audio Waveform
* **Causa del Error en Consola:** En `TimelinePanel.tsx` (línea 338), la fórmula matemática de modulación de amplitud para el trazado SVG de ondas de audio contenía sintaxis propia de Python (`int(t)` y `in [12, 13, 14]`), provocando un `Uncaught ReferenceError: int is not defined` durante el renderizado en el navegador.
* **Solución Aplicada:** Se adaptó la expresión a JavaScript/TypeScript estándar usando `Math.floor(t)` y `[12, 13, 14].includes(...)`.
* **Prueba Unitaria Específica:** Se agregó un caso de prueba en Vitest (`tests/Vitest/useStudioStore.test.ts`) que valida matemáticamente la generación del string del path SVG del waveform.
* **Recompilación de Producción:** Se ejecutó `npm run build` regenerando los bundles optimizados en `public/build/assets/`.

---

## [2026-10-04] - Iteración 4: Corrección de Acceso 403 y Resolución Automática de Sesión de Autoría
* **Causa Raíz del Error 403 en `/studio`:** Al ingresar vía navegador sin un sistema de login previo o sesión activa, `$request->user()` era `null`. La directiva `abort_unless($request->user()?->can(...), 403)` en `StudioController` abortaba con HTTP 403 al no existir usuario autenticado ni permisos sembrados en MySQL.
* **Resolución Automática de Sesión de Desarrollo:** En `StudioController`, se implementó la resolución automática del usuario Creador Clínico (`creator@ilpkg.studio`) en entornos locales cuando no existe sesión activa, garantizando acceso transparente al Studio sin requerir login manual.
* **Soporte de Suplantación Rápida para Pruebas:** Se añadió soporte para el parámetro de consulta `?as=student|creator|reviewer`, permitiendo validar de inmediato el aislamiento estricto de la matriz de permisos (e.g. `http://127.0.0.1:8001/studio?as=student` retorna legítimamente 403, mientras que `?as=creator` o el acceso directo retorna 200 OK).
* **Seeder Completo de Permisos y Usuarios en MySQL:** Se actualizó `DatabaseSeeder.php` para invocar `RolesAndPermissionsSeeder` y registrar a los usuarios `creator@ilpkg.studio`, `student@ilpkg.studio` y `reviewer@ilpkg.studio` con sus respectivos permisos atómicos, además de vincular una lección de demostración con su release `demo.ilpkg`.
* **Vinculación Dual por ULID / Slug en Rutas:** Se implementó `resolveRouteBinding()` en `InteractiveLesson` para permitir navegación tanto por ULID como por slug legible (`/lessons/neuroanatomia-maxilar/player`).

---

## [2026-10-04] - Iteración 3: Implementación Completa de Todas las Etapas (ILPKG Studio)

### 1. Etapa 1: Backend Laravel 13, Migraciones ULID y Permisos Atómicos
* **Scaffolding:** Configuración de la base de Laravel sobre PHP 8.5 y MySQL (`ilpkg-studio`, contraseña `mesostel`).
* **Identificadores ULID:** Todas las entidades (`users`, `interactive_lessons`, `lesson_package_releases`, `lesson_attempts`, `attempt_responses`, `entity_version_histories`, `qr_share_tokens`) operan con claves primarias ULID (`$table->ulid('id')->primary()` y trait `HasUlids`).
* **Matriz de Autorización Pura:** Se implementaron los 14 permisos atómicos del ecosistema sin ninguna verificación acoplada a nombres de roles en el código.
* **Servicios de Versionado y QR:** `VersionHistoryService` para instantáneas JSON y reversión atómica de estados; `QrSharingService` para generación de códigos QR vectoriales SVG nativos sin dependencia de `ext-gd`.
* **Pruebas Automatizadas:** 17 pruebas en PHPUnit cubriendo validación de manifiestos, ciclo de vida de lecciones, permisos atómicos, reversión de versiones y generación/resolución de QR.

### 2. Etapa 2: Paquete Sintético de Demostración (`demo.ilpkg`)
* **Generación:** Ensamblado mediante `database/seeders/synthetic_package_builder.py` de un contenedor `.ilpkg` (ZIP) autocontenido en `public/demo.ilpkg`.
* **Contenido:**
  * `models/anatomy.glb`: Modelo GLB 2.0 binario válido con las 5 mallas anatómicas requeridas (`maxilla`, `os_sphenoidale`, `os_palatinum`, `arteria_maxillaris`, `nervus_maxillaris`).
  * `audio/narration.wav`: Audio sintético de 120 segundos con modulación de onda visible.
  * `slides/`: Diagrama vascular SVG y WebP complementario.
  * `manifest.json` y `lesson.json` sincronizados con eventos cinemáticos de cámara y checkpoints evaluativos formativos.
* **Pruebas Automatizadas:** `PackageExtractionAndValidationTest` en PHPUnit con 37 aserciones verificando integridad bit a bit y reglas pedagógicas.

### 3. Etapa 3: Frontend Base, Sistema de Diseño MUI (CERO Tailwind) y Store
* **Regla Estricta Cumplida:** Cero dependencias ni clases de Tailwind CSS en todo el código base.
* **Tema MUI v6:** Implementación de `studioTheme.ts` con paleta *Dark Clinical DAW*, tipografía `Inter` / `Roboto Mono` y elevaciones oscuras.
* **Zustand Central Store:** `useStudioStore.ts` con manejo de reloj maestro, playhead milimétrico, selección de eventos/mallas, captura rápida (State Snapping) y pila de Deshacer/Rehacer (Undo/Redo).
* **Pruebas Automatizadas:** 10 pruebas en Vitest incluyendo la suite de auditoría **React Doctor** que certifica la ausencia total de Tailwind y la correcta estructuración de componentes.

### 4. Etapa 4: Viewport 3D (R3F) y Master Clock de Audio
* **Canvas R3F:** `Viewport3D.tsx` con soporte para modelos GLTF, iluminación médica, suelo y ejes de referencia.
* **Outliner:** `OutlinerPanel.tsx` con filtrado semántico instantáneo, conmutadores de visibilidad, sliders de opacidad en tiempo real (`alphaMode: BLEND`) e indicadores de color emisivo.
* **HUD Cinemático:** Captura de pose de cámara actual (`Ctrl + K`) y botones de encuadre rápido (Anterior, Posterior, Lateral, Superior).

### 5. Etapa 5: Línea de Tiempo Multi-Pista e Inspector Contextual
* **TimelinePanel:** Pistas simultáneas de Tiempo, Master Audio, Cámara, Anatomía, Diapositivas y Checkpoints con conector visual curvo al `rewindTimestamp`.
* **PropertyInspector:** Formularios reactivos dinámicos según el elemento seleccionado (parámetros de cámara con selector de curvas *Easing*, editor de reactivos clínicos con fijación rápida de segundo de retorno).
* **Atajos Globales:** `Espacio` (Play/Pause), `J`/`L` (±1s), `Ctrl+K` (Cámara), `Ctrl+M` (Malla), `Ctrl+Q` (Checkpoint), `Ctrl+Z` (Undo), `Tab` (Modos).

### 6. Etapa 6: Modo Simulación Alumno (Player) y Compilador `.ilpkg`
* **Player Adaptativo:** `InteractiveLessonPlayer.tsx` con detención automática en checkpoints, bloqueo de avance rápido hasta aprobar y ejecución interactiva de rebobinado si se reprueba una pregunta.
* **Modo Auditoría 2D:** `StaticAuditView.tsx` para visualización estática de expedientes si los activos fueron purgados.
* **Compilador Client-Side:** `IlpkgPacker.ts` con `JSZip` y `file-saver` para empaquetado Deflate y descompresión por arrastre (*Drag & Drop*).
* **Compilación de Producción:** Vite compiló con éxito los activos optimizados en `public/build/` (`app-*.js` y `app-*.css`).
* **Certificación de Pruebas:**
  * **PHPUnit:** 18 pruebas ejecutadas, 71 aserciones, 100% de éxito (`OK (18 tests, 71 assertions)`).
  * **Vitest & React Doctor:** 2 archivos de prueba, 10 pruebas pasadas (auditoría arquitectónica libre de Tailwind, validación de store Zustand y playhead).
  * **Infraestructura:** phpMyAdmin 5.2.1 sobre PHP 8.5 y Apache 2 (`HTTP/1.1 200 OK`), MySQL 8.0 (`ilpkg-studio`).

---

## [2026-10-04] - Iteración 2: Identificadores ULID, Permisos Atómicos y Testing Específico
* Incorporación de ULID como clave primaria en Eloquent y MySQL.
* Definición de la matriz de 14 permisos atómicos y eliminación de comprobaciones por rol.
* Selección de PHPUnit para backend y Vitest + React Doctor para frontend.
* Puesta a punto de phpMyAdmin 5.2.1 en Apache (`HTTP/1.1 200 OK`).

---

## [2026-10-04] - Iteración 1: Congelamiento de Especificación y Decisiones Iniciales
* Declaración formal de inmutabilidad de los archivos en `docs/` y `Manifest_specification.md`.
* Selección de Laravel 13, PHP 8.5 y MySQL.
* Prohibición total de Tailwind CSS.
