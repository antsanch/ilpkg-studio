<?php

namespace Tests\Feature;

use App\Rules\IlpkgManifestValidator;
use Tests\TestCase;
use ZipArchive;

class PackageExtractionAndValidationTest extends TestCase
{
    public function test_demo_package_exists_and_passes_all_validations(): void
    {
        $packagePath = public_path('demo.ilpkg');
        $this->assertFileExists($packagePath, 'El paquete demo.ilpkg debe existir en el directorio public.');

        $zip = new ZipArchive();
        $res = $zip->open($packagePath);
        $this->assertTrue($res === true, 'El paquete .ilpkg debe ser un archivo ZIP válido.');

        // 1. Verificar existencia de descriptores esenciales
        $manifestContent = $zip->getFromName('manifest.json');
        $lessonContent = $zip->getFromName('lesson.json');
        $this->assertNotFalse($manifestContent, 'El archivo manifest.json debe existir en la raíz.');
        $this->assertNotFalse($lessonContent, 'El archivo lesson.json debe existir en la raíz.');

        // 2. Parsear JSONs
        $manifest = json_decode($manifestContent, true);
        $lesson = json_decode($lessonContent, true);
        $this->assertIsArray($manifest, 'El manifiesto debe ser un JSON válido.');
        $this->assertIsArray($lesson, 'La lección debe ser un JSON válido.');

        // 3. Validar con IlpkgManifestValidator
        $validated = IlpkgManifestValidator::validate($manifest);
        $this->assertEquals('1.0.0', $validated['formatVersion']);
        $this->assertEquals('laab-anat-neuro-042', $validated['packageId']);

        // 4. Verificar integridad referencial de mallas
        $declaredStructures = $manifest['assets']['models3D'][0]['structures'] ?? [];
        $duration = $manifest['pedagogy']['estimatedDurationSeconds'];

        foreach ($lesson['timeline']['events'] as $event) {
            $this->assertGreaterThanOrEqual(0.0, $event['timestamp']);
            $this->assertLessThanOrEqual($duration, $event['timestamp']);

            if (isset($event['payload']['structures'])) {
                foreach ($event['payload']['structures'] as $struct) {
                    $name = is_array($struct) ? $struct['name'] : $struct;
                    $this->assertContains(
                        $name,
                        $declaredStructures,
                        "La estructura '{$name}' en el evento {$event['id']} debe estar declarada en manifest.json."
                    );
                }
            }
        }

        // 5. Verificar consistencia de checkpoints pedagógicos
        foreach ($lesson['timeline']['checkpoints'] as $chk) {
            $this->assertGreaterThan(0.0, $chk['timestamp']);
            $this->assertLessThanOrEqual($duration, $chk['timestamp']);

            if (isset($chk['rewindTimestamp'])) {
                $this->assertLessThan(
                    $chk['timestamp'],
                    $chk['rewindTimestamp'],
                    "El rewindTimestamp ({$chk['rewindTimestamp']}) debe ser menor al timestamp de detención ({$chk['timestamp']})."
                );
            }

            if ($chk['questionType'] === 'mesh_click') {
                $targetStructure = $chk['targetMesh']['structureName'] ?? null;
                $this->assertContains(
                    $targetStructure,
                    $declaredStructures,
                    "La estructura objetivo del quiz '{$targetStructure}' debe estar declarada en manifest.json."
                );
            }
        }

        // 6. Verificar que los binarios existan en el ZIP
        $this->assertNotFalse($zip->getFromName($manifest['assets']['masterAudio']['path']));
        $this->assertNotFalse($zip->getFromName($manifest['assets']['models3D'][0]['path']));

        $zip->close();
    }
}
