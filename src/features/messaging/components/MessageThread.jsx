import { ArrowLeft } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Avatar, Badge, IconButton } from '@/components/ui';
import { ROLE_LABELS } from '@/constants/roles';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/cn';
import { formatDate, formatTime } from '@/lib/formatters';
import { userIdOf } from '@/api/messaging';
import { attachmentsOf } from '../attachments';
import { AttachmentChip } from './AttachmentList';
import { MessageComposer } from './MessageComposer';

/** Groups run under a date heading when the day changes. */
const dayKey = (value) => new Date(value).toDateString();

/** Three dots while the other person is typing. */
function TypingIndicator({ names }) {
  if (!names.length) return null;

  return (
    <p aria-live="polite" className="px-4 py-2 text-xs text-muted dark:text-muted-soft">
      <span className="inline-flex gap-0.5 pr-1.5 align-middle">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="size-1.5 rounded-full bg-muted motion-safe:animate-bounce"
            style={{ animationDelay: `${dot * 120}ms` }}
          />
        ))}
      </span>
      {names.join(', ')} {names.length === 1 ? 'is' : 'are'} typing…
    </p>
  );
}

/** The open conversation: who it is with, the messages, and the composer. */
export function MessageThread({ conversation, messages, typingNames, onSend, sending, onBack }) {
  const { currentUser } = useAuth();
  const endRef = useRef(null);
  const myId = userIdOf(currentUser);

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, typingNames]);

  const participant = conversation.user;

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-line p-3 dark:border-line-dark">
        <IconButton label="Back to conversations" className="md:hidden" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
        </IconButton>

        <Avatar src={participant.avatarUrl} name={participant.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-ink dark:text-ink-dark">
            {participant.name}
          </p>
          <p className="truncate text-xs text-muted dark:text-muted-soft">
            {participant.email}
          </p>
        </div>

        {participant.role && (
          <Badge tone="brand">{ROLE_LABELS[participant.role] || participant.role}</Badge>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted dark:text-muted-soft">
            No messages yet. Say hello.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map((message, index) => {
              const mine = userIdOf(message.sender) === myId;
              const files = attachmentsOf(message);
              const showDay =
                index === 0 ||
                dayKey(message.createdAt) !== dayKey(messages[index - 1].createdAt);

              return (
                <li key={message._id || index}>
                  {showDay && (
                    <p className="my-3 text-center text-xs font-semibold text-muted dark:text-muted-soft">
                      {formatDate(message.createdAt)}
                    </p>
                  )}

                  <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[85%] rounded-panel px-3.5 py-2.5 sm:max-w-[70%]',
                        mine
                          ? 'bg-brand-500 text-white'
                          : 'bg-canvas text-ink dark:bg-white/8 dark:text-ink-dark',
                      )}
                    >
                      {message.content && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      )}

                      {files.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {files.map((file) => (
                            <AttachmentChip key={file.url} file={file} />
                          ))}
                        </div>
                      )}

                      <time
                        dateTime={message.createdAt}
                        className={cn(
                          'mt-1 block text-right text-[11px]',
                          mine ? 'text-white/70' : 'text-muted dark:text-muted-soft',
                        )}
                      >
                        {formatTime(message.createdAt)}
                      </time>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div ref={endRef} />
      </div>

      <TypingIndicator names={typingNames} />

      <MessageComposer onSend={onSend} sending={sending} />
    </section>
  );
}
