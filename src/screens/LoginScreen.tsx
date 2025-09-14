import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import LoginFooter from '@/components/LoginFooter';
import { lightTheme } from '../theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { state, login, clearError } = useAuth();



  // Clear error when component mounts or inputs change
  useEffect(() => {
    if (state.error) {
      clearError();
    }
  }, [email, password]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await login(email.trim(), password);
      // Navigation will be handled by useEffect when state.user changes
    } catch (error) {
      // Error is already handled by the context
      console.log('Login error handled by context');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={lightTheme.colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!state.loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={lightTheme.colors.placeholder}
                    secureTextEntry={!showPassword}
                    editable={!state.loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={togglePasswordVisibility}
                    disabled={state.loading}
                  >
                    {showPassword ? (
                      <Eye size={20} color={lightTheme.colors.placeholder} />
                    ) : (
                      <EyeOff size={20} color={lightTheme.colors.placeholder} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, state.loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={state.loading}
              >
                <Text style={styles.buttonText}>
                  {state.loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
            <LoginFooter loading={state.loading} />


            <View style={styles.demoCredentials}>
              <Text style={styles.demoTitle}>Demo Credentials:</Text>
              <Text style={styles.demoText}>Email: rukmoni@example.com</Text>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: lightTheme.typography.sizes['3xl'],
    fontWeight: lightTheme.typography.weights.bold,
    color: lightTheme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: lightTheme.typography.sizes.lg,
    color: lightTheme.colors.placeholder,
    textAlign: 'center',
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: lightTheme.colors.error,
    fontSize: lightTheme.typography.sizes.sm,
    textAlign: 'center',
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
  passwordContainer: {
    position: 'relative',
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
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 2,
  },
  button: {
    backgroundColor: lightTheme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: lightTheme.typography.sizes.base,
    fontWeight: lightTheme.typography.weights.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontFamily: 'monospace',
  },
});