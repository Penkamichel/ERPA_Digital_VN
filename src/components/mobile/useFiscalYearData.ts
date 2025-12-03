import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FiscalYearData } from './types';

export function useFiscalYearData(communityName: string, selectedYear: number) {
  const [data, setData] = useState<FiscalYearData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [communityName, selectedYear]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: community } = await supabase
        .from('communities')
        .select('id')
        .eq('name', communityName)
        .maybeSingle();

      if (!community) {
        throw new Error('Community not found');
      }

      const { data: fy } = await supabase
        .from('fiscal_years')
        .select('id')
        .eq('year', selectedYear)
        .maybeSingle();

      if (!fy) {
        throw new Error('Fiscal year not found');
      }

      const { data: fundReg } = await supabase
        .from('fund_registrations')
        .select('approved_amount')
        .eq('community_id', community.id)
        .eq('fiscal_year_id', fy.id)
        .maybeSingle();

      const { data: activities } = await supabase
        .from('plan_activities')
        .select('id, total_budget, status')
        .eq('community_id', community.id)
        .eq('fiscal_year_id', fy.id);

      const { data: workflow } = await supabase
        .from('workflow_status')
        .select('*')
        .eq('community_id', community.id)
        .eq('fiscal_year_id', fy.id)
        .maybeSingle();

      const totalBudget = Number(fundReg?.approved_amount || 0);
      const activityCount = activities?.length || 0;
      const completedCount = activities?.filter(a => a.status === 'completed').length || 0;
      const ongoingCount = activities?.filter(a => a.status === 'ongoing').length || 0;

      const activityIds = activities?.map(a => a.id) || [];
      let totalSpent = 0;

      if (activityIds.length > 0) {
        const { data: expenditures } = await supabase
          .from('expenditures')
          .select('amount')
          .in('plan_activity_id', activityIds);

        totalSpent = expenditures?.reduce((sum, exp) => sum + Number(exp.amount || 0), 0) || 0;
      }

      setData({
        id: fy.id,
        year: selectedYear,
        totalBudget,
        totalSpent,
        activityCount,
        completedCount,
        ongoingCount,
        workflowStatus: {
          fundRegistrationCompleted: workflow?.fund_registration_completed || false,
          meetingScheduledCompleted: workflow?.meeting_scheduled_completed || false,
          minutesUploadedCompleted: workflow?.minutes_uploaded_completed || false,
          planCreatedCompleted: workflow?.plan_created_completed || false,
          activitiesOngoing: workflow?.activities_ongoing || false,
          finalReportSubmitted: workflow?.final_report_submitted || false,
          currentStep: workflow?.current_step || 'fund_registration',
        },
      });
    } catch (err) {
      console.error('Error loading fiscal year data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, reload: loadData };
}
