import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { UploadCloud, File, Trash2 } from 'lucide-react';

export default function Receipts() {
  const { receipts, addReceipt, deleteReceipt } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      addReceipt({
        filename: file.name,
        dataUrl: e.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="page-title">Receipts</h1>
      </div>

      <div 
        className={`card border-dashed border-2 flex flex-col items-center justify-center py-12 transition-colors cursor-pointer ${isDragging ? 'border-primary bg-[#E6F1FB]' : 'border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud size={48} className="text-primary mb-4" />
        <h3 className="text-[16px] font-medium text-text-primary dark:text-white mb-1">Drag and drop receipts here</h3>
        <p className="text-[13px] text-text-secondary mb-4">Accepts JPG, PNG, PDF</p>
        <button className="btn-secondary pointer-events-none">Browse files</button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".jpg,.jpeg,.png,.pdf" 
          className="hidden" 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {receipts.map((r) => (
          <div key={r.id} className="card p-0 overflow-hidden flex flex-col group">
            <div className="h-[140px] bg-gray-100 dark:bg-gray-800 relative">
              {r.dataUrl.startsWith('data:image') ? (
                <img src={r.dataUrl} alt={r.filename} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <File size={40} className="text-text-tertiary" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={() => deleteReceipt(r.id)} className="bg-expense text-white p-2 rounded-full hover:bg-expense/80">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="p-3">
              <div className="text-[13px] font-medium text-text-primary dark:text-white truncate" title={r.filename}>
                {r.filename}
              </div>
              <div className="text-[11px] text-text-secondary mt-1">
                {format(new Date(r.uploadedAt), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        ))}
        {receipts.length === 0 && (
          <div className="col-span-full py-12 text-center flex flex-col items-center justify-center">
            <File size={48} className="text-text-tertiary opacity-50 mb-3" />
            <div className="text-text-secondary text-[14px]">Upload your first receipt</div>
          </div>
        )}
      </div>

    </div>
  );
}
