import React, { useState } from 'react';
import Receipts from './Receipts';
import Notes from './Notes';
import AuditTrail from './AuditTrail';
import { Receipt, FileText, History } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Accountability() {
  const [activeTab, setActiveTab] = useState<'receipts' | 'notes' | 'audit'>('receipts');
  const { settings } = useStore();

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title">Accountability</h1>
          <p className="text-text-tertiary text-[13px]">
            {settings.clubName} · {formattedDate}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-[18px] font-bold text-text-primary dark:text-white">Accountability</h2>
          <p className="text-[13px] text-text-secondary mt-0.5">Receipts, notes, and full audit history</p>
        </div>

        {/* Dynamic Glass Tabs Selector */}
        <div className="flex gap-2 p-1.5 bg-white/20 dark:bg-card-dark/40 backdrop-blur-md border border-white/25 dark:border-white/10 rounded-[10px] self-start">
          <button 
            onClick={() => setActiveTab('receipts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-medium transition-all ${
              activeTab === 'receipts' 
                ? 'bg-primary text-white shadow-md' 
                : 'text-text-secondary hover:text-text-primary hover:bg-white/10'
            }`}
          >
            <Receipt size={15} /> Receipts
          </button>
          <button 
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-medium transition-all ${
              activeTab === 'notes' 
                ? 'bg-primary text-white shadow-md' 
                : 'text-text-secondary hover:text-text-primary hover:bg-white/10'
            }`}
          >
            <FileText size={15} /> Treasurer Notes
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-medium transition-all ${
              activeTab === 'audit' 
                ? 'bg-primary text-white shadow-md' 
                : 'text-text-secondary hover:text-text-primary hover:bg-white/10'
            }`}
          >
            <History size={15} /> Audit Trail
          </button>
        </div>

        {/* Tab Content Rendering */}
        <div className="mt-2 min-h-[400px]">
          {activeTab === 'receipts' && <Receipts />}
          {activeTab === 'notes' && <Notes />}
          {activeTab === 'audit' && <AuditTrail />}
        </div>
      </div>
    </div>
  );
}
