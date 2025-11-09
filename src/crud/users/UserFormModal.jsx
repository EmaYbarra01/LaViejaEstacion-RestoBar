import { TextField, Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import "./UserFormModal.css";

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
            <TextField
              fullwidth
              margin="dense"
              name="name"
              value={form.name}
              onChange={handleChange}
              label="Nombre"
              required
            />
            <TextField
              fullwidth
              margin="dense"
              name="email"
              label="Correo Electronico"
              value={form.email}
              onChange={handleChange}
              required
            />
            <TextField
              fullwidth
              margin="dense"
              name="role"
              label="Rol"
              value={form.role}
              onChange={handleChange}
              required
            />
            <TextField
              fullwidth
              margin="dense"
              name="password"
              label="Contraseña"
              value={form.password}
              onChange={handleChange}
              required
            />
            <Button type="submit" variant="contained" color="primary">
              {isEdit ? "Actualizar Usuario" : "Crear Usuario"}
            </Button>
            <Button onClick={onClose}> Cancelar </Button>
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
};

export default UserFormModal;
