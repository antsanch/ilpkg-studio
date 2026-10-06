<?php

namespace App\Http\Controllers;

use App\Models\AttemptResponse;
use App\Models\InteractiveLesson;
use App\Models\LessonAttempt;
use App\Models\LessonPackageRelease;
use App\Rules\IlpkgManifestValidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LessonPackageReleaseController extends Controller
{
    /**
     * Publicar un nuevo release inmutable a partir de manifiesto y lesson data
     */
    public function publish(Request $request, InteractiveLesson $lesson): JsonResponse
    {
        abort_unless($request->user()?->can('lessons.publish'), 403, 'No autorizado para publicar versiones de paquetes.');

        $request->validate([
            'version'           => ['required', 'string'],
            'checksum'          => ['required', 'string', 'size:64'],
            'manifest'          => ['required', 'array'],
            'lesson'            => ['required', 'array'],
            'package_path'      => ['nullable', 'string'],
            'change_summary'    => ['nullable', 'string'],
        ]);

        // Validar integridad del esquema manifest
        IlpkgManifestValidator::validate($request->input('manifest'));

        $release = DB::transaction(function () use ($request, $lesson) {
            // 1. Marcar release anterior activo como obsoleto (deprecated)
            LessonPackageRelease::where('interactive_lesson_id', $lesson->id)
                ->where('status', 'active')
                ->update(['status' => 'deprecated']);

            // 2. Crear nuevo release inmutable
            $newRelease = LessonPackageRelease::create([
                'interactive_lesson_id' => $lesson->id,
                'version'               => $request->input('version'),
                'checksum'              => $request->input('checksum'),
                'package_path'          => $request->input('package_path'),
                'manifest_snapshot'     => $request->input('manifest'),
                'lesson_snapshot'       => $request->input('lesson'),
                'status'                => 'active',
                'change_summary'        => $request->input('change_summary', 'Nueva versión publicada'),
            ]);

            // 3. Apuntar la lección al nuevo release oficial
            $lesson->update(['current_release_id' => $newRelease->id]);

            return $newRelease;
        });

        return response()->json($release, 201);
    }

    /**
     * Responder a un checkpoint interactivo durante la lección
     */
    public function respondCheckpoint(Request $request, string $checkpointId): JsonResponse
    {
        abort_unless($request->user()?->can('lessons.attempt.submit'), 403, 'No autorizado para enviar evaluaciones.');

        $validated = $request->validate([
            'lesson_package_release_id' => ['required', 'string', 'exists:lesson_package_releases,id'],
            'attempt_id'                => ['nullable', 'string', 'exists:lesson_attempts,id'],
            'selected_option_id'        => ['nullable', 'string'],
            'selected_mesh_name'        => ['nullable', 'string'],
        ]);

        $release = LessonPackageRelease::findOrFail($validated['lesson_package_release_id']);
        $lessonData = $release->lesson_snapshot;
        $checkpoints = collect($lessonData['timeline']['checkpoints'] ?? []);
        $targetCheckpoint = $checkpoints->firstWhere('id', $checkpointId);

        abort_unless($targetCheckpoint, 404, 'Checkpoint no encontrado en la línea de tiempo.');

        // Obtener o inicializar el intento del estudiante
        $user = $request->user();
        $attempt = $validated['attempt_id'] 
            ? LessonAttempt::findOrFail($validated['attempt_id'])
            : LessonAttempt::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'interactive_lesson_id' => $release->interactive_lesson_id,
                    'lesson_package_release_id' => $release->id,
                ],
                [
                    'attempt_number' => 1,
                    'is_first_attempt' => true,
                    'score_obtained' => 0,
                    'max_score' => collect($checkpoints)->sum('points') ?: 100,
                    'percentage' => 0.00,
                    'passed' => false,
                ]
            );

        // Evaluar corrección según tipo de pregunta
        $isCorrect = false;
        $selectedText = null;
        $qType = $targetCheckpoint['questionType'] ?? 'single_choice';

        if (in_array($qType, ['single_choice', 'multiple_choice', 'boolean'])) {
            $options = collect($targetCheckpoint['options'] ?? []);
            $chosenOpt = $options->firstWhere('id', $validated['selected_option_id']);
            $isCorrect = (bool) ($chosenOpt['isCorrect'] ?? false);
            $selectedText = $chosenOpt['text'] ?? null;
        } elseif ($qType === 'mesh_click') {
            $expectedMesh = $targetCheckpoint['targetMesh']['structureName'] ?? '';
            $isCorrect = ($validated['selected_mesh_name'] === $expectedMesh);
            $selectedText = $validated['selected_mesh_name'];
        }

        $pointsAwarded = $isCorrect ? ($targetCheckpoint['points'] ?? 10) : 0;

        // Registrar la respuesta inmutable
        $responseRecord = AttemptResponse::create([
            'lesson_attempt_id'    => $attempt->id,
            'checkpoint_id'        => $checkpointId,
            'prompt_snapshot'      => $targetCheckpoint['prompt'] ?? 'Sin enunciado',
            'selected_option_id'   => $validated['selected_option_id'] ?? $validated['selected_mesh_name'],
            'selected_option_text' => $selectedText,
            'is_correct'           => $isCorrect,
            'points_awarded'       => $pointsAwarded,
        ]);

        // Recalcular puntaje acumulado
        $newScore = $attempt->responses()->sum('points_awarded');
        $passingThreshold = $release->manifest_snapshot['pedagogy']['passingScore'] ?? 80;
        $maxScore = $attempt->max_score ?: 100;
        $percentage = round(($newScore / $maxScore) * 100, 2);

        $attempt->update([
            'score_obtained' => $newScore,
            'percentage'     => $percentage,
            'passed'         => ($percentage >= $passingThreshold),
            'completed_at'   => now(),
        ]);

        return response()->json([
            'is_correct'        => $isCorrect,
            'points_awarded'    => $pointsAwarded,
            'rewind_timestamp'  => $isCorrect ? null : ($targetCheckpoint['rewindTimestamp'] ?? 0.0),
            'current_attempt'   => $attempt,
            'response'          => $responseRecord,
        ]);
    }
}
