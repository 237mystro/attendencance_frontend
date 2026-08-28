import { Check, X } from 'lucide-react';

import { Button, StatusBadge } from '@/components/ui';
import { LEAVE_ACTIONS, LEAVE_STATUS } from '@/constants/status';
import { formatDate } from '@/lib/formatters';
import { formatLeaveDuration } from './leave-fields';

/** Columns shared by both leave tables, minus the employee identity. */
const detailColumns = [
  { key: 'leaveType', header: 'Type' },
  {
    key: 'startDate',
    header: 'Start',
    render: (request) => formatDate(request.startDate),
  },
  {
    key: 'endDate',
    header: 'End',
    render: (request) => formatDate(request.endDate),
  },
  {
    key: 'duration',
    header: 'Duration',
    render: (request) => formatLeaveDuration(request.startDate, request.endDate),
  },
  {
    key: 'reason',
    header: 'Reason',
    render: (request) => (
      <span className="block max-w-60 truncate" title={request.reason}>
        {request.reason || '—'}
      </span>
    ),
  },
];

/**
 * The approver's table.
 *
 * Pending rows get approve/deny buttons; decided rows show the note that was
 * left instead, since the action column would be dead weight there.
 */
export const leaveReviewColumns = ({ status, onReview }) => [
  {
    key: 'employee',
    header: 'Employee',
    primary: true,
    render: (request) => (
      <span>
        <span className="block font-semibold">
          {request.employeeId?.name || 'Unknown'}
        </span>
        <span className="block text-xs text-muted dark:text-muted-soft">
          {request.employeeId?.position || 'No position'}
        </span>
      </span>
    ),
  },
  ...detailColumns,
  {
    key: 'status',
    header: 'Status',
    render: (request) => <StatusBadge status={request.status} />,
  },
  status === LEAVE_STATUS.PENDING
    ? {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        render: (request) => (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="success"
              startIcon={<Check aria-hidden="true" className="size-4" />}
              onClick={() => onReview(request, LEAVE_ACTIONS.APPROVE)}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="text-danger"
              startIcon={<X aria-hidden="true" className="size-4" />}
              onClick={() => onReview(request, LEAVE_ACTIONS.DENY)}
            >
              Deny
            </Button>
          </div>
        ),
      }
    : {
        key: 'adminNote',
        header: 'Reviewer note',
        render: (request) => request.adminNote || '—',
      },
];

/** The employee's own table — no identity column, no actions. */
export const myLeaveColumns = [
  { ...detailColumns[0], primary: true },
  ...detailColumns.slice(1),
  {
    key: 'status',
    header: 'Status',
    render: (request) => <StatusBadge status={request.status} />,
  },
  {
    key: 'adminNote',
    header: 'Reviewer note',
    render: (request) => request.adminNote || '—',
  },
];
