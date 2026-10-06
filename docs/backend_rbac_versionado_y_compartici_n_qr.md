# Especificación y Arquitectura Backend: RBAC, Versionado con Undo y Compartición QR
**Ecosistema:** Libro Aumentado de Anatomía Biomédica (LAAB)  
**Módulos:** Control de Acceso Granular, Historial de Cambios / Undo, Enlace Seguro por QR  
**Stack:** Laravel 11/12, PHP 8.3+, `spatie/laravel-permission`, Simple QrCode, Inertia.js

---

## 1. Filosofía de Permisos Atómicos y Roles como Contenedores

Siguiendo las mejores prácticas de seguridad, el sistema desacopla los privilegios de los títulos de usuario. **Las directivas del sistema (`can:`) verifican exclusivamente permisos atómicos** (`lessons.edit`, `clinical_cases.review`), nunca roles. Los roles actúan únicamente como plantillas preconfiguradas que agrupan permisos para facilitar la asignación institucional.

### Matriz de Permisos y Perfiles Base

| Permiso Atómico | Creador | Editor | Revisor Clínico | Alumno / Miembro |
| :--- | :---: | :---: | :---: | :---: |
| `lessons.create` | ✅ | ❌ | ❌ | ❌ |
| `lessons.edit.content` | ✅ | ✅ | ❌ | ❌ |
| `lessons.edit.timeline` | ✅ | ✅ | ❌ | ❌ |
| `lessons.review.submit` | ✅ | ✅ | ❌ | ❌ |
| `lessons.review.evaluate` | ❌ | ❌ | ✅ | ❌ |
| `lessons.publish` | ❌ | ❌ | ✅ | ❌ |
| `lessons.versions.rollback` | ✅ | ✅ | ❌ | ❌ |
| `lessons.share.qr` | ✅ | ✅ | ✅ | ❌ |
| `lessons.attempt.view` | ✅ | ❌ | ✅ | ✅ (Solo propio) |
| `lessons.attempt.submit` | ❌ | ❌ | ❌ | ✅ |
| `clinical_cases.manage` | ✅ | ✅ | ✅ | ❌ |

---

## 2. Definición del Seeder de Permisos y Roles (`spatie/laravel-permission`)

```php
// database/seeders/RolesAndPermissionsSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiar caché de spatie
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Declarar Permisos Atómicos
        $permissions = [
            // Lecciones y Paquetes .ilpkg
            'lessons.view',
            'lessons.create',
            'lessons.edit.content',
            'lessons.edit.timeline',
            'lessons.delete',
            'lessons.publish',
            'lessons.review.submit',
            'lessons.review.evaluate',
            'lessons.versions.view',
            'lessons.versions.rollback',
            'lessons.share.qr',
            
            // Pacientes y Casos Clínicos Anatómicos
            'clinical_cases.view',
            'clinical_cases.create',
            'clinical_cases.edit',
            'clinical_cases.delete',
            
            // Evaluación del Alumno
            'lessons.attempt.submit',
            'lessons.attempt.view_own',
            'lessons.attempt.view_all',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // 2. Crear Roles como Contenedores
        
        // Alumno / Miembro
        $studentRole = Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);
        $studentRole->syncPermissions([
            'lessons.view',
            'clinical_cases.view',
            'lessons.attempt.submit',
            'lessons.attempt.view_own',
        ]);

        // Revisor Clínico / Par Académico
        $reviewerRole = Role::firstOrCreate(['name' => 'reviewer', 'guard_name' => 'web']);
        $reviewerRole->syncPermissions([
            'lessons.view',
            'lessons.review.evaluate',
            'lessons.publish',
            'lessons.versions.view',
            'lessons.share.qr',
            'clinical_cases.view',
            'lessons.attempt.view_all',
        ]);

        // Editor Multimedia
        $editorRole = Role::firstOrCreate(['name' => 'editor', 'guard_name' => 'web']);
        $editorRole->syncPermissions([
            'lessons.view',
            'lessons.edit.content',
            'lessons.edit.timeline',
            'lessons.review.submit',
            'lessons.versions.view',
            'lessons.versions.rollback',
            'lessons.share.qr',
            'clinical_cases.view',
            'clinical_cases.edit',
        ]);

        // Creador / Autor Clínico
        $creatorRole = Role::firstOrCreate(['name' => 'creator', 'guard_name' => 'web']);
        $creatorRole->syncPermissions([
            'lessons.view',
            'lessons.create',
            'lessons.edit.content',
            'lessons.edit.timeline',
            'lessons.delete',
            'lessons.review.submit',
            'lessons.versions.view',
            'lessons.versions.rollback',
            'lessons.share.qr',
            'clinical_cases.view',
            'clinical_cases.create',
            'clinical_cases.edit',
            'clinical_cases.delete',
            'lessons.attempt.view_all',
        ]);
    }
}
```

---

## 3. Motor de Historial de Versiones y Deshacer (`Undo / Rollback Engine`)

Para casos clínicos anatómicos o lecciones interactivas, cada cambio significativo genera una entrada histórica que respalda el estado previo. Esto permite realizar **Undo (Deshacer)** o restaurar cualquier estado anterior con trazabilidad de autoría.

### Migración de Historial de Estados

```php
// database/migrations/2026_10_03_000010_create_version_histories_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('entity_version_histories', function (Blueprint $table) {
            $table->id();
            // Soporta tanto lecciones como casos de pacientes mediante polimorfismo
            $table->morphs('versionable'); 
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            
            $table->string('action'); // 'create', 'update_timeline', 'update_manifest', 'rollback'
            $table->string('summary')->nullable(); // Ej: "Ajuste de opacidad en nervio maxilar"
            
            // Instantánea serializada del estado completo
            $table->json('state_snapshot');
            
            // Diferencial de campos alterados (opcional para visualización rápida)
            $table->json('diff_payload')->nullable();
            
            // Puntero de navegación temporal
            $table->unsignedInteger('version_number');
            $table->timestamps();

            $table->index(['versionable_type', 'versionable_id', 'version_number']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('entity_version_histories');
    }
};
```

### Servicio de Versionado y Rollback (`VersionHistoryService.php`)

```php
// app/Services/VersionHistoryService.php
namespace App\Services;

use App\Models\EntityVersionHistory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class VersionHistoryService
{
    /**
     * Graba una versión inmutable del modelo antes o después de una modificación
     */
    public function snapshot(Model $model, string $action, ?string $summary = null, array $diff = []): EntityVersionHistory
    {
        $lastVersion = EntityVersionHistory::where('versionable_type', get_class($model))
            ->where('versionable_id', $model->getKey())
            ->max('version_number') ?? 0;

        return EntityVersionHistory::create([
            'versionable_type' => get_class($model),
            'versionable_id'   => $model->getKey(),
            'user_id'          => auth()->id(),
            'action'           => $action,
            'summary'          => $summary,
            'state_snapshot'   => $model->toArray(),
            'diff_payload'     => $diff,
            'version_number'   => $lastVersion + 1,
        ]);
    }

    /**
     * Realiza un Undo / Rollback a una versión específica
     */
    public function rollbackTo(Model $model, int $targetVersionNumber): Model
    {
        $targetHistory = EntityVersionHistory::where('versionable_type', get_class($model))
            ->where('versionable_id', $model->getKey())
            ->where('version_number', $targetVersionNumber)
            ->firstOrFail();

        return DB::transaction(function () use ($model, $targetHistory) {
            // Respaldar el estado actual antes de pisarlo
            $this->snapshot(
                $model,
                'rollback_backup',
                "Respaldo automático previo a restaurar v{$targetHistory->version_number}"
            );

            // Rehidratar los datos
            $dataToRestore = $targetHistory->state_snapshot;
            
            // Excluir claves protegidas
            unset($dataToRestore['id'], $dataToRestore['created_at'], $dataToRestore['updated_at']);

            $model->fill($dataToRestore);
            $model->save();

            // Grabar el evento de rollback en el historial
            $this->snapshot(
                $model,
                'rollback',
                "Revertido con éxito a la versión v{$targetHistory->version_number}"
            );

            return $model;
        });
    }
}
```

---

## 4. Módulo de Compartición Mediante Códigos QR Dinámicos

Permite generar códigos QR firmados con token criptográfico para:
1. Acceso directo de alumnos a lecciones específicas en aulas o anfiteatros.
2. Invitación temporal a pares revisores para auditoría previa a la publicación.
3. Despliegue en fichas impresas de laboratorio anatómico con caducidad opcional.

### Migración de Tokens de Compartición

```php
// database/migrations/2026_10_03_000011_create_qr_share_tokens_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('qr_share_tokens', function (Blueprint $table) {
            $table->id();
            $table->uuid('token')->unique();
            $table->morphs('shareable'); // Lección o Caso Clínico
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            
            $table->enum('scope', ['student_launch', 'peer_review', 'public_read']);
            $table->unsignedInteger('max_uses')->nullable(); // null = ilimitado
            $table->unsignedInteger('uses_count')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('qr_share_tokens');
    }
};
```

### Servicio Generador de Códigos QR (`QrSharingService.php`)

```php
// app/Services/QrSharingService.php
namespace App\Services;

use App\Models\QrShareToken;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrSharingService
{
    /**
     * Genera un token y devuelve el render SVG del Código QR
     */
    public function generateShareQr(
        Model $model,
        string $scope = 'student_launch',
        ?int $maxUses = null,
        ?\DateTimeInterface $expiresAt = null
    ): array {
        $token = QrShareToken::create([
            'token'      => Str::uuid()->toString(),
            'shareable'  => $model,
            'created_by' => auth()->id(),
            'scope'      => $scope,
            'max_uses'   => $maxUses,
            'expires_at' => $expiresAt,
        ]);

        $signedUrl = route('qr.resolve', ['token' => $token->token]);

        // Generar QR en formato SVG de alta definición con márgenes clínicos
        $qrSvg = QrCode::format('svg')
            ->size(320)
            ->errorCorrection('H')
            ->margin(2)
            ->color(18, 52, 86) // Azul médico LAAB
            ->backgroundColor(255, 255, 255)
            ->generate($signedUrl);

        return [
            'token'      => $token->token,
            'url'        => $signedUrl,
            'svg'        => (string) $qrSvg,
            'expires_at' => $expiresAt?->format('c'),
        ];
    }

    /**
     * Valida y resuelve el token QR
     */
    public function resolveToken(string $tokenString): QrShareToken
    {
        $token = QrShareToken::where('token', $tokenString)->firstOrFail();

        if ($token->expires_at && $token->expires_at->isPast()) {
            abort(410, 'El código QR ha expirado.');
        }

        if ($token->max_uses !== null && $token->uses_count >= $token->max_uses) {
            abort(403, 'Este código QR ha alcanzado su límite máximo de usos.');
        }

        $token->increment('uses_count');

        return $token;
    }
}
```

---

## 5. Controlador de Gestión de Versiones, Undo y QR

```php
// app/Http/Controllers/LessonVersioningAndShareController.php
namespace App\Http\Controllers;

use App\Models\InteractiveLesson;
use App\Services\VersionHistoryService;
use App\Services\QrSharingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LessonVersioningAndShareController extends Controller
{
    // Listar historial de cambios para el panel de Undo
    public function getHistory(InteractiveLesson $lesson)
    {
        $this->authorize('lessons.versions.view');

        $history = $lesson->versionHistories()
            ->with('user:id,name,email')
            ->orderByDesc('version_number')
            ->get();

        return response()->json($history);
    }

    // Ejecutar Rollback / Undo
    public function rollback(
        Request $request,
        InteractiveLesson $lesson,
        VersionHistoryService $historyService
    ) {
        $this->authorize('lessons.versions.rollback');

        $request->validate([
            'target_version' => ['required', 'integer', 'min:1'],
        ]);

        $restored = $historyService->rollbackTo($lesson, $request->input('target_version'));

        return back()->with('success', "Lección restaurada exitosamente al estado v{$request->target_version}.");
    }

    // Generar nuevo QR para la lección o caso
    public function createQr(
        Request $request,
        InteractiveLesson $lesson,
        QrSharingService $qrService
    ) {
        $this->authorize('lessons.share.qr');

        $request->validate([
            'scope'      => ['required', 'in:student_launch,peer_review,public_read'],
            'max_uses'   => ['nullable', 'integer', 'min:1'],
            'expires_in' => ['nullable', 'integer'], // Horas de vigencia
        ]);

        $expiresAt = $request->filled('expires_in')
            ? now()->addHours($request->input('expires_in'))
            : null;

        $qrData = $qrService->generateShareQr(
            $lesson,
            $request->input('scope'),
            $request->input('max_uses'),
            $expiresAt
        );

        return response()->json($qrData);
    }

    // Punto de entrada al escanear el QR desde móvil o tablet
    public function resolveQr(string $token, QrSharingService $qrService)
    {
        $shareToken = $qrService->resolveToken($token);
        $entity = $shareToken->shareable;

        if ($shareToken->scope === 'peer_review') {
            return redirect()->route('interactive-lessons.review', $entity->id);
        }

        // Acceso directo a reproductor de alumno
        return redirect()->route('interactive-lessons.player', $entity->id);
    }
}
```

---

## 6. Integración en Rutas (`routes/web.php`)

```php
use App\Http\Controllers\LessonVersioningAndShareController;

Route::middleware(['auth'])->group(function () {
    // Historial y Rollback
    Route::get('/lessons/{lesson}/history', [LessonVersioningAndShareController::class, 'getHistory'])
        ->middleware('can:lessons.versions.view');

    Route::post('/lessons/{lesson}/rollback', [LessonVersioningAndShareController::class, 'rollback'])
        ->middleware('can:lessons.versions.rollback');

    // Generación de QR
    Route::post('/lessons/{lesson}/qr', [LessonVersioningAndShareController::class, 'createQr'])
        ->middleware('can:lessons.share.qr');
});

// Ruta pública de resolución al escanear el QR (con control de token)
Route::get('/qr/resolve/{token}', [LessonVersioningAndShareController::class, 'resolveQr'])
    ->name('qr.resolve');
```