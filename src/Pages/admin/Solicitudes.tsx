import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Button,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { 
  Visibility, 
  CheckCircle, 
  Cancel, 
  Print, 
  Close,
  Assignment,
  Store,
  Person,
  CalendarToday,
  Inventory,
  TrendingUp,
  Assessment
} from '@mui/icons-material';
import { supabase } from '../../config/supabase.config';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Solicitud {
  id: string;
  created_at: string;
  estado: string;
  observaciones: string;
  solicitante_nombre: string;
  solicitante_apellido: string;
  sucursal_nombre: string;
  sucursal_departamento: string;
  sucursal_provincia: string;
  total_productos: number;
  total_cantidad_solicitada: number;
  total_cantidad_aprobada: number;
  productos_detalle: any[];
}

interface DetalleSolicitud {
  id: string;
  created_at: string;
  estado: string;
  observaciones?: string;
  solicitante_nombre: string;
  solicitante_apellido: string;
  solicitante_email?: string;
  solicitante_celular?: string;
  sucursal_nombre: string;
  sucursal_departamento: string;
  sucursal_provincia: string;
  sucursal_direccion?: string;
  productos: any[];
}

interface ImpactoStock {
  producto_id: number;
  producto_nombre: string;
  cantidad_solicitada: number;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  nuevo_stock: number;
  estado_actual: string;
  nuevo_estado: string;
  impacto: string;
  dias_cobertura: number;
}

const SolicitudesPage = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  
  // Estados para modales
  const [openDetalle, setOpenDetalle] = useState(false);
  const [openAccion, setOpenAccion] = useState(false);
  const [openImpactoStock, setOpenImpactoStock] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [detalleSolicitud, setDetalleSolicitud] = useState<DetalleSolicitud | null>(null);
  const [impactoStock, setImpactoStock] = useState<ImpactoStock[]>([]);
  const [accionTipo, setAccionTipo] = useState<'aprobar' | 'rechazar' | 'completar'>('aprobar');
  const [observacionesAccion, setObservacionesAccion] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [loadingImpacto, setLoadingImpacto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc('obtener_solicitudes_completas');

    if (error) {
      console.error('Error fetching solicitudes:', error);
      setError('No se pudieron cargar las solicitudes. Por favor, intente de nuevo.');
      setSolicitudes([]);
    } else {
      setSolicitudes(data || []);
    }
    setLoading(false);
  };

  const fetchDetalleSolicitud = async (solicitudId: string) => {
    const { data, error } = await supabase.rpc('obtener_detalle_solicitud', {
      p_solicitud_id: solicitudId
    });

    if (error) {
      console.error('Error fetching detalle solicitud:', error);
      setError('No se pudo cargar el detalle de la solicitud.');
      return null;
    }

    return data?.[0] || null;
  };

  const fetchImpactoStock = async (solicitudId: string) => {
    setLoadingImpacto(true);
    const { data, error } = await supabase.rpc('calcular_impacto_stock_solicitud', {
      p_solicitud_id: solicitudId
    });

    if (error) {
      console.error('Error fetching impacto stock:', error);
      setError('No se pudo calcular el impacto en el stock.');
      setImpactoStock([]);
    } else {
      setImpactoStock(data || []);
    }
    setLoadingImpacto(false);
  };

  const handleVerDetalle = async (solicitud: Solicitud) => {
    setSolicitudSeleccionada(solicitud);
    const detalle = await fetchDetalleSolicitud(solicitud.id);
    if (detalle) {
      setDetalleSolicitud(detalle);
      setOpenDetalle(true);
    }
  };

  const handleAbrirAccion = (solicitud: Solicitud, tipo: 'aprobar' | 'rechazar' | 'completar') => {
    setSolicitudSeleccionada(solicitud);
    setAccionTipo(tipo);
    setObservacionesAccion('');
    setOpenAccion(true);
  };

  const handleVerImpactoStock = async (solicitud: Solicitud) => {
    setSolicitudSeleccionada(solicitud);
    await fetchImpactoStock(solicitud.id);
    setOpenImpactoStock(true);
  };

  const handleEjecutarAccion = async () => {
    if (!solicitudSeleccionada) return;

    setProcesando(true);
    setError(null);

    let funcionRPC = '';
    switch (accionTipo) {
      case 'aprobar':
        funcionRPC = 'aprobar_solicitud';
        break;
      case 'rechazar':
        funcionRPC = 'rechazar_solicitud';
        break;
      case 'completar':
        funcionRPC = 'completar_solicitud';
        break;
    }

    const { data, error } = await supabase.rpc(funcionRPC, {
      p_solicitud_id: solicitudSeleccionada.id,
      p_observaciones: observacionesAccion || null
    });

    if (error) {
      console.error(`Error ${accionTipo} solicitud:`, error);
      setError(`No se pudo ${accionTipo} la solicitud. Por favor, intente de nuevo.`);
    } else if (data) {
      await fetchSolicitudes(); // Recargar la lista
      setOpenAccion(false);
    } else {
      setError('No se pudo procesar la acción. Verifique el estado de la solicitud.');
    }

    setProcesando(false);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Chip label="Pendiente" color="warning" size="small" />;
      case 'aprobada':
        return <Chip label="Aprobada" color="success" size="small" />;
      case 'rechazada':
        return <Chip label="Rechazada" color="error" size="small" />;
      case 'completada':
        return <Chip label="Completada" color="info" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const getAccionesDisponibles = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return ['aprobar', 'rechazar'];
      case 'aprobada':
        return ['completar'];
      default:
        return [];
    }
  };

  const solicitudesFiltradas = solicitudes.filter(s => 
    !filtroEstado || s.estado === filtroEstado
  );

  const calcularTotalSolicitado = (productos: any[]) => {
    return productos.reduce((total, p) => total + (p.cantidad_solicitada * p.precio_unitario), 0);
  };

  const calcularTotalAprobado = (productos: any[]) => {
    return productos.reduce((total, p) => total + ((p.cantidad_aprobada || 0) * p.precio_unitario), 0);
  };

  const getEstadoStockChip = (estado: string) => {
    switch (estado) {
      case 'critico':
        return <Chip label="Crítico" color="error" size="small" />;
      case 'bajo':
        return <Chip label="Bajo" color="warning" size="small" />;
      case 'normal':
        return <Chip label="Normal" color="success" size="small" />;
      case 'alto':
        return <Chip label="Alto" color="info" size="small" />;
      default:
        return <Chip label={estado} size="small" />;
    }
  };

  const getImpactoIcon = (impacto: string) => {
    switch (impacto) {
      case 'critico':
        return <Cancel color="error" />;
      case 'alto':
        return <TrendingUp color="warning" />;
      case 'medio':
        return <Assessment color="info" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  const generarPDFSolicitud = async (solicitud: Solicitud) => {
    try {
      // Obtener detalle completo de la solicitud
      const detalle = await fetchDetalleSolicitud(solicitud.id);
      if (!detalle) {
        setError('No se pudo obtener el detalle de la solicitud para generar el PDF.');
        return;
      }

      const doc = new jsPDF();
      
      // Configuración de colores
      const primaryColor: [number, number, number] = [33, 150, 243]; // Azul
      const secondaryColor: [number, number, number] = [117, 117, 117]; // Gris
      const successColor: [number, number, number] = [76, 175, 80]; // Verde
      const errorColor: [number, number, number] = [244, 67, 54]; // Rojo

      // Encabezado
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('PANADERÍA UNIÓN', 20, 25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Solicitud de Productos', 20, 35);

      // Información de la solicitud
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACIÓN DE LA SOLICITUD', 20, 55);

      // Línea separadora
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(20, 58, 190, 58);

      let yPos = 70;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      // Información básica en dos columnas
      const infoBasica = [
        ['ID Solicitud:', detalle.id],
        ['Fecha:', format(new Date(detalle.created_at), 'dd/MM/yyyy HH:mm', { locale: es })],
        ['Estado:', detalle.estado.toUpperCase()],
        ['Sucursal:', detalle.sucursal_nombre],
        ['Ubicación:', `${detalle.sucursal_departamento}, ${detalle.sucursal_provincia}`],
        ['Dirección:', detalle.sucursal_direccion || 'No especificada']
      ];

      const infoSolicitante = [
        ['Solicitante:', `${detalle.solicitante_nombre} ${detalle.solicitante_apellido}`],
        ['Email:', detalle.solicitante_email || 'No especificado'],
        ['Celular:', detalle.solicitante_celular || 'No especificado'],
        ['', ''],
        ['', ''],
        ['', '']
      ];

      // Columna izquierda
      infoBasica.forEach((item, i) => {
        if (item && item.length >= 2 && item[0] && item[1]) {
          doc.setFont('helvetica', 'bold');
          doc.text(item[0], 20, yPos + (i * 8));
          doc.setFont('helvetica', 'normal');
          doc.text(item[1], 55, yPos + (i * 8));
        }
      });

      // Columna derecha
      infoSolicitante.forEach((item, i) => {
        if (item && item.length >= 2 && item[0] && item[1]) {
          doc.setFont('helvetica', 'bold');
          doc.text(item[0], 110, yPos + (i * 8));
          doc.setFont('helvetica', 'normal');
          doc.text(item[1], 145, yPos + (i * 8));
        }
      });

      yPos += 60;

      // Observaciones si existen
      if (detalle.observaciones) {
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        const observacionesLines = doc.splitTextToSize(detalle.observaciones, 170);
        doc.text(observacionesLines, 20, yPos + 8);
        yPos += 8 + (observacionesLines.length * 5) + 10;
      }

      // Tabla de productos
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('PRODUCTOS SOLICITADOS', 20, yPos);
      yPos += 10;

      // Preparar datos para la tabla
      const tableData = detalle.productos.map((producto: any) => [
        producto.producto_nombre,
        producto.producto_categoria,
        producto.cantidad_solicitada.toString(),
        producto.cantidad_aprobada ? producto.cantidad_aprobada.toString() : '-',
        `S/ ${Number(producto.precio_unitario).toFixed(2)}`,
        `S/ ${Number(producto.subtotal_solicitado).toFixed(2)}`,
        producto.cantidad_aprobada ? `S/ ${Number(producto.subtotal_aprobado).toFixed(2)}` : '-'
      ]);

      // Configurar la tabla
      (doc as any).autoTable({
        startY: yPos,
        head: [['Producto', 'Categoría', 'Cant. Sol.', 'Cant. Apr.', 'Precio Unit.', 'Subtotal Sol.', 'Subtotal Apr.']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 35 }, // Producto
          1: { cellWidth: 25 }, // Categoría
          2: { cellWidth: 20, halign: 'center' }, // Cant. Sol.
          3: { cellWidth: 20, halign: 'center' }, // Cant. Apr.
          4: { cellWidth: 25, halign: 'right' }, // Precio Unit.
          5: { cellWidth: 25, halign: 'right' }, // Subtotal Sol.
          6: { cellWidth: 25, halign: 'right' } // Subtotal Apr.
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      // Totales
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      const totalSolicitado = calcularTotalSolicitado(detalle.productos);
      const totalAprobado = calcularTotalAprobado(detalle.productos);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('TOTAL SOLICITADO:', 120, finalY);
      doc.text(`S/ ${totalSolicitado.toFixed(2)}`, 170, finalY);

      if (detalle.estado !== 'pendiente') {
        doc.text('TOTAL APROBADO:', 120, finalY + 8);
        const statusColor = (() => {
          switch (detalle.estado) {
            case 'aprobada': return successColor;
            case 'rechazada': return errorColor;
            default: return primaryColor;
          }
        })();
        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.text(`S/ ${totalAprobado.toFixed(2)}`, 170, finalY + 8);
      }

      // Pie de página
      const pageHeight = doc.internal.pageSize.height;
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Documento generado automáticamente por el Sistema de Gestión - Panadería Unión', 20, pageHeight - 20);
      doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, pageHeight - 15);

      // Descargar el PDF
      const fileName = `Solicitud_${detalle.id.substring(0, 8)}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generando PDF:', error);
      setError('Error al generar el PDF. Por favor, intente de nuevo.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Gestión de Solicitudes
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel size="small">Filtrar por estado</InputLabel>
            <Select
              value={filtroEstado}
              label="Filtrar por estado"
              onChange={(e) => setFiltroEstado(e.target.value)}
              size="small"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="pendiente">Pendiente</MenuItem>
              <MenuItem value="aprobada">Aprobada</MenuItem>
              <MenuItem value="rechazada">Rechazada</MenuItem>
              <MenuItem value="completada">Completada</MenuItem>
            </Select>
          </FormControl>
          
          <Button variant="outlined" onClick={fetchSolicitudes} disabled={loading}>
            Actualizar
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID Solicitud</TableCell>
                  <TableCell>Sucursal</TableCell>
                  <TableCell>Solicitante</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="center">Productos</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {solicitudesFiltradas.map((solicitud) => (
                  <TableRow key={solicitud.id}>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {solicitud.id.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack>
                        <Typography variant="body2" fontWeight="500">
                          {solicitud.sucursal_nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {solicitud.sucursal_departamento}, {solicitud.sucursal_provincia}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {`${solicitud.solicitante_nombre} ${solicitud.solicitante_apellido}`}
                    </TableCell>
                    <TableCell>
                      {format(new Date(solicitud.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        icon={<Inventory />}
                        label={`${solicitud.total_productos} productos`}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">{getStatusChip(solicitud.estado)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton 
                          size="small" 
                          onClick={() => handleVerDetalle(solicitud)} 
                          title="Ver Detalles"
                        >
                          <Visibility />
                        </IconButton>
                        
                        <IconButton 
                          size="small" 
                          onClick={() => handleVerImpactoStock(solicitud)} 
                          title="Ver Impacto en Stock"
                          color="primary"
                        >
                          <TrendingUp />
                        </IconButton>
                        
                        {getAccionesDisponibles(solicitud.estado).includes('aprobar') && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleAbrirAccion(solicitud, 'aprobar')} 
                            title="Aprobar"
                            color="success"
                          >
                            <CheckCircle />
                          </IconButton>
                        )}
                        
                        {getAccionesDisponibles(solicitud.estado).includes('rechazar') && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleAbrirAccion(solicitud, 'rechazar')} 
                            title="Rechazar"
                            color="error"
                          >
                            <Cancel />
                          </IconButton>
                        )}
                        
                        {getAccionesDisponibles(solicitud.estado).includes('completar') && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleAbrirAccion(solicitud, 'completar')} 
                            title="Completar"
                            color="info"
                          >
                            <Assignment />
                          </IconButton>
                        )}
                        
                        <IconButton 
                          size="small" 
                          onClick={() => generarPDFSolicitud(solicitud)} 
                          title="Generar PDF"
                        >
                          <Print />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {solicitudesFiltradas.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                {filtroEstado 
                  ? `No hay solicitudes con estado "${filtroEstado}"` 
                  : 'No hay solicitudes registradas'
                }
              </Typography>
            </Box>
          )}
        </Card>
      )}

      {/* Modal de Detalle */}
      <Dialog open={openDetalle} onClose={() => setOpenDetalle(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Detalle de Solicitud</Typography>
            <IconButton onClick={() => setOpenDetalle(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {detalleSolicitud && (
            <Stack spacing={3}>
              {/* Información General */}
              <Card sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Assignment color="primary" />
                        <Typography variant="subtitle2">ID Solicitud</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {detalleSolicitud.id}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CalendarToday color="primary" />
                        <Typography variant="subtitle2">Fecha de Solicitud</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(detalleSolicitud.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Person color="primary" />
                        <Typography variant="subtitle2">Solicitante</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {`${detalleSolicitud.solicitante_nombre} ${detalleSolicitud.solicitante_apellido}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {detalleSolicitud.solicitante_email}
                      </Typography>
                      {detalleSolicitud.solicitante_celular && (
                        <Typography variant="caption" color="text.secondary">
                          Celular: {detalleSolicitud.solicitante_celular}
                        </Typography>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Store color="primary" />
                        <Typography variant="subtitle2">Sucursal</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {detalleSolicitud.sucursal_nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {detalleSolicitud.sucursal_departamento}, {detalleSolicitud.sucursal_provincia}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {detalleSolicitud.sucursal_direccion}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">Estado</Typography>
                      {getStatusChip(detalleSolicitud.estado)}
                    </Stack>
                  </Grid>
                  {detalleSolicitud.observaciones && (
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2">Observaciones</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {detalleSolicitud.observaciones}
                        </Typography>
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </Card>

              <Divider />

              {/* Productos Solicitados */}
              <Stack spacing={2}>
                <Typography variant="h6">Productos Solicitados</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Producto</TableCell>
                        <TableCell>Categoría</TableCell>
                        <TableCell align="center">Cant. Solicitada</TableCell>
                        <TableCell align="center">Cant. Aprobada</TableCell>
                        <TableCell align="right">Precio Unit.</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detalleSolicitud.productos.map((producto, index) => (
                        <TableRow key={`producto-${producto.producto_id || index}`}>
                          <TableCell>{producto.producto_nombre}</TableCell>
                          <TableCell>{producto.producto_categoria}</TableCell>
                          <TableCell align="center">{producto.cantidad_solicitada}</TableCell>
                          <TableCell align="center">
                            {producto.cantidad_aprobada || '-'}
                          </TableCell>
                          <TableCell align="right">
                            S/ {Number(producto.precio_unitario).toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            S/ {Number(producto.subtotal_solicitado).toFixed(2)}
                            {producto.cantidad_aprobada && (
                              <Typography variant="caption" display="block" color="success.main">
                                Aprobado: S/ {Number(producto.subtotal_aprobado).toFixed(2)}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Typography variant="subtitle2">Total Solicitado</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2">
                            S/ {calcularTotalSolicitado(detalleSolicitud.productos).toFixed(2)}
                          </Typography>
                          {detalleSolicitud.estado !== 'pendiente' && (
                            <Typography variant="caption" display="block" color="success.main">
                              Total Aprobado: S/ {calcularTotalAprobado(detalleSolicitud.productos).toFixed(2)}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Acción */}
      <Dialog open={openAccion} onClose={() => setOpenAccion(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {accionTipo === 'aprobar' && 'Aprobar Solicitud'}
          {accionTipo === 'rechazar' && 'Rechazar Solicitud'}
          {accionTipo === 'completar' && 'Completar Solicitud'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2">
              ¿Está seguro que desea {accionTipo} la solicitud de{' '}
              <strong>
                {solicitudSeleccionada?.solicitante_nombre} {solicitudSeleccionada?.solicitante_apellido}
              </strong>?
            </Typography>
            
            <TextField
              label="Observaciones (opcional)"
              multiline
              rows={3}
              value={observacionesAccion}
              onChange={(e) => setObservacionesAccion(e.target.value)}
              placeholder={`Ingrese observaciones para ${accionTipo} la solicitud...`}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAccion(false)} disabled={procesando}>
            Cancelar
          </Button>
          <Button 
            onClick={handleEjecutarAccion} 
            variant="contained"
            disabled={procesando}
            color={accionTipo === 'rechazar' ? 'error' : 'primary'}
          >
            {procesando ? (
              <CircularProgress size={20} />
            ) : (
              (() => {
                switch (accionTipo) {
                  case 'aprobar': return 'Aprobar';
                  case 'rechazar': return 'Rechazar';
                  case 'completar': return 'Completar';
                  default: return 'Procesar';
                }
              })()
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Impacto en Stock */}
      <Dialog open={openImpactoStock} onClose={() => setOpenImpactoStock(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Assessment color="primary" />
              <Typography variant="h6">Impacto en Stock</Typography>
            </Stack>
            <IconButton onClick={() => setOpenImpactoStock(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {loadingImpacto ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3}>
              {/* Información de la Solicitud */}
              <Card sx={{ p: 2, bgcolor: 'background.default' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Sucursal
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {solicitudSeleccionada?.sucursal_nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {solicitudSeleccionada?.sucursal_departamento}, {solicitudSeleccionada?.sucursal_provincia}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Estado de la Solicitud
                    </Typography>
                    {solicitudSeleccionada && getStatusChip(solicitudSeleccionada.estado)}
                  </Grid>
                </Grid>
              </Card>

              {/* Tabla de Impacto */}
              <Stack spacing={2}>
                <Typography variant="h6">Análisis de Impacto por Producto</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Producto</TableCell>
                        <TableCell align="center">Cant. Solicitada</TableCell>
                        <TableCell align="center">Stock Actual</TableCell>
                        <TableCell align="center">Nuevo Stock</TableCell>
                        <TableCell align="center">Estado Actual</TableCell>
                        <TableCell align="center">Nuevo Estado</TableCell>
                        <TableCell align="center">Impacto</TableCell>
                        <TableCell align="center">Días Cobertura</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {impactoStock.map((item, index) => (
                        <TableRow key={`impacto-${item.producto_id || index}`}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="500">
                              {item.producto_nombre}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                              <Typography variant="body2">
                                {item.cantidad_solicitada > 0 ? '+' : ''}{item.cantidad_solicitada}
                              </Typography>
                              <Typography variant="caption">
                                {getImpactoIcon(item.impacto)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="center">
                            <Stack alignItems="center" spacing={0.5}>
                              <Typography variant="body2">
                                {item.stock_actual}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Min: {item.stock_minimo} | Max: {item.stock_maximo}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="center">
                            <Typography 
                              variant="body2" 
                              fontWeight="500"
                              color={(() => {
                                if (item.nuevo_stock > item.stock_actual) return 'success.main';
                                if (item.nuevo_stock < item.stock_actual) return 'error.main';
                                return 'text.primary';
                              })()}
                            >
                              {item.nuevo_stock}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {getEstadoStockChip(item.estado_actual)}
                          </TableCell>
                          <TableCell align="center">
                            {getEstadoStockChip(item.nuevo_estado)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={(() => {
                                switch (item.impacto) {
                                  case 'incremento': return 'Incremento';
                                  case 'decremento': return 'Decremento';
                                  default: return 'Sin cambio';
                                }
                              })()}
                              color={(() => {
                                switch (item.impacto) {
                                  case 'incremento': return 'success';
                                  case 'decremento': return 'error';
                                  default: return 'default';
                                }
                              })()}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {item.dias_cobertura > 0 ? `${item.dias_cobertura} días` : 'N/A'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {impactoStock.length === 0 && !loadingImpacto && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      No se encontraron productos para analizar
                    </Typography>
                  </Box>
                )}

                {/* Resumen del Impacto */}
                {impactoStock.length > 0 && (
                  <Card sx={{ p: 2, bgcolor: 'info.50' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Resumen del Impacto
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Stack alignItems="center">
                          <Typography variant="h6" color="success.main">
                            {impactoStock.filter(i => i.nuevo_estado === 'normal').length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Productos en estado normal
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Stack alignItems="center">
                          <Typography variant="h6" color="warning.main">
                            {impactoStock.filter(i => i.nuevo_estado === 'bajo').length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Productos con stock bajo
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Stack alignItems="center">
                          <Typography variant="h6" color="error.main">
                            {impactoStock.filter(i => i.nuevo_estado === 'critico').length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Productos críticos
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Stack alignItems="center">
                          <Typography variant="h6" color="info.main">
                            {impactoStock.filter(i => i.nuevo_estado === 'exceso').length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Productos con exceso
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Card>
                )}
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImpactoStock(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SolicitudesPage;
