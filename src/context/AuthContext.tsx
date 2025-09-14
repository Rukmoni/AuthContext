import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { saveUser, getUser, clearUser, User } from '../services/storage';
import { validateEmail, validatePassword, validateName } from '../utils/validators';

// Mock users database (in-memory)
const mockUsers: Array<User & { password: string }> = [
  { name: 'Rukmoni Nagarajan', email: 'rukmoni@example.com', password: 'password123' },
  { name: 'John Doe', email: 'john@example.com', password: 'password123' },
];

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'SIGNUP_REQUEST' }
  | { type: 'SIGNUP_SUCCESS'; payload: User }
  | { type: 'SIGNUP_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_USER'; payload: User | null }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'SIGNUP_REQUEST':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
    case 'SIGNUP_SUCCESS':
      return { ...state, loading: false, user: action.payload, error: null };
    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, error: null, loading: false };
    case 'RESTORE_USER':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    restoreUser();
  }, []);

  const restoreUser = async () => {
    try {
      const user = await getUser();
      dispatch({ type: 'RESTORE_USER', payload: user });
    } catch (error) {
      console.error('Error restoring user:', error);
      dispatch({ type: 'RESTORE_USER', payload: null });
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_REQUEST' });

    try {
      // Validate inputs
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!validatePassword(password)) {
        throw new Error('Password must be at least 6 characters');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check credentials against mock database
      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const userData: User = { name: user.name, email: user.email };
      await saveUser(userData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    dispatch({ type: 'SIGNUP_REQUEST' });

    try {
      // Validate inputs
      if (!validateName(name)) {
        throw new Error('Name must be at least 2 characters');
      }

      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!validatePassword(password)) {
        throw new Error('Password must be at least 6 characters');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Add user to mock database
      const newUser = { name, email, password };
      mockUsers.push(newUser);

      const userData: User = { name, email };
      await saveUser(userData);
      dispatch({ type: 'SIGNUP_SUCCESS', payload: userData });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      dispatch({ type: 'SIGNUP_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await clearUser();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if clearing storage fails, we should still logout the user
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{ state, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};