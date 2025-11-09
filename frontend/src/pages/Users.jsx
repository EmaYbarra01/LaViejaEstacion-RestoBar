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
} from "@mui/material";

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
        alert("Usuario actualizado correctamente");
      } else {
        const newUser = await createUser(form);
        setUsers([...users, newUser]);
        setOpenModal(false);
        alert("Usuario agregado correctamente");
      }
    } catch (err) {
      console.error("Error submitting user:", err);
      alert("Error al procesar el usuario");
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
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        await deleteUser(id);
        setUsers(users.filter((user) => user.id !== id));
        alert("Usuario eliminado correctamente");
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Error al eliminar el usuario");
      }
    }
  };
  return (
    <>
      <Button
        variant="contained"
        color="primary"
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
        Crear
      </Button>
      <UserFormModal
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isEdit={isEdit}
        open={openModal}        
        onClose={handleCloseModal}
      />

      <h1>Usuarios</h1>
      <TableContainer>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Correo Electronico</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleEditUser(user)}
                >
                  Editar
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </>
  );
};

export default Users;
