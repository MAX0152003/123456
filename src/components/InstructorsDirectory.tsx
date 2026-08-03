import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  X, 
  MessageSquare, 
  MapPin, 
  Sparkles, 
  Search, 
  Filter, 
  Calendar,
  ChevronRight,
  Bot
} from 'lucide-react';
import { ClassSession } from '../types';

interface FacultyStatus {
  id: string;
  name: string;
  avatar: string;
  room?: string;
  status: 'available' | 'in-class' | 'unavailable';
  dept?: string;
  consultationHours?: string;
  email?: string;
}

interface InstructorsDirectoryProps {
  classes?: ClassSession[];
  facultyStatuses?: FacultyStatus[];
  onMessageInstructor?: (id: string, name: string) => void;
  onOpenAdvisor?: () => void;
}

const DEFAULT_FACULTY: FacultyStatus[] = [
  {
    id: 'fac-1',
    name: 'Dr. Ahmad Khan',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    room: 'Science Lab 304',
    status: 'available',
    dept: 'Computer Science',
    consultationHours: 'MWF 10:00 AM - 12:00 PM',
    email: 'ahmad.khan@msu.edu.ph'
  },
  {
    id: 'fac-2',
    name: 'Prof. Maria Santos',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    room: 'Consulting Room 201',
    status: 'in-class',
    dept: 'Information Tech',
    consultationHours: 'TTh 1:00 PM - 3:30 PM',
    email: 'maria.santos@msu.edu.ph'
  },
  {
    id: 'fac-3',
    name: 'Dr. Ali Hassan',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=85&w=150',
    room: 'Engineering Hall 102',
    status: 'available',
    dept: 'Engineering Physics',
    consultationHours: 'Daily 2:00 PM - 4:00 PM',
    email: 'ali.hassan@msu.edu.ph'
  }
];

export const InstructorsDirectory: React.FC<InstructorsDirectoryProps> = ({
  classes,
  facultyStatuses,
  onMessageInstructor,
  onOpenAdvisor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'in-class'>('all');

  // Combine prop facultyStatuses with DEFAULT_FACULTY defaults
  const activeFacultyList: FacultyStatus[] = (facultyStatuses && facultyStatuses.length > 0)
    ? DEFAULT_FACULTY.map(defaultFac => {
        const liveMatch = facultyStatuses.find(f => f.id === defaultFac.id || f.name.toLowerCase() === defaultFac.name.toLowerCase());
        return liveMatch ? { ...defaultFac, status: liveMatch.status } : defaultFac;
      })
    : DEFAULT_FACULTY;

  const filteredFaculty = activeFacultyList.filter(fac => {
    const matchesSearch = fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (fac.dept || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (fac.room || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fac.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 rounded-3xl bg-linear-to-br from-white via-zinc-50/50 to-emerald-50/30 dark:from-zinc-950 dark:via-zinc-900/60 dark:to-emerald-950/20 border border-zinc-200/90 dark:border-zinc-800/90 shadow-lg space-y-5 text-left relative overflow-hidden backdrop-blur-xl">
      {/* Background Futuristic Glow Accent */}
      <div className="absolute top-0 right-1/4 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-xs">
            <Users className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base md:text-lg tracking-tight text-zinc-900 dark:text-zinc-100">
                Live Instructors Directory
              </h3>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Live Consultation Sync
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Real-time faculty location, consultation hours & direct messaging
            </p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Filter Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all' 
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'available' 
                  ? 'bg-emerald-500 text-black font-extrabold shadow-xs' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Available
            </button>
          </div>

          {onOpenAdvisor && (
            <button
              onClick={onOpenAdvisor}
              type="button"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Advisor</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search instructor by name, department, or office room..."
          className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 transition-all shadow-xs"
        />
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
      </div>

      {/* Grid of Instructors Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredFaculty.map((fac) => {
          const isAvailable = fac.status === 'available';
          const isInClass = fac.status === 'in-class';

          return (
            <motion.div
              key={fac.id}
              whileHover={{ y: -2 }}
              className="p-4 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-emerald-500/40 transition-all"
            >
              {/* Status Header Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={fac.avatar}
                      alt={fac.name}
                      className="w-11 h-11 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                      isAvailable ? 'bg-emerald-500 shadow-xs shadow-emerald-500' : isInClass ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-500 transition-colors">
                      {fac.name}
                    </h4>
                    <p className="text-[10px] font-semibold text-zinc-500 truncate">
                      {fac.dept}
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                  isAvailable 
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                    : isInClass 
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                      : 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                }`}>
                  {isAvailable ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      Available
                    </>
                  ) : isInClass ? (
                    <>
                      <Clock className="w-3 h-3 text-amber-500 animate-spin" />
                      In Class
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3 text-red-500" />
                      Away
                    </>
                  )}
                </span>
              </div>

              {/* Consultation Details */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-150 dark:border-zinc-800/60 text-[11px]">
                <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-bold truncate">{fac.room}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[10px]">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="font-medium truncate">{fac.consultationHours}</span>
                </div>
              </div>

              {/* Direct Message Action */}
              <button
                type="button"
                onClick={() => onMessageInstructor && onMessageInstructor(fac.id, fac.name)}
                className="w-full py-2 px-3 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-emerald-500 dark:hover:bg-emerald-500 text-white hover:text-black font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-98"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Instructor</span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default InstructorsDirectory;
