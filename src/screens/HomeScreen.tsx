import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { lightTheme, darkTheme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { AppTabParamList } from '../navigation/AppTabs';

type HomeNavProp = BottomTabNavigationProp<AppTabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { state, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Welcome Home!
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.placeholder }]}>
            Hello, {state.user?.name}
          </Text>
        </View>

        {/* User Info Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            User Information
          </Text>
          <View style={styles.userInfo}>
            <Text style={[styles.label, { color: theme.colors.placeholder }]}>Name:</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>{state.user?.name}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.label, { color: theme.colors.placeholder }]}>Email:</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>{state.user?.email}</Text>
          </View>
        </View>

        {/* Settings Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Settings</Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              Dark Mode
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={() => setIsDarkMode(!isDarkMode)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={isDarkMode ? theme.colors.accent : theme.colors.surface}
            />
          </View>
        </View>

        {/* Bottom Actions */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Logout of the app"
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24 },
  header: { alignItems: 'center', marginVertical: 32 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 18 },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: { fontSize: 16, fontWeight: '500' },
  value: { fontSize: 16, flex: 1, textAlign: 'right' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: { fontSize: 16, fontWeight: '500' },
  logoutButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 32,
  },
  logoutButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
