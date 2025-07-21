import {
  Directions,
  EmojiEvents,
  ExpandMore,
  Groups,
  LocalShipping,
  LocationOn,
  Map as MapIcon,
  Phone,
  Refresh,
  Security,
  ShoppingCart,
  Store,
  StoreMallDirectory,
  TrendingUp,
  Verified,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import PeruMap from '../components/PeruMap';
import ProductCarousel from '../components/ProductCarousel';
import { getStockStatusColor } from '../config/mapbox.config';
import { supabase } from '../config/supabase.config';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock_total: number;
  disponible: boolean;
  rating_promedio: number;
  veces_solicitado: number;
  es_destacado: boolean;
  url_imagen?: string;
}

interface EstadisticasEmpresa {
  total_sucursales: number;
  total_departamentos: number;
  total_empleados: number;
  anos_experiencia: number;
}

interface SucursalMapa {
  departamento_id: number;
  departamento_nombre: string;
  total_sucursales: number;
  sucursales_activas: number;
  provincias_con_sucursales: number;
  sucursales_detalle: any[];
}

const HomePage = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasEmpresa | null>(
    null
  );
  const [sucursalesMapa, setSucursalesMapa] = useState<SucursalMapa[]>([]);
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(
    false
  );

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Obtener productos destacados
      const { data: productosData, error: productosError } = await supabase.rpc(
        'obtener_productos_homepage'
      );

      if (productosError) {
        console.error('Error fetching productos:', productosError);
        throw new Error('Error al cargar productos');
      }

      // 🛡️ PROCESAMIENTO SEGURO DE DATOS DE PRODUCTOS
      console.log('🔍 HomePage - Datos de productos recibidos:', productosData);

      let productosProcessed = [];

      if (
        productosData &&
        Array.isArray(productosData) &&
        productosData.length > 0
      ) {
        // La función RPC devuelve un array con un objeto que contiene la propiedad con los productos
        const primerElemento = productosData[0];
        if (primerElemento && primerElemento.obtener_productos_homepage) {
          productosProcessed = primerElemento.obtener_productos_homepage;
        } else {
          // Si la estructura es diferente, tratar como array directo
          productosProcessed = productosData;
        }
      }

      console.log('✅ HomePage - Productos procesados:', productosProcessed);
      setProductos(Array.isArray(productosProcessed) ? productosProcessed : []);

      // 2. Obtener estadísticas de la empresa
      const { data: estadisticasData, error: estadisticasError } =
        await supabase.rpc('obtener_estadisticas_empresa');

      if (estadisticasError) {
        console.error('Error fetching estadisticas:', estadisticasError);
        throw new Error('Error al cargar estadísticas');
      }

      setEstadisticas(estadisticasData?.[0] || null);

      // 3. Obtener datos de sucursales para el mapa
      const { data: sucursalesData, error: sucursalesError } =
        await supabase.rpc('obtener_sucursales_mapa_homepage');

      if (sucursalesError) {
        console.error('Error fetching sucursales:', sucursalesError);
        throw new Error('Error al cargar sucursales');
      }

      setSucursalesMapa(sucursalesData || []);

      // 4. Cargar el archivo GeoJSON y fusionar con datos de sucursales
      const geoJsonResponse = await fetch('/data/peru_departamentos.geojson');
      const geojsonData = await geoJsonResponse.json();

      // Fusionar los datos de sucursales con el GeoJSON
      const enrichedFeatures = geojsonData.features.map((feature: any) => {
        const departmentName = feature.properties?.NOMBDEP;
        if (!departmentName) return feature;

        const sucursalInfo = (sucursalesData || []).find(
          (s: any) =>
            s.departamento_nombre &&
            s.departamento_nombre.toLowerCase() === departmentName.toLowerCase()
        );

        // Determinar el estado basado en la presencia de sucursales
        let estadoGeneral = 'sin_datos';
        if (sucursalInfo) {
          if (sucursalInfo.sucursales_activas > 0) {
            estadoGeneral = 'con_sucursales';
          } else {
            estadoGeneral = 'inactiva';
          }
        }

        // Usar los colores predeterminados del sistema
        let colorFinal = getStockStatusColor('sin_datos'); // Gris predeterminado #CFD8DC
        if (sucursalInfo && sucursalInfo.sucursales_activas > 0) {
          colorFinal = '#d32f2f'; // Rojo para departamentos con sucursales activas
        }

        feature.properties = {
          ...feature.properties,
          tiene_sucursales: !!sucursalInfo,
          total_sucursales: sucursalInfo?.total_sucursales || 0,
          sucursales_activas: sucursalInfo?.sucursales_activas || 0,
          provincias_con_sucursales:
            sucursalInfo?.provincias_con_sucursales || 0,
          sucursales_detalle: sucursalInfo?.sucursales_detalle || [],
          estado_general: estadoGeneral,
          color_calculado: colorFinal,
        };
        return feature;
      });

      geojsonData.features = enrichedFeatures;
      setMapData(geojsonData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Error al cargar los datos');
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

  // Mapa no interactivo para HomePage
  const handleRegionClick = (_department: any) => {
    // No hacer nada - mapa no interactivo
  };

  const estadisticasDisplay = useMemo(() => {
    if (!estadisticas) return [];

    return [
      {
        icon: <StoreMallDirectory sx={{ fontSize: 40 }} />,
        numero: `${estadisticas.total_sucursales}+`,
        texto: 'Sucursales',
      },
      {
        icon: <LocationOn sx={{ fontSize: 40 }} />,
        numero: `${estadisticas.total_departamentos}`,
        texto: 'Departamentos',
      },
      {
        icon: <Groups sx={{ fontSize: 40 }} />,
        numero: `${estadisticas.total_empleados}+`,
        texto: 'Empleados',
      },
      {
        icon: <EmojiEvents sx={{ fontSize: 40 }} />,
        numero: `${estadisticas.anos_experiencia}+`,
        texto: 'Años de Experiencia',
      },
    ];
  }, [estadisticas]);

  const valores = [
    {
      icon: <Verified />,
      titulo: 'Calidad Universitaria',
      descripcion: 'Productos elaborados con estándares académicos',
    },
    {
      icon: <Security />,
      titulo: 'Saludable por Naturaleza',
      descripcion: 'Ingredientes naturales y nutritivos',
    },
    {
      icon: <TrendingUp />,
      titulo: 'Innovación Constante',
      descripcion: 'Nuevos productos y sabores',
    },
    {
      icon: <LocalShipping />,
      titulo: 'Distribución Nacional',
      descripcion: 'Supermercados, bodegas y delivery',
    },
  ];

  const departamentosConSucursales = useMemo(() => {
    return sucursalesMapa.filter(s => s.sucursales_activas > 0);
  }, [sucursalesMapa]);

  // Función para generar enlace de Google Maps
  const generateGoogleMapsLink = (latitud: number, longitud: number) => {
    if (!latitud || !longitud) return null;

    // Crear enlace directo con coordenadas para mayor precisión
    return `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`;
  };

  // Función para abrir Google Maps
  const openGoogleMaps = (
    latitud: number,
    longitud: number,
    nombre: string,
    direccion: string
  ) => {
    const link = generateGoogleMapsLink(latitud, longitud);
    if (link) {
      window.open(link, '_blank');
    } else {
      // Fallback: buscar por nombre y dirección
      const fallbackQuery = encodeURIComponent(`${nombre} ${direccion}`);
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${fallbackQuery}`,
        '_blank'
      );
    }
  };

  if (error) {
    return (
      <Layout>
        <Container maxWidth='lg' sx={{ py: 8 }}>
          <Alert
            severity='error'
            action={
              <Button color='inherit' size='small' onClick={handleRefresh}>
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section Profesional */}
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
        }}
      >
        <Container maxWidth='lg'>
          <Grid container spacing={8} alignItems='center'>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography
                  variant='h1'
                  component='h1'
                  gutterBottom
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '3rem', md: '4.5rem' },
                    lineHeight: 1.1,
                    mb: 3,
                    color: 'white',
                  }}
                >
                  Unión
                </Typography>
                <Typography
                  variant='h4'
                  gutterBottom
                  sx={{
                    fontWeight: 300,
                    mb: 3,
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: { xs: '1.5rem', md: '2rem' },
                  }}
                >
                  Saludable por Naturaleza
                </Typography>
                <Typography
                  variant='h6'
                  sx={{
                    mb: 5,
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.6,
                    maxWidth: 500,
                    fontWeight: 400,
                  }}
                >
                  Centro Universitario de Producción de Bienes Unión de la UPeU.
                  Más de 75 años elaborando productos saludables y naturales con
                  la más alta calidad para todas las familias peruanas.
                </Typography>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{ mb: 4 }}
                >
                  {valores.slice(0, 2).map(valor => (
                    <Paper
                      key={`valor-hero-${valor.titulo
                        .replace(/\s+/g, '-')
                        .toLowerCase()}`}
                      elevation={0}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        p: 1.5,
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      {valor.icon}
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {valor.titulo}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', position: 'relative' }}>
                <Paper
                  elevation={8}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundColor: 'white',
                  }}
                >
                  <Box
                    component='img'
                    src='https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=400&fit=crop'
                    alt='Panadería Unión - Productos Naturales'
                    sx={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Estadísticas */}
      <Box sx={{ py: 8, backgroundColor: 'white' }}>
        <Container maxWidth='lg'>
          <Stack
            direction='row'
            alignItems='center'
            justifyContent='space-between'
            sx={{ mb: 6 }}
          >
            <Typography
              variant='h4'
              component='h2'
              sx={{
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              Nuestra Presencia Nacional
            </Typography>

            <Tooltip title='Actualizar datos'>
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                color='primary'
                size='large'
              >
                {refreshing ? <CircularProgress size={24} /> : <Refresh />}
              </IconButton>
            </Tooltip>
          </Stack>

          <Grid container spacing={4}>
            {loading
              ? Array.from({ length: 4 }).map((_, loadingIndex) => (
                  <Grid item xs={6} md={3} key={`loading-stat-${loadingIndex}`}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'grey.200',
                      }}
                    >
                      <CircularProgress size={40} sx={{ mb: 2 }} />
                      <Typography variant='body1' color='text.secondary'>
                        Cargando...
                      </Typography>
                    </Paper>
                  </Grid>
                ))
              : estadisticasDisplay.map(stat => (
                  <Grid
                    item
                    xs={6}
                    md={3}
                    key={`estadistica-${stat.texto
                      .replace(/\s+/g, '-')
                      .toLowerCase()}`}
                  >
                    <Paper
                      elevation={2}
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        border: '1px solid',
                        borderColor: 'grey.200',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <Box sx={{ color: 'primary.main', mb: 2 }}>
                        {stat.icon}
                      </Box>
                      <Typography
                        variant='h3'
                        sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}
                      >
                        {stat.numero}
                      </Typography>
                      <Typography
                        variant='body1'
                        color='text.secondary'
                        sx={{ fontWeight: 500 }}
                      >
                        {stat.texto}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
          </Grid>
        </Container>
      </Box>

      {/* Mapa de Sucursales */}
      <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth='xl'>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant='h3'
              component='h2'
              gutterBottom
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 2,
              }}
            >
              Nuestras Sucursales
            </Typography>
            <Typography
              variant='h6'
              color='text.secondary'
              sx={{ maxWidth: 600, mx: 'auto', fontWeight: 400 }}
            >
              Encuentra la sucursal más cercana a ti. Estamos presentes en los
              principales departamentos del Perú
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Mapa */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                  <Box
                    sx={{
                      height: { xs: 450, sm: 550, md: 650, lg: 700 },
                      position: 'relative',
                      borderRadius: 2,
                      overflow: 'hidden',
                      width: '100%',
                    }}
                  >
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
                        <Stack alignItems='center' spacing={2}>
                          <CircularProgress size={40} />
                          <Typography variant='body1' color='text.secondary'>
                            Cargando mapa de sucursales...
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                    {mapData && (
                      <PeruMap
                        data={mapData}
                        onDepartmentClick={handleRegionClick}
                        showControls={false}
                        height='100%'
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Panel de Información Simplificado */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={3}>
                {/* Lista de Departamentos con Sucursales */}
                <Card>
                  <CardContent>
                    <Stack
                      direction='row'
                      alignItems='center'
                      spacing={2}
                      sx={{ mb: 2 }}
                    >
                      <MapIcon color='error' />
                      <Typography variant='h6' fontWeight='bold'>
                        Nuestras Sucursales
                      </Typography>
                    </Stack>

                    {departamentosConSucursales.map(dept => (
                      <Accordion
                        key={`departamento-${dept.departamento_id}`}
                        sx={{ mb: 1 }}
                        expanded={
                          expandedAccordion === dept.departamento_id.toString()
                        }
                        onChange={(_, isExpanded) => {
                          setExpandedAccordion(
                            isExpanded ? dept.departamento_id.toString() : false
                          );
                        }}
                      >
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Stack
                            direction='row'
                            justifyContent='space-between'
                            alignItems='center'
                            sx={{ width: '100%', pr: 2 }}
                          >
                            <Typography variant='subtitle1' fontWeight='600'>
                              {dept.departamento_nombre}
                            </Typography>
                            <Chip
                              label={`${dept.sucursales_activas} sucursal${
                                dept.sucursales_activas !== 1 ? 'es' : ''
                              }`}
                              color='error'
                              size='small'
                            />
                          </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List dense>
                            {dept.sucursales_detalle
                              .filter(
                                (sucursal: any) => sucursal.estado === 'activa'
                              )
                              .map((sucursal: any) => (
                                <ListItem
                                  key={`sucursal-${sucursal.id}`}
                                  sx={{ px: 0 }}
                                >
                                  <ListItemText
                                    primary={
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1,
                                        }}
                                      >
                                        <Store
                                          color='action'
                                          fontSize='small'
                                        />
                                        <Typography
                                          variant='body2'
                                          fontWeight='600'
                                        >
                                          {sucursal.nombre}
                                        </Typography>
                                        {sucursal.latitud &&
                                          sucursal.longitud && (
                                            <Chip
                                              label='GPS'
                                              size='small'
                                              color='success'
                                              variant='outlined'
                                              sx={{
                                                fontSize: '0.6rem',
                                                height: 16,
                                              }}
                                            />
                                          )}
                                      </Box>
                                    }
                                    secondary={
                                      <Box sx={{ mt: 1 }}>
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            mb: 0.5,
                                          }}
                                        >
                                          <LocationOn
                                            color='action'
                                            fontSize='small'
                                          />
                                          <Typography
                                            variant='caption'
                                            color='text.secondary'
                                          >
                                            {sucursal.direccion}
                                          </Typography>
                                        </Box>
                                        <Typography
                                          variant='caption'
                                          color='text.secondary'
                                        >
                                          {sucursal.provincia}
                                        </Typography>
                                      </Box>
                                    }
                                    primaryTypographyProps={{
                                      component: 'div',
                                    }}
                                    secondaryTypographyProps={{
                                      component: 'div',
                                    }}
                                  />
                                  {sucursal.latitud && sucursal.longitud && (
                                    <Tooltip
                                      title={
                                        <Stack spacing={0.5}>
                                          <Typography
                                            variant='caption'
                                            fontWeight='600'
                                          >
                                            Ver en Google Maps
                                          </Typography>
                                          <Typography
                                            variant='caption'
                                            color='inherit'
                                          >
                                            Coordenadas:{' '}
                                            {parseFloat(
                                              sucursal.latitud
                                            ).toFixed(4)}
                                            ,{' '}
                                            {parseFloat(
                                              sucursal.longitud
                                            ).toFixed(4)}
                                          </Typography>
                                        </Stack>
                                      }
                                      arrow
                                    >
                                      <IconButton
                                        size='small'
                                        color='primary'
                                        onClick={() =>
                                          openGoogleMaps(
                                            parseFloat(sucursal.latitud),
                                            parseFloat(sucursal.longitud),
                                            sucursal.nombre,
                                            sucursal.direccion
                                          )
                                        }
                                      >
                                        <Directions fontSize='small' />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </ListItem>
                              ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </CardContent>
                </Card>

                {/* Información de Contacto */}
                <Card>
                  <CardContent>
                    <Typography variant='h6' fontWeight='bold' sx={{ mb: 2 }}>
                      ¿Buscas una sucursal?
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mb: 3 }}
                    >
                      Encuentra la sucursal más cercana a ti y disfruta de
                      nuestros productos frescos y naturales.
                    </Typography>

                    <Button
                      variant='contained'
                      color='primary'
                      fullWidth
                      startIcon={<MapIcon />}
                      onClick={() =>
                        window.open(
                          'https://www.google.com/maps/search/Panadería+Unión+Perú',
                          '_blank'
                        )
                      }
                      sx={{ mb: 2 }}
                    >
                      Buscar en Google Maps
                    </Button>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={1}>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        fontWeight='600'
                      >
                        CONTACTO DIRECTO
                      </Typography>
                      <Stack direction='row' alignItems='center' spacing={1}>
                        <Phone color='action' fontSize='small' />
                        <Typography variant='body2'>(01) 619-9288</Typography>
                      </Stack>
                      <Typography variant='body2' color='text.secondary'>
                        atencionalcliente@union.pe
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Productos Destacados */}
      <Box sx={{ py: 8, backgroundColor: 'white' }}>
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant='h3'
              component='h2'
              gutterBottom
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 2,
              }}
            >
              Nuestros Productos
            </Typography>
            <Typography
              variant='h6'
              color='text.secondary'
              sx={{ maxWidth: 600, mx: 'auto', fontWeight: 400 }}
            >
              Descubre nuestra amplia gama de productos naturales y saludables,
              elaborados con los mejores ingredientes
            </Typography>
          </Box>

          {loading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 8 }).map((_, productLoadingIndex) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
                  key={`product-skeleton-${productLoadingIndex}`}
                >
                  <Card sx={{ height: '100%', borderRadius: 3 }}>
                    <Box
                      sx={{
                        height: 180,
                        bgcolor: 'grey.200',
                        position: 'relative',
                      }}
                    >
                      <CircularProgress
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    </Box>
                    <CardContent sx={{ p: 1 }}>
                      <Box
                        sx={{
                          height: 20,
                          bgcolor: 'grey.200',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      />
                      <Box
                        sx={{
                          height: 40,
                          bgcolor: 'grey.100',
                          borderRadius: 1,
                          mb: 2,
                        }}
                      />
                      <Box
                        sx={{
                          height: 20,
                          bgcolor: 'grey.200',
                          borderRadius: 1,
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <ProductCarousel productos={productos} />
          )}
        </Container>
      </Box>

      {/* Call to Action - Delivery */}
      <Box sx={{ py: 8, backgroundColor: 'primary.main', color: 'white' }}>
        <Container maxWidth='lg'>
          <Grid container spacing={6} alignItems='center'>
            <Grid item xs={12} md={8}>
              <Typography
                variant='h3'
                component='h2'
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  mb: 2,
                }}
              >
                ¡Haz tu Pedido Online!
              </Typography>
              <Typography
                variant='h6'
                sx={{ mb: 3, color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}
              >
                Visita nuestra tienda virtual y descubre las ofertas especiales
                que tenemos para ti. Delivery disponible en Lima y provincias.
              </Typography>
              <Stack direction='row' spacing={2} flexWrap='wrap'>
                <Chip
                  icon={<LocalShipping />}
                  label='Delivery Disponible'
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  icon={<Phone />}
                  label='(01) 619-9288'
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  icon={<ShoppingCart />}
                  label='Ofertas Especiales'
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <Button
                  variant='contained'
                  size='large'
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    fontWeight: 700,
                    py: 2,
                    '&:hover': {
                      backgroundColor: 'grey.100',
                      transform: 'translateY(-2px)',
                    },
                  }}
                  startIcon={<ShoppingCart />}
                >
                  Tienda Virtual
                </Button>
                <Button
                  variant='outlined'
                  size='large'
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 600,
                    py: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderColor: 'white',
                    },
                  }}
                  startIcon={<Phone />}
                >
                  Llamar Ahora
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Sección Sobre Nosotros */}
      <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth='lg'>
          <Grid container spacing={8} alignItems='center'>
            <Grid item xs={12} md={6}>
              <Typography
                variant='h3'
                component='h2'
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 3,
                }}
              >
                Nuestra Historia
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  mb: 3,
                  fontSize: '1.1rem',
                  lineHeight: 1.8,
                  color: 'text.secondary',
                }}
              >
                Fundada como Centro Universitario de Producción de Bienes Unión
                de la UPeU, somos una empresa comprometida con la elaboración de
                productos saludables y naturales. Nuestro lema "CADA DÍA ELIJO
                SER SALUDABLE" refleja nuestro compromiso con la salud y
                bienestar de las familias peruanas.
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  mb: 4,
                  fontSize: '1.1rem',
                  lineHeight: 1.8,
                  color: 'text.secondary',
                }}
              >
                Con más de 75 años de experiencia, nos especializamos en panes,
                galletas, bebidas, bollería, cereales, snacks, panetones y
                untables. Contamos con una amplia red de distribución que
                incluye supermercados, bodegas y servicio de delivery a nivel
                nacional.
              </Typography>

              <Grid container spacing={3}>
                {valores.map(valor => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    key={`valor-about-${valor.titulo
                      .replace(/\s+/g, '-')
                      .toLowerCase()}`}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        p: 2,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        borderRadius: 2,
                        backgroundColor: 'white',
                      }}
                    >
                      <Box
                        sx={{
                          color: 'primary.main',
                          backgroundColor: 'primary.light',
                          p: 1,
                          borderRadius: 2,
                          display: 'flex',
                          border: '1px solid',
                          borderColor: 'primary.main',
                        }}
                      >
                        {valor.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant='subtitle2'
                          sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            color: 'text.primary',
                          }}
                        >
                          {valor.titulo}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {valor.descripcion}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', position: 'relative' }}>
                <Paper
                  elevation={4}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  <Box
                    component='img'
                    src='https://gestion.pe/resizer/v2/EIBZBPHPV5HE5L7LPRTAI5GBBU.png?auth=0322bda8bebed4bf377feebccd9d2beb28b4665ac1425b840e2c28f366147108&width=620&quality=75&smart=true'
                    alt='Historia Panadería Unión'
                    sx={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Compromiso con la Industria */}
      <Box sx={{ py: 8, backgroundColor: 'white' }}>
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant='h3'
              component='h2'
              gutterBottom
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 2,
              }}
            >
              Compromiso con la Industria Panadera
            </Typography>
            <Typography
              variant='h6'
              color='text.secondary'
              sx={{ maxWidth: 800, mx: 'auto', fontWeight: 400 }}
            >
              Como parte del Centro Universitario de la UPeU, contribuimos al
              desarrollo de la industria panadera peruana y la formación de
              nuevos profesionales
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  <EmojiEvents sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant='h6' fontWeight='bold' gutterBottom>
                  Formación Académica
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Vinculados a la Universidad Peruana Unión, formamos
                  profesionales en la industria alimentaria con los más altos
                  estándares.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  <Groups sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant='h6' fontWeight='bold' gutterBottom>
                  Apoyo al Gremio
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Colaboramos con ASPAN y otras organizaciones para el
                  desarrollo sostenible de la panadería peruana.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  <TrendingUp sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant='h6' fontWeight='bold' gutterBottom>
                  Innovación Continua
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Investigamos y desarrollamos nuevos productos que respondan a
                  las necesidades nutricionales actuales.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Layout>
  );
};

export default HomePage;
