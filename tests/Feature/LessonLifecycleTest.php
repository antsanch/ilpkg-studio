<?php

namespace Tests\Feature;

use App\Models\InteractiveLesson;
use App\Models\LessonPackageRelease;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class LessonLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_lesson_uses_ulid_primary_key(): void
    {
        $lesson = InteractiveLesson::create([
            'title' => 'Neuroanatomía del Maxilar',
            'slug' => 'neuroanatomia-maxilar',
            'description' => 'Estudio anatómico 3D',
        ]);

        $this->assertNotNull($lesson->id);
        $this->assertTrue(Str::isUlid($lesson->id), "El ID '{$lesson->id}' debe ser un ULID válido.");
    }

    public function test_release_is_associated_with_lesson_via_ulid(): void
    {
        $lesson = InteractiveLesson::create([
            'title' => 'Fosa Pterigopalatina',
            'slug' => 'fosa-pterigopalatina',
        ]);

        $release = LessonPackageRelease::create([
            'interactive_lesson_id' => $lesson->id,
            'version' => '1.0.0',
            'checksum' => hash('sha256', 'mock_data'),
            'package_path' => 'packages/fosa.ilpkg',
            'manifest_snapshot' => ['metadata' => ['title' => 'Fosa Pterigopalatina']],
            'lesson_snapshot' => ['timeline' => ['duration' => 120.0]],
            'status' => 'active',
        ]);

        $this->assertTrue(Str::isUlid($release->id));
        $this->assertEquals($lesson->id, $release->lesson->id);
    }

    public function test_soft_delete_preserves_tombstone(): void
    {
        $lesson = InteractiveLesson::create([
            'title' => 'Lección Retirada',
            'slug' => 'leccion-retirada',
        ]);

        $lessonId = $lesson->id;
        $lesson->delete();

        $this->assertSoftDeleted('interactive_lessons', ['id' => $lessonId]);
        $this->assertNotNull(InteractiveLesson::withTrashed()->find($lessonId));
    }
}
