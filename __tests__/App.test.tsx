import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

describe('App bootstrap', () => {
  it('renders a sample text', () => {
    const { getByText } = render(<Text>Hello Test</Text>);
    expect(getByText('Hello Test')).toBeTruthy();
  });
});