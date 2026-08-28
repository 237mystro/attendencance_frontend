import { APP_EVENTS } from '@/hooks/useAppEvent';
import { portalPath } from '@/constants/routes';

/**
 * Declarative map of every server socket event.
 *
 * The original app repeated the same three steps — check the notification
 * preference, show an OS notification, re-broadcast as a window event — in a
 * dozen near-identical handlers. Describing each event as data instead means
 * `SocketContext` runs that sequence once, and adding an event is one entry.
 *
 * Each entry may define:
 *   appEvent    window event name to re-broadcast under
 *   notify      (payload) => ({ title, body, tag }) | null   — null to stay silent
 *   linkKey     portal route key the notification opens
 *   refreshLateCount  true → re-fetch the pending late-request badge
 *   branchScoped      true → ignore payloads for another branch
 */
export const SOCKET_EVENTS = {
  'message:receive': {
    appEvent: APP_EVENTS.newMessage,
    linkKey: 'messaging',
    bumpUnread: true,
    notify: (payload) => ({
      title: payload?.sender?.name || payload?.message?.sender?.name || 'New message',
      body: payload?.message?.content || 'You received a new message.',
      tag: `message-${payload?.message?._id || Date.now()}`,
    }),
  },

  'announcement:receive': {
    appEvent: APP_EVENTS.newAnnouncement,
    linkKey: 'messaging',
    bumpUnread: true,
    notify: (payload) => ({
      title: 'New announcement',
      body:
        payload?.announcement?.content ||
        `${payload?.sender?.name || 'Management'} shared an announcement.`,
      tag: `announcement-${payload?.announcement?._id || Date.now()}`,
    }),
  },

  'typing:start': { appEvent: APP_EVENTS.typingStart },
  'typing:stop': { appEvent: APP_EVENTS.typingStop },
  'user:online': { appEvent: APP_EVENTS.userOnline },

  'shift:reminder': {
    appEvent: APP_EVENTS.shiftReminder,
    linkKey: 'schedule',
    notify: (payload) => ({
      title: `Shift starts in ${payload?.minutesBefore || 30} minutes`,
      body: payload?.message || `Your shift starts at ${payload?.startTime}.`,
      tag: `shift-reminder-${payload?.shiftId}-${payload?.minutesBefore || 30}`,
    }),
  },

  'shift:assigned': {
    appEvent: APP_EVENTS.shiftAssigned,
    linkKey: 'schedule',
    notify: (payload) => ({
      title: 'New shift assigned',
      body: payload?.message || 'A new shift needs your response.',
      tag: `shift-assigned-${payload?.shift?._id || Date.now()}`,
    }),
  },

  'shift:response': {
    appEvent: APP_EVENTS.shiftResponse,
    linkKey: 'scheduling',
    notify: (payload) => ({
      title: 'Shift response received',
      body: `${payload?.employeeName || 'An employee'} ${payload?.assignmentStatus || 'responded'} a shift.`,
      tag: `shift-response-${payload?.shiftId || Date.now()}`,
    }),
  },

  'transfer:incoming': {
    appEvent: APP_EVENTS.transferIncoming,
    linkKey: 'schedule',
    notify: (payload) => ({
      title: 'Shift transfer request',
      body: `${payload?.from?.name || 'A teammate'} wants to transfer a shift to you.`,
      tag: `transfer-incoming-${payload?.transfer?._id || Date.now()}`,
    }),
  },

  'transfer:accepted': {
    appEvent: APP_EVENTS.transferAccepted,
    linkKey: 'schedule',
    notify: (payload) => ({
      title: 'Shift transfer accepted',
      body: `${payload?.by?.name || 'Your teammate'} accepted your shift transfer.`,
      tag: `transfer-accepted-${payload?.transferId || Date.now()}`,
    }),
  },

  'transfer:declined': {
    appEvent: APP_EVENTS.transferDeclined,
    linkKey: 'schedule',
    notify: (payload) => ({
      title: 'Shift transfer declined',
      body: `${payload?.by?.name || 'Your teammate'} declined your shift transfer.`,
      tag: `transfer-declined-${payload?.transferId || Date.now()}`,
    }),
  },

  'late_permission:new': {
    appEvent: APP_EVENTS.latePermissionNew,
    linkKey: 'lateRequests',
    branchScoped: true,
    refreshLateCount: true,
    notify: (payload) => ({
      title: `Late request — ${payload?.employeeName || 'Employee'}`,
      body: payload?.reason || 'An employee has requested a late arrival.',
      tag: `late-request-${payload?.requestId || Date.now()}`,
    }),
  },

  'late_permission:reviewed': {
    appEvent: APP_EVENTS.latePermissionReviewed,
    linkKey: 'lateRequest',
    notify: (payload) => ({
      title: 'Late request reviewed',
      body: describeLateDecision(payload),
      tag: `late-reviewed-${payload?.requestId || Date.now()}`,
    }),
  },

  // Badge-only update after an admin reviews a request elsewhere.
  'late_permission:count': {
    branchScoped: true,
    refreshLateCount: true,
  },

  // An employee checked in from a device they have not used before. Broadcast
  // only — the attendance dashboard refreshes its queue and raises its own
  // toast, rather than an OS notification for something already on screen.
  'attendance:device_flagged': {
    appEvent: APP_EVENTS.deviceFlagged,
  },
};

/** Wording for the three possible outcomes of a late-arrival request. */
function describeLateDecision(payload) {
  const { status, extraMinutes } = payload || {};

  if (status === 'approved_full') {
    return 'Your late request was approved — no late penalty today.';
  }
  if (status === 'approved_extension') {
    const plural = extraMinutes === 1 ? '' : 's';
    return `Your late request was approved with +${extraMinutes} extra minute${plural}.`;
  }
  return 'Your late request was denied.';
}

/**
 * Branch users should only be notified about their own branch. A payload with
 * no branch id is treated as company-wide and always passes.
 */
export const isRelevantToUser = (config, payload, user) => {
  if (!config.branchScoped) return true;
  if (!user?.branchId) return true;
  if (!payload?.branchId) return true;
  return String(payload.branchId) === String(user.branchId);
};

/** Resolves the in-app URL a notification should open for this user's portal. */
export const notificationUrl = (config, role) =>
  config.linkKey ? portalPath(role, config.linkKey) : null;
