import { Paperclip, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { Alert, Button, Input, Modal, Select, Textarea } from '@/components/ui';
import { formatFileSize } from '@/lib/formatters';
import { DOCUMENT_CATEGORIES, MAX_DOCUMENT_BYTES } from '@/api/documents';

/** Attaches a document to an employee's record. */
export function DocumentUploadDialog({ employees, onClose, onUpload, uploading }) {
  const fileInput = useRef(null);
  const [values, setValues] = useState({
    employeeId: '',
    title: '',
    description: '',
    category: 'other',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const patch = (changes) => {
    setValues((current) => ({ ...current, ...changes }));
    setError('');
  };

  const pickFile = (event) => {
    const picked = event.target.files?.[0];
    event.target.value = '';
    if (!picked) return;

    if (picked.size > MAX_DOCUMENT_BYTES) {
      setError(
        `${picked.name} is ${formatFileSize(picked.size)} — the limit is ${formatFileSize(MAX_DOCUMENT_BYTES)}.`,
      );
      return;
    }

    setError('');
    setFile(picked);
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!values.employeeId) return setError('Choose an employee.');
    if (!values.title.trim()) return setError('Give the document a title.');
    if (!file) return setError('Choose a file to upload.');

    const done = await onUpload({ ...values, title: values.title.trim(), file });
    if (done) onClose();
    return undefined;
  };

  const employeeOptions = employees.map((employee) => ({
    value: employee._id,
    label: `${employee.name} · ${employee.position || 'No position'}`,
  }));

  return (
    <Modal
      open
      onClose={uploading ? undefined : onClose}
      closeOnBackdrop={!uploading}
      title="Upload a document"
      description="Stored against one employee's record."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button form="document-form" type="submit" loading={uploading}>
            Upload
          </Button>
        </>
      }
    >
      <form
        id="document-form"
        onSubmit={submit}
        noValidate
        className="flex flex-col gap-4"
      >
        {error && <Alert tone="danger">{error}</Alert>}

        <Select
          label="Employee"
          required
          placeholder="Select an employee"
          options={employeeOptions}
          value={values.employeeId}
          onChange={(event) => patch({ employeeId: event.target.value })}
        />

        <Input
          label="Title"
          required
          value={values.title}
          onChange={(event) => patch({ title: event.target.value })}
          placeholder="e.g. Signed employment contract"
        />

        <Select
          label="Category"
          options={DOCUMENT_CATEGORIES}
          value={values.category}
          onChange={(event) => patch({ category: event.target.value })}
        />

        <Textarea
          label="Description"
          rows={2}
          value={values.description}
          onChange={(event) => patch({ description: event.target.value })}
          hint="Optional."
        />

        <div>
          <p className="text-sm font-bold text-ink dark:text-ink-dark">File</p>
          <input
            ref={fileInput}
            type="file"
            onChange={pickFile}
            className="sr-only"
            aria-label="Choose a document to upload"
          />
          <Button
            variant="secondary"
            fullWidth
            className="mt-1.5"
            startIcon={<Paperclip aria-hidden="true" className="size-4" />}
            onClick={() => fileInput.current?.click()}
          >
            {file ? `${file.name} · ${formatFileSize(file.size)}` : 'Choose a file'}
          </Button>
          <p className="mt-1 text-xs text-muted dark:text-muted-soft">
            Up to {formatFileSize(MAX_DOCUMENT_BYTES)}.
          </p>
        </div>

        <Alert tone="info">
          <Upload aria-hidden="true" className="mr-1.5 inline size-4" />
          Only administrators and HR can see documents in the vault.
        </Alert>
      </form>
    </Modal>
  );
}
