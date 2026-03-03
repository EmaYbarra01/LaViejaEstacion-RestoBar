import { 
    TextField, 
    Button, 
    Dialog, 
    DialogContent, 
    DialogTitle,
    DialogActions,
    Grid
} from "@mui/material";

const InasistenciaModal = (props) => {
    const { form, handleChange, handleSubmit, open, onClose, empleado } = props;
    
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: '#f44336', color: 'white', fontWeight: 'bold' }}>
                ❌ Registrar Inasistencia
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 3 }}>
                    {empleado && (
                        <div style={{ 
                            marginBottom: '16px', 
                            padding: '12px', 
                            backgroundColor: '#fff3f3', 
                            borderRadius: '8px',
                            border: '1px solid #f44336'
                        }}>
                            <strong>Empleado:</strong> {empleado.usuario?.nombre} {empleado.usuario?.apellido}
                            <br />
                            <strong>Cargo:</strong> {empleado.cargo}
                        </div>
                    )}

                    <Grid container spacing={2}>
                        {/* Fecha */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="fecha"
                                type="date"
                                value={form.fecha || ''}
                                onChange={handleChange}
                                label="Fecha de Inasistencia"
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* Motivo */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="motivo"
                                value={form.motivo || ''}
                                onChange={handleChange}
                                label="Motivo"
                                placeholder="Sin registrar asistencia, enfermedad, personal..."
                                required
                            />
                        </Grid>

                        {/* Observaciones */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="observaciones"
                                value={form.observaciones || ''}
                                onChange={handleChange}
                                label="Observaciones"
                                placeholder="Detalles adicionales..."
                                multiline
                                rows={3}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        onClick={onClose} 
                        sx={{ 
                            color: '#666',
                            '&:hover': { bgcolor: '#f5f5f5' }
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained"
                        sx={{ 
                            bgcolor: '#f44336',
                            '&:hover': { bgcolor: '#d32f2f' }
                        }}
                    >
                        ❌ Registrar Inasistencia
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default InasistenciaModal;
