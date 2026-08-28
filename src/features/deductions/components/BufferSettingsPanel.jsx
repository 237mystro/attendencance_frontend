import { Save } from 'lucide-react';

import { Alert, Button, Input, LoadingState, Panel } from '@/components/ui';
import { useDeductionBuffer } from '../hooks/useDeductions';

const MAX_BUFFER_MINUTES = 120;

/** How many minutes late an employee may be before a deduction applies. */
export function BufferSettingsPanel() {
  const buffer = useDeductionBuffer();

  if (buffer.loading) {
    return (
      <Panel interactive={false}>
        <LoadingState label="Loading the grace period…" />
      </Panel>
    );
  }

  return (
    <Panel
      title="Grace period"
      subtitle="Lateness beyond this many minutes starts costing the employee money."
      interactive={false}
    >
      <div className="flex flex-col gap-4 sm:max-w-sm">
        <Input
          label="Minutes"
          type="number"
          min={0}
          max={MAX_BUFFER_MINUTES}
          value={buffer.minutes}
          onChange={(event) => buffer.setMinutes(Number(event.target.value))}
          hint={`0 to ${MAX_BUFFER_MINUTES} minutes. Set 0 to deduct from the first late minute.`}
        />

        <Button
          className="self-start"
          loading={buffer.saving}
          startIcon={<Save aria-hidden="true" className="size-4" />}
          onClick={buffer.save}
        >
          Save grace period
        </Button>

        <Alert tone="info">
          This applies company-wide. An individual late-arrival request can still
          grant someone extra minutes on the day.
        </Alert>
      </div>
    </Panel>
  );
}
