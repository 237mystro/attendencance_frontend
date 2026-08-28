import { buildQuery, request } from '@/api/client';
import { fileToBase64 } from '@/lib/upload';

/** Employee document storage. */

export const fetchDocuments = (filters, signal) =>
  request(`/documents${buildQuery(filters)}`, { signal });

/**
 * Uploads a document.
 *
 * The API takes the file inline as base64 rather than multipart, so the file
 * is encoded here — which is also why the size limit matters: base64 inflates
 * the payload by roughly a third.
 */
export const uploadDocument = async ({ file, ...fields }) => {
  const fileBase64 = await fileToBase64(file);

  return request('/documents', {
    method: 'POST',
    json: {
      ...fields,
      fileBase64,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    },
  });
};

export const deleteDocument = (documentId) =>
  request(`/documents/${documentId}`, { method: 'DELETE' });

export const DOCUMENT_CATEGORIES = [
  { value: 'contract', label: 'Contract' },
  { value: 'id', label: 'ID / passport' },
  { value: 'timesheet', label: 'Timesheet' },
  { value: 'other', label: 'Other' },
];

export const CATEGORY_TONES = {
  contract: 'brand',
  id: 'info',
  timesheet: 'warn',
  other: 'neutral',
};

/** Base64 inflates by ~33%, so cap the source file well under the body limit. */
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
