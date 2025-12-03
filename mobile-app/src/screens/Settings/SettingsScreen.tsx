import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { syncQueue, getPendingSyncCount } from '../../utils/offlineSync';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { language, setLanguage, isOffline } = useApp();
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadPendingSyncCount();
  }, []);

  const loadPendingSyncCount = async () => {
    const count = await getPendingSyncCount();
    setPendingSyncCount(count);
  };

  const handleSync = async () => {
    setSyncing(true);
    const result = await syncQueue();
    setSyncing(false);
    await loadPendingSyncCount();
    Alert.alert(
      'Sync Complete',
      `✓ ${result.success} items synced\n${result.failed > 0 ? `✗ ${result.failed} failed` : ''}`
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const openGrievanceLink = async (type: string) => {
    const links: Record<string, string> = {
      hotline: 'tel:+1234567890',
      email: 'mailto:grievance@provincialfund.gov',
      form: 'https://provincialfund.gov/complaints',
    };
    const url = links[type];
    if (url) {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        Linking.openURL(url);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{user?.name}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>{user?.role}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Community</Text>
          <Text style={styles.infoValue}>{user?.communityName}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <View style={styles.optionCard}>
          <TouchableOpacity
            style={[styles.languageButton, language === 'en' && styles.languageButtonActive]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[styles.languageText, language === 'en' && styles.languageTextActive]}>
              English
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.languageButton, language === 'th' && styles.languageButtonActive]}
            onPress={() => setLanguage('th')}
          >
            <Text style={[styles.languageText, language === 'th' && styles.languageTextActive]}>
              ไทย (Thai)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offline Mode</Text>
        <View style={styles.optionCard}>
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>Connection Status</Text>
              <Text style={styles.optionValue}>{isOffline ? 'Offline' : 'Online'}</Text>
            </View>
            <View style={[styles.statusDot, isOffline ? styles.statusOffline : styles.statusOnline]} />
          </View>

          {pendingSyncCount > 0 && (
            <View style={styles.syncInfo}>
              <Text style={styles.syncLabel}>Pending Sync: {pendingSyncCount} items</Text>
              <TouchableOpacity style={styles.syncButton} onPress={handleSync} disabled={syncing}>
                <Text style={styles.syncButtonText}>{syncing ? 'Syncing...' : 'Sync Now'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grievance Mechanism</Text>
        <TouchableOpacity style={styles.linkCard} onPress={() => openGrievanceLink('hotline')}>
          <Text style={styles.linkIcon}>📞</Text>
          <View style={styles.linkInfo}>
            <Text style={styles.linkTitle}>Hotline</Text>
            <Text style={styles.linkSubtitle}>Call Provincial Fund Support</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkCard} onPress={() => openGrievanceLink('email')}>
          <Text style={styles.linkIcon}>✉️</Text>
          <View style={styles.linkInfo}>
            <Text style={styles.linkTitle}>Email</Text>
            <Text style={styles.linkSubtitle}>grievance@provincialfund.gov</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkCard} onPress={() => openGrievanceLink('form')}>
          <Text style={styles.linkIcon}>📝</Text>
          <View style={styles.linkInfo}>
            <Text style={styles.linkTitle}>Online Form</Text>
            <Text style={styles.linkSubtitle}>Submit anonymous complaint</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Build</Text>
          <Text style={styles.infoValue}>2025.12.03</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Provincial Fund Management System</Text>
        <Text style={styles.footerSubtext}>© 2025 All rights reserved</Text>
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
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  optionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  languageButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  languageTextActive: {
    color: '#fff',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  optionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusOnline: {
    backgroundColor: '#10b981',
  },
  statusOffline: {
    backgroundColor: '#f59e0b',
  },
  syncInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  syncLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  syncButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  linkCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  linkSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
  },
  footerSubtext: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
  },
});
