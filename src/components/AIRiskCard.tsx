import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  TrendingUp, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Bot
} from 'lucide-react';
import { UserProfile, AttendanceRecord, ClassSession, Role } from '../types';

interface AIRiskCardProps {
  role: Role;
  userProfile: UserProfile;
  attendanceRecords: AttendanceRecord[];
  classes: ClassSession[];
  onOpenAdvisor?: () => void;
}

export const AIRiskCard: React.FC<AIRiskCardProps> = ({
  role,
  userProfile,
  attendanceRecords,
  classes,
  onOpenAdvisor
}) => {
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [analysis, setAnalysis] = useState<{
    riskLevel: string;
    riskScore: number;
    keyObservation: string;
    recommendations: string[];
    predictedAttendanceTrend: string;
    anomalies: string[];
  } | null>(null);

  const runAiAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/attendance-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          userProfile,
          records: attendanceRecords,
          classes
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAnalysis(json.data);
      } else if (json.fallback) {
        setAnalysis(json.fallback);
      }
    } catch (err) {
      console.warn("AI Analysis offline fallback activated:", err);
      const myRecs = attendanceRecords.filter(
        r => r.studentId === userProfile.studentId || r.studentName === userProfile.name
      );
      const absents = myRecs.filter(r => r.status === 'absent').length;
      let score = Math.min(100, absents * 18);
      let level = 'Low';
      if (score >= 60) level = 'Critical';
      else if (score >= 40) level = 'High';
      else if (score >= 20) level = 'Medium';

      setAnalysis({
        riskLevel: level,
        riskScore: score,
        keyObservation: absents > 0 
          ? `Logged ${absents} total absences across ${classes.length} registered courses.`
          : 'Zero absences recorded! Perfect 100% compliance streak maintained.',
        recommendations: [
          'Maintain real-time QR check-in habit upon entering classroom.',
          'Review course timetable buffer times between back-to-back classes.',
          'Reach out to academic advisor if schedule conflicts arise.'
        ],
        predictedAttendanceTrend: absents > 2 ? 'At risk of academic probation if 2 more absences occur.' : 'Predicted 96%+ compliance through end of term.',
        anomalies: absents > 2 ? ['Multiple unexcused absences detected'] : []
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    runAiAnalysis();
  }, [classes.length, attendanceRecords.length]);

  const getRiskColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
      case 'high':
        return {
          bg: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
          badge: 'bg-red-500 text-white',
          meter: 'bg-red-500'
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-500 text-white',
          meter: 'bg-amber-500'
        };
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
          badge: 'bg-emerald-500 text-black font-extrabold',
          meter: 'bg-emerald-500'
        };
    }
  };

  const colors = getRiskColor(analysis?.riskLevel);

  return (
    <div className="p-3.5 px-4 rounded-2xl bg-linear-to-r from-white via-zinc-50/80 to-emerald-50/20 dark:from-zinc-950 dark:via-zinc-900/80 dark:to-emerald-950/20 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs relative overflow-hidden text-left backdrop-blur-xl transition-all">
      {/* Background Subtle AI Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Single-Line Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: AI Icon & Status */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-xs tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>PulseAI Risk Engine</span>
              </h4>

              {loading ? (
                <span className="text-[9px] font-bold text-emerald-500 animate-pulse">Analyzing...</span>
              ) : (
                <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-md font-mono font-bold ${colors.badge}`}>
                  {analysis?.riskLevel || 'Low'} Risk ({analysis?.riskScore || 0}/100)
                </span>
              )}
            </div>

            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              {analysis?.keyObservation || 'Analyzing real-time class compliance & patterns...'}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={runAiAnalysis}
            disabled={loading}
            type="button"
            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all cursor-pointer disabled:opacity-50"
            title="Re-run AI Analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {onOpenAdvisor && (
            <button
              onClick={onOpenAdvisor}
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[11px] shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask Advisor</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-[11px] transition-all cursor-pointer"
          >
            <span>{isExpanded ? 'Less' : 'Details'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Forecast & Recommendations Drawer */}
      <AnimatePresence>
        {isExpanded && analysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="pt-3.5 mt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Forecast Card */}
              <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1 text-left">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Attendance Forecast</span>
                </div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {analysis.predictedAttendanceTrend}
                </p>
              </div>

              {/* AI Recommendations */}
              <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1 text-left">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>AI Recommendations</span>
                </div>
                <ul className="space-y-1 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIRiskCard;
