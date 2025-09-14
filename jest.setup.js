// Extend Jest Native matchers (toHaveTextContent, toBeVisible, etc.)
import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage globally so we don't hit native modules in Jest
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
