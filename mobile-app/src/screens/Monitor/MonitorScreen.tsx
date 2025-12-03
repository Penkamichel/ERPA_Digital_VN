import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../utils/supabase';
import FiscalYearSelector from '../../components/FiscalYearSelector';
import { Activity } from '../../types';

export default function MonitorScreen() {
  const { user } = useAuth();
  const { selectedFiscalYear } = useApp();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    if (selectedFiscalYear) {
      loadActivities();
    }
  }, [selectedFiscalYear, user]);

  const loadActivities = async () => {
    if (!selectedFiscalYear || !user) return;

    const { data } = await supabase
      .from('plan_activities')
      .select('*')
      .eq('fiscal_year_id', selectedFiscalYear.id)
      .eq('community_id', user.communityId)
      .order('period_start', { ascending: false });

    if (data) {
      setActivities(
        data.map(a => ({
          id: a.id,
          activityName: a.activity_name,
          communityId: a.community_id,
          fiscalYearId: a.fiscal_year_id,
          totalBudget: a.total_budget || 0,
          forestOwnerSupport: a.forest_owner_support || 0,
          communityContribution: a.community_contribution || 0,
          otherFunds: a.other_funds || 0,
          periodStart: a.period_start,
          periodEnd: a.period_end,
          status: a.status,
          notes: a.notes || '',
        }))
      );
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toFixed(0);
  };

  const getProgressPercentage = (activity: Activity) => {
    if (activity.status === 'completed') return 100;
    if (activity.status === 'ongoing') return 50;
    if (activity.status === 'approved') return 25;
    return 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monitor Activities</Text>
      </View>

      <FiscalYearSelector />

      <ScrollView style={styles.content}>
        {activities.map(activity => {
          const progress = getProgressPercentage(activity);
          const foPercent = ((activity.forestOwnerSupport / activity.totalBudget) * 100).toFixed(0);
          const commPercent = ((activity.communityContribution / activity.totalBudget) * 100).toFixed(0);
          const otherPercent = ((activity.otherFunds / activity.totalBudget) * 100).toFixed(0);

          return (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityCard}
              onPress={() => setSelectedActivity(activity)}
            >
              <Text style={styles.activityName}>{activity.activityName}</Text>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressPercent}>{progress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
              </View>

              <View style={styles.budgetSection}>
                <Text style={styles.budgetLabel}>Budget: {formatCurrency(activity.totalBudget)} VND</Text>
                <View style={styles.budgetBreakdown}>
                  <View style={styles.budgetItem}>
                    <View style={[styles.budgetDot, { backgroundColor: '#3b82f6' }]} />
                    <Text style={styles.budgetText}>FO: {foPercent}%</Text>
                  </View>
                  <View style={styles.budgetItem}>
                    <View style={[styles.budgetDot, { backgroundColor: '#10b981' }]} />
                    <Text style={styles.budgetText}>Comm: {commPercent}%</Text>
                  </View>
                  <View style={styles.budgetItem}>
                    <View style={[styles.budgetDot, { backgroundColor: '#f59e0b' }]} />
                    <Text style={styles.budgetText}>Other: {otherPercent}%</Text>
                  </View>
                </View>
              </View>

              <View style={styles.evidenceSection}>
                <View style={styles.evidenceItem}>
                  <Text style={styles.evidenceIcon}>📄</Text>
                  <Text style={styles.evidenceCount}>3 receipts</Text>
                </View>
                <View style={styles.evidenceItem}>
                  <Text style={styles.evidenceIcon}>📸</Text>
                  <Text style={styles.evidenceCount}>12 photos</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
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
  content: {
    flex: 1,
  },
  activityCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  budgetSection: {
    marginBottom: 16,
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  budgetBreakdown: {
    flexDirection: 'row',
    gap: 16,
  },
  budgetItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  budgetText: {
    fontSize: 12,
    color: '#6b7280',
  },
  evidenceSection: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  evidenceIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  evidenceCount: {
    fontSize: 12,
    color: '#6b7280',
  },
});
