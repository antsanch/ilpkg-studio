import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('React Doctor Component Health & Architecture Audit', () => {
    const componentsDir = path.resolve(__dirname, '../../resources/js/Components');
    const pagesDir = path.resolve(__dirname, '../../resources/js/Pages');

    function getAllFiles(dir: string, fileList: string[] = []): string[] {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                getAllFiles(filePath, fileList);
            } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                fileList.push(filePath);
            }
        });
        return fileList;
    }

    it('REGLA ESTRICTA: verifica CERO presencia de Tailwind CSS o clases utilitarias en todo el frontend', () => {
        const allSourceFiles = [...getAllFiles(componentsDir), ...getAllFiles(pagesDir)];
        const tailwindSignatures = [
            'className="',
            'className=\'',
            '@import "tailwindcss"',
            '@import \'tailwindcss\'',
            '@tailwindcss',
            'flex-col ',
            'text-red-',
            'bg-slate-',
            'p-4 ',
            'm-2 ',
        ];

        allSourceFiles.forEach((filePath) => {
            const content = fs.readFileSync(filePath, 'utf-8');
            tailwindSignatures.forEach((signature) => {
                // Permitir className en SVG estáticos puros si aplica, pero no clases de tailwind
                if (signature.startsWith('className=')) {
                    // Si usa className, verificar que no contenga clases de tailwind comunes
                    expect(content).not.toMatch(/className=["'][^"']*\b(flex|grid|p-\d|m-\d|text-[a-z]+-\d+|bg-[a-z]+-\d+)\b[^"']*["']/);
                } else {
                    expect(content).not.toContain(signature);
                }
            });
        });
    });

    it('MUI DESIGN SYSTEM: verifica que los componentes utilicen el sistema de diseño de Material UI (sx, Theme)', () => {
        const studioPage = fs.readFileSync(path.join(pagesDir, 'Studio/ILPKGStudio.tsx'), 'utf-8');
        expect(studioPage).toContain('ThemeProvider');
        expect(studioPage).toContain('studioTheme');
        expect(studioPage).toContain('CssBaseline');

        const topBar = fs.readFileSync(path.join(componentsDir, 'Studio/TopBar.tsx'), 'utf-8');
        expect(topBar).toContain('@mui/material');

        const outliner = fs.readFileSync(path.join(componentsDir, 'Studio/OutlinerPanel.tsx'), 'utf-8');
        expect(outliner).toContain('@mui/material');

        const timeline = fs.readFileSync(path.join(componentsDir, 'Studio/TimelinePanel.tsx'), 'utf-8');
        expect(timeline).toContain('@mui/material');

        const inspector = fs.readFileSync(path.join(componentsDir, 'Studio/PropertyInspector.tsx'), 'utf-8');
        expect(inspector).toContain('@mui/material');
    });

    it('ARQUITECTURA DE 5 CUADRANTES: confirma que ILPKGStudio ensambla TopBar, Outliner, Viewport, Inspector y Timeline', () => {
        const studioPage = fs.readFileSync(path.join(pagesDir, 'Studio/ILPKGStudio.tsx'), 'utf-8');
        expect(studioPage).toContain('<TopBar />');
        expect(studioPage).toContain('<OutlinerPanel />');
        expect(studioPage).toContain('<Viewport3D />');
        expect(studioPage).toContain('<PropertyInspector />');
        expect(studioPage).toContain('<TimelinePanel />');
    });

    it('MODO SIMULACIÓN ALUMNO: verifica que el switch alterna entre vista de autoría y el reproductor del alumno', () => {
        const studioPage = fs.readFileSync(path.join(pagesDir, 'Studio/ILPKGStudio.tsx'), 'utf-8');
        expect(studioPage).toContain("activeEditorMode === 'preview'");
        expect(studioPage).toContain('<InteractiveLessonPlayer');
    });
});
