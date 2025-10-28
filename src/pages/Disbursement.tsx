import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';
import { Card, CardBody } from '../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Plus } from 'lucide-react';

export default function Disbursement() {
  const { selectedCommuneId, selectedFiscalYearId } = useApp();
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadDisbursements();
  }, [selectedCommuneId, selectedFiscalYearId]);

  const loadDisbursements = async () => {
    let query = supabase
      .from('disbursements')
      .select('*, commune:communes(*), community:communities(*), plan_activity:plan_activities(*)')
      .eq('fiscal_year_id', selectedFiscalYearId);

    if (selectedCommuneId) {
      query = query.eq('commune_id', selectedCommuneId);
    }

    const { data } = await query.order('scheduled_date', { ascending: false });
    if (data) setDisbursements(data);
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'success' | 'warning' | 'danger' | 'gray' } = {
      scheduled: 'warning',
      disbursed: 'success',
      failed: 'danger',
      cancelled: 'gray',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disbursement</h1>
          <p className="text-gray-600 mt-1">Manage fund disbursements and payment orders</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Payment Order
        </Button>
      </div>

      <Card>
        <CardBody>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Recipient</TableHeader>
                <TableHeader>Community</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Scheduled Date</TableHeader>
                <TableHeader>Payment Date</TableHeader>
                <TableHeader>Channel</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Reference</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {disbursements.map((disbursement) => (
                <TableRow key={disbursement.id}>
                  <TableCell className="font-medium">{disbursement.recipient_name}</TableCell>
                  <TableCell>{disbursement.community?.name}</TableCell>
                  <TableCell>{formatCurrency(disbursement.amount)}</TableCell>
                  <TableCell>{disbursement.scheduled_date}</TableCell>
                  <TableCell>{disbursement.payment_date || '-'}</TableCell>
                  <TableCell className="capitalize">{disbursement.channel}</TableCell>
                  <TableCell>{getStatusBadge(disbursement.status)}</TableCell>
                  <TableCell className="text-gray-500">{disbursement.payment_order_ref}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Payment Order" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Type</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="forest_owner">Forest Owner</option>
              <option value="cpc">CPC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter recipient name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Channel</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="bank">Bank Transfer</option>
              <option value="postal">Postal Service</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <Button onClick={() => setShowModal(false)}>Create Payment Order</Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
