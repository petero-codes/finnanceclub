import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { Printer, FileBox, TrendingUp, Landmark, FileText, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const formatCurrency = (amount: number, currency: string) => 
  new Intl.NumberFormat('en-KE', { style: 'currency', currency }).format(amount);

export default function Reports() {
  const { transactions, auditLog, settings } = useStore();
  const [reportType, setReportType] = useState('monthly');
  
  // Default to current month/year
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const handlePrint = () => {
    window.print();
  };

  // 1. Data Filtering Logic
  let filteredTx = [...transactions];
  let titlePeriod = '';

  if (reportType === 'monthly') {
    const periodStr = selectedMonth || format(new Date(), 'yyyy-MM');
    filteredTx = transactions.filter(t => t.date.startsWith(periodStr));
    
    // Parse safely
    try {
      titlePeriod = format(new Date(periodStr + '-02'), 'MMMM yyyy');
    } catch (e) {
      titlePeriod = periodStr;
    }
  } else if (reportType === 'annual') {
    const yearStr = selectedYear || new Date().getFullYear().toString();
    filteredTx = transactions.filter(t => new Date(t.date).getFullYear().toString() === yearStr);
    titlePeriod = `Calendar Year ${yearStr}`;
  } else if (reportType === 'event') {
    titlePeriod = 'All-Time Category Summary';
  } else if (reportType === 'audit') {
    titlePeriod = 'Secure Logs Summary';
  }

  // Summaries
  const totalIncome = filteredTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = totalIncome - totalExpense;

  // Categorized breakdown
  const categoryBreakdown = filteredTx.reduce((acc, t) => {
    if (!acc[t.category]) {
      acc[t.category] = { category: t.category, type: t.type, amount: 0, count: 0 };
    }
    acc[t.category].amount += t.amount;
    acc[t.category].count += 1;
    return acc;
  }, {} as Record<string, { category: string; type: 'income' | 'expense'; amount: number; count: number }>);

  const categoriesList = Object.values(categoryBreakdown).sort((a, b) => b.amount - a.amount);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Page Title (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <h1 className="page-title">Reports</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.2fr] gap-6 items-start">
        
        {/* Generate Report Sidebar Control (Hidden when printing) */}
        <div className="card no-print flex flex-col gap-5">
          <h3 className="card-title border-b border-white/10 pb-2">Generate Report</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1">Report Type</label>
              <select 
                className="w-full px-3 py-2 bg-white/20 dark:bg-card-dark/20 border border-white/25 dark:border-white/10 rounded-[8px] text-[14px] text-text-primary dark:text-white focus:outline-none focus:border-primary"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="monthly">Monthly Summary</option>
                <option value="annual">Annual Report</option>
                <option value="event">Category Breakdown</option>
                <option value="audit">Secure Audit Report</option>
              </select>
            </div>

            {reportType === 'monthly' && (
              <div className="animate-fade-in">
                <label className="block text-[12px] font-medium text-text-secondary mb-1">Select Month</label>
                <input 
                  type="month" 
                  className="w-full px-3 py-2 bg-white/20 dark:bg-card-dark/20 border border-white/25 dark:border-white/10 rounded-[8px] text-[14px] text-text-primary dark:text-white focus:outline-none focus:border-primary"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
            )}

            {reportType === 'annual' && (
              <div className="animate-fade-in">
                <label className="block text-[12px] font-medium text-text-secondary mb-1">Select Calendar Year</label>
                <select 
                  className="w-full px-3 py-2 bg-white/20 dark:bg-card-dark/20 border border-white/25 dark:border-white/10 rounded-[8px] text-[14px] text-text-primary dark:text-white focus:outline-none focus:border-primary"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
            )}

            <div className="mt-4 border-t border-white/10 pt-4">
              <button className="btn-primary w-full shadow-lg shadow-primary/10 cursor-pointer" onClick={handlePrint}>
                <Printer size={15} /> Print / Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Live Premium Document Preview Sheet (Expands to w-full on print) */}
        <div className="card bg-white text-gray-900 border border-gray-200 shadow-xl p-6 sm:p-8 flex flex-col gap-6 w-full print:border-none print:shadow-none print:p-0">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-[36px] h-[36px] rounded-[10px] bg-[#3B82F6] flex items-center justify-center shadow-md">
                <TrendingUp className="text-white" size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-gray-900 uppercase tracking-[0.5px] leading-none">
                  {settings.clubName}
                </span>
                <span className="text-[10px] text-gray-500 font-medium mt-0.5 leading-none">
                  School Club Finance
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-[0.05em] bg-blue-50 text-blue-700">
                {reportType === 'event' ? 'Category Summary' : `${reportType} report`}
              </span>
              <p className="text-[10px] text-gray-400 mt-1">Generated {format(new Date(), 'MMM dd, yyyy')}</p>
            </div>
          </div>
          
          {/* Title and Purpose */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[15px] font-bold text-gray-900 leading-none">{titlePeriod} Statement</h3>
            <p className="text-[12px] text-gray-500 leading-relaxed">
              This statement serves as the official transaction summary, balance computation, and system mutation log generated by the {settings.clubName} treasurer office.
            </p>
          </div>

          {/* Key Metrics grid */}
          {reportType !== 'audit' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-[8px] border border-gray-100 flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Income</span>
                <span className="text-[18px] font-bold text-emerald-600 mt-1">{formatCurrency(totalIncome, settings.currency)}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-[8px] border border-gray-100 flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Expenses</span>
                <span className="text-[18px] font-bold text-orange-600 mt-1">{formatCurrency(totalExpense, settings.currency)}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-[8px] border border-gray-100 flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Net Cash Flow</span>
                <span className={`text-[18px] font-bold mt-1 ${netCashFlow >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                  {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow, settings.currency)}
                </span>
              </div>
            </div>
          )}

          {/* Audit report title header */}
          {reportType === 'audit' && (
            <div className="p-3 bg-gray-50 rounded-[8px] border border-gray-100 flex items-center gap-3">
              <Activity className="text-[#3B82F6]" size={18} />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">System Log Ledger</span>
                <span className="text-[12px] text-gray-700 font-bold mt-0.5">{auditLog.length} recorded modifications in secure history</span>
              </div>
            </div>
          )}

          {/* Report Specific Content */}
          {reportType === 'audit' ? (
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="text-gray-400 uppercase tracking-wider border-b border-gray-200 text-[10px] font-bold pb-2">
                    <th className="pb-2 font-bold">Timestamp</th>
                    <th className="pb-2 font-bold">Action Type</th>
                    <th className="pb-2 font-bold">Log Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {auditLog.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 font-mono text-[10px] text-gray-400">
                        {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                      </td>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.05em] bg-gray-100 text-gray-600">
                          {log.action.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 font-bold text-gray-800">{log.details}</td>
                    </tr>
                  ))}
                  {auditLog.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-400 italic">No modifications logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              
              {/* Category Summaries */}
              <div>
                <h4 className="text-[12px] font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1.5 uppercase tracking-wide">Category Summaries</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="text-gray-400 uppercase tracking-wider border-b border-gray-200 text-[10px] font-bold">
                        <th className="pb-2 font-bold">Category</th>
                        <th className="pb-2 font-bold">Type</th>
                        <th className="pb-2 text-right font-bold">Transactions</th>
                        <th className="pb-2 text-right font-bold">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {categoriesList.map((c) => (
                        <tr key={c.category} className="hover:bg-gray-50/50">
                          <td className="py-2.5 font-bold text-gray-900">{c.category}</td>
                          <td className="py-2.5">
                            <span className={`px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.05em] ${c.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                              {c.type}
                            </span>
                          </td>
                          <td className="py-2.5 text-right text-gray-500 font-bold">{c.count}</td>
                          <td className={`py-2.5 text-right font-bold ${c.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                            {c.type === 'income' ? '+' : '-'}{formatCurrency(c.amount, settings.currency)}
                          </td>
                        </tr>
                      ))}
                      {categoriesList.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-400 italic">No category records in this period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detailed Ledger */}
              <div>
                <h4 className="text-[12px] font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1.5 uppercase tracking-wide">Detailed Ledger</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="text-gray-400 uppercase tracking-wider border-b border-gray-200 text-[10px] font-bold">
                        <th className="pb-2 font-bold">Description</th>
                        <th className="pb-2 font-bold">Category</th>
                        <th className="pb-2 font-bold">Date</th>
                        <th className="pb-2 text-right font-bold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {filteredTx.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 font-bold text-gray-900">{t.description}</td>
                          <td className="py-2.5">
                            <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.05em] bg-gray-100 text-gray-600 border border-gray-200">
                              {t.category}
                            </span>
                          </td>
                          <td className="py-2.5 text-gray-400 font-mono text-[10px]">
                            {format(new Date(t.date), 'yyyy-MM-dd')}
                          </td>
                          <td className={`py-2.5 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, settings.currency)}
                          </td>
                        </tr>
                      ))}
                      {filteredTx.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-400 italic">No transaction records in this period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Statement Footer */}
          <div className="border-t border-gray-200 mt-auto pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] text-gray-400 font-bold">
            <span>VERIFIED BY TREASURER OFFICE · SEC-{settings.clubName.substring(0,3).toUpperCase()}-LGR</span>
            <span>This document is auto-generated and legally verified by {settings.clubName}.</span>
          </div>

        </div>

      </div>
    </div>
  );
}
