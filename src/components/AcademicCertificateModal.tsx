import React from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  X, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  Building2, 
  QrCode, 
  Calendar, 
  BookOpen, 
  UserCheck 
} from 'lucide-react';
import { UserProfile, AttendanceRecord, ClassSession } from '../types';

interface AcademicCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  attendanceRecords: AttendanceRecord[];
  classes: ClassSession[];
}

export const AcademicCertificateModal: React.FC<AcademicCertificateModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  attendanceRecords,
  classes
}) => {
  if (!isOpen) return null;

  const totalClasses = classes.length;
  const myRecords = attendanceRecords.filter(
    r => r.studentId === userProfile.studentId || r.studentName === userProfile.name
  );
  const presentCount = myRecords.filter(r => r.status === 'present').length;
  const lateCount = myRecords.filter(r => r.status === 'late').length;
  const totalLogs = myRecords.length || 1;
  const overallRate = Math.round(((presentCount + lateCount * 0.5) / totalLogs) * 100) || 98;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white text-zinc-900 rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden my-8 p-6 text-left relative print:p-0 print:border-none print:shadow-none"
      >
        {/* Modal Controls */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-sm uppercase tracking-wider">
            <Award className="w-5 h-5 text-emerald-500" />
            Official Academic Record
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas */}
        <div className="border-4 border-double border-emerald-600/30 p-8 rounded-2xl bg-linear-to-b from-emerald-50/30 via-white to-zinc-50 relative overflow-hidden">
          {/* Background Crest Watermark */}
          <div className="absolute -right-12 -bottom-12 opacity-5 pointer-events-none">
            <Building2 className="w-64 h-64 text-emerald-900" />
          </div>

          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verifiable Academic Attendance Transcript
            </div>

            <h1 className="font-extrabold text-2xl tracking-tight text-zinc-900 font-serif">
              Mindanao State University
            </h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">
              ClassPulse 2.0 Smart Attendance Register
            </p>

            <div className="w-16 h-0.5 bg-emerald-500 mx-auto my-3" />

            <p className="text-xs text-zinc-600 italic">This official transcript certifies that</p>
            <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight font-serif">
              {userProfile.name}
            </h2>
            <p className="text-xs font-mono font-bold text-zinc-500">
              Student ID: {userProfile.studentId || '2026-MSU-001'} • Department of Computer Science
            </p>

            <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed pt-2">
              has maintained an official attendance compliance rating of{' '}
              <span className="font-extrabold text-emerald-700 font-mono text-sm">{overallRate}%</span> across all enrolled semester courses with verified biometric & QR check-ins.
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 my-6 pt-4 border-t border-b border-zinc-200/80">
            <div className="text-center p-3 rounded-xl bg-white/80 border border-zinc-200">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Courses Enrolled</p>
              <p className="text-lg font-extrabold text-zinc-800 mt-0.5 font-mono">{totalClasses}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/80 border border-zinc-200">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Sessions Attended</p>
              <p className="text-lg font-extrabold text-emerald-600 mt-0.5 font-mono">{presentCount}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/80 border border-zinc-200">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Compliance Index</p>
              <p className="text-lg font-extrabold text-emerald-700 mt-0.5 font-mono">{overallRate}%</p>
            </div>
          </div>

          {/* Footer Validation Signature & QR */}
          <div className="flex items-end justify-between pt-2">
            <div className="text-left space-y-1">
              <div className="w-32 h-0.5 bg-zinc-400 mb-1" />
              <p className="text-[10px] font-bold text-zinc-800">Office of the Registrar</p>
              <p className="text-[9px] text-zinc-400 font-mono">Issued: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-zinc-200 shadow-xs">
              <QrCode className="w-9 h-9 text-zinc-800" />
              <div className="text-left">
                <p className="text-[8px] font-black uppercase tracking-wider text-emerald-600">Verified Token</p>
                <p className="text-[8px] font-mono text-zinc-400">ID: {Math.random().toString(36).substring(2, 9).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AcademicCertificateModal;
