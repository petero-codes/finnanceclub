import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, AreaChart, Area
} from 'recharts';

const formatCurrency = (amount: number, currency: string) => 
  new Intl.NumberFormat('en-KE', { style: 'currency', currency }).format(amount);

export default function Analytics() {
  const { transactions, settings } = useStore();
  const [period, setPeriod] = useState('year');

  const DONUT_COLORS = ['#185FA5', '#D85A30', '#1D9E75', '#F59E0B', '#8B5CF6', '#EC4899'];

  // 1. Expenses by Category
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const donutData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totalExpense = donutData.reduce((sum, item) => sum + item.value, 0);

  // 2. Monthly Income vs Expenses
  const monthlyDataMap: Record<string, { name: string; income: number; expense: number }> = {};
  transactions.forEach(t => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short' });
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = { name: month, income: 0, expense: 0 };
    }
    monthlyDataMap[month][t.type] += t.amount;
  });
  
  // Dynamically calculate the last 6 months in chronological order
  const last6Months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    last6Months.push(d.toLocaleString('default', { month: 'short' }));
  }
  const barData = last6Months.map(m => monthlyDataMap[m] || { name: m, income: 0, expense: 0 });

  // 3. Cash Flow Trend
  // Mock trend data
  const cashFlowData = [
    { name: 'Week 1', balance: 5000 },
    { name: 'Week 2', balance: 8000 },
    { name: 'Week 3', balance: 6000 },
    { name: 'Week 4', balance: 9000 },
    { name: 'Week 5', balance: 12000 },
  ];

  // 4. Top Expense Categories
  const topExpensesData = [...donutData].slice(0, 5);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="page-title">Analytics</h1>
        <select 
          className="px-3 py-1.5 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-[8px] text-[14px] text-text-primary dark:text-white focus:outline-none"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Expenses by Category */}
        <div className="card flex flex-col">
          <h3 className="card-title mb-4">Expenses by Category</h3>
          <div className="flex-1 relative min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => formatCurrency(val as number, settings.currency)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] text-text-tertiary uppercase tracking-wider font-medium">Total Spent</span>
              <span className="text-[18px] font-bold text-text-primary dark:text-white">
                {formatCurrency(totalExpense, settings.currency)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
            {donutData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-[12px] cursor-pointer hover:opacity-80">
                <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}></div>
                <span className="text-text-secondary">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Income vs Expenses */}
        <div className="card flex flex-col">
          <h3 className="card-title mb-4">Monthly Income vs Expenses</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val} />
                <Tooltip formatter={(val: any) => formatCurrency(val as number, settings.currency)} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Income" fill="#1D9E75" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" name="Expenses" fill="#D85A30" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cash Flow Trend */}
        <div className="card flex flex-col">
          <h3 className="card-title mb-4">Cash Flow Trend</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#185FA5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#185FA5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip formatter={(val: any) => formatCurrency(val as number, settings.currency)} />
                <Area type="monotone" dataKey="balance" stroke="#185FA5" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Expense Categories */}
        <div className="card flex flex-col">
          <h3 className="card-title mb-4">Top Expense Categories</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topExpensesData} margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} />
                <Tooltip formatter={(val: any) => formatCurrency(val as number, settings.currency)} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                <Bar dataKey="value" fill="#D85A30" radius={[0, 4, 4, 0]} barSize={24}>
                  {topExpensesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
