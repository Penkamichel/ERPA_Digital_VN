import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { Eye, UserPlus, Search } from 'lucide-react';

interface UserAccount {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  ethnic_group: string;
  account_category: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function Accounts() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchQuery, statusFilter, categoryFilter]);

  const loadAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading accounts:', error);
    }

    if (data) {
      setAccounts(data);
    }
    setLoading(false);
  };

  const filterAccounts = () => {
    let filtered = accounts;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (account) =>
          account.full_name.toLowerCase().includes(query) ||
          account.email.toLowerCase().includes(query) ||
          account.phone_number?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((account) => account.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((account) => account.account_category === categoryFilter);
    }

    setFilteredAccounts(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'applied':
        return <Badge variant="warning">Applied</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'deleted':
        return <Badge variant="gray">Deleted</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      provincial_fund: 'Provincial Fund',
      forest_owner: 'Forest Owner',
      cpc: 'CPC',
      cmb: 'CMB',
      community_member: 'Community Member',
    };
    return labels[category] || category;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusCount = (status: string) => {
    return accounts.filter((a) => a.status === status).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => navigate('/accounts/new')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="text-sm text-gray-600">Total Accounts</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{accounts.length}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-sm text-gray-600">Approved</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{getStatusCount('approved')}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{getStatusCount('applied')}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-sm text-gray-600">Rejected</div>
            <div className="text-2xl font-bold text-red-600 mt-1">{getStatusCount('rejected')}</div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="applied">Applied</option>
              <option value="rejected">Rejected</option>
              <option value="deleted">Deleted</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="provincial_fund">Provincial Fund</option>
              <option value="forest_owner">Forest Owner</option>
              <option value="cpc">CPC</option>
              <option value="cmb">CMB</option>
              <option value="community_member">Community Member</option>
            </select>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading accounts...</div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No accounts found</div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Phone</TableHeader>
                  <TableHeader>Ethnic Group</TableHeader>
                  <TableHeader>Category</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Created</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{account.full_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-600">{account.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-600">{account.phone_number || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-600">{account.ethnic_group || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">{getCategoryLabel(account.account_category)}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(account.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">{formatDate(account.created_at)}</div>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => navigate(`/accounts/${account.id}`)}
                        className="text-emerald-600 hover:text-emerald-700 p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
