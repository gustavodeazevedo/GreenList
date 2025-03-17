import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../pages/Login';

// Mock the auth service with all required functions
jest.mock('../services/authService', () => ({
  login: jest.fn(),
  isAuthenticated: jest.fn().mockReturnValue(false),
  getCurrentUser: jest.fn().mockReturnValue(null),
}));

// Mock the AuthContext to avoid using the real implementation
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
  }),
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
}));

const renderLoginWithProviders = () => {
  return render(
    <AuthProvider>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </AuthProvider>
  );
};

describe('Login Component', () => {
  test('renders login form', () => {
    renderLoginWithProviders();
    
    expect(screen.getByText(/Login to GreenList/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('validates form inputs', async () => {
    renderLoginWithProviders();
    
    const loginButton = screen.getByRole('button', { name: /Login/i });
    
    // Try to submit without filling the form
    fireEvent.click(loginButton);
    
    // Check that validation is working
    expect(screen.getByLabelText(/Email/i)).toBeInvalid();
    expect(screen.getByLabelText(/Password/i)).toBeInvalid();
  });

  test('submits form with valid data', async () => {
    const { login } = require('../services/authService');
    login.mockResolvedValueOnce({ user: { name: 'Test User' } });
    
    renderLoginWithProviders();
    
    // Fill the form
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    
    // Check that login was called with correct data
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});