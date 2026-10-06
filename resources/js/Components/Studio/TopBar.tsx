import React, { useRef, useState } from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Box, 
    Button, 
    Chip, 
    ToggleButton, 
    ToggleButtonGroup, 
    Tooltip, 
    IconButton,
    CircularProgress
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DownloadIcon from '@mui/icons-material/Download';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ScienceIcon from '@mui/icons-material/Science';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { useStudioStore } from '../../Stores/useStudioStore';
import { IlpkgPacker } from '../../Services/IlpkgPacker';
import { ValidationDialog } from './ValidationDialog';

export const TopBar: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [validationModalOpen, setValidationModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const {
        manifest,
        lesson,
        activeEditorMode,
        setActiveEditorMode,
        undoStack,
        redoStack,
        undo,
        redo,
        validatePackage,
        loadPackageData,
        audioBlobUrl,
        modelBlobUrl,
    } = useStudioStore();

    const validation = validatePackage();

    const handleLoadDemo = async () => {
        try {
            const resp = await fetch('/demo.ilpkg');
            if (!resp.ok) {
                throw new Error(`Error HTTP: ${resp.status}`);
            }
            const blob = await resp.blob();
            const extracted = await IlpkgPacker.extractPackage(blob);
            loadPackageData(
                extracted.manifest,
                extracted.lesson,
                extracted.audioBlobUrl,
                extracted.modelBlobUrl
            );
        } catch (err: any) {
            console.error('Error cargando demo:', err);
            alert('Error al cargar paquete demo: ' + err.message);
        }
    };

    const handleFileOpen = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const extracted = await IlpkgPacker.extractPackage(file);
            loadPackageData(
                extracted.manifest,
                extracted.lesson,
                extracted.audioBlobUrl,
                extracted.modelBlobUrl
            );
        } catch (err: any) {
            console.error('Error abriendo paquete:', err);
            alert('Error al abrir paquete: ' + err.message);
        }
    };

    const handleExport = async () => {
        if (!manifest || !lesson) return;
        setIsExporting(true);

        try {
            let audioBlob: Blob;
            if (audioBlobUrl) {
                const res = await fetch(audioBlobUrl);
                if (!res.ok) throw new Error('Error al leer audio blob');
                audioBlob = await res.blob();
            } else {
                audioBlob = new Blob(['dummy audio'], { type: 'audio/wav' });
            }

            let modelBlob: Blob;
            if (modelBlobUrl) {
                const res = await fetch(modelBlobUrl);
                if (!res.ok) throw new Error('Error al leer modelo 3D blob');
                modelBlob = await res.blob();
            } else {
                modelBlob = new Blob(['dummy glb'], { type: 'model/gltf-binary' });
            }

            await IlpkgPacker.buildAndDownload(
                manifest,
                lesson,
                audioBlob,
                modelBlob
            );
        } catch (err: any) {
            console.error('Error exportando paquete:', err);
            alert('Error al exportar paquete: ' + err.message);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <AppBar 
            position="static" 
            elevation={0}
            sx={{ 
                bgcolor: '#0e1117', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                zIndex: 10
            }}
        >
            <Toolbar variant="dense" sx={{ minHeight: 48, px: 2, display: 'flex', justifyContent: 'space-between' }}>
                {/* Lado Izquierdo: Título y Slug */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '4px', 
                            bgcolor: 'primary.main', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            color: '#fff'
                        }}>
                            IL
                        </Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff', fontSize: '0.9rem' }}>
                            ILPKG Studio
                        </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: 'text.secondary', borderLeft: '1px solid rgba(255,255,255,0.1)', pl: 2 }}>
                        {manifest?.metadata?.title || 'Sin Proyecto Cargado'}
                    </Typography>

                    {manifest?.metadata?.slug && (
                        <Chip 
                            label={manifest.metadata.slug} 
                            size="small" 
                            variant="outlined" 
                            sx={{ height: 20, fontSize: '0.7rem', color: 'text.secondary' }}
                        />
                    )}
                </Box>

                {/* Centro: Modos de Edición y Deshacer/Rehacer */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Deshacer (Ctrl+Z)">
                            <span>
                                <IconButton 
                                    size="small" 
                                    disabled={undoStack.length === 0} 
                                    onClick={undo}
                                    sx={{ color: 'text.secondary' }}
                                >
                                    <UndoIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Rehacer (Ctrl+Y)">
                            <span>
                                <IconButton 
                                    size="small" 
                                    disabled={redoStack.length === 0} 
                                    onClick={redo}
                                    sx={{ color: 'text.secondary' }}
                                >
                                    <RedoIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>

                    <ToggleButtonGroup
                        size="small"
                        value={activeEditorMode}
                        exclusive
                        onChange={(_, val) => val && setActiveEditorMode(val)}
                        sx={{ 
                            height: 28,
                            bgcolor: 'rgba(255,255,255,0.03)',
                            '& .MuiToggleButton-root': {
                                px: 1.5,
                                fontSize: '0.75rem',
                                textTransform: 'none',
                                borderColor: 'rgba(255,255,255,0.08)'
                            }
                        }}
                    >
                        <ToggleButton value="edit">
                            <EditIcon sx={{ fontSize: 14, mr: 0.5 }} /> Autoría
                        </ToggleButton>
                        <ToggleButton value="preview">
                            <PlayArrowIcon sx={{ fontSize: 14, mr: 0.5 }} /> Simulación Alumno
                        </ToggleButton>
                    </ToggleButtonGroup>

                    {/* Consola de Validación */}
                    <Tooltip title="Ver estado de validación pedagógica y estructural">
                        <Chip 
                            size="small"
                            icon={validation.isValid ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
                            label={validation.isValid ? 'Válido para empaquetar' : `${validation.errors.length} Errores`}
                            color={validation.isValid ? 'success' : 'error'}
                            variant="outlined"
                            onClick={() => setValidationModalOpen(true)}
                            sx={{ height: 24, cursor: 'pointer' }}
                        />
                    </Tooltip>
                </Box>

                {/* Lado Derecho: Acciones de Archivo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept=".ilpkg,.zip" 
                        style={{ display: 'none' }} 
                        onChange={handleFileOpen}
                    />

                    <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<ScienceIcon />}
                        onClick={handleLoadDemo}
                        sx={{ height: 28, fontSize: '0.75rem' }}
                    >
                        Cargar Demo
                    </Button>

                    <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<FolderOpenIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{ height: 28, fontSize: '0.75rem' }}
                    >
                        Abrir .ilpkg
                    </Button>

                    <Button 
                        size="small" 
                        variant="contained" 
                        color="primary"
                        startIcon={isExporting ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />}
                        disabled={!manifest || isExporting}
                        onClick={handleExport}
                        sx={{ height: 28, fontSize: '0.75rem' }}
                    >
                        Compilar .ilpkg
                    </Button>
                </Box>
            </Toolbar>

            {/* Modal de Validación */}
            <ValidationDialog 
                open={validationModalOpen} 
                onClose={() => setValidationModalOpen(false)}
                errors={validation.errors}
            />
        </AppBar>
    );
};
