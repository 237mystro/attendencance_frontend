import { useState } from 'react';

import { Alert, Button, Input, Modal, Select } from '@/components/ui';
import {
  SUPPORTED_COUNTRIES,
  getCountryConfig,
  getPhoneHelperText,
  normalizeNationalNumber,
} from '@/constants/countries';
import { useForm } from '@/hooks/useForm';
import {
  EMPTY_EMPLOYEE,
  emptyShift,
  toEmployeeFormValues,
  toEmployeePayload,
  validateEmployee,
} from '../employee-fields';
import { EmployeeShiftFields } from './EmployeeShiftFields';

const COUNTRY_OPTIONS = SUPPORTED_COUNTRIES.map((country) => ({
  value: country.code,
  label: `${country.name} (${country.dialCode})`,
}));

/** Add or edit an employee. Shifts are only offered when creating. */
export function EmployeeFormDialog({ open, employee, onClose, onSave, saving }) {
  const [shifts, setShifts] = useState([emptyShift()]);
  const isEditing = Boolean(employee);

  const form = useForm({
    initialValues: employee ? toEmployeeFormValues(employee) : EMPTY_EMPLOYEE,
    validate: (values) => validateEmployee(values, isEditing ? [] : shifts),
    onSubmit: async (values) => {
      const saved = await onSave(
        toEmployeePayload(values, isEditing ? [] : shifts),
        employee?._id,
      );
      if (saved) onClose();
    },
  });

  const country = getCountryConfig(form.values.countryCode);

  /** Switching country re-normalises both numbers against the new rules. */
  const handleCountryChange = (event) => {
    const code = event.target.value;
    form.setValues((current) => ({
      ...current,
      countryCode: code,
      phone: normalizeNationalNumber(current.phone, code),
      momoNumber: normalizeNationalNumber(current.momoNumber, code),
    }));
  };

  const phoneField = (name, label) => ({
    ...form.field(name),
    label,
    type: 'tel',
    inputMode: 'numeric',
    required: true,
    hint: getPhoneHelperText(form.values.countryCode),
    className: 'pl-16',
    startIcon: (
      <span className="text-sm font-bold text-slate-600 dark:text-muted-soft">
        {country.dialCode}
      </span>
    ),
    onChange: (event) =>
      form.setValue(name, normalizeNationalNumber(event.target.value, form.values.countryCode)),
  });

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      closeOnBackdrop={!saving}
      size="lg"
      title={isEditing ? 'Edit employee' : 'Add new employee'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button form="employee-form" type="submit" loading={saving}>
            {isEditing ? 'Update employee' : 'Add employee'}
          </Button>
        </>
      }
    >
      <form
        id="employee-form"
        onSubmit={form.handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        {form.submitError && <Alert tone="danger">{form.submitError}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" required autoFocus {...form.field('name')} />
          <Input label="Email address" type="email" required {...form.field('email')} />

          <Select
            label="Country"
            required
            value={form.values.countryCode}
            options={COUNTRY_OPTIONS}
            onChange={handleCountryChange}
          />
          <Input {...phoneField('phone', 'Phone number')} />
          <Input {...phoneField('momoNumber', 'Mobile money number')} />

          <Input label="Position" required {...form.field('position')} />
          <Input label="Department" {...form.field('department')} />

          <Input
            label={`Monthly salary (${country.currency})`}
            type="number"
            min={0}
            required
            {...form.field('salary')}
          />
          <Input
            label={`Pay per shift (${country.currency})`}
            type="number"
            min={0}
            required
            {...form.field('payPerShift')}
          />
        </div>

        {!isEditing && (
          <EmployeeShiftFields
            shifts={shifts}
            onChange={setShifts}
            error={form.errors.shifts}
          />
        )}
      </form>
    </Modal>
  );
}
