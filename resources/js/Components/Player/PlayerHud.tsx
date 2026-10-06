import React from 'react';
import {
    Paper,
    Stack,
    IconButton,
    Box,
    LinearProgress,
    Typography
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import LockIcon from '@mui/icons-material/Lock';

interface PlayerHudProps {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    checkpoints: any[];
    answeredCheckpointIds: Set<string>;
    attemptPassed?: boolean;
    onTogglePlay: () => void;
}

export const PlayerHud: React.FC<PlayerHudProps> = ({
    isPlaying,
    currentTime,
    duration,
    checkpoints,
    answeredCheckpointIds,
    attemptPassed,
    onTogglePlay,
}) => {
    return (
        <Paper
            elevation={8}
            sx={{
                position: 'absolute',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                maxWidth: 820,
                p: 1.5,
                bgcolor: 'rgba(18, 21, 28, 0.92)',
                backdropFilter: 'blur(12px)',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.12)',
                zIndex: 20
            }}
        >
            <Stack direction="row" alignItems="center" spacing={2}>
                <IconButton
                    color="primary"
                    onClick={onTogglePlay}
                >
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>

                <Box sx={{ flexGrow: 1, position: 'relative' }}>
                    <LinearProgress
                        variant="determinate"
                        value={duration > 0 ? (currentTime / duration) * 100 : 0}
                        sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)' }}
                    />
                    {/* Marcadores de Checkpoints sobre la barra */}
                    {checkpoints.map((cp: any) => {
                        const leftPercent = duration > 0 ? (cp.timestamp / duration) * 100 : 0;
                        const isPassed = answeredCheckpointIds.has(cp.id) || attemptPassed;
                        const key = cp.id ? `hud-cp-${cp.id}` : `hud-cp-${cp.timestamp}`;

                        return (
                            <Box
                                key={key}
                                sx={{
                                    position: 'absolute',
                                    left: `${leftPercent}%`,
                                    top: -4,
                                    transform: 'translateX(-50%)',
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    bgcolor: isPassed ? 'success.main' : 'error.main',
                                    border: '2px solid #12151c',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {!isPassed && <LockIcon sx={{ fontSize: 9, color: '#fff' }} />}
                            </Box>
                        );
                    })}
                </Box>

                <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 90, textAlign: 'right' }}>
                    {new Date(currentTime * 1000).toISOString().substring(14, 19)} /{' '}
                    {new Date(duration * 1000).toISOString().substring(14, 19)}
                </Typography>
            </Stack>
        </Paper>
    );
};
