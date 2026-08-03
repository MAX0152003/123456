import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Filter, 
  Calendar, 
  Grid, 
  List, 
  Edit2, 
  Trash2, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { ClassSession } from '../types';
import { detectAllClassConflicts, ClassConflictItem, parseTimeToMinutes } from '../lib/conflictUtils';

interface WeeklyScheduleGridProps {
  classes: ClassSession[];
  onSelectClass?: (cls: ClassSession) => void;
  onEditClass?: (cls: ClassSession) => void;
  onDeleteClass?: (id: string, code: string) => void;
  onAddNewClass?: () => void;
  userRole?: 'admin' | 'faculty' | 'student';
}

const DAYS_OF_WEEK = [
  { key: 'Mon', full: 'Monday', short: 'M' },
  { key: 'Tue', full: 'Tuesday', short: 'T' },
  { key: 'Wed', full: 'Wednesday', short: 'W' },
  { key: 'Thu', full: 'Thursday', short: 'Th' },
  { key: 'Fri', full: 'Friday', short: 'F' },
  { key: 'Sat', full: 'Saturday', short: 'S' }
];

const TIME_SLOTS = [
  '07:00 AM',
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM'
];

/**
 * Maps class days array (e.g. ['MW'], ['TTh'], ['Mon', 'Wed']) to individual day keys.
 */
function expandClassDays(days: string[]): string[] {
  const result = new Set<string>();
  (days || []).forEach(d => {
    const uppercase = d.trim().toUpperCase();
    if (uppercase === 'MW') {
      result.add('Mon');
      result.add('Wed');
    } else if (uppercase === 'TTH') {
      result.add('Tue');
      result.add('Thu');
    } else if (uppercase.includes('MON') || uppercase === 'M') {
      result.add('Mon');
    } else if (uppercase.includes('TUE') || uppercase === 'T') {
      result.add('Tue');
    } else if (uppercase.includes('WED') || uppercase === 'W') {
      result.add('Wed');
    } else if (uppercase.includes('THU') || uppercase === 'TH') {
      result.add('Thu');
    } else if (uppercase.includes('FRI') || uppercase === 'F') {
      result.add('Fri');
    } else if (uppercase.includes('SAT') || uppercase === 'S') {
      result.add('Sat');
    } else if (uppercase.includes('SUN') || uppercase === 'A') {
      result.add('Sun');
    }
  });
  return Array.from(result);
}

export const WeeklyScheduleGrid: React.FC<WeeklyScheduleGridProps> = ({
  classes,
  onSelectClass,
  onEditClass,
  onDeleteClass,
  onAddNewClass,
  userRole = 'admin'
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('grid');
  const [filterConflictsOnly, setFilterConflictsOnly] = useState(false);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  // Run Conflict Checker Engine
  const conflictMap = useMemo(() => {
    return detectAllClassConflicts(classes);
  }, [classes]);

  const conflictingClassIds = useMemo(() => {
    return Object.keys(conflictMap);
  }, [conflictMap]);

  const totalConflictsCount = conflictingClassIds.length;

  // Filtered classes according to conflict filter and day filter
  const displayedClasses = useMemo(() => {
    return classes.filter(cls => {
      if (filterConflictsOnly && !conflictMap[cls.id]) {
        return false;
      }
      if (selectedDayFilter !== 'all') {
        const classDays = expandClassDays(cls.days);
        if (!classDays.includes(selectedDayFilter)) {
          return false;
        }
      }
      return true;
    });
  }, [classes, filterConflictsOnly, selectedDayFilter, conflictMap]);

  // Helper to check if a class falls into a specific day and time slot hour
  const getClassInSlot = (dayKey: string, timeSlot: string) => {
    const slotMin = parseTimeToMinutes(timeSlot);
    const slotMinEnd = slotMin + 60;

    return classes.filter(cls => {
      const classDays = expandClassDays(cls.days);
      if (!classDays.includes(dayKey)) return false;

      const classStartMin = parseTimeToMinutes(cls.startTime);
      const classEndMin = parseTimeToMinutes(cls.endTime);

      // Overlap with slot hour
      return classStartMin < slotMinEnd && classEndMin > slotMin;
    });
  };

  return (
    <div className="space-y-4 text-left">
      {/* Top Controls Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-850 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                Schedule Timetable & Conflict Checker
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Visual interactive calendar grid with real-time double-booking overlap detection
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Weekly Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Card List</span>
              </button>
            </div>

            {/* Conflict Filter Toggle */}
            <button
              type="button"
              onClick={() => setFilterConflictsOnly(!filterConflictsOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer border ${
                filterConflictsOnly
                  ? 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400 ring-2 ring-red-500/20'
                  : totalConflictsCount > 0
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                  : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${totalConflictsCount > 0 ? 'text-red-500 animate-bounce' : ''}`} />
              <span>
                {filterConflictsOnly ? 'Showing Conflicts Only' : `Conflict Checker (${totalConflictsCount})`}
              </span>
            </button>
          </div>
        </div>

        {/* Conflict Warning Alert Banner */}
        {totalConflictsCount > 0 ? (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-500/15 via-amber-500/10 to-transparent border border-red-500/30 text-left flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-red-600 dark:text-red-400 uppercase tracking-wider">
                  ⚠️ {totalConflictsCount} Scheduling Collision{totalConflictsCount > 1 ? 's' : ''} Detected
                </span>
                <span className="text-[10px] text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                  Red Glow Highlight Active
                </span>
              </div>
              <p className="text-[11px] text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed">
                Overlapping class sessions share either the same lecture room or the same faculty member at conflicting times. 
                Hover or tap any red glowing box in the grid to view exact collision details.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-left flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Zero Scheduling Conflicts Detected. All course timetables, faculty assignments, and rooms are cleanly allocated.</span>
          </div>
        )}
      </div>

      {/* VIEW MODE 1: WEEKLY TIMETABLE GRID */}
      {viewMode === 'grid' && (
        <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-850 rounded-2xl p-4 shadow-xs overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Grid Days Header */}
            <div className="grid grid-cols-7 gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-850 text-center select-none">
              <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-emerald-500" />
                <span>Time</span>
              </div>
              {DAYS_OF_WEEK.map(day => (
                <div 
                  key={day.key} 
                  className={`p-2 rounded-xl text-xs font-black uppercase tracking-wider border ${
                    selectedDayFilter === day.key
                      ? 'bg-emerald-500 text-black border-emerald-500'
                      : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-150 dark:border-zinc-850 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span className="hidden sm:inline">{day.full}</span>
                  <span className="sm:hidden">{day.short}</span>
                </div>
              ))}
            </div>

            {/* Time Slot Rows */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-900/60 mt-2">
              {TIME_SLOTS.map(slot => (
                <div key={slot} className="grid grid-cols-7 gap-2 py-2 min-h-[85px] items-stretch">
                  {/* Time Label Column */}
                  <div className="flex flex-col items-center justify-center p-1 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl border border-zinc-100 dark:border-zinc-850/50 text-[10px] font-mono font-bold text-zinc-500">
                    <span>{slot}</span>
                  </div>

                  {/* Day Slots */}
                  {DAYS_OF_WEEK.map(day => {
                    const classesInSlot = getClassInSlot(day.key, slot);
                    
                    if (classesInSlot.length === 0) {
                      return (
                        <div 
                          key={day.key} 
                          className="p-2 rounded-xl border border-dashed border-zinc-150 dark:border-zinc-850/40 bg-zinc-50/30 dark:bg-zinc-900/10 flex items-center justify-center text-[10px] text-zinc-300 dark:text-zinc-700 hover:border-emerald-500/30 transition-colors"
                        >
                          <span className="opacity-0 hover:opacity-100 text-[9px] font-bold text-emerald-500">Open Slot</span>
                        </div>
                      );
                    }

                    return (
                      <div key={day.key} className="space-y-1.5 flex flex-col justify-start">
                        {classesInSlot.map(cls => {
                          const conflicts = conflictMap[cls.id] || [];
                          const hasConflict = conflicts.length > 0;
                          const isTooltipOpen = activeTooltipId === `${day.key}-${cls.id}`;

                          return (
                            <div
                              key={cls.id}
                              onClick={() => {
                                onSelectClass?.(cls);
                                setActiveTooltipId(isTooltipOpen ? null : `${day.key}-${cls.id}`);
                              }}
                              className={`p-2 rounded-xl relative transition-all cursor-pointer flex flex-col justify-between text-left group ${
                                hasConflict
                                  ? 'bg-red-500/15 dark:bg-red-950/40 border-2 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.35)] ring-2 ring-red-500/20 text-red-950 dark:text-red-100'
                                  : 'bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-500/60 text-zinc-900 dark:text-zinc-100'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${
                                    hasConflict ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                  }`}>
                                    {cls.code}
                                  </span>

                                  {hasConflict && (
                                    <span className="flex items-center gap-0.5 text-[8px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-500/20 px-1 py-0.5 rounded border border-red-500/30">
                                      <AlertTriangle className="w-2.5 h-2.5 text-red-500 animate-bounce" />
                                      CLASH
                                    </span>
                                  )}
                                </div>

                                <h4 className="text-[11px] font-extrabold tracking-tight mt-1 line-clamp-1 leading-tight">
                                  {cls.name}
                                </h4>
                              </div>

                              <div className="mt-2 pt-1 border-t border-zinc-200/50 dark:border-zinc-800/50 space-y-0.5 text-[9px] text-zinc-500 dark:text-zinc-400 font-mono">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                                  <span className="truncate font-bold">{cls.room}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                                  <span className="truncate">{cls.facultyName}</span>
                                </div>
                              </div>

                              {/* Warning Conflict Tooltip Popover */}
                              {hasConflict && (
                                <div className="mt-1.5 pt-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTooltipId(isTooltipOpen ? null : `${day.key}-${cls.id}`);
                                    }}
                                    className="w-full py-1 px-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <ShieldAlert className="w-2.5 h-2.5" />
                                    <span>View Conflict ({conflicts.length})</span>
                                  </button>
                                </div>
                              )}

                              {/* Tooltip Overlay Card */}
                              <AnimatePresence>
                                {isTooltipOpen && hasConflict && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute left-0 right-0 top-full mt-2 z-50 p-3 rounded-xl bg-zinc-900 dark:bg-zinc-950 text-white border-2 border-red-500 shadow-2xl space-y-2 text-left min-w-[220px]"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                                      <span className="text-[10px] font-black uppercase text-red-400 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3 text-red-500" />
                                        Scheduling Collision Warning
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setActiveTooltipId(null)}
                                        className="text-zinc-400 hover:text-white text-xs font-bold"
                                      >
                                        ×
                                      </button>
                                    </div>

                                    <div className="space-y-1.5">
                                      {conflicts.map((conf, idx) => (
                                        <div key={idx} className="p-2 rounded bg-red-950/60 border border-red-800/50 text-[10px]">
                                          <p className="font-extrabold text-red-300">{conf.message}</p>
                                          <p className="text-[9px] text-zinc-400 mt-0.5">
                                            Overlaps with <span className="text-white font-mono">{conf.conflictingClass.code}</span> ({conf.conflictingClass.name})
                                          </p>
                                        </div>
                                      ))}
                                    </div>

                                    <div className="pt-1 flex items-center justify-between gap-2">
                                      {onEditClass && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveTooltipId(null);
                                            onEditClass(cls);
                                          }}
                                          className="flex-1 py-1 px-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-[9px] font-black uppercase tracking-wider transition-all"
                                        >
                                          Edit & Fix Slot
                                        </button>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CARDS LIST WITH CONFLICT HIGHLIGHTS */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedClasses.map(cls => {
            const conflicts = conflictMap[cls.id] || [];
            const hasConflict = conflicts.length > 0;

            return (
              <div
                key={cls.id}
                onClick={() => onSelectClass?.(cls)}
                className={`p-5 rounded-2xl bg-white dark:bg-zinc-950 border shadow-xs flex flex-col justify-between h-48 transition-all cursor-pointer relative group ${
                  hasConflict
                    ? 'border-2 border-red-500 ring-2 ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.25)] bg-red-500/5'
                    : 'border-zinc-200 dark:border-zinc-850 hover:border-emerald-500/30'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-black uppercase ${
                      hasConflict ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {cls.code}
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {hasConflict && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                          Clash
                        </span>
                      )}
                      {onEditClass && (
                        <button
                          type="button"
                          onClick={() => onEditClass(cls)}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-emerald-500"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteClass && (
                        <button
                          type="button"
                          onClick={() => onDeleteClass(cls.id, cls.code)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {cls.name}
                  </h3>

                  {hasConflict && (
                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 space-y-1 text-left">
                      {conflicts.map((conf, idx) => (
                        <p key={idx} className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                          <Info className="w-3 h-3 text-red-500 shrink-0" />
                          <span>{conf.message}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-900 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-500" />
                      {cls.startTime} - {cls.endTime}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 font-bold text-[10px] uppercase">
                      {cls.days.join(', ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-zinc-400" />
                      {cls.facultyName}
                    </span>
                    <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                      {cls.room}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeeklyScheduleGrid;
