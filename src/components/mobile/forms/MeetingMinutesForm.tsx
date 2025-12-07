import { useState } from 'react';
import { ArrowLeft, Save, Users, Plus, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface MeetingMinutesFormProps {
  communityId: string;
  fiscalYearId: string;
  onBack: () => void;
  onSuccess: () => void;
}

interface VotingResult {
  content_item: string;
  agree_count: number;
  total_attendees: number;
}

export function MeetingMinutesForm({ communityId, fiscalYearId, onBack, onSuccess }: MeetingMinutesFormProps) {
  const [loading, setLoading] = useState(false);
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

  const [votingResults, setVotingResults] = useState<VotingResult[]>([
    { content_item: '', agree_count: 0, total_attendees: 0 },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const { error } = await supabase
        .from('meeting_records')
        .insert({
          community_id: communityId,
          fiscal_year_id: fiscalYearId,
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

      await supabase
        .from('workflow_status')
        .update({
          meeting_scheduled_completed: true,
          minutes_uploaded_completed: true,
          current_step: 'plan_created',
        })
        .eq('community_id', communityId)
        .eq('fiscal_year_id', fiscalYearId);

      alert('✅ 議事録が登録されました！');
      onSuccess();
    } catch (error) {
      console.error('Error submitting meeting minutes:', error);
      alert('登録エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addVotingResult = () => {
    setVotingResults([...votingResults, { content_item: '', agree_count: 0, total_attendees: 0 }]);
  };

  const removeVotingResult = (index: number) => {
    setVotingResults(votingResults.filter((_, i) => i !== index));
  };

  const updateVotingResult = (index: number, field: keyof VotingResult, value: any) => {
    const updated = [...votingResults];
    updated[index] = { ...updated[index], [field]: value };
    setVotingResults(updated);
  };

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-4 sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-2 mb-2 hover:bg-white/10 rounded-lg px-2 py-1 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">戻る</span>
        </button>
        <h1 className="text-lg font-bold">議事録登録フォーム</h1>
        <p className="text-xs opacity-90 mt-1">Template 02 - Community Meeting Minutes</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            会議基本情報
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">会議日 *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">議長名 *</label>
              <input
                type="text"
                required
                value={formData.chairperson}
                onChange={(e) => handleChange('chairperson', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">参加者数 *</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">開始時刻 *</label>
                <input
                  type="time"
                  required
                  value={formData.meeting_start_time}
                  onChange={(e) => handleChange('meeting_start_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">終了時刻 *</label>
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
          <h2 className="font-bold text-gray-900 mb-3">📋 会議内容</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">議題 *</label>
              <textarea
                required
                value={formData.agenda}
                onChange={(e) => handleChange('agenda', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
                placeholder="会議の主な議題"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">プレゼンテーション要約 *</label>
              <textarea
                required
                value={formData.presentation_summary}
                onChange={(e) => handleChange('presentation_summary', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder="目的、要件、提示された内容"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">討議内容 *</label>
              <textarea
                required
                value={formData.discussion_points}
                onChange={(e) => handleChange('discussion_points', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={4}
                placeholder="主な討議ポイントと意見"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">🗳️ 投票</h2>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">投票方式 *</label>
            <select
              required
              value={formData.voting_method}
              onChange={(e) => handleChange('voting_method', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="hands">挙手</option>
              <option value="secret">秘密投票</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">投票結果</label>
              <button
                type="button"
                onClick={addVotingResult}
                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                項目追加
              </button>
            </div>

            {votingResults.map((result, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <input
                    type="text"
                    value={result.content_item}
                    onChange={(e) => updateVotingResult(index, 'content_item', e.target.value)}
                    placeholder="投票項目"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
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
                    placeholder="賛成票"
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    value={result.total_attendees || ''}
                    onChange={(e) => updateVotingResult(index, 'total_attendees', parseInt(e.target.value) || 0)}
                    placeholder="出席者数"
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">✅ 承認内容</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">承認された内容 *</label>
            <textarea
              required
              value={formData.approved_contents}
              onChange={(e) => handleChange('approved_contents', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              rows={4}
              placeholder="会議で承認された決定事項"
            />
          </div>
        </div>

        <div className="flex gap-3 pb-6">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                登録中...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                議事録を登録
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
