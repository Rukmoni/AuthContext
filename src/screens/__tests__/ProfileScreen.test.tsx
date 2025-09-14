import React from 'react';
import { render } from '@testing-library/react-native';
import ProfileScreen from '../ProfileScreen';
import { useAuth } from '@/context/AuthContext';

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user info from context', () => {
    (useAuth as jest.Mock).mockReturnValue({
      state: {
        user: {
          name: 'Jane Doe',
          email: 'jane@example.com',
        },
      },
    });

    const { getByText, getAllByText } = render(<ProfileScreen />);

    // Header
    expect(getByText('Jane Doe')).toBeTruthy();

    // Email appears twice (header + section)
    const emails = getAllByText('jane@example.com');
    expect(emails).toHaveLength(2);

    // Section Info
    expect(getByText('Profile Information')).toBeTruthy();
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Member Since')).toBeTruthy();
    expect(getByText('January 2024')).toBeTruthy();
    expect(getByText('Location')).toBeTruthy();
    expect(getByText('KL, Malaysia')).toBeTruthy();

    // Edit button
    expect(getByText('Edit Profile')).toBeTruthy();
  });

  it('falls back to default values when no user is present', () => {
    (useAuth as jest.Mock).mockReturnValue({
      state: { user: null },
    });

    const { getByText, getAllByText } = render(<ProfileScreen />);

    // Fallback name
    expect(getByText('User')).toBeTruthy();

    // Fallback email appears twice (header + section)
    const emails = getAllByText('user@example.com');
    expect(emails).toHaveLength(2);
  });
});
