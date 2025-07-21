import { Box } from '@mui/material';
import { Store, Warning, CheckCircle, ErrorOutline } from '@mui/icons-material';
import { RegionData } from '../config/mapbox.config';

interface RegionMarkerProps {
  region: RegionData;
  onClick: (region: RegionData) => void;
  size?: number;
}

const RegionMarker = ({ 
  region, 
  onClick, 
  size = 40 
}: RegionMarkerProps) => {
  const getStatusIcon = () => {
    switch (region.stockStatus) {
      case 'normal':
        return <CheckCircle sx={{ color: 'white', fontSize: size * 0.5 }} />;
      case 'bajo':
        return <Warning sx={{ color: 'white', fontSize: size * 0.5 }} />;
      case 'critico':
        return <ErrorOutline sx={{ color: 'white', fontSize: size * 0.5 }} />;
      default:
        return <Store sx={{ color: 'white', fontSize: size * 0.5 }} />;
    }
  };

  const getPulseAnimation = () => {
    if (region.stockStatus === 'critico') {
      return {
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: region.color,
          opacity: 0.7,
          animation: 'pulse 2s infinite'
        },
        '@keyframes pulse': {
          '0%': {
            transform: 'scale(1)',
            opacity: 0.7
          },
          '50%': {
            transform: 'scale(1.3)',
            opacity: 0.3
          },
          '100%': {
            transform: 'scale(1)',
            opacity: 0.7
          }
        }
      };
    }
    return {};
  };

  return (
    <Box
      onClick={() => onClick(region)}
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: region.color,
        border: '3px solid white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.2)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          zIndex: 1000
        },
        ...getPulseAnimation()
      }}
    >
      {getStatusIcon()}
      
      {/* Badge de solicitudes pendientes */}
      {region.solicitudesPendientes > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: 'error.main',
            color: 'white',
            borderRadius: '50%',
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
            border: '2px solid white'
          }}
        >
          {region.solicitudesPendientes > 99 ? '99+' : region.solicitudesPendientes}
        </Box>
      )}
    </Box>
  );
};

export default RegionMarker; 