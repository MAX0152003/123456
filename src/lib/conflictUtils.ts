import { ClassSession, AttendanceRecord, LeaveRequest } from '../types';

/**
 * Converts time strings like "09:00 AM", "01:30 PM", or "14:30" to total minutes from midnight.
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3];
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  return 0;
}

/**
 * Normalizes day arrays to comparable sets (e.g. MW, TTh, S, A).
 */
export function normalizeDays(days: string[]): Set<string> {
  const set = new Set<string>();
  (days || []).forEach((d) => {
    const uppercase = d.trim().toUpperCase();
    if (uppercase.includes('M') || uppercase.includes('MON') || uppercase.includes('WED') || uppercase === 'MW') {
      set.add('MW');
    }
    if (uppercase.includes('T') || uppercase.includes('TH') || uppercase.includes('TUE') || uppercase.includes('THU') || uppercase === 'TTH') {
      set.add('TTH');
    }
    if (uppercase.includes('SAT') || uppercase === 'S') {
      set.add('S');
    }
    if (uppercase.includes('SUN') || uppercase === 'A') {
      set.add('A');
    }
  });
  if (set.size === 0) set.add('MW');
  return set;
}

/**
 * Checks if two day sets share any overlapping class days.
 */
export function doDaysOverlap(days1: string[], days2: string[]): boolean {
  const set1 = normalizeDays(days1);
  const set2 = normalizeDays(days2);
  for (const day of set1) {
    if (set2.has(day)) return true;
  }
  return false;
}

/**
 * Checks if two time intervals [start1, end1] and [start2, end2] overlap.
 */
export function doTimesOverlap(startTime1: string, endTime1: string, startTime2: string, endTime2: string): boolean {
  const s1 = parseTimeToMinutes(startTime1);
  const e1 = parseTimeToMinutes(endTime1);
  const s2 = parseTimeToMinutes(startTime2);
  const e2 = parseTimeToMinutes(endTime2);

  // Overlap condition: start1 < end2 && start2 < end1
  return s1 < e2 && s2 < e1;
}

export interface ScheduleConflictResult {
  hasConflict: boolean;
  type: 'room_overlap' | 'faculty_overlap' | 'general' | 'none';
  conflictReason: string;
  conflictingClass?: ClassSession;
}

/**
 * Detects schedule collisions for classes (room double-booking, instructor double-booking).
 */
export function checkScheduleConflict(
  candidate: Partial<ClassSession>,
  existingClasses: ClassSession[],
  excludeClassId?: string
): ScheduleConflictResult {
  const candStart = candidate.startTime || '';
  const candEnd = candidate.endTime || '';

  if (!candStart || !candEnd || !candidate.days || candidate.days.length === 0) {
    return { hasConflict: false, type: 'none', conflictReason: '' };
  }

  for (const cls of existingClasses) {
    if (excludeClassId && cls.id === excludeClassId) continue;

    if (doDaysOverlap(candidate.days, cls.days)) {
      if (doTimesOverlap(candStart, candEnd, cls.startTime, cls.endTime)) {
        // Check Room Conflict
        if (candidate.room && cls.room && candidate.room.trim().toLowerCase() === cls.room.trim().toLowerCase()) {
          return {
            hasConflict: true,
            type: 'room_overlap',
            conflictReason: `Room ${cls.room} is already booked for ${cls.code} (${cls.name}) on ${cls.days.join(', ')} from ${cls.startTime} - ${cls.endTime}.`,
            conflictingClass: cls,
          };
        }

        // Check Faculty Conflict
        if (
          candidate.facultyName &&
          cls.facultyName &&
          candidate.facultyName.trim().toLowerCase() === cls.facultyName.trim().toLowerCase()
        ) {
          return {
            hasConflict: true,
            type: 'faculty_overlap',
            conflictReason: `Faculty member ${cls.facultyName} is already assigned to ${cls.code} (${cls.name}) from ${cls.startTime} - ${cls.endTime}.`,
            conflictingClass: cls,
          };
        }
      }
    }
  }

  return { hasConflict: false, type: 'none', conflictReason: '' };
}

export interface AttendanceConflictResult {
  hasConflict: boolean;
  conflictType: 'already_checked_in' | 'class_inactive' | 'invalid_code' | 'none';
  message: string;
  existingRecord?: AttendanceRecord;
}

/**
 * Detects attendance check-in conflicts (double check-in, duplicate entries).
 */
export function checkAttendanceConflict(
  studentId: string,
  classId: string,
  records: AttendanceRecord[],
  targetDate?: string
): AttendanceConflictResult {
  const dateStr = targetDate || new Date().toISOString().split('T')[0];

  const existing = records.find(
    (r) =>
      r.studentId === studentId &&
      r.classId === classId &&
      r.date === dateStr
  );

  if (existing) {
    return {
      hasConflict: true,
      conflictType: 'already_checked_in',
      message: `Attendance already recorded as "${existing.status}" at ${existing.time || 'earlier today'}.`,
      existingRecord: existing,
    };
  }

  return {
    hasConflict: false,
    conflictType: 'none',
    message: '',
  };
}

/**
 * Checks for overlapping leave request dates for the same student.
 */
export function checkLeaveConflict(
  studentId: string,
  startDate: string,
  endDate: string,
  existingLeaves: LeaveRequest[],
  excludeId?: string
): { hasConflict: boolean; message: string } {
  const reqStart = new Date(startDate).getTime();
  const reqEnd = new Date(endDate).getTime();

  for (const leave of existingLeaves) {
    if (excludeId && leave.id === excludeId) continue;
    if (leave.studentId === studentId && leave.status !== 'rejected') {
      const exStart = new Date(leave.startDate).getTime();
      const exEnd = new Date(leave.endDate).getTime();

      if (reqStart <= exEnd && reqEnd >= exStart) {
        return {
          hasConflict: true,
          message: `An existing ${leave.status.toLowerCase()} leave request already covers ${leave.startDate} to ${leave.endDate}.`,
        };
      }
    }
  }

  return { hasConflict: false, message: '' };
}

export interface ClassConflictItem {
  type: 'room' | 'faculty';
  conflictingClass: ClassSession;
  message: string;
}

/**
 * Scans an array of classes and returns a dictionary of conflict details per class ID.
 */
export function detectAllClassConflicts(classes: ClassSession[]): Record<string, ClassConflictItem[]> {
  const map: Record<string, ClassConflictItem[]> = {};

  for (let i = 0; i < classes.length; i++) {
    const c1 = classes[i];
    if (!c1.startTime || !c1.endTime || !c1.days || c1.days.length === 0) continue;

    for (let j = i + 1; j < classes.length; j++) {
      const c2 = classes[j];
      if (!c2.startTime || !c2.endTime || !c2.days || c2.days.length === 0) continue;

      if (doDaysOverlap(c1.days, c2.days) && doTimesOverlap(c1.startTime, c1.endTime, c2.startTime, c2.endTime)) {
        // Room clash
        if (c1.room && c2.room && c1.room.trim().toLowerCase() === c2.room.trim().toLowerCase()) {
          if (!map[c1.id]) map[c1.id] = [];
          if (!map[c2.id]) map[c2.id] = [];

          map[c1.id].push({
            type: 'room',
            conflictingClass: c2,
            message: `Room Clash: ${c1.room} is double-booked with ${c2.code} (${c2.startTime} - ${c2.endTime})`
          });
          map[c2.id].push({
            type: 'room',
            conflictingClass: c1,
            message: `Room Clash: ${c2.room} is double-booked with ${c1.code} (${c1.startTime} - ${c1.endTime})`
          });
        }

        // Faculty clash
        if (c1.facultyName && c2.facultyName && c1.facultyName.trim().toLowerCase() === c2.facultyName.trim().toLowerCase()) {
          if (!map[c1.id]) map[c1.id] = [];
          if (!map[c2.id]) map[c2.id] = [];

          map[c1.id].push({
            type: 'faculty',
            conflictingClass: c2,
            message: `Faculty Clash: ${c1.facultyName} assigned to both ${c1.code} and ${c2.code} simultaneously`
          });
          map[c2.id].push({
            type: 'faculty',
            conflictingClass: c1,
            message: `Faculty Clash: ${c2.facultyName} assigned to both ${c2.code} and ${c1.code} simultaneously`
          });
        }
      }
    }
  }

  return map;
}

