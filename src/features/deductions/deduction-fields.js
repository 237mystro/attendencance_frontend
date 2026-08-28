import { MONTHS, recentYears } from '@/lib/formatters';

/** Why a bonus was awarded. */
export const BONUS_TYPES = {
  overtime: 'Overtime',
  good_conduct: 'Good conduct',
  other: 'Other',
};

export const BONUS_TYPE_OPTIONS = Object.entries(BONUS_TYPES).map(([value, label]) => ({
  value,
  label,
}));

export const BONUS_TONES = {
  overtime: 'brand',
  good_conduct: 'success',
  other: 'neutral',
};

/** Deduction report lifecycle, as the employee sees it. */
export const REPORT_STATUS_LABELS = {
  draft: 'Pending',
  approved: 'Approved',
  paid: 'Paid',
};

export const MONTH_OPTIONS = MONTHS.map((label, index) => ({
  value: index + 1,
  label,
}));

export const YEAR_OPTIONS = recentYears(3).map((year) => ({
  value: year,
  label: String(year),
}));

/** The current month and year, for seeding the period pickers. */
export const currentPeriod = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};
