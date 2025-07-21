import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Chip,
  IconButton
} from '@mui/material';
import {
  TrendingDown,
  Warning,
  CheckCircle,
  Info,
  Refresh
} from '@mui/icons-material';

interface RegionStats {
  total: number;
  normal: number;
  bajo: number;
  critico: number;
  totalSolicitudes: number;
}

interface MapStatsProps {
  stats: RegionStats;
  onRefresh?: () => void;
  showDetails?: boolean;
}

const MapStats = ({ stats, onRefresh, showDetails = true }: MapStatsProps) => {
  const percentages = {
    normal: (stats.normal / stats.total) * 100,
    bajo: (stats.bajo / stats.total) * 100,
    critico: (stats.critico / stats.total) * 100
  };

  const getHealthScore = () => {
    return Math.round((percentages.normal * 1 + percentages.bajo * 0.5 + percentages.critico * 0) / 1);
  };

  return (
    <Box>
      {/* Indicadores principales */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                <CheckCircle color="success" />
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {stats.normal}
                </Typography>
              </Stack>
              <Typography variant="body2" color="success.dark">
                Regiones Normales
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {percentages.normal.toFixed(1)}% del total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                <Warning color="warning" />
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  {stats.bajo}
                </Typography>
              </Stack>
              <Typography variant="body2" color="warning.dark">
                Stock Bajo
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {percentages.bajo.toFixed(1)}% del total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                <TrendingDown color="error" />
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {stats.critico}
                </Typography>
              </Stack>
              <Typography variant="body2" color="error.dark">
                Stock Crítico
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {percentages.critico.toFixed(1)}% del total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                <Info color="info" />
                <Typography variant="h5" fontWeight="bold" color="info.main">
                  {stats.totalSolicitudes}
                </Typography>
              </Stack>
              <Typography variant="body2" color="info.dark">
                Solicitudes Totales
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pendientes de atender
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detalles adicionales */}
      {showDetails && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Distribución por Estado
                  </Typography>
                  {onRefresh && (
                    <IconButton size="small" onClick={onRefresh}>
                      <Refresh />
                    </IconButton>
                  )}
                </Stack>

                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2">Stock Normal</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {percentages.normal.toFixed(1)}%
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={percentages.normal} 
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2">Stock Bajo</Typography>
                      <Typography variant="body2" fontWeight="bold" color="warning.main">
                        {percentages.bajo.toFixed(1)}%
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={percentages.bajo} 
                      color="warning"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2">Stock Crítico</Typography>
                      <Typography variant="body2" fontWeight="bold" color="error.main">
                        {percentages.critico.toFixed(1)}%
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={percentages.critico} 
                      color="error"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Salud del Sistema
                </Typography>

                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h2" fontWeight="bold" color="primary">
                    {getHealthScore()}%
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Puntuación de Salud
                  </Typography>
                  
                  <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 2 }}>
                    {getHealthScore() >= 80 && (
                      <Chip label="Excelente" color="success" size="small" />
                    )}
                    {getHealthScore() >= 60 && getHealthScore() < 80 && (
                      <Chip label="Bueno" color="warning" size="small" />
                    )}
                    {getHealthScore() < 60 && (
                      <Chip label="Necesita Atención" color="error" size="small" />
                    )}
                  </Stack>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Basado en la distribución de stock por regiones y el número de solicitudes pendientes.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default MapStats; 