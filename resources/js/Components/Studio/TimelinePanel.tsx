import React, { useRef, useEffect } from 'react';
import { Paper, Box } from '@mui/material';
import { useStudioStore } from '../../Stores/useStudioStore';
import { TimelineTransport } from './Timeline/TimelineTransport';
import { TimelineTrackHeaders } from './Timeline/TimelineTrackHeaders';
import { TimelineRuler } from './Timeline/TimelineRuler';
import { TimelineTracks } from './Timeline/TimelineTracks';

export const TimelinePanel: React.FC = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const tracksContainerRef = useRef<HTMLDivElement | null>(null);

    const {
        currentTime,
        duration,
        isPlaying,
        playbackRate,
        zoomLevel,
        audioBlobUrl,
        lesson,
        selectedEventId,
        selectedCheckpointId,
        setCurrentTime,
        setIsPlaying,
        setPlaybackRate,
        setZoomLevel,
        seekBy,
        setSelectedEventId,
        setSelectedCheckpointId,
        captureCameraPose,
        captureMeshKeyframe,
        insertQuickCheckpoint,
        undo,
        activeEditorMode,
        setActiveEditorMode
    } = useStudioStore();

    // Sincronización del Audio Maestro con el Store
    useEffect(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.playbackRate = playbackRate;
            audioRef.current.play().catch(() => {});
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, playbackRate]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    // Atajos de Teclado Profesionales (DAW Keybindings)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
                return;
            }

            if (e.code === 'Space') {
                e.preventDefault();
                setIsPlaying(!isPlaying);
            } else if (e.key === 'j' || e.key === 'J') {
                seekBy(-1.0);
            } else if (e.key === 'k' || e.key === 'K') {
                setIsPlaying(false);
            } else if (e.key === 'l' || e.key === 'L') {
                seekBy(1.0);
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                captureCameraPose();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'm' || e.key === 'M')) {
                e.preventDefault();
                captureMeshKeyframe();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) {
                e.preventDefault();
                insertQuickCheckpoint();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault();
                undo();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                setActiveEditorMode(activeEditorMode === 'edit' ? 'preview' : 'edit');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        isPlaying,
        currentTime,
        duration,
        activeEditorMode,
        setIsPlaying,
        seekBy,
        captureCameraPose,
        captureMeshKeyframe,
        insertQuickCheckpoint,
        undo,
        setActiveEditorMode
    ]);

    const totalWidth = duration * zoomLevel;

    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newTime = Math.max(0, Math.min(clickX / zoomLevel, duration));
        setCurrentTime(newTime);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
    };

    // Seguir el cabezal de reproducción si sale del área visible durante la reproducción activa
    useEffect(() => {
        if (!isPlaying || !tracksContainerRef.current) return;
        const playheadX = currentTime * zoomLevel;
        const container = tracksContainerRef.current;
        const scrollLeft = container.scrollLeft;
        const clientWidth = container.clientWidth;
        if (playheadX > scrollLeft + clientWidth - 50) {
            container.scrollLeft = playheadX - 100;
        } else if (playheadX < scrollLeft) {
            container.scrollLeft = Math.max(0, playheadX - 50);
        }
    }, [currentTime, isPlaying, zoomLevel]);

    return (
        <Paper
            elevation={0}
            sx={{
                height: 220,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#0a0c10',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                zIndex: 10
            }}
        >
            {/* Audio nativo para sincronía del Master Clock */}
            <audio
                ref={audioRef}
                src={audioBlobUrl || '/audio/dummy.wav'}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
            >
                <track kind="captions" />
            </audio>

            {/* Barra Superior de Transporte y Reloj */}
            <TimelineTransport
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                playbackRate={playbackRate}
                zoomLevel={zoomLevel}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                onStop={() => { setIsPlaying(false); setCurrentTime(0); }}
                onSeekBy={seekBy}
                onSetPlaybackRate={setPlaybackRate}
                onSetZoomLevel={setZoomLevel}
            />

            {/* Contenedor Principal: Headers Fijos a la izquierda + Pistas Desplazables */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    overflow: 'hidden',
                    position: 'relative',
                    userSelect: 'none'
                }}
            >
                {/* Cabecera Fija de Nombres de Pistas (Inmóvil) */}
                <TimelineTrackHeaders />

                {/* Contenedor con Scroll Horizontal Exclusivo para las Pistas */}
                <Box
                    ref={tracksContainerRef}
                    sx={{
                        flex: 1,
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        position: 'relative',
                        '&::-webkit-scrollbar': { height: 6 },
                        '&::-webkit-scrollbar-track': { bgcolor: 'rgba(0,0,0,0.3)' },
                        '&::-webkit-scrollbar-thumb': {
                            bgcolor: 'rgba(255,255,255,0.15)',
                            borderRadius: 3,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                        }
                    }}
                >
                    {/* Lienzo de Pistas Desplazable */}
                    <Box
                        onClick={handleTrackClick}
                        sx={{
                            width: totalWidth,
                            minWidth: '100%',
                            position: 'relative',
                            bgcolor: 'rgba(0,0,0,0.2)',
                            cursor: 'crosshair',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Pista 0: Regla Temporal */}
                        <TimelineRuler duration={duration} zoomLevel={zoomLevel} />

                        {/* Pistas de Contenido y Marcadores */}
                        <TimelineTracks
                            totalWidth={totalWidth}
                            zoomLevel={zoomLevel}
                            lesson={lesson}
                            selectedEventId={selectedEventId}
                            selectedCheckpointId={selectedCheckpointId}
                            currentTime={currentTime}
                            onSelectEvent={setSelectedEventId}
                            onSelectCheckpoint={setSelectedCheckpointId}
                        />
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
};
