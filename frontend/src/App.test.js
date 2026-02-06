import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the AuthContext since App uses AuthProvider
jest.mock('./context/AuthContext', () => ({
    AuthProvider: ({ children }) => <div>{children}</div>,
    useAuth: () => ({
        user: null,
        loading: false,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        isAuthenticated: false
    })
}));

// Mock ToastContainer to avoid issues
jest.mock('react-toastify', () => ({
    ToastContainer: () => <div>ToastContainer</div>
}));

test('renders App without crashing', () => {
    render(<App />);
    // Check if the login page is rendered (since public route redirects to login if not auth)
    // or checks for main title if it's visible.
    // Based on App.js routing: / -> /dashboard -> Protected -> Login if not authenticated.
    // So likely we will see Login page or just "Loading..." if mocked that way.
    // But App renders Context Providers first.
});
