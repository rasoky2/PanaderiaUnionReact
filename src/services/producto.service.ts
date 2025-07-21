import { supabase } from '../config/supabase.config';

export interface Categoria {
  id: number;
  nombre: string;
}

export const productoService = {
  async getCategorias(): Promise<Categoria[]> {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre');
    if (error) throw error;
    return data || [];
  },
  // Aquí puedes agregar más funciones relacionadas a productos
};
