El manifiesto (manifest.json) es el punto de entrada crítico del paquete .ilpkg. Cumple la función de describir metadatos bibliográficos, garantizar la compatibilidad del motor de renderizado y listar de forma determinista todos los recursos multimedia antes de descomprimir o procesar la línea de tiempo.

A continuación se define la especificación formal del esquema JSON y su tipado para TypeScript y Laravel.

1. Esquema JSON de Referencia (manifest.json)
JSON
{
  "$schema": "https://laab.app/schemas/v1/ilpkg-manifest.json",
  "formatVersion": "1.0.0",
  "packageId": "laab-anat-neuro-042",
  "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "metadata": {
    "title": "Fosa Pterigopalatina: Relaciones y Abordajes",
    "slug": "fosa-pterigopalatina-relaciones-abordajes",
    "description": "Estudio anatómico tridimensional de los límites, forámenes y contenido neurovascular de la fosa pterigopalatina.",
    "authors": [
      {
        "name": "Dr. Antonio Sánchez Uresti",
        "role": "Autor de Contenido / Anatomista",
        "institution": "UANL"
      }
    ],
    "discipline": "Anatomía Humana",
    "subdiscipline": "Neuroanatomía / Cabeza y Cuello",
    "targetAudience": "Pregrado Medicina / Ingeniería Biomédica",
    "language": "es-MX",
    "license": "CC-BY-NC-SA-4.0",
    "createdAt": "2026-10-03T15:13:00Z",
    "updatedAt": "2026-10-03T15:13:00Z"
  },
  "pedagogy": {
    "estimatedDurationSeconds": 245.5,
    "passingScore": 80,
    "totalCheckpoints": 4,
    "maxAttemptsAllowed": 0,
    "allowScrubbingAfterPass": true,
    "learningObjectives": [
      "Identificar los límites óseos de la fosa pterigopalatina.",
      "Reconocer las ramas terminales del nervio maxilar (V2).",
      "Correlacionar las vías de diseminación a través del foramen esfenopalatino."
    ]
  },
  "runtimeRequirements": {
    "engineVersion": ">=1.0.0",
    "webglVersion": 2,
    "audioContext": true,
    "requiredExtensions": [
      "EXT_meshopt_compression",
      "KHR_draco_mesh_compression"
    ],
    "targetHardwareClass": "medium"
  },
  "assets": {
    "entrypoint": "lesson.json",
    "thumbnail": "thumb.webp",
    "masterAudio": {
      "path": "audio/narration.webm",
      "mimeType": "audio/webm; codecs=opus",
      "duration": 245.5,
      "sampleRate": 48000
    },
    "models3D": [
      {
        "id": "pterygoid_fossa_main",
        "path": "models/fosa_pterigopalatina.glb",
        "format": "gltf-binary",
        "dracoCompressed": true,
        "polyCount": 184500,
        "structures": [
          "os_sphenoidale",
          "os_palatinum",
          "maxilla",
          "arteria_maxillaris",
          "nervus_maxillaris"
        ]
      }
    ],
    "staticSlides": [
      {
        "id": "slide_corte_coronal_rmn",
        "path": "slides/corte_coronal_rmn.webp",
        "mimeType": "image/webp",
        "dimensions": { "width": 1920, "height": 1080 }
      },
      {
        "id": "diagrama_ramas_v2",
        "path": "slides/diagrama_ramas_v2.svg",
        "mimeType": "image/svg+xml"
      }
    ]
  }
}
2. Desglose de Secciones y Necesidades Técnicas
Control de Formato e Integridad (formatVersion, checksum):

Permite al parser de Laravel o del frontend saber si el lector actual puede renderizar el paquete.

El hash SHA-256 previene paquetes corruptos o archivos manipulados tras la descarga.

Metadatos Curriculares y Bibliográficos (metadata):

Alineados con la organización temática de la app LAAB (disciplina, público objetivo, autores, licencias).

Soporta ordenamiento e indexación en el catálogo sin requerir abrir el archivo lesson.json.

Configuración Pedagógica (pedagogy):

Define los parámetros globales del examen de primera visualización: umbral de aprobación (passingScore), cantidad de checkpoints y si se permite o no la libre navegación temporal (scrubbing) una vez completado.

Requisitos de Ejecución (runtimeRequirements):

Especifica extensiones WebGL indispensables (como descompresores Draco/Meshopt). Si el dispositivo móvil del alumno no soporta alguna extensión crítica, la app notifica antes de consumir memoria.

Mapa de Activos (assets):

masterAudio: Ruta relativa al reloj maestro con especificación de códec para predecir si el navegador puede decodificarlo nativamente.

models3D: Lista de mallas y su inventario de nombres de nodos (structures). Esto le permite al editor y al reproductor validar que las mallas referenciadas en los eventos de la línea de tiempo existan físicamente en el GLB.

staticSlides: Imágenes complementarias de diagnóstico (RMN, TAC, cortes histológicos) o esquemas vectoriales.

3. Definición de Tipos en TypeScript
TypeScript
// resources/js/types/ilpkg-manifest.ts

export interface ManifestAuthor {
  name: string;
  role?: string;
  institution?: string;
}

export interface ManifestMetadata {
  title: string;
  slug: string;
  description?: string;
  authors: ManifestAuthor[];
  discipline: string;
  subdiscipline?: string;
  targetAudience?: string;
  language: string;
  license: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManifestPedagogy {
  estimatedDurationSeconds: number;
  passingScore: number;
  totalCheckpoints: number;
  maxAttemptsAllowed: number;
  allowScrubbingAfterPass: boolean;
  learningObjectives?: string[];
}

export interface ManifestRuntimeRequirements {
  engineVersion: string;
  webglVersion: 1 | 2;
  audioContext: boolean;
  requiredExtensions?: string[];
  targetHardwareClass?: 'low' | 'medium' | 'high';
}

export interface Model3DAsset {
  id: string;
  path: string;
  format: 'gltf-binary' | 'gltf-json';
  dracoCompressed: boolean;
  polyCount?: number;
  structures: string[];
}

export interface StaticSlideAsset {
  id: string;
  path: string;
  mimeType: 'image/webp' | 'image/png' | 'image/jpeg' | 'image/svg+xml';
  dimensions?: { width: number; height: number };
}

export interface ManifestAssets {
  entrypoint: string;
  thumbnail: string;
  masterAudio: {
    path: string;
    mimeType: string;
    duration: number;
    sampleRate: number;
  };
  models3D: Model3DAsset[];
  staticSlides: StaticSlideAsset[];
}

export interface IlpkgManifest {
  $schema?: string;
  formatVersion: string;
  packageId: string;
  checksum?: string;
  metadata: ManifestMetadata;
  pedagogy: ManifestPedagogy;
  runtimeRequirements: ManifestRuntimeRequirements;
  assets: ManifestAssets;
}
4. Reglas de Validación en Laravel (FormRequest / Validator)
Al subir un .ilpkg, una clase validadora lee el manifest.json en memoria antes de extraer el resto del archivo:

PHP
// app/Rules/IlpkgManifestValidator.php
namespace App\Rules;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class IlpkgManifestValidator
{
    public static function validate(array $manifestData): array
    {
        return Validator::make($manifestData, [
            'formatVersion' => ['required', 'string'],
            'packageId' => ['required', 'string'],
            
            // Metadata
            'metadata.title' => ['required', 'string', 'max:255'],
            'metadata.slug' => ['required', 'string', 'alpha_dash'],
            'metadata.discipline' => ['required', 'string'],
            'metadata.language' => ['required', 'string', 'size:5'],
            
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