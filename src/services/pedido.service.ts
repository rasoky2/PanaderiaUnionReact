/**
 * Servicio para gestión de pedidos y agencias de envío
 * @author Panadería Unión
 * @version 1.0.0
 */

import { supabase } from '../config/supabase.config';
import {
  AgenciaEnvio,
  PedidoCompleto,
  PedidoCrear,
  SeguimientoPedido,
} from '../types';

const DIAS_ENTREGA_POR_DEFECTO = 3;

export const pedidoService = {
  // Obtener todas las agencias de envío activas
  async getAgenciasEnvio(): Promise<AgenciaEnvio[]> {
    const { data, error } = await supabase
      .from('agencias_envio')
      .select('*')
      .eq('activo', true)
      .order('nombre');

    if (error) {
      throw error;
    }
    return data || [];
  },

  // Crear un nuevo pedido
  async crearPedido(pedidoData: PedidoCrear): Promise<PedidoCompleto> {
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        cliente_id: pedidoData.cliente_id,
        sucursal_id: pedidoData.sucursal_id,
        agencia_envio_id: pedidoData.agencia_envio_id,
        numero_tracking: await this.generarNumeroTracking(),
        subtotal: pedidoData.items.reduce(
          (acc, item) => acc + item.precio_unitario * item.cantidad,
          0
        ),
        costo_envio: 0, // Se calculará después
        total: 0, // Se calculará después
        metodo_pago: pedidoData.metodo_pago,
        direccion_entrega: pedidoData.direccion_entrega,
        notas: pedidoData.notas,
        fecha_entrega_estimada: this.calcularFechaEntrega(
          pedidoData.agencia_envio_id
        ),
      })
      .select()
      .single();

    if (pedidoError) {
      throw pedidoError;
    }

    // Crear items del pedido
    const itemsData = pedidoData.items.map(item => ({
      pedido_id: pedido.id,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.precio_unitario * item.cantidad,
    }));

    const { error: itemsError } = await supabase
      .from('pedido_items')
      .insert(itemsData);

    if (itemsError) {
      throw itemsError;
    }

    // Crear primer seguimiento
    await this.crearSeguimiento(
      pedido.id,
      'pendiente',
      'Pedido creado exitosamente'
    );

    // Obtener pedido completo con relaciones
    return this.getPedidoPorId(pedido.id);
  },

  // Obtener pedido por ID con todas las relaciones
  async getPedidoPorId(pedidoId: string): Promise<PedidoCompleto> {
    const { data, error } = await supabase
      .from('pedidos')
      .select(
        `
        *,
        cliente:clientes(*),
        sucursal:sucursales(*),
        agencia_envio:agencias_envio(*),
        items:pedido_items(*),
        seguimiento:seguimiento_pedido(*)
      `
      )
      .eq('id', pedidoId)
      .single();

    if (error) {
      throw error;
    }
    return data;
  },

  // Obtener pedidos de un cliente
  async getPedidosCliente(clienteId: string): Promise<PedidoCompleto[]> {
    const { data, error } = await supabase
      .from('pedidos')
      .select(
        `
        *,
        sucursal:sucursales(*),
        agencia_envio:agencias_envio(*),
        items:pedido_items(*),
        seguimiento:seguimiento_pedido(*)
      `
      )
      .eq('cliente_id', clienteId)
      .order('fecha_pedido', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  },

  // Buscar pedido por número de tracking
  async buscarPorTracking(numeroTracking: string): Promise<PedidoCompleto> {
    const { data, error } = await supabase
      .from('pedidos')
      .select(
        `
        *,
        cliente:clientes(*),
        sucursal:sucursales(*),
        agencia_envio:agencias_envio(*),
        items:pedido_items(*),
        seguimiento:seguimiento_pedido(*)
      `
      )
      .eq('numero_tracking', numeroTracking)
      .single();

    if (error) {
      throw error;
    }
    return data;
  },

  // Crear seguimiento del pedido
  async crearSeguimiento(
    pedidoId: string,
    estado: string,
    descripcion?: string,
    ubicacion?: string
  ): Promise<SeguimientoPedido> {
    const { data, error } = await supabase
      .from('seguimiento_pedido')
      .insert({
        pedido_id: pedidoId,
        estado,
        descripcion,
        ubicacion,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  },

  // Actualizar estado del pedido
  async actualizarEstadoPedido(
    pedidoId: string,
    nuevoEstado: string
  ): Promise<void> {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', pedidoId);

    if (error) {
      throw error;
    }
  },

  // Generar número de tracking único
  async generarNumeroTracking(): Promise<string> {
    const { data, error } = await supabase.rpc('generar_numero_tracking');
    if (error) {
      throw error;
    }
    if (!data || typeof data !== 'string') {
      throw new Error('No se pudo generar el número de tracking');
    }
    return data;
  },

  // Calcular fecha de entrega estimada
  calcularFechaEntrega(_agenciaId: string): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + DIAS_ENTREGA_POR_DEFECTO);
    const fechaString = fecha.toISOString().split('T')[0];
    if (!fechaString) {
      throw new Error('Error al calcular fecha de entrega');
    }
    return fechaString;
  },
};
