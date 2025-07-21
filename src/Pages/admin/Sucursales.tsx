import {
  Add,
  Business,
  Delete,
  Edit,
  Inventory,
  LocationOn,
  MoreVert,
  People,
  Storefront,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
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
  FormControlLabel,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Select,
  SelectChangeEvent,
  MenuItem as SelectMenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '../../config/supabase.config';

// Interfaces TypeScript
interface Sucursal {
  id: string;
  nombre_sucursal: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
  estado: 'activa' | 'inactiva';
  departamento_id: number;
  provincia_id: number;
  nombre_departamento: string;
  nombre_provincia: string;
  cantidad_empleados: number;
  nombres_empleados: string[];
}

interface DepartamentoStats {
  id: number;
  nombre: string;
  total_sucursales: number;
}

interface ProvinciaStats {
  id: number;
  nombre: string;
  tiene_sucursal: boolean;
}

interface StockItem {
  producto_id: number;
  producto_nombre: string;
  cantidad_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  estado_stock: 'normal' | 'bajo' | 'critico';
  ultima_actualizacion?: string;
}

interface DepartamentoGroup {
  departamento_id: number;
  departamento_nombre: string;
  sucursales: Sucursal[];
}

// Estilo para el Modal
const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const SucursalesPage = () => {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(
    null
  );

  // Estados para modales
  const [openEditModal, setOpenEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nombreSucursal, setNombreSucursal] = useState('');
  const [direccionSucursal, setDireccionSucursal] = useState('');
  const [latitudSucursal, setLatitudSucursal] = useState('');
  const [longitudSucursal, setLongitudSucursal] = useState('');
  const [openEmpleadosModal, setOpenEmpleadosModal] = useState(false);
  const [openStockModal, setOpenStockModal] = useState(false);
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [stockLoading, setStockLoading] = useState(false);

  // Estados para los selectores de ubicación con estadísticas
  const [departamentosStats, setDepartamentosStats] = useState<
    DepartamentoStats[]
  >([]);
  const [provinciasStats, setProvinciasStats] = useState<ProvinciaStats[]>([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState('');
  const [selectedProvincia, setSelectedProvincia] = useState('');

  // Estados para filtrado en la vista principal
  const [filteredDepartamento, setFilteredDepartamento] = useState('');
  const [groupByDepartamento, setGroupByDepartamento] = useState(true);

  // Estado para el diálogo de confirmación
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchSucursales();
    fetchDepartamentosStats();
  }, []);

  useEffect(() => {
    if (selectedDepartamento) {
      fetchProvinciasStats(selectedDepartamento);
      // Reset provincia selection when department changes
      setSelectedProvincia('');
    } else {
      setProvinciasStats([]);
    }
  }, [selectedDepartamento]);

  const fetchSucursales = async () => {
    setLoading(true);
    setFetchError(null);
    // Usamos una función RPC que también nos trae los nombres de los empleados
    const { data, error } = await supabase.rpc('obtener_sucursales_completas');
    if (error) {
      console.error('Error fetching sucursales:', error);
      setFetchError(
        'No se pudieron cargar los datos de las sucursales. Por favor, intente de nuevo más tarde.'
      );
      setSucursales([]);
    } else {
      setSucursales(data || []);
    }
    setLoading(false);
  };

  const fetchDepartamentosStats = async () => {
    const { data, error } = await supabase.rpc(
      'obtener_estadisticas_departamentos'
    );
    if (error) {
      console.error('Error fetching departamentos stats:', error);
      setDepartamentosStats([]);
    } else {
      setDepartamentosStats(data || []);
    }
  };

  const fetchProvinciasStats = async (departamentoId: string) => {
    const { data, error } = await supabase.rpc(
      'obtener_estadisticas_provincias',
      {
        p_departamento_id: parseInt(departamentoId),
      }
    );
    if (error) {
      console.error('Error fetching provincias stats:', error);
      setProvinciasStats([]);
    } else {
      setProvinciasStats(data || []);
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    sucursal: Sucursal
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedSucursal(sucursal);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenEditModal = () => {
    if (!selectedSucursal) return;

    setIsEditing(true);
    setNombreSucursal(selectedSucursal.nombre_sucursal);
    setDireccionSucursal(selectedSucursal.direccion || '');
    setLatitudSucursal(
      selectedSucursal.latitud ? selectedSucursal.latitud.toString() : ''
    );
    setLongitudSucursal(
      selectedSucursal.longitud ? selectedSucursal.longitud.toString() : ''
    );

    // Pre-seleccionar departamento y provincia
    setSelectedDepartamento(selectedSucursal.departamento_id.toString());
    // El useEffect se encargará de cargar las provincias, luego seteamos la correcta
    setTimeout(() => {
      setSelectedProvincia(selectedSucursal.provincia_id.toString());
    }, 100);

    setFormError(null);
    setOpenEditModal(true);
    handleMenuClose();
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedSucursal(null);
  };

  const handleOpenConfirmDialog = () => {
    setOpenConfirmDialog(true);
    handleMenuClose();
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setSelectedSucursal(null);
  };

  const handleOpenEmpleadosModal = () => {
    setOpenEmpleadosModal(true);
    handleMenuClose();
  };

  const handleCloseEmpleadosModal = () => {
    setOpenEmpleadosModal(false);
  };

  const handleOpenStockModal = () => {
    if (!selectedSucursal) return;
    fetchStockData(selectedSucursal.id);
    setOpenStockModal(true);
    handleMenuClose();
  };

  const handleCloseStockModal = () => {
    setOpenStockModal(false);
  };

  const fetchStockData = async (sucursalId: string) => {
    setStockLoading(true);
    const { data, error } = await supabase.rpc(
      'obtener_stock_detallado_sucursal',
      {
        p_sucursal_id: sucursalId,
      }
    );
    if (error) {
      console.error('Error fetching stock data:', error);
      setStockData([]);
    } else {
      setStockData(data || []);
    }
    setStockLoading(false);
  };

  // Función auxiliar para validar coordenadas
  const validateCoordinates = (): boolean => {
    if (latitudSucursal && longitudSucursal) {
      const lat = parseFloat(latitudSucursal);
      const lng = parseFloat(longitudSucursal);

      // Validar rangos válidos para coordenadas
      if (lat < -90 || lat > 90) {
        setFormError('La latitud debe estar entre -90 y 90 grados.');
        return false;
      }

      if (lng < -180 || lng > 180) {
        setFormError('La longitud debe estar entre -180 y 180 grados.');
        return false;
      }

      // Validar precisión para evitar overflow de la base de datos
      // Latitud: NUMERIC(9,6) - máximo 2 dígitos antes del punto decimal, 6 decimales
      // Longitud: NUMERIC(10,6) - máximo 3 dígitos antes del punto decimal, 6 decimales
      const latStr = Math.abs(lat).toString();
      const lngStr = Math.abs(lng).toString();

      if (latStr.indexOf('.') > 0 && latStr.indexOf('.') > 2) {
        setFormError(
          'La latitud tiene demasiados dígitos enteros. Máximo 2 dígitos antes del punto decimal.'
        );
        return false;
      }

      if (lngStr.indexOf('.') > 0 && lngStr.indexOf('.') > 3) {
        setFormError(
          'La longitud tiene demasiados dígitos enteros. Máximo 3 dígitos antes del punto decimal.'
        );
        return false;
      }

      // Validar máximo 6 decimales (estándar GPS)
      const latDecimals = latStr.split('.')[1];
      const lngDecimals = lngStr.split('.')[1];

      if (latDecimals && latDecimals.length > 6) {
        setFormError('La latitud puede tener máximo 6 decimales.');
        return false;
      }

      if (lngDecimals && lngDecimals.length > 6) {
        setFormError('La longitud puede tener máximo 6 decimales.');
        return false;
      }
    }

    return true;
  };

  // Función auxiliar para validar provincia existente
  const validateProvinciaAvailability = async (): Promise<boolean> => {
    let query = supabase
      .from('sucursales')
      .select('id')
      .eq('provincia_id', selectedProvincia);

    // Si estamos editando, excluimos la sucursal actual de la validación
    if (isEditing && selectedSucursal) {
      query = query.neq('id', selectedSucursal.id);
    }

    const { data: existingSucursal, error: existingError } =
      await query.maybeSingle();

    if (existingError) {
      console.error('Error checking for existing sucursal:', existingError);
      setFormError('Ocurrió un error al validar la sucursal.');
      return false;
    }

    if (existingSucursal) {
      setFormError('Ya existe una sucursal en la provincia seleccionada.');
      return false;
    }

    return true;
  };

  // Función auxiliar para actualizar sucursal
  const updateSucursal = async (): Promise<boolean> => {
    if (!selectedSucursal) return false;

    const { error } = await supabase
      .from('sucursales')
      .update({
        nombre: nombreSucursal,
        provincia_id: selectedProvincia,
        direccion: direccionSucursal,
        latitud: latitudSucursal ? parseFloat(latitudSucursal) : null,
        longitud: longitudSucursal ? parseFloat(longitudSucursal) : null,
      })
      .eq('id', selectedSucursal.id);

    if (error) {
      console.error('Error actualizando:', error);
      if (error.code === '22003') {
        setFormError(
          'Error: Las coordenadas exceden la precisión permitida. Verifica que la latitud tenga máximo 2 dígitos enteros y la longitud máximo 3 dígitos enteros, ambos con máximo 6 decimales.'
        );
      } else {
        setFormError('Error al actualizar la sucursal.');
      }
      return false;
    }

    return true;
  };

  // Función auxiliar para crear sucursal
  const createSucursal = async (): Promise<boolean> => {
    const { error } = await supabase.from('sucursales').insert([
      {
        nombre: nombreSucursal,
        provincia_id: selectedProvincia,
        direccion: direccionSucursal,
        latitud: latitudSucursal ? parseFloat(latitudSucursal) : null,
        longitud: longitudSucursal ? parseFloat(longitudSucursal) : null,
      },
    ]);

    if (error) {
      console.error('Error creando:', error);
      if (error.code === '22003') {
        setFormError(
          'Error: Las coordenadas exceden la precisión permitida. Verifica que la latitud tenga máximo 2 dígitos enteros y la longitud máximo 3 dígitos enteros, ambos con máximo 6 decimales.'
        );
      } else {
        setFormError('Error al crear la sucursal.');
      }
      return false;
    }

    return true;
  };

  // Función principal de submit refactorizada
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    // Validar coordenadas
    if (!validateCoordinates()) return;

    // Validar disponibilidad de provincia
    const isProvinceAvailable = await validateProvinciaAvailability();
    if (!isProvinceAvailable) return;

    // Ejecutar operación según el modo
    const success = isEditing ? await updateSucursal() : await createSucursal();

    if (success) {
      fetchSucursales();
      fetchDepartamentosStats();
      handleCloseEditModal();
    }
  };

  const handleDeactivate = async () => {
    if (!selectedSucursal) return;
    const nuevoEstado =
      selectedSucursal.estado === 'activa' ? 'inactiva' : 'activa';
    const { error } = await supabase
      .from('sucursales')
      .update({ estado: nuevoEstado })
      .eq('id', selectedSucursal.id);

    if (error) console.error('Error al cambiar estado:', error);
    fetchSucursales();
    fetchDepartamentosStats();
    handleCloseConfirmDialog();
  };

  // Función para agrupar sucursales por departamento
  const groupSucursalesByDepartamento = (): DepartamentoGroup[] => {
    const grouped = sucursales
      .filter(
        sucursal =>
          !filteredDepartamento ||
          sucursal.departamento_id.toString() === filteredDepartamento
      )
      .reduce((acc: Record<string, DepartamentoGroup>, sucursal) => {
        const deptKey = `${sucursal.departamento_id}-${sucursal.nombre_departamento}`;
        if (!acc[deptKey]) {
          acc[deptKey] = {
            departamento_id: sucursal.departamento_id,
            departamento_nombre: sucursal.nombre_departamento,
            sucursales: [],
          };
        }
        acc[deptKey]?.sucursales.push(sucursal);
        return acc;
      }, {});

    return Object.values(grouped).sort(
      (a: DepartamentoGroup, b: DepartamentoGroup) =>
        a.departamento_nombre.localeCompare(b.departamento_nombre)
    );
  };

  // Función auxiliar para obtener el color del fondo del stock
  const getStockBackgroundColor = (estadoStock: string) => {
    switch (estadoStock) {
      case 'critico':
        return 'error.light';
      case 'bajo':
        return 'warning.light';
      default:
        return 'transparent';
    }
  };

  // Función auxiliar para obtener el color del texto del stock
  const getStockTextColor = (estadoStock: string) => {
    switch (estadoStock) {
      case 'critico':
        return 'error';
      case 'bajo':
        return 'warning.main';
      default:
        return 'text.primary';
    }
  };

  // Función auxiliar para obtener la etiqueta del estado del stock
  const getStockStateLabel = (estadoStock: string) => {
    switch (estadoStock) {
      case 'critico':
        return 'Crítico';
      case 'bajo':
        return 'Bajo';
      default:
        return 'Normal';
    }
  };

  // Función auxiliar para obtener el color del chip del estado del stock
  const getStockStateColor = (
    estadoStock: string
  ): 'error' | 'warning' | 'success' => {
    switch (estadoStock) {
      case 'critico':
        return 'error';
      case 'bajo':
        return 'warning';
      default:
        return 'success';
    }
  };

  const renderDepartamentoOption = (dep: DepartamentoStats) => (
    <SelectMenuItem key={dep.id} value={dep.id.toString()}>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={{ width: '100%' }}
      >
        <Typography>{dep.nombre}</Typography>
        <Chip
          size='small'
          label={`${dep.total_sucursales} sucursal${
            dep.total_sucursales !== 1 ? 'es' : ''
          }`}
          color={dep.total_sucursales > 0 ? 'primary' : 'default'}
          variant='outlined'
        />
      </Stack>
    </SelectMenuItem>
  );

  const renderProvinciaOption = (prov: ProvinciaStats) => (
    <SelectMenuItem key={prov.id} value={prov.id}>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={{ width: '100%' }}
      >
        <Typography>{prov.nombre}</Typography>
        <Stack direction='row' spacing={1}>
          {prov.tiene_sucursal ? (
            <Chip
              size='small'
              label='Ocupada'
              color='warning'
              variant='filled'
              icon={<Business />}
            />
          ) : (
            <Chip
              size='small'
              label='Disponible'
              color='success'
              variant='outlined'
              icon={<LocationOn />}
            />
          )}
        </Stack>
      </Stack>
    </SelectMenuItem>
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
          Gestión de Sucursales
        </Typography>
        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={() => {
            setIsEditing(false);
            setNombreSucursal('');
            setDireccionSucursal('');
            setLatitudSucursal('');
            setLongitudSucursal('');
            setSelectedDepartamento('');
            setSelectedProvincia('');
            setFormError(null);
            setOpenEditModal(true);
          }}
        >
          Nueva Sucursal
        </Button>
      </Stack>

      {/* Controles y Filtros */}
      <Card sx={{ mb: 2, p: 2 }}>
        <Stack direction='row' spacing={3} alignItems='center' flexWrap='wrap'>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel size='small'>Departamento</InputLabel>
            <Select
              value={filteredDepartamento}
              label='Departamento'
              onChange={(e: SelectChangeEvent) =>
                setFilteredDepartamento(e.target.value)
              }
              size='small'
            >
              <SelectMenuItem value=''>
                <em>Todos</em>
              </SelectMenuItem>
              {departamentosStats.map(renderDepartamentoOption)}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={groupByDepartamento}
                onChange={e => setGroupByDepartamento(e.target.checked)}
                size='small'
              />
            }
            label='Agrupar por departamento'
          />

          {filteredDepartamento && (
            <Button
              variant='outlined'
              size='small'
              onClick={() => setFilteredDepartamento('')}
            >
              Limpiar
            </Button>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Estadísticas compactas */}
          <Stack direction='row' spacing={2} alignItems='center'>
            <Chip
              icon={<Storefront />}
              label={`${
                groupByDepartamento
                  ? groupSucursalesByDepartamento().reduce(
                      (total: number, grupo: any) =>
                        total + grupo.sucursales.length,
                      0
                    )
                  : sucursales.filter(
                      s =>
                        !filteredDepartamento ||
                        s.departamento_id.toString() === filteredDepartamento
                    ).length
              } sucursales`}
              variant='outlined'
              size='small'
            />
            <Chip
              icon={<People />}
              label={`${
                groupByDepartamento
                  ? groupSucursalesByDepartamento().reduce(
                      (total: number, grupo: any) =>
                        total +
                        grupo.sucursales.reduce(
                          (subTotal: number, sucursal: any) =>
                            subTotal + sucursal.cantidad_empleados,
                          0
                        ),
                      0
                    )
                  : sucursales
                      .filter(
                        s =>
                          !filteredDepartamento ||
                          s.departamento_id.toString() === filteredDepartamento
                      )
                      .reduce(
                        (total: number, sucursal: any) =>
                          total + sucursal.cantidad_empleados,
                        0
                      )
              } empleados`}
              variant='outlined'
              size='small'
            />
          </Stack>
        </Stack>
      </Card>

      {loading && <CircularProgress />}

      {fetchError && !loading && (
        <Alert severity='error' sx={{ mt: 2 }}>
          {fetchError}
        </Alert>
      )}

      {!loading && !fetchError && (
        <Stack spacing={2}>
          {groupByDepartamento ? (
            // Vista agrupada por departamento
            groupSucursalesByDepartamento().map((grupo: any) => (
              <Card key={grupo.departamento_id}>
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    bgcolor: 'grey.100',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'
                  >
                    <Typography
                      variant='subtitle1'
                      fontWeight='600'
                      color='text.primary'
                    >
                      {grupo.departamento_nombre}
                    </Typography>
                    <Chip
                      label={`${grupo.sucursales.length} sucursal${
                        grupo.sucursales.length !== 1 ? 'es' : ''
                      }`}
                      size='small'
                      variant='outlined'
                    />
                  </Stack>
                </Box>
                <TableContainer component={Paper}>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre Sucursal</TableCell>
                        <TableCell>Provincia</TableCell>
                        <TableCell>Dirección</TableCell>
                        <TableCell align='center'>Empleados</TableCell>
                        <TableCell align='center'>Stock</TableCell>
                        <TableCell align='center'>Estado</TableCell>
                        <TableCell align='right'>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {grupo.sucursales.map((sucursal: any) => (
                        <TableRow
                          key={sucursal.id}
                          sx={{
                            backgroundColor:
                              sucursal.estado === 'inactiva'
                                ? 'grey.50'
                                : 'transparent',
                          }}
                        >
                          <TableCell>
                            <Stack
                              direction='row'
                              alignItems='center'
                              spacing={1}
                            >
                              <Storefront color='action' fontSize='small' />
                              <Typography variant='body2' fontWeight='500'>
                                {sucursal.nombre_sucursal}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{sucursal.nombre_provincia}</TableCell>
                          <TableCell>
                            <Tooltip
                              title={
                                sucursal.latitud && sucursal.longitud
                                  ? `Coordenadas: ${sucursal.latitud}, ${sucursal.longitud}`
                                  : 'Sin coordenadas registradas'
                              }
                              arrow
                            >
                              <Stack
                                direction='row'
                                alignItems='center'
                                spacing={1}
                              >
                                <LocationOn color='action' fontSize='small' />
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                  sx={{ maxWidth: 200 }}
                                >
                                  {sucursal.direccion || 'Sin dirección'}
                                </Typography>
                              </Stack>
                            </Tooltip>
                          </TableCell>
                          <TableCell align='center'>
                            <Tooltip
                              title={
                                sucursal.nombres_empleados &&
                                sucursal.nombres_empleados.length > 0
                                  ? sucursal.nombres_empleados.join(', ')
                                  : 'No hay empleados asignados'
                              }
                              arrow
                            >
                              <Chip
                                icon={<People />}
                                label={sucursal.cantidad_empleados}
                                variant='outlined'
                                size='small'
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell align='center'>
                            <Tooltip
                              title='Click para ver el stock de esta sucursal'
                              arrow
                            >
                              <Chip
                                icon={<Inventory />}
                                label='Ver Stock'
                                variant='outlined'
                                size='small'
                                color='info'
                                clickable
                                onClick={() => {
                                  setSelectedSucursal(sucursal);
                                  handleOpenStockModal();
                                }}
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell align='center'>
                            <Chip
                              label={
                                sucursal.estado === 'activa'
                                  ? 'Activa'
                                  : 'Inactiva'
                              }
                              color={
                                sucursal.estado === 'activa'
                                  ? 'success'
                                  : 'default'
                              }
                              size='small'
                            />
                          </TableCell>
                          <TableCell align='right'>
                            <IconButton
                              size='small'
                              onClick={e => handleMenuClick(e, sucursal)}
                            >
                              <MoreVert />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            ))
          ) : (
            // Vista simple sin agrupamiento
            <Card>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre Sucursal</TableCell>
                      <TableCell>Departamento</TableCell>
                      <TableCell>Provincia</TableCell>
                      <TableCell>Dirección</TableCell>
                      <TableCell align='center'>Empleados</TableCell>
                      <TableCell align='center'>Stock</TableCell>
                      <TableCell align='center'>Estado</TableCell>
                      <TableCell align='right'>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sucursales
                      .filter(
                        s =>
                          !filteredDepartamento ||
                          s.departamento_id.toString() === filteredDepartamento
                      )
                      .map(sucursal => (
                        <TableRow
                          key={sucursal.id}
                          sx={{
                            backgroundColor:
                              sucursal.estado === 'inactiva'
                                ? 'grey.100'
                                : 'transparent',
                          }}
                        >
                          <TableCell>
                            <Stack
                              direction='row'
                              alignItems='center'
                              spacing={1}
                            >
                              <Storefront color='action' />
                              <Typography variant='body2' fontWeight='bold'>
                                {sucursal.nombre_sucursal}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{sucursal.nombre_departamento}</TableCell>
                          <TableCell>{sucursal.nombre_provincia}</TableCell>
                          <TableCell>
                            <Tooltip
                              title={
                                sucursal.latitud && sucursal.longitud
                                  ? `Coordenadas: ${sucursal.latitud}, ${sucursal.longitud}`
                                  : 'Sin coordenadas registradas'
                              }
                              arrow
                            >
                              <Stack
                                direction='row'
                                alignItems='center'
                                spacing={1}
                              >
                                <LocationOn color='action' fontSize='small' />
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                  sx={{ maxWidth: 200 }}
                                >
                                  {sucursal.direccion || 'Sin dirección'}
                                </Typography>
                              </Stack>
                            </Tooltip>
                          </TableCell>
                          <TableCell align='center'>
                            <Tooltip
                              title={
                                sucursal.nombres_empleados &&
                                sucursal.nombres_empleados.length > 0
                                  ? sucursal.nombres_empleados.join(', ')
                                  : 'No hay empleados asignados'
                              }
                              arrow
                            >
                              <Chip
                                icon={<People />}
                                label={sucursal.cantidad_empleados}
                                variant='outlined'
                                size='small'
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell align='center'>
                            <Tooltip
                              title='Click para ver el stock de esta sucursal'
                              arrow
                            >
                              <Chip
                                icon={<Inventory />}
                                label='Ver Stock'
                                variant='outlined'
                                size='small'
                                color='info'
                                clickable
                                onClick={() => {
                                  setSelectedSucursal(sucursal);
                                  handleOpenStockModal();
                                }}
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell align='center'>
                            <Chip
                              label={
                                sucursal.estado === 'activa'
                                  ? 'Activa'
                                  : 'Inactiva'
                              }
                              color={
                                sucursal.estado === 'activa'
                                  ? 'success'
                                  : 'default'
                              }
                              size='small'
                            />
                          </TableCell>
                          <TableCell align='right'>
                            <IconButton
                              onClick={e => handleMenuClick(e, sucursal)}
                            >
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

          {((groupByDepartamento &&
            groupSucursalesByDepartamento().length === 0) ||
            (!groupByDepartamento &&
              sucursales.filter(
                s =>
                  !filteredDepartamento ||
                  s.departamento_id.toString() === filteredDepartamento
              ).length === 0)) && (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant='h6' color='text.secondary'>
                {filteredDepartamento
                  ? 'No hay sucursales en el departamento seleccionado'
                  : 'No hay sucursales registradas'}
              </Typography>
            </Card>
          )}
        </Stack>
      )}

      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={handleOpenEditModal}>
          <Edit sx={{ mr: 1 }} fontSize='small' /> Editar
        </MenuItem>
        <MenuItem onClick={handleOpenStockModal}>
          <Inventory sx={{ mr: 1 }} fontSize='small' /> Ver Stock
        </MenuItem>
        <MenuItem onClick={handleOpenEmpleadosModal}>
          <People sx={{ mr: 1 }} fontSize='small' /> Ver Empleados
        </MenuItem>
        <MenuItem
          onClick={handleOpenConfirmDialog}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} fontSize='small' />
          {selectedSucursal?.estado === 'activa' ? 'Desactivar' : 'Activar'}
        </MenuItem>
      </Menu>

      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirmar Acción</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres{' '}
            {selectedSucursal?.estado === 'activa' ? 'desactivar' : 'activar'}{' '}
            la sucursal <strong>{selectedSucursal?.nombre_sucursal}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancelar</Button>
          <Button onClick={handleDeactivate} color='error'>
            {selectedSucursal?.estado === 'activa' ? 'Desactivar' : 'Activar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Modal open={openEditModal} onClose={handleCloseEditModal}>
        <Box sx={style}>
          <Typography variant='h6' component='h2'>
            {isEditing ? 'Editar Sucursal' : 'Crear Nueva Sucursal'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {formError && <Alert severity='error'>{formError}</Alert>}
              <TextField
                label='Nombre de la Sucursal'
                value={nombreSucursal}
                onChange={e => setNombreSucursal(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label='Dirección de la Sucursal'
                value={direccionSucursal}
                onChange={e => setDireccionSucursal(e.target.value)}
                required
                fullWidth
                placeholder='Ej: Av. Larco 345, Miraflores, Lima'
              />
              <Stack direction='row' spacing={2}>
                <TextField
                  label='Latitud'
                  value={latitudSucursal}
                  onChange={e => setLatitudSucursal(e.target.value)}
                  required
                  fullWidth
                  type='number'
                  inputProps={{
                    step: '0.000001',
                    min: -90,
                    max: 90,
                  }}
                  placeholder='Ej: -12.123456'
                  helperText='Latitud (-90 a 90°, máx. 6 decimales)'
                />
                <TextField
                  label='Longitud'
                  value={longitudSucursal}
                  onChange={e => setLongitudSucursal(e.target.value)}
                  required
                  fullWidth
                  type='number'
                  inputProps={{
                    step: '0.000001',
                    min: -180,
                    max: 180,
                  }}
                  placeholder='Ej: -77.123456'
                  helperText='Longitud (-180 a 180°, máx. 6 decimales)'
                />
              </Stack>
              <FormControl fullWidth required>
                <InputLabel>Departamento</InputLabel>
                <Select
                  value={selectedDepartamento}
                  label='Departamento'
                  onChange={(e: SelectChangeEvent) =>
                    setSelectedDepartamento(e.target.value)
                  }
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 400,
                      },
                    },
                  }}
                >
                  {departamentosStats.map(renderDepartamentoOption)}
                </Select>
              </FormControl>
              <FormControl fullWidth required disabled={!selectedDepartamento}>
                <InputLabel>Provincia</InputLabel>
                <Select
                  value={selectedProvincia}
                  label='Provincia'
                  onChange={(e: SelectChangeEvent) =>
                    setSelectedProvincia(e.target.value)
                  }
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 400,
                      },
                    },
                  }}
                >
                  {provinciasStats.map(renderProvinciaOption)}
                </Select>
              </FormControl>
              <Button type='submit' variant='contained' sx={{ mt: 2 }}>
                {isEditing ? 'Guardar Cambios' : 'Crear Sucursal'}
              </Button>
            </Stack>
          </form>
        </Box>
      </Modal>

      {/* Modal para Ver Empleados */}
      <Dialog
        open={openEmpleadosModal}
        onClose={handleCloseEmpleadosModal}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>
          Empleados en {selectedSucursal?.nombre_sucursal}
        </DialogTitle>
        <DialogContent>
          <List>
            {selectedSucursal?.nombres_empleados &&
            selectedSucursal.nombres_empleados.length > 0 ? (
              selectedSucursal.nombres_empleados.map(
                (nombre: string, index: number) => (
                  <ListItem key={`empleado-${nombre}-${index}`}>
                    <ListItemIcon>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {nombre.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText primary={nombre} />
                  </ListItem>
                )
              )
            ) : (
              <ListItem>
                <ListItemText primary='No hay empleados asignados a esta sucursal.' />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmpleadosModal}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Ver Stock */}
      <Dialog
        open={openStockModal}
        onClose={handleCloseStockModal}
        maxWidth='lg'
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='h6'>
              Stock de la Sucursal - {selectedSucursal?.nombre_sucursal}
            </Typography>
            <Chip
              label={`${stockData.length} productos`}
              color='primary'
              variant='outlined'
              size='small'
            />
          </Stack>
        </DialogTitle>
        <DialogContent>
          {stockLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align='center'>Stock Actual</TableCell>
                    <TableCell align='center'>Stock Mínimo</TableCell>
                    <TableCell align='center'>Stock Máximo</TableCell>
                    <TableCell align='center'>Estado</TableCell>
                    <TableCell align='center'>Última Actualización</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stockData.map(item => (
                    <TableRow
                      key={item.producto_id}
                      sx={{
                        backgroundColor: getStockBackgroundColor(
                          item.estado_stock
                        ),
                        opacity: item.estado_stock === 'critico' ? 0.7 : 1,
                      }}
                    >
                      <TableCell>
                        <Typography variant='body2' fontWeight='500'>
                          {item.producto_nombre}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography
                          variant='h6'
                          color={getStockTextColor(item.estado_stock)}
                          fontWeight='bold'
                        >
                          {item.cantidad_actual}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography variant='body2' color='text.secondary'>
                          {item.stock_minimo}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography variant='body2' color='text.secondary'>
                          {item.stock_maximo}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Chip
                          label={getStockStateLabel(item.estado_stock)}
                          color={getStockStateColor(item.estado_stock)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <Typography variant='caption' color='text.secondary'>
                          {item.ultima_actualizacion
                            ? new Date(
                                item.ultima_actualizacion
                              ).toLocaleDateString('es-PE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Resumen de Stock */}
          {!stockLoading && stockData.length > 0 && (
            <Card sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}>
              <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
                Resumen de Stock:
              </Typography>
              <Stack direction='row' spacing={3}>
                <Chip
                  label={`${
                    stockData.filter(item => item.estado_stock === 'normal')
                      .length
                  } Normal`}
                  color='success'
                  variant='outlined'
                  size='small'
                />
                <Chip
                  label={`${
                    stockData.filter(item => item.estado_stock === 'bajo')
                      .length
                  } Bajo`}
                  color='warning'
                  variant='outlined'
                  size='small'
                />
                <Chip
                  label={`${
                    stockData.filter(item => item.estado_stock === 'critico')
                      .length
                  } Crítico`}
                  color='error'
                  variant='outlined'
                  size='small'
                />
              </Stack>
            </Card>
          )}

          {stockData.length === 0 && !stockLoading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant='body1' color='text.secondary'>
                No hay datos de stock para esta sucursal.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStockModal} variant='contained'>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SucursalesPage;
