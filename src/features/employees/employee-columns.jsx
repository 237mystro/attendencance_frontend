import { Pencil, Trash2 } from 'lucide-react';

import { Badge, IconButton } from '@/components/ui';
import { formatCurrency } from '@/lib/formatters';

/**
 * Columns for the employee directory.
 *
 * A factory rather than a constant because the action cell needs the page's
 * edit and delete handlers.
 */
export const employeeColumns = ({ onEdit, onDelete }) => [
  {
    key: 'name',
    header: 'Name',
    primary: true,
    render: (employee) => (
      <span>
        <span className="block font-semibold">{employee.name}</span>
        <span className="block text-xs text-muted dark:text-muted-soft">
          {employee.email}
        </span>
      </span>
    ),
  },
  { key: 'position', header: 'Position' },
  {
    key: 'department',
    header: 'Department',
    render: (employee) => employee.department || '—',
  },
  {
    key: 'salary',
    header: 'Monthly salary',
    align: 'right',
    render: (employee) => formatCurrency(employee.salary),
  },
  {
    key: 'payPerShift',
    header: 'Pay / shift',
    align: 'right',
    render: (employee) => formatCurrency(employee.payPerShift),
  },
  {
    key: 'shifts',
    header: 'Shifts',
    align: 'center',
    render: (employee) => <Badge tone="brand">{employee.shifts || 0}</Badge>,
  },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (employee) => (
      <div className="flex justify-end gap-1">
        <IconButton
          label={`Edit ${employee.name}`}
          size="sm"
          onClick={() => onEdit(employee)}
        >
          <Pencil aria-hidden="true" />
        </IconButton>
        <IconButton
          label={`Remove ${employee.name}`}
          size="sm"
          className="text-danger"
          onClick={() => onDelete(employee)}
        >
          <Trash2 aria-hidden="true" />
        </IconButton>
      </div>
    ),
  },
];
