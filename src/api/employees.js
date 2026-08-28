import { request } from '@/api/client';

/** Every `/employees` call, in one place. */

export const fetchEmployees = (signal) => request('/employees', { signal });

/** Creates an employee. The response carries a temporary password to share. */
export const createEmployee = (payload) =>
  request('/employees', { method: 'POST', json: payload });

export const updateEmployee = (employeeId, payload) =>
  request(`/employees/${employeeId}`, { method: 'PUT', json: payload });

export const deleteEmployee = (employeeId) =>
  request(`/employees/${employeeId}`, { method: 'DELETE' });

/** The signed-in employee's own record. */
export const fetchMyEmployeeRecord = (signal) =>
  request('/employees/me', { signal });
