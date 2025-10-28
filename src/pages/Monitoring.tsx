import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';
import { Card, CardBody } from '../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Drawer from '../components/ui/Drawer';
import { AlertTriangle, CheckCircle, Clock, FileText, Send, TrendingDown, Users, XCircle } from 'lucide-react';

interface CommunityMetrics {
  communityId: string;
  communityName: string;
  communeId: string;
  communeName: string;
  activitiesCount: number;
  totalBudget: number;
  totalDisbursed: number;
  totalSpent: number;
  disbursementRate: number;
  spendingRate: number;
  evidenceStatus: 'complete' | 'partial' | 'missing';
  evidenceCount: number;
  expectedEvidenceCount: number;
  hasPendingApproval: boolean;
  hasMeetingRecord: boolean;
  meetingId?: string;
  lastUpdate: string;
  needsAttention: boolean;
  alertLevel: 'critical' | 'warning' | 'ok';
  activities: any[];
}

type FilterTab = 'all' | 'low_disbursement' | 'low_spending' | 'missing_evidence' | 'pending_approval' | 'no_meeting';

export default function Monitoring() {
  const navigate = useNavigate();
  const { selectedCommuneId, selectedFiscalYearId } = useApp();
  const [communities, setCommunities] = useState<CommunityMetrics[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<CommunityMetrics[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityMetrics | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'disbursement' | 'spending' | 'evidence'>('disbursement');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedCommuneId, selectedFiscalYearId]);

  useEffect(() => {
    applyFilters();
  }, [activeTab, communities, sortBy]);

  const loadData = async () => {
    setLoading(true);

    let activitiesQuery = supabase
      .from('plan_activities')
      .select(`
        *,
        community:communities(id, name, commune:communes(id, name)),
        budget_items(*),
        receipts(*)
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

    const { data: disbursements } = await supabase
      .from('disbursements')
      .select('*')
      .eq('fiscal_year_id', selectedFiscalYearId)
      .eq('status', 'disbursed');

    const { data: meetings } = await supabase
      .from('meeting_records')
      .select('*')
      .eq('fiscal_year_id', selectedFiscalYearId);

    if (activities) {
      const communityMap: { [key: string]: CommunityMetrics } = {};

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
            activitiesCount: 0,
            totalBudget: 0,
            totalDisbursed: 0,
            totalSpent: 0,
            disbursementRate: 0,
            spendingRate: 0,
            evidenceStatus: 'missing',
            evidenceCount: 0,
            expectedEvidenceCount: 0,
            hasPendingApproval: false,
            hasMeetingRecord: false,
            lastUpdate: activity.updated_at || activity.created_at,
            needsAttention: false,
            alertLevel: 'ok',
            activities: [],
          };
        }

        communityMap[communityId].activities.push(activity);
        communityMap[communityId].activitiesCount += 1;
        communityMap[communityId].totalBudget += activity.total_budget || 0;

        const receiptBudgetItemIds = new Set(
          activity.receipts?.map((r: any) => r.budget_item_id).filter(Boolean) || []
        );
        const spentItems = activity.budget_items?.filter((bi: any) => receiptBudgetItemIds.has(bi.id)) || [];
        const spent = spentItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
        communityMap[communityId].totalSpent += spent;

        communityMap[communityId].evidenceCount += activity.receipts?.length || 0;
        communityMap[communityId].expectedEvidenceCount += activity.budget_items?.length || 0;

        if (activity.status === 'submitted') {
          communityMap[communityId].hasPendingApproval = true;
        }

        const activityDate = new Date(activity.updated_at || activity.created_at);
        const currentLastUpdate = new Date(communityMap[communityId].lastUpdate);
        if (activityDate > currentLastUpdate) {
          communityMap[communityId].lastUpdate = activity.updated_at || activity.created_at;
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
            communityMap[m.community_id].hasMeetingRecord = true;
            communityMap[m.community_id].meetingId = m.id;
          }
        });
      }

      Object.values(communityMap).forEach(community => {
        community.disbursementRate = community.totalBudget > 0
          ? (community.totalDisbursed / community.totalBudget) * 100
          : 0;
        community.spendingRate = community.totalBudget > 0
          ? (community.totalSpent / community.totalBudget) * 100
          : 0;

        if (community.evidenceCount === 0) {
          community.evidenceStatus = 'missing';
        } else if (community.evidenceCount >= community.expectedEvidenceCount) {
          community.evidenceStatus = 'complete';
        } else {
          community.evidenceStatus = 'partial';
        }

        community.needsAttention =
          community.disbursementRate < 30 ||
          community.spendingRate < 30 ||
          community.evidenceStatus !== 'complete' ||
          community.hasPendingApproval ||
          !community.hasMeetingRecord;

        if (community.disbursementRate < 30 || community.spendingRate < 30 || community.evidenceStatus === 'missing') {
          community.alertLevel = 'critical';
        } else if (community.disbursementRate < 70 || community.spendingRate < 70 || community.evidenceStatus === 'partial' || community.hasPendingApproval || !community.hasMeetingRecord) {
          community.alertLevel = 'warning';
        } else {
          community.alertLevel = 'ok';
        }
      });

      setCommunities(Object.values(communityMap).sort((a, b) =>
        a.communeName.localeCompare(b.communeName) || a.communityName.localeCompare(b.communityName)
      ));
    }

    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...communities];

    switch (activeTab) {
      case 'low_disbursement':
        filtered = filtered.filter(c => c.disbursementRate < 30);
        break;
      case 'low_spending':
        filtered = filtered.filter(c => c.spendingRate < 30);
        break;
      case 'missing_evidence':
        filtered = filtered.filter(c => c.evidenceStatus !== 'complete');
        break;
      case 'pending_approval':
        filtered = filtered.filter(c => c.hasPendingApproval);
        break;
      case 'no_meeting':
        filtered = filtered.filter(c => !c.hasMeetingRecord);
        break;
      case 'all':
      default:
        filtered = filtered.filter(c => c.needsAttention);
        break;
    }

    switch (sortBy) {
      case 'disbursement':
        filtered.sort((a, b) => a.disbursementRate - b.disbursementRate);
        break;
      case 'spending':
        filtered.sort((a, b) => a.spendingRate - b.spendingRate);
        break;
      case 'evidence':
        filtered.sort((a, b) => {
          const aRate = a.expectedEvidenceCount > 0 ? a.evidenceCount / a.expectedEvidenceCount : 0;
          const bRate = b.expectedEvidenceCount > 0 ? b.evidenceCount / b.expectedEvidenceCount : 0;
          return aRate - bRate;
        });
        break;
    }

    setFilteredCommunities(filtered);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getAlertBgColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-50 hover:bg-red-100';
      case 'warning':
        return 'bg-amber-50 hover:bg-amber-100';
      default:
        return 'bg-white hover:bg-gray-50';
    }
  };

  const handleSendReminder = (community: CommunityMetrics) => {
    alert(`Reminder sent to ${community.communityName}`);
  };

  const tabCounts = {
    all: communities.filter(c => c.needsAttention).length,
    low_disbursement: communities.filter(c => c.disbursementRate < 30).length,
    low_spending: communities.filter(c => c.spendingRate < 30).length,
    missing_evidence: communities.filter(c => c.evidenceStatus !== 'complete').length,
    pending_approval: communities.filter(c => c.hasPendingApproval).length,
    no_meeting: communities.filter(c => !c.hasMeetingRecord).length,
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
        <h1 className="text-2xl font-bold text-gray-900">Action Center</h1>
        <p className="text-gray-600 mt-1">Communities requiring follow-up and attention</p>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>All Issues</span>
          {tabCounts.all > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-xs">
              {tabCounts.all}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('low_disbursement')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'low_disbursement'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Low Disbursement</span>
          {tabCounts.low_disbursement > 0 && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'low_disbursement' ? 'bg-red-800' : 'bg-red-100 text-red-600'
            }`}>
              {tabCounts.low_disbursement}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('low_spending')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'low_spending'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Low Spending</span>
          {tabCounts.low_spending > 0 && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'low_spending' ? 'bg-amber-800' : 'bg-amber-100 text-amber-600'
            }`}>
              {tabCounts.low_spending}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('missing_evidence')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'missing_evidence'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Missing Evidence</span>
          {tabCounts.missing_evidence > 0 && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'missing_evidence' ? 'bg-orange-800' : 'bg-orange-100 text-orange-600'
            }`}>
              {tabCounts.missing_evidence}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('pending_approval')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'pending_approval'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Approval</span>
          {tabCounts.pending_approval > 0 && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'pending_approval' ? 'bg-blue-800' : 'bg-blue-100 text-blue-600'
            }`}>
              {tabCounts.pending_approval}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('no_meeting')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'no_meeting'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>No Meeting Record</span>
          {tabCounts.no_meeting > 0 && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'no_meeting' ? 'bg-purple-800' : 'bg-purple-100 text-purple-600'
            }`}>
              {tabCounts.no_meeting}
            </span>
          )}
        </button>
      </div>

      <Card>
        <CardBody>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Communities Needing Attention</h3>
              <p className="text-xs text-gray-500 mt-1">
                {filteredCommunities.length} {filteredCommunities.length === 1 ? 'community' : 'communities'} found
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="disbursement">Disbursement Rate</option>
                <option value="spending">Spending Rate</option>
                <option value="evidence">Evidence Completeness</option>
              </select>
            </div>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Alert</TableHeader>
                <TableHeader>Commune</TableHeader>
                <TableHeader>Community</TableHeader>
                <TableHeader># Activities</TableHeader>
                <TableHeader>Disbursement Rate</TableHeader>
                <TableHeader>Spending Rate</TableHeader>
                <TableHeader>Evidence Status</TableHeader>
                <TableHeader>Approval Status</TableHeader>
                <TableHeader>Last Update</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCommunities.map((community) => (
                <TableRow
                  key={community.communityId}
                  className={`cursor-pointer transition-colors ${getAlertBgColor(community.alertLevel)}`}
                  onClick={() => {
                    setSelectedCommunity(community);
                    setDrawerOpen(true);
                  }}
                >
                  <TableCell>{getAlertIcon(community.alertLevel)}</TableCell>
                  <TableCell className="text-sm text-gray-600">{community.communeName}</TableCell>
                  <TableCell className="font-medium">{community.communityName}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {community.activitiesCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            community.disbursementRate >= 70 ? 'bg-emerald-600' :
                            community.disbursementRate >= 30 ? 'bg-amber-500' : 'bg-red-600'
                          }`}
                          style={{ width: `${Math.min(community.disbursementRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{Math.round(community.disbursementRate)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            community.spendingRate >= 70 ? 'bg-emerald-600' :
                            community.spendingRate >= 30 ? 'bg-amber-500' : 'bg-red-600'
                          }`}
                          style={{ width: `${Math.min(community.spendingRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{Math.round(community.spendingRate)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      community.evidenceStatus === 'complete' ? 'bg-emerald-100 text-emerald-700' :
                      community.evidenceStatus === 'partial' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {community.evidenceCount}/{community.expectedEvidenceCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    {community.hasPendingApproval ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        None
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(community.lastUpdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendReminder(community)}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Remind
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCommunities.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <p className="text-gray-600">No communities need attention in this category</p>
            </div>
          )}
        </CardBody>
      </Card>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedCommunity?.communityName || 'Community Details'}
      >
        {selectedCommunity && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total Budget</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedCommunity.totalBudget)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Disbursed</p>
                  <p className="text-lg font-semibold text-blue-600">{formatCurrency(selectedCommunity.totalDisbursed)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Spent</p>
                  <p className="text-lg font-semibold text-emerald-600">{formatCurrency(selectedCommunity.totalSpent)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Activities</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCommunity.activitiesCount}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Performance Metrics</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Disbursement Rate</span>
                    <span className="font-medium">{Math.round(selectedCommunity.disbursementRate)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        selectedCommunity.disbursementRate >= 70 ? 'bg-emerald-600' :
                        selectedCommunity.disbursementRate >= 30 ? 'bg-amber-500' : 'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(selectedCommunity.disbursementRate, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Spending Rate</span>
                    <span className="font-medium">{Math.round(selectedCommunity.spendingRate)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        selectedCommunity.spendingRate >= 70 ? 'bg-emerald-600' :
                        selectedCommunity.spendingRate >= 30 ? 'bg-amber-500' : 'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(selectedCommunity.spendingRate, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Evidence Completeness</span>
                    <span className="font-medium">
                      {selectedCommunity.evidenceCount}/{selectedCommunity.expectedEvidenceCount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        selectedCommunity.evidenceStatus === 'complete' ? 'bg-emerald-600' :
                        selectedCommunity.evidenceStatus === 'partial' ? 'bg-amber-500' : 'bg-red-600'
                      }`}
                      style={{
                        width: `${selectedCommunity.expectedEvidenceCount > 0
                          ? (selectedCommunity.evidenceCount / selectedCommunity.expectedEvidenceCount) * 100
                          : 0
                        }%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Activities ({selectedCommunity.activities.length})</h3>
              <div className="space-y-2">
                {selectedCommunity.activities.map((activity: any) => (
                  <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.activity_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Budget: {formatCurrency(activity.total_budget)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        activity.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                        activity.status === 'approved' ? 'bg-purple-100 text-purple-700' :
                        activity.status === 'submitted' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedCommunity.hasMeetingRecord && selectedCommunity.meetingId && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Meeting Record Available
                    </h4>
                    <p className="text-xs text-emerald-700 mt-1">
                      This community has documented meeting minutes
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/meetings')}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 underline"
                  >
                    View Minutes
                  </button>
                </div>
              </div>
            )}

            {!selectedCommunity.hasMeetingRecord && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900">
                      No Meeting Record
                    </h4>
                    <p className="text-xs text-amber-700 mt-1">
                      This community needs to document their meeting minutes
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => handleSendReminder(selectedCommunity)}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Reminder
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.location.href = `/plan-review/${selectedCommunity.communityId}`}
              >
                View Details
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
