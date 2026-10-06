<?php

namespace App\Http\Controllers;

use App\Models\InteractiveLesson;
use App\Services\QrSharingService;
use App\Services\VersionHistoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LessonVersioningAndShareController extends Controller
{
    /**
     * Listar historial de cambios para el panel de Undo
     */
    public function getHistory(Request $request, InteractiveLesson $lesson): JsonResponse
    {
        abort_unless($request->user()?->can('lessons.versions.view'), 403, 'No autorizado para ver versiones.');

        $history = $lesson->versionHistories()
            ->with('user:id,name,email')
            ->orderByDesc('version_number')
            ->get();

        return response()->json($history);
    }

    /**
     * Ejecutar Rollback / Undo a una versión histórica
     */
    public function rollback(
        Request $request,
        InteractiveLesson $lesson,
        VersionHistoryService $historyService
    ): RedirectResponse {
        abort_unless($request->user()?->can('lessons.versions.rollback'), 403, 'No autorizado para ejecutar rollback.');

        $request->validate([
            'target_version' => ['required', 'integer', 'min:1'],
        ]);

        $historyService->rollbackTo($lesson, (int) $request->input('target_version'));

        return back()->with('success', "Lección restaurada exitosamente a la versión v{$request->target_version}.");
    }

    /**
     * Generar nuevo código QR firmado para la lección
     */
    public function createQr(
        Request $request,
        InteractiveLesson $lesson,
        QrSharingService $qrService
    ): JsonResponse {
        abort_unless($request->user()?->can('lessons.share.qr'), 403, 'No autorizado para generar códigos QR.');

        $request->validate([
            'scope'      => ['required', 'in:student_launch,peer_review,public_read'],
            'max_uses'   => ['nullable', 'integer', 'min:1'],
            'expires_in' => ['nullable', 'integer'], // Horas de vigencia
        ]);

        $expiresAt = $request->filled('expires_in')
            ? now()->addHours($request->input('expires_in'))
            : null;

        $qrData = $qrService->generateShareQr(
            $lesson,
            $request->input('scope'),
            $request->input('max_uses'),
            $expiresAt,
            $request->user()?->id
        );

        return response()->json($qrData);
    }

    /**
     * Punto de entrada al escanear el QR desde dispositivo móvil o navegador
     */
    public function resolveQr(string $token, QrSharingService $qrService): RedirectResponse
    {
        $shareToken = $qrService->resolveToken($token);
        $entity = $shareToken->shareable;

        if ($shareToken->scope === 'peer_review') {
            return redirect()->route('lessons.review', $entity->id);
        }

        // Acceso directo al reproductor del estudiante
        return redirect()->route('lessons.player', $entity->id);
    }
}
