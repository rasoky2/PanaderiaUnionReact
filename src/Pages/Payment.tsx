import { Box, Button, Paper, Typography } from '@mui/material';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useCarrito } from '../hooks/useCarrito';

const Payment = () => {
  const navigate = useNavigate();
  const { carrito, cliente, metodoPago } = useCarrito();
  const total = carrito.reduce(
    (acc, item) => acc + item.producto.precio * item.cantidad,
    0
  );
  const fecha = new Date().toLocaleString('es-PE');

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
    doc.text('------------------------------------------', 20, 62);
    let y = 68;
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
            Gracias por tu compra. Puedes descargar tu comprobante en PDF o
            regresar al inicio.
          </Typography>
          <Button
            variant='contained'
            color='primary'
            sx={{ mb: 2, fontWeight: 700, borderRadius: 2 }}
            onClick={handleDownloadPDF}
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
