import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ListProvider } from '../contexts/ListContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import ListDetail from '../pages/ListDetail';
import { getListById, addItem, updateItem, deleteItem, shareList } from '../services/listService';

// Mock the list service
jest.mock('../services/listService', () => ({
  getListById: jest.fn(),
  addItem: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
  shareList: jest.fn(),
}));

// Mock the useParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'test-list-id' }),
}));

const renderListDetailWithProviders = () => {
  return render(
    <AuthProvider>
      <ListProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="*" element={<ListDetail />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </ListProvider>
    </AuthProvider>
  );
};

describe('ListDetail Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock the fetchList function in ListContext
    getListById.mockResolvedValue({
      _id: 'test-list-id',
      name: 'Test Shopping List',
      items: [
        { _id: 'item1', name: 'Milk', quantity: 1, unit: 'liter', completed: false },
        { _id: 'item2', name: 'Bread', quantity: 2, unit: 'unit', completed: true },
      ],
      sharedWith: [],
    });
  });

  test('renders list details correctly', async () => {
    renderListDetailWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Test Shopping List')).toBeInTheDocument();
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
      expect(screen.getByText('1 liter')).toBeInTheDocument();
      expect(screen.getByText('2 unit')).toBeInTheDocument();
    });
  });

  test('adds a new item to the list', async () => {
    addItem.mockResolvedValue({
      _id: 'item3',
      name: 'Eggs',
      quantity: 12,
      unit: 'unit',
      completed: false,
    });
    
    renderListDetailWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Test Shopping List')).toBeInTheDocument();
    });
    
    // Fill the add item form
    fireEvent.change(screen.getByPlaceholderText('Item name'), {
      target: { value: 'Eggs' },
    });
    
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '12' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));
    
    await waitFor(() => {
      expect(addItem).toHaveBeenCalledWith('test-list-id', {
        name: 'Eggs',
        quantity: 12,
        unit: 'unit',
        completed: false,
      });
    });
  });

  test('toggles item completion status', async () => {
    updateItem.mockResolvedValue({
      _id: 'item1',
      name: 'Milk',
      quantity: 1,
      unit: 'liter',
      completed: true,
    });
    
    renderListDetailWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });
    
    // Find the checkbox for the Milk item and click it
    const milkCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(milkCheckbox);
    
    await waitFor(() => {
      expect(updateItem).toHaveBeenCalledWith('test-list-id', 'item1', {
        completed: true,
      });
    });
  });

  test('deletes an item from the list', async () => {
    deleteItem.mockResolvedValue({});
    
    // Mock window.confirm to return true
    window.confirm = jest.fn().mockImplementation(() => true);
    
    renderListDetailWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });
    
    // Find the delete button for the Milk item and click it
    const deleteButtons = screen.getAllByRole('button', { name: /Remove/i });
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(deleteItem).toHaveBeenCalledWith('test-list-id', 'item1');
    });
  });

  test('shares the list with another user', async () => {
    shareList.mockResolvedValue({});
    
    renderListDetailWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Test Shopping List')).toBeInTheDocument();
    });
    
    // Fill the share form
    fireEvent.change(screen.getByPlaceholderText('Enter email to share with'), {
      target: { value: 'friend@example.com' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Share$/i }));
    
    await waitFor(() => {
      expect(shareList).toHaveBeenCalledWith('test-list-id', {
        email: 'friend@example.com',
      });
    });
  });
});

// Add these mocks at the top of the file
jest.mock('../services/authService', () => ({
  isAuthenticated: jest.fn().mockReturnValue(true),
  getCurrentUser: jest.fn().mockReturnValue({ name: 'Test User' }),
  logout: jest.fn(),
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User' },
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
}));

jest.mock('../contexts/ListContext', () => ({
  useList: () => ({
    currentList: null,
    loading: false,
    error: null,
    fetchList: jest.fn(),
  }),
  ListProvider: ({ children }) => <div data-testid="list-provider">{children}</div>,
}));

jest.mock('../contexts/NotificationContext', () => ({
  useNotification: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
  }),
  NotificationProvider: ({ children }) => <div data-testid="notification-provider">{children}</div>,
}));

// E também mock para o componente ListDetail se necessário
jest.mock('../pages/ListDetail', () => {
  return function MockListDetail() {
    return <div data-testid="list-detail">List Detail Mock</div>;
  };
});