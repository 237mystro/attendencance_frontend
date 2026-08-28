import { rawRequest } from '@/api/client';

/** Triggers a browser download for a Blob, cleaning up the object URL after. */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/** Turns a name into something safe and readable as a filename stem. */
export const toFileStem = (value, fallback = 'download') =>
  String(value || fallback)
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '');

/**
 * Fetches a binary document from the API and saves it.
 *
 * Goes through `rawRequest` rather than `request` because the response is a
 * PDF, not JSON — but it still carries the bearer token and still trips the
 * shared 401 handling.
 *
 * @throws when the server does not return a document.
 */
export const downloadDocument = async (path, filename, options = {}) => {
  const response = await rawRequest(path, options);

  if (!response.ok) {
    // Error bodies are JSON even when the success body would not be.
    let message = 'Could not generate the document.';
    try {
      const data = await response.json();
      message = data.message || data.error || message;
    } catch {
      /* Keep the default message. */
    }
    throw new Error(message);
  }

  downloadBlob(await response.blob(), filename);
};

/**
 * Builds a CSV from rows of values and saves it.
 *
 * Every cell is quoted and inner quotes doubled, so a name containing a comma
 * or a quotation mark cannot break the column alignment.
 */
export const downloadCsv = (filename, headers, rows) => {
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))];

  downloadBlob(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }), filename);
};
