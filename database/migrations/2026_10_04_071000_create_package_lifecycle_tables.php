<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Entidad conceptual curricular (Lección Lógica)
        Schema::create('interactive_lessons', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('chapter_id')->nullable();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->ulid('current_release_id')->nullable();
            
            // Soft delete para Tombstoning
            $table->softDeletes();
            $table->timestamps();
        });

        // 2. Histórico inmutable de versiones de paquetes (.ilpkg)
        Schema::create('lesson_package_releases', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('interactive_lesson_id')->constrained()->cascadeOnDelete();
            $table->string('version'); // SemVer (ej: 1.0.0)
            $table->string('checksum', 64); // SHA-256 del archivo
            $table->string('package_path')->nullable(); // null si los binarios pesados fueron purgados
            
            // Respaldos JSON para auditoría histórica eterna
            $table->json('manifest_snapshot');
            $table->json('lesson_snapshot');
            
            // Ciclo de vida
            $table->enum('status', ['active', 'deprecated', 'archived'])->default('active');
            $table->text('change_summary')->nullable();
            $table->timestamps();

            $table->unique(['interactive_lesson_id', 'version']);
        });

        // 3. Intentos de alumnos vinculados a la versión exacta evaluada
        Schema::create('lesson_attempts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            
            // Restringir borrado en cascada para proteger evidencia académica
            $table->foreignUlid('interactive_lesson_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('lesson_package_release_id')->constrained()->restrictOnDelete();
            
            $table->unsignedSmallInteger('attempt_number')->default(1);
            $table->boolean('is_first_attempt')->default(true);
            $table->unsignedInteger('score_obtained')->default(0);
            $table->unsignedInteger('max_score')->default(100);
            $table->decimal('percentage', 5, 2)->default(0.00);
            $table->boolean('passed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // 4. Respuestas individuales a los checkpoints
        Schema::create('attempt_responses', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('lesson_attempt_id')->constrained()->cascadeOnDelete();
            $table->string('checkpoint_id'); // ID textual del checkpoint (ej: chk_001)
            
            $table->text('prompt_snapshot');
            $table->string('selected_option_id')->nullable();
            $table->text('selected_option_text')->nullable();
            
            $table->boolean('is_correct')->default(false);
            $table->unsignedInteger('points_awarded')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attempt_responses');
        Schema::dropIfExists('lesson_attempts');
        Schema::dropIfExists('lesson_package_releases');
        Schema::dropIfExists('interactive_lessons');
    }
};
