import { useState } from 'react';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface FundRegistrationFormProps {
  communityId: string;
  fiscalYearId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function FundRegistrationForm({ communityId, fiscalYearId, onBack, onSuccess }: FundRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    community_name: '',
    address: '',
    number_households: '',
    representative_fullname: '',
    representative_dob: '',
    representative_position: '',
    representative_id_number: '',
    representative_id_issue_date: '',
    representative_id_issued_by: '',
    forest_protection_location: '',
    forest_protection_area_ha: '',
    livelihood_supported_activities: '',
    livelihood_location: '',
    livelihood_support_mode: 'Cash',
    commitment_agree_regulations: false,
    approved_amount: '',
    registered_by: '',
    submission_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.commitment_agree_regulations) {
      alert('規則への同意が必要です');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('fund_registrations')
        .insert({
          community_id: communityId,
          fiscal_year_id: fiscalYearId,
          ...formData,
          number_households: parseInt(formData.number_households) || 0,
          forest_protection_area_ha: parseFloat(formData.forest_protection_area_ha) || null,
          approved_amount: parseFloat(formData.approved_amount) || 0,
          status: 'registered',
        });

      if (error) throw error;

      await supabase
        .from('workflow_status')
        .update({ fund_registration_completed: true, current_step: 'meeting_scheduled' })
        .eq('community_id', communityId)
        .eq('fiscal_year_id', fiscalYearId);

      alert('✅ Fund登録が完了しました！');
      onSuccess();
    } catch (error) {
      console.error('Error submitting fund registration:', error);
      alert('登録エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-2 mb-2 hover:bg-white/10 rounded-lg px-2 py-1 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">戻る</span>
        </button>
        <h1 className="text-lg font-bold">Fund登録フォーム</h1>
        <p className="text-xs opacity-90 mt-1">Template 01 - Participating in Forest Management Proposal</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>🏘️</span>
            コミュニティ情報
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">コミュニティ名 *</label>
              <input
                type="text"
                required
                value={formData.community_name}
                onChange={(e) => handleChange('community_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="例: Ban Pho Village"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">住所 *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">世帯数 *</label>
              <input
                type="number"
                required
                value={formData.number_households}
                onChange={(e) => handleChange('number_households', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>👤</span>
            代表者情報
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">氏名 *</label>
              <input
                type="text"
                required
                value={formData.representative_fullname}
                onChange={(e) => handleChange('representative_fullname', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">生年月日 *</label>
              <input
                type="date"
                required
                value={formData.representative_dob}
                onChange={(e) => handleChange('representative_dob', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">役職 *</label>
              <input
                type="text"
                required
                value={formData.representative_position}
                onChange={(e) => handleChange('representative_position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="例: Chairperson"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">ID番号 *</label>
              <input
                type="text"
                required
                value={formData.representative_id_number}
                onChange={(e) => handleChange('representative_id_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">ID発行日 *</label>
              <input
                type="date"
                required
                value={formData.representative_id_issue_date}
                onChange={(e) => handleChange('representative_id_issue_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">ID発行機関 *</label>
              <input
                type="text"
                required
                value={formData.representative_id_issued_by}
                onChange={(e) => handleChange('representative_id_issued_by', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>🌲</span>
            森林保護情報
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">保護場所</label>
              <input
                type="text"
                value={formData.forest_protection_location}
                onChange={(e) => handleChange('forest_protection_location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">保護面積 (ha)</label>
              <input
                type="number"
                step="0.01"
                value={formData.forest_protection_area_ha}
                onChange={(e) => handleChange('forest_protection_area_ha', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>🌾</span>
            生活支援情報
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">支援活動内容</label>
              <textarea
                value={formData.livelihood_supported_activities}
                onChange={(e) => handleChange('livelihood_supported_activities', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">活動場所</label>
              <input
                type="text"
                value={formData.livelihood_location}
                onChange={(e) => handleChange('livelihood_location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">支援方式</label>
              <select
                value={formData.livelihood_support_mode}
                onChange={(e) => handleChange('livelihood_support_mode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="Cash">Cash</option>
                <option value="In-kind (materials)">In-kind (materials)</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>💰</span>
            予算情報
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">承認金額 (VND) *</label>
              <input
                type="number"
                required
                value={formData.approved_amount}
                onChange={(e) => handleChange('approved_amount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="例: 50000000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">登録者 *</label>
              <input
                type="text"
                required
                value={formData.registered_by}
                onChange={(e) => handleChange('registered_by', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">提出日 *</label>
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

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.commitment_agree_regulations}
              onChange={(e) => handleChange('commitment_agree_regulations', e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-600 rounded"
              required
            />
            <span className="text-sm text-blue-900 flex-1">
              森林契約および生活支援に関する規則に従うことに同意します *
            </span>
          </label>
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
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                登録中...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                登録する
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
