<?php

namespace Tests\Unit;

use App\Rules\IlpkgManifestValidator;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class IlpkgManifestValidatorTest extends TestCase
{
    private function getValidManifest(): array
    {
        return [
            'formatVersion' => '1.0.0',
            'packageId' => 'laab-anat-neuro-042',
            'metadata' => [
                'title' => 'Fosa Pterigopalatina',
                'slug' => 'fosa-pterigopalatina',
                'discipline' => 'Anatomía Humana',
                'language' => 'es-MX',
            ],
            'pedagogy' => [
                'passingScore' => 80,
                'totalCheckpoints' => 2,
                'estimatedDurationSeconds' => 120.5,
            ],
            'assets' => [
                'entrypoint' => 'lesson.json',
                'thumbnail' => 'thumb.webp',
                'masterAudio' => [
                    'path' => 'audio/narration.webm',
                ],
                'models3D' => [
                    [
                        'path' => 'models/anatomy.glb',
                        'structures' => ['maxilla', 'os_sphenoidale'],
                    ],
                ],
            ],
        ];
    }

    public function test_valid_manifest_passes_validation(): void
    {
        $manifest = $this->getValidManifest();
        $validated = IlpkgManifestValidator::validate($manifest);

        $this->assertEquals('1.0.0', $validated['formatVersion']);
        $this->assertEquals('laab-anat-neuro-042', $validated['packageId']);
        $this->assertEquals(80, $validated['pedagogy']['passingScore']);
    }

    public function test_manifest_fails_when_format_version_missing(): void
    {
        $manifest = $this->getValidManifest();
        unset($manifest['formatVersion']);

        $this->expectException(ValidationException::class);
        IlpkgManifestValidator::validate($manifest);
    }

    public function test_manifest_fails_when_passing_score_out_of_range(): void
    {
        $manifest = $this->getValidManifest();
        $manifest['pedagogy']['passingScore'] = 150; // Max allowed is 100

        $this->expectException(ValidationException::class);
        IlpkgManifestValidator::validate($manifest);
    }

    public function test_manifest_fails_when_models3d_empty(): void
    {
        $manifest = $this->getValidManifest();
        $manifest['assets']['models3D'] = [];

        $this->expectException(ValidationException::class);
        IlpkgManifestValidator::validate($manifest);
    }

    public function test_manifest_fails_when_structures_empty(): void
    {
        $manifest = $this->getValidManifest();
        $manifest['assets']['models3D'][0]['structures'] = [];

        $this->expectException(ValidationException::class);
        IlpkgManifestValidator::validate($manifest);
    }
}
