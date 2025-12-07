import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Users, Plus, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';

interface MeetingMinutesFormProps {
  communityId: string;
  fiscalYearId: string;
  meetingId?: string;
  onBack: () => void;
  onSuccess: () => void;
}

interface VotingResult {
  content_item: string;
  agree_count: number;
  total_attendees: number;
}

export function MeetingMinutesForm({ communityId, fiscalYearId, meetingId, onBack, onSuccess }: MeetingMinutesFormProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [loadingMeeting, setLoadingMeeting] = useState(!!meetingId);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    chairperson: '',
    participants_count: '',
    meeting_start_time: '',
    meeting_end_time: '',
    presentation_summary: '',
    discussion_points: '',
    agenda: '',
    voting_method: 'hands' as 'hands' | 'secret',
    approved_contents: '',
  });

  useEffect(() => {
    loadIdeas();
    if (meetingId) {
      loadMeetingData();
    }
  }, [meetingId, fiscalYearId]);

  const loadIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('idea_registrations')
        .select('*')
        .eq('fiscal_year_id', fiscalYearId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error('Error loading ideas:', error);
    }
  };

  const loadMeetingData = async () => {
    if (!meetingId) return;

    setLoadingMeeting(true);
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData(prev => ({
          ...prev,
          date: data.scheduled_date,
          chairperson: data.chairperson || '',
          agenda: data.agenda || '',
        }));
      }
    } catch (error) {
      console.error('Error loading meeting:', error);
    } finally {
      setLoadingMeeting(false);
    }
  };

  const [votingResults, setVotingResults] = useState<VotingResult[]>([]);

  useEffect(() => {
    if (ideas.length > 0 && votingResults.length === 0) {
      const initialResults = ideas.map(idea => ({
        content_item: idea.idea_title,
        agree_count: 0,
        total_attendees: 0,
      }));
      setVotingResults(initialResults);
    }
  }, [ideas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const { error } = await supabase
        .from('meeting_records')
        .insert({
          community_id: communityId,
          fiscal_year_id: fiscalYearId,
          meeting_id: meetingId || null,
          date: formData.date,
          chairperson: formData.chairperson,
          participants_count: parseInt(formData.participants_count) || 0,
          meeting_start_time: formData.meeting_start_time,
          meeting_end_time: formData.meeting_end_time,
          presentation_summary: formData.presentation_summary,
          discussion_points: formData.discussion_points,
          agenda: formData.agenda,
          voting_method: formData.voting_method,
          voting_results: votingResults,
          approved_contents: formData.approved_contents,
          minutes_summary: formData.presentation_summary,
        });

      if (error) throw error;

      if (meetingId) {
        await supabase
          .from('meetings')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', meetingId);
      }

      await supabase
        .from('workflow_status')
        .update({
          meeting_scheduled_completed: true,
          minutes_uploaded_completed: true,
          current_step: 'plan_created',
        })
        .eq('community_id', communityId)
        .eq('fiscal_year_id', fiscalYearId);

      alert(t('success_message'));
      onSuccess();
    } catch (error) {
      console.error('Error submitting meeting minutes:', error);
      alert(t('error_message'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addVotingResult = () => {
    const availableIdeas = ideas.filter(idea =>
      !votingResults.some(result => result.content_item === idea.idea_title)
    );

    if (availableIdeas.length > 0) {
      setVotingResults([...votingResults, {
        content_item: availableIdeas[0].idea_title,
        agree_count: 0,
        total_attendees: 0
      }]);
    } else {
      setVotingResults([...votingResults, { content_item: '', agree_count: 0, total_attendees: 0 }]);
    }
  };

  const removeVotingResult = (index: number) => {
    setVotingResults(votingResults.filter((_, i) => i !== index));
  };

  const updateVotingResult = (index: number, field: keyof VotingResult, value: any) => {
    const updated = [...votingResults];
    updated[index] = { ...updated[index], [field]: value };
    setVotingResults(updated);
  };

  if (loadingMeeting) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading_meeting_info')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-4 sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-2 mb-2 hover:bg-white/10 rounded-lg px-2 py-1 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">{t('back')}</span>
        </button>
        <h1 className="text-lg font-bold">{t('register_minutes')}</h1>
        <p className="text-xs opacity-90 mt-1">Template 02 - Community Meeting Minutes</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            {t('meeting_basic_info')}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('meeting_date')} *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('chairperson_name')} *</label>
              <input
                type="text"
                required
                value={formData.chairperson}
                onChange={(e) => handleChange('chairperson', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('participant_count')} *</label>
              <input
                type="number"
                required
                value={formData.participants_count}
                onChange={(e) => handleChange('participants_count', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('start_time')} *</label>
                <input
                  type="time"
                  required
                  value={formData.meeting_start_time}
                  onChange={(e) => handleChange('meeting_start_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('end_time')} *</label>
                <input
                  type="time"
                  required
                  value={formData.meeting_end_time}
                  onChange={(e) => handleChange('meeting_end_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">📋 {t('meeting_content')}</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('meeting_agenda')} *</label>
              <textarea
                required
                value={formData.agenda}
                onChange={(e) => handleChange('agenda', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
                placeholder={t('agenda_placeholder')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('presentation_summary')} *</label>
              <textarea
                required
                value={formData.presentation_summary}
                onChange={(e) => handleChange('presentation_summary', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('discussion_points')} *</label>
              <textarea
                required
                value={formData.discussion_points}
                onChange={(e) => handleChange('discussion_points', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">🗳️ {t('voting')}</h2>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('voting_method')} *</label>
            <select
              required
              value={formData.voting_method}
              onChange={(e) => handleChange('voting_method', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="hands">{t('hands')}</option>
              <option value="secret">{t('secret_ballot')}</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">{t('voting_results')}</label>
              <button
                type="button"
                onClick={addVotingResult}
                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {t('add_voting_item')}
              </button>
            </div>

            {votingResults.map((result, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <select
                    value={result.content_item}
                    onChange={(e) => updateVotingResult(index, 'content_item', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">{t('voting_item')}</option>
                    {ideas.map((idea) => (
                      <option
                        key={idea.id}
                        value={idea.idea_title}
                        disabled={votingResults.some((r, i) => i !== index && r.content_item === idea.idea_title)}
                      >
                        {idea.idea_title}
                      </option>
                    ))}
                  </select>
                  {votingResults.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVotingResult(index)}
                      className="text-red-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={result.agree_count || ''}
                    onChange={(e) => updateVotingResult(index, 'agree_count', parseInt(e.target.value) || 0)}
                    placeholder={t('votes_for')}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    value={result.total_attendees || ''}
                    onChange={(e) => updateVotingResult(index, 'total_attendees', parseInt(e.target.value) || 0)}
                    placeholder={t('total_attendees')}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">✅ {t('approved_content')}</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('approved_contents')} *</label>
            <textarea
              required
              value={formData.approved_contents}
              onChange={(e) => handleChange('approved_contents', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              rows={4}
            />
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
            className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('submitting')}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t('register_minutes')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
