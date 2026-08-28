import { FileText, Film, ImageIcon, Music, Paperclip, X } from 'lucide-react';

import { IconButton } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatFileSize } from '@/lib/formatters';

const ICONS = {
  image: ImageIcon,
  video: Film,
  audio: Music,
  document: FileText,
};

const TONES = {
  image: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  video: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  audio: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  document: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
};

/** A file already attached to a sent message or announcement. */
export function AttachmentChip({ file }) {
  const category = file.type || 'document';
  const Icon = ICONS[category] || Paperclip;

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex min-h-tap max-w-60 items-center gap-2 rounded-btn px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80',
        TONES[category] || TONES.document,
      )}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span className="truncate">{file.name || 'Attachment'}</span>
    </a>
  );
}

/** Files staged for upload, each removable before sending. */
export function PendingAttachments({ items, onRemove }) {
  if (!items.length) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item, index) => {
        const Icon = ICONS[item.category] || Paperclip;

        return (
          <li
            key={`${item.file.name}-${index}`}
            className={cn(
              'flex max-w-64 items-center gap-2 rounded-btn py-1 pr-1 pl-3 text-xs font-semibold',
              TONES[item.category] || TONES.document,
            )}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{item.file.name}</span>
            <span className="shrink-0 opacity-70">{formatFileSize(item.file.size)}</span>
            <IconButton
              label={`Remove ${item.file.name}`}
              size="sm"
              className="shrink-0"
              onClick={() => onRemove(index)}
            >
              <X aria-hidden="true" />
            </IconButton>
          </li>
        );
      })}
    </ul>
  );
}
