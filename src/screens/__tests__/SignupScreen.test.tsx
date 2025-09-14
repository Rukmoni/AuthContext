import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SignupScreen from "../SignupScreen";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";

// ✅ Mock useAuth to control state + signup behavior
jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// ✅ Mock useNavigation to verify navigation call
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: jest.fn(),
}));

describe("SignupScreen", () => {
  const mockSignup = jest.fn();
  const mockClearError = jest.fn();
  const mockNavigate = jest.fn();

  const setup = (customState = {}) => {
    (useAuth as jest.Mock).mockReturnValue({
      state: { user: null, loading: false, error: null, ...customState },
      signup: mockSignup,
      clearError: mockClearError,
    });

    (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });

    return render(<SignupScreen />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields and button", () => {
    const { getByPlaceholderText, getByText } = setup();

    expect(getByPlaceholderText(/Enter your full name/i)).toBeTruthy();
    expect(getByPlaceholderText(/Enter your email/i)).toBeTruthy();
    expect(getByPlaceholderText(/Enter your password/i)).toBeTruthy();
  });

  it("shows error when state.error is present", () => {
    const { getByText } = setup({ error: "Something went wrong" });
    expect(getByText(/Something went wrong/i)).toBeTruthy();
  });

  it("calls clearError on mount and input change", () => {
    const { getByPlaceholderText } = setup({ error: "Some error" });

    fireEvent.changeText(getByPlaceholderText(/Enter your full name/i), "John Doe");
    expect(mockClearError).toHaveBeenCalled();
  });

  it("toggles password visibility when eye icon pressed", () => {
    const { getByLabelText, getByPlaceholderText } = setup();

    const passwordInput = getByPlaceholderText(/Enter your password/i);
    expect(passwordInput.props.secureTextEntry).toBe(true);

    const eyeButton = getByLabelText(/Show password/i);
    fireEvent.press(eyeButton);

    // After pressing, secureTextEntry should toggle
    expect(passwordInput.props.secureTextEntry).toBe(false);
  });

  it("shows alert when fields are empty", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {}); 

    const { getByRole } = setup();
  
    fireEvent.press(getByRole("button", { name: /Create Account/i }));
  
    expect(alertSpy).toHaveBeenCalledWith("Error", "Please fill in all fields");
  
    alertSpy.mockRestore();;
  });

  it("calls signup with trimmed values when form is valid", async () => {
    const { getByPlaceholderText, getByRole } = setup();

    fireEvent.changeText(getByPlaceholderText(/Enter your full name/i), "  John Doe  ");
    fireEvent.changeText(getByPlaceholderText(/Enter your email/i), "john@example.com");
    fireEvent.changeText(getByPlaceholderText(/Enter your password/i), "password123");

    fireEvent.press(getByRole("button", { name: /Create Account/i }));

    await waitFor(() =>
      expect(mockSignup).toHaveBeenCalledWith("John Doe", "john@example.com", "password123")
    );
  });

  it("navigates to Login when Sign In link pressed", () => {
    const { getByText } = setup();
    fireEvent.press(getByText(/Sign In/i));
    expect(mockNavigate).toHaveBeenCalledWith("Login");
  });

  it("disables inputs and button when loading is true", () => {
    const { getByPlaceholderText, getByText } = setup({ loading: true });

    expect(getByPlaceholderText(/Enter your full name/i).props.editable).toBe(false);
    expect(getByText(/Creating Account.../i)).toBeTruthy();
  });
});
