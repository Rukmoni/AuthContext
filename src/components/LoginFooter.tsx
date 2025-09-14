import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/AuthStack';

type AuthNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginFooter({ loading }: { loading: boolean }) {
  const navigation = useNavigation<AuthNavProp>();

  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>Don't have an account? </Text>

      <TouchableOpacity
        disabled={loading}
        onPress={() => navigation.navigate('Signup')}
      >
        <Text style={[styles.linkText, loading && styles.linkDisabled]}>
          Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  linkDisabled: {
    color: '#aaa',
  },
});
