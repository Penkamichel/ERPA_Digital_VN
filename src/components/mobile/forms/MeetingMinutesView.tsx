import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Clock, FileText } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';

interface MeetingMinutesViewProps {
  meetingId: string;
  onBack: () => void;
}

export function MeetingMinutesView({ meetingId, onBack }: MeetingMinutesViewProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [minutesData, setMinutesData] = useState<any>(null);

  useEffect(() => {
    loadMinutes();
  }, [meetingId]);

  const loadMinutes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meeting_records')
        .select('*')
        .eq('meeting_id', meetingId)
        .maybeSingle();

      if (error) throw error;
      setMinutesData(data);
    } catch (error) {
      console.error('Error loading minutes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (loading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!minutesData) {
    return (
      <div className="h-full bg-gray-50">
        <div className="bg-purple-600 text-white p-4">
          <button onClick={onBack} className="flex items-center gap-2 mb-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">{t('back')}</span>
          </button>
          <h1 className="text-lg font-bold">{t('view_minutes')}</h1>
        </div>
        <div className="p-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-sm text-amber-900">{t('no_meetings')}</p>
          </div>
        </div>
      </div>
    );
  }

  const votingResults = minutesData.voting_results || [];

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-4 sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-2 mb-2 hover:bg-white/10 rounded-lg px-2 py-1 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">{t('back')}</span>
        </button>
        <h1 className="text-lg font-bold">{t('view_minutes')}</h1>
        <p className="text-xs opacity-90 mt-1">{formatDate(minutesData.date)}</p>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            {t('meeting_basic_info')}
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">{t('meeting_date')}</span>
              <span className="font-medium text-gray-900">{formatDate(minutesData.date)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">{t('chairperson')}</span>
              <span className="font-medium text-gray-900">{minutesData.chairperson}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">{t('participant_count')}</span>
              <span className="font-medium text-gray-900">{minutesData.participants_count}</span>
            </div>

            {minutesData.meeting_start_time && minutesData.meeting_end_time && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {t('start_time')} - {t('end_time')}
                </span>
                <span className="font-medium text-gray-900">
                  {minutesData.meeting_start_time} - {minutesData.meeting_end_time}
                </span>
              </div>
            )}
          </div>
        </div>

        {minutesData.agenda && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              {t('meeting_agenda')}
            </h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{minutesData.agenda}</p>
          </div>
        )}

        {minutesData.presentation_summary && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-900 mb-2">{t('presentation_summary')}</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{minutesData.presentation_summary}</p>
          </div>
        )}

        {minutesData.discussion_points && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-900 mb-2">{t('discussion_points')}</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{minutesData.discussion_points}</p>
          </div>
        )}

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">🗳️ {t('voting')}</h2>

          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-1">{t('voting_method')}</p>
            <p className="text-sm font-medium text-gray-900">
              {minutesData.voting_method === 'hands' ? t('hands') : t('secret_ballot')}
            </p>
          </div>

          {votingResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700 mb-2">{t('voting_results')}</p>
              {votingResults.map((result: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900 mb-2">{result.content_item}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded p-2">
                      <p className="text-gray-600">{t('votes_for')}</p>
                      <p className="font-semibold text-emerald-600">{result.agree_count}</p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-gray-600">{t('total_attendees')}</p>
                      <p className="font-semibold text-gray-900">{result.total_attendees}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {minutesData.approved_contents && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-900 mb-2">✅ {t('approved_contents')}</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{minutesData.approved_contents}</p>
          </div>
        )}

        <div className="pb-6">
          <button
            onClick={onBack}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            {t('back')}
          </button>
        </div>
      </div>
    </div>
  );
}
