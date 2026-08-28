// src/contexts/SocketContext.js
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { apiRequest, parseUnreadCount, REACT_APP_SOCKET_URL } from '../utils/api';
import { getStoredToken } from '../utils/authSession';
import { shouldNotifyUser, showDeviceNotification } from '../utils/deviceNotifications';
import { subscribeToPush } from '../utils/pushSubscription';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingLateCount, setPendingLateCount] = useState(0);
  const { currentUser } = useAuth();
  const isBranchUser = currentUser?.role === 'branch_manager' || currentUser?.role === 'branch_hr';
  const messagingUrl = currentUser?.role === 'employee'
    ? '/employee/messaging'
    : isBranchUser
      ? '/branch/messaging'
      : '/admin/messaging';
  const scheduleUrl = currentUser?.role === 'employee'
    ? '/employee/schedule'
    : isBranchUser
      ? '/branch/scheduling'
      : '/admin/scheduling';
  const lateRequestUrl = currentUser?.role === 'employee'
    ? '/employee/late-request'
    : isBranchUser
      ? '/branch/late-requests'
      : '/admin/late-requests';

  const refreshPendingLateCount = useCallback(async () => {
    if (!currentUser || currentUser.role === 'employee') {
      setPendingLateCount(0);
      return;
    }

    try {
      const data = await apiRequest('/late-permissions/pending-count');
      if (data?.success) {
        setPendingLateCount(Number(data.count) || 0);
      }
    } catch (err) {
      console.error('Fetch pending late count error:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token || !currentUser) {
      setSocket(null);
      setConnected(false);
      return undefined;
    }

    const newSocket = io(REACT_APP_SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('authenticate', token);
      // Subscribe to Web Push once the user is confirmed online
      subscribeToPush();
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    // Handle incoming messages
    newSocket.on('message:receive', (data) => {
      setUnreadCount((prev) => prev + 1);
      if (shouldNotifyUser()) {
        const senderName = data?.sender?.name || data?.message?.sender?.name || 'New message';
        showDeviceNotification({
          title: senderName,
          body: data?.message?.content || 'You received a new message.',
          tag: `message-${data?.message?._id || Date.now()}`,
          url: messagingUrl
        });
      }
      window.dispatchEvent(new CustomEvent('newMessageReceived', { detail: data }));
    });

    // Handle incoming announcements
    newSocket.on('announcement:receive', (data) => {
      setUnreadCount((prev) => prev + 1);
      if (shouldNotifyUser()) {
        showDeviceNotification({
          title: 'New announcement',
          body: data?.announcement?.content || `${data?.sender?.name || 'Management'} shared an announcement.`,
          tag: `announcement-${data?.announcement?._id || Date.now()}`,
          url: messagingUrl
        });
      }
      window.dispatchEvent(new CustomEvent('newAnnouncementReceived', { detail: data }));
    });

    // Handle typing indicators
    newSocket.on('typing:start', (data) => {
      window.dispatchEvent(new CustomEvent('userTypingStart', { detail: data }));
    });

    newSocket.on('typing:stop', (data) => {
      window.dispatchEvent(new CustomEvent('userTypingStop', { detail: data }));
    });

    // Handle user online/offline status
    newSocket.on('user:online', (data) => {
      window.dispatchEvent(new CustomEvent('userOnline', { detail: data }));
    });

    // Shift reminder (30 min before shift)
    newSocket.on('shift:reminder', (data) => {
      if (shouldNotifyUser()) {
        showDeviceNotification({
          title: `Shift starts in ${data?.minutesBefore || 30} minutes`,
          body: data?.message || `Your shift starts at ${data?.startTime}.`,
          tag: `shift-reminder-${data?.shiftId}-${data?.minutesBefore || 30}`,
          url: scheduleUrl
        });
      }
      window.dispatchEvent(new CustomEvent('shiftReminder', { detail: data }));
    });

    // Shift transfer events
    newSocket.on('transfer:incoming', (data) => {
      if (shouldNotifyUser()) {
        showDeviceNotification({
          title: 'Shift transfer request',
          body: `${data?.from?.name || 'A teammate'} wants to transfer a shift to you.`,
          tag: `transfer-incoming-${data?.transfer?._id || Date.now()}`,
          url: scheduleUrl
        });
      }
      window.dispatchEvent(new CustomEvent('transferIncoming', { detail: data }));
    });

    newSocket.on('transfer:accepted', (data) => {
      if (shouldNotifyUser()) {
        showDeviceNotification({
          title: 'Shift transfer accepted',
          body: `${data?.by?.name || 'Your teammate'} accepted your shift transfer.`,
          tag: `transfer-accepted-${data?.transferId || Date.now()}`,
          url: scheduleUrl
        });
      }
      window.dispatchEvent(new CustomEvent('transferAccepted', { detail: data }));
    });

    newSocket.on('transfer:declined', (data) => {
      if (shouldNotifyUser()) {
        showDeviceNotification({
          title: 'Shift transfer declined',
          body: `${data?.by?.name || 'Your teammate'} declined your shift transfer.`,
          tag: `transfer-declined-${data?.transferId || Date.now()}`,
          url: scheduleUrl
        });
      }
      window.dispatchEvent(new CustomEvent('transferDeclined', { detail: data }));
    });

    // Shift assignment events
    newSocket.on('shift:assigned', (data) => {
      if (shouldNotifyUser()) {
        showDeviceNotification({
          title: 'New shift assigned',
          body: data?.message || 'A new shift needs your response.',
          tag: `shift-assigned-${data?.shift?._id || Date.now()}`,
          url: scheduleUrl
        });
      }
      window.dispatchEvent(new CustomEvent('shiftAssigned', { detail: data }));
    });

    newSocket.on('shift:response', (data) => {
      if (shouldNotifyUser()) {
        showDeviceNotification({
          title: 'Shift response received',
          body: `${data?.employeeName || 'An employee'} ${data?.assignmentStatus || 'responded'} a shift.`,
          tag: `shift-response-${data?.shiftId || Date.now()}`,
          url: scheduleUrl
        });
      }
      window.dispatchEvent(new CustomEvent('shiftResponse', { detail: data }));
    });

    // ── Late-permission events ──────────────────────────────────────────────

    // Admin receives a new late request
    newSocket.on('late_permission:new', (data) => {
      const relevantToBranch = !isBranchUser || (
        data?.branchId &&
        currentUser?.branchId &&
        String(data.branchId) === String(currentUser.branchId)
      );
      if (!relevantToBranch) {
        return;
      }

      refreshPendingLateCount();
      if (shouldNotifyUser()) {
        showDeviceNotification({
          title: `Late request - ${data?.employeeName || 'Employee'}`,
          body: data?.reason || 'An employee has requested a late arrival.',
          tag: `late-request-${data?.requestId || Date.now()}`,
          url: lateRequestUrl
        });
      }
      window.dispatchEvent(new CustomEvent('latePermissionNew', { detail: data }));
    });

    // Employee receives the admin's decision
    newSocket.on('late_permission:reviewed', (data) => {
      const { status, extraMinutes } = data || {};
      const body = status === 'approved_full'
        ? 'Your late request was approved — no late penalty today.'
        : status === 'approved_extension'
        ? `Your late request was approved with +${extraMinutes} extra minute${extraMinutes !== 1 ? 's' : ''}.`
        : 'Your late request was denied.';
      if (shouldNotifyUser()) {
        showDeviceNotification({
          title: 'Late request reviewed',
          body,
          tag: `late-reviewed-${data?.requestId || Date.now()}`,
          url: lateRequestUrl
        });
      }
      window.dispatchEvent(new CustomEvent('latePermissionReviewed', { detail: data }));
    });

    // Admin badge count update after a request is reviewed
    newSocket.on('late_permission:count', (data) => {
      const relevantToBranch = !isBranchUser || (
        data?.branchId &&
        currentUser?.branchId &&
        String(data.branchId) === String(currentUser.branchId)
      );
      if (!relevantToBranch) {
        return;
      }

      refreshPendingLateCount();
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [currentUser, isBranchUser, lateRequestUrl, messagingUrl, refreshPendingLateCount, scheduleUrl]);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const data = await apiRequest('/messages/unread-count');
      if (data.success) {
        setUnreadCount(parseUnreadCount(data));
      }
    } catch (err) {
      console.error('Fetch unread count error:', err);
    }
  };

  useEffect(() => {
    if (connected) {
      fetchUnreadCount();
      refreshPendingLateCount();
      
      // Poll for unread count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [connected, refreshPendingLateCount]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return undefined;
    }

    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type === 'notification-click' && event.data.url) {
        window.location.href = event.data.url;
      }
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  const value = {
    socket,
    connected,
    unreadCount,
    setUnreadCount,
    fetchUnreadCount,
    pendingLateCount,
    setPendingLateCount
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
