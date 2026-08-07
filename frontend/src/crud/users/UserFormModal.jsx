import {
  TextField,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem
} from "@mui/material";
import "./UserFormModal.css";

const rolesPermitidos = [
  "SuperAdministrador",
  "Gerente",
  "Mozo",
  "Cajero",
  "EncargadoCocina"
];

const UserFormModal = (props) => {
    const { form, handleChange, handleSubmit, isEdit, open, onClose } = props;
  return (
    <>
      <Dialog open={open} onClose={onClose} >
        <DialogTitle>
          {isEdit ? "Editar Usuario" : "Crear Usuario"}
        </DialogTitle>
        <form id="user-form" onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="nombre"
                  value={form.nombre || ""}
                  onChange={handleChange}
                  label="Nombre"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="apellido"
                  value={form.apellido || ""}
                  onChange={handleChange}
                  label="Apellido"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="dni"
                  value={form.dni || ""}
                  onChange={handleChange}
                  label="DNI"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="email"
                  label="Correo Electrónico"
                  value={form.email || ""}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  margin="dense"
                  name="rol"
                  label="Rol"
                  value={form.rol || ""}
                  onChange={handleChange}
                  required
                >
                  {rolesPermitidos.map((rol) => (
                    <MenuItem key={rol} value={rol}>
                      {rol}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="password"
                  label={isEdit ? "Contraseña nueva (opcional)" : "Contraseña"}
                  type="password"
                  value={form.password || ""}
                  onChange={handleChange}
                  required={!isEdit}
                  helperText={isEdit ? "Dejar vacío para conservar la contraseña actual" : "Mínimo 6 caracteres"}
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button type="button" onClick={onClose}>Cancelar</Button>
                <Button type="submit" variant="contained" color="primary">
                  {isEdit ? "Actualizar Usuario" : "Crear Usuario"}
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
};

export default UserFormModal;
