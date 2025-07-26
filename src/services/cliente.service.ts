/**
 * Servicio para gestión de clientes
 * @author Panadería Unión
 * @version 1.0.0
 */

import { supabase } from '../config/supabase.config';
import { Cliente, ClienteLogin, ClienteRegistro } from '../types';

export const clienteService = {
  // Registrar un nuevo cliente
  async registrarCliente(datos: ClienteRegistro): Promise<Cliente> {
    // En una aplicación real, aquí hashearías la contraseña
    const password_hash = btoa(datos.password); // Solo para demo, usar bcrypt en producción

    const { data, error } = await supabase
      .from('clientes')
      .insert({
        email: datos.email,
        password_hash,
        nombre: datos.nombre,
        apellido: datos.apellido,
        celular: datos.celular,
        direccion: datos.direccion,
        departamento_id: datos.departamento_id,
        provincia_id: datos.provincia_id,
        fecha_nacimiento: datos.fecha_nacimiento,
        genero: datos.genero,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Iniciar sesión de cliente
  async loginCliente(credenciales: ClienteLogin): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('email', credenciales.email)
      .eq('activo', true)
      .single();

    if (error) throw new Error('Cliente no encontrado');

    // Verificar contraseña (en demo, comparar directamente)
    const password_hash = btoa(credenciales.password);
    if (data.password_hash !== password_hash) {
      throw new Error('Contraseña incorrecta');
    }

    // Actualizar último acceso
    await supabase
      .from('clientes')
      .update({ ultimo_acceso: new Date().toISOString() })
      .eq('id', data.id);

    return data;
  },

  // Obtener cliente por ID
  async getClientePorId(id: string): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar perfil de cliente
  async actualizarPerfil(
    id: string,
    datos: Partial<Cliente>
  ): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .update(datos)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Verificar si el email ya existe
  async emailExiste(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('clientes')
      .select('id')
      .eq('email', email)
      .single();

    return !error && !!data;
  },
};
