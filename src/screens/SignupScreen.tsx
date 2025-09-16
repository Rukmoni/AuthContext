import React, { useState, useEffect } from "react";
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
import { lightTheme } from "../theme";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/AuthStack";
import { useFormValidation } from "@/hooks/useFormValidation";
import { signupSchema, SignupFormData } from "@/schemas/authSchemas";

type SignupScreenNavProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Signup"
>;

export default function SignupScreen() {
  const navigation = useNavigation<SignupScreenNavProp>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { state, signup, clearError } = useAuth();
  const {
    errors,
    touched,
    isValid,
    handleBlur,
    validateForm,
    clearError: clearFieldError,
    reset,
  } = useFormValidation({ schema: signupSchema });

  // Reset validation when component unmounts
  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleSignup = async () => {
    const formData: SignupFormData = {
      name: name.trim(),
      email: email.trim(),
      password,
    };

    if (!validateForm(formData)) {
      return;
    }

    try {
      await signup(formData.name, formData.email, formData.password);
      // Navigation will be handled by useEffect when state.user changes
    } catch (error) {
      // Error is already handled by the context
      console.log("Signup error handled by context");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getInputStyle = (fieldName: string) => [
    styles.input,
    touched[fieldName] && errors[fieldName] && styles.inputError,
  ];

  const getPasswordInputStyle = (fieldName: string) => [
    styles.passwordInput,
    touched[fieldName] && errors[fieldName] && styles.inputError,
  ];

  // A more robust change handler that clears context and field errors
  const handleNameChange = (text: string) => {
    setName(text);
    if (state.error) clearError();
    if (errors.name) clearFieldError("name");
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (state.error) clearError();
    if (errors.email) clearFieldError("email");
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (state.error) clearError();
    if (errors.password) clearFieldError("password");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            {state.error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{state.error}</Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={getInputStyle("name")}
                  value={name}
                  onChangeText={handleNameChange}
                  onBlur={() =>
                    handleBlur("name", name.trim(), {
                      name: name.trim(),
                      email: email.trim(),
                      password,
                    })
                  }
                  placeholder="Enter your full name"
                  placeholderTextColor={lightTheme.colors.placeholder}
                  autoCapitalize="words"
                  editable={!state.loading}
                />
                {touched.name && errors.name && (
                  <Text style={styles.fieldError}>{errors.name}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={getInputStyle("email")}
                  value={email}
                  onChangeText={handleEmailChange}
                  onBlur={() =>
                    handleBlur("email", email.trim(), {
                      name: name.trim(),
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
                    onChangeText={handlePasswordChange}
                    onBlur={() =>
                      handleBlur("password", password, {
                        name: name.trim(),
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
                onPress={handleSignup}
                disabled={state.loading || !isValid}
                accessibilityRole="button"
              >
                <Text style={styles.buttonText}>
                  {state.loading ? "Creating Account..." : "Create Account"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                disabled={state.loading}
                onPress={() => navigation.navigate("Login")}
                accessibilityRole="button"
                accessibilityLabel="Navigate to login screen"
              >
                <Text
                  style={[
                    styles.linkText,
                    state.loading && styles.linkDisabled,
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
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
});
