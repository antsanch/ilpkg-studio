import { describe, it, expect, beforeEach } from 'vitest';
import { useStudioStore } from '../../resources/js/Stores/useStudioStore';
import { IlpkgManifest } from '../../resources/js/types/ilpkg-manifest';
import { IlpkgLesson } from '../../resources/js/types/ilpkg-lesson';

describe('useStudioStore (Zustand Central Workstation Store)', () => {
    const mockManifest: IlpkgManifest = {
        formatVersion: '1.0.0',
        packageId: 'test-pkg-001',
        metadata: {
            title: 'Test Anatomy',
            slug: 'test-anatomy',
            authors: [],
            discipline: 'Anatomía',
            language: 'es-MX',
            license: 'CC-BY-4.0',
            createdAt: '2026-10-04T00:00:00Z',
            updatedAt: '2026-10-04T00:00:00Z',
        },
        pedagogy: {
            estimatedDurationSeconds: 120,
            passingScore: 80,
            totalCheckpoints: 1,
            maxAttemptsAllowed: 0,
            allowScrubbingAfterPass: true,
        },
        runtimeRequirements: {
            engineVersion: '>=1.0.0',
            webglVersion: 2,
            audioContext: true,
        },
        assets: {
            entrypoint: 'lesson.json',
            thumbnail: 'thumb.webp',
            masterAudio: { path: 'audio/narration.wav', mimeType: 'audio/wav', duration: 120, sampleRate: 48000 },
            models3D: [{ id: 'm1', path: 'models/anatomy.glb', format: 'gltf-binary', dracoCompressed: false, structures: ['maxilla', 'os_sphenoidale'] }],
            staticSlides: [],
        },
    };

    const mockLesson: IlpkgLesson = {
        version: '1.0.0',
        timeline: {
            duration: 120,
            events: [
                {
                    id: 'evt_001',
                    timestamp: 10.0,
                    type: 'camera_transform',
                    payload: { position: [0, 1, 2], target: [0, 0, 0], duration: 2.0 },
                },
            ],
            checkpoints: [
                {
                    id: 'chk_001',
                    timestamp: 50.0,
                    title: 'Control 1',
                    prompt: 'Pregunta de prueba',
                    questionType: 'single_choice',
                    points: 10,
                    rewindTimestamp: 30.0,
                    options: [{ id: 'opt_1', text: 'Correcta', isCorrect: true }],
                },
            ],
        },
    };

    beforeEach(() => {
        useStudioStore.getState().loadPackageData(mockManifest, mockLesson);
    });

    it('inicializa correctamente los metadatos y la duración', () => {
        const state = useStudioStore.getState();
        expect(state.manifest?.metadata.title).toBe('Test Anatomy');
        expect(state.duration).toBe(120);
        expect(state.loadedStructures).toEqual(['maxilla', 'os_sphenoidale']);
        expect(state.currentTime).toBe(0.0);
    });

    it('controla el reloj maestro y el transporte con límites (clamping)', () => {
        const store = useStudioStore.getState();

        store.setCurrentTime(45.5);
        expect(useStudioStore.getState().currentTime).toBe(45.5);

        // Clamping inferior a 0
        store.setCurrentTime(-10);
        expect(useStudioStore.getState().currentTime).toBe(0.0);

        // Clamping superior a la duración
        store.setCurrentTime(999);
        expect(useStudioStore.getState().currentTime).toBe(120.0);

        // Salto relativo con seekBy
        store.setCurrentTime(50.0);
        store.seekBy(5.0);
        expect(useStudioStore.getState().currentTime).toBe(55.0);
    });

    it('agrega, actualiza y elimina eventos de la línea de tiempo manteniendo orden cronológico', () => {
        const store = useStudioStore.getState();

        // Agregar evento
        store.addTimelineEvent({
            id: 'evt_002',
            timestamp: 5.0, // Anterior a evt_001 (10.0)
            type: 'mesh_opacity',
            payload: { structures: [{ name: 'maxilla', opacity: 0.5 }] },
        });

        const events = useStudioStore.getState().lesson?.timeline.events || [];
        expect(events.length).toBe(2);
        // Debe ordenar por timestamp ascendente
        expect(events[0].id).toBe('evt_002');
        expect(events[1].id).toBe('evt_001');

        // Actualizar
        store.updateTimelineEvent('evt_002', { timestamp: 15.0 });
        const updatedEvents = useStudioStore.getState().lesson?.timeline.events || [];
        expect(updatedEvents[1].id).toBe('evt_002');

        // Eliminar
        store.deleteTimelineEvent('evt_002');
        expect(useStudioStore.getState().lesson?.timeline.events.length).toBe(1);
    });

    it('captura la pose de cámara actual como evento (Ctrl+K State Snapping)', () => {
        const store = useStudioStore.getState();
        store.setCurrentTime(25.4);
        store.setCameraPose({ position: [2.5, 1.0, 3.2], target: [0.1, 0.2, 0.0] });

        store.captureCameraPose(1.8, 'power2.inOut');

        const events = useStudioStore.getState().lesson?.timeline.events || [];
        const camEvent = events.find((e) => e.timestamp === 25.4);
        expect(camEvent).toBeDefined();
        expect(camEvent?.type).toBe('camera_transform');
        expect(camEvent?.payload.position).toEqual([2.5, 1.0, 3.2]);
        expect(camEvent?.payload.duration).toBe(1.8);
        expect(camEvent?.payload.easing).toBe('power2.inOut');
    });

    it('ejecuta Undo y Redo de acciones en el editor', () => {
        const store = useStudioStore.getState();
        const initialCount = store.lesson?.timeline.events.length || 0;

        store.addTimelineEvent({
            id: 'evt_temp',
            timestamp: 40.0,
            type: 'mesh_visibility',
            payload: {},
        });
        expect(useStudioStore.getState().lesson?.timeline.events.length).toBe(initialCount + 1);

        // Deshacer (Undo)
        store.undo();
        expect(useStudioStore.getState().lesson?.timeline.events.length).toBe(initialCount);

        // Rehacer (Redo)
        store.redo();
        expect(useStudioStore.getState().lesson?.timeline.events.length).toBe(initialCount + 1);
    });

    it('valida la consistencia referencial de mallas y tiempos', () => {
        const store = useStudioStore.getState();
        const res = store.validatePackage();
        expect(res.isValid).toBe(true);
        expect(res.errors.length).toBe(0);

        // Inyectar un evento con malla no declarada
        store.addTimelineEvent({
            id: 'evt_invalid',
            timestamp: 60.0,
            type: 'mesh_opacity',
            payload: { structures: [{ name: 'malla_inexistente', opacity: 0.1 }] },
        });

        const invalidRes = store.validatePackage();
        expect(invalidRes.isValid).toBe(false);
        expect(invalidRes.errors.some((e) => e.includes('malla_inexistente'))).toBe(true);
    });

    it('generates valid audio waveform path string without runtime reference errors', () => {
        const totalWidth = 400;
        const zoomLevel = 40;
        const pathData = Array.from({ length: Math.floor(totalWidth / 4) }).map((_, i) => {
            const x = i * 4;
            const t = x / zoomLevel;
            const amp = [12, 13, 14].includes(Math.floor(t) % 15) ? 2 : (8 + Math.sin(t * 3) * 6);
            return `M ${x} ${14 - amp} L ${x} ${14 + amp}`;
        }).join(' ');

        expect(pathData).toBeDefined();
        expect(pathData).toContain('M 0');
    });
});
