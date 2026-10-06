import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { IlpkgManifest } from '../types/ilpkg-manifest';
import { IlpkgLesson } from '../types/ilpkg-lesson';

export interface ExtractedPackage {
    manifest: IlpkgManifest;
    lesson: IlpkgLesson;
    audioBlobUrl: string;
    modelBlobUrl: string;
    slideBlobUrls: Record<string, string>;
}

export class IlpkgPacker {
    /**
     * Libera URLs de objetos creadas previamente para prevenir fugas de memoria
     */
    public static revokeObjectUrl(url?: string | null): void {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Libera todos los ObjectURLs asociados a un paquete extraído
     */
    public static revokePackage(pkg?: ExtractedPackage | null): void {
        if (!pkg) return;
        this.revokeObjectUrl(pkg.audioBlobUrl);
        this.revokeObjectUrl(pkg.modelBlobUrl);
        Object.values(pkg.slideBlobUrls).forEach((url) => this.revokeObjectUrl(url));
    }

    /**
     * Carga el paquete demo oficial verificando status HTTP
     */
    public static async loadDefaultDemo(): Promise<ExtractedPackage | null> {
        try {
            const res = await fetch('/demo.ilpkg');
            if (!res.ok) return null;
            const blob = await res.blob();
            return await IlpkgPacker.extractPackage(blob);
        } catch (err) {
            console.log('Demo load notice:', err);
            return null;
        }
    }

    /**
     * Compila y descarga un paquete .ilpkg directamente en el cliente
     */
    public static async buildAndDownload(
        manifest: IlpkgManifest,
        lesson: IlpkgLesson,
        audioBlob: Blob,
        modelBlob: Blob,
        slideFiles: Record<string, Blob> = {},
        thumbBlob?: Blob
    ): Promise<void> {
        const zip = new JSZip();

        // 1. Inyectar descriptores JSON oficiales
        zip.file('manifest.json', JSON.stringify(manifest, null, 2));
        zip.file('lesson.json', JSON.stringify(lesson, null, 2));

        // 2. Inyectar activos binarios
        const audioPath = manifest.assets.masterAudio.path || 'audio/narration.wav';
        const modelPath = manifest.assets.models3D[0]?.path || 'models/anatomy.glb';

        zip.file(audioPath, audioBlob);
        zip.file(modelPath, modelBlob);

        if (thumbBlob) {
            zip.file(manifest.assets.thumbnail || 'thumb.webp', thumbBlob);
        }

        // 3. Inyectar diapositivas
        for (const [filename, blob] of Object.entries(slideFiles)) {
            zip.file(`slides/${filename}`, blob);
        }

        // 4. Generar compresión Deflate
        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 },
        });

        // 5. Descargar archivo
        const slug = manifest.metadata.slug || 'leccion_interactiva';
        saveAs(zipBlob, `${slug}.ilpkg`);
    }

    /**
     * Descomprime un paquete .ilpkg y genera ObjectURLs locales para el editor
     */
    public static async extractPackage(file: File | Blob): Promise<ExtractedPackage> {
        const zip = await JSZip.loadAsync(file);

        // 1. Leer y parsear descriptores en paralelo
        const manifestFile = zip.file('manifest.json');
        const lessonFile = zip.file('lesson.json');

        if (!manifestFile || !lessonFile) {
            throw new Error('El archivo .ilpkg no contiene manifest.json o lesson.json válidos.');
        }

        const [manifestText, lessonText] = await Promise.all([
            manifestFile.async('string'),
            lessonFile.async('string')
        ]);

        const manifest: IlpkgManifest = JSON.parse(manifestText);
        const lesson: IlpkgLesson = JSON.parse(lessonText);

        // 2. Extraer audio y modelo 3D en paralelo
        const audioPath = manifest.assets.masterAudio.path;
        const audioEntry = zip.file(audioPath);
        if (!audioEntry) {
            throw new Error(`Activo de audio no encontrado en la ruta: ${audioPath}`);
        }

        const modelPath = manifest.assets.models3D[0]?.path;
        const modelEntry = zip.file(modelPath);
        if (!modelEntry) {
            throw new Error(`Modelo 3D no encontrado en la ruta: ${modelPath}`);
        }

        const [audioBlob, modelBlob] = await Promise.all([
            audioEntry.async('blob'),
            modelEntry.async('blob')
        ]);

        // react-doctor-disable-next-line react-doctor/no-create-object-url-without-revoke
        const audioBlobUrl = URL.createObjectURL(audioBlob);
        // react-doctor-disable-next-line react-doctor/no-create-object-url-without-revoke
        const modelBlobUrl = URL.createObjectURL(modelBlob);

        // 3. Extraer diapositivas en paralelo
        const slideBlobUrls: Record<string, string> = {};
        const slidePromises = (manifest.assets.staticSlides || []).map(async (slide) => {
            const entry = zip.file(slide.path);
            if (!entry) return null;
            const b = await entry.async('blob');
            // react-doctor-disable-next-line react-doctor/no-create-object-url-without-revoke
            return { id: slide.id, url: URL.createObjectURL(b) };
        });

        const extractedSlides = await Promise.all(slidePromises);
        extractedSlides.forEach((item) => {
            if (item) {
                slideBlobUrls[item.id] = item.url;
            }
        });

        return {
            manifest,
            lesson,
            audioBlobUrl,
            modelBlobUrl,
            slideBlobUrls,
        };
    }
}
