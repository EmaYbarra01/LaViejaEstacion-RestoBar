import UserFormModal from "../crud/users/UserFormModal";
import { getAllUsers, createUser, updateUser, deleteUser } from "../helpers/queriesUsuarios";
import { useEffect, useState } from "react";
import {
  Button,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Table,
} from "@mui/material";
import Swal from 'sweetalert2';
import "./AdminPage.css";

const Users = () => {
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        const updatedUser = await updateUser(form.id, form);
        setUsers(
          users.map((user) => (user.id === form.id ? updatedUser : user))
        );
        setOpenModal(false);
        await Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Usuario actualizado correctamente',
          confirmButtonColor: '#667eea',
          timer: 2000
        });
      } else {
        const newUser = await createUser(form);
        setUsers([...users, newUser]);
        setOpenModal(false);
        await Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'Usuario agregado correctamente',
          confirmButtonColor: '#667eea',
          timer: 2000
        });
      }
    } catch (err) {
      console.error("Error submitting user:", err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.mensaje || 'Error al procesar el usuario',
        confirmButtonColor: '#667eea'
      });
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleEditUser = (user) => {
    setIsEdit(true);
    setForm(user);
    handleOpenModal();
  };

  const handleDeleteUser = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#667eea',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(id);
        setUsers(users.filter((user) => user.id !== id));
        await Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'Usuario eliminado correctamente',
          confirmButtonColor: '#667eea',
          timer: 2000
        });
      } catch (err) {
        console.error("Error deleting user:", err);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al eliminar el usuario',
          confirmButtonColor: '#667eea'
        });
      }
    }
  };
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          👥 Gestión de Usuarios
        </h1>
        <Button
          variant="contained"
          className="create-button"
          onClick={() => {
            setIsEdit(false);
            setForm({
              name: "",
              email: "",
              role: "",
              password: "",
            });
            handleOpenModal();
          }}
        >
          ➕ Crear Usuario
        </Button>
      </div>

      <UserFormModal
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isEdit={isEdit}
        open={openModal}        
        onClose={handleCloseModal}
      />

      <TableContainer className="admin-table-container">
        <Table className="admin-table">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Correo Electrónico</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="empty-table">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="action-buttons">
                      <Button
                        variant="contained"
                        className="edit-button"
                        onClick={() => handleEditUser(user)}
                      >
                        ✏️ Editar
                      </Button>
                      <Button
                        variant="contained"
                        className="delete-button"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        🗑️ Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Users;
