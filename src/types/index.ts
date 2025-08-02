/**
 * Tipos y interfaces para Panadería Unión
 * @author Panadería Unión
 * @version 1.0.0
 */

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

export interface ClienteDatos {
  nombre: string;
  correo: string;
  direccion: string;
}

export interface Cliente {
  id: string;
  email: string;
  password_hash: string;
  nombre: string;
  apellido: string;
  dni?: string;
  celular?: string;
  ruc?: string;
  direccion?: string;
  departamento_id?: number;
  provincia_id?: number;
  fecha_nacimiento?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  activo: boolean;
  email_verificado: boolean;
  fecha_registro: string;
  ultimo_acceso?: string;
  created_at: string;
  updated_at: string;
}

export interface ClienteRegistro {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni?: string;
  celular?: string;
  ruc?: string;
  direccion?: string;
  departamento_id?: number;
  provincia_id?: number;
  fecha_nacimiento?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
}

export interface ClienteLogin {
  email: string;
  password: string;
}

export interface AgenciaEnvio {
  id: string;
  nombre: string;
  descripcion?: string;
  tiempo_entrega_dias: number;
  costo_base: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pedido {
  id: string;
  cliente_id: string;
  sucursal_id: string;
  agencia_envio_id: string;
  numero_tracking: string;
  estado:
    | 'pendiente'
    | 'confirmado'
    | 'preparando'
    | 'enviado'
    | 'en_transito'
    | 'entregado'
    | 'cancelado';
  subtotal: number;
  costo_envio: number;
  total: number;
  metodo_pago: string;
  direccion_entrega: string;
  notas?: string;
  fecha_pedido: string;
  fecha_entrega_estimada?: string;
  fecha_entrega_real?: string;
  created_at: string;
  updated_at: string;
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at: string;
  producto?: Producto;
}

export interface SeguimientoPedido {
  id: string;
  pedido_id: string;
  estado: string;
  descripcion?: string;
  ubicacion?: string;
  fecha_evento: string;
  created_at: string;
}

export interface PedidoCompleto extends Pedido {
  cliente?: Cliente;
  sucursal?: Sucursal;
  agencia_envio?: AgenciaEnvio;
  items?: PedidoItem[];
  seguimiento?: SeguimientoPedido[];
}

export interface PedidoCrear {
  cliente_id: string;
  sucursal_id: string;
  agencia_envio_id: string;
  metodo_pago: string;
  direccion_entrega: string;
  notas?: string;
  items: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
}
