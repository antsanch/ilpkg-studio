import React, { useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import { studioTheme } from '../../Theme/studioTheme';
import { TopBar } from '../../Components/Studio/TopBar';
import { OutlinerPanel } from '../../Components/Studio/OutlinerPanel';
import { Viewport3D } from '../../Components/Studio/Viewport3D';
import { PropertyInspector } from '../../Components/Studio/PropertyInspector';
import { TimelinePanel } from '../../Components/Studio/TimelinePanel';
import { InteractiveLessonPlayer } from '../../Components/Player/InteractiveLessonPlayer';
import { useStudioStore } from '../../Stores/useStudioStore';
import { IlpkgPacker } from '../../Services/IlpkgPacker';

interface ILPKGStudioProps {
    initialLesson?: any;
    userPermissions?: string[];
}

export default function ILPKGStudio({ initialLesson, userPermissions }: ILPKGStudioProps) {
    const { 
        activeEditorMode, 
        manifest, 
        lesson, 
        loadPackageData,
        audioBlobUrl,
        modelBlobUrl 
    } = useStudioStore();

    const hasInitializedRef = useRef(false);

    // Cargar automáticamente el paquete demo únicamente al montar por primera vez si no hay datos
    useEffect(() => {
        let isMounted = true;
        if (!hasInitializedRef.current && !manifest) {
            hasInitializedRef.current = true;
            IlpkgPacker.loadDefaultDemo().then((pkg) => {
                if (isMounted && pkg) {
                    loadPackageData(pkg.manifest, pkg.lesson, pkg.audioBlobUrl, pkg.modelBlobUrl);
                }
            });
        }
        return () => {
            isMounted = false;
        };
    }, [manifest, loadPackageData]);

    return (
        <ThemeProvider theme={studioTheme}>
            <CssBaseline />
            <Head title={`ILPKG Studio - ${manifest?.metadata?.title || 'Estación de Trabajo'}`} />

            <Box
                sx={{
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.default',
                    overflow: 'hidden',
                }}
            >
                {/* [A] Top Bar */}
                <TopBar />

                {/* Zona Central: Cuadrantes B, C y D */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {activeEditorMode === 'preview' && manifest && lesson ? (
                        /* Modo Simulación Alumno In-Situ */
                        <InteractiveLessonPlayer
                            lesson={{
                                id: initialLesson?.id || 'demo_id',
                                title: manifest.metadata.title,
                                slug: manifest.metadata.slug,
                            }}
                            release={{
                                id: 'rel_demo',
                                version: manifest.formatVersion,
                                status: 'active',
                                has3dAssets: true,
                                manifest: manifest,
                                lessonData: lesson,
                            }}
                        />
                    ) : (
                        /* Modo Autoría Estándar (3 Cuadrantes) */
                        <>
                            {/* [B] Outliner */}
                            <OutlinerPanel />

                            {/* [C] 3D Viewport */}
                            <Box sx={{ flex: 1, height: '100%', position: 'relative' }}>
                                <Viewport3D />
                            </Box>

                            {/* [D] Property Inspector */}
                            <PropertyInspector />
                        </>
                    )}
                </Box>

                {/* [E] Timeline Multi-Pista */}
                <TimelinePanel />
            </Box>
        </ThemeProvider>
    );
}
