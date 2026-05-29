import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // ISO string
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  filename: string;
  dataUrl: string;
  uploadedAt: string;
  linkedTransactionId?: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AppSettings {
  clubName: string;
  currency: string;
  theme: 'light' | 'dark' | 'system';
  fyStartMonth: number; // 1 = Jan
  pinEnabled: boolean;
  pin: string;
  sessionTimeoutMinutes: number;
  lockoutUntil: string | null; // ISO string representing lockout end time
  failedAttempts: number; // Count of consecutive failed PIN entries
}

export interface AppState {
  transactions: Transaction[];
  receipts: Receipt[];
  auditLog: AuditEntry[];
  settings: AppSettings;
  notes: string;
  notesSavedAt: string | null;
  sessionToken: string | null;
  
  // Actions
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, t: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteTransaction: (id: string) => void;
  addReceipt: (r: Omit<Receipt, 'id' | 'uploadedAt'>) => void;
  deleteReceipt: (id: string) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  saveNotes: (notes: string) => void;
  resetData: () => void;
  importData: (data: Partial<AppState>) => void;
  setPin: (pin: string) => void;
  setPinEnabled: (enabled: boolean) => void;
  unlockVault: (pin: string) => boolean;
  lockVault: () => void;
  refreshSession: () => void;
}

const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const categories = {
    expense: ['Events', 'Equipment', 'Software', 'Venue', 'Miscellaneous'],
    income: ['Membership', 'Sponsorship', 'Donations', 'Tournament Fees', 'Other']
  };
  
  const descriptions = {
    'Events': ['Annual General Meeting', 'End of Year Party', 'Chess Workshop'],
    'Equipment': ['Chess Boards Set', 'Digital Clocks', 'Notation Pads'],
    'Software': ['Zoom Subscription', 'Website Hosting', 'Tournament Software License'],
    'Venue': ['Hall Booking for May', 'Weekend Practice Venue', 'Tournament Hall'],
    'Miscellaneous': ['Refreshments', 'Transport for team', 'Stationery'],
    'Membership': ['Annual Dues - John Doe', 'Annual Dues - Jane Smith', 'Student Membership'],
    'Sponsorship': ['Safaricom Bronze Sponsorship', 'Local Business Sponsor', 'Individual Patron'],
    'Donations': ['Anonymous Donation', 'Alumni Gift'],
    'Tournament Fees': ['Nairobi Open Entry Fees', 'Rapid Chess Tournament Fees'],
    'Other': ['T-Shirt Sales', 'Fine Collections']
  };

  // Generate dates starting from 5 months ago up to today
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 5);
  let currentDate = startDate;

  for (let i = 0; i < 25; i++) {
    const isIncome = Math.random() > 0.4;
    const type = isIncome ? 'income' : 'expense';
    const category = categories[type][Math.floor(Math.random() * categories[type].length)];
    const descList = descriptions[category as keyof typeof descriptions];
    const description = descList[Math.floor(Math.random() * descList.length)];
    const amount = Math.floor(Math.random() * 14500) + 500; // 500 to 15000
    
    // Distribute transactions across the 5 month span up to today
    currentDate = new Date(currentDate.getTime() + (Math.random() * 4 + 3) * 24 * 60 * 60 * 1000);
    if (currentDate > new Date()) {
      currentDate = new Date();
    }
    
    transactions.push({
      id: crypto.randomUUID(),
      description,
      amount,
      type,
      category,
      date: currentDate.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return transactions;
};

const initialMockTransactions = generateMockTransactions();

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      transactions: initialMockTransactions,
      receipts: [],
      auditLog: [],
      settings: {
        clubName: 'Kukisa Finance',
        currency: 'KES',
        theme: 'system',
        fyStartMonth: 1,
        pinEnabled: false,
        pin: '0000',
        sessionTimeoutMinutes: 5,
        lockoutUntil: null,
        failedAttempts: 0,
      },
      notes: '',
      notesSavedAt: null,
      sessionToken: null,

      addTransaction: (t) => set((state) => {
        const sanitizedDesc = t.description.replace(/<\/?[^>]+(>|$)/g, "");
        const newTx: Transaction = {
          ...t,
          description: sanitizedDesc,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const newLog: AuditEntry = {
          id: crypto.randomUUID(),
          action: 'transaction_added',
          details: `Added ${newTx.type} transaction: ${newTx.description} (${newTx.amount})`,
          timestamp: new Date().toISOString(),
        };
        return {
          transactions: [newTx, ...state.transactions],
          auditLog: [newLog, ...state.auditLog],
        };
      }),

      updateTransaction: (id, updates) => set((state) => {
        const index = state.transactions.findIndex(t => t.id === id);
        if (index === -1) return state;
        const oldTx = state.transactions[index];
        
        const sanitizedDesc = updates.description 
          ? updates.description.replace(/<\/?[^>]+(>|$)/g, "")
          : oldTx.description;

        const updatedTx = { 
          ...oldTx, 
          ...updates, 
          description: sanitizedDesc,
          updatedAt: new Date().toISOString() 
        };
        const newTransactions = [...state.transactions];
        newTransactions[index] = updatedTx;
        
        const newLog: AuditEntry = {
          id: crypto.randomUUID(),
          action: 'transaction_edited',
          details: `Edited transaction: ${updatedTx.description}`,
          timestamp: new Date().toISOString(),
        };
        
        return {
          transactions: newTransactions,
          auditLog: [newLog, ...state.auditLog],
        };
      }),

      deleteTransaction: (id) => set((state) => {
        const tx = state.transactions.find(t => t.id === id);
        if (!tx) return state;
        
        const newLog: AuditEntry = {
          id: crypto.randomUUID(),
          action: 'transaction_deleted',
          details: `Deleted transaction: ${tx.description}`,
          timestamp: new Date().toISOString(),
        };
        
        return {
          transactions: state.transactions.filter(t => t.id !== id),
          auditLog: [newLog, ...state.auditLog],
        };
      }),

      addReceipt: (r) => set((state) => {
        const newReceipt: Receipt = {
          ...r,
          id: crypto.randomUUID(),
          uploadedAt: new Date().toISOString(),
        };
        const newLog: AuditEntry = {
          id: crypto.randomUUID(),
          action: 'receipt_uploaded',
          details: `Uploaded receipt: ${newReceipt.filename}`,
          timestamp: new Date().toISOString(),
        };
        return {
          receipts: [newReceipt, ...state.receipts],
          auditLog: [newLog, ...state.auditLog],
        };
      }),

      deleteReceipt: (id) => set((state) => ({
        receipts: state.receipts.filter(r => r.id !== id)
      })),

      updateSettings: (updates) => set((state) => {
        const newLog: AuditEntry = {
          id: crypto.randomUUID(),
          action: 'settings_changed',
          details: `Updated settings`,
          timestamp: new Date().toISOString(),
        };
        return {
          settings: { ...state.settings, ...updates },
          auditLog: [newLog, ...state.auditLog],
        };
      }),

      saveNotes: (notes) => set(() => {
        const sanitizedNotes = notes.replace(/<\/?[^>]+(>|$)/g, "");
        return {
          notes: sanitizedNotes,
          notesSavedAt: new Date().toISOString(),
        };
      }),

      resetData: () => set(() => ({
        transactions: [],
        receipts: [],
        auditLog: [{
          id: crypto.randomUUID(),
          action: 'data_reset',
          details: 'All financial data was cleared',
          timestamp: new Date().toISOString(),
        }],
        notes: '',
        notesSavedAt: null,
      })),

      importData: (data) => set((state) => {
        if (!data || typeof data !== 'object') {
          alert('Invalid backup structure.');
          return state;
        }

        const validatedTransactions = Array.isArray(data.transactions)
          ? data.transactions.filter(t => 
              t && typeof t === 'object' && 
              typeof t.amount === 'number' && 
              typeof t.description === 'string' &&
              (t.type === 'income' || t.type === 'expense')
            )
          : state.transactions;

        const validatedReceipts = Array.isArray(data.receipts)
          ? data.receipts.filter(r => r && typeof r === 'object' && typeof r.filename === 'string')
          : state.receipts;

        const validatedSettings = data.settings && typeof data.settings === 'object'
          ? { ...state.settings, ...data.settings }
          : state.settings;

        const newLog: AuditEntry = {
          id: crypto.randomUUID(),
          action: 'data_imported',
          details: 'Successfully imported validated JSON data backup',
          timestamp: new Date().toISOString(),
        };

        return {
          ...state,
          transactions: validatedTransactions,
          receipts: validatedReceipts,
          settings: validatedSettings,
          notes: typeof data.notes === 'string' ? data.notes : state.notes,
          auditLog: [newLog, ...state.auditLog],
        };
      }),

      setPin: (pin) => set((state) => ({
        settings: { ...state.settings, pin }
      })),

      setPinEnabled: (pinEnabled) => set((state) => ({
        settings: { ...state.settings, pinEnabled }
      })),

      unlockVault: (pin) => {
        const state = get();
        const now = new Date();

        // 1. If currently locked out, reject immediately
        if (state.settings.lockoutUntil) {
          const lockoutTime = new Date(state.settings.lockoutUntil);
          if (now < lockoutTime) {
            return false;
          }
        }

        if (state.settings.pin === pin) {
          const token = crypto.randomUUID();
          set((state) => ({
            sessionToken: token,
            settings: { 
              ...state.settings, 
              failedAttempts: 0, 
              lockoutUntil: null 
            }
          }));
          return true;
        } else {
          // Increment failed attempts
          const newFailedAttempts = state.settings.failedAttempts + 1;
          let lockoutUntil = null;

          if (newFailedAttempts >= 3) {
            // Expiry is 5 minutes from now
            const blockExpiry = new Date(now.getTime() + 5 * 60 * 1000);
            lockoutUntil = blockExpiry.toISOString();
          }

          set((state) => ({
            settings: { 
              ...state.settings, 
              failedAttempts: newFailedAttempts, 
              lockoutUntil 
            }
          }));

          return false;
        }
      },

      lockVault: () => set(() => ({
        sessionToken: null
      })),

      refreshSession: () => {
        // Keeps active session
      }
    }),
    {
      name: 'clubvault-storage',
      partialize: (state) => {
        const { sessionToken, ...rest } = state;
        return rest;
      }
    }
  )
);
