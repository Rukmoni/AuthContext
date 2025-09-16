import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../LoginScreen";
import { useAuth } from "@/context/AuthContext";
import { useFormValidation } from "@/hooks/useFormValidation"; // Import useFormValidation
import { NavigationContainer } from "@react-navigation/native";

// Mock the useAuth hook
jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock useFormValidation to isolate its behavior
jest.mock("@/hooks/useFormValidation", () => ({
  useFormValidation: jest.fn(() => ({
    errors: {},
    touched: {},
    isValid: true,
    handleBlur: jest.fn(),
    validateForm: jest.fn(() => true),
    clearError: jest.fn(),
    reset: jest.fn(),
  })),
}));

// Mock LoginFooter (to keep test lightweight)
jest.mock("@/components/LoginFooter", () => {
  return () => <></>;
});
const renderWithNav = (ui: React.ReactElement) => {
  return render(<NavigationContainer>{ui}</NavigationContainer>);
};

describe("LoginScreen", () => {
  const mockLogin = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      state: { error: null, loading: false },
      login: mockLogin,
      clearError: mockClearError,
    });
  });

  it("renders correctly with title and inputs", () => {
    const { getByText, getByPlaceholderText } = renderWithNav(<LoginScreen />);

    expect(getByText("Welcome Back")).toBeTruthy();
    expect(getByText("Sign in to your account")).toBeTruthy();
    expect(getByPlaceholderText("Enter your email")).toBeTruthy();
    expect(getByPlaceholderText("Enter your password")).toBeTruthy();
  });

  it("calls login with email and password", async () => {
    const { getByPlaceholderText, getByText } = renderWithNav(<LoginScreen />);

    fireEvent.changeText(
      getByPlaceholderText("Enter your email"),
      "test@example.com"
    );
    fireEvent.changeText(
      getByPlaceholderText("Enter your password"),
      "password123"
    );
    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  it("toggles password visibility", () => {
    const { getByPlaceholderText, getByRole } = renderWithNav(<LoginScreen />);

    const passwordInput = getByPlaceholderText("Enter your password");
    expect(passwordInput.props.secureTextEntry).toBe(true);

    const eyeButton = getByRole("button", {
      name: /toggle password visibility/i,
    });
    fireEvent.press(eyeButton);

    // After pressing, secureTextEntry should flip
    expect(passwordInput.props.secureTextEntry).toBe(false);
  });
});
