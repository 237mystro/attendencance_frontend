import { Pencil, Trash2 } from 'lucide-react';

import { IconButton, StatusBadge } from '@/components/ui';
import { formatDate } from '@/lib/formatters';

/**
 * Columns for the admin roster.
 *
 * Two separate status badges, as in the original: `status` is where the shift
 * is in its own lifecycle, `assignmentStatus` is whether the employee has
 * agreed to work it. A shift can be "scheduled" and still "pending".
 */
export const shiftColumns = ({ onEdit, onDelete }) => [
  {
    key: 'employee',
    header: 'Employee',
    primary: true,
    render: (shift) => (
      <span>
        <span className="block font-semibold">{shift.employeeId?.name || '—'}</span>
        <span className="block text-xs text-muted dark:text-muted-soft">
          {shift.employeeId?.position || 'No position'}
        </span>
      </span>
    ),
  },
  {
    key: 'date',
    header: 'Date',
    render: (shift) => formatDate(shift.date),
  },
  { key: 'day', header: 'Day' },
  {
    key: 'time',
    header: 'Time',
    render: (shift) => (
      <span className="font-semibold whitespace-nowrap">
        {shift.startTime} – {shift.endTime}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (shift) => <StatusBadge status={shift.status || 'scheduled'} />,
  },
  {
    key: 'assignmentStatus',
    header: 'Response',
    render: (shift) => <StatusBadge status={shift.assignmentStatus || 'pending'} />,
  },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (shift) => (
      <div className="flex justify-end gap-1">
        <IconButton
          label={`Edit shift for ${shift.employeeId?.name || 'employee'}`}
          size="sm"
          onClick={() => onEdit(shift)}
        >
          <Pencil aria-hidden="true" />
        </IconButton>
        <IconButton
          label={`Delete shift for ${shift.employeeId?.name || 'employee'}`}
          size="sm"
          className="text-danger"
          onClick={() => onDelete(shift)}
        >
          <Trash2 aria-hidden="true" />
        </IconButton>
      </div>
    ),
  },
];
