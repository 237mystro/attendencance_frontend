import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

import { POLL_INTERVAL_MS, SOCKET_URL } from '@/constants/config';
import { ROLES } from '@/constants/roles';
import { useAuth } from '@/context/auth-context';
import { emitAppEvent } from '@/hooks/useAppEvent';
import { parseUnreadCount, request } from '@/api/client';
import { getStoredToken } from '@/lib/auth-session';
import { shouldNotifyUser, showDeviceNotification, subscribeToPush } from '@/lib/notifications';
import { SOCKET_EVENTS, isRelevantToUser, notificationUrl } from '@/lib/socket-events';
import { SocketContext } from './socket-context';

/**
 * Owns the realtime connection and the two badge counts shown in the layout
 * chrome (unread messages, pending late requests).
 *
 * Every server event runs through one pipeline driven by the table in
 * `lib/socket-events.js`: filter by branch, optionally raise an OS
 * notification, then re-broadcast as a window event any screen can listen for.
 */
export function SocketProvider({ children }) {
  const { currentUser } = useAuth();
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingLateCount, setPendingLateCount] = useState(0);
  const socketRef = useRef(null);

  const isAdminLike = Boolean(currentUser) && currentUser.role !== ROLES.EMPLOYEE;

  const refreshUnreadCount = useCallback(async () => {
    try {
      const data = await request('/messages/unread-count');
      if (data?.success) setUnreadCount(parseUnreadCount(data));
    } catch {
      // Badge counts are best-effort; a failure must not surface as an error.
    }
  }, []);

  const refreshPendingLateCount = useCallback(async () => {
    if (!isAdminLike) return;
    try {
      const data = await request('/late-permissions/pending-count');
      if (data?.success) setPendingLateCount(Number(data.count) || 0);
    } catch {
      // Best-effort.
    }
  }, [isAdminLike]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token || !currentUser) return undefined;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('authenticate', token);
      subscribeToPush();
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    Object.entries(SOCKET_EVENTS).forEach(([name, config]) => {
      socket.on(name, (payload) => {
        if (!isRelevantToUser(config, payload, currentUser)) return;

        if (config.bumpUnread) setUnreadCount((previous) => previous + 1);
        if (config.refreshLateCount) refreshPendingLateCount();

        const notification = config.notify?.(payload);
        if (notification && shouldNotifyUser()) {
          showDeviceNotification({
            ...notification,
            url: notificationUrl(config, currentUser.role),
          });
        }

        if (config.appEvent) emitAppEvent(config.appEvent, payload);
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser, refreshPendingLateCount]);

  // Seed the counts, then poll as a fallback for any missed socket events.
  useEffect(() => {
    if (!currentUser) return undefined;

    // Seeding a badge count is a fetch-on-mount, which `set-state-in-effect`
    // flags; the state it writes comes from the server, not from other state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUnreadCount();
    refreshPendingLateCount();

    const timer = setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [currentUser, refreshUnreadCount, refreshPendingLateCount]);

  // A tapped push notification asks the service worker to open a route.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;

    const handleMessage = (event) => {
      if (event.data?.type === 'notification-click' && event.data.url) {
        window.location.href = event.data.url;
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, []);

  /**
   * Sends an event to the server. Exposed instead of the raw socket so callers
   * cannot hold a stale instance across reconnects.
   */
  const emit = useCallback((event, payload) => {
    socketRef.current?.emit(event, payload);
  }, []);

  const value = useMemo(
    () => ({
      // Derived rather than reset in an effect, so signing out clears the
      // chrome immediately without an extra render pass.
      connected: Boolean(currentUser) && connected,
      unreadCount: currentUser ? unreadCount : 0,
      pendingLateCount: isAdminLike ? pendingLateCount : 0,
      emit,
      setUnreadCount,
      setPendingLateCount,
      refreshUnreadCount,
      refreshPendingLateCount,
    }),
    [
      currentUser,
      connected,
      unreadCount,
      pendingLateCount,
      isAdminLike,
      emit,
      refreshUnreadCount,
      refreshPendingLateCount,
    ],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
