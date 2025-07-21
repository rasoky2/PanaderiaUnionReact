import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { supabase } from '../../config/supabase.config';

interface StockItem {
  producto_id: number;
  producto_nombre: string;
  categoria_nombre: string;
  cantidad_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  estado_stock: 'critico' | 'bajo' | 'normal' | 'exceso';
  precio_unitario: number;
  url_imagen: string;
  ultima_actualizacion: string;
}

const StockGestion: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sinSucursal, setSinSucursal] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [observaciones, setObservaciones] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadStockData();
  }, []);

  const loadStockData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userSession = localStorage.getItem('userSession');
      if (!userSession) {
        setError('No se encontró información del usuario');
        return;
      }

      const userData = JSON.parse(userSession);
      
      if (!userData.id) {
        setError('ID de usuario no encontrado');
        return;
      }

      // Verificar si tiene sucursal
      const { data: metricas, error: metricasError } = await supabase
        .rpc('obtener_metricas_dashboard_empleado', {
          p_empleado_id: userData.id
        });

      console.log('📊 Respuesta métricas RPC:', metricas);
      console.log('❌ Error métricas:', metricasError);

      if (metricasError) {
        console.error('Error RPC métricas:', metricasError);
        setError('Error al verificar información del empleado');
        return;
      }

      // Procesar respuesta de métricas correctamente
      let datosEmpleado = null;
      if (metricas) {
        // Verificar si es un objeto directo con tiene_sucursal
        if (typeof metricas === 'object' && metricas.tiene_sucursal !== undefined) {
          datosEmpleado = metricas;
        }
        // Si es array, extraer el primer elemento
        else if (Array.isArray(metricas) && metricas.length > 0) {
          if (metricas[0]?.resultado) {
            // Si tiene estructura {resultado: {...}}
            datosEmpleado = metricas[0].resultado;
          } else if (metricas[0]?.tiene_sucursal !== undefined) {
            // Si es objeto directo
            datosEmpleado = metricas[0];
          }
        }
      }

      console.log('📊 Datos empleado procesados:', datosEmpleado);
      console.log('🏢 Tiene sucursal:', datosEmpleado?.tiene_sucursal);

      if (!datosEmpleado || !datosEmpleado.tiene_sucursal) {
        console.log('⚠️ Empleado sin sucursal asignada');
        setSinSucursal(true);
        return;
      }

      console.log('✅ Empleado con sucursal, cargando stock...');

      // Cargar stock
      const { data: stockData, error: stockError } = await supabase
        .rpc('obtener_stock_sucursal_empleado', {
          p_empleado_id: userData.id
        });

      console.log('📦 Respuesta stock RPC:', stockData);
      console.log('❌ Error stock:', stockError);

      if (stockError) {
        console.error('Error RPC stock:', stockError);
        setError('Error al obtener el stock de la sucursal');
        return;
      }

      // Procesar respuesta correctamente - la función devuelve [{resultado: [...]}]
      let productos: StockItem[] = [];
      if (stockData && stockData.length > 0) {
        if (Array.isArray(stockData[0])) {
          // Si es array directo
          productos = stockData[0];
        } else if (stockData[0]?.resultado) {
          // Si tiene estructura {resultado: [...]}
          productos = stockData[0].resultado;
        } else if (Array.isArray(stockData)) {
          // Si es array de productos directo
          productos = stockData;
        }
      }

      console.log('📦 Productos procesados:', productos);
      console.log('📊 Cantidad de productos:', productos.length);

      // Validar que cada producto tenga las propiedades necesarias
      const productosValidos = productos.filter(item => 
        item && 
        typeof item.producto_id !== 'undefined' &&
        typeof item.producto_nombre !== 'undefined' &&
        typeof item.cantidad_actual !== 'undefined'
      );

      console.log('✅ Productos válidos:', productosValidos.length);

      if (productosValidos.length !== productos.length) {
        console.warn('⚠️ Algunos productos tienen datos incompletos');
      }

      setStockItems(productosValidos);

    } catch (err) {
      setError('Error al cargar información');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStock = (item: StockItem) => {
    setSelectedProduct(item);
    setNewQuantity(item.cantidad_actual);
    setObservaciones('');
    setEditDialog(true);
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;

    try {
      setUpdating(true);
      const userSession = localStorage.getItem('userSession');
      const userData = JSON.parse(userSession!);

      const { data, error } = await supabase
        .rpc('actualizar_stock_producto_empleado', {
          p_empleado_id: userData.id,
          p_producto_id: selectedProduct.producto_id,
          p_nueva_cantidad: newQuantity,
          p_observaciones: observaciones || 'Actualización manual de stock'
        });

      if (error || !data[0]?.success) {
        setError(data[0]?.error || 'Error al actualizar el stock');
        return;
      }

      await loadStockData();
      setEditDialog(false);
      setSelectedProduct(null);

    } catch (err) {
      setError('Error al actualizar el stock');
    } finally {
      setUpdating(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'critico': return 'error';
      case 'bajo': return 'warning';
      case 'exceso': return 'info';
      default: return 'success';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'critico': return <ErrorIcon />;
      case 'bajo': return <WarningIcon />;
      default: return <CheckCircleIcon />;
    }
  };

  // Renderizar estado sin sucursal
  if (sinSucursal) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <InventoryIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="text.secondary">
            Sin Sucursal Asignada
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Contacta al administrador para que te asigne una sucursal y puedas gestionar el inventario.
          </Typography>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Cargando inventario...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          p: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main">
              📦 Gestión de Inventario
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Administra el stock de productos de tu sucursal
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={loadStockData}
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          >
            Actualizar
          </Button>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
      </Box>

      {/* Métricas */}
      {stockItems.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ 
              border: '1px solid',
              borderColor: 'primary.200',
              borderRadius: 1,
              '&:hover': {
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="caption" fontWeight="medium">
                      Total Productos
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      {stockItems.length}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    bgcolor: 'primary.50', 
                    borderRadius: '50%', 
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <InventoryIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ 
              border: '1px solid',
              borderColor: 'error.200',
              borderRadius: 1,
              '&:hover': {
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.1)',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="caption" fontWeight="medium">
                      Stock Crítico
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="error.main">
                      {stockItems.filter(item => item && item.estado_stock === 'critico').length}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    bgcolor: 'error.50', 
                    borderRadius: '50%', 
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ErrorIcon sx={{ fontSize: 20, color: 'error.main' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ 
              border: '1px solid',
              borderColor: 'warning.200',
              borderRadius: 1,
              '&:hover': {
                boxShadow: '0 2px 8px rgba(255, 152, 0, 0.1)',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="caption" fontWeight="medium">
                      Stock Bajo
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      {stockItems.filter(item => item && item.estado_stock === 'bajo').length}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    bgcolor: 'warning.50', 
                    borderRadius: '50%', 
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <WarningIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ 
              border: '1px solid',
              borderColor: 'success.200',
              borderRadius: 1,
              '&:hover': {
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.1)',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="caption" fontWeight="medium">
                      Stock Normal
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {stockItems.filter(item => item && item.estado_stock === 'normal').length}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    bgcolor: 'success.50', 
                    borderRadius: '50%', 
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabla de productos */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Inventario de Productos
          </Typography>

          {stockItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No hay productos en inventario
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="center">Stock Actual</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="center">Min/Max</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stockItems
                    .filter(item => item && item.producto_id && item.producto_nombre) // Filtrar elementos válidos
                    .map((item) => {
                      // Validar propiedades críticas antes del renderizado
                      if (!item || !item.producto_id || !item.producto_nombre) {
                        console.warn('⚠️ Producto inválido detectado:', item);
                        return null;
                      }

                      return (
                        <TableRow key={item.producto_id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                src={item.url_imagen || ''}
                                sx={{ 
                                  mr: 2, 
                                  width: 60, 
                                  height: 60,
                                  border: '2px solid',
                                  borderColor: 'grey.200',
                                  borderRadius: 2,
                                  '& img': {
                                    objectFit: 'cover'
                                  }
                                }}
                                variant="rounded"
                              >
                                <Box
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    bgcolor: 'primary.light',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {(item.producto_nombre || 'P').charAt(0)}
                                </Box>
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" fontWeight="bold" sx={{ mb: 0.5 }}>
                                  {item.producto_nombre || 'Producto sin nombre'}
                                </Typography>
                                {item.categoria_nombre && (
                                  <Typography variant="caption" color="text.secondary" sx={{ 
                                    bgcolor: 'grey.100', 
                                    px: 1, 
                                    py: 0.25, 
                                    borderRadius: 1,
                                    display: 'inline-block'
                                  }}>
                                    {item.categoria_nombre}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="h5" fontWeight="bold" color="primary">
                              {item.cantidad_actual ?? 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              unidades
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              icon={getEstadoIcon(item.estado_stock || 'normal')}
                              label={(item.estado_stock || 'normal').toUpperCase()}
                              color={getEstadoColor(item.estado_stock || 'normal') as any}
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="medium">
                              Min: {item.stock_minimo ?? 0}
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              Max: {item.stock_maximo ?? 0}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                              S/ {Number(item.precio_unitario ?? 0).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Editar stock">
                              <IconButton
                                color="primary"
                                onClick={() => handleEditStock(item)}
                                sx={{
                                  bgcolor: 'primary.50',
                                  '&:hover': {
                                    bgcolor: 'primary.100'
                                  }
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                    .filter(Boolean) // Remover elementos null
                  }
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de edición */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={selectedProduct?.url_imagen || ''}
              sx={{ 
                width: 50, 
                height: 50,
                border: '2px solid',
                borderColor: 'grey.200',
                borderRadius: 2
              }}
              variant="rounded"
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                {(selectedProduct?.producto_nombre || 'P').charAt(0)}
              </Box>
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {selectedProduct?.producto_nombre}
              </Typography>
              {selectedProduct?.categoria_nombre && (
                <Typography variant="caption" color="text.secondary" sx={{ 
                  bgcolor: 'grey.100', 
                  px: 1, 
                  py: 0.25, 
                  borderRadius: 1,
                  display: 'inline-block'
                }}>
                  {selectedProduct.categoria_nombre}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    <strong>Stock actual:</strong> {selectedProduct?.cantidad_actual} unidades
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    <strong>Rango recomendado:</strong> {selectedProduct?.stock_minimo} - {selectedProduct?.stock_maximo} unidades
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    S/ {Number(selectedProduct?.precio_unitario ?? 0).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    precio unitario
                  </Typography>
                </Box>
              </Box>
            </Alert>

            <TextField
              fullWidth
              label="Nueva cantidad"
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
              sx={{ mb: 3 }}
              inputProps={{ min: 0 }}
              helperText={`Cantidad actual: ${selectedProduct?.cantidad_actual || 0} unidades`}
            />

            <TextField
              fullWidth
              label="Observaciones (opcional)"
              multiline
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Motivo de la actualización, notas adicionales..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setEditDialog(false)}
            sx={{ mr: 1 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateStock}
            variant="contained"
            disabled={updating}
            sx={{
              minWidth: 120,
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }}
          >
            {updating ? <CircularProgress size={20} color="inherit" /> : 'Actualizar Stock'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StockGestion; 