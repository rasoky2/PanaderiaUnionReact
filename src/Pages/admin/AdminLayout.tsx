import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import {
  Dashboard,
  Store,
  People,
  Assignment,
  BarChart,
  Settings,
  Map,
  Fastfood,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { AuthService } from '../../services/auth.service';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  
  // Obtener usuario de forma síncrona para desarrollo
  const userProfile = AuthService.getCurrentUserSync();

  if (!userProfile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Redirigiendo al login...</Typography>
      </Box>
    );
  }

  // Validar que es administrador
  if (userProfile.rol !== 'admin') {
    window.location.href = '/login';
    return null;
  }

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/admin/dashboard',
      active: location.pathname === '/admin/dashboard'
    },
    {
      text: 'Mapa Nacional',
      icon: <Map />,
      path: '/admin/mapa',
      active: location.pathname === '/admin/mapa'
    },
    {
      text: 'Sucursales',
      icon: <Store />,
      path: '/admin/sucursales',
      active: location.pathname.startsWith('/admin/sucursales')
    },
    {
      text: 'Productos',
      icon: <Fastfood />,
      path: '/admin/productos',
      active: location.pathname === '/admin/productos'
    },
    {
      text: 'Solicitudes',
      icon: <Assignment />,
      path: '/admin/solicitudes',
      active: location.pathname === '/admin/solicitudes'
    },
    {
      text: 'Usuarios',
      icon: <People />,
      path: '/admin/usuarios',
      active: location.pathname === '/admin/usuarios'
    },
    {
      text: 'Reportes',
      icon: <BarChart />,
      path: '/admin/reportes',
      active: location.pathname === '/admin/reportes'
    },
    {
      text: 'Configuración',
      icon: <Settings />,
      path: '/admin/configuracion',
      active: location.pathname === '/admin/configuracion'
    },
  ];

  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.active);
    return currentItem ? currentItem.text : 'Dashboard Administrativo';
  };

  return (
    <DashboardLayout
      title={getPageTitle()}
      menuItems={menuItems}
      userProfile={userProfile}
    >
      {children}
    </DashboardLayout>
  );
};

export default AdminLayout;
