import { type ReactNode } from 'react';

// O que esperamos que o token decodificado contenha
export interface DecodedToken {
  id: number | string; // <-- Pode ser número (Postgres) ou string (Mongo)
  name: string;
  iat: number;
  exp: number;
}

// Nosso objeto de Usuário no frontend
export interface User {
  id: number | string; // <-- Postgres usa 'id'
  _id?: string;         // <-- Mongo usa '_id'
  name: string; 
  email: string; 
}

// Nossa entidade de Anotação
export interface Note {
  id: number | string; // <-- Postgres usa 'id' (number)
  _id?: string;         // <-- Mongo usa '_id' (string)
  title: string;
  content: string;
  authorId?: number | string; // Postgres usa 'authorId'
  author?: string;            // Mongo pode usar 'author'
  createdAt: string;
  updatedAt: string;
}

// O que o contexto de autenticação vai prover
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
}

// Tipo para o resultado das funções de auth
export type AuthResult = {
  success: boolean;
  message?: string;
};

// Tipo para props do AuthProvider
export type AuthProviderProps = {
  children: ReactNode;
};