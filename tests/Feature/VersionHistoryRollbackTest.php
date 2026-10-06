<?php

namespace Tests\Feature;

use App\Models\InteractiveLesson;
use App\Models\User;
use App\Services\VersionHistoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VersionHistoryRollbackTest extends TestCase
{
    use RefreshDatabase;

    public function test_snapshot_creates_incremental_version_history(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $lesson = InteractiveLesson::create([
            'title' => 'Versión Inicial',
            'slug' => 'version-inicial',
            'description' => 'Descripción V1',
        ]);

        $service = new VersionHistoryService();
        $h1 = $service->snapshot($lesson, 'create', 'Creación inicial');

        $this->assertEquals(1, $h1->version_number);
        $this->assertEquals('Versión Inicial', $h1->state_snapshot['title']);

        // Modificar lección
        $lesson->update(['title' => 'Versión Modificada']);
        $h2 = $service->snapshot($lesson, 'update', 'Modificación de título');

        $this->assertEquals(2, $h2->version_number);
        $this->assertEquals('Versión Modificada', $h2->state_snapshot['title']);
    }

    public function test_rollback_restores_previous_state(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $lesson = InteractiveLesson::create([
            'title' => 'Estado Original',
            'slug' => 'estado-original',
            'description' => 'Original',
        ]);

        $service = new VersionHistoryService();
        $service->snapshot($lesson, 'create', 'V1');

        // Alterar estado
        $lesson->update(['title' => 'Estado Roto o No Deseado']);
        $service->snapshot($lesson, 'update', 'V2 Rota');

        // Ejecutar Rollback a V1
        $restored = $service->rollbackTo($lesson, 1);

        $this->assertEquals('Estado Original', $restored->title);
        $this->assertEquals('Estado Original', $lesson->fresh()->title);
    }
}
