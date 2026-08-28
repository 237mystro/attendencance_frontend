import { useCallback, useState } from 'react';

import { useToast } from '@/context/toast-context';
import { getUserLocation } from '@/lib/geolocation';
import {
  PRESET_FIELDS,
  WIZARD_STEPS,
  emptyCustomField,
  emptyEvent,
  toFieldName,
} from '../event-fields';

/**
 * The three-step event creation wizard.
 *
 * Each step validates only what it owns, so someone cannot skip past a missing
 * location but is never shown errors for details they have not reached.
 */
export function useEventWizard({ onCreate }) {
  const toast = useToast();

  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState(emptyEvent);
  const [availableFields, setAvailableFields] = useState(PRESET_FIELDS);
  const [customField, setCustomField] = useState(emptyCustomField);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const [created, setCreated] = useState(null);

  const step = WIZARD_STEPS[stepIndex];

  const patch = (changes) => {
    setValues((current) => ({ ...current, ...changes }));
    setError('');
  };

  const patchLocation = (changes) =>
    patch({ location: { ...values.location, ...changes } });

  const toggleField = (field) => {
    const chosen = values.requiredFields.some((item) => item.name === field.name);
    patch({
      requiredFields: chosen
        ? values.requiredFields.filter((item) => item.name !== field.name)
        : [...values.requiredFields, { ...field, required: true }],
    });
  };

  /** Adds a field of the organiser's own, and selects it. */
  const addCustomField = () => {
    if (!customField.label.trim()) {
      setError('Give the field a label.');
      return;
    }

    const name = toFieldName(customField.label);
    if (availableFields.some((field) => field.name === name)) {
      setError('A field with that name already exists.');
      return;
    }

    const field = {
      name,
      label: customField.label.trim(),
      type: customField.type,
      options:
        customField.type === 'select'
          ? customField.options.split(',').map((option) => option.trim()).filter(Boolean)
          : [],
      required: true,
    };

    setAvailableFields((current) => [...current, field]);
    patch({ requiredFields: [...values.requiredFields, field] });
    setCustomField(emptyCustomField());
  };

  const useMyLocation = useCallback(async () => {
    setLocating(true);
    try {
      const fix = await getUserLocation();
      patchLocation({ latitude: fix.latitude, longitude: fix.longitude });
      toast.success(`Location captured to ±${Math.round(fix.accuracy)} m.`);
    } catch (caught) {
      setError(caught?.message || 'Could not read your location.');
    } finally {
      setLocating(false);
    }
    // `patchLocation` closes over the current values; recreating it per render
    // is fine here because this only runs from a click.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, values.location]);

  /** Returns a message when the current step is incomplete. */
  const validateStep = () => {
    if (step.id === 'fields' && !values.requiredFields.length) {
      return 'Choose at least one field to collect.';
    }
    if (step.id === 'location' && (!values.location.latitude || !values.location.longitude)) {
      return 'Place the event on the map.';
    }
    if (step.id === 'details') {
      if (!values.title.trim()) return 'Give the event a title.';
      if (!values.date) return 'Choose a date.';
    }
    return undefined;
  };

  const next = () => {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }
    setError('');
    setStepIndex((current) => current + 1);
  };

  const back = () => {
    setError('');
    setStepIndex((current) => current - 1);
  };

  const submit = async () => {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }
    const event = await onCreate(values);
    if (event) setCreated(event);
  };

  return {
    step,
    stepIndex,
    isLastStep: stepIndex === WIZARD_STEPS.length - 1,
    values,
    availableFields,
    customField,
    setCustomField,
    error,
    locating,
    created,
    patch,
    patchLocation,
    toggleField,
    addCustomField,
    useMyLocation,
    next,
    back,
    submit,
  };
}
