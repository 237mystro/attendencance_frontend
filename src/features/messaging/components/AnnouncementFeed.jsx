import { Megaphone } from 'lucide-react';

import {
  Avatar,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { formatRelativeTime } from '@/lib/formatters';
import { fetchAnnouncements } from '@/api/messaging';
import { attachmentsOf } from '../attachments';
import { AttachmentChip } from './AttachmentList';

/** Company-wide announcements, newest first. */
export function AnnouncementFeed() {
  const query = useApi((signal) => fetchAnnouncements(signal), []);
  const announcements = query.data?.announcements || [];

  if (query.loading) return <LoadingState label="Loading announcements…" />;
  if (query.error) {
    return <ErrorState message={query.error} onRetry={query.refetch} />;
  }
  if (!announcements.length) {
    return (
      <EmptyState
        icon={<Megaphone aria-hidden="true" className="size-6" />}
        title="No announcements yet"
        description="Company-wide updates from management appear here."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3 p-4">
      {announcements.map((announcement) => {
        const files = attachmentsOf(announcement);
        const sender = announcement.sender || {};

        return (
          <li
            key={announcement._id}
            className="rounded-panel border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark"
          >
            <div className="flex items-center gap-3">
              <Avatar src={sender.avatarUrl} name={sender.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink dark:text-ink-dark">
                  {sender.name || 'Management'}
                </p>
                <time
                  dateTime={announcement.createdAt}
                  className="text-xs text-muted dark:text-muted-soft"
                >
                  {formatRelativeTime(announcement.createdAt)}
                </time>
              </div>
              <Megaphone aria-hidden="true" className="size-4 shrink-0 text-brand-500" />
            </div>

            {announcement.content && (
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-ink dark:text-ink-dark">
                {announcement.content}
              </p>
            )}

            {files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {files.map((file) => (
                  <AttachmentChip key={file.url} file={file} />
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
