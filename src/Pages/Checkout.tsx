import { ShoppingCartCheckout } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useState } from 'react';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { useNavigate } from 'react-router-dom';
import Carrito from '../components/Carrito';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { supabase } from '../config/supabase.config';
import { useCarrito } from '../hooks/useCarrito';
import { useClienteAuth } from '../hooks/useClienteAuth';
import { pedidoService } from '../services/pedido.service';
import { AgenciaEnvio } from '../types';

const categoriasDemo = [
  { id: 1, nombre: 'Panes' },
  { id: 2, nombre: 'Postres' },
  { id: 3, nombre: 'Bebidas' },
  { id: 4, nombre: 'Galletas y Cookies' },
  { id: 5, nombre: 'Productos Especiales' },
  { id: 6, nombre: 'Pasteles y Tortas' },
];

interface Departamento {
  id: number;
  nombre: string;
}

interface Provincia {
  id: number;
  nombre: string;
  departamento_id: number;
}

const Checkout = () => {
  const { carrito, setCliente, setMetodoPago, sucursalSeleccionada } =
    useCarrito();
  const { cliente, isAuthenticated } = useClienteAuth();
  const [agenciasEnvio, setAgenciasEnvio] = useState<AgenciaEnvio[]>([]);
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] =
    useState<string>('');
  const [provinciaSeleccionada, setProvinciaSeleccionada] =
    useState<string>('');
  const [mostrarFormularioDireccion, setMostrarFormularioDireccion] =
    useState(false);

  const subtotal = carrito.reduce(
    (acc, item) => acc + item.producto.precio * item.cantidad,
    0
  );

  const agenciaEnvio = agenciasEnvio.find(a => a.id === agenciaSeleccionada);
  const costoEnvio = agenciaEnvio?.costo_base || 0;
  const total = subtotal + costoEnvio;

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
    ruc: '',
  });
  const navigate = useNavigate();

  // Cargar agencias de envío
  useEffect(() => {
    const cargarAgencias = async () => {
      try {
        const agencias = await pedidoService.getAgenciasEnvio();
        setAgenciasEnvio(agencias);
        if (agencias.length > 0 && agencias[0]) {
          setAgenciaSeleccionada(agencias[0].id);
        }
      } catch (error) {
        console.error('Error al cargar agencias de envío:', error);
      }
    };
    cargarAgencias();
  }, []);

  // Cargar departamentos
  useEffect(() => {
    const cargarDepartamentos = async () => {
      const { data, error } = await supabase
        .from('departamentos')
        .select('*')
        .order('nombre');
      if (!error && data) {
        setDepartamentos(data);
      }
    };
    cargarDepartamentos();
  }, []);

  // Cargar provincias cuando se selecciona un departamento
  useEffect(() => {
    if (!departamentoSeleccionado) {
      setProvincias([]);
      setProvinciaSeleccionada('');
      return;
    }

    const cargarProvincias = async () => {
      const { data, error } = await supabase
        .from('provincias')
        .select('*')
        .eq('departamento_id', departamentoSeleccionado)
        .order('nombre');
      if (!error && data) {
        setProvincias(data);
      }
    };
    cargarProvincias();
  }, [departamentoSeleccionado]);

  // Verificar si necesitamos mostrar el formulario de dirección
  useEffect(() => {
    if (!isAuthenticated || !cliente || !sucursalSeleccionada) {
      setMostrarFormularioDireccion(false);
      return;
    }

    // Obtener información de la sucursal seleccionada
    const verificarSucursal = async () => {
      const { data: sucursal, error } = await supabase
        .from('sucursales')
        .select('provincia_id')
        .eq('id', sucursalSeleccionada)
        .single();

      if (!error && sucursal) {
        // Mostrar formulario si la sucursal no coincide con la ubicación del cliente
        const necesitaDireccionEspecial =
          !cliente.provincia_id ||
          sucursal.provincia_id !== cliente.provincia_id;

        setMostrarFormularioDireccion(necesitaDireccionEspecial);
      }
    };

    verificarSucursal();
  }, [isAuthenticated, cliente, sucursalSeleccionada]);

  // Rellenar datos del cliente automáticamente
  useEffect(() => {
    if (cliente) {
      setClienteForm({
        nombre: cliente.nombre || '',
        correo: cliente.email || '',
        direccion: cliente.direccion || '',
        ruc: cliente.ruc || '',
      });
    }
  }, [cliente]);

  const handleConfirmarCompra = async () => {
    if (!isAuthenticated || !cliente) {
      alert('Debes iniciar sesión para realizar un pedido');
      return;
    }

    if (!sucursalSeleccionada) {
      alert('Debes seleccionar una sucursal');
      return;
    }

    if (!agenciaSeleccionada) {
      alert('Debes seleccionar una agencia de envío');
      return;
    }

    // Validar que se complete la dirección si es necesaria
    if (
      mostrarFormularioDireccion &&
      (!departamentoSeleccionado ||
        !provinciaSeleccionada ||
        !clienteForm.direccion)
    ) {
      alert('Debes completar la información de dirección de envío');
      return;
    }

    setLoading(true);
    try {
      // Preparar datos del pedido
      const pedidoData = {
        cliente_id: cliente.id,
        sucursal_id: sucursalSeleccionada,
        agencia_envio_id: agenciaSeleccionada,
        metodo_pago: tab === 0 ? 'QR Yape' : 'Tarjeta de crédito',
        direccion_entrega: clienteForm.direccion || cliente.direccion || '',
        notas: '',
        items: carrito.map(item => ({
          producto_id: Number(item.producto.id),
          cantidad: item.cantidad,
          precio_unitario: Number(item.producto.precio),
        })),
      };

      // Crear el pedido
      const pedidoCreado = await pedidoService.crearPedido(pedidoData);

      // Guardar datos del cliente y método de pago para el PDF
      setCliente({
        nombre: clienteForm.nombre || cliente.nombre,
        correo: clienteForm.correo || cliente.email,
        direccion: clienteForm.direccion || cliente.direccion || '',
      });
      setMetodoPago(tab === 0 ? 'QR Yape' : 'Tarjeta de crédito');

      // Navegar a la página de pago con el número de tracking
      navigate('/payment', {
        state: {
          numeroTracking: pedidoCreado.numero_tracking,
          pedidoId: pedidoCreado.id,
        },
      });
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      alert('Error al procesar el pedido. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_e: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleAgenciaChange = (event: SelectChangeEvent<string>) => {
    setAgenciaSeleccionada(event.target.value);
  };

  const handleNombreChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClienteForm({ ...clienteForm, nombre: event.target.value });
  };

  const handleCorreoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClienteForm({ ...clienteForm, correo: event.target.value });
  };

  const handleDireccionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setClienteForm({ ...clienteForm, direccion: event.target.value });
  };

  const handleRucChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClienteForm({ ...clienteForm, ruc: event.target.value });
  };

  const handleDepartamentoChange = (event: SelectChangeEvent<string>) => {
    setDepartamentoSeleccionado(event.target.value);
    setProvinciaSeleccionada('');
  };

  const handleProvinciaChange = (event: SelectChangeEvent<string>) => {
    setProvinciaSeleccionada(event.target.value);
  };

  const handleCardNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCard({ ...card, number: event.target.value });
  };

  const handleCardNumberFocus = () => {
    setCard({ ...card, focus: 'number' });
  };

  const handleCardNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCard({ ...card, name: event.target.value });
  };

  const handleCardNameFocus = () => {
    setCard({ ...card, focus: 'name' });
  };

  const handleCardExpiryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCard({ ...card, expiry: event.target.value });
  };

  const handleCardExpiryFocus = () => {
    setCard({ ...card, focus: 'expiry' });
  };

  const handleCardCvcChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCard({ ...card, cvc: event.target.value });
  };

  const handleCardCvcFocus = () => {
    setCard({ ...card, focus: 'cvc' });
  };

  const getButtonText = () => {
    if (loading) {
      return 'Procesando...';
    }
    return 'Confirmar compra';
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
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              Subtotal: S/ {subtotal.toFixed(2)}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Envío: S/ {costoEnvio.toFixed(2)}
            </Typography>
            <Typography variant='h6' fontWeight={700} color='primary.main'>
              Total: S/ {total.toFixed(2)}
            </Typography>
          </Box>
        </Paper>

        {/* Selección de agencia de envío */}
        <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
          <Typography variant='h6' fontWeight={600} mb={2}>
            Agencia de envío
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Agencia de envío</InputLabel>
            <Select
              value={agenciaSeleccionada}
              label='Agencia de envío'
              onChange={handleAgenciaChange}
            >
              {agenciasEnvio.map(agencia => (
                <MenuItem key={agencia.id} value={agencia.id}>
                  <Box>
                    <Typography variant='body1' fontWeight={600}>
                      {agencia.nombre}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {agencia.descripcion} - {agencia.tiempo_entrega_dias} días
                      - S/ {agencia.costo_base}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            onChange={handleNombreChange}
          />
          <TextField
            label='Correo electrónico'
            fullWidth
            sx={{ mb: 2 }}
            value={clienteForm.correo}
            onChange={handleCorreoChange}
          />
          <TextField
            label='RUC (opcional)'
            fullWidth
            sx={{ mb: 2 }}
            value={clienteForm.ruc}
            onChange={handleRucChange}
            inputProps={{ maxLength: 11 }}
            helperText='Ingresa tu RUC si es para facturación empresarial'
          />
        </Paper>

        {/* Formulario de dirección de envío - solo se muestra cuando es necesario */}
        {mostrarFormularioDireccion && (
          <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
            <Typography variant='h6' fontWeight={600} mb={2}>
              Dirección de envío
            </Typography>
            <Typography variant='body2' color='text.secondary' mb={2}>
              La sucursal seleccionada no coincide con tu ubicación registrada.
              Por favor, especifica la dirección de envío.
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Departamento</InputLabel>
              <Select
                value={departamentoSeleccionado}
                label='Departamento'
                onChange={handleDepartamentoChange}
              >
                {departamentos.map(depto => (
                  <MenuItem key={depto.id} value={depto.id}>
                    {depto.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Provincia</InputLabel>
              <Select
                value={provinciaSeleccionada}
                label='Provincia'
                onChange={handleProvinciaChange}
                disabled={!departamentoSeleccionado}
              >
                {provincias.map(prov => (
                  <MenuItem key={prov.id} value={prov.id}>
                    {prov.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label='Dirección de entrega'
              fullWidth
              sx={{ mb: 2 }}
              value={clienteForm.direccion}
              onChange={handleDireccionChange}
              placeholder='Calle, número, distrito, referencia'
              multiline
              rows={3}
            />
          </Paper>
        )}

        <Paper sx={{ p: 3 }} elevation={2}>
          <Typography variant='h6' fontWeight={600} mb={2}>
            Método de pago
          </Typography>
          <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
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
                disabled={carrito.length === 0 || loading}
                onClick={handleConfirmarCompra}
              >
                {getButtonText()}
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
                focused={card.focus as 'number' | 'name' | 'expiry' | 'cvc'}
              />
              <TextField
                label='Número de tarjeta'
                fullWidth
                sx={{ mt: 2 }}
                name='number'
                value={card.number}
                onChange={handleCardNumberChange}
                onFocus={handleCardNumberFocus}
                inputProps={{ maxLength: 19 }}
              />
              <TextField
                label='Nombre en la tarjeta'
                fullWidth
                sx={{ mt: 2 }}
                name='name'
                value={card.name}
                onChange={handleCardNameChange}
                onFocus={handleCardNameFocus}
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  label='Expiración'
                  name='expiry'
                  value={card.expiry}
                  onChange={handleCardExpiryChange}
                  onFocus={handleCardExpiryFocus}
                  placeholder='MM/AA'
                  inputProps={{ maxLength: 5 }}
                />
                <TextField
                  label='CVC'
                  name='cvc'
                  value={card.cvc}
                  onChange={handleCardCvcChange}
                  onFocus={handleCardCvcFocus}
                  inputProps={{ maxLength: 4 }}
                />
              </Box>
              <Button
                variant='contained'
                color='primary'
                size='large'
                startIcon={<ShoppingCartCheckout />}
                sx={{ fontWeight: 700, borderRadius: 2, mt: 3 }}
                disabled={carrito.length === 0 || loading}
                onClick={handleConfirmarCompra}
              >
                {getButtonText()}
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
