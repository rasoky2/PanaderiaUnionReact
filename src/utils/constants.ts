// Constantes de la aplicación
export const APP_NAME = 'Panadería Unión';
export const APP_VERSION = '1.0.0';
export const COMPANY_FOUNDED = 1945;

// Colores del tema - Basado en la identidad visual de Panadería Unión (Diseño Profesional)
export const COLORS = {
  // Colores principales de la marca
  PRIMARY_RED: '#DC2626', // Rojo corporativo principal
  PRIMARY_BLUE: '#1E40AF', // Azul corporativo principal
  ACCENT_ORANGE: '#EA580C', // Naranja corporativo
  LIGHT_RED: '#FEE2E2', // Rojo muy claro para fondos
  LIGHT_BLUE: '#DBEAFE', // Azul muy claro para fondos
  LIGHT_ORANGE: '#FED7AA', // Naranja claro para fondos

  // Colores neutros profesionales
  WHITE: '#FFFFFF',
  BLACK: '#111827',
  GRAY_50: '#F9FAFB',
  GRAY_100: '#F3F4F6',
  GRAY_200: '#E5E7EB',
  GRAY_300: '#D1D5DB',
  GRAY_400: '#9CA3AF',
  GRAY_500: '#6B7280',
  GRAY_600: '#4B5563',
  GRAY_700: '#374151',
  GRAY_800: '#1F2937',
  GRAY_900: '#111827',

  // Estados
  SUCCESS: '#059669',
  ERROR: '#DC2626',
  WARNING: '#D97706',
  INFO: '#2563EB',

  // Fondos profesionales
  BACKGROUND_LIGHT: '#F9FAFB',
  BACKGROUND_PAPER: '#FFFFFF',
  BACKGROUND_SUBTLE: '#F3F4F6',
} as const;

// Estados de solicitudes
export const SOLICITUD_ESTADOS = {
  PENDIENTE: 'pendiente',
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada',
  ENVIADA: 'enviada',
  RECIBIDA: 'recibida',
} as const;

// Tipos de usuario
export const USER_TYPES = {
  EMPLEADO: 'empleado',
  ADMINISTRADOR: 'administrador',
} as const;

// Categorías de productos
export const PRODUCT_CATEGORIES = {
  PAN: 'pan',
  DULCE: 'dulce',
  PASTELERIA: 'pasteleria',
  BEBIDA: 'bebida',
} as const;

// Unidades de medida
export const UNIDADES_MEDIDA = {
  UNIDAD: 'unidad',
  KILOGRAMO: 'kg',
  GRAMO: 'gramo',
} as const;

// Departamentos del Perú
export const DEPARTAMENTOS_PERU = [
  'Amazonas',
  'Áncash',
  'Apurímac',
  'Arequipa',
  'Ayacucho',
  'Cajamarca',
  'Callao',
  'Cusco',
  'Huancavelica',
  'Huánuco',
  'Ica',
  'Junín',
  'La Libertad',
  'Lambayeque',
  'Lima',
  'Loreto',
  'Madre de Dios',
  'Moquegua',
  'Pasco',
  'Piura',
  'Puno',
  'San Martín',
  'Tacna',
  'Tumbes',
  'Ucayali',
] as const;

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  EMPLEADO_DASHBOARD: '/empleado/dashboard',
  EMPLEADO_STOCK: '/empleado/stock',
  EMPLEADO_SOLICITUDES: '/empleado/solicitudes',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_SUCURSALES: '/admin/sucursales',
  ADMIN_USUARIOS: '/admin/usuarios',
  ADMIN_REPORTES: '/admin/reportes',
} as const;

// Configuración de la aplicación
export const CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  AUTO_SAVE_INTERVAL: 30000, // 30 segundos
  SESSION_TIMEOUT: 60 * 60 * 1000, // 1 hora
} as const;

// Mensajes de la aplicación
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Inicio de sesión exitoso',
    LOGOUT: 'Sesión cerrada correctamente',
    SAVE: 'Datos guardados exitosamente',
    DELETE: 'Elemento eliminado correctamente',
    UPDATE: 'Información actualizada correctamente',
  },
  ERROR: {
    LOGIN: 'Error en el inicio de sesión',
    NETWORK: 'Error de conexión. Intente nuevamente.',
    GENERIC: 'Ha ocurrido un error inesperado',
    REQUIRED_FIELDS: 'Por favor complete todos los campos requeridos',
    INVALID_EMAIL: 'Formato de email inválido',
    WEAK_PASSWORD: 'La contraseña debe tener al menos 8 caracteres',
  },
  LOADING: {
    PLEASE_WAIT: 'Por favor espere...',
    LOADING: 'Cargando...',
    SAVING: 'Guardando...',
    PROCESSING: 'Procesando...',
  },
} as const;
