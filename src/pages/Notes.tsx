import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { Save } from 'lucide-react';

export default function Notes() {
  const { notes, notesSavedAt, saveNotes, currentUser } = useStore();
  const [localNotes, setLocalNotes] = useState(notes);
  const [isSaving, setIsSaving] = useState(false);
  const isViewOnly = currentUser?.accessLevel === 'view_only';

  // Use refs to keep the latest values accessible in the unmount cleanup effect
  const localNotesRef = useRef(localNotes);
  const originalNotesRef = useRef(notes);

  useEffect(() => {
    setLocalNotes(notes);
    originalNotesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    localNotesRef.current = localNotes;
  }, [localNotes]);

  // Handle manual saving or autosave on blur
  const triggerSave = (textToSave: string) => {
    if (isViewOnly) return;
    if (textToSave !== originalNotesRef.current) {
      setIsSaving(true);
      saveNotes(textToSave);
      setTimeout(() => setIsSaving(false), 500); // UI feedback
    }
  };

  const handleBlur = () => {
    triggerSave(localNotes);
  };

  // Autosave on component unmount (when clicking other router links)
  useEffect(() => {
    return () => {
      if (isViewOnly) return;
      if (localNotesRef.current !== originalNotesRef.current) {
        saveNotes(localNotesRef.current);
      }
    };
  }, [saveNotes, isViewOnly]);

  return (
    <div className="flex flex-col gap-4 animate-fade-in h-full">
      <div className="card flex flex-col flex-1 min-h-[400px]">
        <textarea
          className="w-full flex-1 bg-transparent border-none resize-none outline-none text-[14px] text-text-primary dark:text-white leading-relaxed"
          placeholder={isViewOnly ? "No notes recorded." : "Jot down important notes, reminders, or context for upcoming committee meetings..."}
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          onBlur={handleBlur}
          readOnly={isViewOnly}
        ></textarea>
        
        <div className="border-t border-border-light dark:border-border-dark mt-4 pt-4 flex justify-between items-center text-[12px] text-text-tertiary">
          <div className="flex items-center gap-2">
            <Save size={14} className={isSaving ? "text-primary animate-pulse" : ""} />
            {isSaving ? "Saving..." : notesSavedAt ? `Last saved: ${format(new Date(notesSavedAt), 'MMM dd, h:mm a')}` : "Not saved yet"}
          </div>
          <div>
            {localNotes.length} characters
          </div>
        </div>
      </div>
    </div>
  );
}
