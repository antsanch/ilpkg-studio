import React from 'react';
import {
    Paper,
    Box,
    Typography,
    IconButton,
    Stack,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Button
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useStudioStore } from '../../../Stores/useStudioStore';

interface CameraEventInspectorProps {
    event: any;
}

export const CameraEventInspector: React.FC<CameraEventInspectorProps> = ({ event }) => {
    const {
        updateTimelineEvent,
        deleteTimelineEvent,
        setCameraPose
    } = useStudioStore();

    const payload = event.payload || {};
    const pos = payload.position || [0, 0, 0];
    const target = payload.target || [0, 0, 0];

    return (
        <Paper
            elevation={0}
            sx={{
                width: 320,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#0d1117',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                p: 2,
                overflowY: 'auto'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VideocamIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={700}>
                        Evento de Cámara
                    </Typography>
                </Box>
                <IconButton size="small" color="error" onClick={() => deleteTimelineEvent(event.id)}>
                    <DeleteOutlineIcon fontSize="small" />
                </IconButton>
            </Box>

            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2 }}>
                ID: {event.id} | Timestamp: {event.timestamp}s
            </Typography>

            <Stack spacing={2}>
                <TextField
                    size="small"
                    label="Timestamp (segundos)"
                    type="number"
                    value={event.timestamp}
                    onChange={(e) => updateTimelineEvent(event.id, { timestamp: parseFloat(e.target.value) || 0 })}
                />

                <TextField
                    size="small"
                    label="Duración de Interpolación (s)"
                    type="number"
                    value={payload.duration ?? 2.0}
                    onChange={(e) => updateTimelineEvent(event.id, {
                        payload: { ...payload, duration: parseFloat(e.target.value) || 0 }
                    })}
                />

                <FormControl size="small">
                    <InputLabel>Curva de Movimiento (Easing)</InputLabel>
                    <Select
                        value={payload.easing || 'power2.inOut'}
                        label="Curva de Movimiento (Easing)"
                        onChange={(e) => updateTimelineEvent(event.id, {
                            payload: { ...payload, easing: e.target.value }
                        })}
                    >
                        <MenuItem value="linear">Lineal (Velocidad Constante)</MenuItem>
                        <MenuItem value="power2.inOut">power2.inOut (Aceleración y Frenado Suave)</MenuItem>
                        <MenuItem value="power3.out">power3.out (Desaceleración Intensa)</MenuItem>
                        <MenuItem value="sine.inOut">sine.inOut (Armónico Natural)</MenuItem>
                    </Select>
                </FormControl>

                <Divider sx={{ my: 1 }} />

                <Typography variant="caption" fontWeight={600} color="text.secondary">
                    Coordenadas de Posición Virtual [X, Y, Z]
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        size="small"
                        label="X"
                        type="number"
                        value={pos[0]}
                        onChange={(e) => {
                            const newPos = [parseFloat(e.target.value) || 0, pos[1], pos[2]];
                            updateTimelineEvent(event.id, { payload: { ...payload, position: newPos } });
                        }}
                    />
                    <TextField
                        size="small"
                        label="Y"
                        type="number"
                        value={pos[1]}
                        onChange={(e) => {
                            const newPos = [pos[0], parseFloat(e.target.value) || 0, pos[2]];
                            updateTimelineEvent(event.id, { payload: { ...payload, position: newPos } });
                        }}
                    />
                    <TextField
                        size="small"
                        label="Z"
                        type="number"
                        value={pos[2]}
                        onChange={(e) => {
                            const newPos = [pos[0], pos[1], parseFloat(e.target.value) || 0];
                            updateTimelineEvent(event.id, { payload: { ...payload, position: newPos } });
                        }}
                    />
                </Box>

                <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<MyLocationIcon />}
                    onClick={() => setCameraPose({ position: pos, target })}
                    sx={{ mt: 1 }}
                >
                    Teletransportar Cámara a esta Pose
                </Button>
            </Stack>
        </Paper>
    );
};
