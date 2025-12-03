import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth, DEMO_USERS } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();

  const handleLogin = async (user: typeof DEMO_USERS[0]) => {
    await login(user.name, user.role, user.communityId, user.communityName);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🌲</Text>
        <Text style={styles.title}>Provincial Fund</Text>
        <Text style={styles.subtitle}>Mobile App</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Demo User</Text>
        <Text style={styles.sectionSubtitle}>Choose a role to explore the app</Text>

        {DEMO_USERS.map(user => (
          <TouchableOpacity
            key={user.id}
            style={styles.userCard}
            onPress={() => handleLogin(user)}
          >
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userRole}>{user.role}</Text>
              <Text style={styles.userCommunity}>{user.communityName}</Text>
            </View>
            <View style={styles.arrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>Features by Role</Text>

        <View style={styles.featureCard}>
          <Text style={styles.featureRole}>CMB Coordinator</Text>
          <Text style={styles.featureList}>
            • Full workflow execution{'\n'}
            • Create plans & budgets{'\n'}
            • Upload receipts & photos{'\n'}
            • Submit reports{'\n'}
            • Generate final PDF
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureRole}>Community Member</Text>
          <Text style={styles.featureList}>
            • Submit ideas{'\n'}
            • View meetings & minutes{'\n'}
            • Monitor activities{'\n'}
            • Track financial status
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureRole}>Forest Owner / CPC</Text>
          <Text style={styles.featureList}>
            • Review plans & budgets{'\n'}
            • Add comments{'\n'}
            • Request revisions{'\n'}
            • View reports
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Demo Mode • No authentication required</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  userRole: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 4,
  },
  userCommunity: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#2563eb',
  },
  features: {
    padding: 16,
    paddingTop: 32,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureRole: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 8,
  },
  featureList: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
