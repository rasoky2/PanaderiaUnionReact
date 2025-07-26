import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import { jsPDF } from 'jspdf';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useCarrito } from '../hooks/useCarrito';
import { useClienteAuth } from '../hooks/useClienteAuth';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { carrito, cliente, metodoPago, setCliente } = useCarrito();
  const { cliente: clienteAuth } = useClienteAuth();
  const [countdown, setCountdown] = useState(10);
  const [showTracking, setShowTracking] = useState(false);
  const [numeroTracking, setNumeroTracking] = useState<string>('');

  const total = carrito.reduce(
    (acc, item) => acc + item.producto.precio * item.cantidad,
    0
  );
  const fecha = new Date().toLocaleString('es-PE');

  // Obtener número de tracking del estado de navegación
  useEffect(() => {
    if (location.state?.numeroTracking) {
      setNumeroTracking(location.state.numeroTracking);
    }
  }, [location.state]);

  // Rellenar datos del cliente automáticamente si no están completos
  useEffect(() => {
    if (
      clienteAuth &&
      (!cliente.nombre || !cliente.correo || !cliente.direccion)
    ) {
      setCliente({
        nombre: clienteAuth.nombre,
        correo: clienteAuth.email,
        direccion: clienteAuth.direccion || '',
      });
    }
  }, [clienteAuth, cliente, setCliente]);

  // Contador de 10 segundos
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowTracking(true);
      return () => {}; // Función de limpieza vacía cuando countdown es 0
    }
  }, [countdown]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Comprobante de Pago - Panadería Unión', 20, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${fecha}`, 20, 30);
    doc.text(`Cliente: ${cliente.nombre}`, 20, 38);
    doc.text(`Correo: ${cliente.correo}`, 20, 44);
    doc.text(`Dirección: ${cliente.direccion}`, 20, 50);
    doc.text(`Método de pago: ${metodoPago}`, 20, 56);
    doc.text(`Número de tracking: ${numeroTracking}`, 20, 62);
    doc.text('------------------------------------------', 20, 68);
    let y = 74;
    doc.text('Producto', 20, y);
    doc.text('Cant.', 90, y);
    doc.text('P. Unit.', 110, y);
    doc.text('Subtotal', 150, y);
    y += 6;
    carrito.forEach(item => {
      doc.text(String(item.producto.nombre), 20, y);
      doc.text(String(item.cantidad), 90, y);
      doc.text(`S/ ${Number(item.producto.precio).toFixed(2)}`, 110, y);
      doc.text(
        `S/ ${(item.producto.precio * item.cantidad).toFixed(2)}`,
        150,
        y
      );
      y += 6;
    });
    doc.text('------------------------------------------', 20, y);
    y += 8;
    doc.setFontSize(14);
    doc.text(`Total: S/ ${total.toFixed(2)}`, 20, y);
    y += 10;
    doc.setFontSize(12);
    doc.text('¡Gracias por tu compra!', 20, y);
    doc.save('comprobante_pago.pdf');
  };

  return (
    <>
      <Navbar />
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 500, mx: 'auto' }}>
        <Paper sx={{ p: 4, textAlign: 'center' }} elevation={3}>
          <Typography variant='h4' fontWeight={700} color='primary.main' mb={2}>
            ¡Pago completado!
          </Typography>
          <Typography variant='body1' mb={3}>
            Gracias por tu compra. Tu pedido ha sido procesado exitosamente.
          </Typography>

          {!showTracking ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant='h6' color='text.secondary' mb={2}>
                Generando número de tracking...
              </Typography>
              <CircularProgress size={60} sx={{ mb: 2 }} />
            </Box>
          ) : (
            <Box
              sx={{ mb: 3, p: 3, bgcolor: 'success.light', borderRadius: 2 }}
            >
              <Typography
                variant='h6'
                fontWeight={600}
                color='success.dark'
                mb={1}
              >
                ¡Número de tracking generado!
              </Typography>
              <Typography
                variant='h5'
                fontWeight={700}
                color='success.dark'
                sx={{ fontFamily: 'monospace' }}
              >
                {numeroTracking}
              </Typography>
              <Typography variant='body2' color='success.dark' mt={1}>
                Usa este número para rastrear tu pedido
              </Typography>
            </Box>
          )}

          <Button
            variant='contained'
            color='primary'
            sx={{ mb: 2, fontWeight: 700, borderRadius: 2 }}
            onClick={handleDownloadPDF}
            disabled={!showTracking}
          >
            Descargar comprobante PDF
          </Button>
          <Button
            variant='outlined'
            color='secondary'
            sx={{ fontWeight: 700, borderRadius: 2, ml: 2 }}
            onClick={() => navigate('/')}
          >
            Regresar al inicio
          </Button>
        </Paper>
      </Box>
      <Footer />
    </>
  );
};

export default Payment;
