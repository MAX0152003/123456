import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Command, 
  Calendar, 
  BookOpen, 
  User, 
  Settings, 
  HelpCircle, 
  Moon, 
  Sun, 
  QrCode, 
  Bell, 
  Volume2, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { ClassSession, Role } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  classes: ClassSession[];
  onSelectClass?: (cls: ClassSession) => void;
  userRole: Role;
  toggleDarkMode?: () => void;
  isDarkMode?: boolean;
  speakText?: (text: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  classes,
  onSelectClass,
  userRole,
  toggleDarkMode,
  isDarkMode,
  speakText
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          setQuery('');
          setSelectedIndex(0);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigationItems = [
    { id: 'dashboard', title: 'Dashboard & Overview', category: 'Navigation', icon: Command, action: () => { onNavigateTab('dashboard'); onClose(); } },
    { id: 'schedule', title: 'Timetable & Interactive Schedule Grid', category: 'Navigation', icon: Calendar, action: () => { onNavigateTab('schedule'); onClose(); } },
    { id: 'attendance', title: 'Attendance Log & QR Pass', category: 'Navigation', icon: QrCode, action: () => { onNavigateTab('attendance'); onClose(); } },
    { id: 'messages', title: 'Messages & Faculty Chat', category: 'Navigation', icon: Bell, action: () => { onNavigateTab('messages'); onClose(); } },
    { id: 'settings', title: 'System & Accessibility Settings', category: 'Navigation', icon: Settings, action: () => { onNavigateTab('settings'); onClose(); } },
    { id: 'help', title: 'Help & Knowledge Center', category: 'Navigation', icon: HelpCircle, action: () => { onNavigateTab('help'); onClose(); } },
  ];

  const actionItems = [
    { 
      id: 'theme-toggle', 
      title: isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme (2026 OLED)', 
      category: 'Preferences', 
      icon: isDarkMode ? Sun : Moon, 
      action: () => { 
        if (toggleDarkMode) toggleDarkMode(); 
        onClose(); 
      } 
    },
    { 
      id: 'read-aloud', 
      title: 'Voice Synthesizer Quick Test', 
      category: 'Accessibility', 
      icon: Volume2, 
      action: () => { 
        if (speakText) speakText("ClassPulse 2.0 Command Palette active. System operational."); 
        onClose(); 
      } 
    }
  ];

  const matchingClasses = classes
    .filter(cls => 
      (cls.name || '').toLowerCase().includes(query.toLowerCase()) || 
      (cls.code || '').toLowerCase().includes(query.toLowerCase()) ||
      (cls.facultyName || '').toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5)
    .map(cls => ({
      id: `class-${cls.id}`,
      title: `${cls.code}: ${cls.name}`,
      subtitle: `Room ${cls.room} • ${cls.days.join(', ')} (${cls.startTime} - ${cls.endTime})`,
      category: 'Enrolled Classes',
      icon: BookOpen,
      action: () => {
        if (onSelectClass) onSelectClass(cls);
        onClose();
      }
    }));

  const allFilteredItems = [
    ...navigationItems.filter(item => item.title.toLowerCase().includes(query.toLowerCase())),
    ...matchingClasses,
    ...actionItems.filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
  ];

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allFilteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allFilteredItems.length) % Math.max(1, allFilteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allFilteredItems[selectedIndex]) {
        allFilteredItems[selectedIndex].action();
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="w-full max-w-xl bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Input Header */}
          <div className="relative flex items-center px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
            <Search className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDownInInput}
              placeholder="Type a command, class code, or jump to tab..."
              className="w-full bg-transparent text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              autoFocus
            />
            <div className="flex items-center gap-1.5 ml-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                ESC
              </span>
              <button
                onClick={onClose}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2 divide-y divide-zinc-100 dark:divide-zinc-900/40">
            {allFilteredItems.length === 0 ? (
              <div className="py-10 text-center text-xs text-zinc-400 font-medium">
                No matching actions or classes found for "{query}".
              </div>
            ) : (
              allFilteredItems.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400'}`}>
                        <Icon className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{item.title}</span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase bg-zinc-100 dark:bg-zinc-900 text-zinc-400">
                            {item.category}
                          </span>
                        </div>
                        {'subtitle' in item && (
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-2" />}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[10px] text-zinc-400 font-medium">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-mono">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-mono">↵</kbd>
                Select
              </span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-3 h-3" />
              ClassPulse 2.0 Command Matrix
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
