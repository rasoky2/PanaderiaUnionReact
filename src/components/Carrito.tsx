import { Avatar, Box, Divider, Stack, Typography } from '@mui/material';
import { CarritoItem } from '../hooks/useCarrito';

interface Categoria {
  id: number;
  nombre: string;
}

interface CarritoProps {
  carrito: CarritoItem[];
  categorias: Categoria[];
}

const Carrito = ({ carrito, categorias }: CarritoProps) => {
  const getCategoriaNombre = (categoriaId?: number) => {
    const cat = categorias.find(c => c.id === categoriaId);
    return cat ? cat.nombre : 'Sin categoría';
  };
  const total = carrito.reduce(
    (acc, item) => acc + item.producto.precio * item.cantidad,
    0
  );
  return (
    <Box sx={{ minWidth: 250 }}>
      <Typography variant='subtitle1' fontWeight={600} mb={1}>
        Productos en carrito
      </Typography>
      {carrito.length === 0 ? (
        <Typography color='text.secondary'>Carrito vacío</Typography>
      ) : (
        <>
          {carrito.map(item => (
            <Box key={item.producto.id} sx={{ mb: 2 }}>
              <Stack direction='row' spacing={1} alignItems='center'>
                <Avatar
                  src={item.producto.url_imagen || ''}
                  alt={item.producto.nombre}
                  variant='rounded'
                  sx={{ width: 40, height: 40 }}
                />
                <Box>
                  <Typography variant='body2' fontWeight={600}>
                    {item.producto.nombre}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {getCategoriaNombre(item.producto.categoria_id)}
                  </Typography>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    display='block'
                  >
                    x{item.cantidad} • S/{' '}
                    {Number(item.producto.precio).toFixed(2)} c/u
                  </Typography>
                  <Typography
                    variant='caption'
                    color='secondary.main'
                    fontWeight={700}
                  >
                    Subtotal: S/{' '}
                    {(item.producto.precio * item.cantidad).toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 1 }} />
            </Box>
          ))}
          <Typography variant='subtitle2' align='right' fontWeight={700}>
            Total: S/ {total.toFixed(2)}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default Carrito;
