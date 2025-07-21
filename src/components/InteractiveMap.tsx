import { useState } from 'react';
import { Box, Typography, Stack, Button, Chip } from '@mui/material';
import { Refresh, Map as MapIcon } from '@mui/icons-material';
import { MAPBOX_CONFIG, PERU_REGIONS, RegionData } from '../config/mapbox.config';
import RegionMarker from './RegionMarker';
import RegionPopup from './RegionPopup';

// Para desarrollo sin react-map-gl instalado, usaremos un mapa simulado
interface ViewportState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

interface InteractiveMapProps {
  height?: string | number;
  showControls?: boolean;
  onRegionClick?: (region: RegionData) => void;
}

const InteractiveMap = ({ 
  height = '600px', 
  showControls = true,
  onRegionClick 
}: InteractiveMapProps) => {
  const [, setViewport] = useState<ViewportState>(MAPBOX_CONFIG.INITIAL_VIEWPORT);
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filtrar regiones según el estado del stock
  const filteredRegions = statusFilter === 'all' 
    ? PERU_REGIONS 
    : PERU_REGIONS.filter(region => region.stockStatus === statusFilter);

  // Estadísticas del mapa
  const mapStats = {
    total: PERU_REGIONS.length,
    critico: PERU_REGIONS.filter(r => r.stockStatus === 'critico').length,
    bajo: PERU_REGIONS.filter(r => r.stockStatus === 'bajo').length,
    normal: PERU_REGIONS.filter(r => r.stockStatus === 'normal').length,
    totalSolicitudes: PERU_REGIONS.reduce((sum, r) => sum + r.solicitudesPendientes, 0)
  };

  const handleRegionClick = (region: RegionData) => {
    setSelectedRegion(region);
    onRegionClick?.(region);
  };

  const handleClosePopup = () => {
    setSelectedRegion(null);
  };

  const resetMap = () => {
    setViewport(MAPBOX_CONFIG.INITIAL_VIEWPORT);
    setSelectedRegion(null);
    setStatusFilter('all');
  };

  // Simular posición de marcador en el mapa visual
  const getMarkerPosition = (coordinates: [number, number]) => {
    // Convertir coordenadas geográficas a posición en el contenedor
    // Esta es una aproximación simple para el mapa simulado
    const [lng, lat] = coordinates;
    const containerWidth = 800;
    const containerHeight = 600;
    
    // Bounds aproximados del Perú: lng: -81 a -68, lat: -18 a -0
    const lngMin = -81, lngMax = -68;
    const latMin = -18, latMax = 0;
    
    const x = ((lng - lngMin) / (lngMax - lngMin)) * containerWidth;
    const y = ((latMax - lat) / (latMax - latMin)) * containerHeight;
    
    return { x: Math.max(40, Math.min(containerWidth - 40, x)), y: Math.max(40, Math.min(containerHeight - 40, y)) };
  };

  return (
    <Box sx={{ height, position: 'relative', overflow: 'hidden' }}>
      {/* Controles superiores */}
      {showControls && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            zIndex: 1000,
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            p: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <MapIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Mapa Nacional - Estado de Stock
              </Typography>
            </Stack>

            {/* Estadísticas rápidas */}
            <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
              <Chip label={`${mapStats.critico} Crítico`} color="error" size="small" />
              <Chip label={`${mapStats.bajo} Bajo`} color="warning" size="small" />
              <Chip label={`${mapStats.normal} Normal`} color="success" size="small" />
              <Chip label={`${mapStats.totalSolicitudes} Solicitudes`} color="info" size="small" />
            </Stack>

            {/* Controles de filtro */}
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant={statusFilter === 'all' ? 'contained' : 'outlined'}
                onClick={() => setStatusFilter('all')}
              >
                Todas
              </Button>
              <Button
                size="small"
                variant={statusFilter === 'critico' ? 'contained' : 'outlined'}
                color="error"
                onClick={() => setStatusFilter('critico')}
              >
                Críticas
              </Button>
              <Button
                size="small"
                startIcon={<Refresh />}
                onClick={resetMap}
              >
                Reset
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}

      {/* Contenedor del mapa */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: '#f0f8ff',
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #e3f2fd 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, #f3e5f5 0%, transparent 50%)
          `,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Simulación del mapa del Perú */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '20%',
            width: '60%',
            height: '80%',
            backgroundColor: 'rgba(200,200,200,0.3)',
            clipPath: 'polygon(20% 10%, 80% 5%, 90% 30%, 85% 70%, 70% 85%, 40% 90%, 10% 75%, 15% 40%)',
            border: '2px solid #ccc'
          }}
        />

        {/* Marcadores de regiones */}
        {filteredRegions.map((region) => {
          const position = getMarkerPosition(region.coordinates);
          return (
            <Box
              key={region.id}
              sx={{
                position: 'absolute',
                left: position.x - 20,
                top: position.y - 20,
                zIndex: 100
              }}
            >
              <RegionMarker
                region={region}
                onClick={handleRegionClick}
                size={region.stockStatus === 'critico' ? 50 : 40}
              />
            </Box>
          );
        })}

        {/* Popup de información */}
        {selectedRegion && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2000
            }}
          >
            <RegionPopup
              region={selectedRegion}
              onClose={handleClosePopup}
            />
          </Box>
        )}

        {/* Overlay de instrucciones */}
        {!selectedRegion && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              p: 2,
              borderRadius: 2,
              maxWidth: 300
            }}
          >
            <Typography variant="body2">
              <Typography component="span" fontWeight="bold">💡 Tip:</Typography> Haz click en cualquier marcador para ver detalles de la región. 
              Los marcadores rojos indican stock crítico y requieren atención inmediata.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Leyenda */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          p: 2,
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Leyenda
        </Typography>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#4CAF50' }} />
            <Typography variant="caption">Stock Normal</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#FF9800' }} />
            <Typography variant="caption">Stock Bajo</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#F44336' }} />
            <Typography variant="caption">Stock Crítico (Pulsante)</Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default InteractiveMap; 