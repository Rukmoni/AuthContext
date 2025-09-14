import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";
import App from "../App";

// Mock AuthProvider (just renders children)
jest.mock("@/context/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock AppNavigator (so we don’t load full navigation stack)
// Mock AppNavigator (so we don’t load full navigation stack)
jest.mock("@/navigation/AppNavigator", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => React.createElement(Text, null, "Mocked AppNavigator");
});

// Mock react-native-paper theme
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("App root", () => {
  it("renders AppNavigator inside providers", () => {
    const { getByText } = render(<App />);
    expect(getByText("Mocked AppNavigator")).toBeTruthy();
  });
});
