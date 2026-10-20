import React, { useState } from 'react';
import { X, CheckCircle, Calendar, MessageSquare } from 'lucide-react';
import { BrandName } from './BrandName.tsx';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  initialMentor?: string;
  initialTier?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  theme,
  initialMentor,
  initialTier,
}) => {
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    targetYear: 'NEET 2025 (Class 12 / Dropper)',
    scoreRange: '450 - 550 marks',
    notes: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError('Please enter a valid 10-digit WhatsApp number.');
      return;
    }
    setError('');
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      name: '',
      phone: '',
      targetYear: 'NEET 2025 (Class 12 / Dropper)',
      scoreRange: '450 - 550 marks',
      notes: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl relative border ${
          isDark
            ? 'bg-[#0E0E10] border-zinc-800 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-lg text-zinc-500 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="mb-6">
              <div
                className={`text-xs font-mono font-bold uppercase tracking-wider mb-1 ${
                  isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'
                }`}
              >
                [ COMPLIMENTARY 1-ON-1 AUDIT ]
              </div>
              <h3 className="text-2xl font-extrabold uppercase tracking-tight">
                Schedule Your 30-Min AIR Strategy Call
              </h3>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  isDark ? 'text-zinc-400' : 'text-slate-500'
                }`}
              >
                {initialMentor
                  ? `Requesting a preliminary session with ${initialMentor}. We will confirm availability via WhatsApp.`
                  : initialTier
                    ? `Requesting a preliminary session in the ${initialTier} tier. We will confirm availability via WhatsApp.`
                    : 'Get a personalized 30-minute test paper review and gap diagnosis with an AIR mentor.'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block font-semibold mb-1 uppercase tracking-wider text-zinc-400">
                  Aspirant's Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Gupta"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-lg border focus:outline-none transition-all ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-600 focus:border-[#CCFF00]'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#0066FF]'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 uppercase tracking-wider text-zinc-400">
                  WhatsApp Contact Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-lg border focus:outline-none transition-all ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-600 focus:border-[#CCFF00]'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#0066FF]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 uppercase tracking-wider text-zinc-400">
                    Target NEET Session
                  </label>
                  <select
                    value={formData.targetYear}
                    onChange={(e) => setFormData({ ...formData, targetYear: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-white focus:border-[#CCFF00]'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#0066FF]'
                    }`}
                  >
                    <option value="NEET 2025 (Class 12)">NEET 2025 (Class 12)</option>
                    <option value="NEET 2025 (Repeater/Dropper)">NEET 2025 (Dropper)</option>
                    <option value="NEET 2026 (Class 11)">NEET 2026 (Class 11)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 uppercase tracking-wider text-zinc-400">
                    Current Mock Score Range
                  </label>
                  <select
                    value={formData.scoreRange}
                    onChange={(e) => setFormData({ ...formData, scoreRange: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-white focus:border-[#CCFF00]'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#0066FF]'
                    }`}
                  >
                    <option value="Under 450 marks">Under 450 marks</option>
                    <option value="450 - 550 marks">450 - 550 marks</option>
                    <option value="550 - 620 marks">550 - 620 marks</option>
                    <option value="620+ marks (Rank push)">620+ marks (AIR push)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 uppercase tracking-wider text-zinc-400">
                  Primary Challenge (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physics negative marks, Organic chemistry mechanisms"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-lg border focus:outline-none transition-all ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-600 focus:border-[#CCFF00]'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#0066FF]'
                  }`}
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg mt-4 active:scale-95 ${
                  isDark
                    ? 'bg-[#CCFF00] text-black hover:bg-[#b8e600]'
                    : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                }`}
              >
                Confirm Complimentary Strategy Slot
              </button>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center font-mono">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">Slot Requested!</h3>
            <p
              className={`text-xs mb-6 max-w-sm mx-auto font-sans leading-relaxed ${
                isDark ? 'text-zinc-400' : 'text-slate-600'
              }`}
            >
              Thank you, <span className="font-semibold">{formData.name}</span>. An{' '}
              <BrandName theme={theme} className="text-xs font-semibold" /> mentor will contact you on{' '}
              <span className="font-semibold">{formData.phone}</span> within 4 hours to coordinate your 30-min strategy audit.
            </p>

            <div
              className={`p-4 rounded-xl text-left text-xs space-y-1.5 mb-6 border ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Session: 30-Min 1-on-1 Mock Paper Audit</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#CCFF00]" />
                <span>Cohort: {formData.targetYear} ({formData.scoreRange})</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className={`w-full py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all ${
                isDark
                  ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              Done & Return to Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
