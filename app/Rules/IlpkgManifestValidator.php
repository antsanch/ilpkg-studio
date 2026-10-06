<?php

namespace App\Rules;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class IlpkgManifestValidator
{
    /**
     * Valida el arreglo de datos del descriptor manifest.json
     *
     * @param array $manifestData
     * @return array
     * @throws ValidationException
     */
    public static function validate(array $manifestData): array
    {
        return Validator::make($manifestData, [
            'formatVersion' => ['required', 'string'],
            'packageId' => ['required', 'string'],
            
            // Metadata
            'metadata.title' => ['required', 'string', 'max:255'],
            'metadata.slug' => ['required', 'string', 'alpha_dash'],
            'metadata.discipline' => ['required', 'string'],
            'metadata.language' => ['required', 'string'],
            
            // Pedagogy
            'pedagogy.passingScore' => ['required', 'integer', 'between:0,100'],
            'pedagogy.totalCheckpoints' => ['required', 'integer', 'min:0'],
            'pedagogy.estimatedDurationSeconds' => ['required', 'numeric', 'min:1'],
            
            // Assets verification
            'assets.entrypoint' => ['required', 'string'],
            'assets.thumbnail' => ['required', 'string'],
            'assets.masterAudio.path' => ['required', 'string'],
            'assets.models3D' => ['required', 'array', 'min:1'],
            'assets.models3D.*.path' => ['required', 'string'],
            'assets.models3D.*.structures' => ['required', 'array', 'min:1'],
        ])->validate();
    }
}
