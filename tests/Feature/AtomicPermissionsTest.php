<?php

namespace Tests\Feature;

use App\Models\InteractiveLesson;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class AtomicPermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_user_without_permission_cannot_create_lesson(): void
    {
        $user = User::factory()->create(); // Usuario sin permisos

        $response = $this->actingAs($user)->postJson(route('api.lessons.store'), [
            'title' => 'Arteria Facial',
            'slug' => 'arteria-facial',
        ]);

        $response->assertStatus(403);
    }

    public function test_user_with_atomic_permission_can_create_lesson(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('lessons.create'); // Asignación estrictamente atómica

        $response = $this->actingAs($user)->postJson(route('api.lessons.store'), [
            'title' => 'Arteria Facial',
            'slug' => 'arteria-facial',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('interactive_lessons', ['slug' => 'arteria-facial']);
    }

    public function test_user_without_delete_permission_is_blocked(): void
    {
        $lesson = InteractiveLesson::create([
            'title' => 'Nervio Lingual',
            'slug' => 'nervio-lingual',
        ]);

        $user = User::factory()->create();
        $user->givePermissionTo('lessons.view'); // Solo puede ver, no eliminar

        $response = $this->actingAs($user)->deleteJson(route('api.lessons.destroy', $lesson->id));

        $response->assertStatus(403);
        $this->assertNotSoftDeleted('interactive_lessons', ['id' => $lesson->id]);
    }
}
