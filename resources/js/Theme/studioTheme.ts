import { createTheme } from '@mui/material/styles';

export const studioTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#0288d1',
            light: '#38bdf8',
            dark: '#0369a1',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#00e676',
            light: '#69f0ae',
            dark: '#00c853',
            contrastText: '#000000',
        },
        error: {
            main: '#ff1744',
            light: '#ff5252',
            dark: '#d50000',
        },
        warning: {
            main: '#ffb74d',
            light: '#ffe082',
            dark: '#f57c00',
        },
        info: {
            main: '#38bdf8',
            light: '#7dd3fc',
            dark: '#0284c7',
        },
        success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
        },
        background: {
            default: '#08090c',
            paper: '#12151c',
        },
        text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
            disabled: '#475569',
        },
        divider: 'rgba(255, 255, 255, 0.08)',
        action: {
            hover: 'rgba(255, 255, 255, 0.05)',
            selected: 'rgba(2, 136, 209, 0.16)',
            disabled: 'rgba(255, 255, 255, 0.3)',
        },
    },
    typography: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        h5: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h6: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
        },
        subtitle1: {
            fontWeight: 500,
        },
        subtitle2: {
            fontWeight: 600,
            fontSize: '0.8125rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
        },
        body1: {
            fontSize: '0.875rem',
        },
        body2: {
            fontSize: '0.8125rem',
        },
        caption: {
            fontFamily: "'Roboto Mono', monospace",
            fontSize: '0.75rem',
        },
        overline: {
            fontFamily: "'Roboto Mono', monospace",
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: 'rgba(148, 163, 184, 0.3) rgba(15, 23, 42, 0.6)',
                    '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                        width: 6,
                        height: 6,
                    },
                    '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                        borderRadius: 3,
                        backgroundColor: 'rgba(148, 163, 184, 0.3)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 6,
                },
            },
        },
        MuiSlider: {
            styleOverrides: {
                root: {
                    padding: '8px 0',
                },
                thumb: {
                    width: 12,
                    height: 12,
                    '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0 0 0 6px rgba(2, 136, 209, 0.16)',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    fontSize: '0.75rem',
                },
            },
        },
    },
});
