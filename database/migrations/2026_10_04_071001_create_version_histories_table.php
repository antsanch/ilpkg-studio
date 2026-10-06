<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('entity_version_histories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            
            // Polimórfico con ULID: versionable_type (string), versionable_id (string 26)
            $table->ulidMorphs('versionable');
            $table->foreignUlid('user_id')->nullable()->constrained()->nullOnDelete();
            
            $table->string('action'); // 'create', 'update_timeline', 'update_manifest', 'rollback', 'rollback_backup'
            $table->string('summary')->nullable(); // Ej: "Ajuste de opacidad en nervio maxilar"
            
            // Instantánea serializada del estado completo
            $table->json('state_snapshot');
            
            // Diferencial de campos alterados
            $table->json('diff_payload')->nullable();
            
            // Puntero de navegación temporal secuencial
            $table->unsignedInteger('version_number');
            $table->timestamps();

            $table->index(['versionable_type', 'versionable_id', 'version_number'], 'entity_version_histories_lookup_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entity_version_histories');
    }
};
