import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';

interface MeetingRegistrationFormProps {
  communityId: string;
  fiscalYearId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function MeetingRegistrationForm({
  communityId,
  fiscalYearId,
  onBack,
  onSuccess,
}: MeetingRegistrationFormProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    scheduled_date: '',
    scheduled_time: '',
    location: '',
    chairperson: '',
    agenda: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          community_id: communityId,
          fiscal_year_id: fiscalYearId,
          title: formData.title,
          scheduled_date: formData.scheduled_date,
          scheduled_time: formData.scheduled_time || null,
          location: formData.location,
          chairperson: formData.chairperson,
          agenda: formData.agenda,
          status: 'scheduled',
          created_by: 'CMB User',
        })
        .select()
        .single();

      if (meetingError) throw meetingError;

      const { data: community } = await supabase
        .from('communities')
        .select('name')
        .eq('id', communityId)
        .single();

      const communityName = community?.name || 'Community';

      const notificationMessage = `${t('new_meeting_scheduled')}: ${formData.title} - ${new Date(formData.scheduled_date).toLocaleDateString('ja-JP')} ${formData.scheduled_time ? t('at') + ' ' + formData.scheduled_time : ''}`;

      await supabase.from('notifications').insert({
        user_email: 'community_members@example.com',
        community_id: communityId,
        title: t('new_meeting_notification'),
        message: notificationMessage,
        type: 'meeting_scheduled',
        related_id: meeting.id,
        is_read: false,
      });

      const { error: workflowError } = await supabase
        .from('workflow_status')
        .update({
          meeting_scheduled_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('community_id', communityId)
        .eq('fiscal_year_id', fiscalYearId);

      if (workflowError) console.error('Workflow update error:', workflowError);

      onSuccess();
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert(t('error_creating_meeting'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-4 flex items-center gap-3">
        <button onClick={onBack} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-lg font-bold">{t('new_meeting')}</h1>
          <p className="text-xs text-blue-100">{t('schedule_new_meeting')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('meeting_title')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder={t('meeting_title_placeholder')}
          />
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('scheduled_date')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.scheduled_date}
            onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('scheduled_time')}
          </label>
          <input
            type="time"
            value={formData.scheduled_time}
            onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('location')}
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder={t('location_placeholder')}
          />
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('chairperson')}
          </label>
          <input
            type="text"
            value={formData.chairperson}
            onChange={(e) => setFormData({ ...formData, chairperson: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder={t('chairperson_placeholder')}
          />
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('agenda')}
          </label>
          <textarea
            value={formData.agenda}
            onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            rows={4}
            placeholder={t('agenda_placeholder')}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-200 text-gray-700 rounded-xl py-3 font-semibold"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
          >
            {loading ? t('submitting') : t('schedule_meeting')}
          </button>
        </div>
      </form>
    </div>
  );
}
