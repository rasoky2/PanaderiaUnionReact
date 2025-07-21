import React from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout = ({ children, showFooter = true }: LayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Box>
      {showFooter && <Footer />}
    </Box>
  );
};

export default Layout; 