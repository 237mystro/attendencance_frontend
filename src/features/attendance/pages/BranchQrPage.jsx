import { useCallback, useState } from 'react';

import { useToast } from '@/context/toast-context';
import { useApi } from '@/hooks/useApi';
import { fetchBranchQr, regenerateBranchQr } from '@/api/qr';
import { AttendanceQrPanel } from '../components/AttendanceQrPanel';

/** The branch-specific QR that branch managers print for their own site. */
export function BranchQrPage() {
  const toast = useToast();
  const [regenerating, setRegenerating] = useState(false);

  const qr = useApi((signal) => fetchBranchQr(signal), []);
  const branchName = qr.data?.branchName || 'Your branch';

  const regenerate = useCallback(async () => {
    setRegenerating(true);
    try {
      const data = await regenerateBranchQr();
      if (!data?.success) throw new Error(data?.message || 'Failed to regenerate.');

      qr.setData((current) => ({ ...current, ...data }));
      toast.success('QR code regenerated. The previous code stays valid for 10 minutes.');
    } catch (caught) {
      toast.error(caught?.message || 'Failed to regenerate the QR code.');
    } finally {
      setRegenerating(false);
    }
  }, [qr, toast]);

  return (
    <AttendanceQrPanel
      title="Branch attendance QR"
      subtitle="Print and post this QR at your branch. Staff assigned here scan it to clock in or out."
      ownerName={branchName}
      qrCode={qr.data?.qrCode}
      generatedAt={qr.data?.generatedAt}
      loading={qr.loading}
      error={qr.error}
      onRetry={qr.refetch}
      onRegenerate={regenerate}
      regenerating={regenerating}
      regenerateWarning="This creates a new QR code for this branch. The previous code keeps working for 10 minutes, giving you time to swap the printed copy."
      notes={[
        `Only staff assigned to ${branchName} can use this QR.`,
        "Employees must be within this branch's geofence radius to check in.",
        'First scan of the day is a check-in; the second is a check-out.',
        'After regenerating, the old code keeps working for 10 minutes.',
      ]}
    />
  );
}
