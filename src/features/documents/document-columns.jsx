import { Download, Trash2 } from 'lucide-react';

import { Badge, Button, IconButton } from '@/components/ui';
import { formatDate, formatFileSize } from '@/lib/formatters';
import { CATEGORY_TONES, DOCUMENT_CATEGORIES } from '@/api/documents';

const categoryLabel = (value) =>
  DOCUMENT_CATEGORIES.find((item) => item.value === value)?.label || value;

/** Columns for the document vault. */
export const documentColumns = ({ onDelete }) => [
  {
    key: 'title',
    header: 'Document',
    primary: true,
    render: (document) => (
      <span>
        <span className="block font-semibold">{document.title}</span>
        {document.description && (
          <span className="block text-xs text-muted dark:text-muted-soft">
            {document.description}
          </span>
        )}
      </span>
    ),
  },
  {
    key: 'employee',
    header: 'Employee',
    render: (document) => document.employeeId?.name || 'Unknown',
  },
  {
    key: 'category',
    header: 'Category',
    render: (document) => (
      <Badge tone={CATEGORY_TONES[document.category] || 'neutral'}>
        {categoryLabel(document.category)}
      </Badge>
    ),
  },
  {
    key: 'fileSize',
    header: 'Size',
    align: 'right',
    render: (document) => formatFileSize(document.fileSize),
  },
  {
    key: 'createdAt',
    header: 'Uploaded',
    render: (document) => formatDate(document.createdAt),
  },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (document) => (
      <div className="flex justify-end gap-1">
        {document.fileUrl && (
          <Button
            as="a"
            href={document.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            variant="ghost"
            startIcon={<Download aria-hidden="true" className="size-4" />}
          >
            Open
          </Button>
        )}
        <IconButton
          label={`Delete ${document.title}`}
          size="sm"
          className="text-danger"
          onClick={() => onDelete(document)}
        >
          <Trash2 aria-hidden="true" />
        </IconButton>
      </div>
    ),
  },
];
