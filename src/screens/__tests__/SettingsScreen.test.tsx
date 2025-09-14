import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../SettingsScreen';

describe('SettingsScreen', () => {
  it('renders all sections and items correctly', () => {
    const { getByText } = render(<SettingsScreen />);

    // Header
    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('Manage your app preferences')).toBeTruthy();

    // Section titles
    expect(getByText('Preferences')).toBeTruthy();
    expect(getByText('Security')).toBeTruthy();
    expect(getByText('Support')).toBeTruthy();

    // Setting items
    expect(getByText('Notifications')).toBeTruthy();
    expect(getByText('Dark Mode')).toBeTruthy();
    expect(getByText('Language')).toBeTruthy();
    expect(getByText('Privacy & Security')).toBeTruthy();
    expect(getByText('Help & Support')).toBeTruthy();
    expect(getByText('About')).toBeTruthy();
  });

  it('toggles Notifications and Dark Mode switches', () => {
    const { getAllByRole } = render(<SettingsScreen />);

    const switches = getAllByRole('switch');
    expect(switches.length).toBe(2); // Notifications + Dark Mode

    // Notifications switch
    fireEvent(switches[0], 'valueChange', false);
    fireEvent(switches[0], 'valueChange', true);

    // Dark Mode switch
    fireEvent(switches[1], 'valueChange', true);
    fireEvent(switches[1], 'valueChange', false);
  });

  it('fires onPress handlers for pressable items', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const { getByText } = render(<SettingsScreen />);

    fireEvent.press(getByText('Language'));
    fireEvent.press(getByText('Privacy & Security'));
    fireEvent.press(getByText('Help & Support'));
    fireEvent.press(getByText('About'));

    expect(consoleSpy).toHaveBeenCalledWith('Language pressed');
    expect(consoleSpy).toHaveBeenCalledWith('Privacy pressed');
    expect(consoleSpy).toHaveBeenCalledWith('Help pressed');
    expect(consoleSpy).toHaveBeenCalledWith('About pressed');

    consoleSpy.mockRestore();
  });
});
