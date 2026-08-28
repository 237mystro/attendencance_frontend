import { useCallback, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useApi } from '@/hooks/useApi';
import { fetchCompanyQr, regenerateCompanyQr } from '@/api/qr';
import { AttendanceQrPanel } from '../components/AttendanceQrPanel';

/** The company-wide QR that admins print and post at the workplace. */
export function CompanyQrPage() {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [regenerating, setRegenerating] = useState(false);

  const qr = useApi((signal) => fetchCompanyQr(signal), []);
  const company = currentUser?.company || 'Your company';

  const regenerate = useCallback(async () => {
    setRegenerating(true);
    try {
      const data = await regenerateCompanyQr();
      if (!data?.success) throw new Error(data?.message || 'Failed to regenerate.');

      qr.setData(data);
      toast.success('QR code regenerated. The old code no longer works.');
    } catch (caught) {
      toast.error(caught?.message || 'Failed to regenerate the QR code.');
    } finally {
      setRegenerating(false);
    }
  }, [qr, toast]);

  return (
    <AttendanceQrPanel
      title="Company attendance QR"
      subtitle="Print and post this QR at your workplace. Employees scan it to clock in or out."
      ownerName={company}
      qrCode={qr.data?.qrCode}
      generatedAt={qr.data?.generatedAt}
      loading={qr.loading}
      error={qr.error}
      onRetry={qr.refetch}
      onRegenerate={regenerate}
      regenerating={regenerating}
      regenerateWarning="This creates a brand-new QR code. Any previously printed or saved copies stop working immediately, and you will need to print and distribute the new one."
      notes={[
        `Only employees of ${company} can use this QR.`,
        'Employees must be within the geofence radius to check in.',
        'First scan of the day is a check-in; the second is a check-out.',
        'Regenerating creates a new code — the old printed one stops working.',
      ]}
    />
  );
}
