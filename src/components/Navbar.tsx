import { ArrowForward, Logout, Person, Storefront } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useClienteAuth } from '../hooks/useClienteAuth';

const COLOR_PRIMARY_MAIN = 'primary.main';
const COLOR_PRIMARY_DARK = 'primary.dark';
const COLOR_GREY_100 = 'grey.100';
const COLOR_GREY_200 = 'grey.200';
const COLOR_GREY_700 = 'grey.700';
const COLOR_WHITE = 'white';

// Constantes para estilos repetidos
const BUTTON_BASE_STYLES = {
  fontWeight: 500,
  textTransform: 'none' as const,
  minWidth: 0,
  boxShadow: 'none',
  transition: 'all 0.2s ease',
};

const BUTTON_HOVER_STYLES = {
  transform: 'translateY(-1px)',
};

const BUTTON_SHADOW_PRIMARY = '0 2px 8px rgba(220, 38, 38, 0.10)';
const BUTTON_SHADOW_SECONDARY = '0 2px 8px rgba(0, 0, 0, 0.10)';

const PRIMARY_BUTTON_STYLES = {
  ...BUTTON_BASE_STYLES,
  borderColor: COLOR_PRIMARY_MAIN,
  color: COLOR_PRIMARY_MAIN,
  px: 2,
  py: 0.5,
  borderRadius: 2,
  fontSize: '0.85rem',
  '&:hover': {
    borderColor: COLOR_PRIMARY_DARK,
    color: COLOR_PRIMARY_DARK,
    backgroundColor: COLOR_GREY_100,
    boxShadow: BUTTON_SHADOW_PRIMARY,
    ...BUTTON_HOVER_STYLES,
  },
};

const SECONDARY_BUTTON_STYLES = {
  ...BUTTON_BASE_STYLES,
  borderColor: COLOR_GREY_700,
  color: COLOR_GREY_700,
  px: 2,
  py: 0.5,
  borderRadius: 2,
  fontSize: '0.85rem',
  '&:hover': {
    borderColor: COLOR_GREY_700,
    color: COLOR_GREY_700,
    backgroundColor: COLOR_GREY_100,
    boxShadow: BUTTON_SHADOW_SECONDARY,
    ...BUTTON_HOVER_STYLES,
  },
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cliente, isAuthenticated, logout } = useClienteAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  function handleLoginClick() {
    navigate('/login');
  }

  function handleHomeClick() {
    navigate('/');
  }

  function handleTiendaClick() {
    navigate('/tienda');
  }

  function handleClienteLoginClick() {
    navigate('/cliente-login');
  }

  function handleClienteMenuClick(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClienteMenuClose() {
    setAnchorEl(null);
  }

  function handleClienteLogout() {
    logout();
    handleClienteMenuClose();
    navigate('/');
  }

  // Funciones nombradas para los handlers
  function handleMenuItemClick() {
    handleClienteMenuClose();
  }

  function handleLogoutClick() {
    handleClienteLogout();
  }

  function handleTiendaButtonClick() {
    handleTiendaClick();
  }

  function handleClienteMenuButtonClick(event: React.MouseEvent<HTMLElement>) {
    handleClienteMenuClick(event);
  }

  function handleClienteLoginButtonClick() {
    handleClienteLoginClick();
  }

  function handleEmployeesButtonClick() {
    handleLoginClick();
  }

  const isLoginPage = location.pathname === '/login';
  const isClienteLoginPage = location.pathname === '/cliente-login';
  const isClienteRegistroPage = location.pathname === '/cliente-registro';
  const isTiendaVirtualPage = location.pathname === '/tienda';
  const isCheckoutPage = location.pathname === '/checkout';
  const isPaymentPage = location.pathname === '/payment';
  const isHomePage = location.pathname === '/';

  // Función para renderizar botones de autenticación
  function renderAuthButtons() {
    if (isHomePage) {
      return null;
    }

    if (isAuthenticated) {
      return (
        <>
          <Button
            onClick={handleClienteMenuButtonClick}
            variant='outlined'
            startIcon={<Person />}
            sx={{
              borderColor: COLOR_PRIMARY_MAIN,
              color: COLOR_PRIMARY_MAIN,
              fontWeight: 500,
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.9rem',
              minWidth: 0,
              boxShadow: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: COLOR_PRIMARY_DARK,
                color: COLOR_PRIMARY_DARK,
                backgroundColor: COLOR_GREY_100,
                boxShadow: BUTTON_SHADOW_PRIMARY,
                transform: 'translateY(-1px)',
              },
            }}
          >
            {cliente?.nombre}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClienteMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleMenuItemClick}>
              <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                {cliente?.nombre?.charAt(0)}
              </Avatar>
              {cliente?.nombre} {cliente?.apellido}
            </MenuItem>
            <MenuItem onClick={handleLogoutClick}>
              <Logout sx={{ mr: 1, fontSize: 20 }} />
              Cerrar sesión
            </MenuItem>
          </Menu>
        </>
      );
    }

    return (
      <Button
        onClick={handleClienteLoginButtonClick}
        variant='outlined'
        sx={PRIMARY_BUTTON_STYLES}
      >
        Iniciar Sesión
      </Button>
    );
  }

  // Función para renderizar botón de empleados
  function renderEmployeesButton() {
    if (isTiendaVirtualPage || isCheckoutPage || isPaymentPage) {
      return null;
    }

    return (
      <Button
        onClick={handleEmployeesButtonClick}
        variant='outlined'
        endIcon={<ArrowForward />}
        sx={SECONDARY_BUTTON_STYLES}
      >
        Empleados
      </Button>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: COLOR_WHITE,
        borderBottom: 1,
        borderBottomColor: COLOR_GREY_200,
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <Container maxWidth='lg'>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
          }}
        >
          <Stack direction='row' alignItems='center' spacing={3}>
            <Typography
              variant='h5'
              component='div'
              onClick={handleHomeClick}
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.4rem', md: '1.7rem' },
                color: COLOR_PRIMARY_MAIN,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: COLOR_PRIMARY_DARK,
                  transform: 'scale(1.02)',
                },
              }}
            >
              Unión
            </Typography>
            <Chip
              label='Saludable por Naturaleza'
              size='small'
              sx={{
                backgroundColor: COLOR_GREY_100,
                color: COLOR_GREY_700,
                fontWeight: 500,
                fontSize: '0.75rem',
                height: 28,
                display: { xs: 'none', md: 'flex' },
                '&:hover': {
                  backgroundColor: COLOR_GREY_200,
                },
              }}
            />
          </Stack>
          {!isLoginPage && !isClienteLoginPage && !isClienteRegistroPage && (
            <Stack direction='row' spacing={2}>
              <Button
                onClick={handleTiendaButtonClick}
                variant='contained'
                startIcon={<Storefront />}
                sx={{
                  backgroundColor: COLOR_PRIMARY_MAIN,
                  color: COLOR_WHITE,
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2.5,
                  fontSize: '1.05rem',
                  textTransform: 'none',
                  boxShadow: BUTTON_SHADOW_PRIMARY,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: COLOR_PRIMARY_DARK,
                    boxShadow: '0 4px 16px rgba(220, 38, 38, 0.18)',
                    transform: 'translateY(-2px) scale(1.03)',
                  },
                }}
              >
                Tienda Virtual
              </Button>

              {renderAuthButtons()}
              {renderEmployeesButton()}
            </Stack>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Navbar;
