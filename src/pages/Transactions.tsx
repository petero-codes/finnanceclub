import React, { useState } from 'react';
import { useStore, type Transaction } from '../store/useStore';
import { format } from 'date-fns';
import { Plus, Search, Filter, Trash2, Edit2, FileText, X } from 'lucide-react';
import { PolymorphicCard } from '../components/ui/PolymorphicCard';
import { PolymorphicButton } from '../components/ui/PolymorphicButton';
import { rateLimitAction } from '../utils/rateLimiter';

const formatCurrency = (amount: number, currency: string) => 
  new Intl.NumberFormat('en-KE', { style: 'currency', currency }).format(amount);

export default function Transactions() {
  const { transactions, settings, addTransaction, updateTransaction, deleteTransaction, currentUser } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const isViewOnly = currentUser?.accessLevel === 'view_only';
  
  // Modal State
  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [type, setType] = useState<'income'|'expense'>('expense');
  const [cat, setCat] = useState('Events');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [rateLimited, setRateLimited] = useState(false);

  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      deleteTransaction(id);
    }
  };

  const startEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setDesc(t.description);
    setAmt(t.amount.toString());
    setType(t.type);
    setCat(t.category);
    setDate(format(new Date(t.date), 'yyyy-MM-dd'));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setDesc('');
    setAmt('');
    setType('expense');
    setCat('Events');
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amt) return;
    
    // Security Rate Limiter Guard
    const allowed = rateLimitAction(editingTransaction ? 'edit_transaction' : 'add_transaction', {
      limitMs: 2000,
      onLimit: () => {
        setRateLimited(true);
        setTimeout(() => setRateLimited(false), 3000);
      }
    });

    if (!allowed) return;

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        description: desc,
        amount: parseFloat(amt),
        type,
        category: cat,
        date: new Date(date).toISOString(),
      });
    } else {
      addTransaction({
        description: desc,
        amount: parseFloat(amt),
        type,
        category: cat,
        date: new Date(date).toISOString(),
      });
    }
    
    closeModal();
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="page-title">Transactions</h1>
        {!isViewOnly && (
          <PolymorphicButton variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add Transaction
          </PolymorphicButton>
        )}
      </div>

      {/* Controls Bar */}
      <PolymorphicCard className="flex flex-col sm:flex-row gap-4 !p-[14px]">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="w-full pl-9 pr-3 py-1.5 bg-white/20 dark:bg-card-dark/20 border border-white/25 dark:border-white/10 rounded-[8px] text-[14px] text-text-primary dark:text-white focus:outline-none focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="px-3 py-1.5 bg-white/20 dark:bg-card-dark/20 backdrop-blur-md border border-white/25 dark:border-white/10 rounded-[8px] text-[14px] text-text-primary dark:text-white focus:outline-none"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <PolymorphicButton variant="glass">
            <Filter size={16} /> Filters
          </PolymorphicButton>
        </div>
      </PolymorphicCard>

      {/* Transactions Table */}
      <PolymorphicCard className="overflow-x-auto">
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="text-text-tertiary border-b border-white/15 dark:border-white/5">
              <th className="pb-3 font-medium">Description</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium text-right">Amount</th>
              {!isViewOnly && <th className="pb-3 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="border-b border-white/10 dark:border-white/5 last:border-0 hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                <td className="py-3 flex items-center gap-2 text-text-primary dark:text-white font-medium">
                  <FileText size={16} className="text-text-tertiary" />
                  {t.description}
                </td>
                <td className="py-3">
                  <span className="pill-category">{t.category}</span>
                </td>
                <td className="py-3">
                  <span className={t.type === 'income' ? 'pill-income' : 'pill-expense'}>
                    {t.type}
                  </span>
                </td>
                <td className="py-3 text-text-secondary">
                  {format(new Date(t.date), 'MMM dd, yyyy')}
                </td>
                <td className={`py-3 text-right font-medium ${t.type === 'income' ? 'text-income' : 'text-text-primary dark:text-white'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, settings.currency)}
                </td>
                {!isViewOnly && (
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(t)} className="p-1.5 text-text-secondary hover:text-primary transition-colors" title="Edit Transaction">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 text-text-secondary hover:text-expense transition-colors" title="Delete Transaction">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={isViewOnly ? 5 : 6} className="py-12 text-center text-text-secondary">
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={32} className="opacity-50" />
                    <p>No transactions found. {!isViewOnly && 'Add your first one.'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </PolymorphicCard>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white/90 dark:bg-card-dark/95 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-[12px] w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-medium text-text-primary dark:text-white">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button onClick={closeModal} className="text-text-secondary hover:text-text-primary"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">Type</label>
                <div className="flex gap-2">
                  <button type="button" className={`flex-1 py-1.5 text-[14px] font-medium rounded-[8px] border transition-all ${type==='expense' ? 'bg-expense/10 text-expense border-expense' : 'border-white/30 dark:border-white/10 text-text-secondary hover:bg-white/50 dark:hover:bg-white/5'}`} onClick={() => setType('expense')}>Expense</button>
                  <button type="button" className={`flex-1 py-1.5 text-[14px] font-medium rounded-[8px] border transition-all ${type==='income' ? 'bg-income/10 text-income border-income' : 'border-white/30 dark:border-white/10 text-text-secondary hover:bg-white/50 dark:hover:bg-white/5'}`} onClick={() => setType('income')}>Income</button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">Description</label>
                <input required type="text" className="w-full px-3 py-2 bg-white/20 dark:bg-card-dark/20 border border-white/25 dark:border-white/10 rounded-[8px] text-[14px] text-text-primary dark:text-white focus:outline-none focus:border-primary" value={desc} onChange={e => setDesc(e.target.value)} />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">Amount</label>
                  <input required type="number" step="0.01" className="w-full px-3 py-2 bg-white/20 dark:bg-card-dark/20 border border-white/25 dark:border-white/10 rounded-[8px] text-[14px] text-text-primary dark:text-white focus:outline-none focus:border-primary" value={amt} onChange={e => setAmt(e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">Date</label>
                  <input required type="date" className="w-full px-3 py-2 bg-white/20 dark:bg-card-dark/20 border border-white/25 dark:border-white/10 rounded-[8px] text-[14px] text-text-primary dark:text-white focus:outline-none focus:border-primary" value={date} onChange={e => setDate(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">Category</label>
                <select className="w-full px-3 py-2 bg-white/20 dark:bg-card-dark/20 border border-white/25 dark:border-white/10 rounded-[8px] text-[14px] text-text-primary dark:text-white focus:outline-none focus:border-primary" value={cat} onChange={e => setCat(e.target.value)}>
                  {type === 'expense' 
                    ? ['Dues', 'Events', 'Equipment', 'Software', 'Venue', 'Miscellaneous'].map(c => <option key={c} value={c}>{c}</option>)
                    : ['Membership', 'Sponsorship', 'Donations', 'Tournament Fees', 'Other'].map(c => <option key={c} value={c}>{c}</option>)
                  }
                </select>
              </div>

              {rateLimited && (
                <p className="text-[12px] text-expense font-medium animate-pulse text-center mt-1">
                  Rate limit exceeded! Please wait a moment.
                </p>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <PolymorphicButton type="button" variant="glass" onClick={closeModal}>Cancel</PolymorphicButton>
                <PolymorphicButton type="submit" variant="primary">
                  {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
                </PolymorphicButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
