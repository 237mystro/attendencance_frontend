import { MessagesSquare } from 'lucide-react';

import {
  Avatar,
  CountBadge,
  EmptyState,
  ErrorState,
  LoadingState,
  SearchInput,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatRelativeTime, truncate } from '@/lib/formatters';
import { userIdOf } from '@/api/messaging';

/** The list of people you can message, most recently active first. */
export function ConversationList({
  conversations,
  selected,
  loading,
  error,
  onRetry,
  onSelect,
  search,
  onSearch,
}) {
  const selectedId = userIdOf(selected?.user);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-line p-3 dark:border-line-dark">
        <SearchInput
          value={search}
          onChange={onSearch}
          placeholder="Search people…"
          label="Search conversations"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <LoadingState label="Loading conversations…" />
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={<MessagesSquare aria-hidden="true" className="size-6" />}
            title={search ? 'Nobody matches' : 'No conversations'}
            description={
              search
                ? 'Try a different name or email.'
                : 'People you can message will appear here.'
            }
          />
        ) : (
          <ul>
            {conversations.map((conversation) => {
              const id = userIdOf(conversation.user);
              const isOpen = id === selectedId;

              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-current={isOpen ? 'true' : undefined}
                    onClick={() => onSelect(conversation)}
                    className={cn(
                      'flex w-full items-center gap-3 border-l-[3px] px-3 py-3 text-left transition-colors',
                      isOpen
                        ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-500/10'
                        : 'border-transparent hover:bg-ink/4 dark:hover:bg-white/5',
                    )}
                  >
                    <Avatar
                      src={conversation.user.avatarUrl}
                      name={conversation.user.name}
                      size="sm"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-bold text-ink dark:text-ink-dark">
                          {conversation.user.name}
                        </span>
                        {conversation.lastMessage && (
                          <span className="shrink-0 text-[11px] text-muted dark:text-muted-soft">
                            {formatRelativeTime(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </span>

                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-muted dark:text-muted-soft">
                          {conversation.lastMessage
                            ? truncate(conversation.lastMessage.content, 42) ||
                              'Sent an attachment'
                            : conversation.user.email}
                        </span>
                        <CountBadge count={conversation.unreadCount} />
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
