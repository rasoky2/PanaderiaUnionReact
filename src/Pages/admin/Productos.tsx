import {
  Add,
  CloudUpload,
  Delete,
  Edit,
  ExpandMore,
  Inventory,
  LocalFireDepartment,
  Star,
  ViewList,
  ViewModule,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Modal,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../config/supabase.config';
import { Categoria, productoService } from '../../services/producto.service';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const emptyProduct = {
  nombre: '',
  descripcion: '',
  categoria_id: '',
  url_imagen: '',
  extra_imagenes_urls: [],
  stock_bajo: 0,
  stock_eficiente: 0,
  stock_recomendado: 0,
  es_destacado: false,
  es_mas_pedido: false,
  activo: true,
  precio: 0,
  precio_sin_igv: 0,
  precio_con_igv: 0,
  igv_porcentaje: 18,
  precio_costo: 0,
  precio_mayorista: 0,
  precio_minorista: 0,
};

// Constantes para evitar duplicación de strings literales
const DEFAULT_CATEGORY_NAME = 'Sin categoría';
const CURRENCY_PREFIX = 'S/ ';
const TEXT_SECONDARY_COLOR = 'text.secondary';

const ProductosPage = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals States
  const [openProductModal, setOpenProductModal] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [productInForm, setProductInForm] = useState<any>(emptyProduct);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [extraImageFiles, setExtraImageFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Category Management States
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [productsToDelete, setProductsToDelete] = useState<any[]>([]);

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [groupingEnabled, setGroupingEnabled] = useState<boolean>(false);

  // Stock management states
  const [openStockModal, setOpenStockModal] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] =
    useState<any>(null);
  const [stockData, setStockData] = useState<any[]>([]);
  const [stockSummary, setStockSummary] = useState<any>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [productStockInfo, setProductStockInfo] = useState<Record<number, any>>(
    {}
  );

  useEffect(() => {
    fetchProductos();
    productoService.getCategorias().then(setCategorias).catch(console.error);
  }, []);

  useEffect(() => {
    if (productos.length > 0) {
      fetchAllProductsStock();
    }
  }, [productos]);

  const fetchProductos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('productos')
      .select('*, categorias(nombre)')
      .order('nombre');
    if (error) {
      console.error('Error fetching productos:', error);
    } else {
      setProductos(data || []);
    }
    setLoading(false);
  };

  const fetchAllProductsStock = async () => {
    try {
      const stockPromises = productos.map(async producto => {
        const { data, error } = await supabase.rpc(
          'obtener_stock_producto_total',
          { p_producto_id: producto.id }
        );

        if (!error && data?.[0]) {
          return { productId: producto.id, stock: data[0] };
        }
        return { productId: producto.id, stock: null };
      });

      const stockResults = await Promise.all(stockPromises);
      const stockMap = stockResults.reduce((acc, result) => {
        acc[result.productId] = result.stock;
        return acc;
      }, {} as Record<number, any>);

      setProductStockInfo(stockMap);
    } catch (error) {
      console.error('Error fetching all products stock:', error);
    }
  };

  const displayedProductos = useMemo(() => {
    if (!selectedCategoryId) {
      return productos;
    }
    return productos.filter(p => p.categoria_id === selectedCategoryId);
  }, [productos, selectedCategoryId]);

  const activeProductos = useMemo(
    () => displayedProductos.filter(p => p.activo),
    [displayedProductos]
  );
  const inactiveProductos = useMemo(
    () => displayedProductos.filter(p => !p.activo),
    [displayedProductos]
  );

  const groupedProductos = useMemo(() => {
    if (!groupingEnabled) return null;

    return activeProductos.reduce((acc: Record<string, any[]>, product) => {
      const categoryName = product.categorias?.nombre || DEFAULT_CATEGORY_NAME;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName]?.push(product);
      return acc;
    }, {});
  }, [activeProductos, groupingEnabled]);

  const handleOpenProductModal = (producto: any | null = null) => {
    setFormError(null);
    setMainImageFile(null);
    setExtraImageFiles([]);
    if (producto) {
      setIsEditing(true);
      setProductInForm({
        ...producto,
        extra_imagenes_urls: producto.extra_imagenes_urls || [],
      });
    } else {
      setIsEditing(false);
      setProductInForm(emptyProduct);
    }
    setOpenProductModal(true);
  };

  const handleCloseProductModal = () => {
    setOpenProductModal(false);
  };

  const handleOpenCategoryModal = () => setOpenCategoryModal(true);
  const handleCloseCategoryModal = () => setOpenCategoryModal(false);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    const { data, error } = await supabase
      .from('categorias')
      .insert({ nombre: newCategoryName })
      .select();
    if (error) {
      console.error('Error creating category:', error);
    } else if (data) {
      setCategorias([...categorias, data[0]]);
      setNewCategoryName('');
    }
  };

  const handleDeleteCategoryRequest = async (categoria: any) => {
    setCategoryToDelete(categoria);
    // Fetch products that will be deleted
    const { data } = await supabase
      .from('productos')
      .select('nombre')
      .eq('categoria_id', categoria.id);
    setProductsToDelete(data || []);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', categoryToDelete.id);
    if (error) {
      console.error('Error deleting category:', error);
    } else {
      setOpenDeleteDialog(false);
      setCategoryToDelete(null);
      // Refetch both categories and products
      productoService.getCategorias().then(setCategorias).catch(console.error);
      fetchProductos();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const newValue =
      type === 'checkbox'
        ? checked
        : typeof value === 'string' &&
          (name === 'stock_bajo' ||
            name === 'stock_eficiente' ||
            name === 'stock_recomendado')
        ? parseInt(value, 10) || 0
        : typeof value === 'string' &&
          (name?.includes('precio') || name === 'igv_porcentaje')
        ? parseFloat(value as string) || 0
        : value;

    setProductInForm((prev: any) => {
      const updated = { ...prev, [name as string]: newValue };

      // Auto-calcular precios cuando cambian valores relacionados
      if (name === 'precio_sin_igv' || name === 'igv_porcentaje') {
        const precioSinIgv =
          name === 'precio_sin_igv' ? newValue : prev.precio_sin_igv || 0;
        const igvPorcentaje =
          name === 'igv_porcentaje' ? newValue : prev.igv_porcentaje || 18;
        updated.precio_con_igv = precioSinIgv * (1 + igvPorcentaje / 100);
        updated.precio = updated.precio_con_igv; // Precio principal es con IGV
      }

      if (name === 'precio_con_igv' || name === 'igv_porcentaje') {
        const precioConIgv =
          name === 'precio_con_igv' ? newValue : prev.precio_con_igv || 0;
        const igvPorcentaje =
          name === 'igv_porcentaje' ? newValue : prev.igv_porcentaje || 18;
        updated.precio_sin_igv = precioConIgv / (1 + igvPorcentaje / 100);
        updated.precio = precioConIgv; // Precio principal es con IGV
      }

      return updated;
    });
  };

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImageFile(e.target.files[0]);
    }
  };

  const handleExtraFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setExtraImageFiles(prevFiles => [
        ...prevFiles,
        ...Array.from(e.target.files!),
      ]);
    }
  };

  const handleRemoveNewExtraImage = (index: number) => {
    const updatedFiles = [...extraImageFiles];
    updatedFiles.splice(index, 1);
    setExtraImageFiles(updatedFiles);
  };

  const handleRemoveExtraImage = (index: number) => {
    const updatedUrls = [...productInForm.extra_imagenes_urls];
    updatedUrls.splice(index, 1);
    setProductInForm({ ...productInForm, extra_imagenes_urls: updatedUrls });
  };

  const uploadFile = async (file: File) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('product_images')
      .upload(fileName, file);
    if (error) {
      console.error('Error uploading file:', file.name, error);
      throw error;
    }
    const { data: urlData } = supabase.storage
      .from('product_images')
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    setFormError(null);
    try {
      let mainImageUrl = productInForm.url_imagen;
      if (mainImageFile) {
        mainImageUrl = await uploadFile(mainImageFile);
      }

      const newExtraUrls = await Promise.all(
        extraImageFiles.map(file => uploadFile(file))
      );
      const finalExtraUrls = [
        ...(productInForm.extra_imagenes_urls || []),
        ...newExtraUrls,
      ];

      const productDataToSave = {
        ...productInForm,
        url_imagen: mainImageUrl,
        extra_imagenes_urls: finalExtraUrls,
        es_destacado: productInForm.es_destacado || false,
        es_mas_pedido: productInForm.es_mas_pedido || false,
        activo: productInForm.activo,
      };

      // The 'categorias' field is from the join and not part of the 'productos' table schema.
      // It needs to be removed before insert/update.
      delete productDataToSave.categorias;

      if (isEditing) {
        const { error } = await supabase
          .from('productos')
          .update(productDataToSave)
          .eq('id', productInForm.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('productos')
          .insert([productDataToSave]);
        if (error) throw error;
      }

      fetchProductos();
      handleCloseProductModal();
    } catch (error) {
      console.error('Error saving product:', error);
      setFormError('Ocurrió un error al guardar el producto.');
    }
  };

  const renderProductGrid = (productosToRender: any[]) => (
    <Grid container spacing={3}>
      {productosToRender.map(producto => (
        <Grid item key={producto.id} xs={12} sm={6} md={4}>
          <Card
            sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <CardMedia
              component='img'
              height='194'
              image={
                producto.url_imagen || 'https://via.placeholder.com/300x200'
              }
              alt={producto.nombre}
              sx={{ filter: producto.activo ? 'none' : 'grayscale(100%)' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Stack
                direction='row'
                spacing={1}
                alignItems='center'
                sx={{ mb: 1 }}
              >
                <Typography
                  gutterBottom
                  variant='h5'
                  component='div'
                  sx={{ mb: 0 }}
                >
                  {producto.nombre}
                </Typography>
                {producto.es_destacado && (
                  <Chip
                    icon={<Star />}
                    label='Destacado'
                    color='warning'
                    size='small'
                  />
                )}
                {producto.es_mas_pedido && (
                  <Chip
                    icon={<LocalFireDepartment />}
                    label='Más Pedido'
                    color='error'
                    size='small'
                  />
                )}
              </Stack>
              <Chip
                label={producto.activo ? 'Activo' : 'Inactivo'}
                color={producto.activo ? 'success' : 'default'}
                size='small'
                sx={{ mb: 1 }}
              />
              <Typography variant='body2' color='text.secondary'>
                {producto.descripcion}
              </Typography>
              <Typography variant='caption' display='block' sx={{ mt: 1 }}>
                Categoría:{' '}
                {producto.categorias?.nombre || DEFAULT_CATEGORY_NAME}
              </Typography>
              {producto.precio_con_igv && (
                <Typography
                  variant='h6'
                  color='primary'
                  sx={{ mt: 1, fontWeight: 'bold' }}
                >
                  S/ {Number(producto.precio_con_igv).toFixed(2)}
                </Typography>
              )}
              {producto.precio_sin_igv && (
                <Typography variant='caption' color='text.secondary'>
                  Sin IGV: S/ {Number(producto.precio_sin_igv).toFixed(2)}
                </Typography>
              )}

              {/* Información de Stock */}
              {productStockInfo[producto.id] && (
                <Box
                  sx={{
                    mt: 1,
                    pt: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack
                    direction='row'
                    spacing={1}
                    alignItems='center'
                    flexWrap='wrap'
                  >
                    <Chip
                      label={`Stock: ${
                        productStockInfo[producto.id].stock_total || 0
                      }`}
                      color={
                        productStockInfo[producto.id].sucursales_stock_critico >
                        0
                          ? 'error'
                          : productStockInfo[producto.id]
                              .sucursales_stock_bajo > 0
                          ? 'warning'
                          : 'success'
                      }
                      size='small'
                      variant='outlined'
                    />
                    <Chip
                      label={`${
                        productStockInfo[producto.id].sucursales_con_stock || 0
                      } sucursales`}
                      color='info'
                      size='small'
                      variant='outlined'
                    />
                  </Stack>
                </Box>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <IconButton
                onClick={() => handleOpenStockModal(producto)}
                color='info'
                title='Ver Stock'
              >
                <Inventory />
              </IconButton>
              <IconButton onClick={() => handleOpenProductModal(producto)}>
                <Edit />
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderProductTable = (productosToRender: any[]) => (
    <Card>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '80px' }}>Imagen</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell align='right'>Precio</TableCell>
              <TableCell align='center'>Stock</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align='right'>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productosToRender.map(producto => (
              <TableRow key={producto.id}>
                <TableCell>
                  <Avatar
                    src={
                      producto.url_imagen || 'https://via.placeholder.com/150'
                    }
                    alt={producto.nombre}
                    variant='rounded'
                    sx={{
                      filter: producto.activo ? 'none' : 'grayscale(100%)',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant='body1' fontWeight='500'>
                    {producto.nombre}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {producto.descripcion?.substring(0, 50)}
                    {producto.descripcion?.length > 50 ? '...' : ''}
                  </Typography>
                </TableCell>
                <TableCell>
                  {producto.categorias?.nombre || DEFAULT_CATEGORY_NAME}
                </TableCell>
                <TableCell align='right'>
                  {producto.precio_con_igv ? (
                    <Stack alignItems='flex-end'>
                      <Typography
                        variant='body1'
                        fontWeight='bold'
                        color='primary'
                      >
                        S/ {Number(producto.precio_con_igv).toFixed(2)}
                      </Typography>
                      {producto.precio_sin_igv && (
                        <Typography variant='caption' color='text.secondary'>
                          Sin IGV: S/{' '}
                          {Number(producto.precio_sin_igv).toFixed(2)}
                        </Typography>
                      )}
                    </Stack>
                  ) : (
                    <Typography variant='caption' color='text.secondary'>
                      Sin precio
                    </Typography>
                  )}
                </TableCell>
                <TableCell align='center'>
                  {productStockInfo[producto.id] ? (
                    <Stack alignItems='center' spacing={0.5}>
                      <Typography
                        variant='body2'
                        fontWeight='bold'
                        color={
                          productStockInfo[producto.id]
                            .sucursales_stock_critico > 0
                            ? 'error'
                            : productStockInfo[producto.id]
                                .sucursales_stock_bajo > 0
                            ? 'warning.main'
                            : 'success.main'
                        }
                      >
                        {productStockInfo[producto.id].stock_total || 0}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {productStockInfo[producto.id].sucursales_con_stock ||
                          0}{' '}
                        sucursales
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant='caption' color='text.secondary'>
                      Sin datos
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Stack direction='row' spacing={1} flexWrap='wrap'>
                    <Chip
                      label={producto.activo ? 'Activo' : 'Inactivo'}
                      color={producto.activo ? 'success' : 'default'}
                      size='small'
                    />
                    {producto.es_destacado && (
                      <Chip
                        icon={<Star />}
                        label='Destacado'
                        color='warning'
                        size='small'
                      />
                    )}
                    {producto.es_mas_pedido && (
                      <Chip
                        icon={<LocalFireDepartment />}
                        label='Más Pedido'
                        color='error'
                        size='small'
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell align='right'>
                  <IconButton
                    onClick={() => handleOpenStockModal(producto)}
                    color='info'
                    title='Ver Stock'
                  >
                    <Inventory />
                  </IconButton>
                  <IconButton
                    size='small'
                    onClick={() => handleOpenProductModal(producto)}
                  >
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );

  // Stock management functions
  const handleOpenStockModal = async (producto: any) => {
    setSelectedProductForStock(producto);
    setOpenStockModal(true);
    await fetchProductStock(producto.id);
  };

  const handleCloseStockModal = () => {
    setOpenStockModal(false);
    setSelectedProductForStock(null);
    setStockData([]);
    setStockSummary(null);
  };

  const fetchProductStock = async (productId: number) => {
    setStockLoading(true);
    try {
      // Obtener resumen de stock
      const { data: summaryData, error: summaryError } = await supabase.rpc(
        'obtener_stock_producto_total',
        { p_producto_id: productId }
      );

      if (summaryError) {
        console.error('Error fetching stock summary:', summaryError);
      } else {
        setStockSummary(summaryData?.[0] || null);
      }

      // Obtener detalle por sucursales
      const { data: detailData, error: detailError } = await supabase.rpc(
        'obtener_stock_producto_por_sucursales',
        { p_producto_id: productId }
      );

      if (detailError) {
        console.error('Error fetching stock detail:', detailError);
      } else {
        setStockData(detailData || []);
      }
    } catch (error) {
      console.error('Error fetching product stock:', error);
    } finally {
      setStockLoading(false);
    }
  };

  return (
    <Container maxWidth='lg' sx={{ py: 3 }}>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={{ mb: 4 }}
      >
        <Typography variant='h4' fontWeight='bold'>
          Gestión de Productos
        </Typography>
        <Stack direction='row' spacing={1} alignItems='center'>
          <FormControl sx={{ m: 1, minWidth: 150 }} size='small'>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={selectedCategoryId}
              label='Categoría'
              onChange={e => setSelectedCategoryId(e.target.value)}
            >
              <MenuItem value=''>
                <em>Todas</em>
              </MenuItem>
              {categorias.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={groupingEnabled}
                onChange={e => setGroupingEnabled(e.target.checked)}
              />
            }
            label='Agrupar'
          />
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newView) => {
              if (newView) setViewMode(newView);
            }}
            aria-label='text alignment'
          >
            <ToggleButton value='grid' aria-label='grid view'>
              <ViewModule />
            </ToggleButton>
            <ToggleButton value='table' aria-label='table view'>
              <ViewList />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={() => handleOpenProductModal()}
          >
            Crear Producto
          </Button>
          <Button variant='outlined' onClick={handleOpenCategoryModal}>
            Gestionar Categorías
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : groupingEnabled && groupedProductos ? (
        Object.entries(groupedProductos).map(
          ([categoryName, productsInCategory]) => (
            <Box key={categoryName} sx={{ mb: 4 }}>
              <Typography
                variant='h5'
                component='div'
                sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}
              >
                {categoryName} ({(productsInCategory as any[]).length})
              </Typography>
              {viewMode === 'grid'
                ? renderProductGrid(productsInCategory as any[])
                : renderProductTable(productsInCategory as any[])}
            </Box>
          )
        )
      ) : viewMode === 'grid' ? (
        renderProductGrid(displayedProductos)
      ) : (
        renderProductTable(displayedProductos)
      )}

      {inactiveProductos.length > 0 && (
        <Accordion sx={{ mt: 4 }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls='inactive-products-content'
            id='inactive-products-header'
          >
            <Typography>
              Ver Productos Inactivos ({inactiveProductos.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {viewMode === 'grid'
              ? renderProductGrid(inactiveProductos)
              : renderProductTable(inactiveProductos)}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Product Modal */}
      <Modal open={openProductModal} onClose={handleCloseProductModal}>
        <Box sx={style}>
          <Typography variant='h6' component='h2' sx={{ mb: 2 }}>
            {isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </Typography>
          <Stack spacing={2}>
            {formError && <Alert severity='error'>{formError}</Alert>}
            <TextField
              label='Nombre'
              name='nombre'
              value={productInForm.nombre}
              onChange={handleInputChange}
              required
            />
            <TextField
              label='Descripción'
              name='descripcion'
              value={productInForm.descripcion}
              onChange={handleInputChange}
              multiline
              rows={3}
            />
            <FormControl fullWidth required>
              <InputLabel>Categoría</InputLabel>
              <Select
                name='categoria_id'
                value={productInForm.categoria_id}
                label='Categoría'
                onChange={handleInputChange as any}
              >
                {categorias.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack
              direction='row'
              spacing={1}
              justifyContent='space-between'
              alignItems='center'
              sx={{ mt: 1 }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={productInForm.activo}
                    onChange={handleInputChange}
                    name='activo'
                  />
                }
                label='Activo'
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={productInForm.es_destacado || false}
                    onChange={handleInputChange}
                    name='es_destacado'
                  />
                }
                label='Producto Destacado'
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={productInForm.es_mas_pedido || false}
                    onChange={handleInputChange}
                    name='es_mas_pedido'
                  />
                }
                label='Producto Más Pedido'
              />
            </Stack>

            <Button
              variant='outlined'
              component='label'
              startIcon={<CloudUpload />}
            >
              Subir Imagen Principal
              <input
                type='file'
                hidden
                onChange={handleMainFileChange}
                accept='image/*'
              />
            </Button>

            {mainImageFile ? (
              <Box sx={{ mt: 1 }}>
                <Typography variant='caption'>Vista previa:</Typography>
                <CardMedia
                  component='img'
                  height='100'
                  image={URL.createObjectURL(mainImageFile)}
                  alt='Vista previa'
                />
              </Box>
            ) : (
              productInForm.url_imagen && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant='caption'>Imagen actual:</Typography>
                  <CardMedia
                    component='img'
                    height='100'
                    image={productInForm.url_imagen}
                    alt='Imagen actual'
                  />
                </Box>
              )
            )}

            <Button
              variant='outlined'
              component='label'
              startIcon={<CloudUpload />}
            >
              Subir Imágenes Extra
              <input
                type='file'
                hidden
                onChange={handleExtraFilesChange}
                accept='image/*'
                multiple
              />
            </Button>

            {extraImageFiles.length > 0 && (
              <Box>
                <Typography variant='subtitle2' sx={{ mt: 1 }}>
                  Nuevas imágenes a subir:
                </Typography>
                <Grid container spacing={1}>
                  {extraImageFiles.map((file, index) => (
                    <Grid item key={index}>
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component='img'
                          height='60'
                          image={URL.createObjectURL(file)}
                          alt={`Preview ${index}`}
                        />
                        <IconButton
                          size='small'
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bgcolor: 'rgba(255,255,255,0.7)',
                          }}
                          onClick={() => handleRemoveNewExtraImage(index)}
                        >
                          <Delete fontSize='small' />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {productInForm.extra_imagenes_urls?.length > 0 && (
              <Box>
                <Typography variant='subtitle2' sx={{ mt: 1 }}>
                  Imágenes existentes:
                </Typography>
                <Grid container spacing={1}>
                  {productInForm.extra_imagenes_urls.map(
                    (url: string, index: number) => (
                      <Grid item key={index}>
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component='img'
                            height='60'
                            image={url}
                            alt={`Extra ${index}`}
                          />
                          <IconButton
                            size='small'
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              bgcolor: 'rgba(255,255,255,0.7)',
                            }}
                            onClick={() => handleRemoveExtraImage(index)}
                          >
                            <Delete fontSize='small' />
                          </IconButton>
                        </Box>
                      </Grid>
                    )
                  )}
                </Grid>
              </Box>
            )}

            <Typography
              variant='subtitle2'
              sx={{ mt: 2, color: TEXT_SECONDARY_COLOR }}
            >
              Niveles de Stock
            </Typography>
            <Tooltip
              title='Nivel de inventario en el que se considera que las existencias son bajas y se necesita reabastecimiento.'
              arrow
            >
              <TextField
                label='Stock Bajo'
                name='stock_bajo'
                type='number'
                value={productInForm.stock_bajo}
                onChange={handleInputChange}
              />
            </Tooltip>
            <Tooltip
              title='Rango óptimo de inventario que equilibra los costos de almacenamiento y la demanda del cliente.'
              arrow
            >
              <TextField
                label='Stock Eficiente'
                name='stock_eficiente'
                type='number'
                value={productInForm.stock_eficiente}
                onChange={handleInputChange}
              />
            </Tooltip>
            <Tooltip
              title='Cantidad sugerida de stock a mantener, calculada para maximizar la rentabilidad y minimizar el riesgo de agotamiento.'
              arrow
            >
              <TextField
                label='Stock Recomendado'
                name='stock_recomendado'
                type='number'
                value={productInForm.stock_recomendado}
                onChange={handleInputChange}
              />
            </Tooltip>

            <Typography
              variant='subtitle2'
              sx={{ mt: 2, color: TEXT_SECONDARY_COLOR }}
            >
              Sistema de Precios
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label='Precio de Costo'
                  name='precio_costo'
                  type='number'
                  value={productInForm.precio_costo || ''}
                  onChange={handleInputChange}
                  InputProps={{ startAdornment: CURRENCY_PREFIX }}
                  helperText='Costo de adquisición del producto'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label='Precio Sin IGV'
                  name='precio_sin_igv'
                  type='number'
                  value={productInForm.precio_sin_igv || ''}
                  onChange={handleInputChange}
                  InputProps={{ startAdornment: CURRENCY_PREFIX }}
                  helperText='Precio base sin impuestos'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label='IGV (%)'
                  name='igv_porcentaje'
                  type='number'
                  value={productInForm.igv_porcentaje || 18}
                  onChange={handleInputChange}
                  InputProps={{ endAdornment: '%' }}
                  helperText='Porcentaje de IGV aplicable'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label='Precio Con IGV'
                  name='precio_con_igv'
                  type='number'
                  value={productInForm.precio_con_igv || ''}
                  onChange={handleInputChange}
                  InputProps={{ startAdornment: CURRENCY_PREFIX }}
                  helperText='Precio final con impuestos'
                />
              </Grid>
            </Grid>

            <Typography
              variant='subtitle2'
              sx={{ mt: 2, color: TEXT_SECONDARY_COLOR }}
            >
              Precios Especiales
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label='Precio Mayorista'
                  name='precio_mayorista'
                  type='number'
                  value={productInForm.precio_mayorista || ''}
                  onChange={handleInputChange}
                  InputProps={{ startAdornment: CURRENCY_PREFIX }}
                  helperText='Precio para ventas al por mayor'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label='Precio Minorista'
                  name='precio_minorista'
                  type='number'
                  value={productInForm.precio_minorista || ''}
                  onChange={handleInputChange}
                  InputProps={{ startAdornment: CURRENCY_PREFIX }}
                  helperText='Precio para ventas al por menor'
                />
              </Grid>
            </Grid>

            <Button onClick={handleSubmit} variant='contained' sx={{ mt: 2 }}>
              {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Category Management Modal */}
      <Modal open={openCategoryModal} onClose={handleCloseCategoryModal}>
        <Box sx={style}>
          <Typography variant='h6' component='h2' sx={{ mb: 2 }}>
            Gestionar Categorías
          </Typography>
          <Stack spacing={2}>
            <List>
              {categorias.map(cat => (
                <ListItem
                  key={cat.id}
                  secondaryAction={
                    <IconButton
                      edge='end'
                      aria-label='delete'
                      onClick={() => handleDeleteCategoryRequest(cat)}
                    >
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemText primary={cat.nombre} />
                </ListItem>
              ))}
            </List>
            <Divider />
            <Typography variant='subtitle1'>Añadir Nueva Categoría</Typography>
            <TextField
              label='Nombre de la categoría'
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              variant='outlined'
              size='small'
            />
            <Button onClick={handleCreateCategory} variant='contained'>
              Añadir
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar la categoría{' '}
            <strong>{categoryToDelete?.nombre}</strong>? Esta acción no se puede
            deshacer.
          </DialogContentText>
          {productsToDelete.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography color='error'>
                Los siguientes productos también serán eliminados:
              </Typography>
              <List dense>
                {productsToDelete.map(p => (
                  <ListItem key={p.nombre}>
                    <ListItemText primary={p.nombre} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={confirmDeleteCategory} color='error'>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Modal */}
      <Dialog
        open={openStockModal}
        onClose={handleCloseStockModal}
        maxWidth='lg'
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='h6'>
              Stock del Producto: {selectedProductForStock?.nombre}
            </Typography>
            {stockSummary && (
              <Stack direction='row' spacing={1}>
                <Chip
                  label={`Total: ${stockSummary.stock_total}`}
                  color='primary'
                  variant='outlined'
                  size='small'
                />
                <Chip
                  label={`${stockSummary.sucursales_con_stock} sucursales`}
                  color='info'
                  variant='outlined'
                  size='small'
                />
              </Stack>
            )}
          </Stack>
        </DialogTitle>
        <DialogContent>
          {stockLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Resumen de Stock */}
              {stockSummary && (
                <Card sx={{ mb: 3, p: 2, bgcolor: 'grey.50' }}>
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    gutterBottom
                  >
                    Resumen Nacional:
                  </Typography>
                  <Stack direction='row' spacing={3} flexWrap='wrap'>
                    <Chip
                      label={`Stock Total: ${stockSummary.stock_total}`}
                      color='primary'
                      variant='filled'
                      size='small'
                    />
                    <Chip
                      label={`${stockSummary.sucursales_con_stock} con stock`}
                      color='success'
                      variant='outlined'
                      size='small'
                    />
                    <Chip
                      label={`${stockSummary.sucursales_stock_bajo} stock bajo`}
                      color='warning'
                      variant='outlined'
                      size='small'
                    />
                    <Chip
                      label={`${stockSummary.sucursales_stock_critico} sin stock`}
                      color='error'
                      variant='outlined'
                      size='small'
                    />
                  </Stack>
                </Card>
              )}

              {/* Detalle por Sucursales */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sucursal</TableCell>
                      <TableCell>Ubicación</TableCell>
                      <TableCell align='center'>Stock Actual</TableCell>
                      <TableCell align='center'>Stock Mínimo</TableCell>
                      <TableCell align='center'>Stock Máximo</TableCell>
                      <TableCell align='center'>Estado</TableCell>
                      <TableCell align='center'>Última Actualización</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockData.map((item, index) => (
                      <TableRow
                        key={`${item.sucursal_id}-${index}`}
                        sx={{
                          backgroundColor:
                            item.estado_stock === 'critico'
                              ? 'error.light'
                              : item.estado_stock === 'bajo'
                              ? 'warning.light'
                              : 'transparent',
                          opacity: item.estado_stock === 'critico' ? 0.7 : 1,
                        }}
                      >
                        <TableCell>
                          <Typography variant='body2' fontWeight='500'>
                            {item.sucursal_nombre}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption' color='text.secondary'>
                            {item.departamento}, {item.provincia}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography
                            variant='h6'
                            color={
                              item.estado_stock === 'critico'
                                ? 'error'
                                : item.estado_stock === 'bajo'
                                ? 'warning.main'
                                : 'text.primary'
                            }
                            fontWeight='bold'
                          >
                            {item.cantidad_actual}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant='body2' color='text.secondary'>
                            {item.stock_minimo}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant='body2' color='text.secondary'>
                            {item.stock_maximo}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={
                              item.estado_stock === 'critico'
                                ? 'Sin Stock'
                                : item.estado_stock === 'bajo'
                                ? 'Stock Bajo'
                                : 'Normal'
                            }
                            color={
                              item.estado_stock === 'critico'
                                ? 'error'
                                : item.estado_stock === 'bajo'
                                ? 'warning'
                                : 'success'
                            }
                            size='small'
                          />
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant='caption' color='text.secondary'>
                            {item.ultima_actualizacion
                              ? new Date(
                                  item.ultima_actualizacion
                                ).toLocaleDateString('es-PE', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Sin datos'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {stockData.length === 0 && !stockLoading && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant='body1' color='text.secondary'>
                    No hay datos de stock para este producto en ninguna
                    sucursal.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStockModal}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductosPage;
