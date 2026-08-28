import { request } from '@/api/client';

/** Events and their public, unauthenticated attendance links. */

export const fetchEvents = (signal) => request('/events', { signal });

export const createEvent = (payload) =>
  request('/events', { method: 'POST', json: payload });

export const updateEvent = (eventId, payload) =>
  request(`/events/${eventId}`, { method: 'PUT', json: payload });

export const deleteEvent = (eventId) =>
  request(`/events/${eventId}`, { method: 'DELETE' });

export const fetchAttendees = (eventId, signal) =>
  request(`/events/${eventId}/attendees`, { signal });

// ── Public endpoints — no session required ─────────────────────────────────

/** The event behind a shared link. */
export const fetchPublicEvent = (companyId, eventId, signal) =>
  request(`/events/public/${companyId}/${eventId}`, { auth: false, signal });

/** Records attendance from the public form. */
export const submitEventAttendance = (companyId, eventId, payload) =>
  request(`/events/${companyId}/${eventId}/attend`, {
    method: 'POST',
    auth: false,
    json: payload,
  });
