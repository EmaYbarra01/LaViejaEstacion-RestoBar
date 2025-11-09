import { TextField, Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import "./ProductFormModal.css";

const ProductFormModal = (props) => {
    const { form, handleChange, handleSubmit, isEdit, open, onClose } = props;
    
    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {isEdit ? "Editar Producto" : "Crear Producto"}
                </DialogTitle>
                <form id="product-form" onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            fullWidth
                            margin="dense"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            label="Nombre del Producto"
                            required
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            name="code"
                            label="Código"
                            value={form.code}
                            onChange={handleChange}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            name="price"
                            label="Precio"
                            type="number"
                            step="0.01"
                            value={form.price}
                            onChange={handleChange}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            name="imgUrl"
                            label="URL de Imagen"
                            value={form.imgUrl}
                            onChange={handleChange}
                            placeholder="https://ejemplo.com/imagen.jpg"
                        />
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                            <Button type="submit" variant="contained" color="primary">
                                {isEdit ? "Actualizar Producto" : "Crear Producto"}
                            </Button>
                            <Button onClick={onClose} variant="outlined">
                                Cancelar
                            </Button>
                        </div>
                    </DialogContent>
                </form>
            </Dialog>
        </>
    );
};

export default ProductFormModal;
