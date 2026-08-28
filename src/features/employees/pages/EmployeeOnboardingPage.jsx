import { ArrowLeft, ArrowRight, UserPlus } from 'lucide-react';
import { useState } from 'react';

import { Alert, Button, PageWrapper, Panel } from '@/components/ui';
import { useToast } from '@/context/toast-context';
import { useForm } from '@/hooks/useForm';
import { createEmployee } from '@/api/employees';
import { OnboardingStepFields } from '../components/OnboardingStepFields';
import { WizardSteps } from '../components/WizardSteps';
import {
  EMPTY_EMPLOYEE,
  ONBOARDING_STEPS,
  toEmployeePayload,
  validateEmployee,
} from '../employee-fields';

/**
 * Guided three-step alternative to the add-employee dialog.
 *
 * Each step validates only its own fields, so someone cannot advance past a
 * mistake but is never shown errors for questions they have not reached.
 */
export function EmployeeOnboardingPage() {
  const toast = useToast();
  const [stepIndex, setStepIndex] = useState(0);
  const [created, setCreated] = useState(null);

  const form = useForm({
    initialValues: EMPTY_EMPLOYEE,
    validate: validateEmployee,
    onSubmit: async (values) => {
      const data = await createEmployee(toEmployeePayload(values));
      if (!data?.success) {
        throw new Error(data?.message || 'Failed to create the employee account.');
      }

      setCreated({
        name: values.name,
        temporaryPassword: data.data?.temporaryPassword,
      });
      toast.success(`${values.name} has been added.`);
      form.reset(EMPTY_EMPLOYEE);
      setStepIndex(0);
    },
  });

  const step = ONBOARDING_STEPS[stepIndex];
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;

  /** Advances only when this step's own fields are valid. */
  const goNext = () => {
    const errors = validateEmployee(form.values);
    const stepErrors = Object.fromEntries(
      step.fields.map((field) => [field, errors[field]]).filter(([, message]) => message),
    );

    if (Object.keys(stepErrors).length) {
      form.setErrors(stepErrors);
      // Without this the messages would be stored but hidden, since nothing on
      // this step has been blurred yet.
      form.markTouched(step.fields);
      document.querySelector(`[name="${Object.keys(stepErrors)[0]}"]`)?.focus();
      return;
    }

    form.setErrors({});
    setStepIndex((current) => current + 1);
  };

  const goBack = () => {
    form.setErrors({});
    setStepIndex((current) => current - 1);
  };

  return (
    <PageWrapper className="max-w-2xl">
      <header className="mb-5 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-panel bg-brand-50 text-brand-500 dark:bg-brand-500/15"
        >
          <UserPlus className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-ink dark:text-ink-dark">
            Add new employee
          </h2>
          <p className="text-sm text-muted dark:text-muted-soft">
            Create a workspace account for your employee.
          </p>
        </div>
      </header>

      {created && (
        <Alert tone="success" className="mb-5">
          <p className="font-bold">{created.name} has been added.</p>
          {created.temporaryPassword ? (
            <p className="mt-1">
              Temporary password:{' '}
              <span className="font-mono font-bold">{created.temporaryPassword}</span>{' '}
              — share it with them; it is not shown again.
            </p>
          ) : (
            <p className="mt-1">They will receive login instructions by email.</p>
          )}
        </Alert>
      )}

      <Panel interactive={false}>
        <WizardSteps steps={ONBOARDING_STEPS} activeIndex={stepIndex} />

        <form
          onSubmit={form.handleSubmit}
          noValidate
          className="mt-6 flex flex-col gap-4"
        >
          {form.submitError && <Alert tone="danger">{form.submitError}</Alert>}

          <OnboardingStepFields stepId={step.id} form={form} />

          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="secondary"
              disabled={stepIndex === 0 || form.submitting}
              startIcon={<ArrowLeft aria-hidden="true" className="size-4" />}
              onClick={goBack}
            >
              Back
            </Button>

            {isLastStep ? (
              <Button type="submit" loading={form.submitting}>
                {form.submitting ? 'Creating…' : 'Create employee'}
              </Button>
            ) : (
              <Button
                endIcon={<ArrowRight aria-hidden="true" className="size-4" />}
                onClick={goNext}
              >
                Continue
              </Button>
            )}
          </div>
        </form>
      </Panel>
    </PageWrapper>
  );
}
