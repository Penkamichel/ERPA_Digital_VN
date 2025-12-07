import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';

interface ActivityLogFormProps {
  communityId: string;
  fiscalYearId: string;
  onBack: () => void;
  onSuccess: () => void;
}

interface Activity {
  id: string;
  activity_name: string;
}

export function ActivityLogForm({ communityId, fiscalYearId, onBack, onSuccess }: ActivityLogFormProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formData, setFormData] = useState({
    activity_id: '',
    description_of_work: '',
    date_of_activity: new Date().toISOString().split('T')[0],
    location: '',
    submitted_by: user?.email || '',
    submission_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const { data } = await supabase
        .from('plan_activities')
        .select('id, activity_name')
        .eq('community_id', communityId)
        .eq('fiscal_year_id', fiscalYearId)
        .in('status', ['approved', 'ongoing']);

      setActivities(data || []);
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, activity_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.activity_id) {
      alert(t('select_activity'));
      return;
    }

    setLoading(true);
    try {
      await supabase
        .from('activity_progress_notes')
        .insert({
          plan_activity_id: formData.activity_id,
          note_text: formData.description_of_work,
          created_by: formData.submitted_by,
          progress_percentage: 50,
        });

      await supabase
        .from('plan_activities')
        .update({ status: 'ongoing' })
        .eq('id', formData.activity_id);

      alert(t('success_message'));
      onSuccess();
    } catch (error) {
      console.error('Error submitting activity log:', error);
      alert(t('error_message'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (activities.length === 0) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{t('no_approved_activities')}</p>
          <button onClick={onBack} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            {t('back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-2 mb-2 hover:bg-white/10 rounded-lg px-2 py-1 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">{t('back')}</span>
        </button>
        <h1 className="text-lg font-bold">{t('activity_log_registration')}</h1>
        <p className="text-xs opacity-90 mt-1">Activity Log Registration</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">
            {t('activity_info')}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('target_activity')} *</label>
              <select
                required
                value={formData.activity_id}
                onChange={(e) => handleChange('activity_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {activities.map(activity => (
                  <option key={activity.id} value={activity.id}>
                    {activity.activity_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('activity_date')} *</label>
              <input
                type="date"
                required
                value={formData.date_of_activity}
                onChange={(e) => handleChange('date_of_activity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('location')} *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('work_description')} *</label>
              <textarea
                required
                value={formData.description_of_work}
                onChange={(e) => handleChange('description_of_work', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={4}
                placeholder={t('work_description')}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">{t('submission_info')}</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('submitter')} *</label>
              <input
                type="text"
                required
                value={formData.submitted_by}
                onChange={(e) => handleChange('submitted_by', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('submission_date')} *</label>
              <input
                type="date"
                required
                value={formData.submission_date}
                onChange={(e) => handleChange('submission_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-6">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('submitting')}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t('register')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
