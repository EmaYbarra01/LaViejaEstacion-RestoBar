import { 
    TextField, 
    Button, 
    Dialog, 
    DialogContent, 
    DialogTitle,
    DialogActions,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Grid
} from "@mui/material";

const PagoModal = (props) => {
    const { form, handleChange, handleSubmit, open, onClose, empleado } = props;
    
    const meses = [
        { value: 1, label: 'Enero' },
        { value: 2, label: 'Febrero' },
        { value: 3, label: 'Marzo' },
        { value: 4, label: 'Abril' },
        { value: 5, label: 'Mayo' },
        { value: 6, label: 'Junio' },
        { value: 7, label: 'Julio' },
        { value: 8, label: 'Agosto' },
        { value: 9, label: 'Septiembre' },
        { value: 10, label: 'Octubre' },
        { value: 11, label: 'Noviembre' },
        { value: 12, label: 'Diciembre' }
    ];

    const anioActual = new Date().getFullYear();
    const anios = Array.from({ length: 5 }, (_, i) => anioActual - i);
    
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white', fontWeight: 'bold' }}>
                💰 Registrar Pago
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 3 }}>
                    {empleado && (
                        <div style={{ 
                            marginBottom: '16px', 
                            padding: '12px', 
                            backgroundColor: '#fff3e0', 
                            borderRadius: '8px',
                            border: '1px solid #ff9800'
                        }}>
                            <strong>Empleado:</strong> {empleado.usuario?.nombre} {empleado.usuario?.apellido}
                            <br />
                            <strong>Cargo:</strong> {empleado.cargo}
                            <br />
                            <strong>Salario Mensual:</strong> ${empleado.salarioMensual?.toLocaleString('es-AR')}
                        </div>
                    )}
                    
                    <Grid container spacing={2}>
                        {/* Mes */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Mes *</InputLabel>
                                <Select
                                    name="mes"
                                    value={form.mes || ''}
                                    onChange={handleChange}
                                    label="Mes *"
                                >
                                    {meses.map((mes) => (
                                        <MenuItem key={mes.value} value={mes.value}>
                                            {mes.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Año */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Año *</InputLabel>
                                <Select
                                    name="anio"
                                    value={form.anio || ''}
                                    onChange={handleChange}
                                    label="Año *"
                                >
                                    {anios.map((anio) => (
                                        <MenuItem key={anio} value={anio}>
                                            {anio}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Monto */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="monto"
                                type="number"
                                value={form.monto || empleado?.salarioMensual || ''}
                                onChange={handleChange}
                                label="Monto *"
                                placeholder="0"
                                required
                                inputProps={{ min: 0, step: 0.01 }}
                            />
                        </Grid>

                        {/* Método de Pago */}
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Método de Pago *</InputLabel>
                                <Select
                                    name="metodoPago"
                                    value={form.metodoPago || 'Efectivo'}
                                    onChange={handleChange}
                                    label="Método de Pago *"
                                >
                                    <MenuItem value="Efectivo">💵 Efectivo</MenuItem>
                                    <MenuItem value="Transferencia">🏦 Transferencia</MenuItem>
                                    <MenuItem value="Cheque">📝 Cheque</MenuItem>
                                </Select>
                            </FormControl>
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
                            bgcolor: '#ff9800',
                            '&:hover': { bgcolor: '#f57c00' }
                        }}
                    >
                        💰 Registrar Pago
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default PagoModal;
