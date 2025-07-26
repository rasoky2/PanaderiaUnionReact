/**
 * Hook para autenticación de clientes
 * @author Panadería Unión
 * @version 1.0.0
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { clienteService } from '../services/cliente.service';
import { Cliente, ClienteLogin, ClienteRegistro } from '../types';

interface ClienteAuthContextType {
  cliente: Cliente | null;
  loading: boolean;
  login: (_credenciales: ClienteLogin) => Promise<void>;
  register: (_datos: ClienteRegistro) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const ClienteAuthContext = createContext<ClienteAuthContextType | undefined>(
  undefined
);

export const ClienteAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un cliente guardado en localStorage
    const clienteGuardado = localStorage.getItem('cliente');
    if (clienteGuardado) {
      try {
        setCliente(JSON.parse(clienteGuardado));
      } catch (error) {
        // Limpiar localStorage si hay error en el parsing
        localStorage.removeItem('cliente');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credenciales: ClienteLogin) => {
    try {
      setLoading(true);
      const clienteData = await clienteService.loginCliente(credenciales);
      setCliente(clienteData);
      localStorage.setItem('cliente', JSON.stringify(clienteData));
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (datos: ClienteRegistro) => {
    try {
      setLoading(true);
      const clienteData = await clienteService.registrarCliente(datos);
      setCliente(clienteData);
      localStorage.setItem('cliente', JSON.stringify(clienteData));
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setCliente(null);
    localStorage.removeItem('cliente');
  };

  const value: ClienteAuthContextType = useMemo(
    () => ({
      cliente,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!cliente,
    }),
    [cliente, loading]
  );

  return (
    <ClienteAuthContext.Provider value={value}>
      {children}
    </ClienteAuthContext.Provider>
  );
};

export const useClienteAuth = (): ClienteAuthContextType => {
  const context = useContext(ClienteAuthContext);
  if (context === undefined) {
    throw new Error(
      'useClienteAuth debe ser usado dentro de ClienteAuthProvider'
    );
  }
  return context;
};
