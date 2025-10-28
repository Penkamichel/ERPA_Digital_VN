import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';
import { Card, CardBody } from '../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { ChevronRight, FileText, TrendingUp, CheckCircle, Clock } from 'lucide-react';

interface CommunitySummary {
  communityId: string;
  communityName: string;
  communeId: string;
  communeName: string;
  totalBudget: number;
  totalDisbursed: number;
  totalSpent: number;
  status: string;
  activitiesCount: number;
  meetingId?: string;
  meetingDate?: string;
  meetingFileUrl?: string;
}

interface SummaryStats {
  totalApproved: number;
  totalSpent: number;
  statusCounts: {
    draft: number;
    submitted: number;
    approved: number;
    ongoing: number;
    completed: number;
  };
}

export default function PlanReview() {
  const { selectedCommuneId, selectedFiscalYearId } = useApp();
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<CommunitySummary[]>([]);
  const [allCommunities, setAllCommunities] = useState<CommunitySummary[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [stats, setStats] = useState<SummaryStats>({
    totalApproved: 0,
    totalSpent: 0,
    statusCounts: { draft: 0, submitted: 0, approved: 0, ongoing: 0, completed: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedCommuneId, selectedFiscalYearId]);

  useEffect(() => {
    filterCommunities();
  }, [selectedStatus, allCommunities]);

  const loadData = async () => {
    setLoading(true);

    let activitiesQuery = supabase
      .from('plan_activities')
      .select(`
        *,
        community:communities(id, name, commune:communes(id, name))
      `)
      .eq('fiscal_year_id', selectedFiscalYearId);

    if (selectedCommuneId) {
      const { data: communityList } = await supabase
        .from('communities')
        .select('id')
        .eq('commune_id', selectedCommuneId);

      if (communityList) {
        const communityIds = communityList.map(c => c.id);
        activitiesQuery = activitiesQuery.in('community_id', communityIds);
      }
    }

    const { data: activities } = await activitiesQuery;

    const activityIds = activities?.map(a => a.id) || [];

    const { data: allBudgetItems } = await supabase
      .from('budget_items')
      .select('*')
      .in('plan_activity_id', activityIds);

    const { data: allReceipts } = await supabase
      .from('receipts')
      .select('*')
      .in('plan_activity_id', activityIds);

    const budgetItemsByActivity = new Map<string, any[]>();
    const receiptsByBudgetItem = new Set<string>();

    allBudgetItems?.forEach(bi => {
      if (!budgetItemsByActivity.has(bi.plan_activity_id)) {
        budgetItemsByActivity.set(bi.plan_activity_id, []);
      }
      budgetItemsByActivity.get(bi.plan_activity_id)?.push(bi);
    });

    allReceipts?.forEach(r => {
      if (r.budget_item_id) {
        receiptsByBudgetItem.add(r.budget_item_id);
      }
    });

    const { data: meetings } = await supabase
      .from('meeting_records')
      .select('*')
      .eq('fiscal_year_id', selectedFiscalYearId);

    const { data: disbursements } = await supabase
      .from('disbursements')
      .select('*')
      .eq('fiscal_year_id', selectedFiscalYearId)
      .eq('status', 'disbursed');

    if (activities) {
      const communityMap: { [key: string]: CommunitySummary } = {};
      const statusCounts = { draft: 0, submitted: 0, approved: 0, ongoing: 0, completed: 0 };
      let totalApproved = 0;
      let totalSpent = 0;

      activities.forEach(activity => {
        const communityId = activity.community?.id;
        const communityName = activity.community?.name || 'Unknown';
        const communeId = activity.community?.commune?.id;
        const communeName = activity.community?.commune?.name || 'Unknown';

        if (!communityMap[communityId]) {
          communityMap[communityId] = {
            communityId,
            communityName,
            communeId,
            communeName,
            totalBudget: 0,
            totalDisbursed: 0,
            totalSpent: 0,
            status: 'draft',
            activitiesCount: 0,
          };
        }

        communityMap[communityId].totalBudget += activity.total_budget || 0;
        communityMap[communityId].activitiesCount += 1;

        const activityBudgetItems = budgetItemsByActivity.get(activity.id) || [];
        const spentItems = activityBudgetItems.filter((bi: any) => receiptsByBudgetItem.has(bi.id));
        const spent = spentItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
        communityMap[communityId].totalSpent += spent;

        const statuses = ['completed', 'ongoing', 'approved', 'submitted', 'draft'];
        const currentStatus = communityMap[communityId].status;
        if (statuses.indexOf(activity.status) < statuses.indexOf(currentStatus)) {
          communityMap[communityId].status = activity.status;
        }

        statusCounts[activity.status as keyof typeof statusCounts] =
          (statusCounts[activity.status as keyof typeof statusCounts] || 0) + 1;

        if (['approved', 'ongoing', 'completed'].includes(activity.status)) {
          totalApproved += activity.total_budget || 0;
          totalSpent += spent;
        }
      });

      if (disbursements) {
        disbursements.forEach(d => {
          if (communityMap[d.community_id]) {
            communityMap[d.community_id].totalDisbursed += d.amount || 0;
          }
        });
      }

      if (meetings) {
        meetings.forEach(m => {
          if (communityMap[m.community_id]) {
            communityMap[m.community_id].meetingId = m.id;
            communityMap[m.community_id].meetingDate = m.date;
            communityMap[m.community_id].meetingFileUrl = m.minutes_file_url;
          }
        });
      }

      const sortedCommunities = Object.values(communityMap).sort((a, b) =>
        a.communeName.localeCompare(b.communeName) || a.communityName.localeCompare(b.communityName)
      );

      setAllCommunities(sortedCommunities);
      setCommunities(sortedCommunities);
      setStats({ totalApproved, totalSpent, statusCounts });
    }

    setLoading(false);
  };

  const filterCommunities = () => {
    if (selectedStatus === 'all') {
      setCommunities(allCommunities);
    } else {
      setCommunities(allCommunities.filter(c => c.status === selectedStatus));
    }
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

  const handleCommunityClick = (communityId: string) => {
    navigate(`/plan-review/${communityId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Implementation Review</h1>
        <p className="text-gray-600 mt-1">Community plans and implementation status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Approved</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.totalApproved)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.totalSpent)}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div>
              <p className="text-sm text-gray-600 mb-3">Activities by Status</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-semibold text-emerald-600">{stats.statusCounts.completed}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Ongoing:</span>
                  <span className="font-semibold text-blue-600">{stats.statusCounts.ongoing}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Approved:</span>
                  <span className="font-semibold text-purple-600">{stats.statusCounts.approved}</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div>
              <p className="text-sm text-gray-600 mb-3">Pending Actions</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Submitted:</span>
                  <span className="font-semibold text-amber-600">{stats.statusCounts.submitted}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Draft:</span>
                  <span className="font-semibold text-gray-600">{stats.statusCounts.draft}</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Communities</h3>
              <p className="text-xs text-gray-500 mt-1">
                {communities.length} {communities.length === 1 ? 'community' : 'communities'} found
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filter by status:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedStatus === 'all'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedStatus('completed')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedStatus === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setSelectedStatus('ongoing')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedStatus === 'ongoing'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Ongoing
                </button>
                <button
                  onClick={() => setSelectedStatus('approved')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedStatus === 'approved'
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setSelectedStatus('submitted')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedStatus === 'submitted'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  Submitted
                </button>
                <button
                  onClick={() => setSelectedStatus('draft')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedStatus === 'draft'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Draft
                </button>
              </div>
            </div>
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Community</TableHeader>
                <TableHeader>Commune</TableHeader>
                <TableHeader>Activities</TableHeader>
                <TableHeader>Total Budget</TableHeader>
                <TableHeader>Disbursed</TableHeader>
                <TableHeader>Spent</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Meeting</TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {communities.map((community) => (
                <TableRow
                  key={community.communityId}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleCommunityClick(community.communityId)}
                >
                  <TableCell className="font-medium">
                    {community.communityName}
                  </TableCell>
                  <TableCell>{community.communeName}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {community.activitiesCount}
                    </span>
                  </TableCell>
                  <TableCell>{formatCurrency(community.totalBudget)}</TableCell>
                  <TableCell>{formatCurrency(community.totalDisbursed)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">{formatCurrency(community.totalSpent)}</div>
                      <div className="text-xs text-gray-500">
                        {community.totalBudget > 0
                          ? `${Math.round((community.totalSpent / community.totalBudget) * 100)}%`
                          : '0%'
                        }
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(community.status)}</TableCell>
                  <TableCell>
                    {community.meetingFileUrl ? (
                      <a
                        href={community.meetingFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Minutes
                      </a>
                    ) : community.meetingDate ? (
                      <span className="text-sm text-gray-500">
                        {new Date(community.meetingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">No meeting</span>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCommunityClick(community.communityId)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {communities.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No communities found for the selected filters
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
