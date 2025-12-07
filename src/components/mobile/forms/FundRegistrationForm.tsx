import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface FundRegistrationFormProps {
  communityId: string;
  fiscalYearId: string;
  onBack: () => void;
  onSuccess: () => void;
}

interface Activity {
  id: string;
  activity_name: string;
}

const FUND_SOURCES = [
  'Forest Owner (ERPA)',
  'Provincial Fund (ERPA)',
  'CPC (ERPA-related)',
  'Community Donation',
  'Private Donor / NGO',
  'Previous Year Carry-over',
];

const FUND_PURPOSES = [
  'Forest protection contract',
  'Livelihood development support',
  'Participatory forest management support',
  'Community development / donation',
  'Infrastructure co-financing',
  'Emergency / contingency',
  'Other community-approved purpose',
];

const DONATION_TYPES = ['Cash', 'Material (in-kind)', 'Labor'];

export function FundRegistrationForm({ communityId, fiscalYearId, onBack, onSuccess }: FundRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formData, setFormData] = useState({
    fund_source: 'Forest Owner (ERPA)',
    fund_purpose: 'Forest protection contract',
    amount_received_vnd: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_reference_number: '',
    payer_name: '',
    related_activity_id: '',
    donation_type: 'Cash',
    carry_over_reference_year: '',
    notes: '',
    recorded_by: '',
    recorded_date: new Date().toISOString().split('T')[0],
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
        .eq('fiscal_year_id', fiscalYearId);

      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const isErpaFund = () => {
    return ['Forest Owner (ERPA)', 'Provincial Fund (ERPA)', 'CPC (ERPA-related)'].includes(formData.fund_source);
  };

  const isCommunityDonation = () => {
    return formData.fund_source === 'Community Donation';
  };

  const isCarryOver = () => {
    return formData.fund_source === 'Previous Year Carry-over';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isErpaFund() && !formData.related_activity_id) {
      alert('ERPA資金の場合、関連活動の選択が必要です');
      return;
    }

    if (isCommunityDonation() && !formData.donation_type) {
      alert('コミュニティ寄付の場合、寄付タイプの選択が必要です');
      return;
    }

    if (isCarryOver() && !formData.carry_over_reference_year) {
      alert('繰越金の場合、参照年度が必要です');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('fund_registrations')
        .insert({
          community_id: communityId,
          fiscal_year_id: fiscalYearId,
          fund_source: formData.fund_source,
          fund_purpose: formData.fund_purpose,
          is_erpa_fund: isErpaFund(),
          amount_received_vnd: parseFloat(formData.amount_received_vnd) || 0,
          payment_date: formData.payment_date,
          payment_reference_number: formData.payment_reference_number || null,
          payer_name: formData.payer_name,
          related_activity_id: formData.related_activity_id || null,
          donation_type: isCommunityDonation() ? formData.donation_type : null,
          carry_over_reference_year: isCarryOver() ? parseInt(formData.carry_over_reference_year) : null,
          notes: formData.notes,
          recorded_by: formData.recorded_by,
          recorded_date: formData.recorded_date,
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
        <p className="text-xs opacity-90 mt-1">資金の受領を登録</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>💰</span>
            資金情報
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">資金源 *</label>
              <select
                required
                value={formData.fund_source}
                onChange={(e) => handleChange('fund_source', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {FUND_SOURCES.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">資金目的 *</label>
              <select
                required
                value={formData.fund_purpose}
                onChange={(e) => handleChange('fund_purpose', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {FUND_PURPOSES.map(purpose => (
                  <option key={purpose} value={purpose}>{purpose}</option>
                ))}
              </select>
            </div>

            {isErpaFund() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 font-semibold">
                  🔵 ERPA資金として登録されます
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">受領金額 (VND) *</label>
              <input
                type="number"
                required
                value={formData.amount_received_vnd}
                onChange={(e) => handleChange('amount_received_vnd', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="例: 50000000"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>📄</span>
            支払い情報
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">支払日 *</label>
              <input
                type="date"
                required
                value={formData.payment_date}
                onChange={(e) => handleChange('payment_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">支払者名 *</label>
              <input
                type="text"
                required
                value={formData.payer_name}
                onChange={(e) => handleChange('payer_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="例: Provincial Forest Protection Fund"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">参照番号</label>
              <input
                type="text"
                value={formData.payment_reference_number}
                onChange={(e) => handleChange('payment_reference_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="例: PAYMENT-2025-001"
              />
            </div>
          </div>
        </div>

        {isErpaFund() && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>🔗</span>
              ERPA関連情報
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">関連活動 *</label>
                {activities.length > 0 ? (
                  <select
                    required={isErpaFund()}
                    value={formData.related_activity_id}
                    onChange={(e) => handleChange('related_activity_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">選択してください</option>
                    {activities.map(activity => (
                      <option key={activity.id} value={activity.id}>
                        {activity.activity_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
                    まだ活動が登録されていません。先に活動計画を作成してください。
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  💡 実際のアプリでは、ここで支援書類（契約書、承認レターなど）をアップロードできます
                </p>
              </div>
            </div>
          </div>
        )}

        {isCommunityDonation() && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-200">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>🎁</span>
              寄付情報
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">寄付タイプ *</label>
              <select
                required={isCommunityDonation()}
                value={formData.donation_type}
                onChange={(e) => handleChange('donation_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {DONATION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isCarryOver() && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-200">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>🔄</span>
              繰越情報
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">繰越元年度 *</label>
              <input
                type="number"
                required={isCarryOver()}
                value={formData.carry_over_reference_year}
                onChange={(e) => handleChange('carry_over_reference_year', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="例: 2024"
                min="2020"
                max="2030"
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>📝</span>
            記録情報
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">備考</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder="追加情報があれば記入してください"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">記録者 *</label>
              <input
                type="text"
                required
                value={formData.recorded_by}
                onChange={(e) => handleChange('recorded_by', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="例: Siriporn"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">記録日 *</label>
              <input
                type="date"
                required
                value={formData.recorded_date}
                onChange={(e) => handleChange('recorded_date', e.target.value)}
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
