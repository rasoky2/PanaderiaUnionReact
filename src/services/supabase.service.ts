import { supabase } from '../config/supabase.config';
import { User, Producto, Stock, SolicitudStock, Sucursal } from '../types';

export class SupabaseService {
  // Autenticación
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }

  // Usuarios
  static async getUserProfile(userId: string): Promise<{ data: User | null; error: any }> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  }

  // Productos
  static async getProductos(): Promise<{ data: Producto[] | null; error: any }> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('nombre');
    return { data, error };
  }

  static async getProducto(id: string): Promise<{ data: Producto | null; error: any }> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  }

  // Stock
  static async getStockBySucursal(sucursalId: string): Promise<{ data: Stock[] | null; error: any }> {
    const { data, error } = await supabase
      .from('stock')
      .select(`
        *,
        producto:productos(*)
      `)
      .eq('sucursalId', sucursalId);
    return { data, error };
  }

  static async updateStock(stockId: string, cantidadActual: number): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('stock')
      .update({ 
        cantidadActual,
        fechaActualizacion: new Date().toISOString()
      })
      .eq('id', stockId)
      .select();
    return { data, error };
  }

  // Solicitudes de Stock
  static async getSolicitudesByEmpleado(empleadoId: string): Promise<{ data: SolicitudStock[] | null; error: any }> {
    const { data, error } = await supabase
      .from('solicitudes_stock')
      .select(`
        *,
        empleado:usuarios(*),
        items:solicitudes_stock_items(
          *,
          producto:productos(*)
        )
      `)
      .eq('empleadoId', empleadoId)
      .order('fechaSolicitud', { ascending: false });
    return { data, error };
  }

  static async getAllSolicitudes(): Promise<{ data: SolicitudStock[] | null; error: any }> {
    const { data, error } = await supabase
      .from('solicitudes_stock')
      .select(`
        *,
        empleado:usuarios(*),
        items:solicitudes_stock_items(
          *,
          producto:productos(*)
        )
      `)
      .order('fechaSolicitud', { ascending: false });
    return { data, error };
  }

  static async createSolicitudStock(solicitud: Partial<SolicitudStock>): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('solicitudes_stock')
      .insert(solicitud)
      .select();
    return { data, error };
  }

  static async updateSolicitudStock(
    solicitudId: string, 
    updates: Partial<SolicitudStock>
  ): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('solicitudes_stock')
      .update({
        ...updates,
        fechaRespuesta: new Date().toISOString()
      })
      .eq('id', solicitudId)
      .select();
    return { data, error };
  }

  // Sucursales
  static async getSucursales(): Promise<{ data: Sucursal[] | null; error: any }> {
    const { data, error } = await supabase
      .from('sucursales')
      .select('*')
      .eq('activo', true)
      .order('departamento', { ascending: true });
    return { data, error };
  }

  static async getSucursalesByDepartamento(departamento: string): Promise<{ data: Sucursal[] | null; error: any }> {
    const { data, error } = await supabase
      .from('sucursales')
      .select('*')
      .eq('departamento', departamento)
      .eq('activo', true)
      .order('nombre');
    return { data, error };
  }

  static async getSucursal(id: string): Promise<{ data: Sucursal | null; error: any }> {
    const { data, error } = await supabase
      .from('sucursales')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  }

  // Estadísticas y reportes
  static async getEstadisticasSucursales(): Promise<{ data: any[] | null; error: any }> {
    // TODO: Implementar vista o función en Supabase para estadísticas complejas
    const { data, error } = await supabase
      .rpc('get_estadisticas_sucursales');
    return { data, error };
  }

  static async getReportesDepartamentos(): Promise<{ data: any[] | null; error: any }> {
    // TODO: Implementar vista o función en Supabase para reportes de departamentos
    const { data, error } = await supabase
      .rpc('get_reportes_departamentos');
    return { data, error };
  }
}

export default SupabaseService; 