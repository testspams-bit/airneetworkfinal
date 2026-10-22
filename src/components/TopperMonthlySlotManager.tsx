import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  Zap,
  Save,
  Check,
  ChevronRight,
  Info,
  CalendarCheck,
  RotateCcw,
} from 'lucide-react';
import {
  type DaySlotAvailability,
  type MonthlyAvailability,
} from '../types/topper.ts';
import {
  STANDARD_SLOTS,
  saveMonthlyAvailability,
} from '../utils/topperStorage.ts';

interface TopperMonthlySlotManagerProps {
  availability: MonthlyAvailability;
  onSave: (updated: MonthlyAvailability) => void;
  theme: 'dark' | 'light';
}

export const TopperMonthlySlotManager: React.FC<TopperMonthlySlotManagerProps> = ({
  availability,
  onSave,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [data, setData] = useState<MonthlyAvailability>(availability);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const dates = Object.keys(availability.days).sort();
    return dates[0] || '';
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const dates = Object.keys(data.days).sort();
  const selectedDay = data.days[selectedDateStr] || (dates[0] ? data.days[dates[0]] : null);

  // Total slot count across all days
  const totalSlotsCount = Object.values(data.days).reduce(
    (acc, day) => acc + day.enabledSlots.length,
    0
  );
  const activeDaysCount = Object.values(data.days).filter(
    (day) => day.enabledSlots.length > 0
  ).length;

  // Toggle a single slot on a specific day
  const toggleSlot = (dateStr: string, slotId: string) => {
    setData((prev) => {
      const currentDay = prev.days[dateStr];
      if (!currentDay) return prev;
      const isAlready = currentDay.enabledSlots.includes(slotId);
      const newSlots = isAlready
        ? currentDay.enabledSlots.filter((id) => id !== slotId)
        : [...currentDay.enabledSlots, slotId];

      const updatedDay: DaySlotAvailability = {
        ...currentDay,
        enabledSlots: newSlots,
      };

      return {
        ...prev,
        days: {
          ...prev.days,
          [dateStr]: updatedDay,
        },
      };
    });
  };

  // Bulk presets
  const applyPreset = (presetType: 'weekday_evenings' | 'weekends_heavy' | 'all_nights' | 'clear_all') => {
    setData((prev) => {
      const updatedDays: Record<string, DaySlotAvailability> = {};
      Object.entries(prev.days).forEach(([dStr, day]) => {
        let slots = [...day.enabledSlots];
        if (presetType === 'weekday_evenings') {
          slots = day.isWeekend ? ['m1', 'e1'] : ['e1', 'n1'];
        } else if (presetType === 'weekends_heavy') {
          slots = day.isWeekend ? ['m1', 'm2', 'e1', 'e2', 'n1'] : ['n1'];
        } else if (presetType === 'all_nights') {
          slots = ['n1', 'n2'];
        } else if (presetType === 'clear_all') {
          slots = [];
        }
        updatedDays[dStr] = { ...day, enabledSlots: slots };
      });
      return { ...prev, days: updatedDays };
    });
  };

  // Toggle entire day on / off
  const toggleAllSlotsForDay = (dateStr: string) => {
    setData((prev) => {
      const currentDay = prev.days[dateStr];
      if (!currentDay) return prev;
      const shouldClear = currentDay.enabledSlots.length > 0;
      const newSlots = shouldClear ? [] : STANDARD_SLOTS.map((s) => s.id);
      return {
        ...prev,
        days: {
          ...prev.days,
          [dateStr]: {
            ...currentDay,
            enabledSlots: newSlots,
          },
        },
      };
    });
  };

  const handleSave = () => {
    const updated = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveMonthlyAvailability(updated);
    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header with stats and instant publish action */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all ${
          isDark
            ? 'bg-[#121217] border-zinc-800 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-[#CCFF00]" />
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#CCFF00]">
                30-Day Monthly Availability Matrix
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Select Your Free Mentoring Slots
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Tell aspirants when you are available for 1-on-1 strategy calls over the next 30 days. You can adjust or reschedule anytime directly from your dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`px-3 py-2 rounded-xl border text-center font-mono ${
                isDark ? 'bg-zinc-900/80 border-zinc-700' : 'bg-slate-100 border-slate-300'
              }`}
            >
              <div className="text-lg font-black text-[#CCFF00] leading-none">
                {totalSlotsCount}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-zinc-400 mt-0.5">
                Total Slots · {activeDaysCount} Days
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md active:scale-95 ${
                savedSuccess
                  ? 'bg-emerald-500 text-black'
                  : isDark
                  ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
                  : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Availability Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save & Publish Slots</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Batch Presets */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mr-1 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Quick Presets:
          </span>

          <button
            type="button"
            onClick={() => applyPreset('weekday_evenings')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              isDark
                ? 'bg-zinc-900/90 border-zinc-700 text-zinc-300 hover:border-purple-400 hover:text-white'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:border-blue-500'
            }`}
          >
            Weekday Evenings (6 PM & 9 PM)
          </button>

          <button
            type="button"
            onClick={() => applyPreset('weekends_heavy')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              isDark
                ? 'bg-zinc-900/90 border-zinc-700 text-zinc-300 hover:border-sky-400 hover:text-white'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:border-blue-500'
            }`}
          >
            Heavy Weekends (Mornings & Evenings)
          </button>

          <button
            type="button"
            onClick={() => applyPreset('all_nights')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              isDark
                ? 'bg-zinc-900/90 border-zinc-700 text-zinc-300 hover:border-[#CCFF00] hover:text-white'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:border-blue-500'
            }`}
          >
            Night Shifts (9 PM – 11:15 PM)
          </button>

          <button
            type="button"
            onClick={() => applyPreset('clear_all')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              isDark
                ? 'bg-red-950/20 border-red-900/40 text-red-300 hover:bg-red-900/40'
                : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
            }`}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Main 2-Column Interface: Left 30-Day Strip / Calendar, Right Day Slot Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 30 Days Calendar Grid */}
        <div
          className={`lg:col-span-7 p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#CCFF00]" />
              <span>Next 30 Days (Click Day to Customize)</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">
              Green indicator = Active slots
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
            {dates.map((dStr) => {
              const day = data.days[dStr];
              const isSelected = selectedDateStr === dStr;
              const hasSlots = day.enabledSlots.length > 0;

              return (
                <button
                  key={dStr}
                  type="button"
                  onClick={() => setSelectedDateStr(dStr)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[72px] relative ${
                    isSelected
                      ? isDark
                        ? 'bg-purple-900/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] ring-2 ring-purple-400/50'
                        : 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-400/50'
                      : hasSlots
                      ? isDark
                        ? 'bg-zinc-900/60 border-zinc-700/80 hover:border-zinc-500'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      : isDark
                      ? 'bg-black/30 border-zinc-800/60 text-zinc-500 hover:border-zinc-700'
                      : 'bg-slate-100/50 border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`text-[9px] font-mono uppercase font-bold ${
                      day.isWeekend ? 'text-amber-400' : 'text-zinc-400'
                    }`}
                  >
                    {day.dayOfWeek}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold leading-tight">
                    {day.displayDate.split(' ')[0]}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400 leading-none">
                    {day.displayDate.split(' ')[1]}
                  </span>

                  {/* Slot indicator pill */}
                  <div className="mt-1 flex items-center justify-center">
                    {hasSlots ? (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {day.enabledSlots.length} slots
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-600">Off</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Slot Editor for Selected Day */}
        <div
          className={`lg:col-span-5 p-5 sm:p-6 rounded-2xl border transition-all ${
            isDark ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {selectedDay ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black tracking-tight">
                      {selectedDay.dayOfWeek}, {selectedDay.displayDate}
                    </span>
                    {selectedDay.isWeekend && (
                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30">
                        Weekend
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {selectedDay.enabledSlots.length} slots currently marked available
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleAllSlotsForDay(selectedDay.dateStr)}
                  className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    selectedDay.enabledSlots.length > 0
                      ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
                      : 'bg-[#CCFF00]/20 text-[#CCFF00] border-[#CCFF00]/40 hover:bg-[#CCFF00]/30'
                  }`}
                >
                  {selectedDay.enabledSlots.length > 0 ? 'Clear Day' : 'Select All'}
                </button>
              </div>

              {/* Time Slots List */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                  Click slot chips to toggle availability:
                </span>

                {STANDARD_SLOTS.map((slot) => {
                  const isEnabled = selectedDay.enabledSlots.includes(slot.id);

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => toggleSlot(selectedDay.dateStr, slot.id)}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                        isEnabled
                          ? isDark
                            ? 'bg-emerald-950/30 border-emerald-500/60 text-white shadow-sm'
                            : 'bg-emerald-50 border-emerald-400 text-emerald-950'
                          : isDark
                          ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isEnabled
                              ? 'bg-emerald-500 border-emerald-400 text-black'
                              : 'border-zinc-700 bg-transparent'
                          }`}
                        >
                          {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs font-mono font-bold tracking-tight">
                            {slot.label}
                          </div>
                          <div className="text-[10px] uppercase font-mono tracking-wider opacity-60">
                            {slot.period} slot (60 mins)
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                          isEnabled
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'text-zinc-500'
                        }`}
                      >
                        {isEnabled ? 'Open for Booking' : 'Unavailable'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Advisory note */}
              <div
                className={`p-3 rounded-xl border text-[11px] font-mono flex items-start gap-2 ${
                  isDark
                    ? 'bg-purple-950/20 border-purple-900/40 text-purple-300'
                    : 'bg-purple-50 border-purple-200 text-purple-900'
                }`}
              >
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Aspirants reserve slots with a ₹1 priority token. Our team coordinates directly on WhatsApp before confirming the Google Meet video session.
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-zinc-500 font-mono text-xs">
              Select a day on the left to configure time slots.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
