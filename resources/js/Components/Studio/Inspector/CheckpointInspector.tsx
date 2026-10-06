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
    Button,
    Tooltip,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import HistoryIcon from '@mui/icons-material/History';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useStudioStore } from '../../../Stores/useStudioStore';

interface CheckpointInspectorProps {
    checkpoint: any;
}

export const CheckpointInspector: React.FC<CheckpointInspectorProps> = ({ checkpoint }) => {
    const {
        currentTime,
        updateCheckpoint,
        deleteCheckpoint,
        loadedStructures
    } = useStudioStore();

    return (
        <Paper
            elevation={0}
            sx={{
                width: 340,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#0d1117',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                p: 2,
                overflowY: 'auto'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <QuizIcon color="error" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={700}>
                        Checkpoint Evaluativo
                    </Typography>
                </Box>
                <IconButton size="small" color="error" onClick={() => deleteCheckpoint(checkpoint.id)}>
                    <DeleteOutlineIcon fontSize="small" />
                </IconButton>
            </Box>

            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2 }}>
                ID: {checkpoint.id}
            </Typography>

            <Stack spacing={2}>
                <TextField
                    size="small"
                    label="Título del Reactivo"
                    value={checkpoint.title || ''}
                    onChange={(e) => updateCheckpoint(checkpoint.id, { title: e.target.value })}
                />

                <FormControl size="small">
                    <InputLabel>Tipo de Pregunta</InputLabel>
                    <Select
                        value={checkpoint.questionType}
                        label="Tipo de Pregunta"
                        onChange={(e) => updateCheckpoint(checkpoint.id, { questionType: e.target.value as any })}
                    >
                        <MenuItem value="single_choice">Opción Múltiple (Respuesta Única)</MenuItem>
                        <MenuItem value="multiple_choice">Selección Múltiple (Varias Respuestas)</MenuItem>
                        <MenuItem value="mesh_click">Identificación por Clic en Malla 3D</MenuItem>
                        <MenuItem value="boolean">Verdadero / Falso</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    size="small"
                    label="Enunciado / Planteamiento Clínico"
                    multiline
                    rows={3}
                    value={checkpoint.prompt || ''}
                    onChange={(e) => updateCheckpoint(checkpoint.id, { prompt: e.target.value })}
                />

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        size="small"
                        label="Puntos (pts)"
                        type="number"
                        value={checkpoint.points || 10}
                        onChange={(e) => updateCheckpoint(checkpoint.id, { points: parseInt(e.target.value) || 0 })}
                        sx={{ width: '40%' }}
                    />

                    <TextField
                        size="small"
                        label="Timestamp (s)"
                        type="number"
                        value={checkpoint.timestamp}
                        onChange={(e) => updateCheckpoint(checkpoint.id, { timestamp: parseFloat(e.target.value) || 0 })}
                        sx={{ width: '60%' }}
                    />
                </Box>

                {/* Rebobinado Pedagógico */}
                <Box sx={{ p: 1.5, bgcolor: 'rgba(255,23,68,0.06)', borderRadius: 1, border: '1px solid rgba(255,23,68,0.2)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <HistoryIcon sx={{ fontSize: 16, color: 'error.main' }} />
                            <Typography variant="caption" fontWeight={700} color="error.light">
                                Rebobinado Pedagógico
                            </Typography>
                        </Box>
                        <Tooltip title="Fijar en el segundo exacto del cabezal de reproducción">
                            <Button
                                size="small"
                                variant="text"
                                color="error"
                                onClick={() => updateCheckpoint(checkpoint.id, { rewindTimestamp: parseFloat(currentTime.toFixed(2)) })}
                                sx={{ fontSize: '0.68rem', py: 0 }}
                            >
                                Fijar Actual
                            </Button>
                        </Tooltip>
                    </Box>
                    <TextField
                        size="small"
                        label="Segundo de retorno al fallar"
                        type="number"
                        fullWidth
                        value={checkpoint.rewindTimestamp ?? 0}
                        onChange={(e) => updateCheckpoint(checkpoint.id, { rewindTimestamp: parseFloat(e.target.value) || 0 })}
                    />
                </Box>

                {/* Si es mesh_click: Selector de malla objetivo */}
                {checkpoint.questionType === 'mesh_click' && (
                    <FormControl size="small" fullWidth>
                        <InputLabel>Malla Anatómica Correcta</InputLabel>
                        <Select
                            value={checkpoint.targetMesh?.structureName || ''}
                            label="Malla Anatómica Correcta"
                            onChange={(e) => updateCheckpoint(checkpoint.id, {
                                targetMesh: {
                                    modelId: 'pterygoid_fossa_main',
                                    structureName: e.target.value
                                }
                            })}
                        >
                            {loadedStructures.map((name) => (
                                <MenuItem key={name} value={name}>{name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {/* Si es opción múltiple: Editor de alternativas */}
                {(checkpoint.questionType === 'single_choice' || checkpoint.questionType === 'multiple_choice') && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">
                                Opciones y Retroalimentación
                            </Typography>
                            <Button
                                size="small"
                                startIcon={<AddCircleOutlineIcon />}
                                onClick={() => {
                                    const currentOpts = checkpoint.options || [];
                                    const newOpt = {
                                        id: `opt_${Date.now()}`,
                                        text: `Nueva Opción ${currentOpts.length + 1}`,
                                        isCorrect: false,
                                        feedback: 'Retroalimentación explicativa...'
                                    };
                                    updateCheckpoint(checkpoint.id, { options: [...currentOpts, newOpt] });
                                }}
                                sx={{ fontSize: '0.7rem' }}
                            >
                                Añadir
                            </Button>
                        </Box>

                        <Stack spacing={1.5}>
                            {checkpoint.options?.map((opt: any, idx: number) => (
                                <Box key={opt.id} sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1, border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    color="success"
                                                    checked={opt.isCorrect}
                                                    onChange={(e) => {
                                                        const updated = checkpoint.options?.map((o: any) =>
                                                            o.id === opt.id ? { ...o, isCorrect: e.target.checked } : o
                                                        );
                                                        updateCheckpoint(checkpoint.id, { options: updated });
                                                    }}
                                                />
                                            }
                                            label={<Typography variant="caption">Correcta</Typography>}
                                        />
                                        <IconButton
                                            size="small"
                                            color="default"
                                            onClick={() => {
                                                const updated = checkpoint.options?.filter((o: any) => o.id !== opt.id);
                                                updateCheckpoint(checkpoint.id, { options: updated });
                                            }}
                                        >
                                            <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    </Box>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        label={`Opción #${idx + 1}`}
                                        value={opt.text}
                                        onChange={(e) => {
                                            const updated = checkpoint.options?.map((o: any) =>
                                                o.id === opt.id ? { ...o, text: e.target.value } : o
                                            );
                                            updateCheckpoint(checkpoint.id, { options: updated });
                                        }}
                                        sx={{ mb: 1 }}
                                    />
                                    <TextField
                                        size="small"
                                        fullWidth
                                        label="Feedback Clínico"
                                        value={opt.feedback || ''}
                                        onChange={(e) => {
                                            const updated = checkpoint.options?.map((o: any) =>
                                                o.id === opt.id ? { ...o, feedback: e.target.value } : o
                                            );
                                            updateCheckpoint(checkpoint.id, { options: updated });
                                        }}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                )}
            </Stack>
        </Paper>
    );
};
