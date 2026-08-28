import { useCallback, useState } from 'react';

import { useToast } from '@/context/toast-context';
import { fetchEmployees } from '@/api/employees';
import { useApi } from '@/hooks/useApi';
import { deleteDocument, fetchDocuments, uploadDocument } from '@/api/documents';

/** The document vault: filter, upload, and remove employee documents. */
export function useDocuments() {
  const toast = useToast();
  const [filters, setFilters] = useState({ employeeId: '', category: '' });
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const query = useApi((signal) => fetchDocuments(filters, signal), [
    filters.employeeId,
    filters.category,
  ]);
  const employeeQuery = useApi((signal) => fetchEmployees(signal), []);

  const setFilter = useCallback((key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  }, []);

  const upload = useCallback(
    async (values) => {
      setUploading(true);
      try {
        const data = await uploadDocument(values);
        if (!data?.success) throw new Error(data?.message || 'Upload failed.');

        query.refetch();
        toast.success('Document uploaded.');
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not upload that document.');
        return false;
      } finally {
        setUploading(false);
      }
    },
    [query, toast],
  );

  const remove = useCallback(
    async (document) => {
      setDeleting(true);
      try {
        const data = await deleteDocument(document._id);
        if (!data?.success) throw new Error(data?.message || 'Delete failed.');

        query.refetch();
        toast.success('Document deleted.');
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not delete that document.');
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [query, toast],
  );

  return {
    documents: query.data?.data || [],
    employees: employeeQuery.data?.data || [],
    filters,
    setFilter,
    isFiltered: Boolean(filters.employeeId || filters.category),
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    upload,
    uploading,
    remove,
    deleting,
  };
}
