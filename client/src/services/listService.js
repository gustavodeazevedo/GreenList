import axios from 'axios';
import { getAuthToken } from './authService';

const API_URL = 'http://localhost:5000/api/lists';

// Configuração do cabeçalho de autenticação
const authHeader = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Obter todas as listas do usuário
export const getLists = async () => {
  const response = await axios.get(API_URL, authHeader());
  return response.data;
};

// Obter uma lista específica por ID
export const getListById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, authHeader());
  return response.data;
};

// Criar uma nova lista
export const createList = async (listData) => {
  const response = await axios.post(API_URL, listData, authHeader());
  return response.data;
};

// Atualizar uma lista existente
export const updateList = async (id, listData) => {
  const response = await axios.put(`${API_URL}/${id}`, listData, authHeader());
  return response.data;
};

// Excluir uma lista
export const deleteList = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, authHeader());
  return response.data;
};

// Adicionar um item à lista
export const addItem = async (listId, itemData) => {
  const response = await axios.post(`${API_URL}/${listId}/items`, itemData, authHeader());
  return response.data;
};

// Atualizar um item na lista
export const updateItem = async (listId, itemId, itemData) => {
  const response = await axios.put(`${API_URL}/${listId}/items/${itemId}`, itemData, authHeader());
  return response.data;
};

// Excluir um item da lista
export const deleteItem = async (listId, itemId) => {
  const response = await axios.delete(`${API_URL}/${listId}/items/${itemId}`, authHeader());
  return response.data;
};

// Compartilhar uma lista com outro usuário
export const shareList = async (listId, userData) => {
  const response = await axios.post(`${API_URL}/${listId}/share`, userData, authHeader());
  return response.data;
};