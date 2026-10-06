import React, { useState, useRef } from 'react';
import {
    Box,
    Stack,
    Alert
} from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import axios from 'axios';
import { PlayerProps, PlayerCheckpointAnswer } from '../../types/ilpkg-player';
import { StaticAuditView } from './StaticAuditView';
import { CheckpointDialog } from './CheckpointDialog';
import { PlayerHud } from './PlayerHud';

const DEFAULT_HISTORICAL_ANSWERS: PlayerCheckpointAnswer[] = [];

export const InteractiveLessonPlayer: React.FC<PlayerProps> = ({
    lesson,
    release,
    attempt,
    historicalAnswers = DEFAULT_HISTORICAL_ANSWERS,
    latestActiveRelease,
}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [activeCheckpoint, setActiveCheckpoint] = useState<any | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const answeredCheckpoints = useRef<Set<string>>(new Set());

    // 1. Si los activos 3D fueron purgados, cargar Modo Auditoría Estática (2D)
    if (!release.has3dAssets) {
        return (
            <StaticAuditView
                lessonTitle={lesson.title}
                version={release.version}
                attempt={attempt}
                answers={historicalAnswers}
                isTombstoned={lesson.isDeleted}
            />
        );
    }

    const duration = release.lessonData?.timeline?.duration || 120;
    const checkpoints = release.lessonData?.timeline?.checkpoints || [];

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        const t = audioRef.current.currentTime;
        setCurrentTime(t);

        // Bloqueo y detención ante Checkpoints pedagógicos si no se ha aprobado
        if (!attempt?.passed) {
            const hit = checkpoints.find(
                (chk: any) => Math.abs(chk.timestamp - t) < 0.35 && !answeredCheckpoints.current.has(chk.id)
            );

            if (hit) {
                audioRef.current.pause();
                setIsPlaying(false);
                setActiveCheckpoint(hit);
            }
        }
    };

    const handleOptionSubmit = async () => {
        if (!activeCheckpoint || !selectedOption) return;

        const opt = activeCheckpoint.options?.find((o: any) => o.id === selectedOption);
        const isCorrect = !!opt?.isCorrect;

        try {
            await axios.post(`/checkpoints/${activeCheckpoint.id}/respond`, {
                lesson_package_release_id: release.id,
                attempt_id: attempt?.id,
                selected_option_id: selectedOption,
            });
        } catch {
            // Modo simulación local offline fallback
        }

        answeredCheckpoints.current.add(activeCheckpoint.id);
        setActiveCheckpoint(null);
        setSelectedOption(null);

        if (isCorrect) {
            audioRef.current?.play();
            setIsPlaying(true);
        } else {
            // Ejecutar Rebobinado Pedagógico
            if (audioRef.current && activeCheckpoint.rewindTimestamp !== undefined) {
                audioRef.current.currentTime = activeCheckpoint.rewindTimestamp;
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const handleTogglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <Box sx={{ position: 'relative', width: '100vw', height: '100vh', bgcolor: '#08090c', overflow: 'hidden' }}>
            {/* Audio Maestro con caption track para accesibilidad */}
            <audio
                ref={audioRef}
                src="/audio/narration.wav"
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
            >
                <track kind="captions" />
            </audio>

            {/* Banners Superiores de Resiliencia */}
            <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 30, pointerEvents: 'none' }}>
                <Stack spacing={1} sx={{ pointerEvents: 'auto', maxWidth: 850, mx: 'auto' }}>
                    {lesson.isDeleted && (
                        <Alert severity="warning" variant="filled">
                            <strong>Lección Retirada:</strong> Este contenido fue despublicado del catálogo activo.
                            Estás visualizando una réplica histórica de consulta.
                        </Alert>
                    )}

                    {release.status === 'deprecated' && latestActiveRelease && (
                        <Alert severity="info" variant="filled">
                            Estás consultando tu intento bajo la versión <strong>v{release.version}</strong>. Existe una versión más reciente.
                        </Alert>
                    )}
                </Stack>
            </Box>

            {/* Viewport 3D */}
            <Canvas camera={{ position: [0, 1.5, 4], fov: 45 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 10, 10]} intensity={1.2} />
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="#0288d1" roughness={0.3} metalness={0.2} />
                </mesh>
                <OrbitControls makeDefault />
            </Canvas>

            {/* Modal de Checkpoint Evaluativo */}
            <CheckpointDialog
                open={Boolean(activeCheckpoint)}
                checkpoint={activeCheckpoint}
                selectedOption={selectedOption}
                onOptionChange={setSelectedOption}
                onSubmit={handleOptionSubmit}
            />

            {/* Barra HUD Inferior de Transporte */}
            <PlayerHud
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                checkpoints={checkpoints}
                answeredCheckpointIds={answeredCheckpoints.current}
                attemptPassed={attempt?.passed}
                onTogglePlay={handleTogglePlay}
            />
        </Box>
    );
};
