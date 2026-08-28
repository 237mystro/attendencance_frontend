import { Fingerprint, ScanLine } from 'lucide-react';

import { cn } from '@/lib/cn';

/** One large, thumb-friendly option in the method picker. */
function MethodButton({ icon: Icon, title, hint, disabled, accent, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex min-h-24 flex-1 flex-col items-center justify-center gap-1.5 rounded-panel border-2 px-4 py-5 text-center transition-all',
        disabled
          ? 'cursor-not-allowed border-line bg-canvas opacity-60 dark:border-line-dark dark:bg-white/5'
          : cn(
              'border-line bg-surface hover:-translate-y-0.5 hover:shadow-panel dark:border-line-dark dark:bg-surface-dark',
              accent,
            ),
      )}
    >
      <Icon aria-hidden="true" className="size-7" />
      <span className="text-sm font-bold text-ink dark:text-ink-dark">{title}</span>
      <span className="text-xs text-muted dark:text-muted-soft">{hint}</span>
    </button>
  );
}

/**
 * Lets the employee pick how to identify themselves once their position is
 * captured. Biometrics are offered only where the device actually supports a
 * platform authenticator.
 */
export function CheckInMethodChoice({
  biometricAvailable,
  biometricLabel,
  onChooseQr,
  onChooseBiometric,
}) {
  return (
    <div className="mt-5">
      <p className="mb-3 text-sm text-muted dark:text-muted-soft">
        Choose how you&rsquo;d like to mark your attendance:
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <MethodButton
          icon={ScanLine}
          title="Scan QR code"
          hint="Point camera at QR"
          accent="hover:border-brand-500 text-brand-500"
          onClick={onChooseQr}
        />
        <MethodButton
          icon={Fingerprint}
          title="Use biometrics"
          hint={biometricAvailable ? biometricLabel : 'Not supported'}
          accent="hover:border-accent-500 text-accent-500"
          disabled={!biometricAvailable}
          onClick={onChooseBiometric}
        />
      </div>

      {!biometricAvailable && (
        <p className="mt-3 text-xs text-muted dark:text-muted-soft">
          Biometrics require a device with Face ID, Touch ID, or a fingerprint sensor.
        </p>
      )}
    </div>
  );
}
