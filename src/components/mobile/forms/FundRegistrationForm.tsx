import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';

interface FundRegistrationFormProps {
  communityId: string;
  fiscalYearId: string;
  onBack: () => void;
  onSuccess: () => void;
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
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fund_source: 'Forest Owner (ERPA)',
    fund_purpose: 'Forest protection contract',
    amount_received_vnd: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_reference_number: '',
    payer_name: '',
    donation_type: 'Cash',
    carry_over_reference_year: '',
    notes: '',
    recorded_by: '',
    recorded_date: new Date().toISOString().split('T')[0],
  });

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

    if (isCommunityDonation() && !formData.donation_type) {
      alert(t('donation_type_required'));
      return;
    }

    if (isCarryOver() && !formData.carry_over_reference_year) {
      alert(t('carryover_year_required'));
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

      alert('✅ ' + t('fund_register_success'));
      onSuccess();
    } catch (error) {
      console.error('Error submitting fund registration:', error);
      alert(t('registration_error'));
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
          <span className="text-sm">{t('back')}</span>
        </button>
        <h1 className="text-lg font-bold">{t('fund_registration_form')}</h1>
        <p className="text-xs opacity-90 mt-1">{t('register_fund_receipt')}</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>💰</span>
            {t('fund_info')}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('fund_source')} *</label>
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('fund_purpose')} *</label>
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
                  🔵 {t('erpa_fund_notice')}
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('amount_received')} *</label>
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
            {t('payment_info')}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('payment_date')} *</label>
              <input
                type="date"
                required
                value={formData.payment_date}
                onChange={(e) => handleChange('payment_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('payer_name')} *</label>
              <input
                type="text"
                required
                value={formData.payer_name}
                onChange={(e) => handleChange('payer_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="e.g., Provincial Forest Protection Fund"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('payment_reference_number')}</label>
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

        {isCommunityDonation() && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-200">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>🎁</span>
              {t('donation_info')}
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('donation_type')} *</label>
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
              {t('carryover_info')}
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('carryover_reference_year')} *</label>
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
            {t('recording_info')}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('notes')}</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder=""
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('recorder')} *</label>
              <input
                type="text"
                required
                value={formData.recorded_by}
                onChange={(e) => handleChange('recorded_by', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="e.g., Siriporn"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('record_date')} *</label>
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
