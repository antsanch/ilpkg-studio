export type TimelineEventType = 
    | 'camera_transform' 
    | 'mesh_opacity' 
    | 'mesh_visibility' 
    | 'mesh_highlight' 
    | 'slide_display' 
    | 'slide_dismiss';

export type QuestionType = 
    | 'single_choice' 
    | 'multiple_choice' 
    | 'mesh_click' 
    | 'boolean';

export type EasingType = 
    | 'linear' 
    | 'power2.inOut' 
    | 'power3.out' 
    | 'sine.inOut';

export interface CameraTransformPayload {
    position: [number, number, number];
    target: [number, number, number];
    duration: number;
    easing?: EasingType;
}

export interface MeshOpacityStructure {
    name: string;
    opacity: number;
}

export interface MeshOpacityPayload {
    modelId?: string;
    structures: MeshOpacityStructure[];
    duration?: number;
}

export interface MeshVisibilityPayload {
    modelId?: string;
    structures: { name: string; visible: boolean }[];
}

export interface MeshHighlightPayload {
    modelId?: string;
    structures: string[];
    emissiveColor: string;
    intensity?: number;
    duration?: number;
}

export interface SlideDisplayPayload {
    slideId: string;
    position?: 'overlay_left' | 'overlay_right' | 'pip' | 'fullscreen';
    duration?: number;
}

export interface TimelineEvent {
    id: string;
    timestamp: number;
    type: TimelineEventType;
    payload: any;
}

export interface CheckpointOption {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback?: string;
}

export interface CheckpointTargetMesh {
    modelId: string;
    structureName: string;
}

export interface LessonCheckpoint {
    id: string;
    timestamp: number;
    title: string;
    prompt: string;
    questionType: QuestionType;
    points: number;
    rewindTimestamp?: number;
    allowFreeExploration?: boolean;
    options?: CheckpointOption[];
    targetMesh?: CheckpointTargetMesh;
    feedback?: {
        success?: string;
        failure?: string;
    };
}

export interface IlpkgTimeline {
    duration: number;
    events: TimelineEvent[];
    checkpoints: LessonCheckpoint[];
}

export interface IlpkgLesson {
    $schema?: string;
    version: string;
    timeline: IlpkgTimeline;
}
