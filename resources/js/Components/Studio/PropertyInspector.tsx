import React from 'react';
import { Box } from '@mui/material';
import { useStudioStore } from '../../Stores/useStudioStore';
import { CameraEventInspector } from './Inspector/CameraEventInspector';
import { CheckpointInspector } from './Inspector/CheckpointInspector';
import { EmptyInspector } from './Inspector/EmptyInspector';

export const PropertyInspector: React.FC = () => {
    const {
        lesson,
        selectedEventId,
        selectedCheckpointId,
    } = useStudioStore();

    // 1. Obtener objeto seleccionado
    const selectedEvent = lesson?.timeline?.events?.find((e) => e.id === selectedEventId);
    const selectedCheckpoint = lesson?.timeline?.checkpoints?.find((c) => c.id === selectedCheckpointId);

    return (
        <Box sx={{ height: '100%', display: 'flex' }}>
            {/* Render según el tipo de elemento seleccionado */}
            {selectedEvent && selectedEvent.type === 'camera_transform' ? (
                <CameraEventInspector event={selectedEvent} />
            ) : selectedCheckpoint ? (
                <CheckpointInspector checkpoint={selectedCheckpoint} />
            ) : (
                <EmptyInspector />
            )}
        </Box>
    );
};
