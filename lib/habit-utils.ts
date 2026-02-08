// Habit frequency and status utilities

export type HabitFrequency =
  | 'daily'
  | 'weekdays'
  | 'weekends'
  | '3x_week'
  | '4x_week'
  | '5x_week'
  | 'weekly';

export type DayStatus =
  | 'completed'    // Done for this day
  | 'pending'      // Required, not done yet, still achievable
  | 'not_required' // Day not in frequency scope
  | 'failed'       // Required but week/period ended without meeting target
  | 'at_risk';     // Running out of time to meet weekly target

export interface HabitLog {
  completed_date: string; // YYYY-MM-DD
}

export interface HabitWithLogs {
  id: string;
  frequency: string;
  logs: HabitLog[];
}

// Get the Monday of the week for a given date
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get the Sunday of the week for a given date
export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

// Check if a day is required based on frequency
export function isRequiredDay(frequency: string, date: Date): boolean {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

  switch (frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Mon-Fri
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6; // Sat-Sun
    case '3x_week':
    case '4x_week':
    case '5x_week':
    case 'weekly':
      return true; // Any day counts for X times per week
    default:
      return true;
  }
}

// Get target completions per week for a frequency
export function getWeeklyTarget(frequency: string): number {
  switch (frequency) {
    case 'daily':
      return 7;
    case 'weekdays':
      return 5;
    case 'weekends':
      return 2;
    case '3x_week':
      return 3;
    case '4x_week':
      return 4;
    case '5x_week':
      return 5;
    case 'weekly':
      return 1;
    default:
      return 7;
  }
}

// Check if frequency is flexible (X times per week)
export function isFlexibleFrequency(frequency: string): boolean {
  return ['3x_week', '4x_week', '5x_week', 'weekly'].includes(frequency);
}

// Get completions for a specific week
export function getWeekCompletions(logs: HabitLog[], weekStart: Date): number {
  const weekEnd = getWeekEnd(weekStart);

  return logs.filter(log => {
    const [year, month, day] = log.completed_date.split('-').map(Number);
    const logDate = new Date(year, month - 1, day);
    return logDate >= weekStart && logDate <= weekEnd;
  }).length;
}

// Get week progress for a habit
export function getWeekProgress(habit: HabitWithLogs, referenceDate: Date = new Date()): {
  completed: number;
  target: number;
  remaining: number;
  daysLeft: number;
} {
  const weekStart = getWeekStart(referenceDate);
  const weekEnd = getWeekEnd(weekStart);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = getWeeklyTarget(habit.frequency);
  const completed = getWeekCompletions(habit.logs, weekStart);

  // Calculate days left in the week (including today)
  const daysLeft = Math.max(0, Math.ceil((weekEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  return {
    completed,
    target,
    remaining: Math.max(0, target - completed),
    daysLeft
  };
}

// Get status for a specific day
export function getHabitStatusForDay(
  habit: HabitWithLogs,
  date: Date
): DayStatus {
  const dateStr = formatDateStr(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  // Check if completed
  const isCompleted = habit.logs.some(log => log.completed_date === dateStr);
  if (isCompleted) {
    return 'completed';
  }

  // For fixed-day frequencies (weekdays, weekends), check if required
  if (habit.frequency === 'weekdays' || habit.frequency === 'weekends') {
    if (!isRequiredDay(habit.frequency, date)) {
      return 'not_required';
    }
  }

  // For flexible frequencies, check week status
  if (isFlexibleFrequency(habit.frequency)) {
    const weekStart = getWeekStart(date);
    const weekEnd = getWeekEnd(weekStart);
    const progress = getWeekProgress(habit, date);

    // If the week has ended and target not met
    if (today > weekEnd && progress.completed < progress.target) {
      return 'failed';
    }

    // If target already met this week, extra days are "not required"
    if (progress.completed >= progress.target) {
      return 'not_required';
    }

    // Check if at risk (not enough days left to complete)
    if (progress.daysLeft < progress.remaining && checkDate <= today) {
      return 'failed';
    }

    // If day is in the past and not completed, check if week failed
    if (checkDate < today) {
      // Recalculate with that date as reference
      const pastWeekStart = getWeekStart(date);
      const pastWeekEnd = getWeekEnd(pastWeekStart);
      if (today > pastWeekEnd) {
        const weekCompletions = getWeekCompletions(habit.logs, pastWeekStart);
        const target = getWeeklyTarget(habit.frequency);
        if (weekCompletions < target) {
          return 'failed';
        }
      }
    }
  }

  // For daily habits, past days without completion are failed
  if (habit.frequency === 'daily' && checkDate < today) {
    return 'failed';
  }

  // For weekday/weekend habits, past required days without completion are failed
  if ((habit.frequency === 'weekdays' || habit.frequency === 'weekends') && checkDate < today) {
    if (isRequiredDay(habit.frequency, date)) {
      return 'failed';
    }
  }

  return 'pending';
}

// Format date to YYYY-MM-DD string
export function formatDateStr(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

// Get frequency label in Spanish
export function getFrequencyLabel(frequency: string): string {
  const labels: Record<string, string> = {
    'daily': 'Diario',
    'weekdays': 'L-V',
    'weekends': 'Fines de semana',
    '3x_week': '3x/semana',
    '4x_week': '4x/semana',
    '5x_week': '5x/semana',
    'weekly': '1x/semana'
  };
  return labels[frequency] || frequency;
}
