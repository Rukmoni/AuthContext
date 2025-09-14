import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_USER_KEY = 'AUTH_USER';

export interface User {
  name: string;
  email: string;
}

export const saveUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (error) {
    throw new Error('Failed to save user data');
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(AUTH_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};

export const clearUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    throw new Error('Failed to clear user data');
  }
};