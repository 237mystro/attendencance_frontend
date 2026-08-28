import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, ArrowRight, Copy, Plus } from 'lucide-react';
import { useState } from 'react';

import { Alert, Button, Modal } from '@/components/ui';
import { WizardSteps } from '@/features/employees/components/WizardSteps';
import { useToast } from '@/context/toast-context';
import { WIZARD_STEPS, publicEventUrl } from '../event-fields';
import { useEventWizard } from '../hooks/useEventWizard';
import { DetailsStep, FieldSelectionStep, LocationStep } from './EventWizardSteps';

/** The share link and QR shown once an event has been created. */
function CreatedEventPanel({ event, onClose }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const url = publicEventUrl(event);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Could not copy — select the link and copy it manually.');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Alert tone="success" className="w-full text-left">
        <p className="font-bold">{event.title} is live.</p>
        <p className="mt-1">
          Share this link or print the QR code. Anyone who opens it can check in
          from inside the venue.
        </p>
      </Alert>

      <div className="rounded-panel border-2 border-line bg-white p-3 dark:border-line-dark">
        <QRCodeCanvas value={url} size={200} />
      </div>

      <p className="w-full font-mono text-xs break-all text-muted dark:text-muted-soft">
        {url}
      </p>

      <Button
        variant="secondary"
        startIcon={<Copy aria-hidden="true" className="size-4" />}
        onClick={copy}
      >
        {copied ? 'Copied' : 'Copy link'}
      </Button>
      <p aria-live="polite" className="sr-only">
        {copied ? 'Link copied to the clipboard.' : ''}
      </p>

      <Button fullWidth onClick={onClose}>
        Done
      </Button>
    </div>
  );
}

/** Creates an event across three steps, then hands over its share link. */
export function EventWizardDialog({ onClose, onCreate, saving }) {
  const wizard = useEventWizard({ onCreate });

  if (wizard.created) {
    return (
      <Modal open onClose={onClose} size="sm" title="Event created">
        <CreatedEventPanel event={wizard.created} onClose={onClose} />
      </Modal>
    );
  }

  const StepBody = {
    fields: FieldSelectionStep,
    location: LocationStep,
    details: DetailsStep,
  }[wizard.step.id];

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      closeOnBackdrop={!saving}
      size="lg"
      title="New event"
      description={wizard.step.title}
      footer={
        <>
          <Button
            variant="secondary"
            disabled={wizard.stepIndex === 0 || saving}
            startIcon={<ArrowLeft aria-hidden="true" className="size-4" />}
            onClick={wizard.back}
          >
            Back
          </Button>

          {wizard.isLastStep ? (
            <Button
              loading={saving}
              startIcon={<Plus aria-hidden="true" className="size-4" />}
              onClick={wizard.submit}
            >
              Create event
            </Button>
          ) : (
            <Button
              endIcon={<ArrowRight aria-hidden="true" className="size-4" />}
              onClick={wizard.next}
            >
              Continue
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <WizardSteps steps={WIZARD_STEPS} activeIndex={wizard.stepIndex} />

        {wizard.error && <Alert tone="danger">{wizard.error}</Alert>}

        <StepBody wizard={wizard} />
      </div>
    </Modal>
  );
}
