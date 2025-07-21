import {
  Assessment,
  Assignment,
  AttachMoney,
  Print,
  Refresh,
  TrendingUp,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { endOfMonth, format, startOfMonth, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase.config';
import AdminLayout from './AdminLayout';

interface ReporteSolicitudes {
  total_solicitudes: number;
  solicitudes_pendientes: number;
  solicitudes_aprobadas: number;
  solicitudes_rechazadas: number;
  solicitudes_completadas: number;
  valor_total_solicitado: number;
  valor_total_aprobado: number;
  promedio_productos_por_solicitud: number;
  sucursal_mas_activa: string;
  producto_mas_solicitado: string;
}

interface ReporteStock {
  sucursal_id: string;
  sucursal_nombre: string;
  departamento: string;
  provincia: string;
  total_productos: number;
  productos_criticos: number;
  productos_bajos: number;
  productos_normales: number;
  productos_exceso: number;
  valor_total_stock: number;
  ultima_actualizacion: string;
}

interface ProductoPopular {
  producto_id: number;
  producto_nombre: string;
  categoria: string;
  total_solicitado: number;
  total_aprobado: number;
  veces_solicitado: number;
  valor_total_solicitado: number;
  valor_total_aprobado: number;
  stock_total_actual: number;
}

interface ActividadDepartamento {
  departamento_id: number;
  departamento_nombre: string;
  total_sucursales: number;
  sucursales_activas: number;
  total_solicitudes: number;
  valor_total_solicitado: number;
  productos_en_stock: number;
  valor_total_stock: number;
}

const ReportesPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState(
    format(subDays(new Date(), 30), 'yyyy-MM-dd')
  );
  const [fechaFin, setFechaFin] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Estados para diferentes reportes
  const [reporteSolicitudes, setReporteSolicitudes] =
    useState<ReporteSolicitudes | null>(null);
  const [reporteStock, setReporteStock] = useState<ReporteStock[]>([]);
  const [productosPopulares, setProductosPopulares] = useState<
    ProductoPopular[]
  >([]);
  const [actividadDepartamentos, setActividadDepartamentos] = useState<
    ActividadDepartamento[]
  >([]);

  useEffect(() => {
    cargarReportes();
  }, [fechaInicio, fechaFin]);

  const cargarReportes = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        cargarReporteSolicitudes(),
        cargarReporteStock(),
        cargarProductosPopulares(),
        cargarActividadDepartamentos(),
      ]);
    } catch (err) {
      console.error('Error cargando reportes:', err);
      setError('Error al cargar los reportes. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const cargarReporteSolicitudes = async () => {
    const { data, error } = await supabase.rpc('reporte_solicitudes_periodo', {
      p_fecha_inicio: fechaInicio,
      p_fecha_fin: fechaFin,
    });

    if (error) {
      console.error('Error cargando reporte de solicitudes:', error);
      throw error;
    }

    setReporteSolicitudes(data?.[0] || null);
  };

  const cargarReporteStock = async () => {
    const { data, error } = await supabase.rpc('reporte_stock_sucursales');

    if (error) {
      console.error('Error cargando reporte de stock:', error);
      throw error;
    }

    setReporteStock(data || []);
  };

  const cargarProductosPopulares = async () => {
    const { data, error } = await supabase.rpc('reporte_productos_populares', {
      p_fecha_inicio: fechaInicio,
      p_fecha_fin: fechaFin,
      p_limite: 10,
    });

    if (error) {
      console.error('Error cargando productos populares:', error);
      throw error;
    }

    setProductosPopulares(data || []);
  };

  const cargarActividadDepartamentos = async () => {
    const { data, error } = await supabase.rpc(
      'reporte_actividad_departamentos',
      {
        p_fecha_inicio: fechaInicio,
        p_fecha_fin: fechaFin,
      }
    );

    if (error) {
      console.error('Error cargando actividad por departamentos:', error);
      throw error;
    }

    setActividadDepartamentos(data || []);
  };

  const establecerPeriodoRapido = (dias: number) => {
    const fin = new Date();
    const inicio = subDays(fin, dias);
    setFechaInicio(format(inicio, 'yyyy-MM-dd'));
    setFechaFin(format(fin, 'yyyy-MM-dd'));
  };

  const establecerMesActual = () => {
    const inicio = startOfMonth(new Date());
    const fin = endOfMonth(new Date());
    setFechaInicio(format(inicio, 'yyyy-MM-dd'));
    setFechaFin(format(fin, 'yyyy-MM-dd'));
  };

  const generarPDFReporte = () => {
    const doc = new jsPDF();

    // Configuración de colores
    const primaryColor: [number, number, number] = [33, 150, 243];
    const secondaryColor: [number, number, number] = [117, 117, 117];

    // Encabezado
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PANADERÍA UNIÓN', 20, 25);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Reporte de Gestión', 20, 35);

    // Información del período
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE EJECUTIVO', 20, 55);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Período: ${format(new Date(fechaInicio), 'dd/MM/yyyy', {
        locale: es,
      })} - ${format(new Date(fechaFin), 'dd/MM/yyyy', { locale: es })}`,
      20,
      65
    );

    let yPos = 80;

    // Resumen de solicitudes
    if (reporteSolicitudes) {
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN DE SOLICITUDES', 20, yPos);
      yPos += 10;

      const solicitudesData = [
        [
          'Total de Solicitudes',
          reporteSolicitudes.total_solicitudes.toString(),
        ],
        ['Pendientes', reporteSolicitudes.solicitudes_pendientes.toString()],
        ['Aprobadas', reporteSolicitudes.solicitudes_aprobadas.toString()],
        ['Rechazadas', reporteSolicitudes.solicitudes_rechazadas.toString()],
        ['Completadas', reporteSolicitudes.solicitudes_completadas.toString()],
        [
          'Valor Total Solicitado',
          `S/ ${Number(reporteSolicitudes.valor_total_solicitado).toFixed(2)}`,
        ],
        [
          'Valor Total Aprobado',
          `S/ ${Number(reporteSolicitudes.valor_total_aprobado).toFixed(2)}`,
        ],
        ['Sucursal Más Activa', reporteSolicitudes.sucursal_mas_activa],
        ['Producto Más Solicitado', reporteSolicitudes.producto_mas_solicitado],
      ];

      (doc as any).autoTable({
        startY: yPos,
        head: [['Métrica', 'Valor']],
        body: solicitudesData,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 80 },
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 20;
    }

    // Top 5 productos populares
    if (productosPopulares.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('TOP 5 PRODUCTOS MÁS SOLICITADOS', 20, yPos);
      yPos += 10;

      const productosData = productosPopulares
        .slice(0, 5)
        .map((producto, index) => [
          (index + 1).toString(),
          producto.producto_nombre,
          producto.categoria,
          producto.total_solicitado.toString(),
          `S/ ${Number(producto.valor_total_solicitado).toFixed(2)}`,
        ]);

      (doc as any).autoTable({
        startY: yPos,
        head: [['#', 'Producto', 'Categoría', 'Cantidad', 'Valor Total']],
        body: productosData,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
      });
    }

    // Pie de página
    const pageHeight = doc.internal.pageSize.height;
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Documento generado automáticamente por el Sistema de Gestión - Panadería Unión',
      20,
      pageHeight - 20
    );
    doc.text(
      `Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm', {
        locale: es,
      })}`,
      20,
      pageHeight - 15
    );

    // Descargar el PDF
    const fileName = `Reporte_Ejecutivo_${format(
      new Date(),
      'yyyyMMdd_HHmm'
    )}.pdf`;
    doc.save(fileName);
  };

  const getEstadoStockChip = (
    criticos: number,
    bajos: number,
    total: number
  ) => {
    const problematicos = criticos + bajos;
    const porcentaje = total > 0 ? (problematicos / total) * 100 : 0;

    if (porcentaje > 50) {
      return <Chip label='Crítico' color='error' size='small' />;
    } else if (porcentaje > 25) {
      return <Chip label='Atención' color='warning' size='small' />;
    } else {
      return <Chip label='Normal' color='success' size='small' />;
    }
  };

  const getStockChipColor = (
    stockActual: number
  ): 'success' | 'warning' | 'error' => {
    if (stockActual > 50) return 'success';
    if (stockActual > 20) return 'warning';
    return 'error';
  };

  const getActividadLabel = (totalSolicitudes: number): string => {
    if (totalSolicitudes > 10) return 'Alta';
    if (totalSolicitudes > 5) return 'Media';
    return 'Baja';
  };

  const getActividadColor = (
    totalSolicitudes: number
  ): 'success' | 'warning' | 'default' => {
    if (totalSolicitudes > 10) return 'success';
    if (totalSolicitudes > 5) return 'warning';
    return 'default';
  };

  return (
    <AdminLayout>
      <Container maxWidth='xl' sx={{ py: 3 }}>
        {/* Encabezado */}
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          sx={{ mb: 4 }}
        >
          <Typography variant='h4' fontWeight='bold'>
            Reportes y Análisis
          </Typography>

          <Stack direction='row' spacing={2}>
            <Button
              variant='outlined'
              startIcon={<Refresh />}
              onClick={cargarReportes}
              disabled={loading}
            >
              Actualizar
            </Button>
            <Button
              variant='contained'
              startIcon={<Print />}
              onClick={generarPDFReporte}
              disabled={loading || !reporteSolicitudes}
            >
              Exportar PDF
            </Button>
          </Stack>
        </Stack>

        {/* Controles de Filtros */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Filtros de Período
            </Typography>

            <Grid container spacing={3} alignItems='center'>
              <Grid item xs={12} md={3}>
                <TextField
                  label='Fecha Inicio'
                  type='date'
                  value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  label='Fecha Fin'
                  type='date'
                  value={fechaFin}
                  onChange={e => setFechaFin(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack direction='row' spacing={1} flexWrap='wrap'>
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={() => establecerPeriodoRapido(7)}
                  >
                    Últimos 7 días
                  </Button>
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={() => establecerPeriodoRapido(30)}
                  >
                    Últimos 30 días
                  </Button>
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={establecerMesActual}
                  >
                    Mes actual
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Resumen de Solicitudes */}
            {reporteSolicitudes && (
              <>
                <Grid item xs={12}>
                  <Typography variant='h5' fontWeight='bold' gutterBottom>
                    📊 Resumen de Solicitudes
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Stack direction='row' alignItems='center' spacing={2}>
                        <Assignment color='primary' sx={{ fontSize: 40 }} />
                        <Box>
                          <Typography variant='h4' fontWeight='bold'>
                            {reporteSolicitudes.total_solicitudes}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Total Solicitudes
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Stack direction='row' alignItems='center' spacing={2}>
                        <AttachMoney color='success' sx={{ fontSize: 40 }} />
                        <Box>
                          <Typography variant='h5' fontWeight='bold'>
                            S/{' '}
                            {Number(
                              reporteSolicitudes.valor_total_solicitado
                            ).toFixed(0)}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Valor Solicitado
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Stack direction='row' alignItems='center' spacing={2}>
                        <TrendingUp color='info' sx={{ fontSize: 40 }} />
                        <Box>
                          <Typography variant='h5' fontWeight='bold'>
                            S/{' '}
                            {Number(
                              reporteSolicitudes.valor_total_aprobado
                            ).toFixed(0)}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Valor Aprobado
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Stack direction='row' alignItems='center' spacing={2}>
                        <Assessment color='warning' sx={{ fontSize: 40 }} />
                        <Box>
                          <Typography variant='h5' fontWeight='bold'>
                            {Number(
                              reporteSolicitudes.promedio_productos_por_solicitud
                            ).toFixed(1)}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Promedio Productos
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Estados de Solicitudes */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant='h6' gutterBottom>
                        Estados de Solicitudes
                      </Typography>
                      <Stack spacing={2}>
                        <Stack
                          direction='row'
                          justifyContent='space-between'
                          alignItems='center'
                        >
                          <Stack
                            direction='row'
                            alignItems='center'
                            spacing={1}
                          >
                            <Chip
                              label='Pendientes'
                              color='warning'
                              size='small'
                            />
                            <Typography variant='body2'>
                              {reporteSolicitudes.solicitudes_pendientes}
                            </Typography>
                          </Stack>
                          <Typography variant='body2' color='text.secondary'>
                            {reporteSolicitudes.total_solicitudes > 0
                              ? (
                                  (reporteSolicitudes.solicitudes_pendientes /
                                    reporteSolicitudes.total_solicitudes) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </Typography>
                        </Stack>

                        <Stack
                          direction='row'
                          justifyContent='space-between'
                          alignItems='center'
                        >
                          <Stack
                            direction='row'
                            alignItems='center'
                            spacing={1}
                          >
                            <Chip
                              label='Aprobadas'
                              color='success'
                              size='small'
                            />
                            <Typography variant='body2'>
                              {reporteSolicitudes.solicitudes_aprobadas}
                            </Typography>
                          </Stack>
                          <Typography variant='body2' color='text.secondary'>
                            {reporteSolicitudes.total_solicitudes > 0
                              ? (
                                  (reporteSolicitudes.solicitudes_aprobadas /
                                    reporteSolicitudes.total_solicitudes) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </Typography>
                        </Stack>

                        <Stack
                          direction='row'
                          justifyContent='space-between'
                          alignItems='center'
                        >
                          <Stack
                            direction='row'
                            alignItems='center'
                            spacing={1}
                          >
                            <Chip
                              label='Completadas'
                              color='info'
                              size='small'
                            />
                            <Typography variant='body2'>
                              {reporteSolicitudes.solicitudes_completadas}
                            </Typography>
                          </Stack>
                          <Typography variant='body2' color='text.secondary'>
                            {reporteSolicitudes.total_solicitudes > 0
                              ? (
                                  (reporteSolicitudes.solicitudes_completadas /
                                    reporteSolicitudes.total_solicitudes) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </Typography>
                        </Stack>

                        <Stack
                          direction='row'
                          justifyContent='space-between'
                          alignItems='center'
                        >
                          <Stack
                            direction='row'
                            alignItems='center'
                            spacing={1}
                          >
                            <Chip
                              label='Rechazadas'
                              color='error'
                              size='small'
                            />
                            <Typography variant='body2'>
                              {reporteSolicitudes.solicitudes_rechazadas}
                            </Typography>
                          </Stack>
                          <Typography variant='body2' color='text.secondary'>
                            {reporteSolicitudes.total_solicitudes > 0
                              ? (
                                  (reporteSolicitudes.solicitudes_rechazadas /
                                    reporteSolicitudes.total_solicitudes) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Información Destacada */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant='h6' gutterBottom>
                        Información Destacada
                      </Typography>
                      <Stack spacing={3}>
                        <Box>
                          <Typography
                            variant='subtitle2'
                            color='text.secondary'
                          >
                            Sucursal Más Activa
                          </Typography>
                          <Typography variant='h6' color='primary'>
                            {reporteSolicitudes.sucursal_mas_activa}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography
                            variant='subtitle2'
                            color='text.secondary'
                          >
                            Producto Más Solicitado
                          </Typography>
                          <Typography variant='h6' color='primary'>
                            {reporteSolicitudes.producto_mas_solicitado}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography
                            variant='subtitle2'
                            color='text.secondary'
                          >
                            Tasa de Aprobación
                          </Typography>
                          <Typography variant='h6' color='success.main'>
                            {reporteSolicitudes.total_solicitudes > 0
                              ? (
                                  ((reporteSolicitudes.solicitudes_aprobadas +
                                    reporteSolicitudes.solicitudes_completadas) /
                                    reporteSolicitudes.total_solicitudes) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            {/* Productos Más Solicitados */}
            {productosPopulares.length > 0 && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant='h5' fontWeight='bold' gutterBottom>
                    🏆 Productos Más Solicitados
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Ranking</TableCell>
                              <TableCell>Producto</TableCell>
                              <TableCell>Categoría</TableCell>
                              <TableCell align='center'>
                                Cantidad Solicitada
                              </TableCell>
                              <TableCell align='center'>
                                Veces Solicitado
                              </TableCell>
                              <TableCell align='right'>Valor Total</TableCell>
                              <TableCell align='center'>Stock Actual</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {productosPopulares.map((producto, index) => (
                              <TableRow key={producto.producto_id}>
                                <TableCell>
                                  <Chip
                                    label={`#${index + 1}`}
                                    color={index < 3 ? 'primary' : 'default'}
                                    size='small'
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant='body2' fontWeight='500'>
                                    {producto.producto_nombre}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={producto.categoria}
                                    variant='outlined'
                                    size='small'
                                  />
                                </TableCell>
                                <TableCell align='center'>
                                  <Typography variant='body2' fontWeight='500'>
                                    {producto.total_solicitado}
                                  </Typography>
                                </TableCell>
                                <TableCell align='center'>
                                  {producto.veces_solicitado}
                                </TableCell>
                                <TableCell align='right'>
                                  <Typography variant='body2' fontWeight='500'>
                                    S/{' '}
                                    {Number(
                                      producto.valor_total_solicitado
                                    ).toFixed(2)}
                                  </Typography>
                                </TableCell>
                                <TableCell align='center'>
                                  <Chip
                                    label={producto.stock_total_actual}
                                    color={getStockChipColor(
                                      producto.stock_total_actual
                                    )}
                                    size='small'
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            {/* Reporte de Stock por Sucursales */}
            {reporteStock.length > 0 && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant='h5' fontWeight='bold' gutterBottom>
                    📦 Estado de Stock por Sucursales
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Sucursal</TableCell>
                              <TableCell>Ubicación</TableCell>
                              <TableCell align='center'>
                                Total Productos
                              </TableCell>
                              <TableCell align='center'>Críticos</TableCell>
                              <TableCell align='center'>Bajos</TableCell>
                              <TableCell align='center'>Estado</TableCell>
                              <TableCell align='right'>Valor Stock</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {reporteStock.map(sucursal => (
                              <TableRow key={sucursal.sucursal_id}>
                                <TableCell>
                                  <Typography variant='body2' fontWeight='500'>
                                    {sucursal.sucursal_nombre}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant='caption'
                                    color='text.secondary'
                                  >
                                    {sucursal.departamento},{' '}
                                    {sucursal.provincia}
                                  </Typography>
                                </TableCell>
                                <TableCell align='center'>
                                  {sucursal.total_productos}
                                </TableCell>
                                <TableCell align='center'>
                                  <Chip
                                    label={sucursal.productos_criticos}
                                    color={
                                      sucursal.productos_criticos > 0
                                        ? 'error'
                                        : 'default'
                                    }
                                    size='small'
                                  />
                                </TableCell>
                                <TableCell align='center'>
                                  <Chip
                                    label={sucursal.productos_bajos}
                                    color={
                                      sucursal.productos_bajos > 0
                                        ? 'warning'
                                        : 'default'
                                    }
                                    size='small'
                                  />
                                </TableCell>
                                <TableCell align='center'>
                                  {getEstadoStockChip(
                                    sucursal.productos_criticos,
                                    sucursal.productos_bajos,
                                    sucursal.total_productos
                                  )}
                                </TableCell>
                                <TableCell align='right'>
                                  <Typography variant='body2' fontWeight='500'>
                                    S/{' '}
                                    {Number(sucursal.valor_total_stock).toFixed(
                                      2
                                    )}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            {/* Actividad por Departamentos */}
            {actividadDepartamentos.length > 0 && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant='h5' fontWeight='bold' gutterBottom>
                    🗺️ Actividad por Departamentos
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Departamento</TableCell>
                              <TableCell align='center'>Sucursales</TableCell>
                              <TableCell align='center'>Solicitudes</TableCell>
                              <TableCell align='right'>
                                Valor Solicitado
                              </TableCell>
                              <TableCell align='right'>Valor Stock</TableCell>
                              <TableCell align='center'>Actividad</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {actividadDepartamentos.map(dept => (
                              <TableRow key={dept.departamento_id}>
                                <TableCell>
                                  <Typography variant='body2' fontWeight='500'>
                                    {dept.departamento_nombre}
                                  </Typography>
                                </TableCell>
                                <TableCell align='center'>
                                  <Stack
                                    direction='row'
                                    spacing={1}
                                    justifyContent='center'
                                  >
                                    <Typography variant='body2'>
                                      {dept.sucursales_activas}/
                                      {dept.total_sucursales}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell align='center'>
                                  {dept.total_solicitudes}
                                </TableCell>
                                <TableCell align='right'>
                                  S/{' '}
                                  {Number(dept.valor_total_solicitado).toFixed(
                                    2
                                  )}
                                </TableCell>
                                <TableCell align='right'>
                                  S/ {Number(dept.valor_total_stock).toFixed(2)}
                                </TableCell>
                                <TableCell align='center'>
                                  <Chip
                                    label={getActividadLabel(
                                      dept.total_solicitudes
                                    )}
                                    color={getActividadColor(
                                      dept.total_solicitudes
                                    )}
                                    size='small'
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}
          </Grid>
        )}
      </Container>
    </AdminLayout>
  );
};

export default ReportesPage;
