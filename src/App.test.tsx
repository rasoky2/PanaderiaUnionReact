import { supabase } from './config/supabase.config';

// Test para obtener al menos un usuario
test('Supabase: obtiene al menos un usuario', async () => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .limit(1)
    .single();
  expect(error).toBeNull();
  expect(data).not.toBeNull();
});

test('Supabase: obtiene al menos un producto', async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .limit(1)
    .single();
  expect(error).toBeNull();
  expect(data).not.toBeNull();
});
