import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../contexts/AppContext';

export default function FiscalYearSelector() {
  const { fiscalYears, selectedFiscalYear, setSelectedFiscalYear } = useApp();

  if (fiscalYears.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Fiscal Year:</Text>
      <View style={styles.buttonGroup}>
        {fiscalYears.map(year => (
          <TouchableOpacity
            key={year.id}
            style={[
              styles.button,
              selectedFiscalYear?.id === year.id && styles.buttonActive,
            ]}
            onPress={() => setSelectedFiscalYear(year)}
          >
            <Text
              style={[
                styles.buttonText,
                selectedFiscalYear?.id === year.id && styles.buttonTextActive,
              ]}
            >
              {year.year}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  buttonTextActive: {
    color: '#fff',
  },
});
