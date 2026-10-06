<?php

namespace App\Services;

use App\Models\LessonAttempt;

class LessonAttemptAuditService
{
    /**
     * Reconstruye la auditoría y evidencia de un intento a partir del snapshot JSON inmutable
     */
    public function getAttemptAudit(string $attemptId): array
    {
        $attempt = LessonAttempt::with(['release', 'responses'])->findOrFail($attemptId);
        $release = $attempt->release;

        // Leer el snapshot guardado en la base de datos
        $lessonSnapshot = $release->lesson_snapshot;
        $checkpoints = collect($lessonSnapshot['timeline']['checkpoints'] ?? []);

        // Cruzar las respuestas del alumno con el cuestionario histórico
        $auditTrail = $attempt->responses->map(function ($response) use ($checkpoints) {
            $originalCheckpoint = $checkpoints->firstWhere('id', $response->checkpoint_id);

            return [
                'checkpoint_id'   => $response->checkpoint_id,
                'prompt'          => $response->prompt_snapshot ?: ($originalCheckpoint['prompt'] ?? 'Pregunta histórica'),
                'selected_answer' => $response->selected_option_text,
                'is_correct'      => $response->is_correct,
                'points_awarded'  => $response->points_awarded,
            ];
        });

        return [
            'lesson_title'    => $release->manifest_snapshot['metadata']['title'] ?? 'Lección Anatómica',
            'version_applied' => $release->version,
            'is_deprecated'   => $release->status !== 'active',
            'has_3d_assets'   => !empty($release->package_path),
            'final_score'     => $attempt->score_obtained,
            'passed'          => $attempt->passed,
            'completed_at'    => $attempt->completed_at?->toIso8601String(),
            'audit_trail'     => $auditTrail->all(),
        ];
    }
}
