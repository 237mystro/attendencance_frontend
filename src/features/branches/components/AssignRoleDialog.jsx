import { Alert, Button, Modal, Select } from '@/components/ui';
import { ROLES } from '@/constants/roles';
import { rules, useForm } from '@/hooks/useForm';

const ROLE_OPTIONS = [
  { value: ROLES.BRANCH_MANAGER, label: 'Branch manager' },
  { value: ROLES.BRANCH_HR, label: 'Branch HR' },
];

/**
 * Promotes an existing employee to run a branch.
 *
 * Only employees can be promoted, so the picker lists them by name and email —
 * two people sharing a first name is common and the email disambiguates.
 */
export function AssignRoleDialog({ open, branch, employees, onClose, onAssign, assigning }) {
  const form = useForm({
    initialValues: { userId: '', role: ROLES.BRANCH_MANAGER },
    validate: (values) => ({
      userId: rules.required(values.userId, 'An employee'),
    }),
    onSubmit: async (values) => {
      const assigned = await onAssign(branch, values);
      if (assigned) onClose();
    },
  });

  const employeeOptions = employees.map((employee) => ({
    value: employee._id,
    label: `${employee.name} · ${employee.email}`,
  }));

  return (
    <Modal
      open={open}
      onClose={assigning ? undefined : onClose}
      closeOnBackdrop={!assigning}
      title={`Assign a role at ${branch?.name || 'this branch'}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={assigning}>
            Cancel
          </Button>
          <Button form="assign-role-form" type="submit" loading={assigning}>
            Assign role
          </Button>
        </>
      }
    >
      <form
        id="assign-role-form"
        onSubmit={form.handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        {form.submitError && <Alert tone="danger">{form.submitError}</Alert>}

        {employeeOptions.length === 0 ? (
          <Alert tone="warn">
            There are no employees to promote yet. Add an employee first.
          </Alert>
        ) : (
          <>
            <Select
              label="Employee"
              required
              placeholder="Select an employee"
              options={employeeOptions}
              {...form.field('userId')}
            />
            <Select label="Role" required options={ROLE_OPTIONS} {...form.field('role')} />

            <Alert tone="info">
              They will gain access to the branch portal and can manage attendance,
              scheduling, and approvals for this branch only.
            </Alert>
          </>
        )}
      </form>
    </Modal>
  );
}
