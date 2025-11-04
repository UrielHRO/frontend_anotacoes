import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { AxiosError } from 'axios';
import { type AuthProviderProps, type DecodedToken, type User, type AuthResult } from '../types';
import { AuthContext } from '../hooks/useAuth'; 


export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('@App:token');
    const storedUser = localStorage.getItem('@App:user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser) as User);
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken } = response.data;

      const decodedToken = jwtDecode(newToken) as DecodedToken;
      
      const userData: User = {
        id: decodedToken.id,
        _id: typeof decodedToken.id === 'string' ? decodedToken.id : undefined,
        name: decodedToken.name,
        email: email, 
      };

      localStorage.setItem('@App:token', newToken);
      localStorage.setItem('@App:user', JSON.stringify(userData));

      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData);
      return { success: true };

    } catch (error) {
      let message = 'Erro no login.';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      console.error('Falha no login:', message);
      return { success: false, message: message };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    try {
      await api.post('/auth/register', { name, email, password });
      return { success: true };
    } catch (error) {
      let message = 'Erro no registro.';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      console.error('Falha no registro:', message);
      return { success: false, message: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('@App:token');
    localStorage.removeItem('@App:user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};