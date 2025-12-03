import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../utils/supabase';
import FiscalYearSelector from '../../components/FiscalYearSelector';
import { format } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

interface KPIData {
  totalBudget: number;
  totalSpent: number;
  totalActivities: number;
  activeActivities: number;
}

interface NextMeeting {
  date: string;
  agenda: string;
  chairperson: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { selectedFiscalYear, isOffline } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [kpiData, setKpiData] = useState<KPIData>({
    totalBudget: 0,
    totalSpent: 0,
    totalActivities: 0,
    activeActivities: 0,
  });
  const [nextMeeting, setNextMeeting] = useState<NextMeeting | null>(null);
  const [spendingBreakdown, setSpendingBreakdown] = useState<any[]>([]);

  useEffect(() => {
    if (selectedFiscalYear) {
      loadData();
    }
  }, [selectedFiscalYear, user]);

  const loadData = async () => {
    try {
      await Promise.all([loadKPIs(), loadNextMeeting(), loadSpendingBreakdown()]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadKPIs = async () => {
    if (!selectedFiscalYear || !user) return;

    const { data: activities } = await supabase
      .from('plan_activities')
      .select('id, total_budget, status')
      .eq('fiscal_year_id', selectedFiscalYear.id)
      .eq('community_id', user.communityId);

    if (activities) {
      const totalBudget = activities.reduce((sum, a) => sum + (a.total_budget || 0), 0);
      const totalActivities = activities.length;
      const activeActivities = activities.filter(a =>
        ['approved', 'ongoing'].includes(a.status)
      ).length;

      const activityIds = activities.map(a => a.id);
      const { data: budgetItems } = await supabase
        .from('budget_items')
        .select('id, amount, plan_activity_id')
        .in('plan_activity_id', activityIds);

      const { data: receipts } = await supabase
        .from('receipts')
        .select('budget_item_id')
        .in('plan_activity_id', activityIds);

      const receiptBudgetIds = new Set(receipts?.map(r => r.budget_item_id) || []);
      const totalSpent = budgetItems
        ?.filter(bi => receiptBudgetIds.has(bi.id))
        .reduce((sum, bi) => sum + (bi.amount || 0), 0) || 0;

      setKpiData({ totalBudget, totalSpent, totalActivities, activeActivities });
    }
  };

  const loadNextMeeting = async () => {
    if (!selectedFiscalYear || !user) return;

    const { data } = await supabase
      .from('meeting_records')
      .select('date, agenda, chairperson')
      .eq('fiscal_year_id', selectedFiscalYear.id)
      .eq('community_id', user.communityId)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(1)
      .maybeSingle();

    setNextMeeting(data);
  };

  const loadSpendingBreakdown = async () => {
    if (!selectedFiscalYear || !user) return;

    const { data: activities } = await supabase
      .from('plan_activities')
      .select('id, forest_owner_support, community_contribution, other_funds')
      .eq('fiscal_year_id', selectedFiscalYear.id)
      .eq('community_id', user.communityId);

    if (activities) {
      const fo = activities.reduce((sum, a) => sum + (a.forest_owner_support || 0), 0);
      const comm = activities.reduce((sum, a) => sum + (a.community_contribution || 0), 0);
      const other = activities.reduce((sum, a) => sum + (a.other_funds || 0), 0);

      setSpendingBreakdown([
        {
          name: 'FO Support',
          amount: fo,
          color: '#3b82f6',
          legendFontColor: '#374151',
        },
        {
          name: 'Community',
          amount: comm,
          color: '#10b981',
          legendFontColor: '#374151',
        },
        {
          name: 'Other',
          amount: other,
          color: '#f59e0b',
          legendFontColor: '#374151',
        },
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toFixed(0);
  };

  const spendingPercentage = kpiData.totalBudget > 0
    ? ((kpiData.totalSpent / kpiData.totalBudget) * 100).toFixed(1)
    : '0.0';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome, {user?.name}</Text>
          <Text style={styles.role}>{user?.role}</Text>
        </View>
        {isOffline && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>Offline</Text>
          </View>
        )}
      </View>

      <FiscalYearSelector />

      {nextMeeting && (
        <TouchableOpacity style={styles.meetingBanner}>
          <View style={styles.meetingIcon}>
            <Text style={styles.meetingIconText}>📅</Text>
          </View>
          <View style={styles.meetingInfo}>
            <Text style={styles.meetingTitle}>Next Meeting</Text>
            <Text style={styles.meetingDate}>
              {format(new Date(nextMeeting.date), 'MMM dd, yyyy')}
            </Text>
            <Text style={styles.meetingAgenda} numberOfLines={1}>
              {nextMeeting.agenda}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Budget</Text>
          <Text style={styles.kpiValue}>{formatCurrency(kpiData.totalBudget)} VND</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Spent</Text>
          <Text style={styles.kpiValue}>{formatCurrency(kpiData.totalSpent)} VND</Text>
          <Text style={styles.kpiSubtext}>{spendingPercentage}%</Text>
        </View>
      </View>

      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Activities</Text>
          <Text style={styles.kpiValue}>{kpiData.totalActivities}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Active</Text>
          <Text style={styles.kpiValue}>{kpiData.activeActivities}</Text>
        </View>
      </View>

      {spendingBreakdown.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Budget Breakdown</Text>
          <PieChart
            data={spendingBreakdown}
            width={screenWidth - 32}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}

      <View style={styles.workflowCard}>
        <Text style={styles.workflowTitle}>Quick Actions</Text>
        {user?.role === 'CMB' && (
          <>
            <TouchableOpacity style={styles.workflowItem}>
              <Text style={styles.workflowIcon}>📝</Text>
              <Text style={styles.workflowText}>Create Plan & Budget</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.workflowItem}>
              <Text style={styles.workflowIcon}>📸</Text>
              <Text style={styles.workflowText}>Upload Receipt/Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.workflowItem}>
              <Text style={styles.workflowIcon}>📊</Text>
              <Text style={styles.workflowText}>Submit Activity Report</Text>
            </TouchableOpacity>
          </>
        )}
        {user?.role === 'Community Member' && (
          <>
            <TouchableOpacity style={styles.workflowItem}>
              <Text style={styles.workflowIcon}>💡</Text>
              <Text style={styles.workflowText}>Submit New Idea</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.workflowItem}>
              <Text style={styles.workflowIcon}>📋</Text>
              <Text style={styles.workflowText}>Browse Submitted Ideas</Text>
            </TouchableOpacity>
          </>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  role: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  offlineBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
  },
  meetingBanner: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  meetingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#bfdbfe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  meetingIconText: {
    fontSize: 24,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  meetingDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a8a',
    marginTop: 2,
  },
  meetingAgenda: {
    fontSize: 14,
    color: '#3b82f6',
    marginTop: 4,
  },
  kpiContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  kpiSubtext: {
    fontSize: 14,
    color: '#10b981',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  workflowCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  workflowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  workflowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  workflowIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  workflowText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});
