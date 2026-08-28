import { Select } from '@/components/ui';
import { MONTH_OPTIONS, YEAR_OPTIONS } from '../deduction-fields';

/** Month and year pickers, used by every period-scoped tab. */
export function PeriodPicker({ period, onChange, label = 'Period' }) {
  return (
    <div className="flex gap-2" role="group" aria-label={label}>
      <Select
        label="Month"
        wrapperClassName="w-36"
        options={MONTH_OPTIONS}
        value={period.month}
        onChange={(event) => onChange({ ...period, month: Number(event.target.value) })}
      />
      <Select
        label="Year"
        wrapperClassName="w-28"
        options={YEAR_OPTIONS}
        value={period.year}
        onChange={(event) => onChange({ ...period, year: Number(event.target.value) })}
      />
    </div>
  );
}
