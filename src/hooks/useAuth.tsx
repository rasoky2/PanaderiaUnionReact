import { AuthService } from '../services/auth.service';

/**
 * Hook simplificado para manejar autenticación
 * Versión síncrona para evitar problemas de configuración TypeScript
 */
export const useAuth = () => {
  // Obtener usuario de forma síncrona desde localStorage
  const user = AuthService.getCurrentUserSync();

  const login = async (email: string, password: string) => {
    return await AuthService.signIn(email, password);
  };

  const logout = async () => {
    await AuthService.signOut();
    // Recargar página para actualizar estado
    window.location.href = '/login';
  };

  return {
    user,
    loading: false, // No hay loading async
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'admin',
    isEmployee: user?.rol === 'empleado',
    login,
    logout
  };
}; 