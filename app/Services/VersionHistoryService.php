<?php

namespace App\Services;

use App\Models\EntityVersionHistory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class VersionHistoryService
{
    /**
     * Graba una versión inmutable del modelo antes o después de una modificación
     */
    public function snapshot(Model $model, string $action, ?string $summary = null, array $diff = []): EntityVersionHistory
    {
        $lastVersion = EntityVersionHistory::where('versionable_type', get_class($model))
            ->where('versionable_id', $model->getKey())
            ->max('version_number') ?? 0;

        return EntityVersionHistory::create([
            'versionable_type' => get_class($model),
            'versionable_id'   => $model->getKey(),
            'user_id'          => auth()->id(),
            'action'           => $action,
            'summary'          => $summary,
            'state_snapshot'   => $model->toArray(),
            'diff_payload'     => $diff,
            'version_number'   => $lastVersion + 1,
        ]);
    }

    /**
     * Realiza un Undo / Rollback a una versión histórica específica
     */
    public function rollbackTo(Model $model, int $targetVersionNumber): Model
    {
        $targetHistory = EntityVersionHistory::where('versionable_type', get_class($model))
            ->where('versionable_id', $model->getKey())
            ->where('version_number', $targetVersionNumber)
            ->firstOrFail();

        return DB::transaction(function () use ($model, $targetHistory) {
            // Respaldar el estado actual antes de sobreescribir
            $this->snapshot(
                $model,
                'rollback_backup',
                "Respaldo automático previo a restaurar v{$targetHistory->version_number}"
            );

            // Rehidratar los datos
            $dataToRestore = $targetHistory->state_snapshot;
            
            // Excluir claves protegidas del modelo
            unset($dataToRestore['id'], $dataToRestore['created_at'], $dataToRestore['updated_at']);

            $model->fill($dataToRestore);
            $model->save();

            // Grabar el evento de rollback en el historial
            $this->snapshot(
                $model,
                'rollback',
                "Revertido con éxito a la versión v{$targetHistory->version_number}"
            );

            return $model;
        });
    }
}
