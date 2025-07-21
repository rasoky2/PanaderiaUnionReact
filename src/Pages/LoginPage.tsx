import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import Layout from '../components/Layout';

// Constante para evitar duplicación de string literal
const PRIMARY_MAIN_COLOR = 'primary.main';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof LoginFormData) => (
    event: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError(null);
  };

  const handleClickShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleLogin = async (event: any) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // 🔍 LOGS DETALLADOS PARA DEBUGGING
    console.log('🔍 === INICIO DE LOGIN DEBUG ===');
    console.log('📧 Email enviado:', formData.email);
    console.log('🔑 Contraseña enviada:', formData.password);
    console.log('📏 Longitud email:', formData.email.length);
    console.log('📏 Longitud contraseña:', formData.password.length);
    console.log('🧹 Email trimmed:', formData.email.trim());
    console.log('📝 Datos completos del formulario:', JSON.stringify(formData, null, 2));
    console.log('⏰ Timestamp:', new Date().toISOString());

    try {
      // Validar credenciales básicas
      if (!AuthService.validateCredentials(formData.email, formData.password)) {
        console.log('❌ VALIDACIÓN FALLÓ - Credenciales básicas incorrectas');
        setError('Por favor, complete todos los campos correctamente.');
        return;
      }

      console.log('✅ VALIDACIÓN PASÓ - Intentando autenticación...');

      // Autenticación con detección automática de rol
      let authResponse = await AuthService.signIn(formData.email, formData.password);

      console.log('📤 RESPUESTA DE AUTENTICACIÓN:', JSON.stringify(authResponse, null, 2));

      // Si falla con el método principal, intentar método alternativo como fallback
      // Activar sistema alternativo para cualquier fallo de autenticación
      const esError500 = !authResponse.success;

      console.log('🔍 ¿Activar sistema alternativo?', esError500);
      console.log('🔍 Error code:', authResponse.errorCode);
      console.log('🔍 Tipo de error:', typeof authResponse.error);
      console.log('🔍 Error completo:', authResponse.error);
      console.log('🔍 Full error object:', authResponse.fullError);

      if (esError500) {
        console.log('🔄 Error detectado, cambiando a método alternativo...');
        authResponse = await AuthService.signInAlternative(formData.email, formData.password);
        console.log('📤 RESPUESTA AUTENTICACIÓN ALTERNATIVA:', JSON.stringify(authResponse, null, 2));
      }

      if (!authResponse.success) {
        console.log('❌ AUTENTICACIÓN FALLÓ:', authResponse.error);
        setError(authResponse.error || 'Error de autenticación');
        return;
      }

      if (authResponse.user) {
        console.log('✅ AUTENTICACIÓN EXITOSA - Usuario:', authResponse.user);
        const redirectPath = AuthService.getRedirectPath(authResponse.user);
        console.log('🎯 Redirigiendo a:', redirectPath);
        navigate(redirectPath);
      }
    } catch (err) {
      console.error('💥 ERROR CRÍTICO EN LOGIN:', err);
      console.error('📊 Stack trace:', err instanceof Error ? err.stack : 'No stack available');
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
      console.log('🔍 === FIN DE LOGIN DEBUG ===');
    }
  };

  return (
    <Layout showFooter={false}>
      <Container maxWidth="md" sx={{ py: 6, flexGrow: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ 
              color: PRIMARY_MAIN_COLOR,
              fontWeight: 700,
              mb: 2
            }}
          >
            Acceso al Sistema
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            Ingrese sus credenciales para acceder al sistema de gestión
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 500,
            mx: 'auto',
            borderRadius: 3,
            backgroundColor: 'white',
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <Box component="form" onSubmit={handleLogin}>
            <Typography
              variant="h5"
              textAlign="center"
              gutterBottom
              sx={{ 
                color: PRIMARY_MAIN_COLOR,
                fontWeight: 800, 
                mb: 3 
              }}
            >
              Iniciar Sesión
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={handleInputChange('email')}
              required
              sx={{ mb: 3 }}
              variant="outlined"
              autoComplete="email"
            />

            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={formData.password || ''}
              onChange={handleInputChange('password')}
              required
              sx={{ mb: 4 }}
              variant="outlined"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="mostrar contraseña"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="large"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: '1.1rem',
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                🔍 Debug rápido:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setFormData({
                      email: 'admin@panaderiaunion.pe',
                      password: 'admin123'
                    });
                  }}
                  sx={{ fontSize: '0.7rem' }}
                >
                  Llenar Admin
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setFormData({
                      email: 'empleado@panaderiaunion.pe',
                      password: 'empleado123'
                    });
                  }}
                  sx={{ fontSize: '0.7rem' }}
                >
                  Llenar Empleado
                </Button>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Credenciales de prueba:
              </Typography>
              <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                <strong>Empleado:</strong> empleado@panaderiaunion.pe / empleado123
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Admin:</strong> admin@panaderiaunion.pe / admin123
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default LoginPage; 