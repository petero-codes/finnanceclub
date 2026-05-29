import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { History, Filter } from 'lucide-react';

export default function AuditTrail() {
  const { auditLog, currentUser } = useStore();
  const [filterAction, setFilterAction] = useState('all');

  const filteredLogs = auditLog.filter(log => filterAction === 'all' || log.action.includes(filterAction));

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex justify-end gap-2 mb-2">
        <select 
          className="px-3 py-1.5 bg-white/20 dark:bg-card-dark/20 border border-white/25 dark:border-white/10 rounded-[8px] text-[14px] text-text-primary dark:text-white focus:outline-none"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        >
          <option value="all">All Actions</option>
          <option value="transaction">Transactions</option>
          <option value="receipt">Receipts</option>
          <option value="settings">Settings</option>
          <option value="user">Users</option>
        </select>
        <button className="btn-secondary">
          <Filter size={16} /> Filter
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="text-text-tertiary border-b border-border-light dark:border-border-dark">
              <th className="pb-3 font-medium">Date & Time</th>
              <th className="pb-3 font-medium">User</th>
              <th className="pb-3 font-medium">Action</th>
              <th className="pb-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-b border-border-light dark:border-border-dark last:border-0 hover:bg-page-light dark:hover:bg-page-dark transition-colors">
                <td className="py-3 text-text-secondary whitespace-nowrap">
                  {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                </td>
                <td className="py-3 text-text-primary dark:text-white font-medium">
                  {currentUser?.name || 'BRIAN treasurer'}
                </td>
                <td className="py-3">
                  <span className="pill-category">{log.action.replace('_', ' ')}</span>
                </td>
                <td className="py-3 text-text-primary dark:text-white">
                  {log.details}
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-text-secondary">
                  <div className="flex flex-col items-center gap-2">
                    <History size={32} className="opacity-50" />
                    <p>No audit logs found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
