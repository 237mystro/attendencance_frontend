import { Megaphone, Paperclip, Send } from 'lucide-react';
import { useRef, useState } from 'react';

import {
  Alert,
  Button,
  IconButton,
  PageWrapper,
  Panel,
  Textarea,
} from '@/components/ui';
import { useToast } from '@/context/toast-context';
import {
  ACCEPTED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_FILES,
  fileCategory,
} from '@/lib/upload';
import { formatFileSize } from '@/lib/formatters';
import { sendAnnouncement } from '@/api/messaging';
import { PendingAttachments } from '../components/AttachmentList';

/** Broadcasts a message, optionally with files, to every employee. */
export function AnnouncementFormPage() {
  const toast = useToast();
  const fileInput = useRef(null);

  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);

  const canSend = (content.trim() || attachments.length) && !sending;

  const pickFiles = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = '';

    const oversized = picked.find((file) => file.size > MAX_UPLOAD_BYTES);
    if (oversized) {
      setError(
        `${oversized.name} is ${formatFileSize(oversized.size)} — the limit is ${formatFileSize(MAX_UPLOAD_BYTES)}.`,
      );
      return;
    }
    if (picked.length + attachments.length > MAX_UPLOAD_FILES) {
      setError(`You can attach up to ${MAX_UPLOAD_FILES} files.`);
      return;
    }

    setError('');
    setAttachments((current) => [
      ...current,
      ...picked.map((file) => ({ file, category: fileCategory(file) })),
    ]);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!canSend) return;

    setSending(true);
    setError('');
    setProgress(0);

    try {
      const data = await sendAnnouncement(
        { content: content.trim(), files: attachments.map((item) => item.file) },
        setProgress,
      );

      const count = data.announcements || 0;
      toast.success(
        `Announcement sent to ${count} employee${count === 1 ? '' : 's'}.`,
      );
      setContent('');
      setAttachments([]);
    } catch (caught) {
      setError(caught?.message || 'Could not send the announcement.');
    } finally {
      setSending(false);
      setProgress(0);
    }
  };

  return (
    <PageWrapper className="max-w-2xl">
      <header className="mb-5 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-panel bg-brand-50 text-brand-500 dark:bg-brand-500/15"
        >
          <Megaphone className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-ink dark:text-ink-dark">
            New announcement
          </h2>
          <p className="text-sm text-muted dark:text-muted-soft">
            Sent to every employee, and delivered as a notification.
          </p>
        </div>
      </header>

      <Panel interactive={false}>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          {error && <Alert tone="danger">{error}</Alert>}

          <Textarea
            label="Message"
            rows={6}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="What do you need everyone to know?"
          />

          <input
            ref={fileInput}
            type="file"
            multiple
            accept={ACCEPTED_UPLOAD_TYPES}
            onChange={pickFiles}
            className="sr-only"
          />

          <div className="flex items-center gap-2">
            <IconButton
              label="Attach files"
              onClick={() => fileInput.current?.click()}
              disabled={sending}
            >
              <Paperclip aria-hidden="true" />
            </IconButton>
            <p className="text-xs text-muted dark:text-muted-soft">
              Up to {MAX_UPLOAD_FILES} files, {formatFileSize(MAX_UPLOAD_BYTES)} each.
            </p>
          </div>

          <PendingAttachments
            items={attachments}
            onRemove={(index) =>
              setAttachments((current) => current.filter((_, i) => i !== index))
            }
          />

          {sending && progress > 0 && (
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-ink/10 dark:bg-white/15">
                <div
                  className="h-full rounded-full bg-brand-500 transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p aria-live="polite" className="mt-1 text-xs text-muted dark:text-muted-soft">
                Uploading… {progress}%
              </p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={!canSend}
            loading={sending}
            startIcon={<Send aria-hidden="true" className="size-4" />}
          >
            {sending ? 'Sending…' : 'Send to everyone'}
          </Button>
        </form>
      </Panel>
    </PageWrapper>
  );
}
