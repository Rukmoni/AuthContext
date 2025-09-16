import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import LoginFooter from "@/components/LoginFooter";
import { lightTheme } from "../theme";
import { useFormValidation } from "@/hooks/useFormValidation";
import { loginSchema, LoginFormData } from "@/schemas/authSchemas";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { state, login, clearError } = useAuth();

  const {
    errors,
    touched,
    isValid,
    handleBlur,
    validateForm,
    clearError: clearFieldError,
    reset,
  } = useFormValidation({ schema: loginSchema });

  // Clear auth error when component mounts
  useEffect(() => {
    if (state.error) {
      clearError();
    }
  }, []); // Only run on mount

  // Clear field errors when user starts typing
  useEffect(() => {
    if (email && errors.email) {
      clearFieldError("email");
    }
  }, [email]); // Remove errors.email and clearFieldError from dependencies

  useEffect(() => {
    if (password && errors.password) {
      clearFieldError("password");
    }
  }, [password]); // Remove errors.password and clearFieldError from dependencies

  // Reset validation when component unmounts
  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleLogin = async () => {
    const formData: LoginFormData = { email: email.trim(), password };

    if (!validateForm(formData)) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      // Navigation will be handled by useEffect when state.user changes
    } catch (error) {
      // Error is already handled by the context
      console.log("Login error handled by context");
    }
  };

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  const getInputStyle = useCallback(
    (fieldName: string) => [
      styles.input,
      touched[fieldName] && errors[fieldName] && styles.inputError,
    ],
    [touched, errors]
  );

  const getPasswordInputStyle = useCallback(
    (fieldName: string) => [
      styles.passwordInput,
      touched[fieldName] && errors[fieldName] && styles.inputError,
    ],
    [touched, errors]
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            {state.error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{state.error}</Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={getInputStyle("email")}
                  value={email}
                  onChangeText={setEmail}
                  onBlur={() =>
                    handleBlur("email", email.trim(), {
                      email: email.trim(),
                      password,
                    })
                  }
                  placeholder="Enter your email"
                  placeholderTextColor={lightTheme.colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!state.loading}
                />
                {touched.email && errors.email && (
                  <Text style={styles.fieldError}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={getPasswordInputStyle("password")}
                    value={password}
                    onChangeText={setPassword}
                    onBlur={() =>
                      handleBlur("password", password, {
                        email: email.trim(),
                        password,
                      })
                    }
                    placeholder="Enter your password"
                    placeholderTextColor={lightTheme.colors.placeholder}
                    secureTextEntry={!showPassword}
                    editable={!state.loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={togglePasswordVisibility}
                    disabled={state.loading}
                    accessibilityRole="button" 
                    accessibilityLabel="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={lightTheme.colors.placeholder} />
                    ) : (
                      <Eye size={20} color={lightTheme.colors.placeholder} />
                    )}
                  </TouchableOpacity>
                </View>
                {touched.password && errors.password && (
                  <Text style={styles.fieldError}>{errors.password}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  (state.loading || !isValid) && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={state.loading || !isValid}
              >
                <Text style={styles.buttonText}>
                  {state.loading ? "Signing In..." : "Sign In"}
                </Text>
              </TouchableOpacity>
            </View>

            <LoginFooter loading={state.loading} />

            <View style={styles.demoCredentials}>
              <Text style={styles.demoTitle}>Demo Credentials:</Text>
              <Text style={styles.demoText}>Email: john@example.com</Text>
              <Text style={styles.demoText}>Password: password123</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: lightTheme.typography.sizes["3xl"],
    fontWeight: lightTheme.typography.weights.bold,
    color: lightTheme.colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: lightTheme.typography.sizes.lg,
    color: lightTheme.colors.placeholder,
    textAlign: "center",
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: lightTheme.colors.error,
    fontSize: lightTheme.typography.sizes.sm,
    textAlign: "center",
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: lightTheme.typography.sizes.base,
    fontWeight: lightTheme.typography.weights.medium,
    color: lightTheme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: lightTheme.typography.sizes.base,
    color: lightTheme.colors.text,
    backgroundColor: lightTheme.colors.surface,
  },
  inputError: {
    borderColor: lightTheme.colors.error,
    borderWidth: 2,
  },
  fieldError: {
    color: lightTheme.colors.error,
    fontSize: lightTheme.typography.sizes.sm,
    marginTop: 4,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    borderRadius: 8,
    padding: 16,
    paddingRight: 50,
    fontSize: lightTheme.typography.sizes.base,
    color: lightTheme.colors.text,
    backgroundColor: lightTheme.colors.surface,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 16,
    padding: 2,
  },
  button: {
    backgroundColor: lightTheme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: lightTheme.typography.sizes.base,
    fontWeight: lightTheme.typography.weights.semibold,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: lightTheme.typography.sizes.base,
    color: lightTheme.colors.placeholder,
  },
  linkText: {
    fontSize: lightTheme.typography.sizes.base,
    color: lightTheme.colors.primary,
    fontWeight: lightTheme.typography.weights.semibold,
  },
  linkDisabled: {
    opacity: 0.5,
  },
  demoCredentials: {
    marginTop: 32,
    padding: 16,
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
  demoTitle: {
    fontSize: lightTheme.typography.sizes.sm,
    fontWeight: lightTheme.typography.weights.semibold,
    color: lightTheme.colors.text,
    marginBottom: 8,
  },
  demoText: {
    fontSize: lightTheme.typography.sizes.sm,
    color: lightTheme.colors.placeholder,
    fontFamily: "monospace",
  },
});
