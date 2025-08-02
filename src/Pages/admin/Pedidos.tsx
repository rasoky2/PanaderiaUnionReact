import {
  Assignment,
  Edit,
  LocalShipping,
  Payment,
  Person,
  Receipt,
  Search,
  Visibility,
} from '@mui/icons-material';
import {
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
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase.config';
import { PedidoCompleto } from '../../types';

const PedidosPage: React.FC = () => {
  const [pedidos, setPedidos] = useState<PedidoCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState<PedidoCompleto | null>(
    null
  );
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Estados para filtros
  const [sucursalFilter, setSucursalFilter] = useState<string>('todos');
  const [sucursales, setSucursales] = useState<
    { id: string; nombre_sucursal: string }[]
  >([]);

  useEffect(() => {
    fetchPedidos();
    fetchSucursales();
  }, []);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(
          `
          *,
          cliente:clientes(id, nombre, apellido, email, celular),
          sucursal:sucursales(id, nombre),
          agencia_envio:agencias_envio(id, nombre),
          items:pedido_items(
            id,
            cantidad,
            precio_unitario,
            subtotal,
            producto:productos(id, nombre, url_imagen)
          ),
          seguimiento:seguimiento_pedido(*)
        `
        )
        .order('fecha_pedido', { ascending: false });

      if (error) {
        console.info('Error fetching pedidos:', error);
      } else {
        setPedidos(data || []);
      }
    } catch (error) {
      console.info('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSucursales = async () => {
    const { data, error } = await supabase
      .from('sucursales')
      .select('id, nombre_sucursal')
      .order('nombre_sucursal');

    if (!error && data) {
      setSucursales(data);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'warning';
      case 'confirmado':
        return 'info';
      case 'preparando':
        return 'primary';
      case 'enviado':
        return 'secondary';
      case 'en_transito':
        return 'info';
      case 'entregado':
        return 'success';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'Pendiente';
      case 'confirmado':
        return 'Confirmado';
      case 'preparando':
        return 'Preparando';
      case 'enviado':
        return 'Enviado';
      case 'en_transito':
        return 'En Tránsito';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const filteredPedidos = pedidos.filter(pedido => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      pedido.numero_tracking?.toLowerCase().includes(searchLower) ||
      pedido.cliente?.nombre?.toLowerCase().includes(searchLower) ||
      pedido.cliente?.apellido?.toLowerCase().includes(searchLower) ||
      pedido.cliente?.email?.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === 'todos' || pedido.estado === statusFilter;
    const matchesSucursal =
      sucursalFilter === 'todos' || pedido.sucursal_id === sucursalFilter;

    return matchesSearch && matchesStatus && matchesSucursal;
  });

  const handleViewDetails = (pedido: PedidoCompleto) => {
    setSelectedPedido(pedido);
    setOpenDetailsDialog(true);
  };

  const handleChangeStatus = (pedido: PedidoCompleto) => {
    setSelectedPedido(pedido);
    setNewStatus(pedido.estado);
    setOpenStatusDialog(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedPedido || !newStatus) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: newStatus })
        .eq('id', selectedPedido.id);

      if (error) {
        console.info('Error updating status:', error);
      } else {
        // Crear seguimiento del cambio de estado
        await supabase.from('seguimiento_pedido').insert({
          pedido_id: selectedPedido.id,
          estado: newStatus,
          descripcion: `Estado cambiado a: ${getStatusText(newStatus)}`,
        });

        fetchPedidos();
        setOpenStatusDialog(false);
        setSelectedPedido(null);
      }
    } catch (error) {
      console.info('Error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTotalItems = (pedido: PedidoCompleto) =>
    pedido.items?.reduce((total, item) => total + item.cantidad, 0) || 0;

  const renderPedidoRow = (pedido: PedidoCompleto) => (
    <TableRow key={pedido.id}>
      <TableCell>
        <Typography variant='body2' fontWeight='bold'>
          {pedido.numero_tracking}
        </Typography>
      </TableCell>
      <TableCell>
        <Stack>
          <Typography variant='body2' fontWeight='500'>
            {pedido.cliente?.nombre} {pedido.cliente?.apellido}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {pedido.cliente?.email}
          </Typography>
          {pedido.cliente?.celular && (
            <Typography variant='caption' color='text.secondary'>
              📱 {pedido.cliente.celular}
            </Typography>
          )}
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant='body2'>{pedido.sucursal?.nombre}</Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={getStatusText(pedido.estado)}
          color={
            getStatusColor(pedido.estado) as
              | 'warning'
              | 'info'
              | 'primary'
              | 'secondary'
              | 'success'
              | 'error'
              | 'default'
          }
          size='small'
        />
      </TableCell>
      <TableCell align='right'>
        <Typography variant='body2' fontWeight='bold'>
          {formatCurrency(pedido.total)}
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          {getTotalItems(pedido)} items
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant='body2'>
          {formatDate(pedido.fecha_pedido)}
        </Typography>
      </TableCell>
      <TableCell align='center'>
        <Stack direction='row' spacing={1} justifyContent='center'>
          <IconButton
            size='small'
            onClick={() => handleViewDetails(pedido)}
            title='Ver detalles'
          >
            <Visibility />
          </IconButton>
          <IconButton
            size='small'
            onClick={() => handleChangeStatus(pedido)}
            title='Cambiar estado'
          >
            <Edit />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
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
          Gestión de Pedidos
        </Typography>
        <Chip
          label={`${filteredPedidos.length} pedidos`}
          color='primary'
          variant='outlined'
        />
      </Stack>

      {/* Filtros */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label='Buscar pedidos'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Número de tracking, cliente...'
              InputProps={{
                startAdornment: (
                  <Search sx={{ mr: 1, color: 'text.secondary' }} />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label='Estado'
                onChange={e => setStatusFilter(e.target.value)}
              >
                <MenuItem value='todos'>Todos los estados</MenuItem>
                <MenuItem value='pendiente'>Pendiente</MenuItem>
                <MenuItem value='confirmado'>Confirmado</MenuItem>
                <MenuItem value='preparando'>Preparando</MenuItem>
                <MenuItem value='enviado'>Enviado</MenuItem>
                <MenuItem value='en_transito'>En Tránsito</MenuItem>
                <MenuItem value='entregado'>Entregado</MenuItem>
                <MenuItem value='cancelado'>Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sucursal</InputLabel>
              <Select
                value={sucursalFilter}
                label='Sucursal'
                onChange={e => setSucursalFilter(e.target.value)}
              >
                <MenuItem value='todos'>Todas las sucursales</MenuItem>
                {sucursales.map(sucursal => (
                  <MenuItem key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre_sucursal}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant='outlined'
              onClick={fetchPedidos}
              disabled={loading}
            >
              {loading && <CircularProgress size={20} />}
              {!loading && 'Actualizar'}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && (
        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>N° Tracking</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Sucursal</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align='right'>Total</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align='center'>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{filteredPedidos.map(renderPedidoRow)}</TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Dialog de detalles del pedido */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='h6'>
              Detalles del Pedido: {selectedPedido?.numero_tracking}
            </Typography>
            <Chip
              label={selectedPedido ? getStatusText(selectedPedido.estado) : ''}
              color={
                selectedPedido
                  ? (getStatusColor(selectedPedido.estado) as
                      | 'warning'
                      | 'info'
                      | 'primary'
                      | 'secondary'
                      | 'success'
                      | 'error'
                      | 'default')
                  : 'default'
              }
            />
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedPedido && (
            <Grid container spacing={3}>
              {/* Información del cliente */}
              <Grid item xs={12} md={6}>
                <Typography variant='h6' gutterBottom>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Información del Cliente
                </Typography>
                <Stack spacing={1}>
                  <Typography>
                    <strong>Nombre:</strong> {selectedPedido.cliente?.nombre}{' '}
                    {selectedPedido.cliente?.apellido}
                  </Typography>
                  <Typography>
                    <strong>Email:</strong> {selectedPedido.cliente?.email}
                  </Typography>
                  {selectedPedido.cliente?.celular && (
                    <Typography>
                      <strong>Celular:</strong> {selectedPedido.cliente.celular}
                    </Typography>
                  )}
                </Stack>
              </Grid>

              {/* Información del pedido */}
              <Grid item xs={12} md={6}>
                <Typography variant='h6' gutterBottom>
                  <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Información del Pedido
                </Typography>
                <Stack spacing={1}>
                  <Typography>
                    <strong>Fecha:</strong>{' '}
                    {formatDate(selectedPedido.fecha_pedido)}
                  </Typography>
                  <Typography>
                    <strong>Método de pago:</strong>{' '}
                    {selectedPedido.metodo_pago}
                  </Typography>
                  <Typography>
                    <strong>Subtotal:</strong>{' '}
                    {formatCurrency(selectedPedido.subtotal)}
                  </Typography>
                  <Typography>
                    <strong>Envío:</strong>{' '}
                    {formatCurrency(selectedPedido.costo_envio)}
                  </Typography>
                  <Typography variant='h6' color='primary'>
                    <strong>Total:</strong>{' '}
                    {formatCurrency(selectedPedido.total)}
                  </Typography>
                </Stack>
              </Grid>

              {/* Dirección de entrega */}
              <Grid item xs={12}>
                <Typography variant='h6' gutterBottom>
                  <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Dirección de Entrega
                </Typography>
                <Typography>{selectedPedido.direccion_entrega}</Typography>
                {selectedPedido.notas && (
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mt: 1 }}
                  >
                    <strong>Notas:</strong> {selectedPedido.notas}
                  </Typography>
                )}
              </Grid>

              {/* Items del pedido */}
              <Grid item xs={12}>
                <Typography variant='h6' gutterBottom>
                  <Payment sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Productos ({selectedPedido.items?.length || 0} items)
                </Typography>
                <TableContainer component={Paper} variant='outlined'>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Producto</TableCell>
                        <TableCell align='center'>Cantidad</TableCell>
                        <TableCell align='right'>Precio Unit.</TableCell>
                        <TableCell align='right'>Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPedido.items?.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Stack
                              direction='row'
                              spacing={1}
                              alignItems='center'
                            >
                              {item.producto?.url_imagen && (
                                <Box
                                  component='img'
                                  src={item.producto.url_imagen}
                                  alt={item.producto.nombre}
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1,
                                  }}
                                />
                              )}
                              <Typography variant='body2'>
                                {item.producto?.nombre}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align='center'>{item.cantidad}</TableCell>
                          <TableCell align='right'>
                            {formatCurrency(item.precio_unitario)}
                          </TableCell>
                          <TableCell align='right'>
                            {formatCurrency(item.subtotal)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Seguimiento */}
              {selectedPedido.seguimiento &&
                selectedPedido.seguimiento.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant='h6' gutterBottom>
                      <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Seguimiento
                    </Typography>
                    <Stack spacing={1}>
                      {selectedPedido.seguimiento.map(seguimiento => (
                        <Box
                          key={`${seguimiento.fecha_evento}-${seguimiento.descripcion}`}
                          sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}
                        >
                          <Typography variant='body2' fontWeight='500'>
                            {formatDate(seguimiento.fecha_evento)}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {seguimiento.descripcion}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Grid>
                )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Cerrar</Button>
          <Button
            variant='contained'
            onClick={() => {
              setOpenDetailsDialog(false);
              if (selectedPedido) {
                handleChangeStatus(selectedPedido);
              }
            }}
          >
            Cambiar Estado
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de cambio de estado */}
      <Dialog
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
      >
        <DialogTitle>Cambiar Estado del Pedido</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Cambiar el estado del pedido {selectedPedido?.numero_tracking}
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>Nuevo Estado</InputLabel>
            <Select
              value={newStatus}
              label='Nuevo Estado'
              onChange={e => setNewStatus(e.target.value)}
            >
              <MenuItem value='pendiente'>Pendiente</MenuItem>
              <MenuItem value='confirmado'>Confirmado</MenuItem>
              <MenuItem value='preparando'>Preparando</MenuItem>
              <MenuItem value='enviado'>Enviado</MenuItem>
              <MenuItem value='en_transito'>En Tránsito</MenuItem>
              <MenuItem value='entregado'>Entregado</MenuItem>
              <MenuItem value='cancelado'>Cancelado</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusDialog(false)}>Cancelar</Button>
          <Button onClick={confirmStatusChange} variant='contained'>
            Confirmar Cambio
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PedidosPage;
