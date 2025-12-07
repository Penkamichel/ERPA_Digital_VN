import { useState } from 'react';
import { ArrowLeft, Save, FileText, Plus, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface PlanBudgetFormProps {
  communityId: string;
  fiscalYearId: string;
  onBack: () => void;
  onSuccess: () => void;
}

interface BudgetItem {
  item_name: string;
  unit: string;
  quantity: number;
  unit_cost: number;
}

export function PlanBudgetForm({ communityId, fiscalYearId, onBack, onSuccess }: PlanBudgetFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    activity_name: '',
    activity_category: 'Agriculture–forestry extension',
    period_start: '',
    period_end: '',
    forest_owner_support: '',
    community_contribution: '',
    other_funds: '',
    implementation_method: 'community' as 'community' | 'contractor' | 'co-implemented',
    notes: '',
  });

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { item_name: '', unit: '', quantity: 0, unit_cost: 0 },
  ]);

  const categories = [
    'Agriculture–forestry extension',
    'Public construction material support',
    'Propaganda / training',
  ];

  const calculateTotal = () => {
    return budgetItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const totalBudget = calculateTotal();

      const { data: activity, error: activityError } = await supabase
        .from('plan_activities')
        .insert({
          community_id: communityId,
          fiscal_year_id: fiscalYearId,
          activity_name: formData.activity_name,
          activity_category: formData.activity_category,
          period_start: formData.period_start,
          period_end: formData.period_end,
          forest_owner_support: parseFloat(formData.forest_owner_support) || 0,
          community_contribution: parseFloat(formData.community_contribution) || 0,
          other_funds: parseFloat(formData.other_funds) || 0,
          total_budget: totalBudget,
          implementation_method: formData.implementation_method,
          notes: formData.notes,
          status: 'submitted',
        })
        .select()
        .single();

      if (activityError) throw activityError;

      const budgetItemsToInsert = budgetItems
        .filter(item => item.item_name && item.quantity > 0)
        .map(item => ({
          plan_activity_id: activity.id,
          item_name: item.item_name,
          unit: item.unit,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          amount: item.quantity * item.unit_cost,
        }));

      if (budgetItemsToInsert.length > 0) {
        const { error: budgetError } = await supabase
          .from('budget_items')
          .insert(budgetItemsToInsert);

        if (budgetError) throw budgetError;
      }

      await supabase
        .from('workflow_status')
        .update({
          plan_created_completed: true,
          current_step: 'activities_ongoing',
        })
        .eq('community_id', communityId)
        .eq('fiscal_year_id', fiscalYearId);

      alert('✅ Plan & Budgetが登録されました！');
      onSuccess();
    } catch (error) {
      console.error('Error submitting plan & budget:', error);
      alert('登録エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addBudgetItem = () => {
    setBudgetItems([...budgetItems, { item_name: '', unit: '', quantity: 0, unit_cost: 0 }]);
  };

  const removeBudgetItem = (index: number) => {
    setBudgetItems(budgetItems.filter((_, i) => i !== index));
  };

  const updateBudgetItem = (index: number, field: keyof BudgetItem, value: any) => {
    const updated = [...budgetItems];
    updated[index] = { ...updated[index], [field]: value };
    setBudgetItems(updated);
  };

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-4 sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-2 mb-2 hover:bg-white/10 rounded-lg px-2 py-1 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">戻る</span>
        </button>
        <h1 className="text-lg font-bold">Plan & Budget登録フォーム</h1>
        <p className="text-xs opacity-90 mt-1">Template 03 - Activity Plan and Budget</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            活動情報
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">活動名 *</label>
              <input
                type="text"
                required
                value={formData.activity_name}
                onChange={(e) => handleChange('activity_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="例: 養蜂トレーニング"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">カテゴリー *</label>
              <select
                required
                value={formData.activity_category}
                onChange={(e) => handleChange('activity_category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">開始日 *</label>
                <input
                  type="date"
                  required
                  value={formData.period_start}
                  onChange={(e) => handleChange('period_start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">終了日 *</label>
                <input
                  type="date"
                  required
                  value={formData.period_end}
                  onChange={(e) => handleChange('period_end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">実施方式 *</label>
              <select
                required
                value={formData.implementation_method}
                onChange={(e) => handleChange('implementation_method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="community">Community self-implementation</option>
                <option value="contractor">Contract with provider</option>
                <option value="co-implemented">Co-financed activity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">備考</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">💰 資金源</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">森林所有者からの支援 (VND)</label>
              <input
                type="number"
                value={formData.forest_owner_support}
                onChange={(e) => handleChange('forest_owner_support', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">コミュニティ拠出 (VND)</label>
              <input
                type="number"
                value={formData.community_contribution}
                onChange={(e) => handleChange('community_contribution', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">その他の資金 (VND)</label>
              <input
                type="number"
                value={formData.other_funds}
                onChange={(e) => handleChange('other_funds', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">📋 予算内訳</h2>
            <button
              type="button"
              onClick={addBudgetItem}
              className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              項目追加
            </button>
          </div>

          <div className="space-y-3">
            {budgetItems.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <input
                    type="text"
                    value={item.item_name}
                    onChange={(e) => updateBudgetItem(index, 'item_name', e.target.value)}
                    placeholder="項目名"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  {budgetItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBudgetItem(index)}
                      className="text-red-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => updateBudgetItem(index, 'unit', e.target.value)}
                    placeholder="単位"
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    value={item.quantity || ''}
                    onChange={(e) => updateBudgetItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    placeholder="数量"
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    value={item.unit_cost || ''}
                    onChange={(e) => updateBudgetItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                    placeholder="単価"
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-600">小計: </span>
                  <span className="text-sm font-bold text-emerald-600">
                    {(item.quantity * item.unit_cost).toLocaleString()} VND
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">総予算:</span>
              <span className="text-xl font-bold text-emerald-600">
                {calculateTotal().toLocaleString()} VND
              </span>
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
            className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                登録中...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Plan & Budgetを登録
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
