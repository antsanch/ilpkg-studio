import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { studioTheme } from '../../Theme/studioTheme';
import { InteractiveLessonPlayer as PlayerComponent } from '../../Components/Player/InteractiveLessonPlayer';
import { PlayerProps } from '../../types/ilpkg-player';

export default function InteractiveLessonPlayerPage(props: PlayerProps) {
    return (
        <ThemeProvider theme={studioTheme}>
            <CssBaseline />
            <PlayerComponent {...props} />
        </ThemeProvider>
    );
}
