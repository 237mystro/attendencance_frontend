import { API_BASE_URL } from '@/constants/config';
import { getStoredToken } from './auth-session';

const UPLOAD_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Posts multipart form data with upload progress.
 *
 * Uses XHR rather than `fetch`, which still cannot report upload progress. A
 * 100 MB video on a slow connection needs a progress bar, or the page just
 * looks frozen.
 *
 * @param {string} path
 * @param {FormData} formData
 * @param {(percent: number) => void} [onProgress]
 * @returns {Promise<object>} The parsed JSON body.
 */
export const uploadWithProgress = (path, formData, onProgress) =>
  new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);

    const token = getStoredToken();
    if (token) request.setRequestHeader('Authorization', `Bearer ${token}`);

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      let parsed;
      try {
        parsed = JSON.parse(request.responseText);
      } catch {
        reject(new Error('The server sent a response we could not read.'));
        return;
      }

      if (request.status >= 200 && request.status < 300) {
        resolve(parsed);
      } else {
        reject(
          new Error(parsed.message || parsed.error || `Server error ${request.status}`),
        );
      }
    };

    request.onerror = () =>
      reject(new Error('Network error. Check your connection and try again.'));
    request.ontimeout = () =>
      reject(new Error('The upload timed out. Try a smaller file or a better connection.'));

    request.timeout = UPLOAD_TIMEOUT_MS;
    request.send(formData);
  });

/** Reads a File into a base64 data URL, for APIs that expect one inline. */
export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });

/** Broad category for an uploaded file, used to pick an icon. */
export const fileCategory = (file) => {
  const type = file?.type || '';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  return 'document';
};

/** File types the announcement and message composers accept. */
export const ACCEPTED_UPLOAD_TYPES = [
  'image/*',
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/3gpp',
  'video/ogg',
  'video/x-ms-wmv',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.csv',
].join(',');

export const MAX_UPLOAD_FILES = 5;
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
