import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';
import { useAuth } from '@/context/AuthContext';
import { Alert } from 'react-native';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({ navigate: jest.fn() })),
}));

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Spy on Alert
jest.spyOn(Alert, 'alert');

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user information from context', () => {
    (useAuth as jest.Mock).mockReturnValue({
      state: { user: { name: 'John Doe', email: 'john@example.com' } },
      logout: jest.fn(),
    });

    const { getByText } = render(<HomeScreen />);

    expect(getByText('Welcome Home!')).toBeTruthy();
    expect(getByText('Hello, John Doe')).toBeTruthy();
    expect(getByText('User Information')).toBeTruthy();
    expect(getByText('Name:')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Email:')).toBeTruthy();
    expect(getByText('john@example.com')).toBeTruthy();
  });

  it('falls back gracefully when no user is present', () => {
    (useAuth as jest.Mock).mockReturnValue({
      state: { user: null },
      logout: jest.fn(),
    });

    const { getByText } = render(<HomeScreen />);

    expect(getByText('Hello,')).toBeTruthy(); // no name appended
  });

  it('toggles dark mode switch', () => {
    (useAuth as jest.Mock).mockReturnValue({
      state: { user: { name: 'Jane Doe', email: 'jane@example.com' } },
      logout: jest.fn(),
    });

    const { getByText, getByRole } = render(<HomeScreen />);

    expect(getByText('Dark Mode')).toBeTruthy();

    const switchControl = getByRole('switch');
    fireEvent(switchControl, 'valueChange', true); // turn on dark mode
    fireEvent(switchControl, 'valueChange', false); // turn off again
  });

  it('shows logout confirmation and calls logout on confirm', () => {
    const mockLogout = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      state: { user: { name: 'Jane Doe', email: 'jane@example.com' } },
      logout: mockLogout,
    });

    const { getByText } = render(<HomeScreen />);

    fireEvent.press(getByText('Logout'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Logout',
      'Are you sure you want to logout?',
      expect.any(Array)
    );

    // simulate pressing "Logout" in Alert
    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const logoutButton = buttons?.find((b: any) => b.text === 'Logout');
    logoutButton.onPress();

    expect(mockLogout).toHaveBeenCalled();
  });
});
