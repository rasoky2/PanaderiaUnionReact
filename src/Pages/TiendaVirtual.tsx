import {
  LocalFireDepartment,
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
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import Popover from '@mui/material/Popover';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Carrito from '../components/Carrito';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { supabase } from '../config/supabase.config';
import { useCarrito } from '../hooks/useCarrito';
import { Producto } from '../types';

interface Categoria {
  id: number;
  nombre: string;
}

interface Sucursal {
  id: string;
  nombre: string;
}

const TiendaVirtual = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('');
  const [stockSucursal, setStockSucursal] = useState<Record<number, number>>(
    {}
  );

  const { carrito: carritoHook, agregarAlCarrito: agregarAlCarritoHook } =
    useCarrito();

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

  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true);
      if (!error && data) setProductos(data);
    };
    const fetchCategorias = async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre');
      if (!error && data) setCategorias(data);
    };
    fetchProductos();
    fetchCategorias();
  }, []);

  useEffect(() => {
    const fetchSucursales = async () => {
      const { data, error } = await supabase
        .from('sucursales')
        .select('id, nombre')
        .order('nombre');
      if (!error && data) setSucursales(data);
    };
    fetchSucursales();
  }, []);

  useEffect(() => {
    if (!sucursalSeleccionada) return;
    const fetchStock = async () => {
      const { data, error } = await supabase
        .from('stock')
        .select('producto_id, cantidad')
        .eq('sucursal_id', sucursalSeleccionada);
      if (!error && data) {
        const stockMap: Record<number, number> = {};
        data.forEach((item: any) => {
          stockMap[item.producto_id] = item.cantidad;
        });
        setStockSucursal(stockMap);
      }
    };
    fetchStock();
  }, [sucursalSeleccionada]);

  const getCategoriaNombre = (categoriaId: number) => {
    const cat = categorias.find(c => c.id === categoriaId);
    return cat ? cat.nombre : 'Sin categoría';
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
              onClick={() => navigate('/checkout')}
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
        <FormControl fullWidth sx={{ mb: 3, maxWidth: 400 }}>
          <InputLabel>Sucursal</InputLabel>
          <Select
            value={sucursalSeleccionada}
            label='Sucursal'
            onChange={e => setSucursalSeleccionada(e.target.value)}
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
        {!sucursalSeleccionada ? (
          <Typography color='text.secondary' sx={{ mt: 4 }}>
            Selecciona una sucursal para ver los productos y su stock
            disponible.
          </Typography>
        ) : (
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
                      <Stack
                        direction='row'
                        spacing={1}
                        alignItems='center'
                        mb={1}
                      >
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
                      {typeof stock === 'number' &&
                        stock <= 10 &&
                        stock > 0 && (
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
                      onClick={() => agregarAlCarritoHook(producto)}
                      disabled={typeof stock === 'number' && stock === 0}
                    >
                      Agregar al carrito
                    </Button>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
        <Snackbar
          open={!!mensaje}
          autoHideDuration={2000}
          onClose={() => setMensaje(null)}
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
