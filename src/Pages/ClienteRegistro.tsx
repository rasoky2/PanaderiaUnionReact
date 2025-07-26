/**
 * Página de registro para clientes
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
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { supabase } from '../config/supabase.config';
import { useClienteAuth } from '../hooks/useClienteAuth';
import { ClienteRegistro } from '../types';

interface Departamento {
  id: number;
  nombre: string;
}

interface Provincia {
  id: number;
  nombre: string;
  departamento_id: number;
}

const ClienteRegistroPage = () => {
  const [formData, setFormData] = useState<ClienteRegistro>({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    celular: '',
    ruc: '',
    direccion: '',
    fecha_nacimiento: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);

  const { register } = useClienteAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartamentos = async () => {
      const { data, error } = await supabase
        .from('departamentos')
        .select('id, nombre')
        .order('nombre');
      if (!error && data) {
        setDepartamentos(data);
      }
    };
    fetchDepartamentos();
  }, []);

  useEffect(() => {
    if (formData.departamento_id) {
      const fetchProvincias = async () => {
        const { data, error } = await supabase
          .from('provincias')
          .select('id, nombre, departamento_id')
          .eq('departamento_id', formData.departamento_id)
          .order('nombre');
        if (!error && data) {
          setProvincias(data);
        }
      };
      fetchProvincias();
    } else {
      setProvincias([]);
    }
  }, [formData.departamento_id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;

    // Validación para celular (máximo 9 dígitos)
    if (name === 'celular') {
      const numericValue = String(value).replace(/\D/g, '');
      if (numericValue.length <= 9) {
        setFormData({
          ...formData,
          [name as string]: numericValue,
        });
      }
      return;
    }

    // Validación para RUC (máximo 11 dígitos)
    if (name === 'ruc') {
      const numericValue = String(value).replace(/\D/g, '');
      if (numericValue.length <= 11) {
        setFormData({
          ...formData,
          [name as string]: numericValue,
        });
      }
      return;
    }

    setFormData({
      ...formData,
      [name as string]: value,
    });
  };

  const handleSelectChange =
    (name: string) => (event: SelectChangeEvent<string | number>) => {
      const value = event.target.value;
      setFormData({
        ...formData,
        [name]: value === '' ? null : value,
      });
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(formData);
      navigate('/tienda');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth='md' sx={{ py: 4 }}>
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
              Registro de Cliente
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
              align='center'
              sx={{ mb: 3 }}
            >
              Crea tu cuenta para comenzar a comprar
            </Typography>

            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component='form' onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label='Nombre'
                    name='nombre'
                    value={formData.nombre}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label='Apellido'
                    name='apellido'
                    value={formData.apellido}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label='Correo electrónico'
                    name='email'
                    type='email'
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label='Contraseña'
                    name='password'
                    type='password'
                    value={formData.password}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Celular'
                    name='celular'
                    value={formData.celular}
                    onChange={handleChange}
                    inputProps={{
                      maxLength: 9,
                      pattern: '[0-9]*',
                    }}
                    helperText='Máximo 9 dígitos'
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='RUC (Opcional)'
                    name='ruc'
                    value={formData.ruc}
                    onChange={handleChange}
                    inputProps={{
                      maxLength: 11,
                      pattern: '[0-9]*',
                    }}
                    helperText='Máximo 11 dígitos'
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Fecha de nacimiento'
                    name='fecha_nacimiento'
                    type='date'
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Género</InputLabel>
                    <Select
                      name='genero'
                      value={formData.genero || ''}
                      label='Género'
                      onChange={handleSelectChange('genero')}
                    >
                      <MenuItem value='masculino'>Masculino</MenuItem>
                      <MenuItem value='femenino'>Femenino</MenuItem>
                      <MenuItem value='otro'>Otro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Departamento</InputLabel>
                    <Select
                      name='departamento_id'
                      value={formData.departamento_id || ''}
                      label='Departamento'
                      onChange={handleSelectChange('departamento_id')}
                    >
                      {departamentos.map(dept => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Provincia</InputLabel>
                    <Select
                      name='provincia_id'
                      value={formData.provincia_id || ''}
                      label='Provincia'
                      onChange={handleSelectChange('provincia_id')}
                      disabled={!formData.departamento_id}
                    >
                      {provincias.map(prov => (
                        <MenuItem key={prov.id} value={prov.id}>
                          {prov.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Dirección'
                    name='direccion'
                    multiline
                    rows={2}
                    value={formData.direccion}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>

              <Button
                type='submit'
                fullWidth
                variant='contained'
                sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 600 }}
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                ¿Ya tienes cuenta?{' '}
                <Link
                  component={RouterLink}
                  to='/cliente-login'
                  variant='body2'
                >
                  Inicia sesión aquí
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

export default ClienteRegistroPage;
