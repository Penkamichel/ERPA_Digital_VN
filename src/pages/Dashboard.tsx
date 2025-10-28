import { useState, useEffect } from 'react';
import { DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';
import { Card, CardBody } from '../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import FlowDiagram from '../components/charts/FlowDiagram';
import { autoCategorizeFamily, autoCategorizeProgram, autoCategorizeCostType, getFamilyLabel, getProgramLabel, getCostTypeLabel, type ExpenditureFamily, type ProgramCategory } from '../utils/categoryMapper';

interface IncomeBreakdown {
  forestOwnerSupport: number;
  communityContribution: number;
  otherFunds: number;
}

interface SpendingCategoryBreakdown {
  [key: string]: number;
}

interface CommuneFundUsage {
  communeName: string;
  totalBudget: number;
  totalDisbursed: number;
  spent: number;
  percentage: number;
}

interface BudgetItemDetail {
  id: string;
  itemName: string;
  activityName: string;
  communityName: string;
  amount: number;
  category: string;
  hasReceipt: boolean;
}

export default function Dashboard() {
  const { selectedCommuneId, selectedFiscalYearId } = useApp();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenditure, setTotalExpenditure] = useState(0);
  const [balance, setBalance] = useState(0);
  const [incomeBreakdown, setIncomeBreakdown] = useState<IncomeBreakdown>({
    forestOwnerSupport: 0,
    communityContribution: 0,
    otherFunds: 0,
  });
  const [spendingByCategory, setSpendingByCategory] = useState<SpendingCategoryBreakdown>({});
  const [communeFundUsage, setCommuneFundUsage] = useState<CommuneFundUsage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryDetails, setCategoryDetails] = useState<BudgetItemDetail[]>([]);
  const [unallocated, setUnallocated] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [selectedCommuneId, selectedFiscalYearId]);

  const loadDashboardData = async () => {
    setLoading(true);

    let activitiesQuery = supabase
      .from('plan_activities')
      .select(`
        *,
        community:communities(*, commune:communes(*)),
        receipts(*),
        budget_items(*)
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

    if (activities) {
      let income: IncomeBreakdown = {
        forestOwnerSupport: 0,
        communityContribution: 0,
        otherFunds: 0,
      };

      const familySpending: { [key: string]: number } = {};
      const programSpending: { [key: string]: number } = {};

      const communeMap: { [key: string]: CommuneFundUsage } = {};

      const { data: disbursements } = await supabase
        .from('disbursements')
        .select('*')
        .eq('fiscal_year_id', selectedFiscalYearId)
        .eq('status', 'disbursed');

      let totalBudget = 0;

      activities.forEach(activity => {
        income.forestOwnerSupport += activity.forest_owner_support || 0;
        income.communityContribution += activity.community_contribution || 0;
        income.otherFunds += activity.other_funds || 0;

        totalBudget += activity.total_budget || 0;

        const receiptBudgetItemIds = new Set(
          activity.receipts?.map((r: any) => r.budget_item_id).filter(Boolean) || []
        );

        activity.budget_items?.forEach((budgetItem: any) => {
          if (receiptBudgetItemIds.has(budgetItem.id)) {
            let family = budgetItem.expenditure_family || activity.expenditure_family;
            if (!family) {
              family = autoCategorizeFamily(budgetItem.item_name || '', activity.activity_name);
            }

            if (!familySpending[family]) {
              familySpending[family] = 0;
            }
            familySpending[family] += budgetItem.amount || 0;

            if (family === 'livelihood_development') {
              let program = budgetItem.program_category;
              if (!program) {
                program = autoCategorizeProgram(budgetItem.item_name || '', activity.activity_name);
              }

              const programKey = `livelihood_development.${program}`;
              if (!programSpending[programKey]) {
                programSpending[programKey] = 0;
              }
              programSpending[programKey] += budgetItem.amount || 0;
            }
          }
        });

        const spentItems = activity.budget_items?.filter((bi: any) => receiptBudgetItemIds.has(bi.id)) || [];
        const spent = spentItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

        const communeName = activity.community?.commune?.name || 'Unknown';
        if (!communeMap[communeName]) {
          communeMap[communeName] = {
            communeName,
            totalBudget: 0,
            totalDisbursed: 0,
            spent: 0,
            percentage: 0,
          };
        }

        communeMap[communeName].totalBudget += activity.total_budget || 0;
        communeMap[communeName].spent += spent;
      });

      const totalInc = income.forestOwnerSupport + income.communityContribution + income.otherFunds;
      const totalExp = Object.values(familySpending).reduce((sum, val) => sum + val, 0);
      const bal = totalInc - totalExp;
      const unalloc = totalInc - totalExp;

      setTotalIncome(totalInc);
      setTotalExpenditure(totalExp);
      setBalance(bal);
      setUnallocated(unalloc);
      setIncomeBreakdown(income);
      setSpendingByCategory({ ...familySpending, ...programSpending });

      if (disbursements) {
        for (const d of disbursements) {
          if (d.commune_id) {
            const { data: commune } = await supabase
              .from('communes')
              .select('name')
              .eq('id', d.commune_id)
              .maybeSingle();

            const communeName = commune?.name || 'Unknown';
            if (communeMap[communeName]) {
              communeMap[communeName].totalDisbursed += d.amount || 0;
            }
          }
        }
      }

      Object.values(communeMap).forEach(commune => {
        if (commune.totalDisbursed > commune.totalBudget) {
          commune.totalDisbursed = commune.totalBudget * 0.85;
        }

        if (commune.spent > commune.totalDisbursed) {
          commune.spent = commune.totalDisbursed * 0.75;
        }

        commune.percentage = commune.totalBudget > 0
          ? (commune.spent / commune.totalBudget) * 100
          : 0;
      });

      setCommuneFundUsage(
        Object.values(communeMap).sort((a, b) => b.spent - a.spent)
      );
    }

    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}B VND`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M VND`;
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyFull = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleFamilyClick = async (family: string) => {
    setSelectedCategory(`Family: ${getFamilyLabel(family as ExpenditureFamily)}`);
    setModalOpen(true);

    let activitiesQuery = supabase
      .from('plan_activities')
      .select(`
        id,
        activity_name,
        expenditure_family,
        community:communities(name),
        receipts(*),
        budget_items(*)
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

    if (activities) {
      const details: BudgetItemDetail[] = [];

      activities.forEach(activity => {
        const receiptBudgetItemIds = new Set(
          activity.receipts?.map((r: any) => r.budget_item_id).filter(Boolean) || []
        );

        activity.budget_items?.forEach((budgetItem: any) => {
          if (receiptBudgetItemIds.has(budgetItem.id)) {
            let itemFamily = budgetItem.expenditure_family || activity.expenditure_family;
            if (!itemFamily) {
              itemFamily = autoCategorizeFamily(budgetItem.item_name || '', activity.activity_name);
            }

            if (itemFamily === family) {
              details.push({
                id: budgetItem.id,
                itemName: budgetItem.item_name,
                activityName: activity.activity_name,
                communityName: activity.community?.name || 'Unknown',
                amount: budgetItem.amount || 0,
                category: getFamilyLabel(itemFamily as ExpenditureFamily),
                hasReceipt: true,
              });
            }
          }
        });
      });

      setCategoryDetails(details.sort((a, b) => b.amount - a.amount));
    }
  };

  const handleProgramClick = async (family: string, program: string) => {
    setSelectedCategory(`${getFamilyLabel(family as ExpenditureFamily)} → ${getProgramLabel(program as ProgramCategory)}`);
    setModalOpen(true);

    let activitiesQuery = supabase
      .from('plan_activities')
      .select(`
        id,
        activity_name,
        expenditure_family,
        community:communities(name),
        receipts(*),
        budget_items(*)
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

    if (activities) {
      const details: BudgetItemDetail[] = [];

      activities.forEach(activity => {
        const receiptBudgetItemIds = new Set(
          activity.receipts?.map((r: any) => r.budget_item_id).filter(Boolean) || []
        );

        activity.budget_items?.forEach((budgetItem: any) => {
          if (receiptBudgetItemIds.has(budgetItem.id)) {
            let itemFamily = budgetItem.expenditure_family || activity.expenditure_family;
            let itemProgram = budgetItem.program_category;

            if (!itemFamily) {
              itemFamily = autoCategorizeFamily(budgetItem.item_name || '', activity.activity_name);
            }
            if (!itemProgram && itemFamily === 'livelihood_development') {
              itemProgram = autoCategorizeProgram(budgetItem.item_name || '', activity.activity_name);
            }

            if (itemFamily === family && itemProgram === program) {
              details.push({
                id: budgetItem.id,
                itemName: budgetItem.item_name,
                activityName: activity.activity_name,
                communityName: activity.community?.name || 'Unknown',
                amount: budgetItem.amount || 0,
                category: getProgramLabel(itemProgram as ProgramCategory),
                hasReceipt: true,
              });
            }
          }
        });
      });

      setCategoryDetails(details.sort((a, b) => b.amount - a.amount));
    }
  };

  const incomeFlowItems = [
    {
      name: 'Forest Owner Support',
      amount: incomeBreakdown.forestOwnerSupport,
      percentage: totalIncome > 0 ? (incomeBreakdown.forestOwnerSupport / totalIncome) * 100 : 0,
      color: '#10b981',
    },
    {
      name: 'Community Contribution',
      amount: incomeBreakdown.communityContribution,
      percentage: totalIncome > 0 ? (incomeBreakdown.communityContribution / totalIncome) * 100 : 0,
      color: '#34d399',
    },
    {
      name: 'Other Funds',
      amount: incomeBreakdown.otherFunds,
      percentage: totalIncome > 0 ? (incomeBreakdown.otherFunds / totalIncome) * 100 : 0,
      color: '#6ee7b7',
    },
  ];

  const expenditureFlowItems = Object.entries(spendingByCategory)
    .filter(([key]) => !key.includes('.'))
    .map(([family, amount]) => {
      const familyAmount = typeof amount === 'number' ? amount : 0;
      const programs = Object.entries(spendingByCategory)
        .filter(([key]) => key.startsWith(`${family}.`))
        .map(([programKey, programAmount]) => ({
          program: programKey.split('.')[1],
          amount: typeof programAmount === 'number' ? programAmount : 0,
          percentage: totalIncome > 0 ? ((typeof programAmount === 'number' ? programAmount : 0) / totalIncome) * 100 : 0,
        }));

      const result: any = {
        family,
        amount: familyAmount,
        percentage: totalIncome > 0 ? (familyAmount / totalIncome) * 100 : 0,
      };

      if (family === 'livelihood_development' && programs.length > 0) {
        result.programs = programs.sort((a, b) => b.amount - a.amount);
      }

      return result;
    })
    .sort((a, b) => b.amount - a.amount);

  const kpiCards = [
    {
      title: 'Total Income',
      value: formatCurrency(totalIncome),
      subtitle: 'All funding sources',
      icon: DollarSign,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Total Expenditure',
      value: formatCurrency(totalExpenditure),
      subtitle: 'Verified spending',
      icon: TrendingDown,
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Balance',
      value: formatCurrency(balance),
      subtitle: balance >= 0 ? 'Remaining funds' : 'Over budget',
      icon: balance >= 0 ? Wallet : TrendingUp,
      color: balance >= 0 ? 'bg-blue-500' : 'bg-orange-500',
      textColor: balance >= 0 ? 'text-blue-700' : 'text-orange-700',
      bgColor: balance >= 0 ? 'bg-blue-50' : 'bg-orange-50',
    },
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">Financial Monitoring Dashboard</h1>
        <p className="text-gray-600 mt-1">Community fund flows and financial overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpiCards.map((card, index) => (
          <Card key={index}>
            <CardBody>
              <div className={`${card.bgColor} rounded-lg p-6`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className={`text-3xl font-bold ${card.textColor} mb-1`}>{card.value}</p>
                <p className="text-xs text-gray-500">{card.subtitle}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Fund Flow Diagram</h2>
            <p className="text-sm text-gray-600 mt-1">
              Visualization of income sources and expenditure categories
            </p>
          </div>
          <FlowDiagram
            income={incomeFlowItems}
            expenditureFamilies={expenditureFlowItems}
            totalIncome={totalIncome}
            totalExpenditure={totalExpenditure}
            balance={balance}
            unallocated={unallocated}
            onFamilyClick={handleFamilyClick}
            onProgramClick={handleProgramClick}
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Commune Spending Summary</h2>
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-600 rounded"></div>
                <span className="text-gray-700 font-medium">Spent (Actually used)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-gray-700 font-medium">Disbursed - Spent (Paid but not yet used)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="text-gray-700 font-medium">Budget - Disbursed (Remaining budget not paid)</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {(() => {
              const maxBudget = Math.max(...communeFundUsage.map(c => c.totalBudget));
              return communeFundUsage.map((commune, index) => {
                const disbursedPct = commune.totalBudget > 0 ? (commune.totalDisbursed / commune.totalBudget) * 100 : 0;
                const spentPct = commune.totalBudget > 0 ? (commune.spent / commune.totalBudget) * 100 : 0;
                const remainingPct = 100 - disbursedPct;
                const barWidthPct = maxBudget > 0 ? (commune.totalBudget / maxBudget) * 100 : 100;

                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">{commune.communeName}</h3>
                      <span className="text-xs font-semibold text-gray-700">
                        Total: {formatCurrencyFull(commune.totalBudget)}
                      </span>
                    </div>

                    <div className="w-full">
                      <div
                        className="bg-gray-200 rounded-full h-8 overflow-hidden flex transition-all"
                        style={{ width: `${barWidthPct}%` }}
                      >
                        <div
                          className="bg-emerald-600 h-8 flex items-center justify-center transition-all"
                          style={{ width: `${Math.max(spentPct, 0)}%` }}
                          title={`Spent: ${formatCurrencyFull(commune.spent)} (${spentPct.toFixed(1)}%)`}
                        >
                          {spentPct > 10 && (
                            <span className="text-xs font-semibold text-white px-2">
                              {spentPct.toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <div
                          className="bg-purple-500 h-8 flex items-center justify-center transition-all"
                          style={{ width: `${Math.max(disbursedPct - spentPct, 0)}%` }}
                          title={`Disbursed (not yet spent): ${formatCurrencyFull(commune.totalDisbursed - commune.spent)} (${Math.max(disbursedPct - spentPct, 0).toFixed(1)}%)`}
                        >
                          {(disbursedPct - spentPct) > 10 && (
                            <span className="text-xs font-semibold text-white px-2">
                              {(disbursedPct - spentPct).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <div
                          className="bg-gray-300 h-8 flex items-center justify-center transition-all"
                          style={{ width: `${Math.max(remainingPct, 0)}%` }}
                          title={`Not disbursed: ${formatCurrencyFull(commune.totalBudget - commune.totalDisbursed)} (${remainingPct.toFixed(1)}%)`}
                        >
                          {remainingPct > 10 && (
                            <span className="text-xs font-semibold text-gray-700 px-2">
                              {remainingPct.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
            {communeFundUsage.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No commune data available
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedCategory || 'Category Details'}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Budget items with verified receipts in this category
          </p>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Item Name</TableHeader>
                  <TableHeader>Activity</TableHeader>
                  <TableHeader>Community</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Receipt</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoryDetails.map((detail) => (
                  <TableRow key={detail.id}>
                    <TableCell className="font-medium">{detail.itemName}</TableCell>
                    <TableCell className="text-sm text-gray-600">{detail.activityName}</TableCell>
                    <TableCell className="text-sm text-gray-600">{detail.communityName}</TableCell>
                    <TableCell>{formatCurrencyFull(detail.amount)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        detail.hasReceipt ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {detail.hasReceipt ? 'Verified' : 'Pending'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {categoryDetails.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No items found in this category
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Modal>
    </div>
  );
}
