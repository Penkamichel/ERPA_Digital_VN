import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Lightbulb, DollarSign } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';

interface IdeaRegistrationFormProps {
  communityId: string;
  fiscalYearId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function IdeaRegistrationForm({ communityId, fiscalYearId, onBack, onSuccess }: IdeaRegistrationFormProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [totalAvailableFunds, setTotalAvailableFunds] = useState<number>(0);
  const [loadingFunds, setLoadingFunds] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Agriculture & Forestry Extension',
    problem_statement: '',
    description: '',
    expected_location: '',
    expected_beneficiaries: '',
    estimated_budget_total: '',
    estimated_community_contribution: '',
    submitted_by: '',
    submission_date: new Date().toISOString().split('T')[0],
    alignment: {
      article_6_3: false,
      not_overlapping: false,
      within_limit: false,
    },
  });

  const categories = [
    'Agriculture & Forestry Extension',
    'Livelihood Support',
    'Public Construction Material Support',
    'Propaganda / Training',
    'Other (Aligned with Article 6.3)',
  ];

  useEffect(() => {
    loadAvailableFunds();
  }, [communityId, fiscalYearId]);

  const loadAvailableFunds = async () => {
    try {
      setLoadingFunds(true);
      const { data, error } = await supabase
        .from('fund_registrations')
        .select('amount_received_vnd')
        .eq('community_id', communityId)
        .eq('fiscal_year_id', fiscalYearId);

      if (error) throw error;

      const total = data?.reduce((sum, record) => sum + (Number(record.amount_received_vnd) || 0), 0) || 0;
      setTotalAvailableFunds(total);
    } catch (error) {
      console.error('Error loading available funds:', error);
    } finally {
      setLoadingFunds(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { article_6_3, not_overlapping, within_limit } = formData.alignment;
    if (!article_6_3 || !not_overlapping || !within_limit) {
      alert(t('all_compliance_checks_required'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('ideas')
        .insert({
          community_id: communityId,
          fiscal_year_id: fiscalYearId,
          title: formData.title,
          category: formData.category,
          problem_statement: formData.problem_statement,
          description: formData.description,
          expected_location: formData.expected_location,
          expected_beneficiaries: formData.expected_beneficiaries,
          estimated_budget_total: parseFloat(formData.estimated_budget_total) || null,
          estimated_community_contribution: formData.estimated_community_contribution,
          alignment_with_decree: JSON.stringify([
            formData.alignment.article_6_3 ? 'article_6_3' : null,
            formData.alignment.not_overlapping ? 'not_overlapping' : null,
            formData.alignment.within_limit ? 'within_limit' : null,
          ].filter(Boolean)),
          submitted_by: formData.submitted_by,
          submission_date: formData.submission_date,
          status: 'submitted',
        });

      if (error) throw error;

      alert('✅ ' + t('idea_registered_success'));
      onSuccess();
    } catch (error) {
      console.error('Error submitting idea:', error);
      alert(t('registration_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAlignmentChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      alignment: { ...prev.alignment, [field]: value },
    }));
  };

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white p-4 sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-2 mb-2 hover:bg-white/10 rounded-lg px-2 py-1 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">{t('back')}</span>
        </button>
        <h1 className="text-lg font-bold">{t('idea_registration_form')}</h1>
        <p className="text-xs opacity-90 mt-1">{t('activity_proposal')}</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 shadow-sm border-2 border-emerald-300">
          <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            {t('available_funds_total')}
          </h2>

          {loadingFunds ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              {t('loading')}
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-emerald-700 mb-1">
                {totalAvailableFunds.toLocaleString()} VND
              </div>
              <p className="text-xs text-gray-700">
                {t('fund_registration_total_info')}
              </p>
              {totalAvailableFunds === 0 && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800 font-semibold">
                    ⚠️ {t('no_funds_registered')}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            {t('basic_info')}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('idea_title')} *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder=""
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('category')} *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('problem_statement')} *</label>
              <textarea
                required
                value={formData.problem_statement}
                onChange={(e) => handleChange('problem_statement', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder=""
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('solution_description')} *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={4}
                placeholder=""
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">📍 {t('implementation_info')}</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('expected_location')} *</label>
              <input
                type="text"
                required
                value={formData.expected_location}
                onChange={(e) => handleChange('expected_location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('beneficiaries')}</label>
              <textarea
                value={formData.expected_beneficiaries}
                onChange={(e) => handleChange('expected_beneficiaries', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
                placeholder=""
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">💰 {t('budget_estimate')}</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('total_budget_estimate')}</label>
              <input
                type="number"
                value={formData.estimated_budget_total}
                onChange={(e) => handleChange('estimated_budget_total', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder=""
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('community_contribution')}</label>
              <textarea
                value={formData.estimated_community_contribution}
                onChange={(e) => handleChange('estimated_community_contribution', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
                placeholder=""
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h2 className="font-bold text-blue-900 mb-3">✓ {t('compliance_check')}</h2>

          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.alignment.article_6_3}
                onChange={(e) => handleAlignmentChange('article_6_3', e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 rounded"
                required
              />
              <span className="text-sm text-blue-900 flex-1">
                {t('article_6_3_compliance')}
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.alignment.not_overlapping}
                onChange={(e) => handleAlignmentChange('not_overlapping', e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 rounded"
                required
              />
              <span className="text-sm text-blue-900 flex-1">
                {t('no_overlap_compliance')}
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.alignment.within_limit}
                onChange={(e) => handleAlignmentChange('within_limit', e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 rounded"
                required
              />
              <span className="text-sm text-blue-900 flex-1">
                {t('within_limit_compliance')}
              </span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">📝 {t('submission_info')}</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('submitter')} *</label>
              <input
                type="text"
                required
                value={formData.submitted_by}
                onChange={(e) => handleChange('submitted_by', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
            className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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
