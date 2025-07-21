import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  Divider,
  Paper,
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  AccessTime,
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box 
      sx={{ 
        backgroundColor: 'grey.900',
        color: 'white', 
        py: 6 
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'white' }}>
              Unión
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6, color: 'grey.300' }}>
              Centro Universitario de Producción de Bienes Unión de la UPeU.
              "CADA DÍA ELIJO SER SALUDABLE" - Más de 75 años de tradición.
            </Typography>
            <Paper
              elevation={0}
              sx={{ 
                backgroundColor: 'primary.main',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 2,
                display: 'inline-block'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                75+ Años de Experiencia
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
              Contacto
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 'small', color: 'grey.400' }} />
                <Typography variant="body2" color="grey.300">(01) 619-9288</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 'small', color: 'grey.400' }} />
                <Typography variant="body2" color="grey.300">atencionalcliente@union.pe</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 'small', color: 'grey.400' }} />
                <Typography variant="body2" color="grey.300">Lima, Perú</Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
              Horarios
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AccessTime sx={{ fontSize: 'small', color: 'grey.400' }} />
              <Typography variant="body2" color="grey.300">Lun - Dom: 6:00 AM - 10:00 PM</Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 500, color: 'white' }}>
              ¡Siempre frescos, siempre saludables!
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4, borderColor: 'grey.700' }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            © 2024 Unión - Centro Universitario de Producción de Bienes UPeU. Todos los derechos reservados. | CADA DÍA ELIJO SER SALUDABLE
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 