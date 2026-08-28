import { request } from '@/api/client';
import { uploadWithProgress } from '@/lib/upload';

/** Direct messages and company-wide announcements. */

/** Everyone the signed-in user may message, with unread counts. */
export const fetchContacts = (signal) => request('/messages/contacts', { signal });

/** The thread with one person. */
export const fetchThread = (userId, signal) =>
  request(`/messages/${userId}`, { signal });

/** Sends a message, optionally with attachments. */
export const sendMessage = ({ receiverId, content, files = [] }) => {
  const formData = new FormData();
  formData.append('receiverId', receiverId);
  formData.append('content', content);
  files.forEach((file) => formData.append('files', file));

  // Multipart, so no Content-Type header — the browser sets the boundary.
  return request('/messages/send', { method: 'POST', body: formData });
};

export const fetchAnnouncements = (signal) =>
  request('/messages/announcements', { signal });

/** Broadcasts to every employee. Reports upload progress for large files. */
export const sendAnnouncement = ({ content, files = [] }, onProgress) => {
  const formData = new FormData();
  formData.append('content', content);
  files.forEach((file) => formData.append('files', file));

  return uploadWithProgress('/messages/announcement', formData, onProgress);
};

/** Both shapes the API has used for a user reference. */
export const userIdOf = (user) => user?._id || user?.id || user;
