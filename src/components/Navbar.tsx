import { ArrowForward, Storefront } from '@mui/icons-material';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const COLOR_PRIMARY_MAIN = 'primary.main';
const COLOR_PRIMARY_DARK = 'primary.dark';
const COLOR_GREY_100 = 'grey.100';
const COLOR_GREY_200 = 'grey.200';
const COLOR_GREY_700 = 'grey.700';
const COLOR_WHITE = 'white';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  function handleLoginClick() {
    navigate('/login');
  }

  function handleHomeClick() {
    navigate('/');
  }

  function handleTiendaClick() {
    navigate('/tienda');
  }

  const isLoginPage = location.pathname === '/login';

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
          {!isLoginPage && (
            <Stack direction='row' spacing={2}>
              <Button
                onClick={handleTiendaClick}
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
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.10)',
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
              <Button
                onClick={handleLoginClick}
                variant='outlined'
                endIcon={<ArrowForward />}
                sx={{
                  borderColor: COLOR_PRIMARY_MAIN,
                  color: COLOR_PRIMARY_MAIN,
                  fontWeight: 500,
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  minWidth: 0,
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: COLOR_PRIMARY_DARK,
                    color: COLOR_PRIMARY_DARK,
                    backgroundColor: COLOR_GREY_100,
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.10)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Acceso Empleados
              </Button>
            </Stack>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Navbar;
