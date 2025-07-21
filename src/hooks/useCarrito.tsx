import { ReactNode, createContext, useContext, useState } from 'react';
import { Producto } from '../types';

export interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

export interface ClienteDatos {
  nombre: string;
  correo: string;
  direccion: string;
}

export interface CarritoContextProps {
  carrito: CarritoItem[];
  agregarAlCarrito: (_producto: Producto) => void;
  quitarDelCarrito: (_productoId: string | number) => void;
  limpiarCarrito: () => void;
  cliente: ClienteDatos;
  setCliente: (_datos: ClienteDatos) => void;
  metodoPago: string;
  setMetodoPago: (_metodo: string) => void;
}

const CarritoContext = createContext<CarritoContextProps | undefined>(
  undefined
);

export const CarritoProvider = ({ children }: { children: ReactNode }) => {
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [cliente, setCliente] = useState<ClienteDatos>({
    nombre: '',
    correo: '',
    direccion: '',
  });
  const [metodoPago, setMetodoPago] = useState<string>('');

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.producto.id === producto.id);
      if (existe) {
        return prev.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        return [...prev, { producto, cantidad: 1 }];
      }
    });
  };

  const quitarDelCarrito = (productoId: string | number) => {
    setCarrito(prev => prev.filter(item => item.producto.id !== productoId));
  };

  const limpiarCarrito = () => setCarrito([]);

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        quitarDelCarrito,
        limpiarCarrito,
        cliente,
        setCliente,
        metodoPago,
        setMetodoPago,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context)
    throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return context;
};
