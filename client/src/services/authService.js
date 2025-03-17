import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

// Função para registrar um novo usuário
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Função para fazer login
export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Função para fazer logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Verificar se o usuário está autenticado
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Obter o usuário atual
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Obter o token de autenticação
export const getAuthToken = () => {
  return localStorage.getItem('token');
};