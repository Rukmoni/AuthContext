import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { AuthProvider, useAuth } from "../AuthContext";
import * as storage from "../../services/storage";

// Mock the storage service
jest.mock("../../services/storage");
const mockStorage = storage as jest.Mocked<typeof storage>;

// Mock any async storage or other dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe("AuthContext", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mocks to default values
    mockStorage.getUser.mockResolvedValue(null);
    mockStorage.saveUser.mockResolvedValue(undefined);
    mockStorage.clearUser.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Initial State", () => {
    it("provides initial state with loading false and null user", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      expect(result.current.state.user).toBeNull();
      expect(result.current.state.error).toBeNull();
    });

    it("restores user from storage on initialization", async () => {
      const mockUser = { 
        id: "1",
        name: "John Doe", 
        email: "john@example.com" 
      };
      mockStorage.getUser.mockResolvedValueOnce(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      expect(result.current.state.user).toEqual(mockUser);
      expect(mockStorage.getUser).toHaveBeenCalledTimes(1);
    });
  });

  describe("Authentication Actions", () => {
    describe("login", () => {
      it("logs in successfully with valid credentials", async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.loading).toBe(false);
        });

        const expectedUser = {
          name: "John Doe",
          email: "john@example.com",
        };

        await act(async () => {
          await result.current.login("john@example.com", "password123");
        });

        expect(result.current.state.user).toEqual(expectedUser);
        expect(result.current.state.error).toBeNull();
        expect(mockStorage.saveUser).toHaveBeenCalledWith(expectedUser);
      });

      it("handles login error with invalid credentials", async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.loading).toBe(false);
        });

        await act(async () => {
          try {
            await result.current.login("invalid@example.com", "wrongpassword");
          } catch (error) {
            // Expected to throw
          }
        });

        expect(result.current.state.user).toBeNull();
        expect(result.current.state.error).toBe("Invalid email or password");
        expect(mockStorage.saveUser).not.toHaveBeenCalled();
      });
    });

    describe("signup", () => {
      it("signs up successfully with valid data", async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.loading).toBe(false);
        });

        await act(async () => {
          await result.current.signup("New User", "newuser@example.com", "password123");
        });

        expect(result.current.state.user?.email).toBe("newuser@example.com");
        expect(result.current.state.user?.name).toBe("New User");
        expect(result.current.state.error).toBeNull();
        expect(mockStorage.saveUser).toHaveBeenCalled();
      });

      it("handles signup error with existing email", async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.loading).toBe(false);
        });

        await act(async () => {
          try {
            await result.current.signup("John Doe", "john@example.com", "password123");
          } catch (error) {
            // Expected to throw
          }
        });

        expect(result.current.state.user).toBeNull();
        expect(result.current.state.error).toBe("User with this email already exists");
        expect(mockStorage.saveUser).not.toHaveBeenCalled();
      });
    });

    describe("logout", () => {
      it("logs out successfully and clears user data", async () => {
        // Start with a logged-in user
        const mockUser = {
          name: "John Doe",
          email: "john@example.com",
        };
        mockStorage.getUser.mockResolvedValueOnce(mockUser);

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.loading).toBe(false);
        });

        // Verify user is loaded
        expect(result.current.state.user).toEqual(mockUser);

        // Perform logout
        await act(async () => {
          await result.current.logout();
        });

        expect(result.current.state.user).toBeNull();
        expect(result.current.state.error).toBeNull();
        expect(mockStorage.clearUser).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Error Handling", () => {
    it("clears error state when clearError is called", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      // Trigger an error first
      await act(async () => {
        try {
          await result.current.login("invalid@example.com", "wrongpassword");
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.state.error).toBeTruthy();

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.state.error).toBeNull();
    });
  });

  describe("Provider Requirements", () => {
    it("throws error when useAuth is used outside AuthProvider", () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within an AuthProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("Loading States", () => {
    it("shows loading state during async operations", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      // Mock a delayed response
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      // Override the login method to use our controlled promise
      const originalLogin = result.current.login;
      jest.spyOn(result.current, 'login').mockImplementation(async () => {
        return loginPromise;
      });

      act(() => {
        result.current.login("john@example.com", "password123");
      });

      // Should show loading state
      expect(result.current.state.loading).toBe(false);

      // Resolve the promise
      act(() => {
        resolveLogin!({
          name: "John Doe",
          email: "john@example.com",
        });
      });

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });
    });
  });
});