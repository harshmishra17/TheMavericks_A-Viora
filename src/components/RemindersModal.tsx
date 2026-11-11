import React, { useState } from 'react';
import { Bell, Calendar, Clock, Plus, CheckCircle2, Circle, X, Info } from 'lucide-react';
import { ReminderItem } from '../types';

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: ReminderItem[];
  onCreateReminder: (title: string, dueDateTime: string, notes?: string) => Promise<void>;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({
  isOpen,
  onClose,
  reminders,
  onCreateReminder,
  onToggleComplete
}) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    setIsSubmitting(true);
    await onCreateReminder(title.trim(), new Date(dueDate).toISOString(), notes.trim());
    setIsSubmitting(false);
    setTitle('');
    setDueDate('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#14213D]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E8DFCF] space-y-5 max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8DFCF] pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#FF6B5B]" />
            <h2 className="font-display font-bold text-base text-[#14213D]">
              Placement Reminders & Deadlines
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#14213D]/50 hover:text-[#14213D] hover:bg-[#FAF7F2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persistence & Delivery Notice */}
        <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DFCF] text-xs text-[#14213D]/75 flex items-start gap-2">
          <Info className="w-4 h-4 text-[#FF6B5B] shrink-0 mt-0.5" />
          <p>
            <strong>Observable Notification Policy:</strong> Saved reminders persist in application storage. Active due banners appear within the app whenever a deadline is reached. Notice: Real-time background delivery requires this applet process to remain active.
          </p>
        </div>

        {/* List of reminders */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {reminders.length === 0 ? (
            <p className="text-xs text-[#14213D]/60 text-center py-6">
              No reminders scheduled. Create one below to stay ahead of campus placement deadlines.
            </p>
          ) : (
            reminders.map(rem => {
              const isDue = new Date(rem.dueDateTime) <= new Date();
              return (
                <div
                  key={rem.id}
                  className={`p-3.5 rounded-xl border transition-colors flex items-start justify-between gap-3 text-xs ${
                    rem.completed
                      ? 'bg-[#FAF7F2]/60 border-[#E8DFCF] opacity-60'
                      : isDue
                      ? 'bg-rose-50/70 border-rose-200'
                      : 'bg-white border-[#E8DFCF]'
                  }`}
                >
                  <button
                    onClick={() => onToggleComplete(rem.id, !rem.completed)}
                    className="mt-0.5 text-[#14213D]/70 hover:text-[#14213D]"
                  >
                    {rem.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#14213D]/40" />
                    )}
                  </button>

                  <div className="flex-1 space-y-1">
                    <div className={`font-semibold text-sm ${rem.completed ? 'line-through text-[#14213D]/50' : 'text-[#14213D]'}`}>
                      {rem.title}
                    </div>
                    {rem.notes && (
                      <p className="text-[11px] text-[#14213D]/70">{rem.notes}</p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] font-mono text-[#14213D]/60 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#FF6B5B]" />
                        {new Date(rem.dueDateTime).toLocaleDateString()} {new Date(rem.dueDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isDue && !rem.completed && (
                        <span className="text-rose-700 font-bold uppercase tracking-wider">Due now</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Create new reminder form */}
        <form onSubmit={handleSubmit} className="border-t border-[#E8DFCF] pt-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#14213D]">
            Set New Reminder
          </div>
          <div className="space-y-2">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Practise attendance database explanation"
              className="w-full p-2.5 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] placeholder-[#64748B] focus:border-[#14213D] outline-hidden font-medium"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="datetime-local"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] font-mono focus:border-[#14213D] outline-hidden font-medium"
                required
              />
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional notes..."
                className="w-full p-2.5 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] placeholder-[#64748B] focus:border-[#14213D] outline-hidden font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-[#E8DFCF] text-xs font-medium text-[#14213D]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !dueDate}
              className="px-4 py-1.5 rounded-lg bg-[#FF6B5B] hover:bg-[#E05A4A] text-[#14213D] font-bold text-xs uppercase tracking-wide transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
