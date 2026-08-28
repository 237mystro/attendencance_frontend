import { FolderLock, Upload } from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  ConfirmDialog,
  DataTable,
  PageHero,
  PageWrapper,
  Panel,
  Select,
} from '@/components/ui';
import { DOCUMENT_CATEGORIES } from '@/api/documents';
import { documentColumns } from '../document-columns';
import { DocumentUploadDialog } from '../components/DocumentUploadDialog';
import { useDocuments } from '../hooks/useDocuments';

/** Employee documents: contracts, IDs, timesheets, and anything else. */
export function DocumentVaultPage() {
  const vault = useDocuments();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const columns = documentColumns({ onDelete: setPendingDelete });

  const employeeOptions = [
    { value: '', label: 'All employees' },
    ...vault.employees.map((employee) => ({
      value: employee._id,
      label: employee.name,
    })),
  ];

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Document vault"
        title="Employee documents"
        subtitle="Contracts, identification, timesheets, and anything else worth keeping on file."
        actions={
          <Button
            variant="secondary"
            className="border-white/20 bg-white/15 text-white hover:bg-white/25"
            startIcon={<Upload aria-hidden="true" className="size-4" />}
            onClick={() => setUploadOpen(true)}
          >
            Upload
          </Button>
        }
      />

      <Panel
        title="Documents"
        subtitle={`${vault.documents.length} stored`}
        interactive={false}
        action={
          <div className="flex flex-wrap gap-2">
            <Select
              label="Employee"
              wrapperClassName="w-48"
              options={employeeOptions}
              value={vault.filters.employeeId}
              onChange={(event) => vault.setFilter('employeeId', event.target.value)}
            />
            <Select
              label="Category"
              wrapperClassName="w-40"
              options={[{ value: '', label: 'All' }, ...DOCUMENT_CATEGORIES]}
              value={vault.filters.category}
              onChange={(event) => vault.setFilter('category', event.target.value)}
            />
          </div>
        }
      >
        <DataTable
          columns={columns}
          rows={vault.documents}
          loading={vault.loading}
          error={vault.error}
          onRetry={vault.refetch}
          caption="Employee documents"
          emptyIcon={<FolderLock aria-hidden="true" className="size-6" />}
          emptyTitle={vault.isFiltered ? 'Nothing matches' : 'No documents yet'}
          emptyDescription={
            vault.isFiltered
              ? 'Try a different employee or category.'
              : 'Upload a contract or ID to start the vault.'
          }
          emptyAction={
            !vault.isFiltered && (
              <Button
                startIcon={<Upload aria-hidden="true" className="size-4" />}
                onClick={() => setUploadOpen(true)}
              >
                Upload a document
              </Button>
            )
          }
        />
      </Panel>

      {uploadOpen && (
        <DocumentUploadDialog
          employees={vault.employees}
          onClose={() => setUploadOpen(false)}
          onUpload={vault.upload}
          uploading={vault.uploading}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        loading={vault.deleting}
        title="Delete this document?"
        confirmLabel="Delete"
        onConfirm={async () => {
          await vault.remove(pendingDelete);
          setPendingDelete(null);
        }}
      >
        <p className="text-sm leading-relaxed text-muted dark:text-muted-soft">
          <strong>{pendingDelete?.title}</strong> will be permanently removed from{' '}
          {pendingDelete?.employeeId?.name || 'this employee'}&rsquo;s record. This
          cannot be undone.
        </p>
      </ConfirmDialog>
    </PageWrapper>
  );
}
