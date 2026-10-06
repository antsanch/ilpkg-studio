<?php

namespace App\Http\Controllers;

use App\Models\InteractiveLesson;
use App\Models\LessonAttempt;
use App\Models\User;
use App\Services\LessonAttemptAuditService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class StudioController extends Controller
{
    /**
     * Cargar la interfaz de autoría ILPKG Studio
     */
    public function studio(Request $request, ?InteractiveLesson $lesson = null): Response
    {
        $currentUser = $request->user();

        // En entorno local o si no hay sesión activa, resolver o autenticar un usuario creador por defecto
        if (!$currentUser) {
            $roleParam = $request->query('as', 'creator');
            $currentUser = User::where('email', "{$roleParam}@ilpkg.studio")->first()
                ?? User::where('email', 'creator@ilpkg.studio')->first();

            if (!$currentUser && $roleParam === 'creator') {
                $currentUser = User::firstOrCreate(
                    ['email' => 'creator@ilpkg.studio'],
                    [
                        'name' => 'Dr. Autor Clínico',
                        'password' => bcrypt('password'),
                    ]
                );
                $allPerms = Permission::all();
                if ($allPerms->isNotEmpty()) {
                    $currentUser->syncPermissions($allPerms);
                }
            }

            if ($currentUser) {
                auth()->login($currentUser);
                $request->setUserResolver(fn () => $currentUser);
            }
        }

        abort_unless($currentUser?->can('lessons.edit.timeline') || $currentUser?->can('lessons.create'), 403);

        $lessonData = null;
        if ($lesson && $lesson->exists) {
            $lesson->load(['currentRelease', 'releases']);
            $lessonData = [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'slug' => $lesson->slug,
                'description' => $lesson->description,
                'current_release' => $lesson->currentRelease,
            ];
        } else {
            $defaultLesson = InteractiveLesson::with(['currentRelease'])->first();
            if ($defaultLesson) {
                $lessonData = [
                    'id' => $defaultLesson->id,
                    'title' => $defaultLesson->title,
                    'slug' => $defaultLesson->slug,
                    'description' => $defaultLesson->description,
                    'current_release' => $defaultLesson->currentRelease,
                ];
            }
        }

        return Inertia::render('Studio/ILPKGStudio', [
            'initialLesson' => $lessonData,
            'userPermissions' => $currentUser?->getAllPermissions()->pluck('name'),
        ]);
    }

    /**
     * Cargar el reproductor interactivo del alumno
     */
    public function player(Request $request, InteractiveLesson $lesson): Response
    {
        $currentUser = $request->user();

        // En entorno local o si no hay sesión activa, resolver o autenticar un usuario estudiante por defecto
        if (!$currentUser) {
            $roleParam = $request->query('as', 'student');
            $currentUser = User::where('email', "{$roleParam}@ilpkg.studio")->first()
                ?? User::where('email', 'student@ilpkg.studio')->first()
                ?? User::first();

            if ($currentUser) {
                auth()->login($currentUser);
                $request->setUserResolver(fn () => $currentUser);
            }
        }

        abort_unless($currentUser?->can('lessons.view'), 403);

        $lesson->load(['currentRelease']);
        $release = $lesson->currentRelease;

        abort_unless($release, 404, 'Esta lección aún no cuenta con una versión publicada.');

        // Obtener último intento del usuario si existe
        $attempt = LessonAttempt::where('user_id', $request->user()?->id)
            ->where('lesson_package_release_id', $release->id)
            ->latest()
            ->first();

        return Inertia::render('Player/InteractiveLessonPlayer', [
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'slug' => $lesson->slug,
                'isDeleted' => $lesson->trashed(),
            ],
            'release' => [
                'id' => $release->id,
                'version' => $release->version,
                'status' => $release->status,
                'has3dAssets' => !empty($release->package_path),
                'packagePath' => $release->package_path,
                'manifest' => $release->manifest_snapshot,
                'lessonData' => $release->lesson_snapshot,
            ],
            'attempt' => $attempt,
        ]);
    }

    /**
     * Ficha de evidencia y auditoría académica (Modo 3)
     */
    public function audit(
        Request $request,
        string $attemptId,
        LessonAttemptAuditService $auditService
    ): Response {
        $attempt = LessonAttempt::findOrFail($attemptId);

        $isOwn = $attempt->user_id === $request->user()?->id;
        $canViewOwn = $isOwn && $request->user()?->can('lessons.attempt.view_own');
        $canViewAll = $request->user()?->can('lessons.attempt.view_all');

        abort_unless($canViewOwn || $canViewAll, 403, 'No autorizado para consultar este expediente.');

        $auditData = $auditService->getAttemptAudit($attemptId);

        return Inertia::render('Player/StaticAuditView', [
            'audit' => $auditData,
        ]);
    }
}
