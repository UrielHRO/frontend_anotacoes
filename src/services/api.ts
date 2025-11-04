import axios, { AxiosError } from 'axios';

// 1. Ler a URL do ambiente
// VITE_API_URL virá de .env.mongo ou .env.postgres
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  // Isso avisa se você esqueceu de rodar com 'dev:mongo' ou 'dev:postgres'
  console.error("VITE_API_URL não está definida! Crie um .env.[modo] ou use npm run dev:mongo / dev:postgres");
}

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para lidar com token expirado (REQUISITO AVANÇADO)
api.interceptors.response.use(
  (response) => response, // Sucesso, apenas retorne a resposta
  (error: AxiosError) => {
    // Se o erro for 401 (Não Autorizado) - ex: token expirado
    if (error.response?.status === 401) {
      localStorage.removeItem('@App:token');
      localStorage.removeItem('@App:user');
      // Recarrega a página, o AuthContext vai ver que não tem token e redirecionar
      window.location.reload(); 
    }
    return Promise.reject(error);
  }
);