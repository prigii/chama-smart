"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  date: Date | string;
}

interface TransactionChartProps {
  transactions: Transaction[];
}

export default function TransactionChart({ transactions }: TransactionChartProps) {
  // Prepare data for last 30 days
  const prepareChartData = () => {
    const days = 30;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, 'MMM dd');
      
      // Filter transactions for this day
      const dayTransactions = transactions.filter(t => {
        const transactionDate = startOfDay(new Date(t.date));
        return transactionDate.getTime() === date.getTime();
      });
      
      // Calculate totals
      const deposits = dayTransactions
        .filter(t => t.type === 'DEPOSIT')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const withdrawals = dayTransactions
        .filter(t => t.type === 'WITHDRAWAL' || t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      data.push({
        date: dateStr,
        deposits,
        withdrawals,
        net: deposits - withdrawals,
      });
    }
    
    return data;
  };

  const chartData = prepareChartData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Deposits: KES {payload[0].value.toLocaleString()}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">
            Withdrawals: KES {payload[1].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis 
          dataKey="date" 
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="deposits" 
          stroke="#10b981" 
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line 
          type="monotone" 
          dataKey="withdrawals" 
          stroke="#ef4444" 
          strokeWidth={2}
          dot={{ fill: '#ef4444', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
