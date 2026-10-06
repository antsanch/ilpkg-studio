# Estrategia de Versionado, Integridad Referencial y Ciclo de Vida (.ilpkg)
**Ecosistema:** Libro Aumentado de Anatomía Biomédica (LAAB)  
**Objetivo:** Garantizar la inmutabilidad de calificaciones, trazabilidad de intentos históricos y resolución ante paquetes eliminados o actualizados.

---

## 1. El Dilema del Desacoplamiento

Cuando un archivo `.ilpkg` contiene la lógica y las preguntas en su interior (`lesson.json`) y la base de datos de Laravel solo registra calificaciones y respuestas, surgen dos riesgos críticos:

1. **Riesgo por Actualización (Deriva de Contenido):** El docente actualiza el paquete a una nueva versión donde elimina la pregunta `chk_001` o cambia la respuesta correcta. Si un alumno cursó la lección hace seis meses, ¿cómo sabemos qué pregunta respondió y por qué obtuvo esa nota?
2. **Riesgo por Eliminación (Orfandad de Registro):** El docente borra una lección del sistema para sustituirla por otra. Si aplicamos un `cascadeOnDelete()`, borramos el expediente académico del alumno; si dejamos una clave foránea huérfana, la aplicación arrojará errores de puntero nulo al intentar renderizar el historial.

Para solucionar ambos problemas, implementamos el patrón **Inmutabilidad de Versión (*Release Snapshotting*)** y **Borrado Lógico con Lápida (*Tombstoning*)**.

---

## 2. Principios de Arquitectura

### A. La Lección Lógica vs. El Release Inmutable
* **Lección Lógica (`interactive_lessons`):** Representa el concepto curricular (ejemplo: *"Fosa Pterigopalatina"*). Su ID nunca cambia y agrupa todas las versiones a lo largo del tiempo.
* **Versión de Paquete (`lesson_package_releases`):** Representa un archivo `.ilpkg` físico concreto con un `checksum` SHA-256 único. **Una vez que un alumno completa un intento sobre una versión, esa versión se vuelve estrictamente inmutable**.

### B. Resguardo de Descriptores (Snapshot en BD)
Aunque los binarios pesados (el modelo GLB de 20 MB y el audio WebM de 15 MB) residen en el sistema de archivos o S3, los descriptores ligeros (`manifest.json` y `lesson.json`, que pesan apenas ~15 KB) se almacenan comprimidos como un campo JSON en la tabla `lesson_package_releases`. Si el archivo físico se purga del disco, la evidencia textual de las preguntas y respuestas permanece intacta para siempre.

---

## 3. Modelo de Datos Relacional (Laravel)

```text
interactive_lessons (Entidad conceptual)
 │
 ├── lesson_package_releases (Versiones: v1.0.0, v1.1.0, v2.0.0)
 │    │── manifest_snapshot (JSON)
 │    │── lesson_snapshot (JSON)
 │    └── status: 'active' | 'deprecated' | 'archived'
 │
 └── lesson_attempts (Intentos de alumnos)
      │── Relación directa con `lesson_package_release_id`
      └── attempt_responses (Respuestas vinculadas al snapshot)
```

### Migración de Versiones e Intentos

```php
// database/migrations/2026_10_03_000004_create_package_lifecycle_tables.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // Lección conceptual / Módulo dentro del Libro
        Schema::create('interactive_lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->nullable()->constrained()->nullOnDelete();
            $table->string('slug')->unique();
            $table->string('title');
            
            // Puntero a la versión actualmente visible para nuevos estudiantes
            $table->foreignId('current_release_id')->nullable();
            
            // Soft delete: Si el docente borra la lección, no destruye registros
            $table->softDeletes();
            $table->timestamps();
        });

        // Histórico de paquetes .ilpkg subidos
        Schema::create('lesson_package_releases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('interactive_lesson_id')->constrained()->cascadeOnDelete();
            $table->string('version');              // SemVer del manifest (ej: "1.0.0", "1.1.0")
            $table->string('checksum', 64);        // SHA-256 del archivo .ilpkg
            $table->string('package_path')->nullable(); // Ruta en disco/S3 (null si fue purgado)
            
            // Respaldos JSON para auditoría eterna
            $table->json('manifest_snapshot');
            $table->json('lesson_snapshot');
            
            // Ciclo de vida
            $table->enum('status', ['active', 'deprecated', 'archived'])->default('active');
            $table->text('change_summary')->nullable(); // Razón del cambio
            $table->timestamps();

            $table->unique(['interactive_lesson_id', 'version']);
        });

        // Intentos del alumno vinculados a la versión EXACTA evaluada
        Schema::create('lesson_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Claves foráneas protegidas contra eliminación en cascada
            $table->foreignId('interactive_lesson_id')->constrained()->restrictOnDelete();
            $table->foreignId('lesson_package_release_id')->constrained()->restrictOnDelete();
            
            $table->unsignedSmallInteger('attempt_number')->default(1);
            $table->boolean('is_first_attempt')->default(true);
            $table->unsignedInteger('score_obtained');
            $table->unsignedInteger('max_score');
            $table->decimal('percentage', 5, 2);
            $table->boolean('passed');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // Respuestas individuales de la sesión
        Schema::create('attempt_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_attempt_id')->constrained()->cascadeOnDelete();
            $table->string('checkpoint_id');      // ID textual del checkpoint (ej. "chk_001")
            
            // Snapshot del enunciado y la respuesta en ese instante
            $table->text('prompt_snapshot');
            $table->string('selected_option_id')->nullable();
            $table->text('selected_option_text')->nullable();
            
            $table->boolean('is_correct');
            $table->unsignedInteger('points_awarded');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('attempt_responses');
        Schema::dropIfExists('lesson_attempts');
        Schema::dropIfExists('lesson_package_releases');
        Schema::dropIfExists('interactive_lessons');
    }
};
```

---

## 4. Gestión de los Casos de Uso Críticos

### Escenario 1: El Docente Publica una Actualización (v1.0.0 ➔ v1.1.0)

1. El autor modifica una pregunta o ajusta una animación de cámara en el ILPKG Studio y genera una nueva versión.
2. Al subirla al backend de Laravel:
   * Se crea un nuevo registro en `lesson_package_releases` con `version = "1.1.0"`.
   * El release anterior (`v1.0.0`) pasa automáticamente a `status = 'deprecated'`.
   * `interactive_lessons.current_release_id` se actualiza al nuevo ID.
3. **Efecto en Alumnos Antiguos:** Al entrar a su historial, ven:  
   *"Completado el 12/Mar/2026 — Evaluado bajo v1.0.0 (Calificación: 92/100)"*. Sus respuestas consultan `lesson_snapshot` de la `v1.0.0`.
4. **Efecto en Alumnos Nuevos:** El reproductor carga la `v1.1.0`.

---

### Escenario 2: El Paquete o Lección es Eliminado por el Autor

En entornos educativos, un recurso evaluado **nunca debe eliminarse físicamente de la base de datos** (`Hard Delete`). Se aplica una estrategia de tres capas:

```text
[ Docente pulsa "Eliminar Lección" ]
                  │
                  ▼
   ¿Tiene intentos de alumnos asociados?
     ├── NO ──► Borrado físico completo de BD y archivos en Storage.
     └── SÍ ──► Activación de Lápida (Tombstone):
                 1. `interactive_lessons.deleted_at = now()` (Soft Delete).
                 2. El paquete desaparece del catálogo general y búsquedas.
                 3. Los binarios pesados (GLB, audio) se pueden mover a almacenamiento frío.
                 4. Los registros de `lesson_attempts` quedan 100% legibles.
```

#### Visualización en el Perfil del Alumno:
Si el alumno entra a su boleta de calificaciones o portafolio, el sistema muestra:
> **Fosa Pterigopalatina y Ramas del Nervio Maxilar**  
> *Estado:* [Cápsula Retirada del Plan de Estudios]  
> *Fecha de Evaluación:* 14 de Mayo, 2026 | *Nota:* 95/100 (Aprobado)  
> *Detalle:* [Ver Examen y Respuestas Históricas] *(Renderizado solo texto a partir del snapshot JSON, sin requerir el visor 3D)*.

---

### Escenario 3: Política de Ciclo de Vida de Almacenamiento (Gestión de Disco)

Los modelos anatómicos 3D y las grabaciones de voz consumen espacio. Cuando una versión queda obsoleta, se aplica una política de purga por niveles:

1. **Nivel Caliente (Hot Storage - Activo):**  
   Binarios GLB y audio disponibles en el CDN/Storage para streaming inmediato.
2. **Nivel Templado (Warm Storage - Obsoleta reciente):**  
   Si una versión tiene menos de 1 año de haber sido sustituida, los binarios siguen disponibles por si el alumno desea reabrir la lección en 3D interactivo.
3. **Nivel Frío / Archivo (Cold Archive - Obsoleta > 1 año o lección borrada):**  
   * Se eliminan del disco los archivos `narration.webm` y `anatomy.glb`.
   * `lesson_package_releases.package_path` se marca como `NULL`.
   * **Se preservan permanentemente** los campos `manifest_snapshot` y `lesson_snapshot` (que ocupan solo ~15 KB).
   * Si un auditor académico o el estudiante consulta la evidencia, la interfaz despliega el examen en modo formulario estático de solo lectura.

---

## 5. Servicio de Auditoría Histórica en Laravel

Controlador que permite a un alumno o profesor consultar un intento antiguo, incluso si el paquete original ya no existe en el disco:

```php
// app/Services/LessonAttemptAuditService.php
namespace App\Services;

use App\Models\LessonAttempt;

class LessonAttemptAuditService
{
    public function getAttemptAudit(int $attemptId): array
    {
        $attempt = LessonAttempt::with(['release', 'responses'])->findOrFail($attemptId);
        $release = $attempt->release;

        // Leer el snapshot guardado en la base de datos
        $lessonSnapshot = $release->lesson_snapshot;
        $checkpoints = collect($lessonSnapshot['timeline']['checkpoints'] ?? []);

        // Cruzar las respuestas del alumno con el cuestionario histórico
        $auditTrail = $attempt->responses->map(function ($response) use ($checkpoints) {
            $originalCheckpoint = $checkpoints->firstWhere('id', $response->checkpoint_id);

            return [
                'checkpoint_id'   => $response->checkpoint_id,
                'prompt'          => $response->prompt_snapshot ?: ($originalCheckpoint['prompt'] ?? 'Pregunta histórica'),
                'selected_answer' => $response->selected_option_text,
                'is_correct'      => $response->is_correct,
                'points_awarded'  => $response->points_awarded,
            ];
        });

        return [
            'lesson_title'    => $release->manifest_snapshot['metadata']['title'] ?? 'Lección Anatómica',
            'version_applied' => $release->version,
            'is_deprecated'   => $release->status !== 'active',
            'has_3d_assets'   => !empty($release->package_path),
            'final_score'     => $attempt->score_obtained,
            'passed'          => $attempt->passed,
            'completed_at'    => $attempt->completed_at,
            'audit_trail'     => $auditTrail,
        ];
    }
}
```

---

## 6. Resumen de Garantías del Sistema

| Evento | Impacto en el Alumno | Impacto en la Base de Datos | Consumo de Disco |
| :--- | :--- | :--- | :--- |
| **Actualizar paquete** | Puede ver la nueva versión o consultar su nota en la anterior. | Se crea nuevo release; se actualiza `current_release_id`. | Se añade el peso del nuevo paquete. |
| **Eliminar lección** | Mantiene su nota en el kárdex con etiqueta *"Retirada"*. | `Soft Delete` en lección; las claves foráneas no se rompen. | Se pueden purgar los archivos pesados tras el período de gracia. |
| **Auditoría de examen** | Puede ver exactamente qué contestó y qué decía la pregunta. | Se reconstruye desde `attempt_responses` y `lesson_snapshot`. | Negligible (solo texto JSON). |