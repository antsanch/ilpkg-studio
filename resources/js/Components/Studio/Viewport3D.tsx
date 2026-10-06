import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
    Box,
    Paper,
    IconButton,
    ButtonGroup,
    Button,
    Tooltip,
    Chip
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import GridOnIcon from '@mui/icons-material/GridOn';
import GridOffIcon from '@mui/icons-material/GridOff';
import StraightenIcon from '@mui/icons-material/Straighten';
import LayersIcon from '@mui/icons-material/Layers';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import PanToolIcon from '@mui/icons-material/PanTool';
import { useStudioStore } from '../../Stores/useStudioStore';

// Procedural anatomy meshes when GLTF is not provided
const PROCEDURAL_MESHES = [
    { name: 'maxilla', pos: [0.0, 0.0, 0.0] as [number, number, number], size: [0.9, 0.6, 0.7] as [number, number, number], defaultColor: '#cbd5e1' },
    { name: 'os_sphenoidale', pos: [0.0, 0.7, -0.6] as [number, number, number], size: [1.2, 0.5, 0.8] as [number, number, number], defaultColor: '#e2e8f0' },
    { name: 'os_palatinum', pos: [0.0, -0.4, -0.3] as [number, number, number], size: [0.6, 0.3, 0.5] as [number, number, number], defaultColor: '#94a3b8' },
    { name: 'arteria_maxillaris', pos: [0.35, 0.1, 0.1] as [number, number, number], size: [0.15, 0.8, 0.15] as [number, number, number], defaultColor: '#ef4444' },
    { name: 'nervus_maxillaris', pos: [-0.35, 0.25, -0.1] as [number, number, number], size: [0.12, 0.7, 0.12] as [number, number, number], defaultColor: '#eab308' },
];

const PROCEDURAL_NAMES = PROCEDURAL_MESHES.map((m) => m.name);

// Subcomponente de Modelo Anatómico GLTF o Geometría Dinámica
function AnatomyModel() {
    const { 
        loadedStructures, 
        setLoadedStructures, 
        meshStates, 
        selectedMeshNames, 
        toggleMeshSelection,
        showWireframe 
    } = useStudioStore();
    const groupRef = useRef<THREE.Group | null>(null);

    useEffect(() => {
        if (loadedStructures.length === 0) {
            setLoadedStructures(PROCEDURAL_NAMES);
        }
    }, [loadedStructures.length, setLoadedStructures]);

    const selectedSet = new Set(selectedMeshNames);

    return (
        <group ref={groupRef}>
            {PROCEDURAL_MESHES.map((mesh) => {
                const state = meshStates[mesh.name] || { visible: true, opacity: 1.0 };
                const isSelected = selectedSet.has(mesh.name);

                if (!state.visible) return null;

                const emissiveColor = state.highlightColor || (isSelected ? '#0288d1' : '#000000');
                const emissiveIntensity = state.highlightColor ? 0.8 : (isSelected ? 0.4 : 0.0);

                return (
                    <mesh
                        key={mesh.name}
                        position={mesh.pos}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleMeshSelection(mesh.name, e.shiftKey);
                        }}
                    >
                        <boxGeometry args={mesh.size} />
                        <meshStandardMaterial
                            color={mesh.defaultColor}
                            roughness={0.4}
                            metalness={0.1}
                            transparent={state.opacity < 0.99}
                            opacity={state.opacity}
                            wireframe={showWireframe}
                            emissive={emissiveColor}
                            emissiveIntensity={emissiveIntensity}
                        />
                    </mesh>
                );
            })}
        </group>
    );
}

// Controlador de Cámara sincronizado con el Store
function CameraSyncController() {
    const { camera } = useThree();
    const controlsRef = useRef<any>(null);
    const setCameraPose = useStudioStore((s) => s.setCameraPose);

    useFrame(() => {
        if (controlsRef.current) {
            const pos = camera.position;
            const target = controlsRef.current.target;
            setCameraPose({
                position: [pos.x, pos.y, pos.z],
                target: [target.x, target.y, target.z],
            });
        }
    });

    return <OrbitControls ref={controlsRef} makeDefault dampingFactor={0.1} />;
}

export const Viewport3D: React.FC = () => {
    const {
        showGrid,
        showAxes,
        showWireframe,
        setShowGrid,
        setShowAxes,
        setShowWireframe,
        activeTool,
        setActiveTool,
        captureCameraPose,
        cameraPose
    } = useStudioStore();

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%', bgcolor: '#060709', overflow: 'hidden' }}>
            {/* HUD Superior: Captura de Cámara y Vistas Rápidas */}
            <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<VideocamIcon />}
                    onClick={() => captureCameraPose()}
                    sx={{
                        boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(8px)',
                        bgcolor: 'primary.main',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                    }}
                >
                    Capturar Cámara (Ctrl+K)
                </Button>

                {/* Vistas Rápidas */}
                <Paper
                    elevation={4}
                    sx={{
                        p: 0.5,
                        display: 'flex',
                        gap: 0.5,
                        bgcolor: 'rgba(18, 21, 28, 0.85)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: 1,
                    }}
                >
                    <ButtonGroup size="small" variant="text" sx={{ '& button': { px: 1, py: 0.3, fontSize: '0.7rem' } }}>
                        <Button onClick={() => captureCameraPose()}>Ant</Button>
                        <Button onClick={() => captureCameraPose()}>Post</Button>
                        <Button onClick={() => captureCameraPose()}>Lat</Button>
                        <Button onClick={() => captureCameraPose()}>Sup</Button>
                    </ButtonGroup>
                </Paper>
            </Box>

            {/* HUD Superior Derecho: Herramientas y Visores */}
            <Paper
                elevation={4}
                sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 10,
                    p: 0.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    bgcolor: 'rgba(18, 21, 28, 0.85)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 1,
                }}
            >
                <Tooltip title={activeTool === 'orbit' ? 'Modo Órbita 3D' : 'Cambiar a Órbita'}>
                    <IconButton
                        size="small"
                        color={activeTool === 'orbit' ? 'primary' : 'default'}
                        onClick={() => setActiveTool('orbit')}
                    >
                        <PanToolIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title={activeTool === 'hotspot' ? 'Modo Marcador de Hotspot 3D' : 'Cambiar a Hotspot'}>
                    <IconButton
                        size="small"
                        color={activeTool === 'hotspot' ? 'secondary' : 'default'}
                        onClick={() => setActiveTool('hotspot')}
                    >
                        <TouchAppIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title={showGrid ? 'Ocultar Cuadrícula' : 'Mostrar Cuadrícula'}>
                    <IconButton
                        size="small"
                        color={showGrid ? 'info' : 'default'}
                        onClick={() => setShowGrid(!showGrid)}
                    >
                        {showGrid ? <GridOnIcon sx={{ fontSize: 16 }} /> : <GridOffIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                </Tooltip>

                <Tooltip title={showAxes ? 'Ocultar Ejes X,Y,Z' : 'Mostrar Ejes X,Y,Z'}>
                    <IconButton
                        size="small"
                        color={showAxes ? 'warning' : 'default'}
                        onClick={() => setShowAxes(!showAxes)}
                    >
                        <StraightenIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title={showWireframe ? 'Desactivar Modo Alambre' : 'Activar Modo Alambre'}>
                    <IconButton
                        size="small"
                        color={showWireframe ? 'secondary' : 'default'}
                        onClick={() => setShowWireframe(!showWireframe)}
                    >
                        <LayersIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>
            </Paper>

            {/* Badge de Coordenadas Flotante Inferior Izquierdo */}
            <Box sx={{ position: 'absolute', bottom: 12, left: 12, zIndex: 10, pointerEvents: 'none' }}>
                <Chip
                    size="small"
                    label={`Cám: [${cameraPose.position.map((v) => v.toFixed(2)).join(', ')}]`}
                    sx={{
                        fontFamily: "'Roboto Mono', monospace",
                        fontSize: '0.68rem',
                        bgcolor: 'rgba(10, 10, 12, 0.75)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                />
            </Box>

            {/* Canvas WebGL Three.js / R3F */}
            <Canvas
                camera={{ position: [0.0, 1.2, 4.5], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
            >
                <color attach="background" args={['#08090c']} />
                <ambientLight intensity={0.8} />
                <directionalLight position={[10, 15, 10]} intensity={1.2} />
                <directionalLight position={[-10, 10, -10]} intensity={0.5} />
                <pointLight position={[0, -5, 2]} intensity={0.3} />

                {showGrid && <gridHelper args={[20, 20, '#0288d1', '#1e293b']} position={[0, -1, 0]} />}
                {showAxes && <axesHelper args={[2]} />}

                <AnatomyModel />
                <CameraSyncController />
            </Canvas>
        </Box>
    );
};
