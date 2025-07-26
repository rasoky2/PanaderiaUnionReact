/**
 * Hook para gestión del carrito de compras
 * @author Panadería Unión
 * @version 1.0.0
 */

import React, { createContext, useContext, useMemo, useState } from 'react';
import { ClienteDatos, Producto } from '../types';

export interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

interface CarritoContextProps {
  carrito: CarritoItem[];
  agregarAlCarrito: (_producto: Producto) => void;
  quitarDelCarrito: (_productoId: number | string) => void;
  limpiarCarrito: () => void;
  cliente: ClienteDatos;
  setCliente: (_datos: ClienteDatos) => void;
  metodoPago: string;
  setMetodoPago: (_metodo: string) => void;
  sucursalSeleccionada: string;
  setSucursalSeleccionada: (_sucursal: string) => void;
}

const CarritoContext = createContext<CarritoContextProps | undefined>(
  undefined
);

export const CarritoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [cliente, setCliente] = useState<ClienteDatos>({
    nombre: '',
    correo: '',
    direccion: '',
  });
  const [metodoPago, setMetodoPago] = useState<string>('');
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('');

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prevCarrito => {
      const itemExistente = prevCarrito.find(
        item => item.producto.id === producto.id
      );

      if (itemExistente) {
        return prevCarrito.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prevCarrito, { producto, cantidad: 1 }];
    });
  };

  const quitarDelCarrito = (productoId: number | string) => {
    setCarrito(prevCarrito =>
      prevCarrito.filter(item => item.producto.id !== productoId)
    );
  };

  const limpiarCarrito = () => {
    setCarrito([]);
  };

  const value: CarritoContextProps = useMemo(
    () => ({
      carrito,
      agregarAlCarrito,
      quitarDelCarrito,
      limpiarCarrito,
      cliente,
      setCliente,
      metodoPago,
      setMetodoPago,
      sucursalSeleccionada,
      setSucursalSeleccionada,
    }),
    [carrito, cliente, metodoPago, sucursalSeleccionada]
  );

  return (
    <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>
  );
};

export const useCarrito = (): CarritoContextProps => {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito debe ser usado dentro de CarritoProvider');
  }
  return context;
};
