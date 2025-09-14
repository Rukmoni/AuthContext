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
import { lightTheme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/AuthStack';

type SignupScreenNavProp = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

export default function SignupScreen() {
  const navigation = useNavigation<SignupScreenNavProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { state, signup, clearError } = useAuth();

  // Clear error when component mounts or inputs change
  useEffect(() => {
    if (state.error) {
      clearError();
    }
  }, [name, email, password]);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await signup(name.trim(), email.trim(), password);
      // ✅ When signup succeeds, AuthContext will set user, AppNavigator will redirect
    } catch (error) {
      console.log('Signup error handled by context');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
              {/* Full Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor={lightTheme.colors.placeholder}
                  autoCapitalize="words"
                  editable={!state.loading}
                />
              </View>

              {/* Email */}
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

              {/* Password */}
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
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={lightTheme.colors.placeholder} />
                    ) : (
                      <Eye size={20} color={lightTheme.colors.placeholder} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.button, state.loading && styles.buttonDisabled]}
                onPress={handleSignup}
                disabled={state.loading}
                accessibilityRole="button"
              >
                <Text style={styles.buttonText}>
                  {state.loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                disabled={state.loading}
                onPress={() => navigation.navigate('Login')}
                accessibilityRole="button"
                accessibilityLabel="Navigate to login screen"
              >
                <Text style={[styles.linkText, state.loading && styles.linkDisabled]}>
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
});