import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Receipt, Plus, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';

interface ReceiptFormProps {
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

export function ReceiptForm({ communityId, fiscalYearId, onBack, onSuccess }: ReceiptFormProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formData, setFormData] = useState({
    activity_id: '',
    description_of_work: '',
    date_of_activity: new Date().toISOString().split('T')[0],
    location: '',
    submitted_by: user?.email || '',
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
      alert(t('select_activity'));
      return;
    }

    const validReceipts = receiptItems.filter(item => item.vendor_name || item.invoice_number || item.amount_vnd > 0);

    if (validReceipts.length === 0) {
      alert('At least one receipt item is required');
      return;
    }

    setLoading(true);
    try {
      const receiptsToInsert = validReceipts.map(item => ({
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

      const { error } = await supabase
        .from('receipts')
        .insert(receiptsToInsert);

      if (error) throw error;

      await supabase
        .from('plan_activities')
        .update({ status: 'ongoing' })
        .eq('id', formData.activity_id);

      alert(t('success_message'));
      onSuccess();
    } catch (error) {
      console.error('Error submitting receipts:', error);
      alert(t('error_message'));
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
          <p className="text-gray-600 mb-4">{t('no_approved_activities')}</p>
          <button onClick={onBack} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            {t('back')}
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
          <span className="text-sm">{t('back')}</span>
        </button>
        <h1 className="text-lg font-bold">{t('receipt_registration')}</h1>
        <p className="text-xs opacity-90 mt-1">Receipt/Invoice Registration</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" />
            {t('activity_info')}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('target_activity')} *</label>
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('activity_date')} *</label>
              <input
                type="date"
                required
                value={formData.date_of_activity}
                onChange={(e) => handleChange('date_of_activity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('location')} *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('work_description')}</label>
              <textarea
                value={formData.description_of_work}
                onChange={(e) => handleChange('description_of_work', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder={t('work_description')}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">🧾 {t('receipt_invoice')}</h2>
            <button
              type="button"
              onClick={addReceiptItem}
              className="bg-teal-100 text-teal-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              {t('add_item')}
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
                    placeholder={t('vendor_name')}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    value={item.invoice_number}
                    onChange={(e) => updateReceiptItem(index, 'invoice_number', e.target.value)}
                    placeholder={t('invoice_number')}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <input
                  type="number"
                  value={item.amount_vnd || ''}
                  onChange={(e) => updateReceiptItem(index, 'amount_vnd', parseFloat(e.target.value) || 0)}
                  placeholder={`${t('amount')} (VND)`}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
                  {t('photo_upload_note')}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">{t('total_amount')}:</span>
              <span className="text-xl font-bold text-teal-600">
                {calculateTotal().toLocaleString()} VND
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">{t('submission_info')}</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('submitter')} *</label>
              <input
                type="text"
                required
                value={formData.submitted_by}
                onChange={(e) => handleChange('submitted_by', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                readOnly
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
            className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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
