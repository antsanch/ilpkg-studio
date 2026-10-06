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
    mimeType: string;
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
