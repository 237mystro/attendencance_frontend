import { downloadCsv, toFileStem } from '@/lib/download';

/** Fields an event can collect from attendees. */

export const PRESET_FIELDS = [
  { name: 'name', label: 'Full name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'age', label: 'Age', type: 'number' },
  {
    name: 'gender',
    label: 'Gender',
    type: 'select',
    options: ['Male', 'Female', 'Prefer not to say'],
  },
  { name: 'organization', label: 'Organization', type: 'text' },
  { name: 'occupation', label: 'Occupation', type: 'text' },
  { name: 'nationality', label: 'Nationality', type: 'text' },
];

export const FIELD_TYPES = ['text', 'email', 'number', 'date', 'select'];

export const FIELD_TYPE_OPTIONS = FIELD_TYPES.map((type) => ({
  value: type,
  label: type.charAt(0).toUpperCase() + type.slice(1),
}));

export const WIZARD_STEPS = [
  { id: 'fields', title: 'What to collect' },
  { id: 'location', title: 'Where it is' },
  { id: 'details', title: 'Event details' },
];

export const DEFAULT_EVENT_RADIUS = 100;

export const emptyEvent = () => ({
  title: '',
  description: '',
  date: '',
  location: { latitude: '', longitude: '', radius: DEFAULT_EVENT_RADIUS, address: '' },
  requiredFields: [],
});

export const emptyCustomField = () => ({ label: '', type: 'text', options: '' });

/**
 * Turns a human label into a stable field name.
 *
 * Attendee answers are keyed by this, so it must be URL- and object-safe;
 * a timestamped fallback covers a label made entirely of punctuation.
 */
export const toFieldName = (label) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || `field_${Date.now()}`;

/**
 * Reads one attendee's answer for a field.
 *
 * The four preset identity fields are stored as top-level columns; everything
 * else lives under `customFields`.
 */
const TOP_LEVEL_FIELDS = ['name', 'email', 'phone', 'age'];

export const attendeeValue = (attendee, field) =>
  TOP_LEVEL_FIELDS.includes(field.name)
    ? (attendee[field.name] ?? '')
    : (attendee.customFields?.[field.name] ?? '');

/** Whether the event has already happened. */
export const isPastEvent = (event) =>
  Boolean(event.date) && new Date(event.date) < new Date();

/** Exports the attendee list as CSV, using the event's own field set. */
export const exportAttendeesCsv = (event, attendees) => {
  const fields = event.requiredFields?.length
    ? event.requiredFields
    : [
        { name: 'name', label: 'Name' },
        { name: 'email', label: 'Email' },
      ];

  downloadCsv(
    `${toFileStem(event.title, 'event')}-attendees.csv`,
    [...fields.map((field) => field.label || field.name), 'Submitted at'],
    attendees.map((attendee) => [
      ...fields.map((field) => attendeeValue(attendee, field)),
      attendee.createdAt || '',
    ]),
  );
};

/** The shareable link an attendee opens to check in. */
export const publicEventUrl = (event) =>
  `${window.location.origin}/event/${event.companySlug || event.companyId}/${event.eventToken || event._id}`;
