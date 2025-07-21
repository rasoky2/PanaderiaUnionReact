import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Stack,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  Store,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthService, UserProfile } from '../services/auth.service';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  menuItems: Array<{
    text: string;
    icon: React.ReactElement;
    path: string;
    active?: boolean;
  }>;
  userProfile: UserProfile;
}

const DRAWER_WIDTH = 280;

const DashboardLayout = ({
  children,
  title,
  menuItems,
  userProfile,
}: DashboardLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await AuthService.signOut();
    navigate('/login');
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box>
      {/* Header del Sidebar */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 800,
              color: 'primary.main'
            }}
          >
            Unión
          </Typography>
          <Chip 
            label="Sistema"
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>
      </Box>

      {/* Información del Usuario */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ width: 48, height: 48, mr: 2 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {`${userProfile.nombre} ${userProfile.apellido}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {userProfile.email}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
         <Chip 
            icon={<Store />}
            label={userProfile.rol === 'admin' ? 'Administrador' : 'Empleado'}
            color={userProfile.rol === 'admin' ? 'primary' : 'secondary'}
            size="small"
            variant="filled"
          />
         {userProfile.sucursal && (
           <Chip 
             label={userProfile.sucursal}
             size="small"
             variant="outlined"
           />
         )}
        </Stack>
      </Box>
      <Divider />

      {/* Menú de Navegación */}
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleMenuClick(item.path)}
              sx={{
                borderRadius: 2,
                backgroundColor: item.active ? 'primary.main' : 'transparent',
                color: item.active ? 'white' : 'inherit',
                '&:hover': {
                  backgroundColor: item.active ? 'primary.dark' : 'action.hover',
                },
                py: 1.5
              }}
            >
              <ListItemIcon sx={{ 
                color: item.active ? 'white' : 'inherit',
                minWidth: 40 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: item.active ? 600 : 400,
                  fontSize: '0.95rem'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Botón de Cerrar Sesión */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            borderColor: 'grey.300',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'error.main',
              color: 'error.main',
              backgroundColor: 'error.50'
            }
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar Superior */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer/Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: 1,
              borderColor: 'divider'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Área de Contenido Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default'
        }}
      >
        <Toolbar /> {/* Espaciador para el AppBar */}
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout; 