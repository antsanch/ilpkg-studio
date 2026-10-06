<?php

use App\Http\Controllers\LessonController;
use App\Http\Controllers\LessonPackageReleaseController;
use App\Http\Controllers\LessonVersioningAndShareController;
use App\Http\Controllers\StudioController;
use Illuminate\Support\Facades\Route;

// Redirección principal al Studio
Route::get('/', function () {
    return redirect()->route('lessons.studio');
});

// Rutas de Vistas Principales (Studio Workstation & Player)
Route::middleware(['web'])->group(function () {
    Route::get('/studio/{lesson?}', [StudioController::class, 'studio'])->name('lessons.studio');
    Route::get('/lessons/{lesson}/player', [StudioController::class, 'player'])->name('lessons.player');
    Route::get('/lessons/{lesson}/review', [StudioController::class, 'studio'])->name('lessons.review');
    Route::get('/attempts/{attemptId}/audit', [StudioController::class, 'audit'])->name('lessons.attempts.audit');
});

// Rutas de Gestión de Lecciones (CRUD)
Route::prefix('api/lessons')->group(function () {
    Route::get('/', [LessonController::class, 'index'])->name('api.lessons.index');
    Route::post('/', [LessonController::class, 'store'])->name('api.lessons.store');
    Route::get('/{lesson}', [LessonController::class, 'show'])->name('api.lessons.show');
    Route::put('/{lesson}', [LessonController::class, 'update'])->name('api.lessons.update');
    Route::delete('/{lesson}', [LessonController::class, 'destroy'])->name('api.lessons.destroy');
});

// Rutas de Releases y Evaluación de Checkpoints
Route::post('/lessons/{lesson}/releases', [LessonPackageReleaseController::class, 'publish'])
    ->name('lessons.releases.publish');
Route::post('/checkpoints/{checkpointId}/respond', [LessonPackageReleaseController::class, 'respondCheckpoint'])
    ->name('interactive-lessons.checkpoints.respond');

// Rutas de Historial, Rollback y QR
Route::get('/lessons/{lesson}/history', [LessonVersioningAndShareController::class, 'getHistory'])
    ->name('lessons.history');
Route::post('/lessons/{lesson}/rollback', [LessonVersioningAndShareController::class, 'rollback'])
    ->name('lessons.rollback');
Route::post('/lessons/{lesson}/qr', [LessonVersioningAndShareController::class, 'createQr'])
    ->name('lessons.qr');

// Ruta pública de resolución al escanear QR
Route::get('/qr/resolve/{token}', [LessonVersioningAndShareController::class, 'resolveQr'])
    ->name('qr.resolve');
