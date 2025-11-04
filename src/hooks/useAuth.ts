import { useContext, createContext } from 'react';
import { type AuthContextType } from '../types';


export const AuthContext = createContext<AuthContextType | null>(null);

// O hook para consumir o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};