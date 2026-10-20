import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  PhoneCall,
  Clock,
  User,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Send,
} from 'lucide-react';

interface GetInTouchModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const GetInTouchModal: React.FC<GetInTouchModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [view, setView] = useState<'options' | 'callback-form' | 'success'>('options');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'NEET Aspirant (Class 12 / Dropper)',
    preferredTime: 'Evening (5:00 PM - 8:00 PM)',
    note: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setView('options');
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmitCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setView('success');
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-2xl p-5 sm:p-6 shadow-2xl relative border transition-all ${
          isDark
            ? 'bg-[#111114] border-zinc-800 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors cursor-pointer ${
            isDark
              ? 'text-zinc-500 hover:text-white hover:bg-zinc-800'
              : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
          }`}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* View 1: Main Options (WhatsApp, Mobile Number, Request Callback) */}
        {view === 'options' && (
          <div>
            <div className="mb-5 pr-6">
              <h3 className="text-xl font-bold tracking-tight mb-1">Get in Touch</h3>
              <p className="text-xs text-zinc-400 font-mono">
                Connect directly with the air.neetwork mentorship team
              </p>
            </div>

            <div className="flex items-center justify-between px-6 mb-5">
              {/* Option 1: WhatsApp */}
              <a
                href="https://wa.me/919876543210?text=Hello%20AIR%20NEETwork,%20I%20would%20like%20to%20inquire%20about%20NEET%20mentorship."
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact us on WhatsApp"
                title="WhatsApp"
                className="flex cursor-pointer flex-col items-center gap-1.5 p-2 text-[#25D366] transition-transform hover:scale-110"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                <span className="text-base font-semibold">WhatsApp</span>
              </a>

              {/* Option 2: Mobile Number Call */}
              <a
                href="tel:+919876543210"
                aria-label="Call us"
                title="Call"
                className={`flex cursor-pointer flex-col items-center gap-1.5 p-2 transition-transform hover:scale-110 ${isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'}`}
              >
                <Phone className="h-8 w-8" aria-hidden="true" />
                <span className="text-base font-semibold">Call</span>
              </a>
            </div>

            {/* Extra Button: Request a Callback */}
            <div>
              <div className="mb-3 flex items-center gap-3 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                <span className="h-px flex-1 bg-zinc-700/60" />
                <span>or</span>
                <span className="h-px flex-1 bg-zinc-700/60" />
              </div>
              <button
                type="button"
                onClick={() => setView('callback-form')}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  isDark
                    ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33] active:scale-98'
                    : 'bg-[#0066FF] text-white hover:bg-[#0052cc] active:scale-98'
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                <span>Request a callback</span>
              </button>
            </div>
          </div>
        )}

        {/* View 2: Request a Callback Form */}
        {view === 'callback-form' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setView('options')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Back to options"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-lg font-bold">Request a callback</h3>
                <p className="text-xs text-zinc-400 font-mono">Our mentor advisor will call you</p>
              </div>
            </div>

            <form onSubmit={handleSubmitCallback} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono font-medium text-zinc-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none ${
                    isDark
                      ? 'bg-zinc-900/90 border-zinc-800 text-white focus:border-[#CCFF00]'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0066FF]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-zinc-400 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none ${
                    isDark
                      ? 'bg-zinc-900/90 border-zinc-800 text-white focus:border-[#CCFF00]'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0066FF]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-400 mb-1">
                    Student Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-2.5 py-2 rounded-xl text-xs font-mono border focus:outline-none ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-800 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option>NEET Class 11</option>
                    <option>NEET Class 12</option>
                    <option>Dropper / Repeater</option>
                    <option>Parent Inquiry</option>
                    <option>MBBS Abroad Guidance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-400 mb-1">
                    Preferred Time
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className={`w-full px-2.5 py-2 rounded-xl text-xs font-mono border focus:outline-none ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-800 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option>Morning (10:00 AM - 1:00 PM)</option>
                    <option>Afternoon (2:00 PM - 5:00 PM)</option>
                    <option>Evening (5:00 PM - 8:00 PM)</option>
                    <option>Anytime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-zinc-400 mb-1">
                  Optional Note / Query
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us about your current score or questions..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none resize-none ${
                    isDark
                      ? 'bg-zinc-900/90 border-zinc-800 text-white focus:border-[#CCFF00]'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0066FF]'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer mt-3 ${
                  isDark
                    ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
                    : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                }`}
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Callback Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* View 3: Success Confirmation */}
        {view === 'success' && (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-1">Callback Request Received!</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-6">
              Thank you, <strong className="text-white">{formData.name}</strong>. Our academic team will call you on <strong className="text-white">{formData.phone}</strong> during <span className="text-emerald-400">{formData.preferredTime}</span>.
            </p>
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition cursor-pointer ${
                isDark ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
