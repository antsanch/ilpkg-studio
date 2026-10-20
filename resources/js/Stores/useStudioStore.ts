import { create } from 'zustand';
import { IlpkgManifest } from '../types/ilpkg-manifest';
import { 
    IlpkgLesson, 
    TimelineEvent, 
    LessonCheckpoint, 
    EasingType 
} from '../types/ilpkg-lesson';

export interface MeshVisualState {
    visible: boolean;
    opacity: number;
    highlightColor?: string;
}

export interface CameraPose {
    position: [number, number, number];
    target: [number, number, number];
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface StudioState {
    // 1. Estado del Proyecto
    manifest: IlpkgManifest | null;
    lesson: IlpkgLesson | null;
    audioBlobUrl: string | null;
    modelBlobUrl: string | null;
    isDirty: boolean;

    // 2. Reloj Maestro de Audio y Transporte
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    playbackRate: number;
    zoomLevel: number; // Pixels por segundo en la línea de tiempo

    // 3. Estado Tridimensional y Mallas
    cameraPose: CameraPose;
    meshStates: Record<string, MeshVisualState>;
    loadedStructures: string[];
    showGrid: boolean;
    showAxes: boolean;
    showWireframe: boolean;
    activeTool: 'orbit' | 'hotspot' | 'select';

    // 4. Selección y Modos
    activeEditorMode: 'edit' | 'preview';
    selectedEventId: string | null;
    selectedCheckpointId: string | null;
    selectedMeshNames: string[];

    // 5. Pila de Deshacer / Rehacer (Undo / Redo)
    undoStack: IlpkgLesson[];
    redoStack: IlpkgLesson[];

    // Acciones de Carga e Inicialización
    loadPackageData: (
        manifest: IlpkgManifest, 
        lesson: IlpkgLesson, 
        audioUrl?: string, 
        modelUrl?: string
    ) => void;
    createNewProject: (title?: string) => void;
    closeProject: () => void;
    setManifest: (manifest: IlpkgManifest) => void;
    setLesson: (lesson: IlpkgLesson) => void;
    setIsDirty: (dirty: boolean) => void;

    // Acciones de Transporte
    setCurrentTime: (time: number) => void;
    setIsPlaying: (playing: boolean) => void;
    setDuration: (duration: number) => void;
    setPlaybackRate: (rate: number) => void;
    setZoomLevel: (zoom: number) => void;
    seekBy: (deltaSeconds: number) => void;

    // Acciones de UI y Modos
    setActiveEditorMode: (mode: 'edit' | 'preview') => void;
    setSelectedEventId: (id: string | null) => void;
    setSelectedCheckpointId: (id: string | null) => void;
    setSelectedMeshNames: (names: string[]) => void;
    toggleMeshSelection: (name: string, multiSelect?: boolean) => void;

    // Acciones del Visor 3D
    setCameraPose: (pose: CameraPose) => void;
    setShowGrid: (show: boolean) => void;
    setShowAxes: (show: boolean) => void;
    setShowWireframe: (show: boolean) => void;
    setActiveTool: (tool: 'orbit' | 'hotspot' | 'select') => void;
    setLoadedStructures: (structures: string[]) => void;
    setMeshState: (name: string, state: Partial<MeshVisualState>) => void;

    // State Snapping (Captura Rápida)
    captureCameraPose: (duration?: number, easing?: EasingType) => void;
    captureMeshKeyframe: () => void;
    insertQuickCheckpoint: () => void;

    // Manipulación de Línea de Tiempo (Eventos y Checkpoints)
    addTimelineEvent: (event: TimelineEvent) => void;
    updateTimelineEvent: (id: string, updated: Partial<TimelineEvent>) => void;
    deleteTimelineEvent: (id: string) => void;

    addCheckpoint: (checkpoint: LessonCheckpoint) => void;
    updateCheckpoint: (id: string, updated: Partial<LessonCheckpoint>) => void;
    deleteCheckpoint: (id: string) => void;

    // Historial
    undo: () => void;
    redo: () => void;

    // Validación
    validatePackage: () => ValidationResult;
}

export const useStudioStore = create<StudioState>((set, get) => ({
    manifest: null,
    lesson: null,
    audioBlobUrl: null,
    modelBlobUrl: null,
    isDirty: false,

    currentTime: 0.0,
    duration: 120.0,
    isPlaying: false,
    playbackRate: 1.0,
    zoomLevel: 50, // 50px por segundo por defecto

    cameraPose: {
        position: [0.0, 1.2, 4.5],
        target: [0.0, 0.0, 0.0],
    },
    meshStates: {},
    loadedStructures: [],
    showGrid: true,
    showAxes: true,
    showWireframe: false,
    activeTool: 'orbit',

    activeEditorMode: 'edit',
    selectedEventId: null,
    selectedCheckpointId: null,
    selectedMeshNames: [],

    undoStack: [],
    redoStack: [],

    loadPackageData: (manifest, lesson, audioUrl, modelUrl) => {
        const initialMeshStates: Record<string, MeshVisualState> = {};
        const structures = manifest.assets.models3D[0]?.structures || [];

        structures.forEach((name) => {
            initialMeshStates[name] = {
                visible: true,
                opacity: 1.0,
            };
        });

        set({
            manifest,
            lesson,
            audioBlobUrl: audioUrl || null,
            modelBlobUrl: modelUrl || null,
            duration: lesson.timeline.duration || manifest.pedagogy.estimatedDurationSeconds || 120.0,
            loadedStructures: structures,
            meshStates: initialMeshStates,
            currentTime: 0.0,
            isPlaying: false,
            selectedEventId: null,
            selectedCheckpointId: null,
            selectedMeshNames: [],
            undoStack: [],
            redoStack: [],
            isDirty: false,
        });
    },

    createNewProject: (title = 'Nueva Lección Anatómica') => {
        const { audioBlobUrl, modelBlobUrl } = get();
        if (audioBlobUrl) {
            try { URL.revokeObjectURL(audioBlobUrl); } catch (_) {}
        }
        if (modelBlobUrl) {
            try { URL.revokeObjectURL(modelBlobUrl); } catch (_) {}
        }

        const newManifest: IlpkgManifest = {
            formatVersion: '1.0.0',
            packageId: 'pkg_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()),
            metadata: {
                title,
                slug: 'nueva-leccion-' + Date.now().toString(36),
                authors: [{ name: 'Autor Clínico', role: 'Especialista' }],
                discipline: 'Anatomía Humana',
                language: 'es-MX',
                license: 'CC-BY-NC-SA-4.0',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            pedagogy: {
                estimatedDurationSeconds: 60.0,
                passingScore: 80,
                totalCheckpoints: 0,
                maxAttemptsAllowed: 0,
                allowScrubbingAfterPass: true,
                learningObjectives: [],
            },
            runtimeRequirements: {
                engineVersion: '>=1.0.0',
                webglVersion: 2,
                audioContext: true,
            },
            assets: {
                entrypoint: 'lesson.json',
                thumbnail: 'thumb.webp',
                masterAudio: {
                    path: 'audio/narration.wav',
                    mimeType: 'audio/wav',
                    duration: 60.0,
                    sampleRate: 44100,
                },
                models3D: [],
                staticSlides: [],
            },
        };

        const newLesson: IlpkgLesson = {
            version: '1.0.0',
            timeline: {
                duration: 60.0,
                events: [],
                checkpoints: [],
            },
        };

        set({
            manifest: newManifest,
            lesson: newLesson,
            audioBlobUrl: null,
            modelBlobUrl: null,
            duration: 60.0,
            loadedStructures: [],
            meshStates: {},
            currentTime: 0.0,
            isPlaying: false,
            selectedEventId: null,
            selectedCheckpointId: null,
            selectedMeshNames: [],
            undoStack: [],
            redoStack: [],
            isDirty: false,
        });
    },

    closeProject: () => {
        const { audioBlobUrl, modelBlobUrl } = get();
        if (audioBlobUrl) {
            try { URL.revokeObjectURL(audioBlobUrl); } catch (_) {}
        }
        if (modelBlobUrl) {
            try { URL.revokeObjectURL(modelBlobUrl); } catch (_) {}
        }

        set({
            manifest: null,
            lesson: null,
            audioBlobUrl: null,
            modelBlobUrl: null,
            duration: 60.0,
            loadedStructures: [],
            meshStates: {},
            currentTime: 0.0,
            isPlaying: false,
            selectedEventId: null,
            selectedCheckpointId: null,
            selectedMeshNames: [],
            undoStack: [],
            redoStack: [],
            isDirty: false,
        });
    },

    setManifest: (manifest) => set({ manifest, isDirty: true }),
    setLesson: (lesson) => set({ lesson, isDirty: true }),
    setIsDirty: (isDirty) => set({ isDirty }),

    setCurrentTime: (time) => {
        const duration = get().duration;
        const clamped = Math.max(0, Math.min(time, duration));
        set({ currentTime: clamped });
    },
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setDuration: (duration) => set({ duration }),
    setPlaybackRate: (playbackRate) => set({ playbackRate }),
    setZoomLevel: (zoomLevel) => set({ zoomLevel: Math.max(10, Math.min(zoomLevel, 200)) }),
    seekBy: (deltaSeconds) => {
        const { currentTime, duration } = get();
        const nextTime = Math.max(0, Math.min(currentTime + deltaSeconds, duration));
        set({ currentTime: nextTime });
    },

    setActiveEditorMode: (activeEditorMode) => set({ activeEditorMode }),
    setSelectedEventId: (selectedEventId) => set({ 
        selectedEventId, 
        selectedCheckpointId: null 
    }),
    setSelectedCheckpointId: (selectedCheckpointId) => set({ 
        selectedCheckpointId, 
        selectedEventId: null 
    }),
    setSelectedMeshNames: (selectedMeshNames) => set({ selectedMeshNames }),
    toggleMeshSelection: (name, multiSelect = false) => {
        const current = get().selectedMeshNames;
        if (multiSelect) {
            if (current.includes(name)) {
                set({ selectedMeshNames: current.filter((m) => m !== name) });
            } else {
                set({ selectedMeshNames: [...current, name] });
            }
        } else {
            set({ selectedMeshNames: current.includes(name) ? [] : [name] });
        }
    },

    setCameraPose: (cameraPose) => set({ cameraPose }),
    setShowGrid: (showGrid) => set({ showGrid }),
    setShowAxes: (showAxes) => set({ showAxes }),
    setShowWireframe: (showWireframe) => set({ showWireframe }),
    setActiveTool: (activeTool) => set({ activeTool }),
    setLoadedStructures: (loadedStructures) => set({ loadedStructures }),

    setMeshState: (name, updatedState) => {
        const current = get().meshStates;
        const existing = current[name] || { visible: true, opacity: 1.0 };
        set({
            meshStates: {
                ...current,
                [name]: { ...existing, ...updatedState },
            },
            isDirty: true,
        });
    },

    captureCameraPose: (duration = 2.0, easing = 'power2.inOut') => {
        const { cameraPose, currentTime, lesson } = get();
        if (!lesson) return;

        const newEvent: TimelineEvent = {
            id: `evt_cam_${Date.now()}`,
            timestamp: parseFloat(currentTime.toFixed(2)),
            type: 'camera_transform',
            payload: {
                position: [...cameraPose.position] as [number, number, number],
                target: [...cameraPose.target] as [number, number, number],
                duration,
                easing,
            },
        };

        get().addTimelineEvent(newEvent);
    },

    captureMeshKeyframe: () => {
        const { selectedMeshNames, meshStates, currentTime, lesson } = get();
        if (!lesson || selectedMeshNames.length === 0) return;

        const structures = selectedMeshNames.map((name) => ({
            name,
            opacity: meshStates[name]?.opacity ?? 1.0,
        }));

        const newEvent: TimelineEvent = {
            id: `evt_mesh_${Date.now()}`,
            timestamp: parseFloat(currentTime.toFixed(2)),
            type: 'mesh_opacity',
            payload: {
                structures,
                duration: 1.0,
            },
        };

        get().addTimelineEvent(newEvent);
    },

    insertQuickCheckpoint: () => {
        const { currentTime, lesson } = get();
        if (!lesson) return;

        const rewind = Math.max(0, currentTime - 10.0);
        const newChk: LessonCheckpoint = {
            id: `chk_${Date.now()}`,
            timestamp: parseFloat(currentTime.toFixed(2)),
            title: 'Nuevo Control Clínico',
            prompt: 'Planteamiento clínico formativo...',
            questionType: 'single_choice',
            points: 10,
            rewindTimestamp: parseFloat(rewind.toFixed(2)),
            allowFreeExploration: true,
            options: [
                { id: 'opt_1', text: 'Opción Correcta', isCorrect: true, feedback: 'Justificación médica acertada.' },
                { id: 'opt_2', text: 'Opción Distractora', isCorrect: false, feedback: 'Justificación médica del error.' },
            ],
        };

        get().addCheckpoint(newChk);
    },

    addTimelineEvent: (event) => {
        const { lesson, undoStack } = get();
        if (!lesson) return;

        const nextLesson: IlpkgLesson = {
            ...lesson,
            timeline: {
                ...lesson.timeline,
                events: [...lesson.timeline.events, event].sort((a, b) => a.timestamp - b.timestamp),
            },
        };

        set({
            undoStack: [...undoStack, lesson],
            redoStack: [],
            lesson: nextLesson,
            selectedEventId: event.id,
            isDirty: true,
        });
    },

    updateTimelineEvent: (id, updated) => {
        const { lesson, undoStack } = get();
        if (!lesson) return;

        const nextLesson: IlpkgLesson = {
            ...lesson,
            timeline: {
                ...lesson.timeline,
                events: lesson.timeline.events
                    .map((evt) => (evt.id === id ? { ...evt, ...updated } : evt))
                    .sort((a, b) => a.timestamp - b.timestamp),
            },
        };

        set({
            undoStack: [...undoStack, lesson],
            redoStack: [],
            lesson: nextLesson,
            isDirty: true,
        });
    },

    deleteTimelineEvent: (id) => {
        const { lesson, undoStack, selectedEventId } = get();
        if (!lesson) return;

        const nextLesson: IlpkgLesson = {
            ...lesson,
            timeline: {
                ...lesson.timeline,
                events: lesson.timeline.events.filter((evt) => evt.id !== id),
            },
        };

        set({
            undoStack: [...undoStack, lesson],
            redoStack: [],
            lesson: nextLesson,
            selectedEventId: selectedEventId === id ? null : selectedEventId,
            isDirty: true,
        });
    },

    addCheckpoint: (checkpoint) => {
        const { lesson, undoStack } = get();
        if (!lesson) return;

        const nextLesson: IlpkgLesson = {
            ...lesson,
            timeline: {
                ...lesson.timeline,
                checkpoints: [...lesson.timeline.checkpoints, checkpoint].sort((a, b) => a.timestamp - b.timestamp),
            },
        };

        set({
            undoStack: [...undoStack, lesson],
            redoStack: [],
            lesson: nextLesson,
            selectedCheckpointId: checkpoint.id,
            isDirty: true,
        });
    },

    updateCheckpoint: (id, updated) => {
        const { lesson, undoStack } = get();
        if (!lesson) return;

        const nextLesson: IlpkgLesson = {
            ...lesson,
            timeline: {
                ...lesson.timeline,
                checkpoints: lesson.timeline.checkpoints
                    .map((chk) => (chk.id === id ? { ...chk, ...updated } : chk))
                    .sort((a, b) => a.timestamp - b.timestamp),
            },
        };

        set({
            undoStack: [...undoStack, lesson],
            redoStack: [],
            lesson: nextLesson,
            isDirty: true,
        });
    },

    deleteCheckpoint: (id) => {
        const { lesson, undoStack, selectedCheckpointId } = get();
        if (!lesson) return;

        const nextLesson: IlpkgLesson = {
            ...lesson,
            timeline: {
                ...lesson.timeline,
                checkpoints: lesson.timeline.checkpoints.filter((chk) => chk.id !== id),
            },
        };

        set({
            undoStack: [...undoStack, lesson],
            redoStack: [],
            lesson: nextLesson,
            selectedCheckpointId: selectedCheckpointId === id ? null : selectedCheckpointId,
            isDirty: true,
        });
    },

    undo: () => {
        const { undoStack, redoStack, lesson } = get();
        if (undoStack.length === 0 || !lesson) return;

        const previous = undoStack[undoStack.length - 1];
        set({
            undoStack: undoStack.slice(0, -1),
            redoStack: [...redoStack, lesson],
            lesson: previous,
            isDirty: true,
        });
    },

    redo: () => {
        const { undoStack, redoStack, lesson } = get();
        if (redoStack.length === 0 || !lesson) return;

        const next = redoStack[redoStack.length - 1];
        set({
            undoStack: [...undoStack, lesson],
            redoStack: redoStack.slice(0, -1),
            lesson: next,
            isDirty: true,
        });
    },

    validatePackage: () => {
        const { manifest, lesson } = get();
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!manifest) {
            errors.push('No hay manifest.json cargado.');
            return { isValid: false, errors, warnings };
        }

        if (!lesson) {
            errors.push('No hay lesson.json cargado.');
            return { isValid: false, errors, warnings };
        }

        const duration = manifest.pedagogy.estimatedDurationSeconds;
        const structures = manifest.assets.models3D[0]?.structures || [];
        const structuresSet = new Set(structures);

        // Validar eventos
        lesson.timeline.events.forEach((evt) => {
            if (evt.timestamp < 0 || evt.timestamp > duration) {
                errors.push(`Evento ${evt.id}: timestamp fuera de rango (0 - ${duration}s).`);
            }

            if (evt.payload?.structures) {
                const list = Array.isArray(evt.payload.structures) 
                    ? evt.payload.structures 
                    : [evt.payload.structures];
                list.forEach((s: any) => {
                    const name = typeof s === 'string' ? s : s.name;
                    if (name && !structuresSet.has(name)) {
                        errors.push(`Evento ${evt.id}: estructura '${name}' no está declarada en el modelo.`);
                    }
                });
            }
        });

        // Validar checkpoints
        lesson.timeline.checkpoints.forEach((chk) => {
            if (chk.timestamp <= 0 || chk.timestamp > duration) {
                errors.push(`Checkpoint ${chk.id}: timestamp fuera de rango.`);
            }

            if (chk.rewindTimestamp !== undefined && chk.rewindTimestamp >= chk.timestamp) {
                errors.push(`Checkpoint ${chk.id}: rewindTimestamp debe ser menor al timestamp de detención.`);
            }

            if (chk.questionType === 'single_choice' || chk.questionType === 'multiple_choice') {
                const hasCorrect = chk.options?.some((o) => o.isCorrect);
                if (!hasCorrect) {
                    errors.push(`Checkpoint ${chk.id}: debe tener al menos una opción correcta marcada.`);
                }
            }

            if (chk.questionType === 'mesh_click') {
                const target = chk.targetMesh?.structureName;
                if (!target || !structuresSet.has(target)) {
                    errors.push(`Checkpoint ${chk.id}: la malla objetivo '${target}' no existe en el inventario.`);
                }
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    },
}));
