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
    Grid,
    Box
} from "@mui/material";

const EmpleadoFormModal = (props) => {
    const { form, handleChange, handleSubmit, isEdit, open, onClose } = props;
    
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: '#667eea', color: 'white', fontWeight: 'bold' }}>
                {isEdit ? "✏️ Editar Empleado" : "➕ Agregar Nuevo Empleado"}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={2}>
                        {/* Datos del empleado (solo al crear) */}
                        {!isEdit && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="nombre"
                                        value={form.nombre || ''}
                                        onChange={handleChange}
                                        label="Nombre *"
                                        placeholder="Ej: Juan"
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="apellido"
                                        value={form.apellido || ''}
                                        onChange={handleChange}
                                        label="Apellido *"
                                        placeholder="Ej: Pérez"
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="email"
                                        type="email"
                                        value={form.email || ''}
                                        onChange={handleChange}
                                        label="Email *"
                                        placeholder="ejemplo@mail.com"
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="dni"
                                        value={form.dni || ''}
                                        onChange={handleChange}
                                        label="DNI"
                                        placeholder="12345678"
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="telefono"
                                        value={form.telefono || ''}
                                        onChange={handleChange}
                                        label="Teléfono"
                                        placeholder="3512345678"
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="password"
                                        type="password"
                                        value={form.password || ''}
                                        onChange={handleChange}
                                        label="Contraseña *"
                                        placeholder="Contraseña para login"
                                        required
                                        helperText="Contraseña que usará el empleado para iniciar sesión"
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Cargo */}
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Cargo *</InputLabel>
                                <Select
                                    name="cargo"
                                    value={form.cargo || ''}
                                    onChange={handleChange}
                                    label="Cargo *"
                                >
                                    <MenuItem value="Mozo">Mozo</MenuItem>
                                    <MenuItem value="Cocinero">Cocinero</MenuItem>
                                    <MenuItem value="Cajero">Cajero</MenuItem>
                                    <MenuItem value="Barman">Barman</MenuItem>
                                    <MenuItem value="Limpieza">Limpieza</MenuItem>
                                    <MenuItem value="Seguridad">Seguridad</MenuItem>
                                    <MenuItem value="Gerente">Gerente</MenuItem>
                                    <MenuItem value="Otro">Otro</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Salario Mensual */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="salarioMensual"
                                type="number"
                                value={form.salarioMensual || ''}
                                onChange={handleChange}
                                label="Salario Mensual *"
                                placeholder="0"
                                required
                                inputProps={{ min: 0, step: 0.01 }}
                                helperText="Salario mensual del empleado"
                            />
                        </Grid>

                        {/* Activo (solo al editar) */}
                        {isEdit && (
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        name="activo"
                                        value={form.activo === undefined ? true : form.activo}
                                        onChange={handleChange}
                                        label="Estado"
                                    >
                                        <MenuItem value={true}>✅ Activo</MenuItem>
                                        <MenuItem value={false}>❌ Inactivo</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
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
                            bgcolor: '#667eea',
                            '&:hover': { bgcolor: '#5568d3' }
                        }}
                    >
                        {isEdit ? "💾 Guardar Cambios" : "➕ Crear Empleado"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EmpleadoFormModal;
