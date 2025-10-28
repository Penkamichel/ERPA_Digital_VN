import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';
import { Card, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FileText, Download } from 'lucide-react';

export default function Publications() {
  const { selectedCommuneId, selectedFiscalYearId } = useApp();
  const [activities, setActivities] = useState<any[]>([]);
  const [disbursements, setDisbursements] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [selectedCommuneId, selectedFiscalYearId]);

  const loadData = async () => {
    if (!selectedFiscalYearId) return;

    let activitiesQuery = supabase
      .from('plan_activities')
      .select('*, community:communities(*)')
      .eq('fiscal_year_id', selectedFiscalYearId)
      .eq('status', 'approved');

    if (selectedCommuneId) {
      activitiesQuery = activitiesQuery.eq('community_id', selectedCommuneId);
    }

    let disbursementsQuery = supabase
      .from('disbursements')
      .select('*, community:communities(*)')
      .eq('fiscal_year_id', selectedFiscalYearId)
      .eq('status', 'disbursed');

    if (selectedCommuneId) {
      disbursementsQuery = disbursementsQuery.eq('community_id', selectedCommuneId);
    }

    const { data: activitiesData } = await activitiesQuery;
    const { data: disbursementsData } = await disbursementsQuery;

    if (activitiesData) setActivities(activitiesData);
    if (disbursementsData) setDisbursements(disbursementsData);
  };

  const handlePrintBeneficiaryList = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Beneficiary List</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              @page { margin: 1cm; }
            }
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #059669; margin-bottom: 10px; }
            .header { border-bottom: 3px solid #059669; padding-bottom: 20px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Provincial Fund - Beneficiary List</h1>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Recipient Name</th>
                <th>Community</th>
                <th>Amount Disbursed</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${disbursements.map(d => `
                <tr>
                  <td>${d.recipient_name}</td>
                  <td>${d.community?.name || 'N/A'}</td>
                  <td>${formatCurrency(d.amount)}</td>
                  <td>${d.payment_date || d.scheduled_date}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>This document contains confidential information. Provincial Fund Management Portal.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  const handlePrintSpendingSummary = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const communityStats: { [key: string]: { budget: number; activities: number } } = {};
    activities.forEach(a => {
      const name = a.community?.name || 'Unknown';
      if (!communityStats[name]) {
        communityStats[name] = { budget: 0, activities: 0 };
      }
      communityStats[name].budget += a.total_budget;
      communityStats[name].activities += 1;
    });

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spending Summary by Community</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              @page { margin: 1cm; }
            }
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #059669; margin-bottom: 10px; }
            .header { border-bottom: 3px solid #059669; padding-bottom: 20px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .total-row { background-color: #d1fae5; font-weight: bold; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Provincial Fund - Spending Summary by Community</h1>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Community</th>
                <th>Number of Activities</th>
                <th>Total Budget</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(communityStats).map(([name, stats]) => `
                <tr>
                  <td>${name}</td>
                  <td>${stats.activities}</td>
                  <td>${formatCurrency(stats.budget)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td>TOTAL</td>
                <td>${Object.values(communityStats).reduce((sum, s) => sum + s.activities, 0)}</td>
                <td>${formatCurrency(Object.values(communityStats).reduce((sum, s) => sum + s.budget, 0))}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            <p>This document contains confidential information. Provincial Fund Management Portal.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Publications</h1>
        <p className="text-gray-600 mt-1">Generate and publish reports for transparency</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-start space-x-4">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Beneficiary List</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Generate a comprehensive list of all beneficiaries and disbursed amounts
                </p>
                <Button onClick={handlePrintBeneficiaryList} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Spending Summary</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Generate spending summary by community with budget breakdowns
                </p>
                <Button onClick={handlePrintSpendingSummary} size="sm" variant="secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Publication History</h2>
          <p className="text-gray-500 text-sm">No previous publications generated</p>
        </CardBody>
      </Card>
    </div>
  );
}
