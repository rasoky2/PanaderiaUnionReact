import {
  CssBaseline,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Checkout from './Pages/Checkout';
import ClienteLoginPage from './Pages/ClienteLogin';
import ClienteRegistroPage from './Pages/ClienteRegistro';
import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import Payment from './Pages/Payment';
import TiendaVirtual from './Pages/TiendaVirtual';
import AdminDashboard from './Pages/admin/AdminDashboard';
import AdminLayout from './Pages/admin/AdminLayout';
import MapaNacional from './Pages/admin/MapaNacional';
import ProductosPage from './Pages/admin/Productos';
import ReportesPage from './Pages/admin/Reportes';
import SolicitudesPage from './Pages/admin/Solicitudes';
import SucursalesPage from './Pages/admin/Sucursales';
import UsuariosPage from './Pages/admin/Usuarios';
import EmpleadoDashboard from './Pages/empleado/EmpleadoDashboard';
import EmpleadoLayout from './Pages/empleado/EmpleadoLayout';
import StockGestion from './Pages/empleado/StockGestion';
import { CarritoProvider } from './hooks/useCarrito';
import { ClienteAuthProvider } from './hooks/useClienteAuth';

// Constantes para evitar duplicación de strings literales
const FONT_FAMILY_MONTSERRAT = '"Montserrat", sans-serif';
const FONT_FAMILY_FULL =
  '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif';

// Tema profesional basado en la identidad visual de Panadería Unión
const theme = createTheme({
  palette: {
    primary: {
      main: '#DC2626', // Rojo corporativo
      light: '#FEE2E2', // Rojo muy claro
      dark: '#991B1B', // Rojo oscuro
    },
    secondary: {
      main: '#1E40AF', // Azul corporativo
      light: '#DBEAFE', // Azul muy claro
      dark: '#1E3A8A', // Azul oscuro
    },
    error: {
      main: '#DC2626',
    },
    warning: {
      main: '#D97706',
    },
    info: {
      main: '#2563EB',
    },
    success: {
      main: '#059669',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
    },
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  typography: {
    fontFamily: FONT_FAMILY_FULL,
    h1: {
      fontWeight: 700,
      fontFamily: FONT_FAMILY_MONTSERRAT,
    },
    h2: {
      fontWeight: 600,
      fontFamily: FONT_FAMILY_MONTSERRAT,
    },
    h3: {
      fontWeight: 600,
      fontFamily: FONT_FAMILY_MONTSERRAT,
    },
    h4: {
      fontWeight: 600,
      fontFamily: FONT_FAMILY_MONTSERRAT,
    },
    h5: {
      fontWeight: 500,
      fontFamily: FONT_FAMILY_MONTSERRAT,
    },
    h6: {
      fontWeight: 500,
      fontFamily: FONT_FAMILY_MONTSERRAT,
    },
    subtitle1: {
      fontFamily: FONT_FAMILY_MONTSERRAT,
    },
    subtitle2: {
      fontFamily: FONT_FAMILY_MONTSERRAT,
    },
    body1: {
      fontFamily: FONT_FAMILY_MONTSERRAT,
    },
    body2: {
      fontFamily: FONT_FAMILY_MONTSERRAT,
    },
    button: {
      fontFamily: FONT_FAMILY_MONTSERRAT,
      fontWeight: 600,
    },
    caption: {
      fontFamily: FONT_FAMILY_MONTSERRAT,
    },
    overline: {
      fontFamily: FONT_FAMILY_MONTSERRAT,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: FONT_FAMILY_MONTSERRAT,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontFamily: FONT_FAMILY_MONTSERRAT,
          },
          '& .MuiInputLabel-root': {
            fontFamily: FONT_FAMILY_MONTSERRAT,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: FONT_FAMILY_MONTSERRAT,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: FONT_FAMILY_MONTSERRAT,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: FONT_FAMILY_MONTSERRAT,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily: FONT_FAMILY_MONTSERRAT,
        },
      },
    },
  },
});

function App() {
  return (
    <ClienteAuthProvider>
      <CarritoProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path='/login' element={<LoginPage />} />
              <Route path='/cliente-login' element={<ClienteLoginPage />} />
              <Route
                path='/cliente-registro'
                element={<ClienteRegistroPage />}
              />
              <Route path='/tienda' element={<TiendaVirtual />} />
              <Route path='/checkout' element={<Checkout />} />
              <Route path='/payment' element={<Payment />} />
              {/* Rutas del Administrador */}
              <Route
                path='/admin/dashboard'
                element={
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                }
              />
              <Route
                path='/admin/mapa'
                element={
                  <AdminLayout>
                    <MapaNacional />
                  </AdminLayout>
                }
              />
              <Route
                path='/admin/sucursales'
                element={
                  <AdminLayout>
                    <SucursalesPage />
                  </AdminLayout>
                }
              />
              <Route
                path='/admin/productos'
                element={
                  <AdminLayout>
                    <ProductosPage />
                  </AdminLayout>
                }
              />
              <Route
                path='/admin/solicitudes'
                element={
                  <AdminLayout>
                    <SolicitudesPage />
                  </AdminLayout>
                }
              />
              <Route
                path='/admin/usuarios'
                element={
                  <AdminLayout>
                    <UsuariosPage />
                  </AdminLayout>
                }
              />
              <Route
                path='/admin/reportes'
                element={
                  <AdminLayout>
                    <ReportesPage />
                  </AdminLayout>
                }
              />
              <Route
                path='/admin/configuracion'
                element={
                  <AdminLayout>
                    <Typography variant='h4'>
                      Configuración - En Desarrollo
                    </Typography>
                  </AdminLayout>
                }
              />

              {/* Rutas del Empleado */}
              <Route path='/empleado' element={<EmpleadoLayout />}>
                <Route path='dashboard' element={<EmpleadoDashboard />} />
                <Route path='stock' element={<StockGestion />} />
                <Route
                  path='solicitudes'
                  element={
                    <Typography variant='h4'>
                      Mis Solicitudes - En Desarrollo
                    </Typography>
                  }
                />
                <Route
                  path='perfil'
                  element={
                    <Typography variant='h4'>
                      Mi Perfil - En Desarrollo
                    </Typography>
                  }
                />
                <Route
                  path='notificaciones'
                  element={
                    <Typography variant='h4'>
                      Notificaciones - En Desarrollo
                    </Typography>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </ThemeProvider>
      </CarritoProvider>
    </ClienteAuthProvider>
  );
}

export default App;
