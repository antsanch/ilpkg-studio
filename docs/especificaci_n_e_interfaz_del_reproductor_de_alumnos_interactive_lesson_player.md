# Especificación Técnica y de Interfaz: Reproductor del Alumno (ILPKG Player)
**Módulo de Visualización y Evaluación:** Reproductor Adaptativo de Lecciones Interactivas  
**Ecosistema:** Libro Aumentado de Anatomía Biomédica (LAAB)  
**Stack de Implementación:** React 18+, TypeScript, Material UI (MUI v5/v6), React Three Fiber (R3F), Drei, GSAP, Inertia.js (Laravel)

---

## 1. Filosofía de Resiliencia y Modos de Ejecución

El reproductor del alumno no es un simple visor 3D pasivo; es un entorno híbrido de aprendizaje y auditoría académica. Dado que las lecciones evolucionan con nuevas versiones (`v1.0.0` $\rightarrow$ `v1.1.0`) y los paquetes antiguos pueden ser archivados o purgados de disco para ahorrar almacenamiento, el reproductor opera en **tres modos adaptativos según la disponibilidad física del paquete y el estado del estudiante**:

```text
                                  [ Cargar Lección / Intento ]
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
     ¿Existen activos 3D en disco?                               ¿Activos purgados o lección
     (`package_path !== null`)                                    marcada como archivada / lápida?
                 │                                                             │
        ┌────────┴────────┐                                                    ▼
        ▼                 ▼                                         [ MODO 3: AUDITORÍA ESTÁTICA ]
¿Es versión actual?   ¿Es versión obsoleta?                         - Cero consumo WebGL / GPU.
(`status === 'active'`) (`status === 'deprecated'`)                 - Reconstrucción 2D fiel desde
        │                 │                                           el JSON `lesson_snapshot`.
        ▼                 ▼                                         - Despliega preguntas, respuestas
 [ MODO 1: ACTIVO ]    [ MODO 2: REVISIÓN OBSOLETA ]                  seleccionadas y justificación clínica.
 - Modo 3D completo.   - Modo 3D con banner de aviso.               - Garantiza acceso eterno a la
 - Evaluación sumativa - Calificación inmutable.                      evidencia de calificación.
   de 1.ª visualización.- Opción de migrar a versión nueva.
```

---

## 2. Jerarquía de Componentes de la Interfaz (MUI + WebGL)

La interfaz se divide en capas visuales superpuestas para mantener la inmersión espacial tridimensional sin perder la claridad institucional de la evaluación:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [A] BANNER DE ESTADO Y RESILIENCIA (Alertas de Obsolescencia / Lápida / Kárdex)       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [B] VIEWPORT ADAPTATIVO                                                               │
│      • Modo 1 y 2: Lienzo Three.js / R3F (Modelo 3D, Gizmos y Cámara Cinemática)       │
│      • Modo 3: Documento Clínico Estático Resguardado (Modo Ficha de Evidencia)        │
│                                                                                        │
│  [C] OVERLAY HUD (Picture-in-Picture de Diapositivas, Indicador de Órganos y Reloj)   │
│                                                                                        │
│  [D] MODAL DE EVALUACIÓN CLÍNICA (Checkpoints, mesh_click, feedback inmediato)         │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  [E] BARRA DE TRANSPORTE Y CONTROL TEMPORAL                                            │
│  [▶] [❚❚] 01:24 / 04:05  ═══════════[🔒 Chk 1]═══════[🔒 Chk 2]═══════ 🔊 [1.0x] [⛶]    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Especificación de Tipos y Props (TypeScript)

```typescript
// resources/js/types/ilpkg-player.ts

export type ReleaseLifecycleStatus = 'active' | 'deprecated' | 'archived';

export interface StudentAttemptSummary {
  id: number;
  attemptNumber: number;
  isFirstAttempt: boolean;
  scoreObtained: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
}

export interface PlayerCheckpointAnswer {
  checkpointId: string;
  promptSnapshot: string;
  selectedOptionId?: string;
  selectedOptionText?: string;
  isCorrect: boolean;
  pointsAwarded: number;
}

export interface PlayerProps {
  // Metadatos de la lección lógica
  lesson: {
    id: number;
    title: string;
    slug: string;
    isDeleted: boolean; // True si tiene soft-delete (Tombstone)
  };
  
  // Release vinculado
  release: {
    id: number;
    version: string;
    status: ReleaseLifecycleStatus;
    has3dAssets: boolean;
    audioUrl: string | null;
    modelUrl: string | null;
    manifest: any; // manifest_snapshot
    lessonData: any; // lesson_snapshot
  };

  // Información del intento del estudiante (null si es su primera vez)
  attempt?: StudentAttemptSummary;
  historicalAnswers?: PlayerCheckpointAnswer[];
  
  // Disponibilidad de actualización
  latestActiveRelease?: {
    id: number;
    version: string;
  };
}
```

---

## 4. Implementación del Componente Principal (`InteractiveLessonPlayer.tsx`)

```tsx
// resources/js/Pages/InteractiveLessons/InteractiveLessonPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  Box,
  Alert,
  AlertTitle,
  Button,
  Chip,
  Paper,
  Typography,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Stack
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { PlayerProps, PlayerCheckpointAnswer } from '@/types/ilpkg-player';
import axios from 'axios';

// Subcomponente de Fallback: Modo Auditoría Estática (Sin WebGL / Paquete purgado)
function StaticAuditView({
  lessonTitle,
  version,
  attempt,
  answers,
  isTombstoned
}: {
  lessonTitle: string;
  version: string;
  attempt?: any;
  answers: PlayerCheckpointAnswer[];
  isTombstoned: boolean;
}) {
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 4, color: 'text.primary' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, borderLeft: '6px solid #0288d1' }}>
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
          <Box sx={{ bgcolor: 'action.hover', p: 2.5, borderRadius: 2, mb: 4 }}>
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
          {answers.map((ans, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" color="primary">
                  Reactivo #{idx + 1} ({ans.checkpointId})
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
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}

// Componente Principal
export default function InteractiveLessonPlayer({
  lesson,
  release,
  attempt,
  historicalAnswers = [],
  latestActiveRelease
}: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeCheckpoint, setActiveCheckpoint] = useState<any | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const answeredCheckpoints = useRef<Set<string>>(new Set());

  // 1. Si los activos 3D fueron purgados del disco o no existen, cargar Fallback Estático
  if (!release.has3dAssets || !release.modelUrl) {
    return (
      <StaticAuditView
        lessonTitle={lesson.title}
        version={release.version}
        attempt={attempt}
        answers={historicalAnswers}
        isTombstoned={lesson.isDeleted}
      />
    );
  }

  // 2. Control de tiempo y eventos interactivos
  const duration = release.lessonData?.timeline?.duration || 1;
  const checkpoints = release.lessonData?.timeline?.checkpoints || [];

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    setCurrentTime(t);

    // Solo evaluar si el estudiante NO ha completado la lección (primera visualización)
    if (!attempt?.passed) {
      const hitCheckpoint = checkpoints.find(
        (chk: any) => Math.abs(chk.timestamp - t) < 0.25 && !answeredCheckpoints.current.has(chk.id)
      );

      if (hitCheckpoint) {
        audioRef.current.pause();
        setIsPlaying(false);
        setActiveCheckpoint(hitCheckpoint);
      }
    }
  };

  const handleOptionSubmit = async () => {
    if (!activeCheckpoint || !selectedOption) return;

    const opt = activeCheckpoint.options?.find((o: any) => o.id === selectedOption);
    const isCorrect = !!opt?.isCorrect;

    // Registrar en Laravel
    await axios.post(route('interactive-lessons.checkpoints.respond', activeCheckpoint.id), {
      lesson_package_release_id: release.id,
      checkpoint_id: activeCheckpoint.id,
      prompt_snapshot: activeCheckpoint.prompt,
      selected_option_id: selectedOption,
      selected_option_text: opt?.text,
      is_correct: isCorrect,
      points_awarded: isCorrect ? activeCheckpoint.points : 0
    });

    answeredCheckpoints.current.add(activeCheckpoint.id);
    setActiveCheckpoint(null);
    setSelectedOption(null);

    if (isCorrect) {
      audioRef.current?.play();
      setIsPlaying(true);
    } else {
      // Rebobinado pedagógico
      if (audioRef.current && activeCheckpoint.rewindTimestamp !== undefined) {
        audioRef.current.currentTime = activeCheckpoint.rewindTimestamp;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh', bgcolor: '#0a0a0a', overflow: 'hidden' }}>
      <Head title={`${lesson.title} - (v${release.version})`} />

      {/* [A] BANNER DE ESTADO Y ADVERTENCIAS DE CICLO DE VIDA */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 30, pointerEvents: 'none' }}>
        <Stack spacing={1} sx={{ pointerEvents: 'auto', maxWidth: 850, mx: 'auto' }}>
          {/* Advertencia si la lección fue eliminada / Tombstone */}
          {lesson.isDeleted && (
            <Alert severity="warning" variant="filled">
              <strong>Lección Retirada:</strong> Este contenido fue despublicado del catálogo activo.
              Estás visualizando una réplica histórica de consulta.
            </Alert>
          )}

          {/* Advertencia si es una versión obsoleta pero con activos 3D vigentes */}
          {release.status === 'deprecated' && latestActiveRelease && (
            <Alert
              severity="info"
              variant="filled"
              action={
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<SystemUpdateAltIcon />}
                  onClick={() => router.visit(route('interactive-lessons.show', lesson.id))}
                >
                  Ir a v{latestActiveRelease.version}
                </Button>
              }
            >
              Estás consultando tu intento bajo la versión <strong>v{release.version}</strong>. Existe una versión más reciente.
            </Alert>
          )}

          {/* Indicador de intento previo acreditado */}
          {attempt && (
            <Paper
              sx={{
                p: 1.5,
                bgcolor: 'rgba(20, 20, 20, 0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <Typography variant="body2" color="white">
                Evaluado el {attempt.completedAt} | Calificación: <strong>{attempt.percentage}%</strong> ({attempt.scoreObtained}/{attempt.maxScore} pts)
              </Typography>
              <Chip
                size="small"
                label={attempt.passed ? 'Aprobado (Scrubbing Desbloqueado)' : 'No Aprobado'}
                color={attempt.passed ? 'success' : 'error'}
              />
            </Paper>
          )}
        </Stack>
      </Box>

      {/* Master Audio nativo */}
      <audio
        ref={audioRef}
        src={release.audioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* [B] VIEWPORT 3D R3F */}
      <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 10]} intensity={1.2} />
        <OrbitControls makeDefault />
      </Canvas>

      {/* [D] MODAL DE CHECKPOINT PEDAGÓGICO */}
      <Dialog
        open={Boolean(activeCheckpoint)}
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#1e1e1e', color: 'white', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="overline" color="primary">Punto de Control Clínico</Typography>
          <Typography variant="h6">{activeCheckpoint?.prompt}</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <RadioGroup value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
            {activeCheckpoint?.options?.map((opt: any) => (
              <FormControlLabel
                key={opt.id}
                value={opt.id}
                control={<Radio sx={{ color: 'primary.main' }} />}
                label={opt.text}
                sx={{ mb: 1 }}
              />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            disabled={!selectedOption}
            onClick={handleOptionSubmit}
            fullWidth
          >
            Validar Respuesta
          </Button>
        </DialogActions>
      </Dialog>

      {/* [E] BARRA HUD INFERIOR */}
      <Paper
        elevation={8}
        sx={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: 820,
          p: 2,
          bgcolor: 'rgba(25, 25, 25, 0.9)',
          backdropFilter: 'blur(12px)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.12)',
          zIndex: 20
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton
            color="primary"
            onClick={() => {
              if (!audioRef.current) return;
              if (isPlaying) {
                audioRef.current.pause();
              } else {
                audioRef.current.play();
              }
              setIsPlaying(!isPlaying);
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>

          <Box sx={{ flexGrow: 1, position: 'relative' }}>
            <LinearProgress
              variant="determinate"
              value={(currentTime / duration) * 100}
              sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)' }}
            />
            {/* Marcadores de checkpoints sobre la barra */}
            {checkpoints.map((cp: any, idx: number) => {
              const leftPercent = (cp.timestamp / duration) * 100;
              const isPassed = answeredCheckpoints.current.has(cp.id) || attempt?.passed;
              return (
                <Box
                  key={idx}
                  sx={{
                    position: 'absolute',
                    left: `${leftPercent}%`,
                    top: -4,
                    transform: 'translateX(-50%)',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: isPassed ? 'success.main' : 'warning.main',
                    border: '2px solid #1e1e1e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10
                  }}
                >
                  {!isPassed && <LockIcon sx={{ fontSize: 9, color: '#000' }} />}
                </Box>
              );
            })}
          </Box>

          <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 80, textAlign: 'right' }}>
            {new Date(currentTime * 1000).toISOString().substring(14, 19)} /{' '}
            {new Date(duration * 1000).toISOString().substring(14, 19)}
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
```

---

## 5. Matriz de Resiliencia en la Interfaz

| Condición del Paquete | Experiencia Visual | Capacidad de Interacción | Registro en Calificaciones |
| :--- | :--- | :--- | :--- |
| **Versión Activa (`active`)** | Escena 3D completa y Master Clock funcionando. | Reactivos habilitados; adelanto rápido bloqueado hasta acreditar. | Se registra el primer intento oficial (`is_first_attempt = true`). |
| **Versión Obsoleta con 3D (`deprecated` caliente/templado)** | Escena 3D activa con Banner informativo azul en la parte superior. | Modo de consulta o reintento según las directivas del curso. Botón para ir a la nueva versión. | La calificación previa no se altera; se referencia a su versión histórica. |
| **Paquete Purgado / Lección Eliminada (`archived` / Lápida)** | **Vista de Auditoría Estática (2D).** Despliegue de fichas estructuradas con el snapshot JSON. | Consulta de enunciados, respuestas del alumno y retroalimentación médica. Cero fallos WebGL. | 100% auditable para kárdex y comités de acreditación médica. |