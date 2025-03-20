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
    
    // Adicionar log detalhado para respostas de login
    if (response.config.url.includes('/api/users/login')) {
      console.log('Login response structure:', {
        hasUser: !!response.data.user,
        hasToken: !!response.data.token,
        dataKeys: Object.keys(response.data),
        fullData: response.data
      });
      
      // Se a resposta for de login, vamos tentar extrair e formatar os dados do usuário
      if (response.data) {
        try {
          // Extrair dados do usuário com base na estrutura da resposta
          const userData = {
            id: response.data.user?._id || response.data._id || response.data.id,
            name: response.data.user?.name || response.data.name || 'Usuário',
            email: response.data.user?.email || response.data.email
          };
          
          const token = response.data.token;
          
          if (userData.id && token) {
            console.log('Extracted user data:', userData);
            // Armazenar dados formatados na resposta para uso posterior
            response.data.extractedUserData = userData;
            response.data.extractedToken = token;
          }
        } catch (err) {
          console.error('Error extracting user data:', err);
        }
      }
    }
    
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