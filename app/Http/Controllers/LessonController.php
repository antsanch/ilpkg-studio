<?php

namespace App\Http\Controllers;

use App\Models\InteractiveLesson;
use App\Services\VersionHistoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('lessons.view'), 403, 'No autorizado para consultar lecciones.');

        $lessons = InteractiveLesson::with(['currentRelease'])
            ->latest()
            ->paginate(20);

        return response()->json($lessons);
    }

    public function store(Request $request, VersionHistoryService $historyService): JsonResponse
    {
        abort_unless($request->user()?->can('lessons.create'), 403, 'No autorizado para crear lecciones.');

        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'slug'        => ['required', 'string', 'alpha_dash', 'unique:interactive_lessons,slug'],
            'description' => ['nullable', 'string'],
            'chapter_id'  => ['nullable', 'string'],
        ]);

        $lesson = InteractiveLesson::create($validated);

        $historyService->snapshot(
            $lesson,
            'create',
            "Creación de la lección conceptual '{$lesson->title}'"
        );

        return response()->json($lesson, 201);
    }

    public function show(Request $request, InteractiveLesson $lesson): JsonResponse
    {
        abort_unless($request->user()?->can('lessons.view'), 403, 'No autorizado para consultar la lección.');

        $lesson->load(['releases', 'currentRelease']);

        return response()->json($lesson);
    }

    public function update(
        Request $request,
        InteractiveLesson $lesson,
        VersionHistoryService $historyService
    ): JsonResponse {
        $canEditContent = $request->user()?->can('lessons.edit.content');
        $canEditTimeline = $request->user()?->can('lessons.edit.timeline');
        
        abort_unless($canEditContent || $canEditTimeline, 403, 'No autorizado para editar esta lección.');

        $validated = $request->validate([
            'title'       => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'current_release_id' => ['nullable', 'string', 'exists:lesson_package_releases,id'],
        ]);

        $diff = array_diff_assoc($validated, $lesson->only(array_keys($validated)));
        $lesson->update($validated);

        if (!empty($diff)) {
            $historyService->snapshot(
                $lesson,
                'update_content',
                'Actualización de datos generales de la lección',
                $diff
            );
        }

        return response()->json($lesson);
    }

    public function destroy(
        Request $request,
        InteractiveLesson $lesson,
        VersionHistoryService $historyService
    ): JsonResponse {
        abort_unless($request->user()?->can('lessons.delete'), 403, 'No autorizado para eliminar lecciones.');

        $historyService->snapshot(
            $lesson,
            'delete',
            "Aplicación de lápida (Tombstone / Soft Delete) a '{$lesson->title}'"
        );

        $lesson->delete();

        return response()->json([
            'message' => 'Lección despublicada del catálogo activo (lápida preservada para auditoría).',
        ]);
    }
}
