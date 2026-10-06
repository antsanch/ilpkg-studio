import React from 'react';
import { Box, Typography } from '@mui/material';

interface TimelineRulerProps {
    duration: number;
    zoomLevel: number;
}

function formatTimecode(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({ duration, zoomLevel }) => {
    const totalSeconds = Math.ceil(duration) + 1;

    return (
        <Box sx={{ height: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
            {Array.from({ length: totalSeconds }).map((_, sec) => {
                if (sec % 5 === 0) {
                    return (
                        <Box
                            key={`ruler-sec-${sec}`}
                            sx={{
                                position: 'absolute',
                                left: sec * zoomLevel,
                                height: '100%',
                                borderLeft: '1px solid rgba(255,255,255,0.2)',
                                pl: 0.5
                            }}
                        >
                            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                                {formatTimecode(sec)}
                            </Typography>
                        </Box>
                    );
                }
                return (
                    <Box
                        key={`ruler-sub-${sec}`}
                        sx={{
                            position: 'absolute',
                            left: sec * zoomLevel,
                            bottom: 0,
                            height: 6,
                            borderLeft: '1px solid rgba(255,255,255,0.08)'
                        }}
                    />
                );
            })}
        </Box>
    );
};
