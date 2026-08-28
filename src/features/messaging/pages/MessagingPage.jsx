import { MessagesSquare } from 'lucide-react';

import { EmptyState, TabPanel, Tabs } from '@/components/ui';
import { useState } from 'react';

import { cn } from '@/lib/cn';
import { AnnouncementFeed } from '../components/AnnouncementFeed';
import { ConversationList } from '../components/ConversationList';
import { MessageThread } from '../components/MessageThread';
import { useConversations } from '../hooks/useConversations';

/**
 * Messages and announcements.
 *
 * Two panes from `md` up. Below that only one shows at a time: the list until
 * a conversation is picked, then the thread, with a back button — a
 * side-by-side split is unusable on a phone.
 */
export function MessagingPage() {
  const chat = useConversations();
  const [tab, setTab] = useState('chats');

  const showThread = Boolean(chat.selected);
  const tabs = [
    { id: 'chats', label: 'Chats' },
    { id: 'announcements', label: 'Announcements' },
  ];

  return (
    // Fills the space under the top bar so the thread scrolls, not the page.
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      <Tabs
        tabs={tabs}
        value={tab}
        onChange={(next) => {
          setTab(next);
          if (next === 'announcements') chat.closeThread();
        }}
        idPrefix="messaging"
        className="shrink-0 px-3"
      />

      <TabPanel
        id="chats"
        value={tab}
        idPrefix="messaging"
        className="flex min-h-0 flex-1 pt-0"
      >
        <div className="flex min-h-0 flex-1">
          <div
            className={cn(
              'w-full shrink-0 flex-col border-r border-line md:flex md:w-85 dark:border-line-dark',
              showThread ? 'hidden md:flex' : 'flex',
            )}
          >
            <ConversationList
              conversations={chat.conversations}
              selected={chat.selected}
              loading={chat.loading}
              error={chat.error}
              onRetry={chat.refetch}
              onSelect={chat.openThread}
              search={chat.search}
              onSearch={chat.setSearch}
            />
          </div>

          <div
            className={cn(
              'min-w-0 flex-1 flex-col',
              showThread ? 'flex' : 'hidden md:flex',
            )}
          >
            {showThread ? (
              <MessageThread
                conversation={chat.selected}
                messages={chat.messages}
                typingNames={chat.typingNames}
                onSend={chat.send}
                sending={chat.sending}
                onBack={chat.closeThread}
              />
            ) : (
              <EmptyState
                icon={<MessagesSquare aria-hidden="true" className="size-6" />}
                title="Pick a conversation"
                description="Choose someone on the left to read and reply to your messages."
              />
            )}
          </div>
        </div>
      </TabPanel>

      <TabPanel
        id="announcements"
        value={tab}
        idPrefix="messaging"
        className="min-h-0 flex-1 overflow-y-auto pt-0"
      >
        <AnnouncementFeed />
      </TabPanel>
    </div>
  );
}
