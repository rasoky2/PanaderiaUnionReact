import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../../services/auth.service';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/empleado/dashboard' },
  { text: 'Gestión de Stock', icon: <InventoryIcon />, path: '/empleado/stock' },
  { text: 'Mis Solicitudes', icon: <AssignmentIcon />, path: '/empleado/solicitudes' },
];

const EmpleadoLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener información del usuario
  const userSession = localStorage.getItem('userSession');
  const userData = userSession ? JSON.parse(userSession) : null;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    handleMenuClose();
    // Cerrar drawer móvil si está abierto
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header con información del usuario */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
          Unión
          <Box component="span" sx={{ 
            ml: 1, 
            px: 1, 
            py: 0.5, 
            border: '1px solid', 
            borderColor: 'primary.main', 
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 'normal'
          }}>
            Sistema
          </Box>
        </Typography>
        
        {userData && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.400', mr: 2 }}>
                {userData.nombre?.charAt(0) || 'E'}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {userData.nombre} {userData.apellido}
                </Typography>
                <Typography variant="body2" sx={{ color: 'primary.main', fontSize: '0.875rem' }}>
                  {userData.email}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{
                bgcolor: 'primary.main',
                color: 'white',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center'
              }}>
                👤 Empleado
              </Box>
            </Box>
            
            <Box sx={{
              bgcolor: 'grey.100',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              color: 'text.secondary',
              display: 'inline-block'
            }}>
              {userData.sucursal_nombre || 'Panadería Unión Lima Centro'}
            </Box>
          </Box>
        )}
      </Box>

      {/* Menú de navegación */}
      <Box sx={{ flexGrow: 1, py: 1 }}>
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Botón cerrar sesión en la parte inferior */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.12)' }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.300',
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'error.light',
              borderColor: 'error.main',
              color: 'error.main',
              '& .MuiListItemIcon-root': {
                color: 'error.main',
              },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Cerrar Sesión"
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Panadería Unión - Empleado
          </Typography>
          
          {userData && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', md: 'block' } }}>
                {userData.nombre} {userData.apellido}
              </Typography>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuClick}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {userData.nombre?.charAt(0) || 'E'}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Perfil</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Cerrar Sesión</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ flexGrow: 1, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default EmpleadoLayout;
