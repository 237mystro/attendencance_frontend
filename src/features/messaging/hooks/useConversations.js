import { useCallback, useEffect, useRef, useState } from 'react';

import { useSocket } from '@/context/socket-context';
import { useToast } from '@/context/toast-context';
import { APP_EVENTS, useAppEvent } from '@/hooks/useAppEvent';
import { useApi } from '@/hooks/useApi';
import { fetchContacts, fetchThread, sendMessage, userIdOf } from '@/api/messaging';

const TYPING_TIMEOUT_MS = 3000;

/**
 * Conversations, the open thread, and typing indicators.
 *
 * The selected conversation is mirrored into a ref so the realtime handlers —
 * which are registered once — can tell whether an arriving message belongs to
 * the thread currently on screen without resubscribing on every selection.
 */
export function useConversations() {
  const toast = useToast();
  const { setUnreadCount } = useSocket();

  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingNames, setTypingNames] = useState([]);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');

  // Mirrored in an effect rather than during render, so the realtime handlers
  // registered once can still see the current selection.
  const selectedRef = useRef(null);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  const typingTimer = useRef(null);

  const contactQuery = useApi((signal) => fetchContacts(signal), []);
  const contacts = contactQuery.data?.contacts || [];

  const openThread = useCallback(async (conversation) => {
    setSelected(conversation);
    setMessages([]);

    try {
      const data = await fetchThread(userIdOf(conversation.user));
      if (data?.success) setMessages(data.messages || []);
    } catch {
      // The thread stays empty; the list is still usable.
    }
  }, []);

  const send = useCallback(
    async ({ content, files }) => {
      const conversation = selectedRef.current;
      if (!conversation) return false;

      setSending(true);
      try {
        const data = await sendMessage({
          receiverId: userIdOf(conversation.user),
          content,
          files,
        });
        if (!data?.success) throw new Error(data?.message || 'Failed to send.');

        setMessages((current) => [...current, data.data]);
        contactQuery.refetch();
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not send that message.');
        return false;
      } finally {
        setSending(false);
      }
    },
    [contactQuery, toast],
  );

  useAppEvent(APP_EVENTS.newMessage, (detail) => {
    const message = detail?.message || detail;
    const openWith = userIdOf(selectedRef.current?.user);
    const from = userIdOf(message?.sender);

    // Append only when it belongs to the open thread, and never twice.
    if (openWith && from === openWith) {
      setMessages((current) =>
        current.some((item) => item._id && item._id === message._id)
          ? current
          : [...current, message],
      );
    }

    contactQuery.refetch();
    setUnreadCount((count) => count + 1);
  });

  useAppEvent(APP_EVENTS.typingStart, (detail) => {
    const conversation = selectedRef.current;
    if (!conversation || userIdOf(conversation.user) !== detail?.senderId) return;

    const name = conversation.user.name;
    setTypingNames((current) => (current.includes(name) ? current : [...current, name]));

    // Typing stop can be lost; expire the indicator on its own.
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(
      () => setTypingNames((current) => current.filter((item) => item !== name)),
      TYPING_TIMEOUT_MS,
    );
  });

  useAppEvent(APP_EVENTS.typingStop, (detail) => {
    const conversation = selectedRef.current;
    if (!conversation || userIdOf(conversation.user) !== detail?.senderId) return;
    setTypingNames((current) => current.filter((item) => item !== conversation.user.name));
  });

  const term = search.trim().toLowerCase();
  const visible = contacts
    .filter(
      (conversation) =>
        !term ||
        conversation.user.name?.toLowerCase().includes(term) ||
        conversation.user.email?.toLowerCase().includes(term),
    )
    // Most recently active first; conversations with no messages sink.
    .sort((a, b) => {
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
      }
      if (a.lastMessage) return -1;
      if (b.lastMessage) return 1;
      return 0;
    });

  return {
    conversations: visible,
    selected,
    messages,
    typingNames,
    search,
    setSearch,
    loading: contactQuery.loading,
    error: contactQuery.error,
    refetch: contactQuery.refetch,
    openThread,
    closeThread: () => setSelected(null),
    send,
    sending,
  };
}
