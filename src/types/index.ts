// Tipos de usuario
export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'empleado' | 'administrador';
  sucursalId?: string;
  sucursalName?: string;
  departamento?: string;
  provincia?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos de productos
export interface Producto {
  id: string | number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  unidadMedida?: string;
  imagen?: string;
  url_imagen?: string;
  categoria_id?: number;
  es_destacado?: boolean;
  es_mas_pedido?: boolean;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Tipos de stock
export interface Stock {
  id: string;
  productoId: string;
  producto?: Producto;
  sucursalId: string;
  cantidadActual: number;
  cantidadMinima: number;
  cantidadMaxima: number;
  fechaActualizacion: string;
}

// Tipos de solicitudes de stock
export interface SolicitudStock {
  id: string;
  empleadoId: string;
  empleado?: User;
  sucursalId: string;
  estado: string;
  fechaSolicitud: string;
  fechaRespuesta?: string;
  observaciones?: string;
  items: SolicitudStockItem[];
}

export interface SolicitudStockItem {
  id: string;
  solicitudId: string;
  productoId: string;
  producto?: Producto;
  cantidadSolicitada: number;
  cantidadAprobada?: number;
  observaciones?: string;
}

// Tipos de sucursales
export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  telefono?: string;
  email?: string;
  latitud?: number;
  longitud?: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipos de reportes y estadísticas
export interface EstadisticaSucursal {
  sucursalId: string;
  sucursal: Sucursal;
  totalProductos: number;
  productosConStockBajo: number;
  solicitudesPendientes: number;
  ultimaActualizacion: string;
}

export interface ReporteDepartamento {
  departamento: string;
  totalSucursales: number;
  sucursalesActivas: number;
  totalSolicitudes: number;
  solicitudesPendientes: number;
  productosConStockBajo: number;
}

// Tipos de respuesta de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos de filtros y búsquedas
export interface FiltroSolicitudes {
  estado?: SolicitudStock['estado'];
  fechaDesde?: string;
  fechaHasta?: string;
  sucursalId?: string;
  empleadoId?: string;
}

export interface FiltroDepartamentos {
  departamento?: string;
  conStockBajo?: boolean;
  conSolicitudesPendientes?: boolean;
}

export interface FiltroDepartamentos {
  departamento?: string;
  conStockBajo?: boolean;
  conSolicitudesPendientes?: boolean;
}
