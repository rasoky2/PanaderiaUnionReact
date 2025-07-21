import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
} from '@mui/material';
import { getStockStatusColor } from '../config/mapbox.config';

interface DepartmentStatus {
  nombre: string;
  total_sucursales: number;
  estado_general: 'normal' | 'bajo' | 'critico' | 'sin_datos';
}

interface VistaTablaDepartamentosProps {
  data: DepartmentStatus[];
}

const VistaTablaDepartamentos: React.FC<VistaTablaDepartamentosProps> = ({
  data,
}) => {
  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Typography color="text.secondary">
          No hay datos disponibles para mostrar en la tabla.
        </Typography>
      </Box>
    );
  }

  // Filtrar los departamentos que tienen datos
  const filteredData = data.filter(d => d.estado_general !== 'sin_datos');

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Departamento</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
              Estado General
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
              N° Sucursales
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((row) => (
            <TableRow
              key={row.nombre}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.nombre}
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={row.estado_general ? row.estado_general.charAt(0).toUpperCase() + row.estado_general.slice(1) : 'N/A'}
                  style={{
                    backgroundColor: getStockStatusColor(row.estado_general),
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">{row.total_sucursales}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VistaTablaDepartamentos; 