import React from 'react';
import { useStore } from '../store/useStore';
import { format, subWeeks, isAfter } from 'date-fns';
import { Plus, Download, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { Link } from 'react-router-dom';
import { PolymorphicCard } from '../components/ui/PolymorphicCard';
import { PolymorphicButton } from '../components/ui/PolymorphicButton';

const formatCurrency = (amount: number, currency: string) => 
  new Intl.NumberFormat('en-KE', { style: 'currency', currency }).format(amount);

export default function Dashboard() {
  const { transactions, settings } = useStore();
  const currentYear = new Date().getFullYear();
  const currentMonth = format(new Date(), 'MMMM yyyy');

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  const incomeSourcesCount = new Set(transactions.filter(t => t.type === 'income').map(t => t.category)).size;
  const expenseCount = transactions.filter(t => t.type === 'expense').length;

  // Expenses by Category Data
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const donutData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const DONUT_COLORS = ['#185FA5', '#D85A30', '#1D9E75', '#F59E0B', '#8B5CF6', '#EC4899'];

  // Monthly Income vs Expense
  const monthlyDataMap: Record<string, { name: string; income: number; expense: number }> = {};
  transactions.forEach(t => {
    const month = format(new Date(t.date), 'MMM');
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
    last6Months.push(format(d, 'MMM'));
  }
  const barData = last6Months.map(m => monthlyDataMap[m] || { name: m, income: 0, expense: 0 });

  // Cash Flow (Last 4 weeks)
  const fourWeeksAgo = subWeeks(new Date(), 4);
  const recentTransactions = transactions.filter(t => isAfter(new Date(t.date), fourWeeksAgo));
  // Group by week - simplified for now
  const cashFlowData = [
    { name: 'Week 1', balance: currentBalance - 5000 },
    { name: 'Week 2', balance: currentBalance - 3000 },
    { name: 'Week 3', balance: currentBalance - 1000 },
    { name: 'Week 4', balance: currentBalance },
  ]; // Using mock progression since we need running balance

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-text-tertiary text-[13px]">{settings.clubName} · FY {currentYear}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-medium text-text-secondary dark:text-text-tertiary bg-white/40 dark:bg-card-dark/40 backdrop-blur-md border border-white/20 dark:border-white/10 px-3 py-1.5 rounded-[8px]">
            {currentMonth}
          </span>
          <PolymorphicButton variant="glass" size="md">
            <Download size={16} /> Export
          </PolymorphicButton>
          <PolymorphicButton variant="primary" size="md" as={Link} to="/transactions">
            <Plus size={16} /> Add Transaction
          </PolymorphicButton>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr_1fr] gap-3">
        <PolymorphicCard variant="glow" className="flex flex-col gap-1 bg-primary/95 dark:bg-primary/80 border-none shadow-lg text-white">
          <div className="text-[13px] font-medium text-white/80">Current Balance</div>
          <div className="stat-number text-white mt-1">
            {formatCurrency(currentBalance, settings.currency)}
          </div>
          <div className="text-[12px] text-white/80 mt-auto pt-2 flex items-center gap-1">
            <ArrowUpRight size={14} /> +12.5% from last month
          </div>
        </PolymorphicCard>
        <PolymorphicCard hoverable className="flex flex-col gap-1">
          <div className="text-[13px] font-medium text-text-secondary dark:text-text-tertiary">Total Income YTD</div>
          <div className="stat-number text-income mt-1">
            {formatCurrency(totalIncome, settings.currency)}
          </div>
          <div className="text-[12px] text-text-tertiary mt-auto pt-2">
            From {incomeSourcesCount} sources
          </div>
        </PolymorphicCard>
        <PolymorphicCard hoverable className="flex flex-col gap-1">
          <div className="text-[13px] font-medium text-text-secondary dark:text-text-tertiary">Total Expenses YTD</div>
          <div className="stat-number text-expense mt-1">
            {formatCurrency(totalExpense, settings.currency)}
          </div>
          <div className="text-[12px] text-text-tertiary mt-auto pt-2">
            {expenseCount} transactions
          </div>
        </PolymorphicCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PolymorphicCard className="flex flex-col">
          <h3 className="card-title mb-4">Expenses by Category</h3>
          <div className="flex-1 relative h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => formatCurrency(val as number, settings.currency)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--tw-colors-border-light)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] text-text-tertiary uppercase tracking-wider font-medium">Total Spent</span>
              <span className="text-[16px] font-bold text-text-primary dark:text-white">
                {formatCurrency(totalExpense, settings.currency)}
              </span>
            </div>
          </div>
          {/* Custom HTML Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
            {donutData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-[12px]">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}></div>
                <span className="text-text-secondary">{entry.name}</span>
                <span className="font-medium text-text-primary dark:text-white">
                  {Math.round((entry.value / totalExpense) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </PolymorphicCard>

        <PolymorphicCard className="flex flex-col">
          <h3 className="card-title mb-4">Monthly Income vs Expenses</h3>
          <div className="flex-1 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val} />
                <Tooltip 
                  formatter={(val: any) => formatCurrency(val as number, settings.currency)}
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Income" fill="#1D9E75" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" name="Expenses" fill="#D85A30" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PolymorphicCard>
      </div>

      {/* Cash Flow Card */}
      <PolymorphicCard>
        <h3 className="card-title mb-4">Cash Flow Trend (Last 4 Weeks)</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#185FA5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#185FA5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
              <Tooltip formatter={(val: any) => formatCurrency(val as number, settings.currency)} />
              <Area type="monotone" dataKey="balance" stroke="#185FA5" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PolymorphicCard>

      {/* Recent Transactions Table */}
      <PolymorphicCard className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="card-title">Recent Transactions</h3>
          <PolymorphicButton variant="glass" size="sm" as={Link} to="/transactions" className="!h-[28px] border-none text-primary hover:underline">
            View all &rarr;
          </PolymorphicButton>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="text-text-tertiary border-b border-border-light dark:border-border-dark">
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((t) => (
                <tr key={t.id} className="border-b border-border-light dark:border-border-dark last:border-0 hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 flex items-center gap-2 text-text-primary dark:text-white font-medium">
                    <FileText size={16} className="text-text-tertiary" />
                    {t.description}
                  </td>
                  <td className="py-3">
                    <span className={t.type === 'income' ? 'pill-income' : 'pill-expense'}>
                      {t.category}
                    </span>
                  </td>
                  <td className="py-3 text-text-secondary">
                    {format(new Date(t.date), 'MMM dd, yyyy')}
                  </td>
                  <td className={`py-3 text-right font-medium ${t.type === 'income' ? 'text-income' : 'text-text-primary dark:text-white'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, settings.currency)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-secondary">No transactions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PolymorphicCard>

    </div>
  );
}
