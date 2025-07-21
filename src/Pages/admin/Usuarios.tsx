import {
  Add,
  Business,
  Delete,
  Edit,
  MoreVert,
  People,
} from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../config/supabase.config';

// Interfaces TypeScript
interface Usuario {
  id: string | null;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'admin' | 'empleado';
  sucursal_id: string | null;
  password?: string;
  sucursales?: {
    id: string;
    nombre: string;
    provincia: {
      id: number;
      nombre: string;
      departamento: {
        id: number;
        nombre: string;
      };
    };
  };
}

interface Sucursal {
  id: string;
  nombre_sucursal: string;
  nombre_provincia: string;
  nombre_departamento: string;
  departamento_id: number;
  cantidad_empleados: number;
}

interface DepartamentoStats {
  id: number;
  nombre: string;
  total_sucursales: number;
  total_provincias: number;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
} as const;

const emptyUser: Usuario = {
  id: null,
  nombre: '',
  apellido: '',
  email: '',
  rol: 'empleado',
  sucursal_id: null,
  password: '',
};

const UsuariosPage = () => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [allSucursales, setAllSucursales] = useState<Sucursal[]>([]);
  const [filteredSucursales, setFilteredSucursales] = useState<Sucursal[]>([]);
  const [departamentosStats, setDepartamentosStats] = useState<
    DepartamentoStats[]
  >([]);
  const [loadingSucursales, setLoadingSucursales] = useState(false);

  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userInForm, setUserInForm] = useState<Usuario>(emptyUser);
  const [formError, setFormError] = useState<string | null>(null);

  // States for modal filters
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>('');

  // For notifications
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // For menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  // For delete dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('obtener_usuarios_completos');
    if (error) {
      console.error('Error fetching users:', error);
      setNotification({
        open: true,
        message: `Error al cargar usuarios: ${error.message}`,
        severity: 'error',
      });
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }, []);

  const fetchDepartamentosStats = useCallback(async () => {
    const { data, error } = await supabase.rpc(
      'obtener_estadisticas_departamentos'
    );
    if (error) {
      setNotification({
        open: true,
        message: 'Error al cargar estadísticas de departamentos',
        severity: 'error',
      });
      setDepartamentosStats([]);
    } else {
      setDepartamentosStats(data || []);
    }
  }, []);

  const fetchAllSucursales = useCallback(async () => {
    console.log('🔄 Cargando sucursales...');
    setLoadingSucursales(true);
    const { data, error } = await supabase.rpc('obtener_sucursales_completas');
    if (error) {
      console.error('❌ Error al cargar sucursales:', error);
      setNotification({
        open: true,
        message: `Error al cargar sucursales: ${error.message}`,
        severity: 'error',
      });
      setAllSucursales([]);
      setFilteredSucursales([]);
    } else {
      console.log('✅ Sucursales cargadas:', data?.length || 0, data);
      setAllSucursales(data || []);
      setFilteredSucursales(data || []);
    }
    setLoadingSucursales(false);
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchDepartamentosStats();
    fetchAllSucursales();
  }, [fetchUsers, fetchDepartamentosStats, fetchAllSucursales]);

  useEffect(() => {
    console.log('🔍 FILTRADO:', {
      selectedDepartamento,
      allSucursalesCount: allSucursales.length,
      filteredCount: filteredSucursales.length,
    });

    let newFiltered = allSucursales;
    if (selectedDepartamento) {
      console.log(
        `🔍 Filtrando por departamento: "${selectedDepartamento}" (tipo: ${typeof selectedDepartamento})`
      );
      console.log(
        '🔍 Sucursales antes del filtro:',
        allSucursales.map(s => ({
          nombre: s.nombre_sucursal,
          departamento_id: s.departamento_id,
          tipo: typeof s.departamento_id,
        }))
      );

      newFiltered = allSucursales.filter(s => {
        const match =
          s.departamento_id.toString() === selectedDepartamento.toString();
        console.log(
          `  - ${s.nombre_sucursal}: ${s.departamento_id} === ${selectedDepartamento} ? ${match}`
        );
        return match;
      });
      console.log(
        `🔍 Filtro departamento ${selectedDepartamento}: ${newFiltered.length} sucursales encontradas`
      );
    }

    setFilteredSucursales(newFiltered);

    // Si la sucursal seleccionada no está en la nueva lista filtrada, limpiar la selección
    if (
      userInForm.sucursal_id &&
      !newFiltered.find(s => s.id === userInForm.sucursal_id)
    ) {
      setUserInForm((prev: Usuario) => ({ ...prev, sucursal_id: null }));
    }
  }, [selectedDepartamento, allSucursales, userInForm.sucursal_id]);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    user: Usuario
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenModal = (user: Usuario | null = null) => {
    setFormError(null);
    if (user) {
      setIsEditing(true);
      setUserInForm({ ...user, password: '' });
      if (user.sucursales?.provincia) {
        setSelectedDepartamento(
          user.sucursales.provincia.departamento.id.toString()
        );
      } else {
        setSelectedDepartamento('');
      }
    } else {
      setIsEditing(false);
      setUserInForm(emptyUser);
      setSelectedDepartamento('');
    }
    setOpenModal(true);
    handleMenuClose();
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setUserInForm((prev: Usuario) => ({ ...prev, [name]: value }));
  };

  // Función auxiliar para validar campos requeridos
  const validateRequiredFields = (): boolean => {
    if (
      !userInForm.nombre ||
      !userInForm.apellido ||
      !userInForm.email ||
      !userInForm.rol
    ) {
      setFormError('Por favor, complete todos los campos requeridos.');
      return false;
    }
    return true;
  };

  // Función auxiliar para actualizar usuario existente
  const updateExistingUser = async (): Promise<boolean> => {
    const { error } = await supabase
      .from('usuarios')
      .update({
        nombre: userInForm.nombre,
        apellido: userInForm.apellido,
        rol: userInForm.rol,
        sucursal_id: userInForm.sucursal_id,
      })
      .eq('id', userInForm.id);

    if (error) {
      setFormError(error.message);
      setNotification({
        open: true,
        message: `Error al actualizar: ${error.message}`,
        severity: 'error',
      });
      return false;
    } else {
      setNotification({
        open: true,
        message: 'Usuario actualizado con éxito.',
        severity: 'success',
      });
      return true;
    }
  };

  // Función auxiliar para crear nuevo usuario
  const createNewUser = async (): Promise<boolean> => {
    console.log('🔄 === INICIO CREACIÓN DE USUARIO ===');
    console.log('📧 Email:', userInForm.email);
    console.log('👤 Nombre:', userInForm.nombre);
    console.log('👤 Apellido:', userInForm.apellido);
    console.log('🔑 Rol:', userInForm.rol);
    console.log('🏢 Sucursal ID:', userInForm.sucursal_id);
    console.log('🔒 Password length:', userInForm.password?.length || 0);

    if (!userInForm.password) {
      console.log('❌ Error: Contraseña faltante');
      setFormError('La contraseña es requerida para nuevos usuarios.');
      return false;
    }

    console.log('📤 Enviando datos a Supabase Auth...');
    const signUpPayload = {
      email: userInForm.email,
      password: userInForm.password,
      options: {
        data: {
          nombre: userInForm.nombre,
          apellido: userInForm.apellido,
          rol: userInForm.rol,
        },
      },
    };
    console.log('📦 Payload completo:', JSON.stringify(signUpPayload, null, 2));

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      signUpPayload
    );

    console.log('📨 Respuesta de Supabase Auth:');
    console.log('✅ Data:', signUpData);
    console.log('❌ Error:', signUpError);

    if (signUpError) {
      console.error('❌ ERROR COMPLETO EN SIGNUP:', {
        message: signUpError.message,
        status: signUpError.status,
        statusText: signUpError.name,
        details: signUpError,
      });

      setFormError(`Error al crear usuario: ${signUpError.message}`);
      setNotification({
        open: true,
        message: `Error al crear usuario: ${signUpError.message}`,
        severity: 'error',
      });
      return false;
    }

    console.log('✅ Usuario creado en Auth exitosamente');
    console.log('🆔 User ID creado:', signUpData.user?.id);
    console.log('📧 Email confirmado:', signUpData.user?.email_confirmed_at);
    console.log('📱 User completo:', signUpData.user);
    console.log('🔑 Session data:', signUpData.session);

    // Verificar si se creó el registro en la tabla usuarios automáticamente
    console.log('🔍 Verificando si se creó en tabla usuarios...');
    const { data: usuarioCreado, error: consultaError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', signUpData.user?.id)
      .maybeSingle(); // Usar maybeSingle() en lugar de single()

    console.log('📊 Usuario en tabla usuarios:', usuarioCreado);
    console.log('❌ Error consulta usuarios:', consultaError);

    // Si no se creó automáticamente, sincronizar manualmente
    if (!usuarioCreado && signUpData.user?.id) {
      console.log('🔄 Usuario no encontrado, sincronizando manualmente...');
      const { error: syncError } = await supabase.rpc('sync_public_user', {
        user_id: signUpData.user.id,
      });
      console.log('🔄 Resultado sincronización manual:', syncError);

      if (syncError) {
        console.error('❌ Error en sincronización manual:', syncError);
      } else {
        console.log('✅ Sincronización manual exitosa');
      }
    }

    // If user is created and needs a sucursal, update the profile
    if (signUpData.user && userInForm.sucursal_id) {
      console.log('🏢 Asignando sucursal...');
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ sucursal_id: userInForm.sucursal_id })
        .eq('id', signUpData.user.id);

      console.log('🏢 Resultado asignación sucursal:', updateError);

      if (updateError) {
        console.error('❌ Error asignando sucursal:', updateError);
        setNotification({
          open: true,
          message: `Usuario creado, pero hubo un error al asignar la sucursal: ${updateError.message}`,
          severity: 'error',
        });
      } else {
        console.log('✅ Sucursal asignada exitosamente');
        setNotification({
          open: true,
          message: 'Usuario creado y asignado a sucursal con éxito.',
          severity: 'success',
        });
      }
    } else {
      console.log('ℹ️ Usuario creado sin sucursal');
      setNotification({
        open: true,
        message: 'Usuario creado con éxito.',
        severity: 'success',
      });
    }

    // Verificación final
    console.log('🔍 Verificación final - consultando usuario creado...');
    const { data: verificacionFinal, error: errorVerificacion } = await supabase
      .from('usuarios')
      .select('*, sucursales(nombre)')
      .eq('id', signUpData.user?.id)
      .maybeSingle();

    console.log('📋 Usuario final en BD:', verificacionFinal);
    console.log('❌ Error verificación final:', errorVerificacion);

    if (verificacionFinal) {
      console.log('✅ USUARIO CREADO EXITOSAMENTE:');
      console.log(
        `  - Nombre: ${verificacionFinal.nombre} ${verificacionFinal.apellido}`
      );
      console.log(`  - Email: ${verificacionFinal.email}`);
      console.log(`  - Rol: ${verificacionFinal.rol}`);
      console.log(
        `  - Sucursal: ${verificacionFinal.sucursales?.nombre || 'Sin asignar'}`
      );
    }

    console.log('🔄 === FIN CREACIÓN DE USUARIO ===');

    return true;
  };

  // Función principal de submit refactorizada
  const handleSubmit = async () => {
    setFormError(null);

    // Validar campos requeridos
    if (!validateRequiredFields()) return;

    // Ejecutar operación según el modo
    const success = isEditing
      ? await updateExistingUser()
      : await createNewUser();

    if (success) {
      handleCloseModal();
      fetchUsers();
    }
  };

  const handleDeleteRequest = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    const { error } = await supabase.rpc('delete_user_rpc', {
      user_id: selectedUser.id,
    });

    if (error) {
      setNotification({
        open: true,
        message: `Error al eliminar: ${error.message}`,
        severity: 'error',
      });
    } else {
      setNotification({
        open: true,
        message: 'Usuario eliminado con éxito.',
        severity: 'success',
      });
      fetchUsers();
    }
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Función auxiliar para obtener el color del chip de sucursales
  const getSucursalesChipColor = (count: number) => {
    return count > 0 ? 'primary' : 'default';
  };

  // Función auxiliar para obtener el texto de ayuda del autocomplete
  const getAutocompleteHelperText = () => {
    if (loadingSucursales) return 'Cargando sucursales...';

    const baseText = `${filteredSucursales.length} sucursales disponibles`;
    const selectedDept = departamentosStats.find(
      d => d.id.toString() === selectedDepartamento
    );

    return selectedDepartamento && selectedDept
      ? `${baseText} en ${selectedDept.nombre}`
      : baseText;
  };

  // Función auxiliar para obtener el texto cuando no hay opciones
  const getNoOptionsText = () => {
    if (loadingSucursales) return 'Cargando sucursales...';
    if (selectedDepartamento) return 'No hay sucursales en este departamento';
    return 'No hay sucursales que coincidan';
  };

  const renderDepartamentoOption = (dep: DepartamentoStats) => (
    <MenuItem key={dep.id} value={dep.id}>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={{ width: '100%' }}
      >
        <Typography>{dep.nombre}</Typography>
        <Stack direction='row' spacing={1}>
          <Chip
            size='small'
            label={`${dep.total_sucursales} sucursales`}
            color={getSucursalesChipColor(dep.total_sucursales)}
            variant='outlined'
          />
          <Chip
            size='small'
            label={`${dep.total_provincias} provincias`}
            color='secondary'
            variant='outlined'
          />
        </Stack>
      </Stack>
    </MenuItem>
  );

  return (
    <Container maxWidth='lg' sx={{ py: 3 }}>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={{ mb: 4 }}
      >
        <Typography variant='h4' fontWeight='bold'>
          Gestión de Usuarios
        </Typography>
        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={() => handleOpenModal()}
        >
          Crear Usuario
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : (
        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre Completo</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Sucursal</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell align='right'>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {`${user.nombre || ''} ${user.apellido || ''}`.trim()}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.rol}
                        color={user.rol === 'admin' ? 'primary' : 'default'}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      {user.sucursales ? (
                        <Stack direction='row' alignItems='center' spacing={1}>
                          <Business fontSize='small' color='action' />
                          <Typography variant='body2'>
                            {user.sucursales.nombre}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          Sin asignar
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.sucursales?.provincia ? (
                        <Stack spacing={0.5}>
                          <Typography variant='caption' color='text.secondary'>
                            {user.sucursales.provincia.departamento.nombre}
                          </Typography>
                          <Typography variant='body2'>
                            {user.sucursales.provincia.nombre}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align='right'>
                      <IconButton onClick={e => handleMenuClick(e, user)}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleOpenModal(selectedUser)}>
          <Edit sx={{ mr: 1 }} /> Editar
        </MenuItem>
        <MenuItem onClick={handleDeleteRequest} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Eliminar
        </MenuItem>
      </Menu>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText component='div'>
            ¿Estás seguro de que quieres eliminar al usuario{' '}
            <strong>
              {`${selectedUser?.nombre || ''} ${
                selectedUser?.apellido || ''
              }`.trim()}
            </strong>
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={confirmDelete} color='error'>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={style}>
          <Typography variant='h6' component='h2' sx={{ mb: 2 }}>
            {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </Typography>
          <Stack spacing={2}>
            {formError && <Alert severity='error'>{formError}</Alert>}
            <Stack direction='row' spacing={2}>
              <TextField
                label='Nombre'
                name='nombre'
                value={userInForm.nombre}
                onChange={handleInputChange}
                required
                fullWidth
              />
              <TextField
                label='Apellido'
                name='apellido'
                value={userInForm.apellido}
                onChange={handleInputChange}
                required
                fullWidth
              />
            </Stack>
            <TextField
              label='Email'
              name='email'
              type='email'
              value={userInForm.email}
              onChange={handleInputChange}
              required
              disabled={isEditing}
            />
            {!isEditing && (
              <TextField
                label='Contraseña'
                name='password'
                type='password'
                value={userInForm.password || ''}
                onChange={handleInputChange}
                required
              />
            )}
            <FormControl fullWidth required>
              <InputLabel>Rol</InputLabel>
              <Select
                name='rol'
                value={userInForm.rol}
                label='Rol'
                onChange={handleInputChange}
              >
                <MenuItem value='admin'>Admin</MenuItem>
                <MenuItem value='empleado'>Empleado</MenuItem>
              </Select>
            </FormControl>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              sx={{ mt: 2, mb: 1 }}
            >
              <Typography variant='subtitle2' color='text.secondary'>
                Asignar Sucursal (Opcional)
              </Typography>
              <Chip
                size='small'
                label={
                  loadingSucursales
                    ? 'Cargando...'
                    : `${filteredSucursales.length} disponibles`
                }
                color={
                  loadingSucursales
                    ? 'default'
                    : filteredSucursales.length > 0
                    ? 'success'
                    : 'default'
                }
                variant='outlined'
              />
            </Stack>
            <FormControl fullWidth>
              <InputLabel>Departamento</InputLabel>
              <Select
                value={selectedDepartamento}
                label='Departamento'
                onChange={e => setSelectedDepartamento(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 400,
                    },
                  },
                }}
              >
                <MenuItem value=''>
                  <em>Todos los departamentos</em>
                </MenuItem>
                {departamentosStats.map(renderDepartamentoOption)}
              </Select>
            </FormControl>
            <Autocomplete
              options={filteredSucursales}
              loading={loadingSucursales}
              getOptionLabel={option =>
                `${option.nombre_sucursal} (${option.nombre_provincia}, ${option.nombre_departamento})`
              }
              value={
                filteredSucursales.find(s => s.id === userInForm.sucursal_id) ||
                null
              }
              onChange={(_, newValue) => {
                setUserInForm((prev: Usuario) => ({
                  ...prev,
                  sucursal_id: newValue ? newValue.id : null,
                }));
              }}
              renderInput={params => (
                <TextField
                  {...(params as any)}
                  label='Buscar Sucursal'
                  helperText={getAutocompleteHelperText()}
                />
              )}
              renderOption={(props, option) => (
                <Box component='li' {...props}>
                  <Stack
                    direction='row'
                    alignItems='center'
                    spacing={1}
                    sx={{ width: '100%' }}
                  >
                    <Business fontSize='small' color='action' />
                    <Stack sx={{ flex: 1 }}>
                      <Typography variant='body2' fontWeight='bold'>
                        {option.nombre_sucursal}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {option.nombre_provincia}, {option.nombre_departamento}
                      </Typography>
                    </Stack>
                    <Chip
                      size='small'
                      label={`${option.cantidad_empleados} empleados`}
                      variant='outlined'
                      icon={<People />}
                    />
                  </Stack>
                </Box>
              )}
              noOptionsText={getNoOptionsText()}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              sx={{ mt: 2 }}
            />
            <Button onClick={handleSubmit} variant='contained' sx={{ mt: 2 }}>
              {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UsuariosPage;
