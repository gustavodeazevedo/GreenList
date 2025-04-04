import axios from 'axios';

// Determinar a URL base com base no ambiente
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const baseURL = isDevelopment ? 'http://localhost:5000' : 'https://greenlist.onrender.com';

const api = axios.create({
  baseURL, // URL do servidor baseada no ambiente
  headers: {
    'Content-Type': 'application/json'
  }
});

// Adicionar interceptor para incluir o token em todas as requisições
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Adicionar interceptor para tratar erros de resposta
api.interceptors.response.use(
  response => response,
  error => {
    console.error('Response error:', error);

    // Se o erro for 401 (não autorizado), limpar o localStorage
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

export default api;