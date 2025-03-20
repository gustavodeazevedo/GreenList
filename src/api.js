import axios from 'axios';

const api = axios.create({
  baseURL: 'https://greenlist.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // Adding a timeout of 10 seconds
});

// Adicionar interceptor para incluir o token em todas as requisições
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  error => {
    console.error('Request configuration error:', error);
    return Promise.reject(error);
  }
);

// Adicionar interceptor para tratar erros de resposta
api.interceptors.response.use(
  response => {
    console.log(`Successful response from: ${response.config.url}`);
    return response;
  },
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server error response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url,
        method: error.config.method
      });
      
      // Se o erro for 401 (não autorizado), limpar o localStorage
      if (error.response.status === 401) {
        console.log('Authentication error, clearing local storage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login page
        window.location.href = '/';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', {
        request: error.request,
        url: error.config.url,
        method: error.config.method
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;