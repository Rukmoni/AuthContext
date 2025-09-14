import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginFooter from '../LoginFooter';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('LoginFooter', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders footer text and Sign Up link', () => {
    const { getByText } = render(<LoginFooter loading={false} />);

    expect(getByText("Don't have an account? ")).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('navigates to Signup when Sign Up is pressed', () => {
    const { getByText } = render(<LoginFooter loading={false} />);

    fireEvent.press(getByText('Sign Up'));

    expect(mockNavigate).toHaveBeenCalledWith('Signup');
  });

  it('disables Sign Up button when loading is true', () => {
    const { getByText } = render(<LoginFooter loading={true} />);
    const signUpText = getByText('Sign Up');

    fireEvent.press(signUpText);

    // Navigation should NOT be triggered
    expect(mockNavigate).not.toHaveBeenCalled();

    // Styling should apply disabled color
    expect(signUpText.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#aaa' }), // linkDisabled style
      ])
    );
  });
});
