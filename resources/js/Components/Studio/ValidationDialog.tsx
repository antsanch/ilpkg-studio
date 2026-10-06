import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ValidationDialogProps {
    open: boolean;
    onClose: () => void;
    errors: string[];
}

export const ValidationDialog: React.FC<ValidationDialogProps> = ({
    open,
    onClose,
    errors,
}) => {
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ pb: 1 }}>Consola de Validación Pedagógica y de Activos</DialogTitle>
            <DialogContent dividers>
                {errors.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                        <Typography variant="h6" color="success.main">El paquete es 100% íntegro</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Cumple todas las especificaciones de esquemas, mallas declaradas y límites temporales.
                        </Typography>
                    </Box>
                ) : (
                    <List dense>
                        {errors.map((err) => (
                            <ListItem key={`val-err-${err}`}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <ErrorOutlineIcon color="error" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={err} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    );
};
