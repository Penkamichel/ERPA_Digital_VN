import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { ArrowLeft, Save, CheckCircle, XCircle, Trash2, History } from 'lucide-react';

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

interface AuditHistory {
  id: string;
  action: string;
  field_changed: string;
  old_value: string;
  new_value: string;
  changed_by: string;
  changed_at: string;
  notes: string;
}

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [auditHistory, setAuditHistory] = useState<AuditHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    ethnic_group: '',
    account_category: '',
    status: '',
  });

  useEffect(() => {
    if (id) {
      loadAccount();
      loadAuditHistory();
    }
  }, [id]);

  const loadAccount = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading account:', error);
      return;
    }

    if (data) {
      setAccount(data);
      setFormData({
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number || '',
        ethnic_group: data.ethnic_group || '',
        account_category: data.account_category,
        status: data.status,
      });
    }
    setLoading(false);
  };

  const loadAuditHistory = async () => {
    const { data, error } = await supabase
      .from('account_audit_history')
      .select('*')
      .eq('account_id', id)
      .order('changed_at', { ascending: false });

    if (error) {
      console.error('Error loading audit history:', error);
      return;
    }

    if (data) {
      setAuditHistory(data);
    }
  };

  const handleSave = async () => {
    if (!account) return;

    setSaving(true);

    const changes: any = {};
    const auditEntries: any[] = [];

    Object.keys(formData).forEach((key) => {
      const oldValue = account[key as keyof UserAccount] as string;
      const newValue = formData[key as keyof typeof formData];

      if (oldValue !== newValue) {
        changes[key] = newValue;
        auditEntries.push({
          account_id: account.id,
          action: 'updated',
          field_changed: key,
          old_value: oldValue || '',
          new_value: newValue || '',
          changed_by: user?.email || 'unknown',
          notes: `Updated ${key}`,
        });
      }
    });

    if (Object.keys(changes).length === 0) {
      setSaving(false);
      return;
    }

    changes.updated_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('user_accounts')
      .update(changes)
      .eq('id', account.id);

    if (updateError) {
      console.error('Error updating account:', updateError);
      setSaving(false);
      return;
    }

    if (auditEntries.length > 0) {
      const { error: auditError } = await supabase
        .from('account_audit_history')
        .insert(auditEntries);

      if (auditError) {
        console.error('Error creating audit entries:', auditError);
      }
    }

    await loadAccount();
    await loadAuditHistory();
    setSaving(false);
  };

  const handleApprove = async () => {
    if (!account) return;

    setSaving(true);

    const { error: updateError } = await supabase
      .from('user_accounts')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', account.id);

    if (updateError) {
      console.error('Error approving account:', updateError);
      setSaving(false);
      return;
    }

    const { error: auditError } = await supabase
      .from('account_audit_history')
      .insert({
        account_id: account.id,
        action: 'approved',
        field_changed: 'status',
        old_value: account.status,
        new_value: 'approved',
        changed_by: user?.email || 'unknown',
        notes: 'Account approved by PF officer',
      });

    if (auditError) {
      console.error('Error creating audit entry:', auditError);
    }

    await loadAccount();
    await loadAuditHistory();
    setSaving(false);
  };

  const handleReject = async () => {
    if (!account) return;
    if (!confirm('Are you sure you want to reject this account?')) return;

    setSaving(true);

    const { error: updateError } = await supabase
      .from('user_accounts')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', account.id);

    if (updateError) {
      console.error('Error rejecting account:', updateError);
      setSaving(false);
      return;
    }

    const { error: auditError } = await supabase
      .from('account_audit_history')
      .insert({
        account_id: account.id,
        action: 'rejected',
        field_changed: 'status',
        old_value: account.status,
        new_value: 'rejected',
        changed_by: user?.email || 'unknown',
        notes: 'Account rejected by PF officer',
      });

    if (auditError) {
      console.error('Error creating audit entry:', auditError);
    }

    await loadAccount();
    await loadAuditHistory();
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!account) return;
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) return;

    setSaving(true);

    const { error: updateError } = await supabase
      .from('user_accounts')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', account.id);

    if (updateError) {
      console.error('Error deleting account:', updateError);
      setSaving(false);
      return;
    }

    const { error: auditError } = await supabase
      .from('account_audit_history')
      .insert({
        account_id: account.id,
        action: 'deleted',
        field_changed: 'status',
        old_value: account.status,
        new_value: 'deleted',
        changed_by: user?.email || 'unknown',
        notes: 'Account deleted by PF officer',
      });

    if (auditError) {
      console.error('Error creating audit entry:', auditError);
    }

    setSaving(false);
    navigate('/accounts');
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
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading account details...</div>;
  }

  if (!account) {
    return <div className="text-center py-8 text-gray-500">Account not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/accounts')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Details</h1>
            <p className="text-gray-600 mt-1">{account.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {account.status === 'applied' && (
            <>
              <Button variant="success" onClick={handleApprove} disabled={saving}>
                <CheckCircle className="w-5 h-5 mr-2" />
                Approve
              </Button>
              <Button variant="error" onClick={handleReject} disabled={saving}>
                <XCircle className="w-5 h-5 mr-2" />
                Reject
              </Button>
            </>
          )}
          {account.status !== 'deleted' && (
            <Button variant="error" onClick={handleDelete} disabled={saving}>
              <Trash2 className="w-5 h-5 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ethnic Group</label>
                <select
                  value={formData.ethnic_group}
                  onChange={(e) => setFormData({ ...formData, ethnic_group: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select ethnic group</option>
                  <option value="A">Group A</option>
                  <option value="B">Group B</option>
                  <option value="C">Group C</option>
                  <option value="D">Group D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Category</label>
                <select
                  value={formData.account_category}
                  onChange={(e) => setFormData({ ...formData, account_category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="provincial_fund">Provincial Fund</option>
                  <option value="forest_owner">Forest Owner</option>
                  <option value="cpc">CPC</option>
                  <option value="cmb">CMB</option>
                  <option value="community_member">Community Member</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="applied">Applied</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>

              <div className="pt-4">
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  <Save className="w-5 h-5 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Current Status</div>
                <div className="mt-1">{getStatusBadge(account.status)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Category</div>
                <div className="font-medium text-gray-900 mt-1">{getCategoryLabel(account.account_category)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Created At</div>
                <div className="text-sm text-gray-900 mt-1">{formatDate(account.created_at)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Last Updated</div>
                <div className="text-sm text-gray-900 mt-1">{formatDate(account.updated_at)}</div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Audit History</h2>
              </div>
            </CardHeader>
            <CardBody>
              {auditHistory.length === 0 ? (
                <p className="text-sm text-gray-500">No audit history available</p>
              ) : (
                <div className="space-y-4">
                  {auditHistory.map((entry) => (
                    <div key={entry.id} className="border-l-2 border-gray-200 pl-4 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900 capitalize">{entry.action}</div>
                          {entry.field_changed && (
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">{entry.field_changed}</span>
                              {entry.old_value && entry.new_value && (
                                <>
                                  : <span className="line-through text-gray-400">{entry.old_value}</span>
                                  {' → '}
                                  <span className="text-emerald-600">{entry.new_value}</span>
                                </>
                              )}
                            </div>
                          )}
                          {entry.notes && (
                            <div className="text-sm text-gray-500 mt-1">{entry.notes}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>{entry.changed_by}</span>
                        <span>•</span>
                        <span>{formatDate(entry.changed_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
