import { 
    TextField, 
    Button, 
    Dialog, 
    DialogContent, 
    DialogTitle,
    DialogActions,
    Grid,
    FormControlLabel,
    Switch
} from "@mui/material";

const AsistenciaModal = (props) => {
    const { form, handleChange, handleSubmit, open, onClose, empleado } = props;
    
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white', fontWeight: 'bold' }}>
                📅 Registrar Asistencia
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 3 }}>
                    {empleado && (
                        <div style={{ 
                            marginBottom: '16px', 
                            padding: '12px', 
                            backgroundColor: '#f5f5f5', 
                            borderRadius: '8px' 
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
                                value={form.fecha || new Date().toISOString().split('T')[0]}
                                onChange={handleChange}
                                label="Fecha"
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* Presente/Ausente */}
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="presente"
                                        checked={form.presente !== undefined ? form.presente : true}
                                        onChange={(e) => handleChange({ 
                                            target: { 
                                                name: 'presente', 
                                                value: e.target.checked 
                                            }
                                        })}
                                        color="success"
                                    />
                                }
                                label={form.presente ? "✅ Presente" : "❌ Ausente"}
                            />
                        </Grid>

                        {/* Hora de Entrada */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="horaEntrada"
                                type="time"
                                value={form.horaEntrada || ''}
                                onChange={handleChange}
                                label="Hora de Entrada"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* Hora de Salida */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="horaSalida"
                                type="time"
                                value={form.horaSalida || ''}
                                onChange={handleChange}
                                label="Hora de Salida"
                                InputLabelProps={{ shrink: true }}
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
                                placeholder="Notas adicionales..."
                                multiline
                                rows={2}
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
                            bgcolor: '#4caf50',
                            '&:hover': { bgcolor: '#45a049' }
                        }}
                    >
                        📅 Registrar Asistencia
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AsistenciaModal;
