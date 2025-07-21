import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Inventory,
  TrendingDown,
  Assignment,
  Warning,
  Add,
  Store,
  Schedule,
} from '@mui/icons-material';
import { supabase } from '../../config/supabase.config';

// Tipos para los datos del empleado
interface DashboardData {
  tiene_sucursal: boolean;
  sucursal?: {
    id: string;
    nombre: string;
    direccion: string;
    departamento?: string;
    provincia?: string;
  };
  stock: {
    total_productos: number;
    sin_stock: number;
    stock_bajo: number;
    stock_normal: number;
  };
  solicitudes: {
    pendientes: number;
    aprobadas: number;
    total_mes: number;
  };
}

// Tipos para los componentes
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactElement;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  action?: React.ReactElement;
}

interface ProductoStockBajo {
  nombre: string;
  stock: number;
  minimo: number;
  categoria: string;
}

interface SolicitudReciente {
  id: string;
  fecha: string;
  productos: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'enviada' | 'recibida';
  total: string;
}

// Datos simulados para productos con stock bajo (mantenemos estos para el ejemplo)
const PRODUCTOS_STOCK_BAJO: ProductoStockBajo[] = [
  { nombre: 'Pan Integral', stock: 5, minimo: 20, categoria: 'Panes' },
  { nombre: 'Croissant Chocolate', stock: 8, minimo: 15, categoria: 'Pasteles' },
  { nombre: 'Empanada Pollo', stock: 12, minimo: 25, categoria: 'Salados' },
  { nombre: 'Torta Chocolate', stock: 2, minimo: 8, categoria: 'Tortas' },
];

const SOLICITUDES_RECIENTES: SolicitudReciente[] = [
  {
    id: 'SOL-001',
    fecha: '2024-01-15',
    productos: 'Pan Francés, Pan Integral',
    estado: 'pendiente',
    total: 'S/ 245.00'
  },
  {
    id: 'SOL-002',
    fecha: '2024-01-14',
    productos: 'Croissants, Empanadas',
    estado: 'aprobada',
    total: 'S/ 180.00'
  },
  {
    id: 'SOL-003',
    fecha: '2024-01-13',
    productos: 'Tortas, Pasteles',
    estado: 'enviada',
    total: 'S/ 320.00'
  }
];

// Componente MetricCard refactorizado
const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'primary', 
  action 
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
          {icon}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
          <Typography variant="body1" color="text.primary" fontWeight={500}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Box>
            {action}
          </Box>
        )}
      </Stack>
    </CardContent>
  </Card>
);

// Servicio para obtener datos del dashboard del empleado
const obtenerDatosEmpleado = async (empleadoId: string): Promise<DashboardData | null> => {
  try {
    console.log('Llamando RPC con empleado ID:', empleadoId);
    
    const { data, error } = await supabase.rpc('obtener_metricas_dashboard_empleado', {
      p_empleado_id: empleadoId
    });

    if (error) {
      console.error('Error al obtener datos del empleado:', error);
      return null;
    }

    console.log('Respuesta RPC cruda:', data);

    // La RPC devuelve un array con un objeto, necesitamos extraer el primer elemento
    if (data && Array.isArray(data) && data.length > 0) {
      const resultado = data[0].obtener_metricas_dashboard_empleado;
      console.log('Datos procesados:', resultado);
      return resultado;
    }

    console.log('No se encontraron datos válidos');
    return null;
  } catch (error) {
    console.error('Error en obtenerDatosEmpleado:', error);
    return null;
  }
};

const EmpleadoDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener información del usuario desde localStorage con useMemo para evitar re-renders
  const userData = useMemo(() => {
    const userSession = localStorage.getItem('userSession');
    return userSession ? JSON.parse(userSession) : null;
  }, []);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!userData?.id) {
        setError('No se encontró información del usuario');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Cargando datos para usuario:', userData.id);
        const datos = await obtenerDatosEmpleado(userData.id);
        
        if (datos) {
          setDashboardData(datos);
          console.log('Datos cargados exitosamente:', datos);
        } else {
          setError('No se pudieron cargar los datos del dashboard');
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [userData?.id]); // Solo depende del ID del usuario

  const getEstadoColor = (estado: SolicitudReciente['estado']): "warning" | "success" | "error" | "info" | "primary" => {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'aprobada': return 'success';
      case 'rechazada': return 'error';
      case 'enviada': return 'info';
      case 'recibida': return 'success';
      default: return 'primary';
    }
  };

  const getStockLevel = (stock: number, minimo: number): "error" | "warning" | "success" => {
    const percentage = (stock / minimo) * 100;
    if (percentage <= 50) return 'error';
    if (percentage <= 75) return 'warning';
    return 'success';
  };

  // Mostrar loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  // Mostrar mensaje si no tiene sucursal asignada
  if (!dashboardData?.tiene_sucursal) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
        <Store sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
        <Typography variant="h4" gutterBottom color="text.secondary">
          Sin Sucursal Asignada
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Contacta al administrador para que te asigne una sucursal y puedas gestionar el inventario.
        </Typography>
      </Box>
    );
  }

  const sucursal = dashboardData.sucursal!;
  const stockMetrics = dashboardData.stock;
  const solicitudesMetrics = dashboardData.solicitudes;

  return (
    <Box>
      {/* Header con información de la sucursal */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          {sucursal.nombre}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {sucursal.direccion}
          {sucursal.departamento && sucursal.provincia && 
            ` - ${sucursal.departamento}, ${sucursal.provincia}`
          }
        </Typography>
      </Box>

      {/* Métricas Principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Productos"
            value={stockMetrics.total_productos}
            subtitle="En inventario"
            icon={<Inventory />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Stock Bajo"
            value={stockMetrics.stock_bajo}
            subtitle="Requieren atención"
            icon={<TrendingDown />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Sin Stock"
            value={stockMetrics.sin_stock}
            subtitle="Productos agotados"
            icon={<Warning />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Solicitudes"
            value={solicitudesMetrics.pendientes}
            subtitle="Pendientes"
            icon={<Assignment />}
            color="info"
            action={
              <Button variant="outlined" size="small" startIcon={<Add />}>
                Nueva
              </Button>
            }
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Productos con Stock Bajo */}
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Productos con Stock Bajo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Productos que requieren reposición inmediata
                  </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} size="small">
                  Solicitar Stock
                </Button>
              </Stack>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Categoría</TableCell>
                      <TableCell align="center">Stock Actual</TableCell>
                      <TableCell align="center">Mínimo</TableCell>
                      <TableCell align="center">Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {PRODUCTOS_STOCK_BAJO.map((producto, index) => {
                      const stockLevel = getStockLevel(producto.stock, producto.minimo);
                      const percentage = (producto.stock / producto.minimo) * 100;
                      
                      return (
                        <TableRow key={`${producto.nombre}-${index}`}>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {producto.nombre}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={producto.categoria} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={600}>
                              {producto.stock}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {producto.minimo}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ width: 80 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(percentage, 100)}
                                color={stockLevel}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Solicitudes Recientes */}
        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Solicitudes Recientes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Historial de pedidos realizados
                  </Typography>
                </Box>
                <Button variant="outlined" size="small">
                  Ver Todas
                </Button>
              </Stack>

              <Stack spacing={2}>
                {SOLICITUDES_RECIENTES.map((solicitud, index) => (
                  <Card key={`${solicitud.id}-${index}`} variant="outlined">
                    <CardContent sx={{ py: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {solicitud.id}
                        </Typography>
                        <Chip 
                          label={solicitud.estado}
                          size="small"
                          color={getEstadoColor(solicitud.estado)}
                          variant="filled"
                        />
                      </Stack>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {solicitud.productos}
                      </Typography>
                      
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Schedule fontSize="small" color="disabled" />
                          <Typography variant="caption">
                            {solicitud.fecha}
                          </Typography>
                        </Stack>
                        <Typography variant="subtitle2" fontWeight={600} color="primary">
                          {solicitud.total}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Información de la Sucursal */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                  <Store />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Información de la Sucursal
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Datos de contacto y ubicación
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Dirección
                  </Typography>
                  <Typography variant="body1">
                    {sucursal.direccion}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Sucursal ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {sucursal.id.slice(0, 8)}...
                    </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Ubicación
                  </Typography>
                  <Typography variant="body1">
                    {sucursal.departamento && sucursal.provincia 
                      ? `${sucursal.departamento}, ${sucursal.provincia}`
                      : 'No disponible'
                    }
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmpleadoDashboard; 