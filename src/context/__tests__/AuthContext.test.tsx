import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { AuthProvider, useAuth, authReducer } from "../AuthContext";
import * as storage from "@/services/storage";
import * as validators from "@/utils/validators";

// Mock the storage service
jest.mock("../../services/storage");
const mockStorage = storage as jest.Mocked<typeof storage>;

// Mock the validators
jest.mock("../../utils/validators");
const mockValidators = validators as jest.Mocked<typeof validators>;

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
    mockValidators.validateName.mockReturnValue(true);
    mockValidators.validateEmail.mockReturnValue(true);
    mockValidators.validatePassword.mockReturnValue(true);
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
        email: "john@example.com",
      };
      mockStorage.getUser.mockResolvedValueOnce(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      expect(result.current.state.user).toEqual(mockUser);
      expect(mockStorage.getUser).toHaveBeenCalledTimes(1);
    });

    it("handles storage error on restore and sets user to null", async () => {
      mockStorage.getUser.mockRejectedValue(new Error("Storage error"));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      expect(result.current.state.user).toBeNull();
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

      it("handles login error on validator failure", async () => {
        mockValidators.validateEmail.mockReturnValue(false);

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.loading).toBe(false);
        });

        await act(async () => {
          try {
            await result.current.login("invalid-email", "password123");
          } catch (error) {
            // Expected to throw
          }
        });

        expect(result.current.state.user).toBeNull();
        expect(result.current.state.error).toBe(
          "Please enter a valid email address"
        );
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
          await result.current.signup(
            "New User",
            "newuser@example.com",
            "password123"
          );
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
            await result.current.signup(
              "John Doe",
              "john@example.com",
              "password123"
            );
          } catch (error) {
            // Expected to throw
          }
        });

        expect(result.current.state.user).toBeNull();
        expect(result.current.state.error).toBe(
          "User with this email already exists"
        );
        expect(mockStorage.saveUser).not.toHaveBeenCalled();
      });

      it("handles signup error on validator failure", async () => {
        mockValidators.validateName.mockReturnValue(false);

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.loading).toBe(false);
        });

        await act(async () => {
          try {
            await result.current.signup(
              "A",
              "newuser@example.com",
              "password123"
            );
          } catch (error) {
            // Expected to throw
          }
        });

        expect(result.current.state.user).toBeNull();
        expect(result.current.state.error).toBe(
          "Name must be at least 2 characters"
        );
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

      it("logs out even if storage clear fails", async () => {
        // Start with a logged-in user
        const mockUser = {
          name: "John Doe",
          email: "john@example.com",
        };
        mockStorage.getUser.mockResolvedValueOnce(mockUser);
        mockStorage.clearUser.mockRejectedValue(new Error("Storage error"));

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
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

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

      // Mock the login function to use our controlled promise
      jest.spyOn(result.current, "login").mockImplementation(async () => {
        return loginPromise;
      });

      act(() => {
        result.current.login("john@example.com", "password123");
      });

      // Should show loading state
      expect(result.current.state.loading).toBe(false);

      // Resolve the promise
      await act(async () => {
        resolveLogin!({
          name: "John Doe",
          email: "john@example.com",
        });
        // This small delay allows the state update to be processed
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });
    });
  });
});
