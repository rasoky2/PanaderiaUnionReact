import {
  ChevronLeft,
  ChevronRight,
  LocalFireDepartment,
  Star,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Paper,
  Rating,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useEffect, useMemo, useRef, useState } from 'react';

// Constantes para evitar duplicación de strings literales
const FONT_SIZE_ICON_SMALL = '16px !important';
const COLOR_WHITE = 'white';
const COLOR_ERROR_MAIN = 'error.main';
const COLOR_WARNING_MAIN = 'warning.main';
const COLOR_PRIMARY_MAIN = 'primary.main';
const TEXT_SECONDARY_COLOR = 'text.secondary';
const TRANSFORM_CENTER_Y = 'translateY(-50%)';
const TRANSFORM_CENTER_Y_SCALE = 'translateY(-50%) scale(1.1)';
const TRANSITION_CUBIC_BEZIER = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

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

interface ProductCarouselProps {
  productos: Producto[];
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ productos }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🛡️ VALIDACIÓN DE SEGURIDAD PARA PREVENIR ERROR REACT #130
  // console.log('🔍 ProductCarousel - Productos recibidos:', productos);

  // Validar que productos existe y es un array
  const productosValidos = useMemo(() => {
    if (!productos || !Array.isArray(productos)) {
      // console.info('⚠️ ProductCarousel: productos es undefined o no es array');
      return [];
    }

    // Filtrar productos válidos para evitar elementos undefined
    return productos.filter(producto => {
      if (!producto || typeof producto !== 'object') {
        // console.info('⚠️ ProductCarousel: producto undefined o inválido:', producto);
        return false;
      }

      // Validar propiedades esenciales
      const esValido =
        producto.id !== undefined &&
        producto.nombre !== undefined &&
        producto.precio !== undefined;

      // if (!esValido) {
      //   console.info('⚠️ ProductCarousel: producto con propiedades undefined:', producto);
      // }

      return esValido;
    });
  }, [productos]);

  // console.info(`✅ ProductCarousel: ${productosValidos.length} productos válidos de ${productos?.length || 0} recibidos`);

  // Determinar cuántos productos mostrar según el tamaño de pantalla
  const getItemsPerView = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 4;
  };

  const itemsPerView = getItemsPerView();
  const maxIndex = Math.max(0, productosValidos.length - itemsPerView);

  // Auto-play del carrusel mejorado
  useEffect(() => {
    if (isAutoPlaying && productosValidos.length > itemsPerView) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex =>
          prevIndex >= maxIndex ? 0 : prevIndex + 1
        );
      }, 5000); // Aumentado a 5 segundos para mejor visualización
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, maxIndex, itemsPerView, productosValidos.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prevIndex => (prevIndex <= 0 ? maxIndex : prevIndex - 1));
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prevIndex => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const formatPrice = (price: number) => {
    return `S/ ${price.toFixed(2)}`;
  };

  const getDiscountPercentage = (producto: Producto) => {
    // Simular descuentos para productos destacados
    if (producto.es_destacado) return 15;
    if (producto.veces_solicitado > 50) return 10;
    return 0;
  };

  // Si no hay productos válidos, mostrar mensaje
  if (productosValidos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant='body1' color='text.secondary'>
          No hay productos válidos para mostrar
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'visible',
        px: { xs: 2, sm: 4 },
        py: 3,
      }}
    >
      {/* Controles de navegación mejorados */}
      {productosValidos.length > itemsPerView && (
        <>
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: { xs: -10, sm: -20 },
              top: '50%',
              transform: TRANSFORM_CENTER_Y,
              zIndex: 3,
              backgroundColor: COLOR_WHITE,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              width: { xs: 45, sm: 55 },
              height: { xs: 45, sm: 55 },
              border: '2px solid',
              borderColor: COLOR_PRIMARY_MAIN,
              '&:hover': {
                backgroundColor: COLOR_PRIMARY_MAIN,
                color: COLOR_WHITE,
                transform: TRANSFORM_CENTER_Y_SCALE,
                boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
              },
              transition: TRANSITION_CUBIC_BEZIER,
            }}
          >
            <ChevronLeft sx={{ fontSize: { xs: 24, sm: 30 } }} />
          </IconButton>

          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: { xs: -10, sm: -20 },
              top: '50%',
              transform: TRANSFORM_CENTER_Y,
              zIndex: 3,
              backgroundColor: COLOR_WHITE,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              width: { xs: 45, sm: 55 },
              height: { xs: 45, sm: 55 },
              border: '2px solid',
              borderColor: COLOR_PRIMARY_MAIN,
              '&:hover': {
                backgroundColor: COLOR_PRIMARY_MAIN,
                color: COLOR_WHITE,
                transform: TRANSFORM_CENTER_Y_SCALE,
                boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
              },
              transition: TRANSITION_CUBIC_BEZIER,
            }}
          >
            <ChevronRight sx={{ fontSize: { xs: 24, sm: 30 } }} />
          </IconButton>
        </>
      )}

      {/* Contenedor del carrusel mejorado */}
      <Box
        sx={{
          overflow: 'hidden', // Solo este contenedor tiene overflow hidden
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            width: `${(productosValidos.length / itemsPerView) * 100}%`,
            gap: 2,
            py: 2, // Padding vertical para evitar cortes en hover
          }}
        >
          {productosValidos.map(producto => {
            const discount = getDiscountPercentage(producto);
            const originalPrice =
              discount > 0
                ? producto.precio / (1 - discount / 100)
                : producto.precio;

            return (
              <Box
                key={producto.id}
                sx={{
                  width: `${100 / productosValidos.length}%`,
                  flexShrink: 0,
                  px: 1,
                }}
              >
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    border: '2px solid',
                    borderColor:
                      hoveredProduct === producto.id
                        ? COLOR_PRIMARY_MAIN
                        : 'grey.200',
                    backgroundColor: COLOR_WHITE,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                      borderColor: COLOR_PRIMARY_MAIN,
                      zIndex: 10,
                      '& .product-image': {
                        transform: 'scale(1.05)',
                      },
                      '& .product-overlay': {
                        opacity: 1,
                      },
                    },
                  }}
                  onMouseEnter={() => {
                    setIsAutoPlaying(false);
                    setHoveredProduct(producto.id);
                  }}
                  onMouseLeave={() => {
                    setIsAutoPlaying(true);
                    setHoveredProduct(null);
                  }}
                >
                  {/* Imagen del producto con overlay */}
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    <CardMedia
                      component='img'
                      height='220'
                      image={
                        producto.url_imagen ||
                        'https://via.placeholder.com/300x220'
                      }
                      alt={producto.nombre}
                      className='product-image'
                      sx={{
                        transition: 'transform 0.6s ease',
                        objectFit: 'cover',
                      }}
                    />

                    {/* Overlay con acciones */}
                    <Box
                      className='product-overlay'
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      }}
                    />

                    {/* Badges superiores */}
                    <Stack
                      direction='column'
                      spacing={1}
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                      }}
                    >
                      {discount > 0 && (
                        <Chip
                          label={`-${discount}%`}
                          color='error'
                          size='small'
                          sx={{
                            fontWeight: 700,
                            backgroundColor: COLOR_ERROR_MAIN,
                            color: COLOR_WHITE,
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%': { transform: 'scale(1)' },
                              '50%': { transform: 'scale(1.05)' },
                              '100%': { transform: 'scale(1)' },
                            },
                          }}
                        />
                      )}
                      {producto.es_destacado && (
                        <Chip
                          icon={
                            <Star sx={{ fontSize: FONT_SIZE_ICON_SMALL }} />
                          }
                          label='Destacado'
                          color='warning'
                          size='small'
                          sx={{
                            fontWeight: 600,
                            backgroundColor: COLOR_WARNING_MAIN,
                            color: COLOR_WHITE,
                            '& .MuiChip-icon': { color: COLOR_WHITE },
                          }}
                        />
                      )}
                      {producto.veces_solicitado > 50 && (
                        <Chip
                          icon={
                            <LocalFireDepartment
                              sx={{ fontSize: FONT_SIZE_ICON_SMALL }}
                            />
                          }
                          label='Popular'
                          color='error'
                          size='small'
                          sx={{
                            fontWeight: 600,
                            backgroundColor: COLOR_ERROR_MAIN,
                            color: COLOR_WHITE,
                            '& .MuiChip-icon': { color: COLOR_WHITE },
                          }}
                        />
                      )}
                    </Stack>

                    {/* Categoría */}
                    <Paper
                      elevation={0}
                      sx={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        color: TEXT_SECONDARY_COLOR,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <Typography variant='caption' sx={{ fontWeight: 600 }}>
                        {producto.categoria}
                      </Typography>
                    </Paper>

                    {/* Indicador de stock bajo */}
                    {producto.stock_total < 10 && producto.disponible && (
                      <Chip
                        label={`Solo ${producto.stock_total} disponibles`}
                        color='warning'
                        size='small'
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          fontWeight: 600,
                          backgroundColor: COLOR_WARNING_MAIN,
                          color: COLOR_WHITE,
                          animation: 'blink 1.5s infinite',
                          '@keyframes blink': {
                            '0%, 50%': { opacity: 1 },
                            '51%, 100%': { opacity: 0.7 },
                          },
                        }}
                      />
                    )}

                    {/* Indicador de agotado */}
                    {!producto.disponible && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Chip
                          label='Agotado'
                          color='error'
                          sx={{
                            fontWeight: 700,
                            backgroundColor: COLOR_ERROR_MAIN,
                            color: COLOR_WHITE,
                            fontSize: '1rem',
                            px: 2,
                            py: 1,
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Contenido del producto mejorado */}
                  <CardContent sx={{ p: 3, height: 160 }}>
                    <Typography
                      variant='h6'
                      component='h3'
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                        height: 50,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        color: 'text.primary',
                      }}
                    >
                      {producto.nombre}
                    </Typography>

                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{
                        mb: 2,
                        lineHeight: 1.4,
                        height: 35,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        fontSize: '0.875rem',
                      }}
                    >
                      {producto.descripcion}
                    </Typography>

                    {/* Rating y precio */}
                    <Stack
                      direction='row'
                      justifyContent='space-between'
                      alignItems='center'
                      sx={{ mb: 1 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating
                          value={Number(producto.rating_promedio)}
                          precision={0.1}
                          readOnly
                          size='small'
                          sx={{
                            '& .MuiRating-iconFilled': { color: '#ffc107' },
                            '& .MuiRating-icon': { fontSize: '1rem' },
                          }}
                        />
                        <Typography
                          variant='caption'
                          sx={{
                            ml: 1,
                            fontWeight: 600,
                            color: TEXT_SECONDARY_COLOR,
                            fontSize: '0.75rem',
                          }}
                        >
                          ({Number(producto.rating_promedio).toFixed(1)})
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Precios */}
                    <Stack direction='row' alignItems='center' spacing={1}>
                      {discount > 0 && (
                        <Typography
                          variant='body2'
                          sx={{
                            textDecoration: 'line-through',
                            color: TEXT_SECONDARY_COLOR,
                            fontSize: '0.875rem',
                          }}
                        >
                          {formatPrice(originalPrice)}
                        </Typography>
                      )}
                      <Typography
                        variant='h6'
                        sx={{
                          fontWeight: 800,
                          color:
                            discount > 0 ? 'error.main' : COLOR_PRIMARY_MAIN,
                          fontSize: '1.25rem',
                        }}
                      >
                        {formatPrice(producto.precio)}
                      </Typography>
                      {discount > 0 && (
                        <Chip
                          label='¡OFERTA!'
                          color='error'
                          size='small'
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 20,
                          }}
                        />
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Indicadores de posición mejorados */}
      {productosValidos.length > itemsPerView && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 4,
            gap: 1,
          }}
        >
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <Box
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
                setTimeout(() => setIsAutoPlaying(true), 8000);
              }}
              sx={{
                width: index === currentIndex ? 24 : 12,
                height: 12,
                borderRadius: 6,
                backgroundColor:
                  index === currentIndex ? COLOR_PRIMARY_MAIN : 'grey.300',
                cursor: 'pointer',
                transition: TRANSITION_CUBIC_BEZIER,
                '&:hover': {
                  backgroundColor:
                    index === currentIndex ? 'primary.dark' : 'grey.400',
                  transform: 'scale(1.1)',
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* Información adicional mejorada */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
          Mostrando {Math.min(itemsPerView, productosValidos.length)} de{' '}
          {productosValidos.length} productos destacados
        </Typography>
        {isAutoPlaying && productosValidos.length > itemsPerView && (
          <Typography variant='caption' color='text.secondary'>
            ✨ El carrusel se desplaza automáticamente cada 5 segundos
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProductCarousel;
