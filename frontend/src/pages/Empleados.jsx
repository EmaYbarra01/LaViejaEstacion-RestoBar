import { useEffect, useState } from "react";
import { 
  getAllEmpleados, 
  createEmpleado, 
  updateEmpleado, 
  desactivarEmpleado,
  deleteEmpleado,
  registrarAsistencia,
  registrarPago,
  registrarInasistencia
} from "../helpers/queriesEmpleados";
import EmpleadoFormModal from "../crud/empleados/EmpleadoFormModal";
import AsistenciaModal from "../crud/empleados/AsistenciaModal";
import PagoModal from "../crud/empleados/PagoModal";
import InasistenciaModal from "../crud/empleados/InasistenciaModal";
import useUserStore from '../store/useUserStore';
import {
  Button,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Table,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import PaymentIcon from '@mui/icons-material/Payment';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BlockIcon from '@mui/icons-material/Block';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Swal from 'sweetalert2';
import "./AdminPage.css";

const Empleados = () => {
  const { user } = useUserStore();
  const isSuperAdmin = user?.role === 'SuperAdministrador';
  const isGerente = user?.role === 'Gerente';
  const canEdit = isSuperAdmin; // Solo SuperAdministrador puede editar
  const canView = isSuperAdmin || isGerente; // Ambos pueden ver
  
  const [empleados, setEmpleados] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openAsistenciaModal, setOpenAsistenciaModal] = useState(false);
  const [openPagoModal, setOpenPagoModal] = useState(false);
  const [openInasistenciaModal, setOpenInasistenciaModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuEmpleado, setMenuEmpleado] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    dni: "",
    telefono: "",
    password: "",
    cargo: "",
    salarioMensual: "",
    activo: true
  });

  const [asistenciaForm, setAsistenciaForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    presente: true,
    horaEntrada: "",
    horaSalida: "",
    observaciones: ""
  });

  const [pagoForm, setPagoForm] = useState({
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    monto: "",
    metodoPago: "Efectivo",
    observaciones: ""
  });

  const [inasistenciaForm, setInasistenciaForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    motivo: "Sin registrar asistencia",
    observaciones: ""
  });

  useEffect(() => {
    loadEmpleados();
  }, []);

  const loadEmpleados = async () => {
    try {
      const empleadosData = await getAllEmpleados();
      setEmpleados(empleadosData);
    } catch (err) {
      console.error("Error al cargar empleados:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los empleados',
        confirmButtonColor: '#667eea'
      });
    }
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleAsistenciaChange = (e) => {
    const { name, value } = e.target;
    setAsistenciaForm({
      ...asistenciaForm,
      [name]: value,
    });
  };

  const handlePagoChange = (e) => {
    const { name, value } = e.target;
    setPagoForm({
      ...pagoForm,
      [name]: value,
    });
  };

  const handleInasistenciaChange = (e) => {
    const { name, value } = e.target;
    setInasistenciaForm({
      ...inasistenciaForm,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEdit) {
        const response = await updateEmpleado(selectedEmpleado._id, {
          cargo: form.cargo,
          salarioMensual: parseFloat(form.salarioMensual),
          activo: form.activo
        });
        
        await Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Empleado actualizado correctamente',
          confirmButtonColor: '#667eea',
          timer: 2000
        });
      } else {
        const response = await createEmpleado({
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          dni: form.dni,
          telefono: form.telefono,
          password: form.password,
          cargo: form.cargo,
          salarioMensual: parseFloat(form.salarioMensual)
        });
        
        await Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'Empleado agregado correctamente',
          confirmButtonColor: '#667eea',
          timer: 2000
        });
      }
      
      setOpenModal(false);
      resetForm();
      loadEmpleados();
    } catch (err) {
      console.error("Error al guardar empleado:", err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Error al guardar el empleado',
        confirmButtonColor: '#667eea'
      });
    }
  };

  const handleAsistenciaSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await registrarAsistencia(selectedEmpleado._id, asistenciaForm);
      
      await Swal.fire({
        icon: 'success',
        title: '✅ Asistencia Registrada',
        text: 'La asistencia se registró correctamente',
        confirmButtonColor: '#4caf50',
        timer: 2000
      });
      
      setOpenAsistenciaModal(false);
      resetAsistenciaForm();
      loadEmpleados();
    } catch (err) {
      console.error("Error al registrar asistencia:", err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Error al registrar la asistencia',
        confirmButtonColor: '#667eea'
      });
    }
  };

  const handlePagoSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await registrarPago(selectedEmpleado._id, {
        mes: parseInt(pagoForm.mes),
        anio: parseInt(pagoForm.anio),
        monto: parseFloat(pagoForm.monto),
        metodoPago: pagoForm.metodoPago,
        observaciones: pagoForm.observaciones
      });
      
      await Swal.fire({
        icon: 'success',
        title: '💰 Pago Registrado',
        text: 'El pago se registró correctamente',
        confirmButtonColor: '#ff9800',
        timer: 2000
      });
      
      setOpenPagoModal(false);
      resetPagoForm();
      loadEmpleados();
    } catch (err) {
      console.error("Error al registrar pago:", err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Error al registrar el pago',
        confirmButtonColor: '#667eea'
      });
    }
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      apellido: "",
      email: "",
      dni: "",
      telefono: "",
      password: "",
      cargo: "",
      salarioMensual: "",
      activo: true
    });
    setIsEdit(false);
    setSelectedEmpleado(null);
  };

  const resetAsistenciaForm = () => {
    setAsistenciaForm({
      fecha: new Date().toISOString().split('T')[0],
      presente: true,
      horaEntrada: "",
      horaSalida: "",
      observaciones: ""
    });
    setSelectedEmpleado(null);
  };

  const resetPagoForm = () => {
    setPagoForm({
      mes: new Date().getMonth() + 1,
      anio: new Date().getFullYear(),
      monto: "",
      metodoPago: "Efectivo",
      observaciones: ""
    });
    setSelectedEmpleado(null);
  };

  const resetInasistenciaForm = () => {
    setInasistenciaForm({
      fecha: new Date().toISOString().split('T')[0],
      motivo: "Sin registrar asistencia",
      observaciones: ""
    });
    setSelectedEmpleado(null);
  };

  const handleEdit = (empleado) => {
    setIsEdit(true);
    setSelectedEmpleado(empleado);
    setForm({
      cargo: empleado.cargo,
      salarioMensual: empleado.salarioMensual,
      activo: empleado.activo
    });
    setOpenModal(true);
  };

  const handleDesactivar = async (empleado) => {
    const result = await Swal.fire({
      title: '¿Desactivar empleado?',
      html: `Se desactivará a <strong>${empleado.usuario?.nombre} ${empleado.usuario?.apellido}</strong><br><small>Podrás reactivarlo después editándolo</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff9800',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await desactivarEmpleado(empleado._id);
        await Swal.fire({
          icon: 'success',
          title: 'Desactivado',
          text: 'Empleado desactivado correctamente',
          confirmButtonColor: '#667eea',
          timer: 2000
        });
        loadEmpleados();
      } catch (err) {
        console.error("Error al desactivar empleado:", err);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo desactivar el empleado',
          confirmButtonColor: '#667eea'
        });
      }
    }
  };

  const handleEliminar = async (empleado) => {
    const result = await Swal.fire({
      title: '⚠️ ¡ADVERTENCIA!',
      html: `<p>Vas a <strong style="color: #d32f2f;">ELIMINAR PERMANENTEMENTE</strong> a:</p>
             <p><strong>${empleado.usuario?.nombre} ${empleado.usuario?.apellido}</strong></p>
             <p style="color: #d32f2f; font-weight: bold;">Esta acción NO se puede deshacer</p>
             <p>Se eliminarán todos los datos del empleado y su usuario</p>`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#757575',
      confirmButtonText: 'Sí, eliminar permanentemente',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    });

    if (result.isConfirmed) {
      try {
        await deleteEmpleado(empleado._id);
        await Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Empleado eliminado permanentemente',
          confirmButtonColor: '#667eea',
          timer: 2000
        });
        loadEmpleados();
      } catch (err) {
        console.error("Error al eliminar empleado:", err);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el empleado',
          confirmButtonColor: '#667eea'
        });
      }
    }
  };

  const handleOpenAsistencia = (empleado) => {
    setSelectedEmpleado(empleado);
    setAsistenciaForm({
      fecha: new Date().toISOString().split('T')[0],
      presente: true,
      horaEntrada: "",
      horaSalida: "",
      observaciones: ""
    });
    setOpenAsistenciaModal(true);
  };

  const handleOpenPago = (empleado) => {
    setSelectedEmpleado(empleado);
    setPagoForm({
      mes: new Date().getMonth() + 1,
      anio: new Date().getFullYear(),
      monto: empleado.salarioMensual,
      metodoPago: "Efectivo",
      observaciones: ""
    });
    setOpenPagoModal(true);
  };

  const handleOpenInasistencia = (empleado) => {
    setSelectedEmpleado(empleado);
    setInasistenciaForm({
      fecha: new Date().toISOString().split('T')[0],
      motivo: "Sin registrar asistencia",
      observaciones: ""
    });
    setOpenInasistenciaModal(true);
  };

  const handleInasistenciaSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await registrarInasistencia(selectedEmpleado._id, inasistenciaForm);
      
      await Swal.fire({
        icon: 'warning',
        title: '❌ Inasistencia Registrada',
        text: 'La inasistencia se registró correctamente',
        confirmButtonColor: '#f44336',
        timer: 2000
      });
      
      setOpenInasistenciaModal(false);
      resetInasistenciaForm();
      loadEmpleados();
    } catch (err) {
      console.error("Error al registrar inasistencia:", err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Error al registrar la inasistencia',
        confirmButtonColor: '#667eea'
      });
    }
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsEdit(false);
    setOpenModal(true);
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">
          👥 {isGerente ? 'Supervisión de Empleados' : 'Gestión de Empleados'}
          {isGerente && <Chip label="Solo Lectura" size="small" color="info" sx={{ ml: 2 }} />}
        </h1>
        {canEdit && (
          <Button
            variant="contained"
            onClick={handleOpenCreate}
            sx={{
              bgcolor: '#667eea',
              '&:hover': { bgcolor: '#5568d3' },
              fontWeight: 'bold',
              boxShadow: 3
            }}
          >
            ➕ Agregar Empleado
          </Button>
        )}
      </div>

      <Paper elevation={3} sx={{ mt: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Cargo</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Salario</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Asistencias</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Inasistencias</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Pago Mes</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Estado</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {empleados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    No hay empleados registrados
                  </TableCell>
                </TableRow>
              ) : (
                empleados.map((empleado) => (
                  <TableRow key={empleado._id} hover>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{empleado.usuario?.nombre} {empleado.usuario?.apellido}</span>
                        {empleado.esUsuarioMadre && (
                          <Chip 
                            label="BASE" 
                            size="small" 
                            color="secondary"
                            sx={{ 
                              fontWeight: 'bold',
                              backgroundColor: '#ffc107',
                              color: '#000'
                            }}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{empleado.usuario?.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={empleado.cargo} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      ${empleado.salarioMensual?.toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={empleado.diasTrabajados || 0} 
                        size="small" 
                        color="success"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={empleado.diasInasistencias || 0} 
                        size="small" 
                        color="error"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {empleado.pagadoMesActual ? (
                        <Chip label="✅ Pagado" size="small" color="success" />
                      ) : (
                        <Chip label="⏳ Pendiente" size="small" color="warning" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {empleado.activo ? (
                        <Chip label="Activo" size="small" color="success" />
                      ) : (
                        <Chip label="Inactivo" size="small" color="error" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {canEdit ? (
                        <>
                          {/* Solo permitir acciones de empleado si tiene registro completo */}
                          {!empleado.esUsuarioMadre && (
                            <>
                              <Tooltip title="Registrar Asistencia">
                                <IconButton 
                                  onClick={() => handleOpenAsistencia(empleado)}
                                  color="success"
                                  size="small"
                                >
                                  <EventIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Registrar Inasistencia">
                                <IconButton 
                                  onClick={() => handleOpenInasistencia(empleado)}
                                  color="error"
                                  size="small"
                                >
                                  <EventBusyIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Registrar Pago">
                                <IconButton 
                                  onClick={() => handleOpenPago(empleado)}
                                  color="warning"
                                  size="small"
                                >
                                  <PaymentIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title={empleado.esUsuarioMadre ? "Usuario BASE - No editable" : "Editar"}>
                            <span>
                              <IconButton 
                                onClick={() => !empleado.esUsuarioMadre && handleEdit(empleado)}
                                color="primary"
                                size="small"
                                disabled={empleado.esUsuarioMadre}
                              >
                                <EditIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={empleado.esUsuarioMadre ? "Usuario BASE - No eliminable" : "Más opciones"}>
                            <span>
                              <IconButton 
                                onClick={(e) => {
                                  if (!empleado.esUsuarioMadre) {
                                    setAnchorEl(e.currentTarget);
                                    setMenuEmpleado(empleado);
                                  }
                                }}
                                size="small"
                                disabled={empleado.esUsuarioMadre}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </>
                      ) : (
                        <Chip label="Solo visualización" size="small" color="default" variant="outlined" />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <EmpleadoFormModal
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isEdit={isEdit}
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          resetForm();
        }}
      />

      <AsistenciaModal
        form={asistenciaForm}
        handleChange={handleAsistenciaChange}
        handleSubmit={handleAsistenciaSubmit}
        open={openAsistenciaModal}
        onClose={() => {
          setOpenAsistenciaModal(false);
          resetAsistenciaForm();
        }}
        empleado={selectedEmpleado}
      />

      <PagoModal
        form={pagoForm}
        handleChange={handlePagoChange}
        handleSubmit={handlePagoSubmit}
        open={openPagoModal}
        onClose={() => {
          setOpenPagoModal(false);
          resetPagoForm();
        }}
        empleado={selectedEmpleado}
      />

      <InasistenciaModal
        form={inasistenciaForm}
        handleChange={handleInasistenciaChange}
        handleSubmit={handleInasistenciaSubmit}
        open={openInasistenciaModal}
        onClose={() => {
          setOpenInasistenciaModal(false);
          resetInasistenciaForm();
        }}
        empleado={selectedEmpleado}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setMenuEmpleado(null);
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={() => {
            handleDesactivar(menuEmpleado);
            setAnchorEl(null);
            setMenuEmpleado(null);
          }}
        >
          <ListItemIcon>
            <BlockIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Desactivar</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleEliminar(menuEmpleado);
            setAnchorEl(null);
            setMenuEmpleado(null);
          }}
          sx={{ color: '#d32f2f' }}
        >
          <ListItemIcon>
            <DeleteForeverIcon fontSize="small" sx={{ color: '#d32f2f' }} />
          </ListItemIcon>
          <ListItemText>Eliminar Permanentemente</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default Empleados;
