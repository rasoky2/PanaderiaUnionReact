/**
 * Página de login para clientes
 * @author Panadería Unión
 * @version 1.0.0
 */

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useClienteAuth } from '../hooks/useClienteAuth';
import { ClienteLogin } from '../types';

const ClienteLoginPage = () => {
  const [formData, setFormData] = useState<ClienteLogin>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useClienteAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(formData);
      navigate('/tienda');
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Error al iniciar sesión'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth='sm' sx={{ py: 4 }}>
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant='h4'
              component='h1'
              gutterBottom
              align='center'
              color='primary.main'
              fontWeight={700}
            >
              Iniciar Sesión
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
              align='center'
              sx={{ mb: 3 }}
            >
              Accede a tu cuenta para realizar compras
            </Typography>

            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component='form' onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                margin='normal'
                required
                fullWidth
                id='email'
                label='Correo electrónico'
                name='email'
                autoComplete='email'
                autoFocus
                value={formData.email}
                onChange={handleChange}
                type='email'
              />
              <TextField
                margin='normal'
                required
                fullWidth
                name='password'
                label='Contraseña'
                type='password'
                id='password'
                autoComplete='current-password'
                value={formData.password}
                onChange={handleChange}
              />
              <Button
                type='submit'
                fullWidth
                variant='contained'
                sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 600 }}
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                ¿No tienes cuenta?{' '}
                <Link
                  component={RouterLink}
                  to='/cliente-registro'
                  variant='body2'
                >
                  Regístrate aquí
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default ClienteLoginPage;
