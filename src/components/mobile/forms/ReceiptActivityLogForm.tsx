import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Receipt, Plus, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface ReceiptActivityLogFormProps {
  communityId: string;
  fiscalYearId: string;
  onBack: () => void;
  onSuccess: () => void;
}

interface Activity {
  id: string;
  activity_name: string;
}

interface ReceiptItem {
  expense_category: string;
  vendor_name: string;
  invoice_number: string;
  amount_vnd: number;
}

export function ReceiptActivityLogForm({ communityId, fiscalYearId, onBack, onSuccess }: ReceiptActivityLogFormProps) {
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formData, setFormData] = useState({
    activity_id: '',
    description_of_work: '',
    date_of_activity: new Date().toISOString().split('T')[0],
    location: '',
    submitted_by: '',
    submission_date: new Date().toISOString().split('T')[0],
  });

  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([
    { expense_category: 'Seedlings / breeds', vendor_name: '', invoice_number: '', amount_vnd: 0 },
  ]);

  const expenseCategories = [
    'Seedlings / breeds',
    'Construction materials',
    'Agriculture-forestry extension tools',
    'Training / Propaganda',
    'Others (must align with approved plan)',
  ];

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const { data } = await supabase
        .from('plan_activities')
        .select('id, activity_name')
        .eq('community_id', communityId)
        .eq('fiscal_year_id', fiscalYearId)
        .in('status', ['approved', 'ongoing']);

      setActivities(data || []);
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, activity_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.activity_id) {
      alert('活動を選択してください');
      return;
    }

    setLoading(true);
    try {
      await supabase
        .from('activity_progress_notes')
        .insert({
          plan_activity_id: formData.activity_id,
          note_text: formData.description_of_work,
          created_by: formData.submitted_by,
          progress_percentage: 50,
        });

      const receiptsToInsert = receiptItems
        .filter(item => item.vendor_name || item.invoice_number || item.amount_vnd > 0)
        .map(item => ({
          plan_activity_id: formData.activity_id,
          expense_category: item.expense_category,
          vendor_name: item.vendor_name,
          invoice_number: item.invoice_number,
          amount_vnd: item.amount_vnd,
          description_of_work: formData.description_of_work,
          date_of_activity: formData.date_of_activity,
          location: formData.location,
          submitted_by: formData.submitted_by,
          submission_date: formData.submission_date,
          file_url: 'placeholder.pdf',
          file_type: 'pdf',
          uploaded_by_role: 'cmb',
          verified: false,
        }));

      if (receiptsToInsert.length > 0) {
        const { error } = await supabase
          .from('receipts')
          .insert(receiptsToInsert);

        if (error) throw error;
      }

      await supabase
        .from('plan_activities')
        .update({ status: 'ongoing' })
        .eq('id', formData.activity_id);

      alert('✅ 活動ログとレシートが登録されました！');
      onSuccess();
    } catch (error) {
      console.error('Error submitting receipt and activity log:', error);
      alert('登録エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addReceiptItem = () => {
    setReceiptItems([...receiptItems, {
      expense_category: 'Seedlings / breeds',
      vendor_name: '',
      invoice_number: '',
      amount_vnd: 0,
    }]);
  };

  const removeReceiptItem = (index: number) => {
    setReceiptItems(receiptItems.filter((_, i) => i !== index));
  };

  const updateReceiptItem = (index: number, field: keyof ReceiptItem, value: any) => {
    const updated = [...receiptItems];
    updated[index] = { ...updated[index], [field]: value };
    setReceiptItems(updated);
  };

  const calculateTotal = () => {
    return receiptItems.reduce((sum, item) => sum + item.amount_vnd, 0);
  };

  if (activities.length === 0) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">承認された活動がありません</p>
          <button onClick={onBack} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white p-4 sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-2 mb-2 hover:bg-white/10 rounded-lg px-2 py-1 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">戻る</span>
        </button>
        <h1 className="text-lg font-bold">レシート・活動ログ登録</h1>
        <p className="text-xs opacity-90 mt-1">Receipt/Invoice and Activity Log</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" />
            活動情報
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">対象活動 *</label>
              <select
                required
                value={formData.activity_id}
                onChange={(e) => handleChange('activity_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {activities.map(activity => (
                  <option key={activity.id} value={activity.id}>
                    {activity.activity_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">活動日 *</label>
              <input
                type="date"
                required
                value={formData.date_of_activity}
                onChange={(e) => handleChange('date_of_activity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">場所 *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">作業内容・活動ログ *</label>
              <textarea
                required
                value={formData.description_of_work}
                onChange={(e) => handleChange('description_of_work', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={4}
                placeholder="実施した作業内容を詳しく記入してください"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">🧾 レシート・領収書</h2>
            <button
              type="button"
              onClick={addReceiptItem}
              className="bg-teal-100 text-teal-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              項目追加
            </button>
          </div>

          <div className="space-y-3">
            {receiptItems.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <select
                    value={item.expense_category}
                    onChange={(e) => updateReceiptItem(index, 'expense_category', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {expenseCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {receiptItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeReceiptItem(index)}
                      className="text-red-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={item.vendor_name}
                    onChange={(e) => updateReceiptItem(index, 'vendor_name', e.target.value)}
                    placeholder="業者名"
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    value={item.invoice_number}
                    onChange={(e) => updateReceiptItem(index, 'invoice_number', e.target.value)}
                    placeholder="領収書番号"
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <input
                  type="number"
                  value={item.amount_vnd || ''}
                  onChange={(e) => updateReceiptItem(index, 'amount_vnd', parseFloat(e.target.value) || 0)}
                  placeholder="金額 (VND)"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
                  💡 実際のアプリでは、ここで写真をアップロードできます
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">合計金額:</span>
              <span className="text-xl font-bold text-teal-600">
                {calculateTotal().toLocaleString()} VND
              </span>
            </div>
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
            className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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
