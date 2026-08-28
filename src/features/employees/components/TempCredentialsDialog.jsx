import { Copy } from 'lucide-react';
import { useState } from 'react';

import { Alert, Button, Modal } from '@/components/ui';

/**
 * Shows the one-time password generated for a new employee.
 *
 * The server never returns it again, so this is the only chance to copy it —
 * which is why the dialog is deliberately explicit and blocking.
 */
export function TempCredentialsDialog({ credentials, onClose }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = `Email: ${credentials.email}\nTemporary password: ${credentials.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard access can be denied; the values stay selectable on screen.
    }
  };

  return (
    <Modal
      open={Boolean(credentials)}
      onClose={onClose}
      size="sm"
      title="Employee created"
      footer={
        <Button fullWidth onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Alert tone="info">Share these credentials with the employee.</Alert>

        <dl className="rounded-panel border border-line bg-canvas p-4 text-sm dark:border-line-dark dark:bg-white/5">
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-bold text-ink dark:text-ink-dark">Email:</dt>
            <dd className="font-mono break-all">{credentials.email}</dd>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-2">
            <dt className="font-bold text-ink dark:text-ink-dark">Temporary password:</dt>
            <dd className="font-mono break-all">{credentials.password}</dd>
          </div>
        </dl>

        <Button
          variant="secondary"
          fullWidth
          startIcon={<Copy aria-hidden="true" className="size-4" />}
          onClick={copy}
        >
          {copied ? 'Copied' : 'Copy credentials'}
        </Button>
        {/* Announced separately so the button label change is not the only cue. */}
        <p aria-live="polite" className="sr-only">
          {copied ? 'Credentials copied to the clipboard.' : ''}
        </p>

        <Alert tone="warn">
          This password is shown once and cannot be retrieved later. The employee
          must change it on first sign-in.
        </Alert>
      </div>
    </Modal>
  );
}
