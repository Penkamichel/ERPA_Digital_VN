import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';
import { Card, CardBody } from '../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { ArrowLeft, Calendar, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityDetail {
  id: string;
  activity_name: string;
  total_budget: number;
  forest_owner_support: number;
  community_contribution: number;
  other_funds: number;
  period_start: string;
  period_end: string;
  status: string;
  notes: string;
  budget_items: any[];
  receipts: any[];
  photos: any[];
  spent: number;
  expenditureRate: number;
}

interface CommunityInfo {
  name: string;
  communeName: string;
  totalBudget: number;
  totalSpent: number;
}

export default function CommunityDetail() {
  const { communityId } = useParams<{ communityId: string }>();
  const { selectedFiscalYearId } = useApp();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<CommunityInfo | null>(null);
  const [activities, setActivities] = useState<ActivityDetail[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (communityId) {
      loadCommunityDetails();
    }
  }, [communityId, selectedFiscalYearId]);

  const loadCommunityDetails = async () => {
    setLoading(true);

    const { data: communityData } = await supabase
      .from('communities')
      .select('name, commune:communes(name)')
      .eq('id', communityId)
      .single();

    const { data: activitiesData } = await supabase
      .from('plan_activities')
      .select(`
        *,
        budget_items(*),
        receipts(*),
        photos:activity_photos(*)
      `)
      .eq('community_id', communityId)
      .eq('fiscal_year_id', selectedFiscalYearId)
      .order('period_start', { ascending: false });

    if (communityData && activitiesData) {
      let totalBudget = 0;
      let totalSpent = 0;

      const enrichedActivities = activitiesData.map(activity => {
        const receiptBudgetItemIds = new Set(
          activity.receipts?.map((r: any) => r.budget_item_id).filter(Boolean) || []
        );
        const spentItems = activity.budget_items?.filter((bi: any) => receiptBudgetItemIds.has(bi.id)) || [];
        const spent = spentItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
        const expenditureRate = activity.total_budget > 0 ? (spent / activity.total_budget) * 100 : 0;

        totalBudget += activity.total_budget || 0;
        totalSpent += spent;

        return {
          ...activity,
          spent,
          expenditureRate,
        };
      });

      setCommunity({
        name: communityData.name,
        communeName: (communityData.commune as any)?.name || 'Unknown',
        totalBudget,
        totalSpent,
      });

      setActivities(enrichedActivities);
    }

    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { bg: string; text: string; label: string } } = {
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed' },
      ongoing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Ongoing' },
      approved: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Approved' },
      submitted: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Submitted' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Community not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate('/plan-review')} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Communities
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{community.name}</h1>
          <p className="text-gray-600 mt-1">{community.communeName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600">Total Budget</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(community.totalBudget)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600">Total Spent</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {formatCurrency(community.totalSpent)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600">Execution Rate</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {community.totalBudget > 0
                ? `${Math.round((community.totalSpent / community.totalBudget) * 100)}%`
                : '0%'
              }
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-6">
        {activities.map((activity) => (
          <Card key={activity.id}>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{activity.activity_name}</h3>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.notes}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(activity.period_start), 'MMM d, yyyy')} - {format(new Date(activity.period_end), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b">
                  <div>
                    <p className="text-xs text-gray-500">Total Budget</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {formatCurrency(activity.total_budget)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Forest Owner Support</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {formatCurrency(activity.forest_owner_support)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Spent</p>
                    <p className="text-sm font-semibold text-emerald-600 mt-1">
                      {formatCurrency(activity.spent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expenditure Rate</p>
                    <div className="mt-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              activity.expenditureRate >= 100 ? 'bg-emerald-600' :
                              activity.expenditureRate >= 70 ? 'bg-blue-600' :
                              activity.expenditureRate >= 40 ? 'bg-amber-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${Math.min(activity.expenditureRate, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {Math.round(activity.expenditureRate)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Budget Items</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableHeader>Item</TableHeader>
                          <TableHeader>Unit</TableHeader>
                          <TableHeader>Quantity</TableHeader>
                          <TableHeader>Unit Cost</TableHeader>
                          <TableHeader>Amount</TableHeader>
                          <TableHeader>Receipt</TableHeader>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activity.budget_items?.map((item: any) => {
                          const hasReceipt = activity.receipts?.some((r: any) => r.budget_item_id === item.id);
                          return (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.item_name}</TableCell>
                              <TableCell>{item.unit}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{formatCurrency(item.unit_cost)}</TableCell>
                              <TableCell>{formatCurrency(item.amount)}</TableCell>
                              <TableCell>
                                {hasReceipt ? (
                                  <Badge variant="success" size="sm">Uploaded</Badge>
                                ) : (
                                  <Badge variant="gray" size="sm">Pending</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {activity.receipts && activity.receipts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Receipts ({activity.receipts.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {activity.receipts.slice(0, 8).map((receipt: any, idx: number) => (
                        <a
                          key={receipt.id}
                          href={receipt.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              Receipt {idx + 1}
                            </p>
                            <p className="text-xs text-gray-500">
                              {receipt.verified ? (
                                <span className="text-emerald-600">Verified</span>
                              ) : (
                                <span className="text-amber-600">Pending</span>
                              )}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {activity.photos && activity.photos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Activity Photos ({activity.photos.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {activity.photos.map((photo: any) => (
                        <a
                          key={photo.id}
                          href={photo.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden"
                        >
                          <img
                            src={photo.file_url}
                            alt={photo.caption || 'Activity photo'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {photo.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                              <p className="text-xs text-white line-clamp-2">{photo.caption}</p>
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}

        {activities.length === 0 && (
          <Card>
            <CardBody>
              <div className="text-center py-12 text-gray-500">
                No activities found for this community in the selected fiscal year
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
