import React from 'react';
import {
    Box,
    Typography,
    IconButton,
    ButtonGroup,
    Button,
    Slider,
    Tooltip
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

interface TimelineTransportProps {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    playbackRate: number;
    zoomLevel: number;
    onTogglePlay: () => void;
    onStop: () => void;
    onSeekBy: (delta: number) => void;
    onSetPlaybackRate: (rate: number) => void;
    onSetZoomLevel: (zoom: number) => void;
}

function formatTimecode(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
}

export const TimelineTransport: React.FC<TimelineTransportProps> = ({
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    zoomLevel,
    onTogglePlay,
    onStop,
    onSeekBy,
    onSetPlaybackRate,
    onSetZoomLevel,
}) => {
    return (
        <Box
            sx={{
                px: 2,
                py: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                bgcolor: '#0d1117'
            }}
        >
            {/* Controles de Reproducción */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Rebobinar 1s (J)">
                    <IconButton size="small" onClick={() => onSeekBy(-1.0)}>
                        <FastRewindIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <IconButton
                    color="primary"
                    onClick={onTogglePlay}
                    sx={{ bgcolor: 'rgba(2, 136, 209, 0.1)', '&:hover': { bgcolor: 'rgba(2, 136, 209, 0.2)' } }}
                >
                    {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                </IconButton>

                <Tooltip title="Detener (K)">
                    <IconButton size="small" onClick={onStop}>
                        <StopIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Avanzar 1s (L)">
                    <IconButton size="small" onClick={() => onSeekBy(1.0)}>
                        <FastForwardIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                {/* Lector de Código de Tiempo */}
                <Box sx={{ ml: 2, px: 1.5, py: 0.3, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 1, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Typography variant="caption" sx={{ color: 'primary.light', fontWeight: 700, fontSize: '0.85rem' }}>
                        {formatTimecode(currentTime)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1, fontSize: '0.75rem' }}>
                        / {formatTimecode(duration)}
                    </Typography>
                </Box>
            </Box>

            {/* Control de Velocidad y Zoom */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ButtonGroup size="small" variant="text" sx={{ '& button': { px: 0.8, fontSize: '0.7rem' } }}>
                    {[0.5, 1.0, 1.5, 2.0].map((rate) => (
                        <Button
                            key={rate}
                            variant={playbackRate === rate ? 'contained' : 'text'}
                            onClick={() => onSetPlaybackRate(rate)}
                        >
                            {rate}x
                        </Button>
                    ))}
                </ButtonGroup>

                <Box sx={{ display: 'flex', alignItems: 'center', width: 140, gap: 1 }}>
                    <ZoomOutIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Slider
                        size="small"
                        value={zoomLevel}
                        min={15}
                        max={120}
                        onChange={(_, val) => onSetZoomLevel(val as number)}
                        sx={{ '& .MuiSlider-thumb': { width: 8, height: 8 } }}
                    />
                    <ZoomInIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Box>
            </Box>
        </Box>
    );
};
