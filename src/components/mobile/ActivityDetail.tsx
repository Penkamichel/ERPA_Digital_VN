import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, DollarSign, FileText, Image as ImageIcon, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ActivityDetailProps {
  activityId: string;
  onBack: () => void;
}

interface ActivityData {
  id: string;
  activity_name: string;
  total_budget: number;
  status: string;
  period_start: string;
  period_end: string;
  notes: string;
  implementation_method: string;
  budget_items: Array<{
    id: string;
    item_name: string;
    quantity: number;
    unit: string;
    unit_cost: number;
    amount: number;
  }>;
  receipts: Array<{
    id: string;
    file_url: string;
    verified: boolean;
    uploaded_at: string;
  }>;
  photos: Array<{
    id: string;
    file_url: string;
    caption: string;
    uploaded_at: string;
  }>;
  progress_notes: Array<{
    id: string;
    note_text: string;
    progress_percentage: number;
    created_by: string;
    created_at: string;
  }>;
}

export function ActivityDetail({ activityId, onBack }: ActivityDetailProps) {
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivityDetail();
  }, [activityId]);

  const loadActivityDetail = async () => {
    setLoading(true);
    try {
      const { data: activityData } = await supabase
        .from('plan_activities')
        .select('*')
        .eq('id', activityId)
        .maybeSingle();

      if (!activityData) {
        setLoading(false);
        return;
      }

      const { data: budgetItems } = await supabase
        .from('budget_items')
        .select('*')
        .eq('plan_activity_id', activityId)
        .order('created_at', { ascending: true });

      const { data: receipts } = await supabase
        .from('receipts')
        .select('*')
        .eq('plan_activity_id', activityId)
        .order('uploaded_at', { ascending: false });

      const { data: photos } = await supabase
        .from('activity_photos')
        .select('*')
        .eq('plan_activity_id', activityId)
        .order('uploaded_at', { ascending: false });

      const { data: progressNotes } = await supabase
        .from('activity_progress_notes')
        .select('*')
        .eq('plan_activity_id', activityId)
        .order('created_at', { ascending: false });

      setActivity({
        ...activityData,
        budget_items: budgetItems || [],
        receipts: receipts || [],
        photos: photos || [],
        progress_notes: progressNotes || [],
      });
    } catch (error) {
      console.error('Error loading activity detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    return `${(amount / 1000).toFixed(0)}K`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      draft: { label: '下書き', color: 'bg-gray-100 text-gray-700' },
      submitted: { label: '提出済み', color: 'bg-blue-100 text-blue-700' },
      approved: { label: '承認済み', color: 'bg-emerald-100 text-emerald-700' },
      ongoing: { label: '実施中', color: 'bg-amber-100 text-amber-700' },
      completed: { label: '完了', color: 'bg-emerald-100 text-emerald-700' },
      cancelled: { label: '中止', color: 'bg-red-100 text-red-700' },
    };
    const badge = badges[status] || badges.draft;
    return <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${badge.color}`}>{badge.label}</span>;
  };

  if (loading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">活動が見つかりませんでした</p>
          <button onClick={onBack} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            戻る
          </button>
        </div>
      </div>
    );
  }

  const totalSpent = activity.receipts.filter(r => r.verified).length * 50000;
  const progress = activity.status === 'completed' ? 100 :
                   activity.status === 'ongoing' ? 60 :
                   activity.status === 'approved' ? 30 : 10;

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-2 mb-3 hover:bg-white/10 rounded-lg px-2 py-1 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">戻る</span>
        </button>
        <h1 className="text-lg font-bold">{activity.activity_name}</h1>
        <div className="flex items-center gap-2 mt-2">
          {getStatusBadge(activity.status)}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">📊 活動概要</h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600">実施期間</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(activity.period_start)} 〜 {formatDate(activity.period_end)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600">予算</p>
                <p className="text-sm font-medium text-gray-900">{formatAmount(activity.total_budget)} VND</p>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">進捗度</span>
                <span className="font-semibold text-blue-600">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {activity.budget_items.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              予算内訳
            </h2>
            <div className="space-y-2">
              {activity.budget_items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold text-gray-900 flex-1">{item.item_name}</p>
                    <p className="text-sm font-bold text-blue-600">{formatAmount(item.amount)} VND</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    {item.quantity} {item.unit} × {formatAmount(item.unit_cost)} VND
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activity.photos.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              活動写真 ({activity.photos.length})
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {activity.photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                      <p className="text-xs line-clamp-2">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activity.receipts.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              レシート・領収書 ({activity.receipts.length})
            </h2>
            <div className="space-y-2">
              {activity.receipts.map((receipt) => (
                <div key={receipt.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">レシート</p>
                    <p className="text-xs text-gray-600">{formatDate(receipt.uploaded_at)}</p>
                  </div>
                  {receipt.verified ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activity.progress_notes.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-900 mb-3">📝 進捗メモ</h2>
            <div className="space-y-3">
              {activity.progress_notes.map((note) => (
                <div key={note.id} className="border-l-4 border-blue-600 pl-3 py-2">
                  <p className="text-sm text-gray-900">{note.note_text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-600">{note.created_by}</p>
                    <span className="text-gray-400">•</span>
                    <p className="text-xs text-gray-500">{formatDate(note.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activity.notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h2 className="font-bold text-blue-900 mb-2">💡 備考</h2>
            <p className="text-sm text-blue-800">{activity.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
