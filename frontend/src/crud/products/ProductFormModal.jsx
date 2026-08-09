import { 
    TextField, 
    Button, 
    Dialog, 
    DialogContent, 
    DialogTitle,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    FormControlLabel,
    Switch,
    Grid
} from "@mui/material";
import "./ProductFormModal.css";

const ProductFormModal = (props) => {
    const { form, handleChange, handleSubmit, isEdit, open, onClose, nameError } = props;
    
    // Categorías disponibles (deben coincidir con el backend)
    const categorias = [
        'Bebidas',
        'Bebidas Alcohólicas',
        'Comidas',
        'Postres',
        'Entradas',
        'Guarniciones',
        'Otro'
    ];

    // Unidades de medida disponibles
    const unidades = [
        'Unidad',
        'Kg',
        'Litro',
        'Gramo',
        'Ml',
        'Porción'
    ];
    
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: '#667eea', color: 'white', fontWeight: 'bold' }}>
                {isEdit ? "✏️ Editar Producto" : "➕ Crear Nuevo Producto"}
            </DialogTitle>
            <form id="product-form" onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={2}>
                        {/* Nombre del producto */}
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                name="name"
                                value={form.name || ''}
                                onChange={handleChange}
                                label="Nombre del Producto *"
                                placeholder="Ej: Pizza Napolitana"
                                required
                                error={!!nameError}
                                helperText={nameError || "Nombre del producto tal como aparecerá en el menú"}
                            />
                        </Grid>

                        {/* Categoría */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Categoría *</InputLabel>
                                <Select
                                    name="category"
                                    value={form.category || ''}
                                    onChange={handleChange}
                                    label="Categoría *"
                                >
                                    {categorias.map((cat) => (
                                        <MenuItem key={cat} value={cat}>
                                            {cat}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Unidad de medida */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Unidad de Medida</InputLabel>
                                <Select
                                    name="unit"
                                    value={form.unit || 'Unidad'}
                                    onChange={handleChange}
                                    label="Unidad de Medida"
                                >
                                    {unidades.map((unidad) => (
                                        <MenuItem key={unidad} value={unidad}>
                                            {unidad}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Descripción */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                name="description"
                                label="Descripción"
                                value={form.description || ''}
                                onChange={handleChange}
                                placeholder="Descripción detallada del producto..."
                                helperText="Máximo 500 caracteres"
                            />
                        </Grid>

                        {/* Precio */}
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                name="price"
                                label="Precio de Venta *"
                                type="number"
                                step="0.01"
                                value={form.price || ''}
                                onChange={handleChange}
                                required
                                inputProps={{ min: 0 }}
                                helperText="Precio al público"
                            />
                        </Grid>

                        {/* Costo */}
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                name="cost"
                                label="Costo"
                                type="number"
                                step="0.01"
                                value={form.cost || ''}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                                helperText="Costo del producto"
                            />
                        </Grid>

                        {/* Margen (calculado automáticamente) */}
                        {form.price && form.cost && (
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Margen de Ganancia"
                                    value={`${(((form.price - form.cost) / form.cost) * 100).toFixed(2)}%`}
                                    disabled
                                    helperText="Calculado automáticamente"
                                />
                            </Grid>
                        )}

                        {/* Stock */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="stock"
                                label="Stock Actual"
                                type="number"
                                value={form.stock || 0}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                                helperText="Cantidad disponible en inventario"
                            />
                        </Grid>

                        {/* Stock Mínimo */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="minimumStock"
                                label="Stock Mínimo"
                                type="number"
                                value={form.minimumStock || 0}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                                helperText="Alerta cuando llegue a este número"
                            />
                        </Grid>

                        {/* URL de Imagen */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="imgUrl"
                                label="URL de Imagen"
                                value={form.imgUrl || ''}
                                onChange={handleChange}
                                placeholder="https://ejemplo.com/imagen.jpg"
                                helperText="URL de la imagen del producto"
                            />
                        </Grid>

                        {/* Disponible (Switch) */}
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={form.available !== false}
                                        onChange={(e) => handleChange({ 
                                            target: { 
                                                name: 'available', 
                                                value: e.target.checked 
                                            }
                                        })}
                                        name="available"
                                        color="primary"
                                    />
                                }
                                label={form.available !== false ? "✅ Producto Disponible" : "❌ Producto No Disponible"}
                            />
                        </Grid>

                        {/* Botones */}
                        <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                            <Button 
                                onClick={onClose} 
                                variant="outlined"
                                size="large"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                size="large"
                                sx={{ bgcolor: '#667eea', '&:hover': { bgcolor: '#5568d3' } }}
                            >
                                {isEdit ? "💾 Actualizar" : "✅ Crear Producto"}
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
            </form>
        </Dialog>
    );
};

export default ProductFormModal;
