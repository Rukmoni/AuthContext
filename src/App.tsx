import React from "react";
import { Text, View } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider } from "./context/AuthContext";
import AppNavigator from "./navigation/AppNavigator";
import { lightTheme } from "./theme";

export default function App() {
  return (
    <PaperProvider theme={lightTheme}>
      <AuthProvider>
      <AppNavigator />
      </AuthProvider>
      
    </PaperProvider>
  );
}
