import {
  Info,
  LocalFireDepartment,
  LocationOn,
  ShoppingCart,
  Star,
  Warning,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import Popover from '@mui/material/Popover';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Carrito from '../components/Carrito';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { supabase } from '../config/supabase.config';
import { useCarrito } from '../hooks/useCarrito';
import { useClienteAuth } from '../hooks/useClienteAuth';
import { Producto } from '../types';

interface Categoria {
  id: number;
  nombre: string;
}

interface Sucursal {
  id: string;
  nombre: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

const TiendaVirtual = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalRecomendada, setSucursalRecomendada] = useState<string>('');
  const [stockSucursal, setStockSucursal] = useState<Record<number, number>>(
    {}
  );

  const {
    carrito: carritoHook,
    agregarAlCarrito: agregarAlCarritoHook,
    sucursalSeleccionada,
    setSucursalSeleccionada,
  } = useCarrito();
  const { cliente, isAuthenticated } = useClienteAuth();

  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleCarritoClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCarritoClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'carrito-popover' : undefined;

  // Función para encontrar la sucursal recomendada basada en la ubicación del usuario
  const encontrarSucursalRecomendada = useCallback(
    (sucursalesData: Sucursal[]) => {
      if (!isAuthenticated || !cliente || !cliente.provincia_id) {
        return '';
      }

      // Buscar sucursales en la misma provincia
      const sucursalExacta = sucursalesData.find(
        sucursal => sucursal.provincia === cliente.provincia_id?.toString()
      );

      if (sucursalExacta) {
        return sucursalExacta.id;
      }

      // Si no hay sucursal en la provincia, devolver la primera disponible
      if (sucursalesData.length > 0) {
        return sucursalesData[0]?.id || '';
      }
      return '';
    },
    [isAuthenticated, cliente]
  );

  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true);
      if (!error && data) {
        setProductos(data);
      }
    };
    const fetchCategorias = async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre');
      if (!error && data) {
        setCategorias(data);
      }
    };
    fetchProductos();
    fetchCategorias();
  }, []);

  useEffect(() => {
    const fetchSucursales = async () => {
      const { data, error } = await supabase
        .from('sucursales')
        .select('id, nombre, provincia_id, direccion')
        .order('nombre');
      if (!error && data) {
        // Transformar los datos para que coincidan con la interfaz
        const sucursalesTransformadas = data.map(sucursal => ({
          id: sucursal.id,
          nombre: sucursal.nombre,
          departamento: '', // Por ahora lo dejamos vacío, se puede mejorar después
          provincia: sucursal.provincia_id?.toString() || '',
          distrito: sucursal.direccion || '',
        }));

        setSucursales(sucursalesTransformadas);
        // Encontrar sucursal recomendada después de cargar las sucursales
        const recomendada = encontrarSucursalRecomendada(
          sucursalesTransformadas
        );
        setSucursalRecomendada(recomendada);

        // Si el usuario está autenticado y hay una recomendación, seleccionarla automáticamente
        if (isAuthenticated && recomendada && !sucursalSeleccionada) {
          setSucursalSeleccionada(recomendada);
        }
      }
    };
    fetchSucursales();
  }, [
    isAuthenticated,
    cliente,
    sucursalSeleccionada,
    encontrarSucursalRecomendada,
  ]);

  useEffect(() => {
    if (!sucursalSeleccionada) {
      return;
    }
    const fetchStock = async () => {
      const { data, error } = await supabase
        .from('stock')
        .select('producto_id, cantidad')
        .eq('sucursal_id', sucursalSeleccionada);
      if (!error && data) {
        const stockMap: Record<number, number> = {};
        data.forEach((item: { producto_id: number; cantidad: number }) => {
          stockMap[item.producto_id] = item.cantidad;
        });
        setStockSucursal(stockMap);
      }
    };
    fetchStock();
  }, [sucursalSeleccionada]);

  const getCategoriaNombre = (categoriaId: number) => {
    const cat = categorias.find(c => c.id === categoriaId);
    if (cat) {
      return cat.nombre;
    }
    return 'Sin categoría';
  };

  const getSucursalRecomendadaNombre = () => {
    if (!sucursalRecomendada) {
      return '';
    }
    const sucursal = sucursales.find(s => s.id === sucursalRecomendada);
    if (sucursal) {
      return sucursal.nombre;
    }
    return '';
  };

  const handleSucursalRecomendadaClick = () => {
    if (sucursalRecomendada) {
      setSucursalSeleccionada(sucursalRecomendada);
    }
  };

  const getRecomendacionTooltip = () => {
    if (!isAuthenticated || !cliente) {
      return 'Inicia sesión para obtener recomendaciones personalizadas basadas en tu ubicación';
    }

    if (!cliente.departamento_id || !cliente.provincia_id) {
      return 'Completa tu información de ubicación en tu perfil para obtener recomendaciones más precisas';
    }

    return 'Esta sucursal está cerca de tu ubicación registrada';
  };

  const handleSucursalChange = (event: SelectChangeEvent<string>) => {
    setSucursalSeleccionada(event.target.value);
  };

  const handleIrAPagarClick = () => {
    navigate('/checkout');
  };

  const handleLoginClick = () => {
    navigate('/cliente-login');
  };

  const handleAgregarAlCarrito = (producto: Producto) => {
    agregarAlCarritoHook(producto);
  };

  const handleMensajeClose = () => {
    setMensaje(null);
  };

  const renderProductos = () => {
    if (!sucursalSeleccionada) {
      return (
        <Typography color='text.secondary' sx={{ mt: 4 }}>
          Selecciona una sucursal para ver los productos y su stock disponible.
        </Typography>
      );
    }

    return (
      <Grid container spacing={3}>
        {productos.map(producto => {
          const stock = stockSucursal[Number(producto.id)];
          return (
            <Grid item xs={12} sm={6} md={4} key={producto.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 3,
                }}
              >
                {producto.url_imagen && (
                  <CardMedia
                    component='img'
                    height='180'
                    image={producto.url_imagen}
                    alt={producto.nombre}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction='row' spacing={1} alignItems='center' mb={1}>
                    <Typography
                      variant='h6'
                      fontWeight={600}
                      color='primary.main'
                    >
                      {producto.nombre}
                    </Typography>
                    {producto.es_destacado && (
                      <Chip
                        label='Destacado'
                        color='warning'
                        size='small'
                        icon={<Star sx={{ fontSize: 16 }} />}
                      />
                    )}
                    {producto.es_mas_pedido && (
                      <Chip
                        label='Más pedido'
                        color='error'
                        size='small'
                        icon={<LocalFireDepartment sx={{ fontSize: 16 }} />}
                      />
                    )}
                  </Stack>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    display='block'
                    mb={1}
                  >
                    {getCategoriaNombre(producto.categoria_id ?? 0)}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' mb={1}>
                    {producto.descripcion}
                  </Typography>
                  <Typography
                    variant='subtitle1'
                    fontWeight={700}
                    color='secondary.main'
                  >
                    S/ {Number(producto.precio).toFixed(2)}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mt: 1 }}
                  >
                    Stock disponible:{' '}
                    {typeof stock === 'number' ? stock : 'Sin datos'}
                  </Typography>
                  {typeof stock === 'number' && stock <= 10 && stock > 0 && (
                    <Chip
                      label={`¡Solo ${stock} en stock!`}
                      color='warning'
                      size='small'
                      icon={<Warning sx={{ fontSize: 16 }} />}
                      sx={{ mt: 1 }}
                    />
                  )}
                  {typeof stock === 'number' && stock === 0 && (
                    <Chip
                      label='Agotado'
                      color='error'
                      size='small'
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
                <Button
                  variant='contained'
                  color='primary'
                  startIcon={<ShoppingCart />}
                  sx={{ m: 2, fontWeight: 600, borderRadius: 2 }}
                  onClick={() => handleAgregarAlCarrito(producto)}
                  disabled={typeof stock === 'number' && stock === 0}
                >
                  Agregar al carrito
                </Button>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <>
      <Navbar />
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant='h3' fontWeight={700} color='primary.main'>
            Tienda Virtual
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant='outlined'
              color='secondary'
              startIcon={<ShoppingCart />}
              sx={{ fontWeight: 600, borderRadius: 2, minWidth: 0 }}
              onClick={handleCarritoClick}
            >
              Carrito (
              {carritoHook.reduce((acc, item) => acc + item.cantidad, 0)})
            </Button>
            <Button
              variant='contained'
              color='primary'
              sx={{ fontWeight: 700, borderRadius: 2, minWidth: 0 }}
              onClick={handleIrAPagarClick}
              disabled={carritoHook.length === 0}
            >
              Ir a pagar
            </Button>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleCarritoClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Box sx={{ p: 2, minWidth: 250 }}>
                <Carrito carrito={carritoHook} categorias={categorias} />
              </Box>
            </Popover>
          </Box>
        </Box>

        {/* Sección de selección de sucursal con recomendación */}
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ maxWidth: 400, mb: 2 }}>
            <InputLabel>Sucursal</InputLabel>
            <Select
              value={sucursalSeleccionada}
              label='Sucursal'
              onChange={handleSucursalChange}
            >
              <MenuItem value=''>
                <em>Seleccione una sucursal</em>
              </MenuItem>
              {sucursales.map(suc => (
                <MenuItem key={suc.id} value={suc.id}>
                  {suc.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Mostrar recomendación si el usuario está autenticado */}
          {isAuthenticated && sucursalRecomendada && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip
                icon={<LocationOn />}
                label={`Recomendada: ${getSucursalRecomendadaNombre()}`}
                color='primary'
                variant='outlined'
                onClick={handleSucursalRecomendadaClick}
                sx={{ cursor: 'pointer' }}
              />
              <Tooltip title={getRecomendacionTooltip()}>
                <Info sx={{ color: 'text.secondary', fontSize: 20 }} />
              </Tooltip>
            </Box>
          )}

          {/* Mensaje informativo para usuarios no autenticados */}
          {!isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip
                icon={<Info />}
                label='Inicia sesión para obtener recomendaciones personalizadas'
                color='info'
                variant='outlined'
                onClick={handleLoginClick}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          )}
        </Box>

        {renderProductos()}

        <Snackbar
          open={!!mensaje}
          autoHideDuration={2000}
          onClose={handleMensajeClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity='success' sx={{ width: '100%' }}>
            {mensaje}
          </Alert>
        </Snackbar>
      </Box>
      <Footer />
    </>
  );
};

export default TiendaVirtual;
