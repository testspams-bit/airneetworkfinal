import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Phone,
} from 'lucide-react';
import { type SessionRequest } from '../types/topper.ts';
import { getRequestsForStudent, subscribeToSessionChanges } from '../utils/sessionRequestStorage.ts';

interface StudentSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentEmail?: string;
  studentName?: string;
  theme: 'dark' | 'light';
}

export const StudentSessionsModal: React.FC<StudentSessionsModalProps> = ({
  isOpen,
  onClose,
  studentEmail,
  studentName,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [sessions, setSessions] = useState<SessionRequest[]>(() =>
    getRequestsForStudent(studentEmail)
  );

  useEffect(() => {
    if (isOpen) {
      setSessions(getRequestsForStudent(studentEmail));
    }
    const unsub = subscribeToSessionChanges(() => {
      setSessions(getRequestsForStudent(studentEmail));
    });
    return unsub;
  }, [isOpen, studentEmail]);

  if (!isOpen) return null;

  const confirmedSessions = sessions.filter((s) => s.status === 'confirmed');
  const pendingSessions = sessions.filter((s) => s.status === 'pending');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border p-5 sm:p-7 shadow-2xl relative transition-all my-auto ${
          isDark
            ? 'bg-[#101014] border-zinc-800 text-white shadow-black/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Aspirant Registered Account
              </div>
              <h2 className="text-xl font-black tracking-tight">
                My 1-on-1 Mentoring Sessions
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                : 'border-slate-200 bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {sessions.length === 0 ? (
          <div className="py-12 text-center space-y-3 font-mono">
            <Calendar className="w-10 h-10 mx-auto text-zinc-500" />
            <p className="text-xs text-zinc-400">No session reservations found for your account.</p>
            <p className="text-[11px] text-zinc-500">
              Book a strategy call with a verified All India Ranker to get personalized mentorship.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const isConfirmed = session.status === 'confirmed';

              return (
                <div
                  key={session.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isConfirmed
                      ? isDark
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                        : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                      : isDark
                      ? 'bg-zinc-900/60 border-zinc-800 text-zinc-200'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/40 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm sm:text-base">Mentor: {session.topperName}</span>
                      {session.topperAir && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold">
                          {session.topperAir}
                        </span>
                      )}
                    </div>

                    {/* LIVE STATUS REFLECTED FROM TOPPER CONFIRMATION */}
                    <div className="shrink-0">
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/25 border border-emerald-500/60 text-emerald-400 shadow-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Confirmed by Mentor</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 border border-amber-500/50 text-amber-300">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Awaiting Mentor Confirmation</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span><strong>Date:</strong> {session.requestedDate}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span><strong>Slot:</strong> {session.requestedSlotLabel}</span>
                    </div>

                    {session.doubtTopic && (
                      <div className="sm:col-span-2 text-[11px] font-sans p-2 rounded-xl bg-black/30 border border-zinc-800">
                        <strong className="text-emerald-400 font-mono">Doubt / Focus Area:</strong> {session.doubtTopic}
                      </div>
                    )}
                  </div>

                  {/* Confirmed Meeting Details & Link */}
                  {isConfirmed && session.meetingLink && (
                    <div className="mt-3.5 pt-3 border-t border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                        <Video className="w-4 h-4 shrink-0" />
                        <span>Google Meet Call Ready:</span>
                      </div>

                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all cursor-pointer shadow-sm self-start sm:self-auto"
                      >
                        <span>Join 1-on-1 Call</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {!isConfirmed && (
                    <div className="mt-2.5 text-[11px] text-zinc-400 font-sans italic">
                      Your mentor has received your ₹1 slot reservation and will confirm the session time shortly.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
