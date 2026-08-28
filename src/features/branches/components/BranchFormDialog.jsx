import { Alert, Button, Input, Modal, Textarea } from '@/components/ui';
import { rules, useForm } from '@/hooks/useForm';

/** Create or rename a branch. */
export function BranchFormDialog({ open, branch, onClose, onSave, saving }) {
  const isEditing = Boolean(branch);

  const form = useForm({
    initialValues: { name: branch?.name || '', address: branch?.address || '' },
    validate: (values) => ({ name: rules.required(values.name, 'Branch name') }),
    onSubmit: async (values) => {
      const saved = await onSave(
        { name: values.name.trim(), address: values.address.trim() },
        branch?._id,
      );
      if (saved) onClose();
    },
  });

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      closeOnBackdrop={!saving}
      title={isEditing ? 'Edit branch' : 'New branch'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button form="branch-form" type="submit" loading={saving}>
            {isEditing ? 'Save changes' : 'Create branch'}
          </Button>
        </>
      }
    >
      <form
        id="branch-form"
        onSubmit={form.handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        {form.submitError && <Alert tone="danger">{form.submitError}</Alert>}

        <Input label="Branch name" required autoFocus {...form.field('name')} />
        <Textarea
          label="Address"
          rows={2}
          hint="Optional. Shown on the branch card and QR poster."
          {...form.field('address')}
        />
      </form>
    </Modal>
  );
}
