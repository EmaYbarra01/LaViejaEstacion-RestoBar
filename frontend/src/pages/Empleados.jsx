import { useEffect, useState } from "react";
import { 
  getAllEmpleados, 
  getEstadosEmpleadosPorDia,
  createEmpleado, 
  updateEmpleado, 
  desactivarEmpleado,
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
  Box,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Table,
  Chip,
  Paper,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import PaymentIcon from '@mui/icons-material/Payment';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Swal from 'sweetalert2';
import { formatCurrency } from '../utils/currencyFormatter';
import "./AdminPage.css";

const Empleados = () => {
  const { user } = useUserStore();
  const isSuperAdmin = user?.role === 'SuperAdministrador';
  const isGerente = user?.role === 'Gerente';
  const canEdit = isSuperAdmin; // Solo SuperAdministrador puede editar
  
  const [empleados, setEmpleados] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [fechaEstado, setFechaEstado] = useState("");
  const [historialEstados, setHistorialEstados] = useState(null);
  const [errorHistorial, setErrorHistorial] = useState("");
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openAsistenciaModal, setOpenAsistenciaModal] = useState(false);
  const [openPagoModal, setOpenPagoModal] = useState(false);
  const [openInasistenciaModal, setOpenInasistenciaModal] = useState(false);
  const [openInformePago, setOpenInformePago] = useState(false);
  const [openDetalleModal, setOpenDetalleModal] = useState(false);
  const [empleadoDetalle, setEmpleadoDetalle] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuEmpleado, setMenuEmpleado] = useState(null);

  const SALARIOS_POR_CARGO = {
    'SuperAdministrador': 1800000,
    'Gerente': 1550000,
    'Encargado de Cocina': 1400000,
    'Mozo': 1050000,
    'Cajero': 1200000
  };

  const getSalarioEmpleado = (empleado) => {
    if (empleado.salarioMensual > 0) {
      return empleado.salarioMensual;
    }
    return SALARIOS_POR_CARGO[empleado.cargo] || 0;
  };

  const getSalarioInforme = (empleado) => {
    const salario = Number(empleado?.sueldo ?? empleado?.salarioMensual ?? empleado?.salario ?? 0);
    return Number.isFinite(salario) && salario >= 0 ? salario : 0;
  };

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
    console.log('Empleados montado, cargando...');
    loadEmpleados();
  }, []);

  useEffect(() => {
    if (!isSuperAdmin || !fechaEstado) return;
    const controller = new AbortController();
    setCargandoHistorial(true);
    setHistorialEstados(null);
    setErrorHistorial("");
    getEstadosEmpleadosPorDia(fechaEstado, controller.signal)
      .then((resultado) => {
        if (!controller.signal.aborted) setHistorialEstados(resultado);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Error al consultar el historial de empleados:", error);
        setErrorHistorial(error.response?.data?.message || "No se pudo consultar el historial de empleados");
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargandoHistorial(false);
      });
    return () => controller.abort();
  }, [fechaEstado, isSuperAdmin]);

  const loadEmpleados = async () => {
    try {
      const empleadosData = await getAllEmpleados();
      console.log('Empleados cargados:', empleadosData);
      setEmpleados(empleadosData);
    } catch (err) {
      console.error("Error al cargar empleados:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los empleados',
        confirmButtonColor: '#4f222b'
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
        if (selectedEmpleado?.esUsuarioMadre) {
          await createEmpleado({
            nombre: selectedEmpleado.usuario.nombre,
            apellido: selectedEmpleado.usuario.apellido,
            email: selectedEmpleado.usuario.email,
            dni: selectedEmpleado.usuario.dni || '',
            telefono: selectedEmpleado.usuario.telefono || '',
            password: '',
            cargo: form.cargo,
            salarioMensual: parseFloat(form.salarioMensual)
          });
          
          await Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: 'Empleado creado correctamente',
            confirmButtonColor: '#4f222b',
            timer: 2000
          });
        } else {
          await updateEmpleado(selectedEmpleado._id, {
            cargo: form.cargo,
            salarioMensual: parseFloat(form.salarioMensual),
            activo: form.activo
          });
          
          await Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: 'Empleado actualizado correctamente',
            confirmButtonColor: '#4f222b',
            timer: 2000
          });
        }
      } else {
        await createEmpleado({
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
          confirmButtonColor: '#4f222b',
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
        text: err.response?.data?.message || err.response?.data?.error || 'Error al guardar el empleado',
        confirmButtonColor: '#4f222b'
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
        confirmButtonColor: '#642f3a',
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
        confirmButtonColor: '#4f222b'
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
      
      const mesPago = parseInt(pagoForm.mes);
      const anioPago = parseInt(pagoForm.anio);
      const esMesActual = mesPago === new Date().getMonth() + 1 && anioPago === new Date().getFullYear();
      
      setEmpleados(prevEmpleados => prevEmpleados.map(emp => {
        if (emp._id === selectedEmpleado._id) {
          return {
            ...emp,
            pagadoMesActual: esMesActual ? true : emp.pagadoMesActual,
            pagos: [...(emp.pagos || []), {
              mes: mesPago,
              anio: anioPago,
              monto: parseFloat(pagoForm.monto),
              metodoPago: pagoForm.metodoPago,
              observaciones: pagoForm.observaciones,
              fechaPago: new Date()
            }]
          };
        }
        return emp;
      }));
      
      await Swal.fire({
        icon: 'success',
        title: '💰 Pago Registrado',
        text: 'El pago se registró correctamente',
        confirmButtonColor: '#4f222b',
        timer: 2000
      });
      
      setOpenPagoModal(false);
      resetPagoForm();
    } catch (err) {
      console.error("Error al registrar pago:", err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Error al registrar el pago',
        confirmButtonColor: '#4f222b'
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
    const salarioPorDefecto = SALARIOS_POR_CARGO[empleado.cargo] || 0;
    const salarioReal = empleado.salarioMensual || empleado.salario || 0;
    setForm({
      cargo: empleado.cargo,
      salarioMensual: salarioReal > 0 ? salarioReal : salarioPorDefecto,
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
      confirmButtonColor: '#4f222b',
      cancelButtonColor: '#3b2428',
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
          confirmButtonColor: '#4f222b',
          timer: 2000
        });
        loadEmpleados();
      } catch (err) {
        console.error("Error al desactivar empleado:", err);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo desactivar el empleado',
          confirmButtonColor: '#4f222b'
        });
      }
    }
  };

  const handleActivar = async (empleado) => {
    try {
      await updateEmpleado(empleado._id, { activo: true });
      await Swal.fire({
        icon: 'success',
        title: 'Activado',
        text: 'Empleado activado correctamente',
        confirmButtonColor: '#4f222b',
        timer: 2000
      });
      loadEmpleados();
    } catch (err) {
      console.error("Error al activar empleado:", err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo activar el empleado',
        confirmButtonColor: '#4f222b'
      });
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
      monto: getSalarioEmpleado(empleado),
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
        confirmButtonColor: '#4f222b'
      });
    }
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsEdit(false);
    setOpenModal(true);
  };

  const esHistorico = isSuperAdmin && Boolean(fechaEstado);
  const empleadosVisibles = esHistorico ? (historialEstados?.empleados || []) : empleados;
  const empleadosActivos = empleadosVisibles.filter((empleado) => empleado.activo).length;
  const empleadosFiltrados = empleadosVisibles.filter((empleado) => (
    !isSuperAdmin || filtroEstado === "todos" || empleado.activo === (filtroEstado === "activos")
  ));
  const pagosInforme = (Array.isArray(empleados) ? empleados : [])
    .filter((empleado) => Boolean(empleado?.activo))
    .map((empleado) => ({
      empleado,
      monto: getSalarioInforme(empleado)
    }));
  const totalPagoInforme = pagosInforme.reduce((total, { monto }) => total + monto, 0);
  const hoyArgentina = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const cerrarMenuEmpleado = () => {
    setAnchorEl(null);
    setMenuEmpleado(null);
  };
  const abrirDetalleEmpleado = (empleado) => {
    setEmpleadoDetalle(empleado);
    setOpenDetalleModal(true);
    cerrarMenuEmpleado();
  };

  return (
    <div className="admin-container employees-panel-page">
      {console.log('RENDER Empleados, count:', empleados.length)}
      <div className="admin-header" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <h1 className="admin-title">
          {isGerente ? 'Supervisión de Empleados' : 'Gestión de Empleados'}
          {isGerente && (
            <Chip
              label="Solo lectura"
              size="small"
              sx={{
                ml: 2,
                color: 'var(--panel-wine, #4f222b)',
                backgroundColor: 'rgba(243, 231, 205, 0.9)',
                border: '1px solid rgba(100, 47, 58, 0.25)',
                fontWeight: 700
              }}
            />
          )}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<PaymentIcon />}
            onClick={() => setOpenInformePago(true)}
            sx={{
              backgroundColor: 'var(--panel-wine, #4f222b)',
              color: '#f5efe6',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'var(--panel-dark, #3b2428)',
                color: '#f5efe6'
              }
            }}
          >
            Informe de pago total
          </Button>
          {canEdit && (
            <Button
              variant="contained"
              onClick={handleOpenCreate}
              sx={{
                bgcolor: 'var(--panel-wine, #4f222b)',
                color: '#f5efe6',
                '&:hover': { bgcolor: 'var(--panel-dark, #3b2428)' },
                fontWeight: 'bold',
                boxShadow: 3
              }}
            >
              ➕ Agregar Empleado
            </Button>
          )}
        </div>
      </div>

      {isSuperAdmin && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <div className="products-filter-field" style={{ flex: "0 1 220px" }}>
              <label htmlFor="empleados-filtro-estado">Estado</label>
              <select
                id="empleados-filtro-estado"
                className="select-filtro"
                value={filtroEstado}
                onChange={(event) => setFiltroEstado(event.target.value)}
              >
                <option value="todos">Todos{!esHistorico || historialEstados ? ` · ${empleadosVisibles.length}` : ""}</option>
                <option value="activos">Activos{!esHistorico || historialEstados ? ` · ${empleadosActivos}` : ""}</option>
                <option value="inactivos">Inactivos{!esHistorico || historialEstados ? ` · ${empleadosVisibles.length - empleadosActivos}` : ""}</option>
              </select>
            </div>
            <div className="products-filter-field" style={{ flex: "0 1 220px" }}>
              <label htmlFor="empleados-fecha-estado">Fecha</label>
              <input
                id="empleados-fecha-estado"
                type="date"
                max={hoyArgentina}
                value={fechaEstado}
                onChange={(event) => {
                  setHistorialEstados(null);
                  setErrorHistorial("");
                  setFechaEstado(event.target.value);
                }}
              />
            </div>
          </div>
          {esHistorico && (
            <p role={errorHistorial ? "alert" : "status"} style={{ color: "var(--app-text-muted)", fontSize: "0.8rem", margin: "0.5rem 0 0" }}>
              {errorHistorial || (cargandoHistorial ? "Cargando historial..." : historialEstados && `Vista histórica de solo lectura. Registro disponible desde ${historialEstados.inicio} (hora argentina).`)}
            </p>
          )}
        </>
      )}

      <Paper className="employees-table-container" elevation={3} sx={{ mt: 2, width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ width: '100%', overflowX: 'hidden' }}>
          <Table
            size="small"
            sx={{
              width: '100%',
              tableLayout: 'fixed',
              '& .MuiTableCell-root': {
                boxSizing: 'border-box',
                px: { xs: 0.75, sm: 1, md: 1.25 },
                py: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }
            }}
          >
            <TableHead>
              <TableRow sx={{ bgcolor: 'var(--panel-wine, #4f222b)' }}>
                <TableCell sx={{ width: { xs: '56%', sm: '40%', md: '16%', xl: '15%' }, fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, width: { md: '19%', xl: '17%' }, fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, width: { sm: '24%', md: '12%', xl: '10%' }, fontWeight: 'bold' }}>Cargo</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, width: { md: '10%', xl: '9%' }, fontWeight: 'bold' }}>Salario</TableCell>
                <TableCell
                  align="center"
                  sx={{ display: { xs: 'none', xl: 'table-cell' }, width: '15%', fontWeight: 'bold' }}
                >
                  Asistencia
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ display: { xs: 'none', md: 'table-cell' }, width: { md: '13%', xl: '12%' }, fontWeight: 'bold' }}
                >
                  Pago Mes
                </TableCell>
                <TableCell align="center" sx={{ width: { xs: '20%', sm: '16%', md: '11%', xl: '10%' }, fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell align="center" sx={{ width: { xs: '24%', sm: '20%', md: '19%', xl: '12%' }, fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {empleadosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    {esHistorico && (cargandoHistorial || errorHistorial) ? "Historial no disponible" : empleadosVisibles.length === 0 ? (esHistorico ? "No hay información histórica para esta fecha" : "No hay empleados registrados") : "No hay empleados con este estado"}
                  </TableCell>
                </TableRow>
              ) : (
                empleadosFiltrados.map((empleado) => (
                  <TableRow key={empleado._id} hover>
                    <TableCell sx={{ width: { xs: '56%', sm: '40%', md: '16%', xl: '15%' } }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {empleado.usuario?.nombre} {empleado.usuario?.apellido}
                        </span>
                        {empleado.esUsuarioMadre && (
                          <Chip 
                            label="BASE" 
                            size="small" 
                            sx={{ 
                              flexShrink: 0,
                              height: 20,
                              fontWeight: 700,
                              backgroundColor: 'rgba(243, 231, 205, 0.9)',
                              color: 'var(--panel-wine, #4f222b)'
                            }}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      title={empleado.usuario?.email || ''}
                      sx={{ display: { xs: 'none', md: 'table-cell' }, width: { md: '19%', xl: '17%' } }}
                    >
                      {empleado.usuario?.email || '—'}
                    </TableCell>
                    <TableCell
                      sx={{
                        display: { xs: 'none', sm: 'table-cell' },
                        width: { sm: '24%', md: '12%', xl: '10%' },
                        color: 'var(--panel-dark, #3b2428)'
                      }}
                    >
                      {empleado.cargo || '—'}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', md: 'table-cell' }, width: { md: '10%', xl: '9%' } }}
                    >
                      {esHistorico ? "—" : `$${formatCurrency(getSalarioEmpleado(empleado))}`}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ display: { xs: 'none', xl: 'table-cell' }, width: '15%' }}
                    >
                      {esHistorico
                        ? "—"
                        : `${Number(empleado.diasTrabajados ?? 0)} presentes · ${Number(empleado.diasInasistencias ?? 0)} ausencias`}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ display: { xs: 'none', md: 'table-cell' }, width: { md: '13%', xl: '12%' } }}
                    >
                      {esHistorico ? "—" : (
                        <Typography
                          component="span"
                          sx={{
                            color: 'var(--panel-dark, #3b2428)',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          {empleado.pagadoMesActual ? 'Pagado' : 'Pendiente'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center" sx={{ width: { xs: '20%', sm: '16%', md: '11%', xl: '10%' } }}>
                      <Typography
                        component="span"
                        sx={{
                          color: 'var(--panel-dark, #3b2428)',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        {empleado.activo ? 'Activo' : 'Inactivo'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ width: { xs: '24%', sm: '20%', md: '19%', xl: '12%' } }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<MoreVertIcon />}
                        aria-haspopup="menu"
                        aria-label={`Acciones de ${empleado.usuario?.nombre || 'empleado'}`}
                        title={canEdit && !esHistorico ? 'Acciones del empleado' : 'Ver detalle (solo lectura)'}
                        onClick={(event) => {
                          setAnchorEl(event.currentTarget);
                          setMenuEmpleado(empleado);
                        }}
                        sx={{
                          minWidth: 0,
                          px: { xs: 0.5, sm: 1 },
                          borderColor: 'rgba(100, 47, 58, 0.35)',
                          color: 'var(--panel-wine, #4f222b)',
                          textTransform: 'none',
                          '& .MuiButton-startIcon': {
                            mr: { xs: 0, sm: 0.75 }
                          },
                          '&:hover': {
                            borderColor: 'var(--panel-wine, #4f222b)',
                            color: '#f5efe6',
                            backgroundColor: 'var(--panel-wine, #4f222b)'
                          }
                        }}
                      >
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                          Acciones
                        </Box>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={openDetalleModal}
        onClose={() => {
          setOpenDetalleModal(false);
          setEmpleadoDetalle(null);
        }}
        aria-labelledby="detalle-empleado-title"
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            border: '1px solid rgba(100, 47, 58, 0.2)',
            borderRadius: 2,
            backgroundColor: 'var(--panel-cream, #f3e7cd)',
            color: 'var(--panel-dark, #3b2428)'
          }
        }}
      >
        <DialogTitle id="detalle-empleado-title" sx={{ color: 'var(--panel-wine, #4f222b)', fontWeight: 700 }}>
          Detalle del empleado
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(100, 47, 58, 0.16)' }}>
          {empleadoDetalle && (
            <Box>
              <Typography sx={{ mb: 1.5, color: 'var(--panel-wine, #4f222b)', fontWeight: 700 }}>
                {[empleadoDetalle.usuario?.nombre, empleadoDetalle.usuario?.apellido]
                  .filter(Boolean).join(' ') || 'Empleado sin nombre'}
              </Typography>
              {[
                ['Correo', empleadoDetalle.usuario?.email || 'No registrado'],
                ['Cargo', empleadoDetalle.cargo || 'No especificado'],
                ['Salario mensual', `$${formatCurrency(getSalarioEmpleado(empleadoDetalle))}`],
                ['Asistencias', Number(empleadoDetalle.diasTrabajados ?? 0) || 0],
                ['Inasistencias', Number(empleadoDetalle.diasInasistencias ?? 0) || 0],
                ['Pago del mes', empleadoDetalle.pagadoMesActual ? 'Pagado' : 'Pendiente'],
                ['Estado', empleadoDetalle.activo ? 'Activo' : 'Inactivo']
              ].map(([label, value], index, details) => (
                <Box
                  key={label}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 2,
                    py: 1,
                    borderBottom: index < details.length - 1
                      ? '1px solid rgba(100, 47, 58, 0.12)'
                      : 'none'
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'var(--panel-dark, #3b2428)' }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--panel-wine, #4f222b)', fontWeight: 600, textAlign: 'right' }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button
            onClick={() => {
              setOpenDetalleModal(false);
              setEmpleadoDetalle(null);
            }}
            sx={{
              color: '#f5efe6',
              backgroundColor: 'var(--panel-wine, #4f222b)',
              '&:hover': { backgroundColor: 'var(--panel-dark, #3b2428)' }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openInformePago}
        onClose={() => setOpenInformePago(false)}
        aria-labelledby="informe-pago-total-title"
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            border: '1px solid rgba(100, 47, 58, 0.2)',
            borderRadius: 2,
            backgroundColor: 'var(--panel-cream, #f3e7cd)',
            color: 'var(--panel-dark, #3b2428)'
          }
        }}
      >
        <DialogTitle id="informe-pago-total-title" sx={{ color: 'var(--panel-wine, #4f222b)', fontWeight: 700 }}>
          Informe de pago total
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(100, 47, 58, 0.16)' }}>
          <Typography variant="body2" sx={{ mb: 1.5, color: 'var(--panel-dark, #3b2428)' }}>
            Nómina mensual estimada de todos los empleados activos.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              mb: 1.5,
              p: 1.5,
              borderRadius: 1.5,
              color: 'var(--panel-cream, #f3e7cd)',
              backgroundColor: 'var(--panel-wine, #4f222b)'
            }}
          >
            <Typography variant="body2" sx={{ color: '#f5efe6' }}>
              {pagosInforme.length} empleados activos
            </Typography>
            <Typography variant="h6" sx={{ color: '#f5efe6', fontWeight: 700, whiteSpace: 'nowrap' }}>
              ${formatCurrency(totalPagoInforme)}
            </Typography>
          </Box>
          {pagosInforme.length > 0 ? (
            pagosInforme.map(({ empleado, monto }, index) => {
              const nombre = [
                empleado?.usuario?.nombre,
                empleado?.usuario?.apellido
              ].filter(Boolean).join(' ') || 'Empleado sin nombre';

              return (
                <Box
                  key={empleado?._id || empleado?.id || `${nombre}-${index}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    py: 1.1,
                    borderBottom: index < pagosInforme.length - 1
                      ? '1px solid rgba(100, 47, 58, 0.12)'
                      : 'none'
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ color: 'var(--panel-dark, #3b2428)', fontWeight: 600 }}>
                      {nombre}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--panel-wine, #4f222b)' }}>
                      {empleado?.cargo || 'Cargo sin especificar'}
                    </Typography>
                  </Box>
                  <Typography sx={{ color: 'var(--panel-wine, #4f222b)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    ${formatCurrency(monto)}
                  </Typography>
                </Box>
              );
            })
          ) : (
            <Typography variant="body2" sx={{ py: 2, color: 'var(--panel-dark, #3b2428)', textAlign: 'center' }}>
              No hay empleados activos para incluir en el informe.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button
            onClick={() => setOpenInformePago(false)}
            sx={{
              color: 'var(--panel-cream, #f3e7cd)',
              backgroundColor: 'var(--panel-wine, #4f222b)',
              '&:hover': { backgroundColor: 'var(--panel-dark, #3b2428)' }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

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
        onClose={cerrarMenuEmpleado}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            border: '1px solid rgba(100, 47, 58, 0.18)',
            backgroundColor: 'var(--panel-cream, #f3e7cd)',
            color: 'var(--panel-dark, #3b2428)'
          }
        }}
      >
        <MenuItem onClick={() => abrirDetalleEmpleado(menuEmpleado)}>
          <ListItemIcon sx={{ color: 'var(--panel-wine, #4f222b)' }}>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver detalle</ListItemText>
        </MenuItem>
        <Box role="presentation" sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" sx={{ display: 'block', color: 'var(--panel-dark, #3b2428)' }}>
            Estado: {menuEmpleado?.activo ? 'Activo' : 'Inactivo'}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: 'var(--panel-dark, #3b2428)' }}>
            Pago del mes: {menuEmpleado?.pagadoMesActual ? 'Pagado' : 'Pendiente'}
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(100, 47, 58, 0.18)' }} />
        {canEdit && !esHistorico && (
          <>
            <MenuItem onClick={() => { handleEdit(menuEmpleado); cerrarMenuEmpleado(); }}>
              <ListItemIcon sx={{ color: 'var(--panel-wine, #4f222b)' }}>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{menuEmpleado?.esUsuarioMadre ? "Usuario BASE - Editar/Crear registro" : "Editar"}</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleOpenAsistencia(menuEmpleado); cerrarMenuEmpleado(); }}>
              <ListItemIcon sx={{ color: 'var(--panel-wine, #4f222b)' }}>
                <EventIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Registrar asistencia</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleOpenInasistencia(menuEmpleado); cerrarMenuEmpleado(); }}>
              <ListItemIcon sx={{ color: 'var(--panel-wine, #4f222b)' }}>
                <EventBusyIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Registrar inasistencia</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleOpenPago(menuEmpleado); cerrarMenuEmpleado(); }}>
              <ListItemIcon sx={{ color: 'var(--panel-wine, #4f222b)' }}>
                <PaymentIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Registrar / actualizar pago</ListItemText>
            </MenuItem>
            {menuEmpleado?.activo ? (
              <MenuItem onClick={() => { handleDesactivar(menuEmpleado); cerrarMenuEmpleado(); }}>
                <ListItemIcon sx={{ color: 'var(--panel-wine, #4f222b)' }}>
                  <BlockIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Desactivar</ListItemText>
              </MenuItem>
            ) : (
              <MenuItem onClick={() => { handleActivar(menuEmpleado); cerrarMenuEmpleado(); }}>
                <ListItemIcon sx={{ color: 'var(--panel-wine, #4f222b)' }}>
                  <CheckCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Activar</ListItemText>
              </MenuItem>
            )}
          </>
        )}
      </Menu>
    </div>
  );
};

export default Empleados;
