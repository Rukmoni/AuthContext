import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUser, getUser, clearUser, User } from '../storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('storage utils', () => {
  const mockUser: User = { name: 'John Doe', email: 'john@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves user data', async () => {
    await saveUser(mockUser);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'AUTH_USER',
      JSON.stringify(mockUser)
    );
  });

  it('throws error when saving fails', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(saveUser(mockUser)).rejects.toThrow('Failed to save user data');
  });

  it('gets stored user data', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockUser));
    const result = await getUser();
    expect(result).toEqual(mockUser);
  });

  it('returns null if no user stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const result = await getUser();
    expect(result).toBeNull();
  });

  it('returns null if getItem throws error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const result = await getUser();
    expect(result).toBeNull();
  });

  it('clears user data', async () => {
    await clearUser();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('AUTH_USER');
  });

  it('throws error when clearing fails', async () => {
    (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(clearUser()).rejects.toThrow('Failed to clear user data');
  });
});
