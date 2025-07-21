import { supabase } from '../config/supabase.config';

export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'empleado';
  sucursal?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
  errorCode?: number;
  fullError?: any;
}

/**
 * Servicio de autenticación que usa Supabase Auth y permite login con email/usuario.
 */
export class AuthService {
  
  /**
   * Inicia sesión usando el flujo oficial de Supabase Auth.
   * Primero busca el email del usuario si se provee un nombre de usuario.
   */
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // 🔍 LOGS DETALLADOS DEL SERVICIO DE AUTH
      console.log('🔐 === INICIO DE AUTENTICACIÓN EN SERVICE ===');
      console.log('📧 Email recibido en service:', email);
      console.log('🔑 Password recibido en service:', password);
      console.log('🧹 Email después de trim:', email.trim());
      console.log('📏 Longitud password:', password.length);

      // --- PASO 1: Autenticar con Supabase Auth ---
      console.log('📤 Enviando credenciales a Supabase Auth...');
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      console.log('📤 Respuesta de Supabase Auth - Data:', authData);
      console.log('📤 Respuesta de Supabase Auth - Error:', signInError);

      if (signInError) {
        console.error("❌ Error de autenticación de Supabase:", signInError.message);
        console.error("❌ Código de error:", signInError.status);
        console.error("❌ Detalles completos del error:", JSON.stringify(signInError, null, 2));
        return { success: false, error: 'Credenciales incorrectas.' };
      }

      if (!authData.user) {
        console.error("❌ No se pudo obtener el usuario de authData");
        return { success: false, error: 'No se pudo obtener la sesión del usuario.' };
      }

      console.log('✅ Usuario autenticado exitosamente:', authData.user.id);

      // --- PASO 2: Sincronizar el perfil público bajo demanda ---
      console.log('🔄 Intentando sincronizar perfil público...');
      const { error: rpcError } = await supabase.rpc('sync_public_user', { user_id: authData.user.id });

      if (rpcError) {
        console.warn('⚠️ No se pudo sincronizar el perfil. Puede que ya existiera.', rpcError.message);
      } else {
        console.log('✅ Perfil sincronizado correctamente');
      }
      
      // --- PASO 3: Obtener el perfil y construir la sesión ---
      console.log('📊 Obteniendo perfil de usuario...');
      const { data: userProfileData, error: profileError } = await supabase
        .from('usuarios')
        .select('*, sucursales(nombre)')
        .eq('id', authData.user.id)
        .single();

      console.log('📊 Datos del perfil obtenidos:', userProfileData);
      console.log('📊 Error del perfil:', profileError);

      if (profileError || !userProfileData) {
        console.error('❌ No se pudo leer el perfil del usuario:', profileError);
        return { success: false, error: 'No se pudo leer el perfil del usuario tras la autenticación.' };
      }

      const userProfile: UserProfile = {
        id: userProfileData.id,
        email: userProfileData.email,
        nombre: userProfileData.nombre,
        apellido: userProfileData.apellido,
        rol: userProfileData.rol,
        sucursal: (userProfileData.sucursales as any)?.nombre,
      };

      console.log('✅ Perfil de usuario construido:', userProfile);

      localStorage.setItem('userSession', JSON.stringify(userProfile));
      console.log('💾 Sesión guardada en localStorage');
      console.log('🔐 === FIN DE AUTENTICACIÓN EN SERVICE ===');
      
      return { success: true, user: userProfile };

    } catch (error: any) {
      console.error('💥 Error catastrófico en autenticación:', error);
      console.error('💥 Stack trace:', error.stack);
      console.error('💥 Mensaje:', error.message);
      return {
        success: false,
        error: 'Error de conexión. Intente nuevamente.'
      };
    }
  }

  /**
   * Cierra la sesión del usuario, tanto en Supabase como localmente.
   */
  static async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('userSession');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      // Forzar limpieza local aunque falle la llamada a Supabase
      localStorage.removeItem('userSession');
    }
  }

  /**
   * Obtiene el usuario actual de la sesión (solo localStorage).
   */
  static async getCurrentUser(): Promise<UserProfile | null> {
    const sessionData = localStorage.getItem('userSession');
    return sessionData ? JSON.parse(sessionData) : null;
  }

  /**
   * Obtiene el usuario actual de forma síncrona.
   */
  static getCurrentUserSync(): UserProfile | null {
    const sessionData = localStorage.getItem('userSession');
    return sessionData ? JSON.parse(sessionData) : null;
  }

  /**
   * Verifica si el usuario está autenticado.
   */
  static isAuthenticated(): boolean {
    return !!this.getCurrentUserSync();
  }

  /**
   * Verifica si el usuario es administrador.
   */
  static isAdmin(): boolean {
    const user = this.getCurrentUserSync();
    return user?.rol === 'admin';
  }

  /**
   * Verifica si el usuario es empleado.
   */
  static isEmployee(): boolean {
    const user = this.getCurrentUserSync();
    return user?.rol === 'empleado';
  }

  /**
   * Obtiene la ruta de redirección según el rol.
   */
  static getRedirectPath(user: UserProfile): string {
    if (user.rol === 'admin') {
      return '/admin/dashboard';
    } else if (user.rol === 'empleado') {
      return '/empleado/dashboard';
    }
    return '/';
  }

  /**
   * Valida credenciales básicas.
   */
  static validateCredentials(loginIdentifier: string, password: string): boolean {
    if (!loginIdentifier || !password) return false;
    if (password.length < 6) return false;
    return true;
  }

  /**
   * Método alternativo de autenticación usando función RPC manual
   */
  static async signInAlternative(email: string, password: string): Promise<AuthResponse> {
    console.log('🔄 USANDO AUTENTICACIÓN ALTERNATIVA');
    console.log('📧 Email:', email);

    try {
      // Llamar a la función RPC login_manual
      const { data, error } = await supabase
        .rpc('login_manual', {
          email_input: email,
          password_input: password
        });

      console.log('📤 Respuesta función manual:', data);
      console.log('❌ Error función manual:', error);

      if (error) {
        console.log(' Error en función manual:', error);
        return { 
          success: false, 
          error: 'Error en verificación manual de credenciales' 
        };
      }

      // 🛡️ PROCESAMIENTO SEGURO DE LA RESPUESTA
      // La función RPC puede devolver directamente el objeto o un array
      let authResult;
      
      if (Array.isArray(data) && data.length > 0) {
        // Si es array, tomar el primer elemento
        const resultado = data[0];
        authResult = resultado.login_manual || resultado;
      } else if (data && typeof data === 'object') {
        // Si es objeto directo
        authResult = data.login_manual || data;
      } else {
        console.log('❌ Respuesta de función manual vacía o inválida');
        return { 
          success: false, 
          error: 'Respuesta inválida del servidor' 
        };
      }

      console.log('🔍 Auth result procesado:', authResult);

      if (!authResult || !authResult.success) {
        console.log('❌ Login manual falló:', authResult?.error);
        return { 
          success: false, 
          error: authResult?.error || 'Credenciales incorrectas' 
        };
      }

      if (!authResult.user) {
        console.log('❌ Usuario no encontrado en respuesta');
        return { 
          success: false, 
          error: 'Usuario no encontrado' 
        };
      }

      // Construir UserProfile
      const userProfile: UserProfile = {
        id: authResult.user.id,
        email: authResult.user.email,
        nombre: authResult.user.nombre,
        apellido: authResult.user.apellido,
        rol: authResult.user.rol as 'admin' | 'empleado',
        sucursal: authResult.user.sucursal
      };

      console.log('✅ Usuario autenticado via manual:', userProfile);

      // Guardar en localStorage
      localStorage.setItem('userSession', JSON.stringify(userProfile));

      return { 
        success: true, 
        user: userProfile 
      };

    } catch (error) {
      console.error('💥 Error crítico en autenticación alternativa:', error);
      return { 
        success: false, 
        error: 'Error de conexión en método alternativo' 
      };
    }
  }
} 