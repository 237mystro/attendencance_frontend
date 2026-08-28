import { Paperclip, Send } from 'lucide-react';
import { useRef, useState } from 'react';

import { Alert, IconButton } from '@/components/ui';
import {
  ACCEPTED_UPLOAD_TYPES,
  MAX_UPLOAD_FILES,
  fileCategory,
} from '@/lib/upload';
import { PendingAttachments } from './AttachmentList';

/**
 * The message input.
 *
 * Enter sends, Shift+Enter adds a line — the convention people expect from a
 * chat box. The textarea grows with its content up to a cap, so a long message
 * is visible without the composer swallowing the thread.
 */
export function MessageComposer({ onSend, sending, disabled }) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const fileInput = useRef(null);

  const canSend = (text.trim() || attachments.length) && !sending && !disabled;

  const pickFiles = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = '';

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
    event?.preventDefault();
    if (!canSend) return;

    const sent = await onSend({
      content: text.trim(),
      files: attachments.map((item) => item.file),
    });

    if (sent) {
      setText('');
      setAttachments([]);
      setError('');
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2 border-t border-line p-3 dark:border-line-dark"
    >
      {error && <Alert tone="danger">{error}</Alert>}

      <PendingAttachments
        items={attachments}
        onRemove={(index) =>
          setAttachments((current) => current.filter((_, i) => i !== index))
        }
      />

      <div className="flex items-end gap-2">
        <input
          ref={fileInput}
          type="file"
          multiple
          accept={ACCEPTED_UPLOAD_TYPES}
          onChange={pickFiles}
          className="sr-only"
        />

        <IconButton
          label="Attach files"
          onClick={() => fileInput.current?.click()}
          disabled={disabled}
        >
          <Paperclip aria-hidden="true" />
        </IconButton>

        <label htmlFor="message-input" className="sr-only">
          Write a message
        </label>
        <textarea
          id="message-input"
          rows={1}
          value={text}
          disabled={disabled}
          placeholder="Write a message…"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          className="field-base max-h-32 flex-1 resize-none py-2.5 leading-relaxed"
        />

        <IconButton
          label="Send message"
          type="submit"
          variant="primary"
          disabled={!canSend}
        >
          <Send aria-hidden="true" />
        </IconButton>
      </div>

      <p className="text-xs text-muted-soft">
        Enter sends · Shift + Enter adds a line
      </p>
    </form>
  );
}
