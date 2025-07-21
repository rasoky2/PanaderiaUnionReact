import { useState } from 'react';
// @ts-ignore
import { CenterFocusStrong, ZoomIn, ZoomOut } from '@mui/icons-material';
import { Box, GlobalStyles, IconButton, Tooltip } from '@mui/material';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { getStockStatusColor } from '../config/mapbox.config';
import './PeruMap.css';
import RegionPopup from './RegionPopup';

// Interfaces para tipado
type StockStatus =
  | 'normal'
  | 'bajo'
  | 'critico'
  | 'necesita_pedido'
  | 'sin_datos'
  | 'inactiva';

interface DepartmentProperties {
  NOMBDEP: string;
  CCDD: string;
  estado_general: StockStatus;
  sucursales_inactivas: number;
  sucursales_activas: number;
  total_sucursales: number;
  color_calculado?: string;
  centroid?: [number, number];
  solicitudesPendientes?: number;
}

interface MapGeography {
  rsmKey: string;
  properties: DepartmentProperties;
}

interface PeruMapProps {
  height?: string | number;
  showControls?: boolean;
  onDepartmentClick?: (_department: DepartmentProperties) => void;
  data: any; // Recibimos los datos enriquecidos
}

const PeruMap = ({
  height = '600px',
  showControls = true,
  onDepartmentClick,
  data,
}: PeruMapProps) => {
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentProperties | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoom, setZoom] = useState(0.9);
  const [center, setCenter] = useState<[number, number]>([-75.0152, -10.5]);

  const getDepartmentColor = (properties: DepartmentProperties) => {
    const { estado_general, sucursales_inactivas, sucursales_activas } =
      properties;

    if (statusFilter !== 'all' && estado_general !== statusFilter) {
      return '#E0E0E0';
    }

    // Usar el color calculado si está disponible
    if (properties.color_calculado) {
      return properties.color_calculado;
    }

    // Fallback al color por estado
    let color = getStockStatusColor(estado_general) || '#CFD8DC';

    // Si hay sucursales inactivas y ninguna activa, aplicar color morado con opacidad
    if (sucursales_inactivas > 0 && sucursales_activas === 0) {
      color = getStockStatusColor('inactiva');
    }

    return color;
  };

  const handleDepartmentClick = (geo: MapGeography) => {
    const _department = geo.properties;
    setSelectedDepartment(_department);
    if (onDepartmentClick) {
      onDepartmentClick(_department);
    }
  };

  const handleClosePopup = () => {
    setSelectedDepartment(null);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 8));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 1));
  };

  const handleResetView = () => {
    setZoom(0.9);
    setCenter([-75.0152, -10.5]);
    setStatusFilter('all');
    setSelectedDepartment(null);
  };

  const getGeographyStyle = (departmentProperties: DepartmentProperties) => {
    const baseColor = getDepartmentColor(departmentProperties);
    return {
      default: {
        fill: baseColor,
        stroke: 'transparent',
        strokeWidth: 0,
        outline: 'none',
        cursor: showControls ? 'pointer' : 'default',
      },
      hover: {
        fill: baseColor,
        stroke: 'transparent',
        strokeWidth: 0,
        outline: 'none',
        cursor: showControls ? 'pointer' : 'default',
        filter: showControls ? 'brightness(1.1)' : 'none',
      },
      pressed: {
        fill: baseColor,
        stroke: 'transparent',
        strokeWidth: 0,
        outline: 'none',
        filter: showControls ? 'brightness(0.9)' : 'none',
      },
    };
  };

  return (
    <Box sx={{ height, position: 'relative', overflow: 'hidden' }}>
      <GlobalStyles
        styles={{
          '@keyframes pulse-marker': {
            '0%': {
              transform: 'scale(0.9)',
              opacity: 1,
            },
            '70%': {
              transform: 'scale(1.2)',
              opacity: 0.3,
            },
            '100%': {
              transform: 'scale(0.9)',
              opacity: 1,
            },
          },
        }}
      />

      {/* Controles de zoom */}
      {showControls && (
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <IconButton
            size='small'
            onClick={handleZoomIn}
            sx={{
              backgroundColor: 'background.paper',
              boxShadow: 3,
              '&:hover': { backgroundColor: 'grey.200' },
            }}
          >
            <ZoomIn />
          </IconButton>
          <IconButton
            size='small'
            onClick={handleZoomOut}
            sx={{
              backgroundColor: 'background.paper',
              boxShadow: 3,
              '&:hover': { backgroundColor: 'grey.200' },
            }}
          >
            <ZoomOut />
          </IconButton>
          <IconButton
            size='small'
            onClick={handleResetView}
            sx={{
              backgroundColor: 'background.paper',
              boxShadow: 3,
              '&:hover': { backgroundColor: 'grey.200' },
            }}
          >
            <CenterFocusStrong />
          </IconButton>
        </Box>
      )}

      <ComposableMap
        projection='geoMercator'
        projectionConfig={{
          scale: 2000,
          center: [-75.0152, -10.5],
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup zoom={zoom} center={center}>
          <Geographies geography={data}>
            {({ geographies }: { geographies: MapGeography[] }) =>
              geographies.map((geo: MapGeography) => {
                const departmentProperties = geo.properties;
                return (
                  <Tooltip
                    key={geo.rsmKey}
                    title={departmentProperties.NOMBDEP}
                    arrow
                    placement='top'
                  >
                    <Geography
                      geography={geo}
                      onClick={() => handleDepartmentClick(geo)}
                      style={getGeographyStyle(departmentProperties)}
                    />
                  </Tooltip>
                );
              })
            }
          </Geographies>
          {showControls && (
            <Geographies geography={data}>
              {({ geographies }: { geographies: MapGeography[] }) =>
                geographies
                  .filter(
                    (geo: MapGeography) =>
                      (geo.properties.estado_general === 'critico' ||
                        geo.properties.estado_general === 'necesita_pedido') &&
                      !!geo.properties.centroid &&
                      (statusFilter === 'all' ||
                        statusFilter === geo.properties.estado_general)
                  )
                  .map((geo: MapGeography) => {
                    const _department = geo.properties;
                    const isCritico = _department.estado_general === 'critico';
                    const coordinates = _department.centroid;

                    if (!coordinates) return null;

                    return (
                      <Marker
                        key={`marker-${geo.rsmKey}`}
                        coordinates={coordinates}
                      >
                        <g
                          className='marker-group'
                          onClick={() => handleDepartmentClick(geo)}
                        >
                          <circle
                            r={10}
                            fill={
                              isCritico
                                ? 'rgba(244, 67, 54, 0.3)'
                                : 'rgba(33, 150, 243, 0.3)'
                            }
                            className='marker-pulse'
                          />
                          <circle
                            r={5}
                            fill={isCritico ? '#f44336' : '#2196f3'}
                            stroke='#fff'
                            strokeWidth={1.5}
                          />
                        </g>
                      </Marker>
                    );
                  })
              }
            </Geographies>
          )}
        </ZoomableGroup>
      </ComposableMap>

      {selectedDepartment && showControls && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2000,
          }}
        >
          <RegionPopup
            region={{
              id: selectedDepartment.CCDD,
              name: selectedDepartment.NOMBDEP,
              coordinates: selectedDepartment.centroid || [0, 0],
              sucursales: selectedDepartment.total_sucursales,
              stockStatus: (() => {
                const status = selectedDepartment.estado_general;
                if (status === 'necesita_pedido' || status === 'inactiva') {
                  return 'critico';
                }
                return status;
              })(),
              solicitudesPendientes:
                selectedDepartment.solicitudesPendientes || 0,
              color: getStockStatusColor(selectedDepartment.estado_general),
            }}
            onClose={handleClosePopup}
          />
        </Box>
      )}
    </Box>
  );
};

export default PeruMap;
