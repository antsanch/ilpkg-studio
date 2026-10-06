import React from 'react';
import { Box, Typography } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import LayersIcon from '@mui/icons-material/Layers';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import QuizIcon from '@mui/icons-material/Quiz';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';

export const TimelineTrackHeaders: React.FC = () => {
    return (
        <Box
            sx={{
                width: 140,
                flexShrink: 0,
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                bgcolor: '#0e1117',
                zIndex: 5,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box sx={{ height: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', px: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>TIEMPO</Typography>
            </Box>
            <Box sx={{ height: 32, borderBottom: '1px solid rgba(255,255,255,0.06)', px: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AudiotrackIcon sx={{ fontSize: 12, color: 'info.main' }} />
                <Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Master Audio</Typography>
            </Box>
            <Box sx={{ height: 28, borderBottom: '1px solid rgba(255,255,255,0.06)', px: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VideocamIcon sx={{ fontSize: 12, color: 'primary.main' }} />
                <Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Cámara</Typography>
            </Box>
            <Box sx={{ height: 28, borderBottom: '1px solid rgba(255,255,255,0.06)', px: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LayersIcon sx={{ fontSize: 12, color: 'secondary.main' }} />
                <Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Anatomía</Typography>
            </Box>
            <Box sx={{ height: 28, borderBottom: '1px solid rgba(255,255,255,0.06)', px: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SlideshowIcon sx={{ fontSize: 12, color: 'warning.main' }} />
                <Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Diapositivas</Typography>
            </Box>
            <Box sx={{ height: 28, px: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <QuizIcon sx={{ fontSize: 12, color: 'error.main' }} />
                <Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Checkpoints</Typography>
            </Box>
        </Box>
    );
};
