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
  Chip
} from "@mui/material";
import Swal from 'sweetalert2';
import useUserStore from '../store/useUserStore';
import "./AdminPage.css";

const createEmptyUserForm = () => ({
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  rol: "",
  password: ""
});

const normalizeUserForm = (user) => ({
  id: user?.id || user?._id || "",
  nombre: user?.nombre || user?.name || "",
  apellido: user?.apellido || "",
  dni: user?.dni || "",
  email: user?.email || "",
  rol: user?.rol || user?.role || "",
  password: ""
});

const Users = () => {
  const { user } = useUserStore();
  const isSuperAdmin = user?.role === 'SuperAdministrador';
  const isGerente = user?.role === 'Gerente';
  const canEdit = isSuperAdmin; // Solo SuperAdmin puede editar
  const canView = isSuperAdmin || isGerente; // Ambos pueden ver
  
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState(createEmptyUserForm());

  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await getAllUsers();
      // Asegurar que siempre sea un array
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]); // Establecer array vacío en caso de error
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

    const payload = {
      ...form,
      password: form.password?.trim() || undefined
    };

    try {
      if (isEdit) {
        const updatedUser = await updateUser(form.id, payload);
        setUsers(
          users.map((userItem) => (userItem.id === form.id ? updatedUser : userItem))
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
        const newUser = await createUser(payload);
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
    setForm(normalizeUserForm(user));
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
          {isGerente ? '🔍 Supervisión de Usuarios' : '👥 Gestión de Usuarios'}
        </h1>
        {isGerente && (
          <Chip 
            label="Solo Lectura" 
            color="warning" 
            size="small" 
            style={{ marginLeft: '10px' }}
          />
        )}
        {canEdit && (
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
        )}
      </div>
      {isGerente && (
        <div style={{ padding: '10px', background: '#fff3cd', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffc107' }}>
          <p style={{ margin: 0, color: '#856404' }}>📋 Solo visualización - Sin edición permitida</p>
        </div>
      )}

      <UserFormModal
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isEdit={isEdit}
        open={openModal}        
        onClose={() => {
          setIsEdit(false);
          setForm(createEmptyUserForm());
          handleCloseModal();
        }}
      />

      <TableContainer className="admin-table-container">
        <Table className="admin-table">
          <TableHead>
            <TableRow>
              <TableCell>Nombre completo</TableCell>
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
                  <TableCell>{user.nombreCompleto || `${user.nombre || ''} ${user.apellido || ''}`.trim()}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`role-badge ${String(user.rol || '').toLowerCase()}`}>
                      {user.rol}
                    </span>
                  </TableCell>
                  <TableCell>
                    {canEdit ? (
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
                    ) : (
                      <span style={{ color: '#999', fontSize: '0.9rem' }}>Solo visualización</span>
                    )}
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
