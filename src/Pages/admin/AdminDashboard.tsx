import {
  Assignment,
  CheckCircle,
  ErrorOutline,
  Info,
  LocalShipping,
  People,
  Refresh,
  Schedule,
  Store,
  Warning,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase.config';
import AdminLayout from './AdminLayout';

// Interfaces para los datos
interface MetricasDashboard {
  total_sucursales: number;
  sucursales_activas: number;
  total_empleados: number;
  solicitudes_pendientes: number;
  alertas_criticas: number;
  porcentaje_operatividad: number;
}

interface EstadisticaDepartamento {
  departamento_nombre: string;
  total_sucursales: number;
  sucursales_activas: number;
  porcentaje_operatividad: number;
  estado_general: string;
  solicitudes_pendientes: number;
  productos_criticos: number;
}

interface ActividadReciente {
  id: string;
  tipo: string;
  mensaje: string;
  tiempo_transcurrido: string;
  estado: string;
  created_at: string;
}

interface AlertaCritica {
  sucursal_nombre: string;
  departamento: string;
  tipo_alerta: string;
  mensaje: string;
  severidad: string;
  productos_afectados: number;
}

const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  loading = false,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactElement;
  color?: string;
  loading?: boolean;
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Stack direction='row' alignItems='center' spacing={2}>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
          {loading ? <CircularProgress size={24} color='inherit' /> : icon}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant='h4' fontWeight='bold'>
            {loading ? '...' : value}
          </Typography>
          <Typography variant='body1' color='text.primary' fontWeight={500}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant='body2' color='text.secondary'>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metricas, setMetricas] = useState<MetricasDashboard | null>(null);
  const [departamentos, setDepartamentos] = useState<EstadisticaDepartamento[]>(
    []
  );
  const [actividades, setActividades] = useState<ActividadReciente[]>([]);
  const [alertas, setAlertas] = useState<AlertaCritica[]>([]);

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarMetricas = async () => {
    const result = await supabase.rpc('obtener_metricas_dashboard');
    if (result.error) throw result.error;
    return result.data?.[0] || null;
  };

  const cargarDepartamentos = async () => {
    const result = await supabase.rpc(
      'obtener_estadisticas_dashboard_departamentos'
    );
    if (result.error) throw result.error;
    return result.data || [];
  };

  const cargarActividades = async () => {
    const result = await supabase.rpc('obtener_actividad_reciente_dashboard');
    if (result.error) throw result.error;
    return result.data || [];
  };

  const cargarAlertas = async () => {
    const result = await supabase.rpc('obtener_alertas_criticas_dashboard');
    if (result.error) throw result.error;
    return result.data || [];
  };

  const cargarDatosDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar todas las métricas en paralelo
      const [metricasData, departamentosData, actividadesData, alertasData] =
        await Promise.all([
          cargarMetricas(),
          cargarDepartamentos(),
          cargarActividades(),
          cargarAlertas(),
        ]);

      // Establecer datos
      setMetricas(metricasData);
      setDepartamentos(departamentosData);
      setActividades(actividadesData);
      setAlertas(alertasData);
    } catch (err) {
      console.error('Error cargando datos del dashboard:', err);
      setError(
        'Error al cargar los datos del dashboard. Por favor, intente de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (
    status: string
  ): 'success' | 'warning' | 'error' | 'primary' => {
    switch (status.toLowerCase()) {
      case 'activo':
        return 'success';
      case 'alerta':
        return 'warning';
      case 'crítico':
        return 'error';
      default:
        return 'primary';
    }
  };

  const getActivityIcon = (tipo: string, estado: string) => {
    if (tipo === 'solicitud') {
      if (estado === 'pendiente') return <Assignment color='warning' />;
      if (estado === 'aprobada') return <CheckCircle color='success' />;
      return <Assignment color='primary' />;
    }

    switch (tipo) {
      case 'usuario':
        return <People color='info' />;
      case 'alerta':
        return <Warning color='warning' />;
      case 'envio':
        return <LocalShipping color='success' />;
      default:
        return <Info color='primary' />;
    }
  };

  const getSeverityColor = (
    severidad: string
  ): 'error' | 'warning' | 'info' => {
    switch (severidad.toLowerCase()) {
      case 'crítico':
        return 'error';
      case 'alto':
        return 'warning';
      case 'medio':
        return 'info';
      default:
        return 'info';
    }
  };

  const getOperativityMessage = (porcentaje: number) => {
    if (porcentaje >= 90) return '🟢 Excelente - La red opera con normalidad';
    if (porcentaje >= 70)
      return '🟡 Atención - Algunas sucursales requieren supervisión';
    return '🔴 Crítico - Se requiere intervención inmediata';
  };

  const getOperativityColor = (porcentaje: number) => {
    if (porcentaje >= 90) return 'success.light';
    if (porcentaje >= 70) return 'warning.light';
    return 'error.light';
  };

  const getOperativityTextColor = (porcentaje: number) => {
    if (porcentaje >= 90) return 'success.dark';
    if (porcentaje >= 70) return 'warning.dark';
    return 'error.dark';
  };

  const renderDepartmentContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (departamentos.length === 0) {
      return (
        <Typography
          variant='body2'
          color='text.secondary'
          textAlign='center'
          sx={{ py: 4 }}
        >
          No hay datos de departamentos disponibles
        </Typography>
      );
    }

    return (
      <Stack spacing={2}>
        {departamentos.map(dept => (
          <Box key={`dept-${dept.departamento_nombre}`}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              sx={{ mb: 1 }}
            >
              <Box>
                <Typography variant='subtitle2' fontWeight={600}>
                  {dept.departamento_nombre}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {dept.total_sucursales} sucursales •{' '}
                  {dept.solicitudes_pendientes} solicitudes pendientes
                  {dept.productos_criticos > 0 && (
                    <> • {dept.productos_criticos} alertas críticas</>
                  )}
                </Typography>
              </Box>
              <Stack direction='row' spacing={1} alignItems='center'>
                <Chip
                  label={dept.estado_general}
                  size='small'
                  color={getStatusColor(dept.estado_general)}
                  variant='filled'
                />
                <Typography variant='body2' fontWeight={500}>
                  {dept.porcentaje_operatividad}%
                </Typography>
              </Stack>
            </Stack>
            <LinearProgress
              variant='determinate'
              value={dept.porcentaje_operatividad}
              color={getStatusColor(dept.estado_general)}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        ))}
      </Stack>
    );
  };

  const renderActivityContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (actividades.length === 0) {
      return (
        <Typography
          variant='body2'
          color='text.secondary'
          textAlign='center'
          sx={{ py: 4 }}
        >
          No hay actividad reciente
        </Typography>
      );
    }

    return (
      <List disablePadding>
        {actividades.map((actividad, index) => (
          <ListItem
            key={`activity-${actividad.id}`}
            disablePadding
            sx={{
              mb: index < actividades.length - 1 ? 2 : 0,
              borderBottom: index < actividades.length - 1 ? 1 : 0,
              borderColor: 'divider',
              pb: index < actividades.length - 1 ? 2 : 0,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {getActivityIcon(actividad.tipo, actividad.estado)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant='body2' fontWeight={500}>
                  {actividad.mensaje}
                </Typography>
              }
              secondary={
                <Stack
                  direction='row'
                  alignItems='center'
                  spacing={1}
                  sx={{ mt: 0.5 }}
                >
                  <Schedule fontSize='small' color='disabled' />
                  <Typography variant='caption'>
                    {actividad.tiempo_transcurrido}
                  </Typography>
                </Stack>
              }
            />
          </ListItem>
        ))}
      </List>
    );
  };

  if (error) {
    return (
      <AdminLayout>
        <Alert
          severity='error'
          action={
            <Button color='inherit' size='small' onClick={cargarDatosDashboard}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant='h4' gutterBottom fontWeight='bold'>
              Dashboard Nacional
            </Typography>
            <Typography variant='subtitle1' color='text.secondary'>
              Resumen ejecutivo del estado de la red nacional de sucursales
            </Typography>
          </Box>

          <Button
            variant='outlined'
            startIcon={<Refresh />}
            onClick={cargarDatosDashboard}
            disabled={loading}
          >
            Actualizar
          </Button>
        </Stack>

        {/* Métricas Principales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title='Sucursales Activas'
              value={
                metricas
                  ? `${metricas.sucursales_activas}/${metricas.total_sucursales}`
                  : '0/0'
              }
              subtitle={
                metricas
                  ? `${metricas.porcentaje_operatividad}% operatividad`
                  : 'Cargando...'
              }
              icon={<Store />}
              color='primary'
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title='Empleados'
              value={metricas?.total_empleados || 0}
              subtitle='Red nacional'
              icon={<People />}
              color='info'
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title='Solicitudes Pendientes'
              value={metricas?.solicitudes_pendientes || 0}
              subtitle='Requieren atención'
              icon={<Assignment />}
              color='warning'
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title='Alertas Críticas'
              value={metricas?.alertas_criticas || 0}
              subtitle='Stock crítico'
              icon={<ErrorOutline />}
              color='error'
              loading={loading}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Estado por Departamentos */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom fontWeight='bold'>
                  Estado por Departamentos
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 3 }}
                >
                  Resumen del estado operativo en cada región
                </Typography>

                {renderDepartmentContent()}
              </CardContent>
            </Card>
          </Grid>

          {/* Actividad Reciente */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom fontWeight='bold'>
                  Actividad Reciente
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 3 }}
                >
                  Últimas actualizaciones del sistema
                </Typography>

                {renderActivityContent()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alertas Críticas */}
        {alertas.length > 0 && (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Stack
                    direction='row'
                    alignItems='center'
                    spacing={2}
                    sx={{ mb: 3 }}
                  >
                    <ErrorOutline color='error' />
                    <Box>
                      <Typography variant='h6' fontWeight='bold'>
                        Alertas Críticas de Stock
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Sucursales que requieren atención inmediata
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={2}>
                    {alertas.map((alerta, index) => (
                      <Grid
                        item
                        xs={12}
                        md={6}
                        lg={4}
                        key={`alert-${alerta.sucursal_nombre}-${index}`}
                      >
                        <Card
                          variant='outlined'
                          sx={{ borderColor: 'error.main', borderWidth: 2 }}
                        >
                          <CardContent>
                            <Stack spacing={2}>
                              <Stack
                                direction='row'
                                justifyContent='space-between'
                                alignItems='flex-start'
                              >
                                <Box>
                                  <Typography
                                    variant='subtitle2'
                                    fontWeight={600}
                                  >
                                    {alerta.sucursal_nombre}
                                  </Typography>
                                  <Typography
                                    variant='caption'
                                    color='text.secondary'
                                  >
                                    {alerta.departamento}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={alerta.severidad.toUpperCase()}
                                  size='small'
                                  color={getSeverityColor(alerta.severidad)}
                                />
                              </Stack>

                              <Typography variant='body2'>
                                {alerta.mensaje}
                              </Typography>

                              <Stack
                                direction='row'
                                alignItems='center'
                                spacing={1}
                              >
                                <Warning color='warning' fontSize='small' />
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                >
                                  {alerta.productos_afectados} productos
                                  afectados
                                </Typography>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Resumen de Estado */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                backgroundColor: metricas
                  ? getOperativityColor(metricas.porcentaje_operatividad)
                  : 'grey.100',
                color: metricas
                  ? getOperativityTextColor(metricas.porcentaje_operatividad)
                  : 'text.primary',
              }}
            >
              <Typography variant='h6' gutterBottom fontWeight='bold'>
                Estado General de la Red
              </Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>
                {metricas
                  ? getOperativityMessage(metricas.porcentaje_operatividad)
                  : 'Cargando estado...'}
              </Typography>
              {metricas && (
                <Typography variant='body2'>
                  {metricas.sucursales_activas} de {metricas.total_sucursales}{' '}
                  sucursales operativas •{metricas.solicitudes_pendientes}{' '}
                  solicitudes pendientes •{metricas.alertas_criticas} alertas
                  críticas
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboard;
