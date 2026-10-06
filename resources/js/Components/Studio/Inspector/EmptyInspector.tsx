import React from 'react';
import {
    Paper,
    Box,
    Typography,
    Button
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import { useStudioStore } from '../../../Stores/useStudioStore';

export const EmptyInspector: React.FC = () => {
    const { manifest, insertQuickCheckpoint } = useStudioStore();

    return (
        <Paper
            elevation={0}
            sx={{
                width: 300,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#0d1117',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                p: 2,
                overflowY: 'auto'
            }}
        >
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
                Inspector de Propiedades
            </Typography>

            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1, border: '1px solid rgba(255,255,255,0.06)', mb: 3 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                    {manifest?.metadata?.title || 'Lección Interactiva'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                    Disciplina: {manifest?.metadata?.discipline || 'Anatomía Humana'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                    Duración Estimada: {manifest?.pedagogy?.estimatedDurationSeconds || 120}s
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                    Nota Mínima Aprobatoria: {manifest?.pedagogy?.passingScore || 80}%
                </Typography>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                Selecciona un evento o rombo evaluativo en la línea de tiempo para inspeccionar y ajustar sus parámetros cinemáticos o pedagógicos.
            </Typography>

            <Button
                variant="outlined"
                color="error"
                startIcon={<QuizIcon />}
                onClick={insertQuickCheckpoint}
                fullWidth
                size="small"
                sx={{ py: 1 }}
            >
                Insertar Checkpoint (Ctrl+Q)
            </Button>
        </Paper>
    );
};
