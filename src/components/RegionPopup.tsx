import {
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
  Divider,
  Button,
} from '@mui/material';
import {
  Close,
  Store,
  Assignment,
  TrendingUp,
  LocationOn,
} from '@mui/icons-material';
import { getStockStatusText, RegionData } from '../config/mapbox.config';

interface RegionPopupProps {
  region: RegionData;
  onClose: () => void;
}

const RegionPopup = ({ region, onClose }: RegionPopupProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'success';
      case 'bajo': return 'warning';
      case 'critico': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: '1px solid',
        borderColor: 'grey.200',
        minWidth: 300,
        maxWidth: 350,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${region.color}dd, ${region.color})`,
          color: 'white',
          p: 2,
          position: 'relative'
        }}
      >
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.3)'
            }
          }}
        >
          <Close fontSize="small" />
        </IconButton>

        <Stack direction="row" alignItems="center" spacing={2}>
          <LocationOn fontSize="large" />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {region.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Región {region.name}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        {/* Estado del Stock */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Estado del Stock
          </Typography>
          <Chip
            label={getStockStatusText(region.stockStatus)}
            color={getStatusColor(region.stockStatus)}
            size="small"
            variant="filled"
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Métricas */}
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Store color="primary" fontSize="small" />
              <Typography variant="body2">
                Sucursales Activas
              </Typography>
            </Stack>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {region.sucursales}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Assignment color="warning" fontSize="small" />
              <Typography variant="body2">
                Solicitudes Pendientes
              </Typography>
            </Stack>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" fontWeight="bold" color="warning.main">
                {region.solicitudesPendientes}
              </Typography>
              {region.solicitudesPendientes > 10 && (
                <Typography variant="caption" color="error">
                  ¡Atención requerida!
                </Typography>
              )}
            </Box>
          </Stack>

          {/* Indicador de Prioridad */}
          {region.stockStatus === 'critico' && (
            <Box
              sx={{
                backgroundColor: 'error.50',
                border: '1px solid',
                borderColor: 'error.200',
                borderRadius: 1,
                p: 2,
                mt: 2
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <TrendingUp color="error" />
                <Box>
                  <Typography variant="subtitle2" color="error.main" fontWeight="bold">
                    Región Prioritaria
                  </Typography>
                  <Typography variant="body2" color="error.dark">
                    Requiere atención inmediata para reposición de stock
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </Stack>

        {/* Acciones */}
        <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            startIcon={<Assignment />}
          >
            Ver Solicitudes
          </Button>
          <Button
            variant="contained"
            size="small"
            fullWidth
            startIcon={<Store />}
          >
            Gestionar Stock
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default RegionPopup; 