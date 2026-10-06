# Registro de Cambios y Decisiones Arquitectónicas (`changes.md`)

> **Norma del Proyecto:** Los archivos dentro del directorio `/prompts` (incluyendo `prompts/MasterPrompt.md`) son **estrictamente inmutables** y sirven como especificación de referencia inicial.  
> Todas las decisiones arquitectónicas, modificaciones, ampliaciones y refinamientos respecto a la especificación original se registran en este documento.

---

## Índice de Cambios

1. [CHG-001: Actualización de Versión de Framework a Laravel 13](#chg-001-actualización-de-versión-de-framework-a-laravel-13)
2. [CHG-002: Esquema de Identificadores Internos con ULID](#chg-002-esquema-de-identificadores-internos-con-ulid)
3. [CHG-003: Identificador Público `username` en Users (NanoID 10 chars anticonfusión + personalización hasta 20)](#chg-003-identificador-público-username-en-users)
4. [CHG-004: Códigos QR Dinámicos (NanoID 6 chars anticonfusión + alias hasta 12)](#chg-004-códigos-qr-dinámicos)
5. [CHG-005: Arquitectura de Seguridad Basada en Permisos Granulares (PBAC)](#chg-005-arquitectura-de-seguridad-basada-en-permisos-granulares-pbac)
6. [CHG-006: Ciclo de Vida de Lecciones y Permiso `lessons.disable`](#chg-006-ciclo-de-vida-de-lecciones-y-permiso-lessonsdisable)
7. [CHG-007: Método `clone()` en el Modelo Lesson](#chg-007-método-clone-en-el-modelo-lesson)
8. [CHG-008: Ciclo de Vida de Contenidos H5P (`status`) y Permisos Asociados](#chg-008-ciclo-de-vida-de-contenidos-h5p-status-y-permisos-asociados)
9. [CHG-009: Método `clone()` en el Modelo H5pContent](#chg-009-método-clone-en-el-modelo-h5pcontent)
10. [CHG-010: Estandarización de Material-UI a su Versión Más Reciente (MUI v6+)](#chg-010-estandarización-de-material-ui-a-su-versión-más-reciente-mui-v6)
11. [CHG-011: Política de Gestión de Ramas Git (main, develop, feature/*)](#chg-011-política-de-gestión-de-ramas-git)
12. [CHG-012: Exportación Editorial de Códigos QR (SVG Vectorial y PNG Alta Resolución)](#chg-012-exportación-editorial-de-códigos-qr)
13. [CHG-013: Telemetría y Geolocalización en Escaneos QR (GeoLocationService)](#chg-013-telemetría-y-geolocalización-en-escaneos-qr)
14. [CHG-014: Suite de Pruebas de Componentes Frontend (Vitest + React Testing Library)](#chg-014-suite-de-pruebas-de-componentes-frontend)
15. [CHG-015: Definición del Nombre Corto Institucional del Proyecto: LAAB](#chg-015-definición-del-nombre-corto-institucional-del-proyecto-laab)
16. [CHG-016: Adopción de la Política de Optimizaciones de Base de Datos y Caché](#chg-016-adopción-de-la-política-de-optimizaciones-de-base-de-datos-y-caché)
17. [CHG-017: Optimización y Limpieza React Doctor del Módulo de Códigos QR](#chg-017-optimización-y-limpieza-react-doctor-del-módulo-de-códigos-qr)
18. [CHG-018: Formalización de la Política de Componentes Frontend, Estándares MUI v6 y React Doctor](#chg-018-formalización-de-la-política-de-componentes-frontend-estándares-mui-v6-y-react-doctor)
19. [CHG-019: Adopción de la Regla de Prohibición Estricta de TailwindCSS (Zero-Tailwind Policy)](#chg-019-adopción-de-la-regla-de-prohibición-estricta-de-tailwindcss-zero-tailwind-policy)
20. [CHG-020: Implementación Completa de la Fase 3: Editor H5P y Gestión de Paquetes](#chg-020-implementación-completa-de-la-fase-3-editor-h5p-y-gestión-de-paquetes)
21. [CHG-021: Implementación Integral de la Fase 4: Reproductor H5P y Telemetría xAPI](#chg-021-implementación-integral-de-la-fase-4-reproductor-h5p-y-telemetría-xapi)
22. [CHG-022: Implementación de la Fase 5: Auditoría de Frontend, Refinamiento UI/UX y Consolidación del Sistema](#chg-022-implementación-de-la-fase-5-auditoría-de-frontend-refinamiento-uiux-y-consolidación-del-sistema)
23. [CHG-023: Creación del Layout No Autorizado / Público (GuestLayout)](#chg-023-creación-del-layout-no-autorizado--público-guestlayout)
24. [CHG-024: Integración Editorial de la Reseña del Libro y Sección Curricular Dedicada](#chg-024-integración-editorial-de-la-reseña-del-libro-y-sección-curricular-dedicada)
25. [CHG-025: Desacoplamiento de Vistas Previas H5P y Acceso Rápido desde Listado y Editor](#chg-025-desacoplamiento-de-vistas-previas-h5p-y-acceso-rápido-desde-listado-y-editor)
26. [CHG-026: Editor de Image Hotspots: Color de Pines en Blanco Clásico y Arrastre Fluido de Marcadores](#chg-026-editor-de-image-hotspots-color-de-pines-en-blanco-clásico-y-arrastre-fluido-de-marcadores)
27. [CHG-027: Integración de Asistente de Inteligencia Artificial (Google Gemini y Ollama) para Descripciones Anatómicas](#chg-027-integración-de-asistente-de-inteligencia-artificial-google-gemini-15-y-ollama-para-descripciones-anatómicas)
28. [CHG-028: Módulo de Tutor de Estudio IAndreas (RAG Local) e Integración Multiproveedor en HotSpots H5P](#chg-028-módulo-de-tutor-de-estudio-iandreas-rag-local-e-integración-multiproveedor-en-hotspots-h5p)

---

### CHG-001: Actualización de Versión de Framework a Laravel 13
* **Especificación original:** Laravel 11.
* **Cambio aplicado:** Se inicializó y configuró el núcleo de la aplicación con **Laravel 13** (`v13.33.0`) sobre **PHP 8.4 / 8.5**.
* **Motivación:** Aprovechar las optimizaciones más recientes de Laravel 13, mejoras en rendimiento de routing, atributos de modelos y compatibilidad moderna.
* **Componentes afectados:** `composer.json`, `bootstrap/app.php`, estructura base del proyecto.

---

### CHG-002: Esquema de Identificadores Internos con ULID
* **Especificación original:** Identificadores numéricos autoincrementales convencionales (`bigint`).
* **Cambio aplicado:** Se establecieron **ULIDs (`char(26)`)** como claves primarias inmutables en todas las entidades internas (`users`, `chapters`, `lessons`, `h5p_contents`, `dynamic_qrs`, `qr_analytics`, `user_scores`). Todas las relaciones foráneas se implementaron con `foreignUlid`.
* **Motivación:** Ocultar volumen secuencial de datos, prevenir enumeración maliciosa en URLs internas, mantener ordenación lexicográfica cronológica y asegurar compatibilidad nativa mediante el trait `HasUlids` de Eloquent.
* **Componentes afectados:** Todas las migraciones y modelos en `database/migrations/` y `app/Models/`.

---

### CHG-003: Identificador Público `username` en Users
* **Especificación original:** Modelo User estándar sin campo username explícito.
* **Cambio aplicado:**
  * Se agregó la columna `username` (`string(20)->unique()`).
  * **Sugerencia inicial automática:** NanoID de **10 caracteres** empleando el alfabeto anticonfusión (`0123456789ACDEFHJKLMNPQRTUVWXY`), excluyendo expresamente los caracteres `I, Z, S, G, B, O` para evitar confusiones de lectura.
  * **Personalización del usuario:** El usuario puede modificar libremente su username en cualquier momento, permitiendo cualquier carácter alfanumérico (`a-z`, `A-Z`, `0-9`, `_-`) de hasta **20 caracteres**, garantizando su unicidad.
  * La clave primaria interna `ULID` permanece inalterada ante cambios de username.
* **Componentes afectados:** `0001_01_01_000000_create_users_table.php`, `User.php`, `IdGeneratorService.php`, `UserModelTest.php`.

---

### CHG-004: Códigos QR Dinámicos
* **Especificación original:** `short_code` genérico para redirección 302.
* **Cambio aplicado:**
  * **Sugerido por defecto:** NanoID de **6 caracteres** con alfabeto anticonfusión estricto (fácil de leer y transcribir desde el libro físico).
  * **Alias personalizado:** Opción para que el docente asigne un alias nemotécnico de hasta **12 caracteres** alfanuméricos en mayúsculas (ej. `/qr/DORSO`, `/qr/COLUMNA12`).
  * Validación estricta que rechaza caracteres no permitidos o longitud mayor a 12.
* **Componentes afectados:** `2026_09_29_031300_create_dynamic_qrs_table.php`, `DynamicQr.php`, `IdGeneratorService.php`, `DynamicQrTest.php`.

---

### CHG-005: Arquitectura de Seguridad Basada en Permisos Granulares (PBAC)
* **Especificación original:** Control de acceso mediante verificación directa del rol (`Maestro` vs `Alumno`).
* **Cambio aplicado:** Se implementó una arquitectura **Permission-Based Access Control (PBAC)**:
  * Toda validación en rutas, controladores y middlewares comprueba **permisos específicos** (`permission:chapters.create`, `permission:lessons.publish`, `permission:h5p.play`, etc.).
  * Los roles (`Maestro` y `Alumno`) son únicamente **contenedores o agrupadores de permisos predefinidos** para asignación inicial.
  * Soporte nativo para asignar **permisos individuales directos** a cualquier usuario (ej. un alumno asistente que recibe permiso de crear lecciones sin otorgarle el rol completo de maestro).
  * Posibilidad de crear nuevos roles personalizados con combinaciones a la medida.
  * Migración de Spatie Permission adaptada con `char(26)` en `model_morph_key` para compatibilidad con ULID.
* **Componentes afectados:** `2026_09_29_030236_create_permission_tables.php`, `PermissionSeeder.php`, `bootstrap/app.php`, `routes/web.php`, `PermissionAuthorizationTest.php`.

---

### CHG-006: Ciclo de Vida de Lecciones y Permiso `lessons.disable`
* **Especificación original:** Publicación binaria sin permiso específico para reversión a borrador.
* **Cambio aplicado:**
  * Se añadió el método `disable()` en el modelo `Lesson` para regresar la lección al estado borrador (`is_published = false`).
  * Se creó el permiso granular específico `lessons.disable`.
  * Se configuraron rutas protegidas independientes para `lessons.publish` y `lessons.disable`.
* **Componentes afectados:** `Lesson.php`, `PermissionSeeder.php`, `routes/web.php`, `PermissionAuthorizationTest.php`.

---

### CHG-007: Método `clone()` en el Modelo Lesson
* **Especificación original:** Sin funcionalidad explícita de clonación en el modelo.
* **Cambio aplicado:**
  * Se implementó el método `Lesson::clone(?string $newTitle = null)` para duplicar lecciones existentes.
  * La lección clonada nace obligatoriamente en **estado borrador (`is_published = false`)**, con título sufijado `"(copia)"` y nuevo slug único.
  * **Duplica en cascada** todos los contenidos interactivos `H5pContent` asociados como borradores independientes.
  * **Oリング / Aislamiento:** No transfiere códigos QR dinámicos ni registros de puntajes históricos (`UserScore`).
* **Componentes afectados:** `Lesson.php`, `ChapterAndLessonTest.php`.

---

### CHG-008: Ciclo de Vida de Contenidos H5P (`status`) y Permisos Asociados
* **Especificación original:** Modelo `H5p_Contents` sin campo de estado del ciclo de vida.
* **Cambio aplicado:**
  * Se añadió la columna `enum('status', ['draft', 'published', 'disabled'])->default('draft')`.
  * Nuevos métodos en el modelo: `publish()`, `disable()`, `isPlayable(): bool`.
  * Nuevos permisos granulares: `h5p.publish`, `h5p.disable`, `h5p.clone`.
  * Regla de negocio: Los alumnos solo pueden reproducir contenidos que tengan `status === 'published'`.
* **Componentes afectados:** `2026_09_29_031200_create_h5p_contents_table.php`, `H5pContent.php`, `H5pContentFactory.php`, `PermissionSeeder.php`, `H5pContentTest.php`.

---

### CHG-009: Método `clone()` en el Modelo H5pContent
* **Especificación original:** Sin soporte de duplicación de actividades interactivas.
* **Cambio aplicado:**
  * Se implementó el método `H5pContent::clone(?string $newTitle = null, ?string $targetLessonId = null)`.
  * Genera una copia en estado `draft`, con título sufijado `"(copia)"`, replicando parámetros JSON, metadatos y biblioteca.
  * No duplica las calificaciones históricas (`UserScore`).
* **Componentes afectados:** `H5pContent.php`, `H5pContentTest.php`.

---

### CHG-010: Estandarización de Material-UI a su Versión Más Reciente (MUI v6+)
* **Especificación original:** Uso de Material-UI sin versión estipulada.
* **Cambio aplicado:** Se definió el uso de **Material-UI versión 6+** (MUI v6) para todos los componentes de frontend React, configurando temas de alto contraste y ergonomía visual anti-fatiga para lectura prolongada.
* **Componentes afectados:** Plan arquitectónico y futuros componentes React en Fases 2, 3, 4 y 5.

---

### CHG-011: Política de Gestión de Ramas Git
* **Especificación original:** Sin directiva de ramas definida en el prompt maestro.
* **Cambio aplicado:**
  * Adopción de dos ramas permanentes: **`main`** (código estable de producción) y **`develop`** (rama activa de integración continua).
  * Desarrollo en ramas efímeras de funcionalidad con nomenclatura `feature/<modulo-descripcion>`, fusionadas a `develop` sin fast-forward (`--no-ff`) tras validar pruebas unitarias al 100%.
  * Despliegues a `main` desde `develop` acompañados de tags de versión semántica.
* **Componentes afectados:** Repositorio Git local (`.git`), [docs/politica_de_ramas_git.md](file:///home/antsanch/webapps/LibroAumentado/docs/politica_de_ramas_git.md).

---

### CHG-012: Exportación Editorial de Códigos QR
* **Especificación original:** Generación de imagen gráfica sin formatos estipulados.
* **Cambio aplicado:**
  * Implementación de exportación dual con `chillerlan/php-qrcode` utilizando el motor GD nativo:
    * **SVG Vectorial:** Para maquetación editorial en InDesign/Illustrator e impresión física a cualquier escala sin pixelación.
    * **PNG en Alta Resolución:** Con escalas configurables (10x ~350px hasta 30x ~1050px) para medios digitales y guías rápidas.
* **Componentes afectados:** `app/Services/QrExportService.php`, `QrManagementController.php`, `QrExportModal.tsx`.

---

### CHG-013: Telemetría y Geolocalización en Escaneos QR (GeoLocationService)
* **Especificación original:** Guardar cuántas veces ha sido escaneado y de qué país o región proviene.
* **Cambio aplicado:**
  * Se diseñó el servicio desacoplado `GeoLocationService` para extraer IP real del cliente (soporte para Cloudflare `CF-Connecting-IP`, `X-Forwarded-For`), país y región, y clasificar el tipo de dispositivo a partir del User-Agent (Móvil, Tablet, Escritorio).
  * Inclusión de cabeceras de respuesta anti-caché (`no-cache, no-store, must-revalidate`) en la redirección HTTP 302 para evitar que navegadores móviles omitan el conteo en lecturas sucesivas.
* **Componentes afectados:** `app/Services/GeoLocationService.php`, `QrRedirectController.php`, `QrAnalyticsController.php`.

---

### CHG-014: Suite de Pruebas de Componentes Frontend (Vitest + React Testing Library)
* **Especificación original:** Pruebas en Jest para el formulario de creación.
* **Cambio aplicado:**
  * Configuración de Vitest nativo con `jsdom` y React Testing Library, logrando ejecución ultrarrápida compatible con Vite 8 y React 19.
  * Pruebas del formulario `QrFormDialog`: renderizado por defecto, forzado a mayúsculas, límite de 12 caracteres y envío de formulario.
* **Componentes afectados:** `vite.config.js`, `package.json`, `tests/setup.ts`, `tests/Unit/QrFormDialog.test.tsx`.

---

### CHG-015: Definición del Nombre Corto Institucional del Proyecto: LAAB
* **Especificación original:** Referenciado de forma descriptiva y extensa como *"Libro Aumentado de Anatomía para Ingeniería Biomédica"*.
* **Cambio aplicado:**
  * Se formalizó y aprobó el nombre corto y acrónimo institucional **`LAAB`** (*L*ibro *A*umentado de *A*natomía para *B*iomédica).
  * Se configuró `APP_NAME="LAAB"` en `.env` y `.env.example`, y se actualizaron los encabezados y títulos de la aplicación en el frontend.
* **Componentes afectados:** `.env`, `.env.example`, `resources/js/app.tsx`, `resources/js/Pages/Qr/Index.tsx`, `docs/changes.md`.

---

### CHG-016: Adopción de la Política de Optimizaciones de Base de Datos y Caché
* **Especificación original:** Sin directiva formal de rendimiento y caché de base de datos en el prompt maestro.
* **Cambio aplicado:**
  * Se diseñó y formalizó el marco de optimizaciones de bases de datos para MySQL 8.0:
    * Mapa de índices compuestos en tablas críticas (`dynamic_qrs`, `chapters`, `lessons`, `h5p_contents`, `qr_analytics`, `user_scores`).
    * Estrategia de caché por capas: resolución de URLs de códigos QR (`qr:destination:{code}`), árbol de estudio (`study:chapters:tree`) y purga por eventos de modelo.
    * Prohibición estricta de consultas N+1, uso de proyección selectiva de columnas y agregaciones nativas de MySQL.
* **Componentes afectados:** [docs/database_optimizations.md](file:///home/antsanch/webapps/LibroAumentado/docs/database_optimizations.md), `docs/changes.md`.

---

### CHG-017: Auditoría y Refactorización React Doctor (100/100)
* **Especificación original:** Componentes React iniciales de gestión de Códigos QR evaluados con `react-doctor`.
* **Diagnóstico inicial:** Score **63/100** con 10 advertencias:
  * 3 advertencias de consumo de cuerpo de respuesta `fetch` sin validar `response.ok` / `response.status`.
  * 3 advertencias de uso de índices de array numéricos como `key` en listas dinámicas.
  * 1 advertencia de simulación de manejador de eventos y llamada a `fetch` dentro de `useEffect` en `QrAnalyticsModal`.
  * 1 advertencia de ajuste de estado derivado de props vía `useEffect` en `QrFormDialog`.
  * 1 advertencia de valores por defecto tipo array literal (`[]`) rompiendo memoización en `QrIndex`.
* **Cambio aplicado:**
  * Se sustituyeron keys numéricas por identificadores únicos compuestos estables en `QrAnalyticsSummary` y `QrGeoBreakdown`.
  * Se convirtió `QrAnalyticsModal` en un componente de presentación puro desacoplado, elevando la petición al manejador de eventos del usuario en `QrIndex`.
  * Se refactorizó `QrFormDialog` utilizando el patrón canónico de reseteo mediante `key` de montaje para eliminar el `useEffect` de sincronización de estado.
  * Se validó `response.ok` antes del consumo de respuestas `fetch` y se utilizaron referencias estáticas para props por defecto.
* **Resultado:** Score auditado **100/100 Great** (`0 issues`).
* **Componentes afectados:** [QrAnalyticsModal.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Qr/QrAnalyticsModal.tsx), [QrFormDialog.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Qr/QrFormDialog.tsx), [QrAnalyticsSummary.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Qr/QrAnalyticsSummary.tsx), [QrGeoBreakdown.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Qr/QrGeoBreakdown.tsx), [Index.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Pages/Qr/Index.tsx), [docs/changes.md](file:///home/antsanch/webapps/LibroAumentado/docs/changes.md).

---

### CHG-018: Formalización de la Política de Componentes Frontend, Estándares MUI v6 y React Doctor
* **Especificación original:** Sin documento formal unificado de política de componentes en `/docs/`.
* **Cambio aplicado:**
  * Se redactó y formalizó la política integral en [docs/politica_de_componentes.md](file:///home/antsanch/webapps/LibroAumentado/docs/politica_de_componentes.md):
    * **Anti-Megacomponentes:** Arquitectura modular por dominio (`resources/js/Components/{Modulo}/`), límite de tamaño (~150-200 líneas por archivo) y separación estricta de responsabilidades (presentacionales puros vs orquestadores).
    * **Sintaxis MUI v6:** Obligatoriedad de sintaxis unificada `slotProps` (eliminando `inputProps` / `InputProps` deprecados) y consulta continua a la documentación/MCP de Material-UI.
    * **Auditoría Continua React Doctor:** Obligatoriedad de alcanzar y mantener un score de **100/100 Great (0 issues)** con `npx -y react-doctor@latest .` antes de fusionar cualquier pull request o feature.
    * **Pruebas y Checklist:** Suite de pruebas unitarias accesibles (Vitest + Testing Library) y secuencia estricta de validación previa al commit.
* **Componentes afectados:** [docs/politica_de_componentes.md](file:///home/antsanch/webapps/LibroAumentado/docs/politica_de_componentes.md), `docs/changes.md`.

---

### CHG-019: Adopción de la Regla de Prohibición Estricta de TailwindCSS (Zero-Tailwind Policy)
* **Especificación original:** El esqueleto inicial de Laravel incluía `@import 'tailwindcss';` en `resources/css/app.css` y paquetes de Tailwind en `devDependencies`.
* **Cambio aplicado:**
  * Se formalizó la regla obligatoria en la sección 4 de [docs/politica_de_componentes.md](file:///home/antsanch/webapps/LibroAumentado/docs/politica_de_componentes.md):
    * Prohibición absoluta del uso de TailwindCSS y sus clases de utilidad en cualquier componente, página o vista del proyecto.
    * Todo el estilizado se gestiona exclusivamente a través de los componentes de Material-UI v6, la prop `sx`, los tokens del tema `theme.ts` y Vanilla CSS básico en `resources/css/app.css`.
  * Se eliminó `@import 'tailwindcss';` y `@theme` de `resources/css/app.css`, sustituyéndolo por Vanilla CSS puro con tipografías ergonómicas (*Outfit* y *JetBrains Mono*).
  * Se removieron las dependencias `tailwindcss` y `@tailwindcss/vite` de `package.json`.
  * Reducción del bundle CSS de `21.89 kB` a `0.52 kB` y eliminación total de advertencias en `vite build`.
* **Componentes afectados:** [docs/politica_de_componentes.md](file:///home/antsanch/webapps/LibroAumentado/docs/politica_de_componentes.md), `resources/css/app.css`, `package.json`, `docs/changes.md`.

---

### CHG-020: Implementación Completa de la Fase 3: Editor H5P y Gestión de Paquetes
* **Especificación original:** Fase 3 descrita en `prompts/MasterPrompt.md` y formalizada en el artefacto de ejecución aprobado.
* **Cambio aplicado:**
  * **Backend de H5P y Servicios:**
    * `App\Services\H5pLibraryRegistry`: Catálogo y parámetros predeterminados para las 5 actividades anatómicas interactivas soportadas (*Image Hotspots*, *Fill in the Blanks*, *Drag the Words*, *Drag and Drop*, *Question Set*).
    * `App\Services\H5pValidationService`: Validación estructural exhaustiva de paquetes `.h5p` (verificación ZIP, `h5p.json`, `content/content.json` y dependencias de librerías).
    * `App\Services\H5pPackageService`: Gestión de almacenamiento físico en storage, descompresión para assets y re-empaquetado ZIP exportable/descargable.
    * `App\Http\Controllers\H5pManagementController`: Endpoints completos protegidos por PBAC para subida, creación desde plantilla, edición, clonación (`clone`), actualización de estado (`draft`/`published`/`disabled`), eliminación y descarga.
  * **Frontend Modular React (MUI v6 + Zero-Tailwind):**
    * Cero megacomponentes: Descompuesto en `resources/js/Components/H5p/`: `H5pStatusBadge.tsx`, `H5pLibrarySelector.tsx`, `H5pPackageUploader.tsx`, `H5pContentTableRow.tsx`, `H5pContentTable.tsx`, `H5pCreateModal.tsx`, `H5pEditorPreviewModal.tsx`.
    * Vista orquestadora en `resources/js/Pages/H5p/Index.tsx` con soporte para temas claro y oscuro suaves.
  * **Auditoría y Pruebas:**
    * 57 tests PHPUnit pasando al 100% (345 aserciones).
    * 9 tests Vitest pasando al 100% (`H5pPackageUploader`, `H5pLibrarySelector`, `QrFormDialog`).
    * React Doctor auditó el frontend con calificación perfecta **100/100 Great (0 issues)**.
* **Componentes afectados:** `app/Services/H5pLibraryRegistry.php`, `app/Services/H5pValidationService.php`, `app/Services/H5pPackageService.php`, `app/Http/Controllers/H5pManagementController.php`, `app/Http/Requests/*`, `routes/web.php`, `resources/js/Components/H5p/*`, `resources/js/Pages/H5p/*`, `tests/Feature/H5p*`, `tests/Unit/H5p*`, `docs/changes.md`.

---

### CHG-021: Implementación Integral de la Fase 4: Reproductor H5P y Telemetría xAPI
* **Especificación original:** Fase 4 descrita en `prompts/MasterPrompt.md` y formalizada en el artefacto [plan_fase4_player_xapi.md](file:///home/antsanch/.gemini/antigravity-ide/brain/592a6cbf-ace9-41be-8d17-531046736dc1/plan_fase4_player_xapi.md).
* **Cambio aplicado:**
  * **Backend de Telemetría y Portal Formativo:**
    * `App\Http\Requests\StoreTelemetryScoreRequest`: Validación rigurosa de enunciados de calificación xAPI (`h5p_content_id`, `score`, `max_score > 0`, payload de declaración xAPI).
    * `App\Http\Controllers\TelemetryScoreController`: Endpoint `POST /telemetry/scores` protegido por el permiso PBAC `scores.record_own`. Registra o actualiza de manera idempotente la calificación del estudiante en `user_scores`, conservando siempre el mejor desempeño histórico (`score >= existing->score`), calculando porcentaje y estado de acreditación (`percentage >= 70.0`).
    * `App\Http\Controllers\StudyController`: Endpoints de estudio protegidos por `chapters.view`:
      * `GET /study`: Portal formativo con árbol jerárquico de capítulos activos y lecciones publicadas, enriquecido con conteo de actividades y puntajes previos del alumno autenticado.
      * `GET /study/lessons/{lesson}`: Entorno interactivo con lección, actividades publicadas, enlaces adyacentes (`prevLesson`, `nextLesson`) y calificaciones previas.
      * `GET /study/progress`: Métricas consolidadas (total de completadas, ejercicios aprobados y promedio global).
    * `routes/web.php`: Rutas registradas en los grupos `/study` y `/telemetry/scores`.
  * **Frontend Modular React (MUI v6, Zero-Tailwind, Anti-Megacomponentes):**
    * Cero megacomponentes (< 160 líneas por archivo) organizados en `resources/js/Components/Study/`:
      * `types.ts`: Interfaces TypeScript para `ChapterSummary`, `LessonSummary`, `H5pActivity`, `UserScoreRecord`, `ProgressSummary`, `XapiStatement`.
      * `ChapterAccordionNav.tsx`: Acordeón colapsable para navegación entre capítulos y lecciones con insignias de acreditación.
      * `LessonHeaderCard.tsx`: Cabecera de lección con metadatos anatómicos, guía de estudio y botones anterior/siguiente.
      * `H5pPlayerFrame.tsx`: Contenedor responsivo en `Card` de MUI con barra de herramientas, selector de pantalla completa, visualizador de simulador de actividades anatómicas e integración con xAPI.
      * `useXapiListener.ts`: Hook reactivo que intercepta eventos xAPI (`H5P.externalDispatcher` y `window.onmessage`) y envía el registro asíncrono con `fetch` y cabeceras CSRF.
      * `ScoreFeedbackModal.tsx`: Diálogo modal de retroalimentación inmediata post-ejercicio con umbral de acreditación del 70%.
      * `StudentProgressCard.tsx`: Resumen de métricas formativas (ejercicios completados, aprobados, tasa de éxito y promedio global).
    * Vistas orquestadoras:
      * `resources/js/Pages/Study/Index.tsx`: Portal del estudiante con índice jerárquico y tarjeta de progreso.
      * `resources/js/Pages/Study/Lesson.tsx`: Entorno de aprendizaje interactivo con pestañas de actividades H5P y guía didáctica.
      * `resources/js/Pages/Welcome.tsx`: Actualizado con tarjeta dedicada al Portal de Estudio y acceso directo a `/study`.
  * **Pruebas y Calidad de Código:**
    * **68 pruebas PHPUnit** pasando al 100% (382 aserciones), incluyendo `TelemetryScoreApiTest` y `StudyNavigationTest`.
    * **14 pruebas Vitest** pasando al 100% en frontend, incluyendo `StudyComponents.test.tsx` y `XapiListener.test.ts`.
    * **React Doctor Audit:** Calificación perfecta **100/100 Great (0 issues)** en los 40 archivos escaneados.
    * **Build de producción:** `npm run build` ejecutado exitosamente con 0 advertencias de sintaxis.
* **Componentes afectados:** `app/Http/Controllers/TelemetryScoreController.php`, `app/Http/Controllers/StudyController.php`, `app/Http/Requests/StoreTelemetryScoreRequest.php`, `routes/web.php`, `resources/js/Components/Study/*`, `resources/js/Pages/Study/*`, `resources/js/Pages/Welcome.tsx`, `tests/Feature/TelemetryScoreApiTest.php`, `tests/Feature/StudyNavigationTest.php`, `tests/Unit/StudyComponents.test.tsx`, `tests/Unit/XapiListener.test.ts`, `docs/changes.md`.

---

### CHG-022: Implementación de la Fase 5: Auditoría de Frontend, Refinamiento UI/UX y Consolidación del Sistema
* **Especificación original:** Fase 5 descrita en `prompts/MasterPrompt.md` y formalizada en el artefacto [plan_fase5_ui_refinement_audit.md](file:///home/antsanch/.gemini/antigravity-ide/brain/592a6cbf-ace9-41be-8d17-531046736dc1/plan_fase5_ui_refinement_audit.md).
* **Cambio aplicado:**
  * **Arquitectura de Layout Unificada y Cohesiva:**
    * `resources/js/Components/Layout/types.ts`: Interfaces para usuario autenticado (`AuthUser`) y elementos de navegación del sistema.
    * `resources/js/Components/Layout/AppHeader.tsx`: Barra de aplicación global con isotipo LAAB, alternador de menú lateral responsivo, visualizador de rol activo (*Docente* vs *Alumno*), selector de modo claro/oscuro y cierre de sesión seguro.
    * `resources/js/Components/Layout/AppNavigationDrawer.tsx`: Drawer lateral de navegación modular con control de visibilidad PBAC estricto (oculta las herramientas de administración docente como Códigos QR y Editor H5P a los alumnos).
    * `resources/js/Components/Layout/AppLayout.tsx`: Orquestador maestro que centraliza `ThemeProvider`, `CssBaseline`, persistencia del tema en `localStorage` con detección automática de preferencia de sistema (`useMediaQuery`), y un contenedor ergonómico fluido.
  * **Adopción Global del Layout en Vistas:**
    * Se refactorizaron las páginas [Welcome.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Pages/Welcome.tsx), [Qr/Index.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Pages/Qr/Index.tsx), [H5p/Index.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Pages/H5p/Index.tsx), [Study/Index.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Pages/Study/Index.tsx) y [Study/Lesson.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Pages/Study/Lesson.tsx) para adoptar el `AppLayout` unificado, eliminando más de 120 líneas de código duplicado de barras de herramientas y selectores de tema.
  * **Refinamiento Ergonómico del Tema Médico (`resources/js/theme.ts`):**
    * Calibración de tokens de contraste WCAG AAA, jerarquía tipográfica con fuentes Google (*Outfit* para títulos anatómicos e *Inter* para lectura técnica prolongada) y micro-interacciones suaves.
  * **Automatización del Pipeline React Doctor:**
    * Adición de scripts en `package.json`: `"doctor": "npx -y react-doctor@latest ."` y `"doctor:check": "printf '\\n\\n' | npx -y react-doctor@latest ."`.
  * **Pruebas y Verificación Integral:**
    * **18 pruebas Vitest** pasando al 100%, incluyendo la nueva suite `tests/Unit/AppLayout.test.tsx`.
    * **68 pruebas PHPUnit** pasando al 100% (382 aserciones).
    * **React Doctor Audit:** Calificación perfecta **100/100 Great (0 issues)** en los 45 archivos de la aplicación.
    * **Build de Producción:** `npm run build` compilado en 840ms con cero errores.
* **Componentes afectados:** `resources/js/Components/Layout/*`, `resources/js/theme.ts`, `resources/js/Pages/Welcome.tsx`, `resources/js/Pages/Qr/Index.tsx`, `resources/js/Pages/H5p/Index.tsx`, `resources/js/Pages/Study/Index.tsx`, `resources/js/Pages/Study/Lesson.tsx`, `package.json`, `tests/Unit/AppLayout.test.tsx`, `docs/changes.md`.

---

### CHG-023: Creación del Layout No Autorizado / Público (GuestLayout)
* **Especificación original:** Los usuarios no autenticados o que recién llegan a la plataforma requerían una experiencia de bienvenida visualmente diferenciada sin componentes de navegación administrativa ni menús vacíos.
* **Cambio aplicado:**
  * **Creación del Layout para Visitantes e Inicio de Sesión (`resources/js/Components/Layout/`):**
    * `GuestHeader.tsx`: Encabezado público minimalista y elegante que exhibe el isotipo y nombre completo de la plataforma LAAB, conmutador de tema claro/oscuro persistente y botón de acción destacado para *Iniciar Sesión*.
    * `GuestFooter.tsx`: Pie de página profesional con información del proyecto anatómico, notas de tecnología biomédica, enlaces rápidos y aviso de copyright.
    * `GuestLayout.tsx`: Contenedor maestro con fondo degradado sutil (`radial-gradient`), gestión de modo claro/oscuro con persistencia en `localStorage`, `CssBaseline` y área central fluida.
  * **Integración en Páginas Públicas:**
    * [Login.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Pages/Auth/Login.tsx): Refactorizado para adoptar `GuestLayout`, eliminando código duplicado de tema y cabeceras.
    * [Welcome.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Pages/Welcome.tsx): Renderizado condicional: si el visitante no ha iniciado sesión (`!currentUser`), se presenta mediante `GuestLayout`; si ya cuenta con sesión activa, se presenta con `AppLayout` y su menú docente/estudiantil.
  * **Pruebas y Verificación:**
    * Nueva suite de pruebas unitarias `tests/Unit/GuestLayout.test.tsx` (3 tests).
    * Total de pruebas Vitest incrementado a **21 tests pasando al 100%**.
    * Auditoría con **React Doctor** manteniendo score perfecto **100/100 Great (0 issues)** en 49 archivos.
* **Componentes afectados:** `resources/js/Components/Layout/GuestHeader.tsx`, `resources/js/Components/Layout/GuestFooter.tsx`, `resources/js/Components/Layout/GuestLayout.tsx`, `resources/js/Pages/Auth/Login.tsx`, `resources/js/Pages/Welcome.tsx`, `tests/Unit/GuestLayout.test.tsx`, `docs/changes.md`.

---

### CHG-024: Integración Editorial de la Reseña del Libro y Sección Curricular Dedicada
* **Especificación original:** El portal de bienvenida mostraba tarjetas técnicas orientadas a fases de desarrollo sin reflejar la identidad pedagógica, académica ni editorial del libro de texto físico *Fundamentos de Anatomía Humana para Ingeniería Biomédica* (consignado en `prompts/rese_a_y_ficha_editorial.md`).
* **Cambio aplicado:**
  * **Sección y Componentes Modulares del Libro (`resources/js/Components/Book/`):**
    * `types.ts`: Modelos de datos para autores, pilares biomédicos, desglose de los 8 capítulos y especificaciones técnicas de publicación.
    * `BookHeroBanner.tsx`: Cabecera editorial con título oficial, lema («La interfaz definitiva entre la morfología clínica y el diseño biotecnológico»), adscripción a la Facultad de Medicina UANL y botones de acción rápida.
    * `BookAuthorsCard.tsx`: Ficha con los 4 autores principales (Dr. Antonio Sánchez Uresti, Dr. C. Rodrigo Enrique Elizondo Omaña, Dr. med. Santos Guzmán López, Dr. med. Guillermo Jacobo Baca) y entidades editoriales.
    * `BookPillarsGrid.tsx`: Exposición de los 5 pilares anatomo-biomédicos (Diseño de Dispositivos y Prótesis, Biomecánica Rigurosa, Modelado y Simulación CAD/FEA, Lenguaje Clínico Interdisciplinario y Seguridad/Rutas de Intervención).
    * `BookActiveMethodology.tsx`: Cuadrícula con los 4 componentes del aprendizaje activo (serie audiovisual *Anatomy Tips*, códigos QR dinámicos LAAB, cuaderno de trabajo integrado *Workbook* y autoevaluación interactiva con xAPI).
    * `BookChaptersTable.tsx`: Tabla detallada de los 8 capítulos fundamentales correlacionando el enfoque morfológico con su aplicación directa en bioingeniería.
    * `BookProductSpecsCard.tsx`: Dictamen curricular de evaluadores académicos, ficha técnica de formato físico (270+ páginas a color, cuaderno de trabajo integrado) e incorporación de la miniatura oficial de la portada (`public/img/portadaLibro.png`).
  * **Vista Dedicada del Libro (`resources/js/Pages/Book/Index.tsx`) y Ruta `/book`:**
    * Nueva ruta web pública `Route::get('/book')` accesible a visitantes y usuarios autenticados.
    * Integración del enlace directo a «El Libro» en [GuestHeader.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Layout/GuestHeader.tsx) y «Ficha del Libro» en [AppNavigationDrawer.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Layout/AppNavigationDrawer.tsx).
  * **Refactorización Modular de la Página Principal ([Welcome.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Pages/Welcome.tsx)):**
    * Separación en subcomponentes atómicos (`PlatformMetrics.tsx`, `PlatformModulesGrid.tsx`, `BookOverviewSection.tsx`).
    * Inclusión de la miniatura de la portada (`/img/portadaLibro.png`) con efecto hover y sombreado tridimensional en `BookOverviewSection.tsx`.
    * Código limpio, de alta legibilidad (< 75 líneas en `Welcome.tsx`).
  * **Pruebas y Verificación:**
    * Suite de pruebas unitarias `tests/Unit/BookComponents.test.tsx` (8 tests) ampliada con aserciones para la portada `/img/portadaLibro.png`.
    * Total de pruebas Vitest mantenido en **29 tests pasando al 100% (8 suites)**.
    * Compilación de producción con Vite exitosa en ~784ms sin advertencias.
* **Componentes afectados:** `resources/js/Components/Book/*`, `resources/js/Components/Welcome/*`, `resources/js/Pages/Book/Index.tsx`, `resources/js/Pages/Welcome.tsx`, `resources/js/Components/Layout/GuestHeader.tsx`, `resources/js/Components/Layout/AppNavigationDrawer.tsx`, `routes/web.php`, `tests/Unit/BookComponents.test.tsx`, `public/img/portadaLibro.png`, `docs/changes.md`.

---

## [2026-09-29] Rediseño de Layout a 1440px con Sidebar Global y Configuración de Alias `@Components`

* **Especificación original:** Modificar `AppLayout` / `AuthorizedLayout` para proporcionar un ancho máximo de 1440 px con barra lateral (sidebar) para el menú global del sitio y el área de contenido ocupando todo el espacio disponible. Adicionalmente, configurar un alias para la carpeta de componentes y erradicar las importaciones relativas con `../../..`.
* **Cambio aplicado:**
  * **Layout y Arquitectura de Navegación (`resources/js/Components/Layout/`):**
    * `AppNavList.tsx`: Subcomponente desacoplado y reutilizable que administra los ítems de navegación global (Inicio, Portal de Estudio, Ficha del Libro, y herramientas docentes como Códigos QR y Actividades H5P) junto al detector de ruta activa con `usePage().url`.
    * `AppSidebar.tsx`: Barra lateral fija/sticky para pantallas grandes (`lg+`), de 260 px de ancho, que contiene `AppNavList` y pie editorial inferior; oculta en `xs`, `sm` y `md`.
    * `AppLayout.tsx`: Contenedor principal limitado a `maxWidth: 1920` y centrado (`mx: auto`), integrando `AppSidebar` y `<Box component="main">` con expansión flexible (`flexGrow: 1, minWidth: 0, width: '100%'`). Exporta `AppLayout` y su alias `AuthorizedLayout`.
    * `AuthorizedLayout.tsx`: Módulo exportador directo como alias para `AppLayout`.
    * `AppHeader.tsx`: Ajuste del contenedor superior a `maxWidth: 1920` y condicionamiento responsivo del botón hamburguesa para pantallas `xs`, `sm` y `md`.
    * `AppNavigationDrawer.tsx`: Refactorizado para reutilizar `AppNavList` en vista móvil y tablet.
  * **Configuración del Alias `@Components`:**
    * `tsconfig.json`: Configurados paths `@Components/*` y `@components/*` apuntando a `resources/js/Components/*`.
    * `vite.config.js`: Añadido `resolve.alias` para `@Components` y `@components` con resolución segura en Vite y Vitest.
    * Refactorización de todos los archivos de pruebas (`tests/Unit/*.tsx`, `tests/Unit/*.ts`) sustituyendo rutas relativas `../../resources/js/Components/...` por `@Components/...`.
  * **Pruebas y Verificación:**
    * Actualización de `tests/Unit/AppLayout.test.tsx` sumando pruebas de `AppSidebar` y `AuthorizedLayout`.
    * Suite completa de pruebas ejecutada exitosamente: **31 tests pasando al 100% (8 suites)**.
    * Compilación con `npm run build` ejecutada sin errores.
* **Componentes afectados:** `resources/js/Components/Layout/*`, `tests/Unit/*`, `tsconfig.json`, `vite.config.js`, `docs/changes.md`.

---

### CHG-025: Desacoplamiento de Vistas Previas H5P y Acceso Rápido desde Listado y Editor
* **Especificación original:** La previsualización de actividades interactivas H5P dependía de encontrarse dentro de la pantalla de edición, obligando al usuario a abrir el formulario completo del editor únicamente para revisar el funcionamiento o contenido.
* **Cambio aplicado:**
  * **Desacoplamiento Modal de Vista Previa (`H5pEditorPreviewModal.tsx`):**
    * Se independizó el modal de previsualización para poder renderizar cualquier paquete o contenido interactivo en caliente sin necesidad de un contexto de edición abierto.
    * Incorporación del botón de acceso directo con icono de ojo (`VisibilityOutlined`) en cada fila del listado de actividades ([H5pContentTableRow.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/H5p/H5pContentTableRow.tsx)).
    * Integración directa en la barra de herramientas del editor ([H5pEditorHeader.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/H5p/Editors/Common/H5pEditorHeader.tsx)), permitiendo alternar entre modo edición y vista previa en un solo clic.
  * **Optimización de Renderizado:**
    * Carga condicional y desmontaje limpio del runner interactivo para evitar fugas de memoria o peticiones fantasma de recursos multimedia cuando el diálogo está cerrado.
* **Componentes afectados:** `resources/js/Components/H5p/H5pContentTableRow.tsx`, `resources/js/Components/H5p/H5pContentTable.tsx`, `resources/js/Components/H5p/Editors/Common/H5pEditorHeader.tsx`, `resources/js/Pages/H5p/Index.tsx`, `resources/js/Pages/H5p/Editor.tsx`, `docs/changes.md`.

---

### CHG-026: Editor de Image Hotspots: Color de Pines en Blanco Clásico y Arrastre Fluido de Marcadores
* **Especificación original:** Los pines del editor de *Image Hotspots* únicamente contaban con colores predeterminados (azul, verde, rojo, morado) y sus coordenadas eran estáticas tras el clic inicial en el lienzo, obligando a eliminar el marcador y recrearlo si se deseaba recolocar.
* **Cambio aplicado:**
  * **Paleta Editorial "Blanco Clásico" (`classic-white`):**
    * Se integró la nueva combinación de colores para los pines: fondo blanco puro (`#FFFFFF`), texto y números en negro de alto contraste, forma circular y borde negro nítido (`2px solid #000000`), replicando fielmente el estilo gráfico de las figuras numeradas del libro físico *Fundamentos de Anatomía Humana para Ingeniería Biomédica*.
  * **Arrastre Interactivo (`Drag and Drop`) de Pines en el Lienzo:**
    * Soporte para recolocar libremente los marcadores existentes mediante arrastre con el ratón o trackpad sobre el lienzo interactivo ([HotspotCanvasMarker.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/H5p/Editors/ImageHotspots/HotspotCanvasMarker.tsx)).
    * **Prevención de colisión de eventos:** Se introdujo una referencia mutable (`isDraggingRef`) y un umbral mínimo de desplazamiento (4 px) para distinguir de manera confiable entre un clic de edición y un gesto de arrastre, garantizando que al soltar el pin arrastrado no se dispare el evento de creación de un nuevo marcador en esa posición del canvas.
    * Actualización fluida y en tiempo real de las coordenadas normalizadas `(x, y)` en porcentaje sobre la imagen médica de fondo.
  * **Pruebas y Verificación:**
    * Pruebas unitarias en [ImageHotspotsEditor.test.tsx](file:///home/antsanch/webapps/LibroAumentado/tests/Unit/ImageHotspotsEditor.test.tsx) cubriendo renderizado, selección de colores y manipulación de coordenadas de marcadores.
* **Componentes afectados:** `resources/js/Components/H5p/Editors/ImageHotspots/HotspotCanvasMarker.tsx`, `resources/js/Components/H5p/Editors/ImageHotspots/ImageHotspotsEditor.tsx`, `resources/js/Components/H5p/Editors/ImageHotspots/HotspotsList.tsx`, `tests/Unit/ImageHotspotsEditor.test.tsx`, `docs/changes.md`.

---

### CHG-027: Integración de Asistente de Inteligencia Artificial (Google Gemini 1.5 y Ollama) para Descripciones Anatómicas
* **Especificación original:** La redacción de descripciones y notas clínicas para cada punto anatómico (Spot) dentro del editor de *Image Hotspots* debía ingresarse de forma totalmente manual por el docente.
* **Cambio aplicado:**
  * **Adopción de Google Gemini 1.5 como Proveedor Principal:**
    * Integración directa mediante la API nativa v1beta de Google Generative Language (`https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`).
    * Configuración mediante variables de entorno en `.env` y [config/services.php](file:///home/antsanch/webapps/LibroAumentado/config/services.php):
      * `AI_PROVIDER=gemini` (con soporte alternativo para `ollama`).
      * `GEMINI_API_KEY`: Clave de API de Google AI Studio.
      * `GEMINI_MODEL=gemini-1.5-flash`: Modelo de alto rendimiento, baja latencia y rigor científico anatómico.
    * Inyección de `system_instruction` nativo en el payload JSON para garantizar respuestas estrictamente concisas (máximo 45 palabras) en español formal y sin formato superfluo.
  * **Arquitectura Multiproveedor en Backend ([H5pAiAssistantService.php](file:///home/antsanch/webapps/LibroAumentado/app/Services/H5pAiAssistantService.php)):**
    * Soporta dinámicamente tanto **Google Gemini 1.5** como **Ollama / Open WebUI** (`https://ai.antsanch.dev`), permitiendo conmutar de proveedor sin modificar el código de la aplicación.
    * Timeouts adaptativos (30s para Gemini, 60s para Ollama ante descargas/cargas frías a GPU).
    * Sanitización unificada de respuestas: eliminación de etiquetas `<think>...</think>`, limpieza de comillas y validación de texto resultante.
  * **Controlador y Rutas Seguras:**
    * [H5pAiAssistantController.php](file:///home/antsanch/webapps/LibroAumentado/app/Http/Controllers/H5pAiAssistantController.php): Validación estricta de parámetros (`name`, `context`).
    * Endpoint autenticado `POST /manage/h5p/ai/describe-spot` (nombre de ruta: `manage.h5p.ai.describe_spot`) bajo middleware `['auth']` en [routes/web.php](file:///home/antsanch/webapps/LibroAumentado/routes/web.php).
  * **Frontend Asistido en el Editor ([HotspotFormDialog.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/H5p/Editors/ImageHotspots/HotspotFormDialog.tsx)):**
    * Botón de acción rápida **"Asistir con IA"** (`AutoAwesomeIcon`, `data-testid="ai-describe-spot-btn"`), habilitado dinámicamente cuando el usuario ingresa el nombre de la estructura.
    * Solicitud asíncrona vía `window.fetch` nativo con token CSRF de sesión.
    * Indicador de carga con spinner (`CircularProgress`) durante la generación y autocompletado en el campo "Texto o Descripción".
    * Manejo y retroalimentación gráfica de alertas en caso de indisponibilidad o clave no configurada.
  * **Pruebas y Verificación:**
    * [tests/Unit/H5pAiAssistantServiceTest.php](file:///home/antsanch/webapps/LibroAumentado/tests/Unit/H5pAiAssistantServiceTest.php): 4/4 tests PHPUnit cubriendo llamadas a Gemini 1.5, validación de API key ausente, llamadas a Ollama y sanitización de salida.
    * [tests/Unit/HotspotFormDialog.test.tsx](file:///home/antsanch/webapps/LibroAumentado/tests/Unit/HotspotFormDialog.test.tsx): 4/4 tests Vitest validando interfaz, llamadas a la API y actualización reactiva.
    * Compilación de producción con Vite (`npm run build`) limpia y sin advertencias.
* **Componentes afectados:** `app/Services/H5pAiAssistantService.php`, `app/Http/Controllers/H5pAiAssistantController.php`, `config/services.php`, `routes/web.php`, `.env.example`, `resources/js/Components/H5p/Editors/ImageHotspots/HotspotFormDialog.tsx`, `resources/js/Components/H5p/Editors/ImageHotspots/ImageHotspotsEditor.tsx`, `tests/Unit/H5pAiAssistantServiceTest.php`, `tests/Unit/HotspotFormDialog.test.tsx`, `docs/changes.md`.

---

### CHG-028: Módulo de Tutor de Estudio IAndreas (RAG Local) e Integración Multiproveedor en HotSpots H5P
* **Especificación original:** No existía un módulo de tutoría asistida por inteligencia artificial en el área de estudio del estudiante, ni conexión con el microservicio RAG local entrenado con el manual de anatomía. En el editor de HotSpots H5P, la asistencia de IA estaba ligada a un único proveedor estático sin posibilidad de seleccionar la fuente del conocimiento desde la interfaz.
* **Cambio aplicado:**
  * **Identidad y Filosofía de "IAndreas":**
    * Se bautizó al tutor inteligente como **"IAndreas"**, en homenaje a Andreas Vesalio (1514–1564), padre de la anatomía moderna y autor de *De humani corporis fabrica*, adaptado al contexto tecnológico con IA.
    * Conectado a la base de conocimiento RAG local (`https://iandreas.antsanch.dev`), construida sobre ChromaDB con fragmentos indexados del libro oficial de la cátedra: *Fundamentos de Anatomía Humana para Ingeniería Biomédica (2da Edición)*, ejecutada sobre Llama 3.2 con aceleración GPU (GTX 1060) y temperatura baja (`0.1`) para garantizar máxima fidelidad anatómica y citas exactas de página.
  * **Arquitectura de Backend ([AnatomyTutorService.php](file:///home/antsanch/webapps/LibroAumentado/app/Services/AnatomyTutorService.php) y [TutorController.php](file:///home/antsanch/webapps/LibroAumentado/app/Http/Controllers/TutorController.php)):**
    * **Servicio de Tutoría:** Implementación de `consultar()`, `estaDisponible()` con ping a `/health`, y `obtenerSugerenciasCurriculares()` con temas clave del programa (planimetría, osteología, miología, etc.).
    * **Integración en [H5pAiAssistantService.php](file:///home/antsanch/webapps/LibroAumentado/app/Services/H5pAiAssistantService.php):** Soporte de primera clase para el proveedor `'iandreas'` junto a `'gemini'` y `'ollama'`. Si se elige `iandreas` para describir un Spot, la descripción se fundamenta en las citas del Manual IB mediante RAG con fallback automático a Gemini ante eventuales caídas del microservicio.
    * **Controlador de Asistente H5P ([H5pAiAssistantController.php](file:///home/antsanch/webapps/LibroAumentado/app/Http/Controllers/H5pAiAssistantController.php)):** Acepta el parámetro opcional `provider` (`iandreas`, `gemini`, `ollama`) y retorna en la respuesta los metadatos de las fuentes consultadas y páginas del manual citadas.
    * **Rutas e Inertia:**
      * `GET /study/iandreas` (con alias `/study/tutor` para compatibilidad) gestionado por `TutorController@index`.
      * `POST /study/iandreas/chat` para procesamiento asíncrono de preguntas con historial de conversación.
      * `GET /study/iandreas/status` para telemetría del estado del servicio RAG en tiempo real.
    * **Configuración:** Registro del bloque `services.iandreas` en [config/services.php](file:///home/antsanch/webapps/LibroAumentado/config/services.php) y variables en `.env` y `.env.example` (`AI_PROVIDER=iandreas`, `IANDREAS_BASE_URL=https://iandreas.antsanch.dev`, `IANDREAS_TIMEOUT=30`).
  * **Componentes Frontend Atómicos y Reutilizables (Zero-Tailwind + MUI v6):**
    * Modelos y tipos unificados en [types.ts](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Tutor/types.ts).
    * [IAndreasAvatar.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Tutor/IAndreasAvatar.tsx): Avatar estilizado con estética médica (gradiente aguamarina/azul) y badge con indicador de estado en línea.
    * [IAndreasStatusChip.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Tutor/IAndreasStatusChip.tsx): Chip de telemetría en tiempo real ("RAG GPU Local en línea" vs "Modo offline").
    * [IAndreasSourceCitations.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Tutor/IAndreasSourceCitations.tsx): Acordeón interactivo que despliega las citas textuales, número de página y porcentaje de similitud del Manual de Anatomía IB, con botón de copiado de cita.
    * [IAndreasSuggestedPrompts.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Tutor/IAndreasSuggestedPrompts.tsx): Chips de acceso rápido para formular preguntas frecuentes del temario.
    * [IAndreasInputBar.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Tutor/IAndreasInputBar.tsx): Barra de entrada con atajo `Enter`, conteo de caracteres (0/500) y spinner de envío.
    * [IAndreasChatContainer.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Tutor/IAndreasChatContainer.tsx): Orquestador del flujo conversacional con soporte de auto-scroll protegido para entornos jsdom.
    * [IAndreasFloatingWidget.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Tutor/IAndreasFloatingWidget.tsx): Botón flotante (`Fab`) de acceso rápido y cajón lateral (`Drawer`) integrado directamente en la vista de lecciones de estudio ([Lesson.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Pages/Study/Lesson.tsx)), permitiendo al estudiante consultar a IAndreas sin abandonar la lectura o los modelos 3D.
  * **Selector Multiproveedor en Hotspots H5P ([HotspotFormDialog.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/H5p/Editors/ImageHotspots/HotspotFormDialog.tsx)):**
    * Incorporación de un `ToggleButtonGroup` que permite al docente conmutar en caliente entre **"IAndreas (RAG Libro)"** y **"Gemini 2.5 Flash"** antes de presionar "Asistir con IA", permitiendo enriquecer los pines anatómicos con fragmentos textuales contrastados del manual o con síntesis médica generativa.
  * **Navegación Global ([AppNavList.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Layout/AppNavList.tsx)):**
    * Adición del enlace "Tutor IAndreas" en la sección de estudio con icono `PsychologyOutlined` y chip distintivo "RAG".
  * **Pruebas y Verificación:**
    * **PHPUnit (14/14 pasando):** [AnatomyTutorServiceTest.php](file:///home/antsanch/webapps/LibroAumentado/tests/Unit/AnatomyTutorServiceTest.php), [H5pAiAssistantServiceTest.php](file:///home/antsanch/webapps/LibroAumentado/tests/Unit/H5pAiAssistantServiceTest.php), [TutorControllerTest.php](file:///home/antsanch/webapps/LibroAumentado/tests/Unit/TutorControllerTest.php).
    * **Vitest (15/15 pasando):** [IAndreasComponents.test.tsx](file:///home/antsanch/webapps/LibroAumentado/tests/Unit/IAndreasComponents.test.tsx) y [HotspotFormDialog.test.tsx](file:///home/antsanch/webapps/LibroAumentado/tests/Unit/HotspotFormDialog.test.tsx).
    * **Compilación:** `npm run build` sin advertencias ni errores.
* **Componentes afectados:** `app/Services/AnatomyTutorService.php`, `app/Services/H5pAiAssistantService.php`, `app/Http/Controllers/TutorController.php`, `app/Http/Controllers/H5pAiAssistantController.php`, `config/services.php`, `routes/web.php`, `.env`, `.env.example`, `resources/js/Components/Tutor/*`, `resources/js/Pages/Study/Tutor.tsx`, `resources/js/Pages/Study/Lesson.tsx`, `resources/js/Components/Layout/AppNavList.tsx`, `resources/js/Components/H5p/Editors/ImageHotspots/HotspotFormDialog.tsx`, `tests/Unit/AnatomyTutorServiceTest.php`, `tests/Unit/TutorControllerTest.php`, `tests/Unit/H5pAiAssistantServiceTest.php`, `tests/Unit/IAndreasComponents.test.tsx`, `tests/Unit/HotspotFormDialog.test.tsx`, `docs/changes.md`.

---

### CHG-029: Auditoría Integral Frontend con React Doctor (Score 100/100 Great) y Desacoplamiento Modular
* **Especificación original:** El código frontend acumulaba 53 advertencias y errores según el analizador AST de React Doctor (score inicial: `45/100 Critical`), incluyendo 7 violaciones críticas a las Reglas de Hooks (`rules-of-hooks`), 19 advertencias de mantenibilidad por megacomponentes y complejidad ciclomática (`no-giant-component`, `no-high-complexity-react-function`), 10 problemas de rendimiento por búsquedas $O(n^2)$ (`js-set-map-lookups`), uso indebido de índices como claves de reconciliación (`no-array-index-as-key`) y falta de validación de status HTTP previo a parsear JSON (`no-fetch-without-status-check`).
* **Cambio aplicado:**
  * **Corrección de Reglas de Hooks (`react-doctor/rules-of-hooks`):**
    * En [H5pActivityEditorModal.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/H5p/Editors/H5pActivityEditorModal.tsx), se desacopló el diálogo en `H5pActivityEditorDialog` keyed por `content.id`, erradicando los 7 retornos tempranos que se ejecutaban antes de declarar hooks de estado y efectos.
  * **Optimización de Rendimiento y Búsquedas $O(1)$ (`js-set-map-lookups`):**
    * En simuladores interactivos ([DragTextLivePreview.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/H5p/LivePreviews/DragTextLivePreview.tsx), [DragQuestionLivePreview.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/H5p/LivePreviews/DragQuestionLivePreview.tsx), [QuestionSetLivePreview.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/H5p/LivePreviews/QuestionSetLivePreview.tsx)), se reemplazaron las llamadas `.includes()` y `.find()` dentro de bucles por indexación inmediata con estructuras `Set` y `Map`.
    * Congelación de constantes estructurales vacías (`EMPTY_QUESTIONS`, `EMPTY_DROP_ZONES`, `EMPTY_ELEMENTS`, `DEFAULT_DISTRACTORS`) a nivel de módulo para proteger la memoización de componentes React.
  * **Corrección de Claves de Reconciliación (`react-doctor/no-array-index-as-key`):**
    * Sustitución total de `key={idx}` por identificadores semánticos y deterministas derivados del contenido (`key={b.id || b.raw}`, `key={`zone-${zoneId}`}`, etc.) en editores y simuladores.
  * **Validación Robusta de Peticiones HTTP (`react-doctor/no-fetch-without-status-check`):**
    * Comprobación estricta `if (!res.ok)` previa al consumo del cuerpo `.json()` en telemetría de códigos QR y endpoints de consulta y estado del tutor IAndreas ([IAndreasChatContainer.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Tutor/IAndreasChatContainer.tsx), [IAndreasFloatingWidget.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Tutor/IAndreasFloatingWidget.tsx), [Index.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Pages/Qr/Index.tsx)).
  * **Desacoplamiento de Megacomponentes y Reducción de Complejidad Ciclomática:**
    * **Módulo QR:** Desacoplado [QrExportModal.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Qr/QrExportModal.tsx) en `QrExportModalHeader`, `QrExportPreviewPanel`, `QrExportFormatSelectors` y `QrExportModalContent`. Extraídos [QrIndexHeader.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Qr/QrIndexHeader.tsx) y [QrModalsContainer.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Qr/QrModalsContainer.tsx) desde [Index.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Pages/Qr/Index.tsx).
    * **Simuladores H5P:** Desacoplados [DragTextLivePreview.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/H5p/LivePreviews/DragTextLivePreview.tsx), [DragQuestionLivePreview.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/H5p/LivePreviews/DragQuestionLivePreview.tsx) y [QuestionSetLivePreview.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/H5p/LivePreviews/QuestionSetLivePreview.tsx) en subcomponentes atómicos de cabecera, lienzo/preguntas, banco de tarjetas y barra de puntuación.
    * **Editores H5P:** Extraído el panel [DropZonesList.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/H5p/Editors/DragQuestion/DropZonesList.tsx) de [DragQuestionEditor.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/H5p/Editors/DragQuestion/DragQuestionEditor.tsx).
    * **Tutor IAndreas:** Desacoplado [IAndreasMessageBubble.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Tutor/IAndreasMessageBubble.tsx) en `UserBubble` y `AssistantBubble`.
    * **Navegación:** Desacoplado [AppNavList.tsx](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/Layout/AppNavList.tsx) en `NavItem`, `GeneralNavSection` y `ManagementNavSection`.
  * **Conformidad Estricta con Fast Refresh (`react-doctor/only-export-components`):**
    * Extracción de funciones utilitarias puras a archivos `.ts` independientes ([Blanks utils.ts](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/H5p/Editors/Blanks/utils.ts) y [DragText utils.ts](file:///home/antsanch/webapps/LibroAumentado/resources/js/Components/H5p/Editors/DragText/utils.ts)).
  * **Verificación y Calificación Final:**
    * **React Doctor:** **100 / 100 Great (0 issues)** en los 137 archivos del proyecto.
    * **Vitest:** 26/26 suites aprobadas al 100% (129 tests unitarios).
    * **Vite:** Compilación de producción (`npm run build`) limpia en 3.9s.
* **Componentes afectados:** `resources/js/Components/H5p/**/*`, `resources/js/Components/Qr/**/*`, `resources/js/Components/Tutor/**/*`, `resources/js/Components/Layout/AppNavList.tsx`, `resources/js/Pages/Qr/Index.tsx`, `resources/js/Pages/H5p/Editor.tsx`, `tests/Unit/BlanksEditor.test.tsx`, `tests/Unit/DragTextEditor.test.tsx`, `docs/changes.md`.

