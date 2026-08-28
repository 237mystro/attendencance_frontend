import { Ban, ChevronDown, ChevronUp, CircleCheckBig, MonitorSmartphone, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

import { Alert, Button, ConfirmDialog, DataTable, Panel } from '@/components/ui';
import { formatDateTime } from '@/lib/formatters';
import { getDeviceLabel } from '@/lib/device';
import { AttendanceMethodBadge, AttendanceStatusBadge } from './AttendanceBadges';

/**
 * Check-ins from a device the employee has not used before.
 *
 * Approving keeps the record; revoking cancels it and marks the employee
 * absent — irreversible, so it goes through a confirmation that spells out
 * the consequence.
 */
export function FlaggedDeviceReview({ records, onReview, reviewing }) {
  const [expanded, setExpanded] = useState(true);
  const [pending, setPending] = useState(null);

  if (!records.length) return null;

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      primary: true,
      render: (record) => (
        <span className="flex items-center gap-2">
          <MonitorSmartphone aria-hidden="true" className="size-4 shrink-0 text-warn" />
          <span className="font-semibold">{record.employeeId?.name || 'Unknown'}</span>
        </span>
      ),
    },
    {
      key: 'checkInTime',
      header: 'Date & time',
      render: (record) => formatDateTime(record.checkInTime),
    },
    {
      key: 'method',
      header: 'Method',
      render: (record) => <AttendanceMethodBadge record={record} /> ?? '—',
    },
    {
      key: 'ipAddress',
      header: 'IP address',
      render: (record) => (
        <span className="font-mono text-xs">{record.ipAddress || '—'}</span>
      ),
    },
    {
      key: 'device',
      header: 'Device',
      render: (record) => (
        <span title={record.userAgent || 'Unknown'}>
          {getDeviceLabel(record.userAgent)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (record) => <AttendanceStatusBadge status={record.status} />,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'center',
      render: (record) => (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            size="sm"
            variant="success"
            startIcon={<CircleCheckBig aria-hidden="true" className="size-4" />}
            onClick={() => setPending({ record, action: 'approve' })}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="text-danger"
            startIcon={<Ban aria-hidden="true" className="size-4" />}
            onClick={() => setPending({ record, action: 'revoke' })}
          >
            Revoke
          </Button>
        </div>
      ),
    },
  ];

  const isApprove = pending?.action === 'approve';
  const name = pending?.record?.employeeId?.name || 'this employee';

  return (
    <Panel
      className="mb-5 border-warn/30"
      interactive={false}
      title={
        <span className="flex items-center gap-2 text-warn">
          <TriangleAlert aria-hidden="true" className="size-5" />
          Unknown device alerts ({records.length})
        </span>
      }
      action={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          endIcon={
            expanded ? (
              <ChevronUp aria-hidden="true" className="size-4" />
            ) : (
              <ChevronDown aria-hidden="true" className="size-4" />
            )
          }
        >
          {expanded ? 'Hide' : 'Show'}
        </Button>
      }
    >
      {expanded && (
        <>
          <Alert tone="warn" className="mb-4">
            These employees checked in from an unrecognised device.{' '}
            <strong>Approve</strong> to accept the check-in, or <strong>Revoke</strong> to
            cancel it and mark the employee absent.
          </Alert>

          <DataTable
            columns={columns}
            rows={records}
            caption="Check-ins awaiting device review"
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        loading={reviewing}
        tone={isApprove ? 'success' : 'danger'}
        title={isApprove ? 'Approve check-in?' : 'Revoke check-in?'}
        confirmLabel={isApprove ? 'Approve' : 'Revoke'}
        onConfirm={async () => {
          await onReview(pending.record, pending.action);
          setPending(null);
        }}
      >
        <p className="text-sm leading-relaxed text-muted dark:text-muted-soft">
          {isApprove ? (
            <>
              Accept the check-in for <strong>{name}</strong>? The attendance record will
              be kept and the device alert cleared.
            </>
          ) : (
            <>
              Cancel the check-in for <strong>{name}</strong>? Their attendance will be
              changed to <strong>absent</strong> and the alert cleared. This cannot be
              undone.
            </>
          )}
        </p>
      </ConfirmDialog>
    </Panel>
  );
}
