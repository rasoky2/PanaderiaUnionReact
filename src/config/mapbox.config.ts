// Configuración de Mapbox para el mapa interactivo del Perú
export const MAPBOX_CONFIG = {
  // Token público de Mapbox (reemplazar con tu propio token)
  // Para obtener un token: https://account.mapbox.com/access-tokens/
  TOKEN: 'pk.eyJ1IjoidGVzdC11c2VyIiwiYSI6ImNrcXZ3M3Q3bDB2d2cyb3Axb3NwNDZqNHcifQ.test', // Token de ejemplo
  
  // Estilo del mapa optimizado para mostrar regiones del Perú
  STYLE: 'mapbox://styles/mapbox/light-v11',
  
  // Configuración inicial del viewport para el Perú
  INITIAL_VIEWPORT: {
    latitude: -9.19, // Centro geográfico del Perú
    longitude: -75.0152,
    zoom: 5.5,
    bearing: 0,
    pitch: 0
  },
  
  // Configuración de controles
  CONTROLS: {
    showCompass: true,
    showZoom: true,
    showFullscreen: true,
    showGeolocate: false
  }
};

// Interfaz para datos de región
export interface RegionData {
  id: string;
  name: string;
  coordinates: [number, number];
  sucursales: number;
  stockStatus: 'normal' | 'bajo' | 'critico' | 'sin_datos';
  solicitudesPendientes: number;
  color: string;
}

// Datos de las regiones del Perú con coordenadas aproximadas
export const PERU_REGIONS: RegionData[] = [
  {
    id: 'lima',
    name: 'Lima',
    coordinates: [-77.0428, -12.0464],
    sucursales: 15,
    stockStatus: 'normal', // normal, bajo, critico
    solicitudesPendientes: 5,
    color: '#4CAF50' // Verde para estado normal
  },
  {
    id: 'arequipa',
    name: 'Arequipa',
    coordinates: [-71.5430, -16.4090],
    sucursales: 8,
    stockStatus: 'bajo',
    solicitudesPendientes: 12,
    color: '#FF9800' // Naranja para stock bajo
  },
  {
    id: 'cusco',
    name: 'Cusco',
    coordinates: [-71.9675, -13.5319],
    sucursales: 6,
    stockStatus: 'normal',
    solicitudesPendientes: 3,
    color: '#4CAF50'
  },
  {
    id: 'trujillo',
    name: 'Trujillo',
    coordinates: [-79.0287, -8.1116],
    sucursales: 5,
    stockStatus: 'critico',
    solicitudesPendientes: 18,
    color: '#F44336' // Rojo para estado crítico
  },
  {
    id: 'piura',
    name: 'Piura',
    coordinates: [-80.6328, -5.1945],
    sucursales: 4,
    stockStatus: 'critico',
    solicitudesPendientes: 15,
    color: '#F44336'
  },
  {
    id: 'iquitos',
    name: 'Iquitos',
    coordinates: [-73.2515, -3.7437],
    sucursales: 3,
    stockStatus: 'bajo',
    solicitudesPendientes: 8,
    color: '#FF9800'
  },
  {
    id: 'chiclayo',
    name: 'Chiclayo',
    coordinates: [-79.8742, -6.7714],
    sucursales: 4,
    stockStatus: 'normal',
    solicitudesPendientes: 2,
    color: '#4CAF50'
  },
  {
    id: 'huancayo',
    name: 'Huancayo',
    coordinates: [-75.2049, -12.0653],
    sucursales: 3,
    stockStatus: 'bajo',
    solicitudesPendientes: 7,
    color: '#FF9800'
  }
];

// Función para obtener color según el estado del stock
export const getStockStatusColor = (
  status: 'normal' | 'bajo' | 'critico' | 'necesita_pedido' | 'sin_datos' | 'inactiva'
) => {
  switch (status) {
    case 'normal':
      return '#4caf50'; // Verde
    case 'bajo':
      return '#ff9800'; // Naranja
    case 'critico':
      return '#f44336'; // Rojo
    case 'necesita_pedido':
      return '#2196f3'; // Azul para departamentos que necesitan pedidos
    case 'inactiva':
      return '#9c27b0'; // Morado para sucursales inactivas
    case 'sin_datos':
      return '#CFD8DC'; // Gris neutro
    default:
      return '#CFD8DC'; // Gris por defecto
  }
};

// Función para obtener texto del estado
export const getStockStatusText = (status: string): string => {
  switch (status) {
    case 'normal':
      return 'Stock Normal';
    case 'bajo':
      return 'Stock Bajo';
    case 'critico':
      return 'Stock Crítico';
    case 'necesita_pedido':
      return 'Necesita Pedido';
    case 'inactiva':
      return 'Sucursal Inactiva';
    case 'sin_datos':
      return 'Sin Datos';
    default:
      return 'Estado Desconocido';
  }
}; 