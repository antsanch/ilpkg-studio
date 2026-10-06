<?php

namespace Database\Seeders;

use App\Models\InteractiveLesson;
use App\Models\LessonPackageRelease;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Sembrar roles y matriz de permisos atómicos
        $this->call(RolesAndPermissionsSeeder::class);

        // 2. Crear usuario Creador / Autor Clínico
        $creator = User::firstOrCreate(
            ['email' => 'creator@ilpkg.studio'],
            [
                'name' => 'Dr. Autor Clínico',
                'password' => Hash::make('password'),
            ]
        );
        $creatorRole = Role::where('name', 'creator')->first();
        if ($creatorRole) {
            $creator->syncPermissions($creatorRole->permissions);
        }

        // 3. Crear usuario Estudiante
        $student = User::firstOrCreate(
            ['email' => 'student@ilpkg.studio'],
            [
                'name' => 'Estudiante LAAB',
                'password' => Hash::make('password'),
            ]
        );
        $studentRole = Role::where('name', 'student')->first();
        if ($studentRole) {
            $student->syncPermissions($studentRole->permissions);
        }

        // 4. Crear usuario Revisor Clínico
        $reviewer = User::firstOrCreate(
            ['email' => 'reviewer@ilpkg.studio'],
            [
                'name' => 'Dra. Revisora Médica',
                'password' => Hash::make('password'),
            ]
        );
        $reviewerRole = Role::where('name', 'reviewer')->first();
        if ($reviewerRole) {
            $reviewer->syncPermissions($reviewerRole->permissions);
        }

        // 5. Sembrar lección de ejemplo ligada al demo.ilpkg
        $lesson = InteractiveLesson::firstOrCreate(
            ['slug' => 'neuroanatomia-maxilar'],
            [
                'title' => 'Neuroanatomía y Vascularización del Maxilar',
                'description' => 'Lección anatómico-quirúrgica interactiva con modelo 3D y evaluación formativa.',
            ]
        );

        $release = LessonPackageRelease::firstOrCreate(
            [
                'interactive_lesson_id' => $lesson->id,
                'version' => '1.0.0',
            ],
            [
                'package_path' => 'demo.ilpkg',
                'checksum' => hash('sha256', 'demo-ilpkg-package'),
                'manifest_snapshot' => [
                    'metadata' => [
                        'title' => 'Neuroanatomía y Vascularización del Maxilar',
                        'version' => '1.0.0',
                    ],
                ],
                'lesson_snapshot' => [
                    'timeline' => [
                        'duration' => 120.0,
                    ],
                ],
                'status' => 'active',
            ]
        );

        $lesson->update(['current_release_id' => $release->id]);
    }
}
