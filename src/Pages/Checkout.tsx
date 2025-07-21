import { ShoppingCartCheckout } from '@mui/icons-material';
import {
  Box,
  Button,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import { useState } from 'react';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { useNavigate } from 'react-router-dom';
import Carrito from '../components/Carrito';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useCarrito } from '../hooks/useCarrito';

const categoriasDemo = [
  { id: 1, nombre: 'Panes' },
  { id: 2, nombre: 'Postres' },
  { id: 3, nombre: 'Bebidas' },
  { id: 4, nombre: 'Galletas y Cookies' },
  { id: 5, nombre: 'Productos Especiales' },
  { id: 6, nombre: 'Pasteles y Tortas' },
];

const Checkout = () => {
  const { carrito, setCliente, setMetodoPago } = useCarrito();
  const total = carrito.reduce(
    (acc, item) => acc + item.producto.precio * item.cantidad,
    0
  );
  const [tab, setTab] = useState(0);
  // Estado para tarjeta de crédito
  const [card, setCard] = useState({
    cvc: '',
    expiry: '',
    name: '',
    number: '',
    focus: '',
  });
  const [clienteForm, setClienteForm] = useState({
    nombre: '',
    correo: '',
    direccion: '',
  });
  const navigate = useNavigate();

  const handleConfirmarCompra = () => {
    setCliente(clienteForm);
    setMetodoPago(tab === 0 ? 'QR Yape' : 'Tarjeta de crédito');
    navigate('/payment');
  };

  return (
    <>
      <Navbar />
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 600, mx: 'auto' }}>
        <Typography variant='h4' fontWeight={700} color='primary.main' mb={2}>
          Checkout
        </Typography>
        <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
          <Typography variant='h6' fontWeight={600} mb={1}>
            Resumen del carrito
          </Typography>
          <Carrito carrito={carrito} categorias={categoriasDemo} />
        </Paper>
        <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
          <Typography variant='h6' fontWeight={600} mb={2}>
            Datos del cliente
          </Typography>
          <TextField
            label='Nombre completo'
            fullWidth
            sx={{ mb: 2 }}
            value={clienteForm.nombre}
            onChange={e =>
              setClienteForm({ ...clienteForm, nombre: e.target.value })
            }
          />
          <TextField
            label='Correo electrónico'
            fullWidth
            sx={{ mb: 2 }}
            value={clienteForm.correo}
            onChange={e =>
              setClienteForm({ ...clienteForm, correo: e.target.value })
            }
          />
          <TextField
            label='Dirección de entrega'
            fullWidth
            sx={{ mb: 2 }}
            value={clienteForm.direccion}
            onChange={e =>
              setClienteForm({ ...clienteForm, direccion: e.target.value })
            }
          />
        </Paper>
        <Paper sx={{ p: 3 }} elevation={2}>
          <Typography variant='h6' fontWeight={600} mb={2}>
            Método de pago
          </Typography>
          <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label='QR Yape' />
            <Tab label='Tarjeta de crédito' />
          </Tabs>
          {tab === 0 && (
            <Box textAlign='center'>
              <QRCodeCanvas
                value='0002010102113932737c632348c2548381fc15352af1e6255204561153036045802PE5906YAPERO6004Lima6304CF93'
                size={180}
                style={{ marginBottom: 16 }}
              />
              <Typography variant='body2' color='text.secondary'>
                Escanea el código QR con Yape para pagar el total de tu compra.
              </Typography>
              <Typography
                variant='h6'
                fontWeight={700}
                color='primary.main'
                mt={2}
              >
                Total: S/ {total.toFixed(2)}
              </Typography>
              <Button
                variant='contained'
                color='primary'
                size='large'
                startIcon={<ShoppingCartCheckout />}
                sx={{ fontWeight: 700, borderRadius: 2, mt: 2 }}
                disabled={carrito.length === 0}
                onClick={handleConfirmarCompra}
              >
                Confirmar compra
              </Button>
            </Box>
          )}
          {tab === 1 && (
            <Box>
              <Cards
                cvc={card.cvc}
                expiry={card.expiry}
                name={card.name}
                number={card.number}
                focused={card.focus as any}
              />
              <TextField
                label='Número de tarjeta'
                fullWidth
                sx={{ mt: 2 }}
                name='number'
                value={card.number}
                onChange={_e => setCard({ ...card, number: _e.target.value })}
                onFocus={_e => setCard({ ...card, focus: 'number' })}
                inputProps={{ maxLength: 19 }}
              />
              <TextField
                label='Nombre en la tarjeta'
                fullWidth
                sx={{ mt: 2 }}
                name='name'
                value={card.name}
                onChange={_e => setCard({ ...card, name: _e.target.value })}
                onFocus={_e => setCard({ ...card, focus: 'name' })}
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  label='Expiración'
                  name='expiry'
                  value={card.expiry}
                  onChange={_e => setCard({ ...card, expiry: _e.target.value })}
                  onFocus={_e => setCard({ ...card, focus: 'expiry' })}
                  placeholder='MM/AA'
                  inputProps={{ maxLength: 5 }}
                />
                <TextField
                  label='CVC'
                  name='cvc'
                  value={card.cvc}
                  onChange={_e => setCard({ ...card, cvc: _e.target.value })}
                  onFocus={_e => setCard({ ...card, focus: 'cvc' })}
                  inputProps={{ maxLength: 4 }}
                />
              </Box>
              <Button
                variant='contained'
                color='primary'
                size='large'
                startIcon={<ShoppingCartCheckout />}
                sx={{ fontWeight: 700, borderRadius: 2, mt: 3 }}
                disabled={carrito.length === 0}
                onClick={handleConfirmarCompra}
              >
                Confirmar compra
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
      <Footer />
    </>
  );
};

export default Checkout;
