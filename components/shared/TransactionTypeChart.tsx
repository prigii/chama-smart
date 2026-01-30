"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Transaction {
  id: string;
  amount: number;
  type: string;
}

interface TransactionTypeChartProps {
  transactions: Transaction[];
}

const COLORS = {
  DEPOSIT: '#10b981',
  WITHDRAWAL: '#ef4444',
  LOAN_DISBURSEMENT: '#3b82f6',
  LOAN_REPAYMENT: '#8b5cf6',
  EXPENSE: '#f59e0b',
  FINE: '#ec4899',
};

const TYPE_LABELS = {
  DEPOSIT: 'Deposits',
  WITHDRAWAL: 'Withdrawals',
  LOAN_DISBURSEMENT: 'Loan Disbursements',
  LOAN_REPAYMENT: 'Loan Repayments',
  EXPENSE: 'Expenses',
  FINE: 'Fines',
};

export default function TransactionTypeChart({ transactions }: TransactionTypeChartProps) {
  // Aggregate transactions by type
  const prepareChartData = () => {
    const typeMap = new Map<string, number>();
    
    transactions.forEach(t => {
      const current = typeMap.get(t.type) || 0;
      typeMap.set(t.type, current + Number(t.amount));
    });
    
    return Array.from(typeMap.entries()).map(([type, value]) => ({
      name: TYPE_LABELS[type as keyof typeof TYPE_LABELS] || type,
      value,
      type,
    }));
  };

  const chartData = prepareChartData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{payload[0].name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            KES {payload[0].value.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {((payload[0].value / chartData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
        No transaction data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={CustomLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.type as keyof typeof COLORS] || '#6b7280'} 
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry: any) => (
            <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
