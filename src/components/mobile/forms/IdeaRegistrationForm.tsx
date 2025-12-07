import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Lightbulb, DollarSign } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface IdeaRegistrationFormProps {
  communityId: string;
  fiscalYearId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function IdeaRegistrationForm({ communityId, fiscalYearId, onBack, onSuccess }: IdeaRegistrationFormProps) {
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
      alert('全ての法令適合チェックが必要です');
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

      alert('✅ アイデアが登録されました！');
      onSuccess();
    } catch (error) {
      console.error('Error submitting idea:', error);
      alert('登録エラーが発生しました');
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
          <span className="text-sm">戻る</span>
        </button>
        <h1 className="text-lg font-bold">アイデア登録フォーム</h1>
        <p className="text-xs opacity-90 mt-1">活動提案（Plan/Budget作成前）</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 shadow-sm border-2 border-emerald-300">
          <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            利用可能な資金総額
          </h2>

          {loadingFunds ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              読み込み中...
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-emerald-700 mb-1">
                {totalAvailableFunds.toLocaleString()} VND
              </div>
              <p className="text-xs text-gray-700">
                Fund登録で受領した資金の合計額です。この範囲内で活動計画を立ててください。
              </p>
              {totalAvailableFunds === 0 && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800 font-semibold">
                    ⚠️ まだ資金が登録されていません。先にFund登録を完了してください。
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            基本情報
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">アイデアタイトル *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="例: 養蜂技術の向上"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">カテゴリー *</label>
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">問題・課題 *</label>
              <textarea
                required
                value={formData.problem_statement}
                onChange={(e) => handleChange('problem_statement', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder="現在直面している問題や課題を記入してください"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">解決策・詳細説明 *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={4}
                placeholder="提案する解決策や活動内容を詳しく記入してください"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">📍 実施情報</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">実施予定場所 *</label>
              <input
                type="text"
                required
                value={formData.expected_location}
                onChange={(e) => handleChange('expected_location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">受益者</label>
              <textarea
                value={formData.expected_beneficiaries}
                onChange={(e) => handleChange('expected_beneficiaries', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
                placeholder="誰がこの活動から恩恵を受けるか"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">💰 予算見積</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">総予算見積（VND）</label>
              <input
                type="number"
                value={formData.estimated_budget_total}
                onChange={(e) => handleChange('estimated_budget_total', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="例: 15000000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">コミュニティ拠出</label>
              <textarea
                value={formData.estimated_community_contribution}
                onChange={(e) => handleChange('estimated_community_contribution', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
                placeholder="労働力、資材などコミュニティからの拠出内容"
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h2 className="font-bold text-blue-900 mb-3">✓ 法令適合チェック</h2>

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
                Article 6.3 livelihood developmentに適合
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
                他の国家予算支援と重複していない（Annex I I.2.d）
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
                5000万VND/年以内の制限を守っている
              </span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">📝 提出情報</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">提出者 *</label>
              <input
                type="text"
                required
                value={formData.submitted_by}
                onChange={(e) => handleChange('submitted_by', e.target.value)}
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
            className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                登録中...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                アイデアを登録
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
