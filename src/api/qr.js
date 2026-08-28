import { request } from '@/api/client';

/** The printable attendance QR codes, company-wide and per branch. */

export const fetchCompanyQr = (signal) => request('/locations/company-qr', { signal });

export const regenerateCompanyQr = () =>
  request('/locations/company-qr/regenerate', { method: 'POST' });

export const fetchBranchQr = (signal) => request('/branches/mine/qr', { signal });

export const regenerateBranchQr = () =>
  request('/branches/mine/qr/regenerate', { method: 'POST' });
