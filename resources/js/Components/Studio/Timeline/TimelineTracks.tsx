import React from 'react';
import { Box, Typography } from '@mui/material';

interface TimelineTracksProps {
    totalWidth: number;
    zoomLevel: number;
    lesson: any;
    selectedEventId: string | null;
    selectedCheckpointId: string | null;
    currentTime: number;
    onSelectEvent: (id: string) => void;
    onSelectCheckpoint: (id: string) => void;
}

export const TimelineTracks: React.FC<TimelineTracksProps> = ({
    totalWidth,
    zoomLevel,
    lesson,
    selectedEventId,
    selectedCheckpointId,
    currentTime,
    onSelectEvent,
    onSelectCheckpoint,
}) => {
    return (
        <>
            {/* Pista 1: Master Audio Waveform Visualizador Simulado / Ondas */}
            <Box sx={{ height: 32, borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <svg width={totalWidth} height="28" style={{ opacity: 0.7 }}>
                    <path
                        d={Array.from({ length: Math.floor(totalWidth / 4) }).map((_, i) => {
                            const x = i * 4;
                            const t = x / zoomLevel;
                            const amp = [12, 13, 14].includes(Math.floor(t) % 15) ? 2 : (8 + Math.sin(t * 3) * 6);
                            return `M ${x} ${14 - amp} L ${x} ${14 + amp}`;
                        }).join(' ')}
                        stroke="#38bdf8"
                        strokeWidth="2"
                    />
                </svg>
            </Box>

            {/* Pista 2: Pista de Cámara */}
            <Box sx={{ height: 28, borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
                {lesson?.timeline?.events?.filter((e: any) => e.type === 'camera_transform').map((evt: any) => {
                    const left = evt.timestamp * zoomLevel;
                    const width = Math.max(12, (evt.payload?.duration || 0) * zoomLevel);
                    const isSelected = selectedEventId === evt.id;

                    return (
                        <Box
                            key={evt.id}
                            onClick={(e) => { e.stopPropagation(); onSelectEvent(evt.id); }}
                            sx={{
                                position: 'absolute',
                                left,
                                width,
                                height: 20,
                                top: 4,
                                bgcolor: isSelected ? 'primary.main' : 'rgba(2, 136, 209, 0.45)',
                                border: '1px solid #38bdf8',
                                borderRadius: '3px',
                                px: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                overflow: 'hidden',
                                cursor: 'pointer'
                            }}
                        >
                            <Typography variant="caption" noWrap sx={{ fontSize: '0.62rem', color: '#fff', fontWeight: 600 }}>
                                {evt.payload?.duration ? `${evt.payload.duration}s` : 'Pose'}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {/* Pista 3: Pista de Mallas / Anatomía */}
            <Box sx={{ height: 28, borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
                {lesson?.timeline?.events?.filter((e: any) => ['mesh_opacity', 'mesh_visibility', 'mesh_highlight'].includes(e.type)).map((evt: any) => {
                    const left = evt.timestamp * zoomLevel;
                    const isSelected = selectedEventId === evt.id;

                    return (
                        <Box
                            key={evt.id}
                            onClick={(e) => { e.stopPropagation(); onSelectEvent(evt.id); }}
                            sx={{
                                position: 'absolute',
                                left,
                                width: 14,
                                height: 18,
                                top: 5,
                                transform: 'translateX(-50%)',
                                bgcolor: isSelected ? 'secondary.main' : 'rgba(0, 230, 118, 0.45)',
                                border: '1px solid #69f0ae',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}
                        />
                    );
                })}
            </Box>

            {/* Pista 4: Diapositivas */}
            <Box sx={{ height: 28, borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
                {lesson?.timeline?.events?.filter((e: any) => e.type === 'slide_display').map((evt: any) => {
                    const left = evt.timestamp * zoomLevel;
                    const width = (evt.payload?.duration || 10) * zoomLevel;
                    const isSelected = selectedEventId === evt.id;

                    return (
                        <Box
                            key={evt.id}
                            onClick={(e) => { e.stopPropagation(); onSelectEvent(evt.id); }}
                            sx={{
                                position: 'absolute',
                                left,
                                width,
                                height: 20,
                                top: 4,
                                bgcolor: isSelected ? 'warning.main' : 'rgba(255, 183, 77, 0.35)',
                                border: '1px solid #ffb74d',
                                borderRadius: '3px',
                                px: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <Typography variant="caption" noWrap sx={{ fontSize: '0.6rem', color: '#fff' }}>
                                Slide
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {/* Pista 5: Checkpoints con Conector a rewindTimestamp */}
            <Box sx={{ height: 28, position: 'relative' }}>
                {lesson?.timeline?.checkpoints?.map((chk: any) => {
                    const left = chk.timestamp * zoomLevel;
                    const rewindLeft = (chk.rewindTimestamp ?? chk.timestamp) * zoomLevel;
                    const isSelected = selectedCheckpointId === chk.id;

                    return (
                        <React.Fragment key={chk.id}>
                            {/* Línea conectora hacia atrás */}
                            {chk.rewindTimestamp !== undefined && chk.rewindTimestamp < chk.timestamp && (
                                <svg
                                    style={{
                                        position: 'absolute',
                                        left: rewindLeft,
                                        width: left - rewindLeft,
                                        height: 28,
                                        pointerEvents: 'none'
                                    }}
                                >
                                    <line
                                        x1="0"
                                        y1="14"
                                        x2={left - rewindLeft}
                                        y2="14"
                                        stroke="#ff1744"
                                        strokeDasharray="3 3"
                                        strokeWidth="1.5"
                                    />
                                    <circle cx="0" cy="14" r="3" fill="#ff1744" />
                                </svg>
                            )}

                            {/* Rombo Evaluativo */}
                            <Box
                                onClick={(e) => { e.stopPropagation(); onSelectCheckpoint(chk.id); }}
                                sx={{
                                    position: 'absolute',
                                    left,
                                    top: 6,
                                    width: 16,
                                    height: 16,
                                    transform: 'translateX(-50%) rotate(45deg)',
                                    bgcolor: isSelected ? '#ff1744' : 'rgba(255, 23, 68, 0.75)',
                                    border: '2px solid #fff',
                                    boxShadow: isSelected ? '0 0 8px #ff1744' : 'none',
                                    cursor: 'pointer',
                                    zIndex: 2
                                }}
                            />
                        </React.Fragment>
                    );
                })}
            </Box>

            {/* Aguja de Reproducción Maestra (Playhead) */}
            <Box
                sx={{
                    position: 'absolute',
                    left: currentTime * zoomLevel,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    bgcolor: '#ef4444',
                    zIndex: 10,
                    pointerEvents: 'none',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: -5,
                        width: 12,
                        height: 12,
                        bgcolor: '#ef4444',
                        clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                    }
                }}
            />
        </>
    );
};
