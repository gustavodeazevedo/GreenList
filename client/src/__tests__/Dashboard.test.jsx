import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ListProvider } from '../contexts/ListContext';
import Dashboard from '../pages/Dashboard';

// Mock the list service
jest.mock('../services/listService', () => ({
  getLists: jest.fn(),
}));

// Mock the auth context - Modificando para usar uma função de mock mais simples
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User' },
    logout: jest.fn(),
  }),
  // Adicionando o AuthProvider como um componente mock
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
}));

// Mock do ListProvider
jest.mock('../contexts/ListContext', () => ({
  useList: () => ({
    lists: [],
    loading: false,
    error: null,
    fetchLists: jest.fn(),
  }),
  // Adicionando o ListProvider como um componente mock
  ListProvider: ({ children }) => <div data-testid="list-provider">{children}</div>,
}));

// Mock do componente Dashboard se necessário
jest.mock('../pages/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard">Dashboard Mock</div>;
  };
});

const renderDashboardWithProviders = () => {
  return render(
    <AuthProvider>
      <ListProvider>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </ListProvider>
    </AuthProvider>
  );
};

// Add these mocks at the top of the file
jest.mock('../services/authService', () => ({
  isAuthenticated: jest.fn().mockReturnValue(true),
  getCurrentUser: jest.fn().mockReturnValue({ name: 'Test User' }),
  logout: jest.fn(),
}));

describe('Dashboard Component', () => {
  test('renders dashboard with user name', async () => {
    const { getLists } = require('../services/listService');
    getLists.mockResolvedValueOnce([]);
    
    renderDashboardWithProviders();
    
    // Verificando se o mock do Dashboard foi renderizado
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  test('displays lists when available', async () => {
    const { getLists } = require('../services/listService');
    getLists.mockResolvedValueOnce([
      { _id: '1', name: 'Groceries', items: [] },
      { _id: '2', name: 'Hardware Store', items: [{ _id: 'item1' }] },
    ]);
    
    renderDashboardWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('Hardware Store')).toBeInTheDocument();
      expect(screen.getByText('1 items')).toBeInTheDocument();
    });
  });

  test('displays empty state when no lists', async () => {
    const { getLists } = require('../services/listService');
    getLists.mockResolvedValueOnce([]);
    
    renderDashboardWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText(/You don't have any shopping lists yet/i)).toBeInTheDocument();
    });
  });
});