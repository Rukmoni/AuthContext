import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import AppNavigator from "../AppNavigator";
import { AuthProvider, useAuth } from "../../context/AuthContext";

// Reusable test renderer with AuthProvider
const renderWithProvider = () =>
  render(
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );

describe("AppNavigator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders AuthStack when user is not logged in", async () => {
    const { getByText } = renderWithProvider();

    // ✅ Adjust text to something that appears on Login screen
    await waitFor(() => {
      expect(getByText(/Sign In/i)).toBeTruthy();
    });
  });

  it("renders AppTabs when user IS logged in", async () => {
    // ✅ Mock useAuth to return a logged-in state
    jest.spyOn(require("../../context/AuthContext"), "useAuth").mockReturnValue({
      state: {
        user: { name: "John Doe", email: "john@example.com" },
        loading: false,
        error: null,
      },
      login: jest.fn(),
      logout: jest.fn(),
      signup: jest.fn(),
      clearError: jest.fn(),
    });

    const { getByText } = renderWithProvider();

    await waitFor(() => {
      expect(getByText(/Welcome Home!/i)).toBeTruthy(); // Something from Home screen
    });
  });
});
