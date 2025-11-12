import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import Swal from 'sweetalert2';
import axios from 'axios';
import './Login.css';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (form.password !== form.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    if (form.password.length < 4) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La contraseña debe tener al menos 4 caracteres',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Crear usuario usando la ruta /register del backend
      const userData = {
        username: form.name,  // El backend espera 'username'
        email: form.email,
        password: form.password
        // No enviamos 'role' - el backend lo establece como 'user' automáticamente
      };
      
      const URL_REGISTER = import.meta.env.VITE_API_REGISTER || 'http://localhost:4000/api/register';
      
      await axios.post(URL_REGISTER, userData, {
        withCredentials: true
      });
      
      await Swal.fire({
        icon: 'success',
        title: '¡Registro Exitoso!',
        text: 'Tu cuenta ha sido creada. Ya puedes iniciar sesión.',
        confirmButtonColor: '#667eea',
        timer: 2500
      });
      
      navigate('/login');
      
    } catch (error) {
      console.error('Error al registrar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.mensaje || 'Error al crear la cuenta',
        confirmButtonColor: '#667eea'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Paper className="login-paper" elevation={3}>
        <Box className="login-box">
          <Typography variant="h4" component="h1" className="login-title">
            📝 Crear Cuenta
          </Typography>
          <Typography variant="body2" className="login-subtitle">
            Regístrate para acceder a la plataforma
          </Typography>

          <form onSubmit={handleSubmit} className="login-form">
            <TextField
              fullWidth
              label="Nombre completo"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              autoComplete="name"
            />

            <TextField
              fullWidth
              label="Correo electrónico"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              autoComplete="email"
            />

            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              autoComplete="new-password"
              helperText="Mínimo 4 caracteres"
            />

            <TextField
              fullWidth
              label="Confirmar contraseña"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              autoComplete="new-password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="login-button"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? '⏳ Registrando...' : '✅ Registrarse'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="register-link">
                  Inicia Sesión
                </Link>
              </Typography>
            </Box>
          </form>
        </Box>
      </Paper>
    </div>
  );
};

export default Register;
