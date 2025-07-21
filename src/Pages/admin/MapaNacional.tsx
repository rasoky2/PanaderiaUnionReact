import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Map as MapIcon,
  ExpandMore,
  Warning,
  Store,
  Analytics,
  Refresh,
  TrendingUp,
  LocationOn,
} from '@mui/icons-material';
import PeruMap from '../../components/PeruMap';
import { getStockStatusColor } from '../../config/mapbox.config';
import { supabase } from '../../config/supabase.config';

// Interfaces para tipado
interface DepartmentStatus {
  departamento_nombre: string;
  estado_stock_general: string;
  total_sucursales: number;
  sucursales_activas: number;
  sucursales_inactivas: number;
  sucursales_necesitan_pedido: number;
  total_provincias: number;
}

interface SucursalDetalle {
  nombre: string;
  provincia: string;
  activo: boolean;
  departamento: string;
}

interface SelectedRegion {
  id: string;
  name: string;
  sucursales: number;
  sucursalesActivas: number;
  sucursalesInactivas: number;
  totalProvincias: number;
  stockStatus: string;
  color: string;
  sucursalesDetalle: SucursalDetalle[];
}

const MapaNacional = () => {
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion | null>(null);
  const [alertasExpanded, setAlertasExpanded] = useState(true);
  const [stockExpanded, setStockExpanded] = useState(true);
  const [mapData, setMapData] = useState<any>(null);
  const [departmentStatus, setDepartmentStatus] = useState<DepartmentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // 1. Obtener estadísticas de stock por departamentos
      const { data: statusData, error: statusError } = await supabase
        .rpc('obtener_estadisticas_stock_departamentos');

      if (statusError) {
        console.error('Error fetching department status:', statusError);
        setLoading(false);
        return;
      }

      setDepartmentStatus(statusData || []);

      // 2. Obtener detalles completos de sucursales
      const { data: sucursalesData, error: sucursalesError } = await supabase
        .rpc('obtener_sucursales_completas');

      if (sucursalesError) {
        console.error('Error fetching sucursales:', sucursalesError);
      }

      // 3. Cargar el archivo GeoJSON
      const geoJsonResponse = await fetch('/data/peru_departamentos.geojson');
      const geojsonData = await geoJsonResponse.json();

      // 4. Fusionar los datos de estado con el GeoJSON
      const enrichedFeatures = geojsonData.features.map((feature: any) => {
        const departmentName = feature.properties?.NOMBDEP;
        if (!departmentName) return feature;
        
        const statusInfo = (statusData || []).find(
          (d: DepartmentStatus) => d.departamento_nombre?.toLowerCase() === departmentName.toLowerCase()
        );

        const sucursalesInfo = (sucursalesData || []).filter(
          (s: SucursalDetalle) => s.departamento?.toLowerCase() === departmentName.toLowerCase()
        );

        // Usar el estado calculado por la función RPC
        const estadoGeneral = statusInfo?.estado_stock_general || 'sin_datos';
        const totalSucursales = statusInfo?.total_sucursales || 0;
        const sucursalesActivas = statusInfo?.sucursales_activas || 0;
        const sucursalesInactivas = statusInfo?.sucursales_inactivas || 0;
        const sucursalesNecesitanPedido = statusInfo?.sucursales_necesitan_pedido || 0;

        // Aplicar opacidad del 50% si hay sucursales inactivas
        let colorFinal = getStockStatusColor(estadoGeneral);
        if (sucursalesInactivas > 0 && sucursalesActivas === 0) {
          // Si todas las sucursales están inactivas, usar color morado con opacidad
          colorFinal = getStockStatusColor('inactiva');
        }

        feature.properties = {
          ...feature.properties,
          estado_general: estadoGeneral,
          total_sucursales: totalSucursales,
          sucursales_activas: sucursalesActivas,
          sucursales_inactivas: sucursalesInactivas,
          sucursales_necesitan_pedido: sucursalesNecesitanPedido,
          total_provincias: statusInfo?.total_provincias || 0,
          sucursales_detalle: sucursalesInfo,
          color_calculado: colorFinal,
        };
        return feature;
      });

      geojsonData.features = enrichedFeatures;
      setMapData(geojsonData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const handleRegionClick = (department: any) => {
    if (department?.NOMBDEP) {
      const sucursalesDetalle = department.sucursales_detalle || [];
      setSelectedRegion({
        id: department.CCDD,
        name: department.NOMBDEP,
        sucursales: department.total_sucursales,
        sucursalesActivas: department.sucursales_activas,
        sucursalesInactivas: department.sucursales_inactivas,
        totalProvincias: department.total_provincias,
        stockStatus: department.estado_general,
        color: getStockStatusColor(department.estado_general),
        sucursalesDetalle: sucursalesDetalle,
      });
    } else {
      setSelectedRegion(null);
    }
  };
  
  // Calcular estadísticas nacionales
  const nationalStats = useMemo(() => {
    if (!departmentStatus.length) {
      return { 
        normal: 0, 
        bajo: 0, 
        critico: 0,
        necesitaPedido: 0,
        totalSucursales: 0,
        sucursalesActivas: 0,
        sucursalesInactivas: 0,
        totalDepartamentos: 0,
      };
    }
    
    const stats = {
      normal: departmentStatus.filter(d => d.estado_stock_general === 'normal').length,
      bajo: departmentStatus.filter(d => d.estado_stock_general === 'bajo').length,
      critico: departmentStatus.filter(d => d.estado_stock_general === 'critico').length,
      necesitaPedido: departmentStatus.filter(d => d.estado_stock_general === 'necesita_pedido').length,
      totalSucursales: departmentStatus.reduce((sum, d) => sum + d.total_sucursales, 0),
      sucursalesActivas: departmentStatus.reduce((sum, d) => sum + d.sucursales_activas, 0),
      sucursalesInactivas: departmentStatus.reduce((sum, d) => sum + d.sucursales_inactivas, 0),
      totalDepartamentos: departmentStatus.length,
    };
    return stats;
  }, [departmentStatus]);

  const departamentosCriticos = useMemo(() => {
    return departmentStatus.filter(d => d.estado_stock_general === 'critico');
  }, [departmentStatus]);

  const departamentosNecesitanPedido = useMemo(() => {
    return departmentStatus.filter(d => d.estado_stock_general === 'necesita_pedido');
  }, [departmentStatus]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <MapIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Mapa Nacional de Stock
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Monitoreo geográfico en tiempo real del inventario nacional
              </Typography>
            </Box>
          </Stack>
          
          <Tooltip title="Actualizar datos">
            <IconButton 
              onClick={handleRefresh} 
              disabled={refreshing}
              color="primary"
              size="large"
            >
              {refreshing ? <CircularProgress size={24} /> : <Refresh />}
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Resumen Nacional */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {loading ? <CircularProgress size={24} color="inherit" /> : nationalStats.totalDepartamentos}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Departamentos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {loading ? <CircularProgress size={24} color="inherit" /> : nationalStats.totalSucursales}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Sucursales Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {loading ? <CircularProgress size={24} color="inherit" /> : nationalStats.normal}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Stock Normal
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {loading ? <CircularProgress size={24} color="inherit" /> : nationalStats.necesitaPedido}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Necesitan Pedido
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {loading ? <CircularProgress size={24} color="inherit" /> : nationalStats.critico}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Stock Crítico
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {loading ? <CircularProgress size={24} color="inherit" /> : nationalStats.sucursalesActivas}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Activas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {loading ? <CircularProgress size={24} color="inherit" /> : nationalStats.sucursalesInactivas}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Inactivas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alertas de Estado */}
        {(departamentosCriticos.length > 0 || departamentosNecesitanPedido.length > 0) && (
          <Alert 
            severity={departamentosCriticos.length > 0 ? "error" : "warning"} 
            sx={{ mb: 3 }}
            icon={<Warning />}
          >
            <Typography variant="body1" fontWeight="500">
              {departamentosCriticos.length > 0 
                ? `⚠️ ${departamentosCriticos.length} departamento(s) en estado crítico requieren atención inmediata`
                : `⚠️ ${departamentosNecesitanPedido.length} departamento(s) que necesitan pedido`
              }
            </Typography>
          </Alert>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Mapa Principal */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              
                                <Box sx={{ 
                    height: { xs: 500, sm: 600, md: 700 }, 
                    position: 'relative', 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    width: '100%'
                  }}>
                    {loading && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          zIndex: 10,
                        }}
                      >
                        <Stack alignItems="center" spacing={2}>
                          <CircularProgress size={40} />
                          <Typography variant="body1" color="text.secondary">
                            Cargando datos del mapa...
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                    {mapData && (
                      <PeruMap 
                        data={mapData} 
                        onDepartmentClick={handleRegionClick}
                        height="100%"
                      />
                    )}
                  </Box>
              
              {/* Leyenda del Mapa */}
              <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: '50%' }} />
                    <Typography variant="caption" fontSize="0.7rem">Normal</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ width: 12, height: 12, bgcolor: 'info.main', borderRadius: '50%' }} />
                    <Typography variant="caption" fontSize="0.7rem">Pedido</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ width: 12, height: 12, bgcolor: 'error.main', borderRadius: '50%' }} />
                    <Typography variant="caption" fontSize="0.7rem">Crítico</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#9c27b0', borderRadius: '50%', opacity: 0.7 }} />
                    <Typography variant="caption" fontSize="0.7rem">Inactivas</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ width: 12, height: 12, bgcolor: 'grey.400', borderRadius: '50%' }} />
                    <Typography variant="caption" fontSize="0.7rem">Sin Datos</Typography>
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de Información */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Detalles de la Región Seleccionada */}
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Analytics color="info" />
                  <Typography variant="h6" fontWeight="bold">
                    Detalles de la Región
                  </Typography>
                </Stack>

                {selectedRegion ? (
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: `${selectedRegion.color}20`,
                        borderLeft: `4px solid ${selectedRegion.color}`,
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" sx={{ color: selectedRegion.color }}>
                        {selectedRegion.name.toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Código: {selectedRegion.id}
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              {selectedRegion.sucursales}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total Sucursales
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                              {selectedRegion.sucursalesActivas}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Activas
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                            <Typography variant="h6" fontWeight="bold" color="warning.main">
                              {selectedRegion.sucursalesInactivas}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Inactivas
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                            <Typography variant="h6" fontWeight="bold" color="info.main">
                              {selectedRegion.totalProvincias}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Provincias
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Estado del Stock:</Typography>
                      <Chip
                        label={selectedRegion.stockStatus.charAt(0).toUpperCase() + selectedRegion.stockStatus.slice(1)}
                        sx={{
                          backgroundColor: selectedRegion.color,
                          color: '#fff',
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>

                    {selectedRegion.sucursalesDetalle && selectedRegion.sucursalesDetalle.length > 0 && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="subtitle2">
                            Ver Sucursales ({selectedRegion.sucursalesDetalle.length})
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List dense>
                            {selectedRegion.sucursalesDetalle.map((sucursal: SucursalDetalle, index: number) => (
                              <ListItem key={`sucursal-${sucursal.nombre}-${index}`}>
                                <ListItemText 
                                  primary={sucursal.nombre}
                                  secondary={`${sucursal.provincia} - ${sucursal.activo ? 'Activa' : 'Inactiva'}`}
                                />
                                <Chip 
                                  size="small" 
                                  label={sucursal.activo ? 'Activa' : 'Inactiva'}
                                  color={sucursal.activo ? 'success' : 'default'}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    )}
                    
                    <Button variant="contained" startIcon={<Store />} fullWidth>
                      Gestionar Sucursales
                    </Button>
                  </Stack>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '200px',
                      backgroundColor: 'grey.50',
                      borderRadius: 2,
                      textAlign: 'center',
                      border: '2px dashed',
                      borderColor: 'grey.300',
                    }}
                  >
                    <Stack alignItems="center" spacing={1}>
                      <LocationOn color="disabled" sx={{ fontSize: 40 }} />
                      <Typography variant="body1" color="text.secondary">
                        Haga clic en un departamento del mapa para ver sus detalles
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Alertas Críticas */}
            {departamentosCriticos.length > 0 && (
              <Card>
                <Accordion 
                  expanded={alertasExpanded} 
                  onChange={() => setAlertasExpanded(!alertasExpanded)}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Badge badgeContent={departamentosCriticos.length} color="error">
                        <Warning color="error" />
                      </Badge>
                      <Typography variant="h6" fontWeight="bold">
                        Stock Crítico
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {departamentosCriticos.map((d: DepartmentStatus) => (
                        <ListItem key={`critico-${d.departamento_nombre}`}>
                          <ListItemText 
                            primary={d.departamento_nombre}
                            secondary={`${d.sucursales_activas}/${d.total_sucursales} sucursales activas`}
                          />
                          <Chip label="Crítico" color="error" size="small" />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </Card>
            )}

            {/* Departamentos que Necesitan Pedido */}
            {departamentosNecesitanPedido.length > 0 && (
              <Card>
                <Accordion 
                  expanded={stockExpanded} 
                  onChange={() => setStockExpanded(!stockExpanded)}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Badge badgeContent={departamentosNecesitanPedido.length} color="info">
                        <TrendingUp color="info" />
                      </Badge>
                      <Typography variant="h6" fontWeight="bold">
                        Necesitan Pedido
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {departamentosNecesitanPedido.map((d: DepartmentStatus) => (
                        <ListItem key={`pedido-${d.departamento_nombre}`}>
                          <ListItemText 
                            primary={d.departamento_nombre}
                            secondary={`${d.sucursales_necesitan_pedido}/${d.sucursales_activas} sucursales necesitan pedido`}
                          />
                          <Chip label="Pedido" color="info" size="small" />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </Card>
            )}

          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MapaNacional; 