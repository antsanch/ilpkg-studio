import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material';

interface CheckpointDialogProps {
    open: boolean;
    checkpoint: any | null;
    selectedOption: string | null;
    onOptionChange: (optionId: string) => void;
    onSubmit: () => void;
}

export const CheckpointDialog: React.FC<CheckpointDialogProps> = ({
    open,
    checkpoint,
    selectedOption,
    onOptionChange,
    onSubmit,
}) => {
    if (!checkpoint) return null;

    return (
        <Dialog
            open={open}
            disableEscapeKeyDown
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: '#12151c',
                    color: 'white',
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.1)'
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="overline" color="primary">Punto de Control Clínico</Typography>
                <Typography variant="h6">{checkpoint.prompt}</Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <RadioGroup value={selectedOption} onChange={(e) => onOptionChange(e.target.value)}>
                    {checkpoint.options?.map((opt: any) => (
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
                    onClick={onSubmit}
                    fullWidth
                >
                    Validar Respuesta
                </Button>
            </DialogActions>
        </Dialog>
    );
};
