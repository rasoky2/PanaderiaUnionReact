/**
@file supabase.config.ts
*/
import { createClient } from '@supabase/supabase-js';

// Configuración real de Supabase - Panadería Unión
const supabaseUrl = 'https://jdqtawtflzktbczxrzey.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcXRhd3RmbHprdGJjenhyemV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzIwODMsImV4cCI6MjA2NTQ0ODA4M30.PnqMLPebYDZvLysqlLeIC3Al90TZ2wnfb6ft9fnAN3Q';

// Crear cliente real de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };
export default supabase;
