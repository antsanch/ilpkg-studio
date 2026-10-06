import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Stack,
    Chip,
    Divider,
    Alert
} from '@mui/material';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { PlayerCheckpointAnswer } from '../../types/ilpkg-player';

interface StaticAuditViewProps {
    lessonTitle: string;
    version: string;
    attempt?: any;
    answers?: PlayerCheckpointAnswer[];
    isTombstoned?: boolean;
}

const DEFAULT_ANSWERS: PlayerCheckpointAnswer[] = [];

export const StaticAuditView: React.FC<StaticAuditViewProps> = ({
    lessonTitle,
    version,
    attempt,
    answers = DEFAULT_ANSWERS,
    isTombstoned = false,
}) => {
    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', p: 4, color: 'text.primary', minHeight: '100vh' }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, borderLeft: '6px solid #0288d1', bgcolor: '#12151c' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <div>
                        <Typography variant="overline" color="text.secondary">
                            Expediente Académico y Auditoría Histórica
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                            {lessonTitle}
                        </Typography>
                    </div>
                    <Chip
                        label={`Versión Evaluada: v${version}`}
                        color="info"
                        variant="outlined"
                        icon={<HistoryEduIcon />}
                    />
                </Stack>

                {isTombstoned && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Esta lección ha sido retirada del plan curricular activo por el docente. Su calificación y respuestas
                        permanecen inmutables en su historial académico.
                    </Alert>
                )}

                {attempt && (
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 2.5, borderRadius: 2, mb: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Calificación Obtenida</Typography>
                                <Typography variant="h5" fontWeight="bold" color={attempt.passed ? 'success.main' : 'error.main'}>
                                    {attempt.scoreObtained} / {attempt.maxScore} ({attempt.percentage}%)
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Resultado Oficial</Typography>
                                <Typography variant="h6">
                                    {attempt.passed ? 'Acreditado' : 'No Acreditado'}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Fecha de Finalización</Typography>
                                <Typography variant="body1">{attempt.completedAt || 'Sin registro'}</Typography>
                            </Box>
                        </Stack>
                    </Box>
                )}

                <Typography variant="h6" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
                    Desglose de Reactivos Evaluados (Snapshot Inmutable)
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Stack spacing={3}>
                    {answers.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            No hay respuestas registradas para este expediente.
                        </Typography>
                    ) : (
                        answers.map((ans) => (
                            <Paper key={`ans-${ans.checkpointId}`} variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="subtitle2" color="primary">
                                        Reactivo ({ans.checkpointId})
                                    </Typography>
                                    <Chip
                                        size="small"
                                        icon={ans.isCorrect ? <CheckCircleIcon /> : <CancelIcon />}
                                        label={ans.isCorrect ? `+${ans.pointsAwarded} pts` : '0 pts'}
                                        color={ans.isCorrect ? 'success' : 'error'}
                                    />
                                </Stack>
                                <Typography variant="body1" fontWeight="500" gutterBottom>
                                    {ans.promptSnapshot}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    <strong>Respuesta registrada:</strong> {ans.selectedOptionText || 'Sin respuesta seleccionada'}
                                </Typography>
                            </Paper>
                        ))
                    )}
                </Stack>
            </Paper>
        </Box>
    );
};
