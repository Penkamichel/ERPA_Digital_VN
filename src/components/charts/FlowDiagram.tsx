import { getFamilyLabel, getFamilyColor, getProgramLabel, getProgramColor } from '../../utils/categoryMapper';

interface FlowItem {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

interface FamilyFlow {
  family: string;
  amount: number;
  percentage: number;
  programs?: ProgramFlow[];
}

interface ProgramFlow {
  program: string;
  amount: number;
  percentage: number;
}

interface FlowDiagramProps {
  income: FlowItem[];
  expenditureFamilies: FamilyFlow[];
  totalIncome: number;
  totalExpenditure: number;
  balance: number;
  unallocated: number;
  onFamilyClick?: (family: string) => void;
  onProgramClick?: (family: string, program: string) => void;
}

export default function FlowDiagram({
  income,
  expenditureFamilies,
  totalIncome,
  totalExpenditure,
  balance,
  unallocated,
  onFamilyClick,
  onProgramClick,
}: FlowDiagramProps) {
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Fund Flow Overview</h3>
          <p className="text-sm text-gray-600 mt-1">Income sources and expenditure breakdown</p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-emerald-700 mb-4 border-b-2 border-emerald-500 pb-2">
              INCOME SOURCES
            </h4>
            <div className="space-y-3">
              {income.filter(item => item.amount > 0).map((item, index) => {
                const boxHeight = totalIncome > 0 ? (item.amount / totalIncome) * 700 : 100;
                const isVerySmallBox = boxHeight < 50;
                const isSmallBox = boxHeight < 100;
                const labelSize = isVerySmallBox ? 'text-[10px]' : isSmallBox ? 'text-xs' : 'text-sm';
                const percentageSize = isVerySmallBox ? 'text-xs' : isSmallBox ? 'text-lg' : 'text-3xl';
                const amountSize = isSmallBox ? 'text-xs' : 'text-sm';
                const padding = isVerySmallBox ? 'p-1.5' : isSmallBox ? 'p-3' : 'p-5';

                return (
                  <div
                    key={index}
                    className={`${padding} rounded-lg transition-all hover:shadow-lg flex flex-col justify-between relative group`}
                    style={{
                      backgroundColor: `${item.color}15`,
                      borderLeft: `4px solid ${item.color}`,
                      height: `${boxHeight}px`
                    }}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className={`${labelSize} font-semibold text-gray-900 leading-tight`}>{item.name}</span>
                      <span className={`${percentageSize} font-bold flex-shrink-0`} style={{ color: item.color }}>
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                    {!isVerySmallBox && (
                      <p className={`${amountSize} font-bold mt-1`} style={{ color: item.color }}>
                        {formatCurrency(item.amount)}
                      </p>
                    )}
                    {isVerySmallBox && (
                      <div className="absolute left-0 top-full mt-1 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                        {formatCurrency(item.amount)}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="pt-3 mt-3 border-t-2 border-emerald-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">TOTAL INCOME</span>
                  <span className="text-lg font-bold text-emerald-700">100%</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <h4 className="text-sm font-semibold text-red-700 mb-4 border-b-2 border-red-500 pb-2">
              EXPENDITURE FAMILIES
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                {expenditureFamilies.filter(item => item.amount > 0).map((family, index) => {
                  const color = getFamilyColor(family.family as any);
                  const boxHeight = totalIncome > 0 ? (family.amount / totalIncome) * 700 : 100;
                  const isVerySmallBox = boxHeight < 50;
                  const isSmallBox = boxHeight < 100;
                  const labelSize = isVerySmallBox ? 'text-[10px]' : isSmallBox ? 'text-xs' : 'text-sm';
                  const percentageSize = isVerySmallBox ? 'text-xs' : isSmallBox ? 'text-lg' : 'text-3xl';
                  const amountSize = isSmallBox ? 'text-xs' : 'text-sm';
                  const padding = isVerySmallBox ? 'p-1.5' : isSmallBox ? 'p-3' : 'p-5';

                  return (
                    <div
                      key={index}
                      className={`${padding} rounded-lg flex flex-col justify-between relative group transition-all hover:shadow-lg`}
                      style={{
                        backgroundColor: `${color}15`,
                        borderLeft: `4px solid ${color}`,
                        height: `${boxHeight}px`
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`${labelSize} font-semibold text-gray-900 leading-tight`}>
                          {getFamilyLabel(family.family as any)}
                        </span>
                        <span className={`${percentageSize} font-bold flex-shrink-0`} style={{ color }}>
                          {family.percentage.toFixed(1)}%
                        </span>
                      </div>
                      {!isVerySmallBox && (
                        <p className={`${amountSize} font-bold mt-1`} style={{ color }}>
                          {formatCurrency(family.amount)}
                        </p>
                      )}
                      {isVerySmallBox && (
                        <div className="absolute left-0 top-full mt-1 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                          {formatCurrency(family.amount)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                {expenditureFamilies
                  .find(f => f.family === 'livelihood_development')
                  ?.programs?.filter(p => p.amount > 0)
                  .map((program, pIndex) => {
                    const familyColor = getFamilyColor('livelihood_development');
                    const programBoxHeight = totalIncome > 0 ? (program.amount / totalIncome) * 700 : 80;
                    const isVerySmallBox = programBoxHeight < 40;
                    const isSmallBox = programBoxHeight < 80;
                    const labelSize = isVerySmallBox ? 'text-[9px]' : isSmallBox ? 'text-xs' : 'text-sm';
                    const percentageSize = isVerySmallBox ? 'text-[10px]' : isSmallBox ? 'text-base' : 'text-xl';
                    const amountSize = isSmallBox ? 'text-xs' : 'text-sm';
                    const padding = isVerySmallBox ? 'p-1' : isSmallBox ? 'p-2' : 'p-4';

                    return (
                      <div
                        key={pIndex}
                        className={`${padding} rounded-lg flex flex-col justify-between relative group transition-all hover:shadow-lg`}
                        style={{
                          backgroundColor: `${familyColor}15`,
                          borderLeft: `3px solid ${familyColor}`,
                          height: `${programBoxHeight}px`
                        }}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className={`${labelSize} font-semibold text-gray-800 leading-tight`}>
                            {getProgramLabel(program.program as any)}
                          </span>
                          <span className={`${percentageSize} font-bold flex-shrink-0`} style={{ color: familyColor }}>
                            {program.percentage.toFixed(1)}%
                          </span>
                        </div>
                        {!isVerySmallBox && (
                          <p className={`${amountSize} font-bold mt-0.5`} style={{ color: familyColor }}>
                            {formatCurrency(program.amount)}
                          </p>
                        )}
                        {isVerySmallBox && (
                          <div className="absolute left-0 top-full mt-1 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                            {formatCurrency(program.amount)}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className="pt-3 mt-3 border-t-2 border-red-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900">TOTAL EXPENDITURE</span>
                <span className="text-lg font-bold text-red-700">
                  {totalIncome > 0 ? ((totalExpenditure / totalIncome) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{formatCurrency(totalExpenditure)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
