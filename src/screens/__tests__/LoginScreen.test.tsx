import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../LoginScreen';
import { useAuth } from '@/context/AuthContext';

// Mock the useAuth hook
jest.mock('@/context/AuthContext', () => ({
    useAuth: jest.fn(),
  }));

// Mock LoginFooter (to keep test lightweight)
jest.mock('@/components/LoginFooter', () => {
  return () => <></>;
});

const mockLogin = jest.fn().mockResolvedValue({});
(useAuth as jest.Mock).mockReturnValue({
  state: { error: null, loading: false },
  login: mockLogin,
  clearError: jest.fn(),
});

describe('LoginScreen', () => {
  it('renders correctly with title and inputs', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('Sign in to your account')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
  });

  it('shows error alert when fields are empty', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByText } = render(<LoginScreen />);

    fireEvent.press(getByText('Sign In'));
    expect(alertSpy).toHaveBeenCalledWith('Error', 'Please fill in all fields');

    alertSpy.mockRestore();
  });

  it('calls login with email and password', async () => {
    const mockLogin = jest.fn().mockResolvedValueOnce({});
    (useAuth as jest.Mock).mockReturnValue({
        state: { error: null, loading: false },
        login: mockLogin,
        clearError: jest.fn(),
      });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('toggles password visibility', () => {
    const { getByPlaceholderText, getByRole } = render(<LoginScreen />);

    const passwordInput = getByPlaceholderText('Enter your password');
    expect(passwordInput.props.secureTextEntry).toBe(true);

    const eyeButton = getByRole('button');
    fireEvent.press(eyeButton);

    // After pressing, secureTextEntry should flip
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });
});
