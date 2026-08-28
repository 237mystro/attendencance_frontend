import { Download, Printer, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import {
  Alert,
  Button,
  ConfirmDialog,
  ErrorState,
  LoadingState,
  PageHero,
  PageWrapper,
  Panel,
} from '@/components/ui';
import { formatDateTime } from '@/lib/formatters';
import { downloadQrPng, printQrPoster } from '../print-qr';

/**
 * The printable attendance QR, shared by the company and branch screens.
 *
 * They differ only in which endpoints they call and what the regeneration
 * warning says, so those arrive as props rather than being duplicated.
 */
export function AttendanceQrPanel({
  title,
  subtitle,
  ownerName,
  qrCode,
  generatedAt,
  loading,
  error,
  onRetry,
  onRegenerate,
  regenerating,
  regenerateWarning,
  notes,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const filename = `${(ownerName || 'attendance').toLowerCase().replace(/\s+/g, '-')}-qr`;

  return (
    <PageWrapper className="max-w-2xl">
      <PageHero eyebrow="Attendance QR" title={title} subtitle={subtitle} />

      <Panel interactive={false}>
        {loading ? (
          <LoadingState label="Loading QR code…" />
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : qrCode ? (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-lg font-extrabold text-ink dark:text-ink-dark">
              {ownerName}
            </h2>
            <p className="mt-1 text-sm text-muted dark:text-muted-soft">
              Scan to clock in / clock out
            </p>

            <div className="mt-4 rounded-panel border-2 border-line bg-white p-3 shadow-panel dark:border-line-dark">
              <img
                src={qrCode}
                alt={`Attendance QR code for ${ownerName}`}
                className="size-56 sm:size-64"
              />
            </div>

            {generatedAt && (
              <p className="mt-3 text-xs text-muted-soft">
                Generated {formatDateTime(generatedAt)}
              </p>
            )}

            <div className="mt-5 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                startIcon={<Download aria-hidden="true" className="size-4" />}
                onClick={() => downloadQrPng(qrCode, filename)}
              >
                Download PNG
              </Button>
              <Button
                variant="secondary"
                startIcon={<Printer aria-hidden="true" className="size-4" />}
                onClick={() =>
                  printQrPoster({
                    qrCode,
                    title: ownerName,
                    subtitle: 'Scan this QR code to clock in or out',
                  })
                }
              >
                Print
              </Button>
              <Button
                variant="secondary"
                className="text-warn"
                loading={regenerating}
                startIcon={<RefreshCw aria-hidden="true" className="size-4" />}
                onClick={() => setConfirmOpen(true)}
              >
                Regenerate
              </Button>
            </div>

            <Alert tone="info" className="mt-5 w-full text-left">
              <p className="font-bold">How it works</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5">
                {notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </Alert>
          </div>
        ) : (
          <ErrorState
            title="Could not load the QR code"
            message="The server did not return a code for this workspace."
            onRetry={onRetry}
          />
        )}
      </Panel>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        loading={regenerating}
        tone="danger"
        title="Regenerate QR code?"
        confirmLabel="Yes, regenerate"
        onConfirm={async () => {
          await onRegenerate();
          setConfirmOpen(false);
        }}
      >
        <p className="text-sm leading-relaxed text-muted dark:text-muted-soft">
          {regenerateWarning}
        </p>
      </ConfirmDialog>
    </PageWrapper>
  );
}
