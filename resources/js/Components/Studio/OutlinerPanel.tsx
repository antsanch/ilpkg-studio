import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Slider,
    Button,
    Tooltip,
    Divider,
    Checkbox
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import HighlightIcon from '@mui/icons-material/Highlight';
import KeyframeIcon from '@mui/icons-material/BookmarkAdd';
import { useStudioStore } from '../../Stores/useStudioStore';

export const OutlinerPanel: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const {
        loadedStructures,
        meshStates,
        selectedMeshNames,
        toggleMeshSelection,
        setSelectedMeshNames,
        setMeshState,
        captureMeshKeyframe
    } = useStudioStore();

    const filteredStructures = loadedStructures.filter((name) =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectAll = () => {
        if (selectedMeshNames.length === loadedStructures.length) {
            setSelectedMeshNames([]);
        } else {
            setSelectedMeshNames([...loadedStructures]);
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                width: 280,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#0d1117',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden'
            }}
        >
            {/* Header del Outliner */}
            <Box sx={{ p: 1.5, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        Estructuras Anatómicas
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'primary.light' }}>
                        {loadedStructures.length} nodos
                    </Typography>
                </Box>

                {/* Buscador Semántico */}
                <TextField
                    size="small"
                    placeholder="Filtrar malla (ej: maxilla)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            sx: {
                                height: 30,
                                fontSize: '0.8rem',
                                bgcolor: 'rgba(255,255,255,0.03)',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' }
                            }
                        }
                    }}
                />
            </Box>

            {/* Acciones de Lote Rápidas */}
            <Box sx={{ px: 1.5, py: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.02)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                        size="small"
                        checked={loadedStructures.length > 0 && selectedMeshNames.length === loadedStructures.length}
                        indeterminate={selectedMeshNames.length > 0 && selectedMeshNames.length < loadedStructures.length}
                        onChange={handleSelectAll}
                        sx={{ p: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        {selectedMeshNames.length} seleccionadas
                    </Typography>
                </Box>
            </Box>

            <Divider />

            {/* Lista Jerárquica de Estructuras */}
            <List dense sx={{ flex: 1, overflowY: 'auto', p: 0.5 }}>
                {filteredStructures.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                            {loadedStructures.length === 0 ? 'Sin modelo 3D cargado' : 'Sin coincidencias'}
                        </Typography>
                    </Box>
                ) : (() => {
                    const selectedSet = new Set(selectedMeshNames);
                    return filteredStructures.map((name) => {
                        const state = meshStates[name] || { visible: true, opacity: 1.0 };
                        const isSelected = selectedSet.has(name);

                        return (
                            <ListItem
                                key={name}
                                onClick={(e) => toggleMeshSelection(name, e.shiftKey || e.ctrlKey || e.metaKey)}
                                sx={{
                                    borderRadius: 1,
                                    mb: 0.5,
                                    cursor: 'pointer',
                                    bgcolor: isSelected ? 'rgba(2, 136, 209, 0.15)' : 'transparent',
                                    border: isSelected ? '1px solid rgba(2, 136, 209, 0.4)' : '1px solid transparent',
                                    '&:hover': {
                                        bgcolor: isSelected ? 'rgba(2, 136, 209, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                                    },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'stretch',
                                    py: 0.5,
                                    px: 1,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                                        {/* Visibilidad Toggle */}
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMeshState(name, { visible: !state.visible });
                                            }}
                                            sx={{ p: 0.5, color: state.visible ? 'primary.light' : 'text.disabled' }}
                                        >
                                            {state.visible ? <VisibilityIcon sx={{ fontSize: 16 }} /> : <VisibilityOffIcon sx={{ fontSize: 16 }} />}
                                        </IconButton>

                                        <Typography 
                                            variant="body2" 
                                            noWrap 
                                            sx={{ 
                                                fontFamily: "'Roboto Mono', monospace", 
                                                fontSize: '0.78rem',
                                                color: state.visible ? '#f8fafc' : 'text.disabled',
                                                fontWeight: isSelected ? 600 : 400
                                            }}
                                        >
                                            {name}
                                        </Typography>
                                    </Box>

                                    {/* Resaltado Indicador */}
                                    <Tooltip title={state.highlightColor ? `Resaltado: ${state.highlightColor}` : 'Alternar Resaltado'}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMeshState(name, {
                                                    highlightColor: state.highlightColor ? undefined : '#ff1744'
                                                });
                                            }}
                                            sx={{ 
                                                p: 0.5, 
                                                color: state.highlightColor ? '#ff1744' : 'text.secondary' 
                                            }}
                                        >
                                            <HighlightIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                {/* Slider de Opacidad Compacto */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5, mt: 0.2 }}>
                                    <Typography variant="caption" sx={{ fontSize: '0.68rem', color: 'text.secondary', minWidth: 24 }}>
                                        {Math.round(state.opacity * 100)}%
                                    </Typography>
                                    <Slider
                                        size="small"
                                        value={state.opacity}
                                        min={0.0}
                                        max={1.0}
                                        step={0.05}
                                        onChange={(_, val) => setMeshState(name, { opacity: val as number })}
                                        onClick={(e) => e.stopPropagation()}
                                        sx={{ 
                                            py: 0.5,
                                            '& .MuiSlider-thumb': { width: 8, height: 8 }
                                        }}
                                    />
                                </Box>
                            </ListItem>
                        );
                    });
                })()}
            </List>

            {/* Botón Inferior de Captura de Mallas */}
            <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="small"
                    startIcon={<KeyframeIcon />}
                    disabled={selectedMeshNames.length === 0}
                    onClick={captureMeshKeyframe}
                    sx={{ fontSize: '0.75rem', py: 0.8 }}
                >
                    Grabar Clave de Malla (Ctrl+M)
                </Button>
            </Box>
        </Paper>
    );
};
