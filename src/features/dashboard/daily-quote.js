/**
 * A short reflection shown on each dashboard.
 *
 * Chosen by day of year rather than at random, so everyone in the company sees
 * the same one on the same day and it does not change on every re-render.
 */

const GENERAL = [
  {
    focus: 'Steady progress',
    text: 'Good work is rarely rushed. Quiet consistency builds results people can trust.',
  },
  {
    focus: 'Wise leadership',
    text: 'Lead with clarity, act with fairness, and let your work speak before your words do.',
  },
  {
    focus: 'Teamwork',
    text: 'Strong teams move farther when each person carries their part with care.',
  },
  {
    focus: 'Discipline',
    text: 'Order creates room for excellence. Small habits shape dependable outcomes.',
  },
  {
    focus: 'Integrity',
    text: 'The most lasting systems are built on honesty, patience, and thoughtful decisions.',
  },
  {
    focus: 'Focus',
    text: 'Do the next right task well. Momentum grows from faithful attention to what matters.',
  },
  {
    focus: 'Service',
    text: 'Work gains meaning when it helps people move through the day with more peace and dignity.',
  },
];

const BY_AUDIENCE = {
  leader: [
    {
      focus: 'Clarity',
      text: 'When priorities are clear, teams spend less energy guessing and more energy delivering.',
    },
    {
      focus: 'Stewardship',
      text: 'Strong leadership shows in the care given to people, process, and the details that sustain both.',
    },
    {
      focus: 'Judgment',
      text: 'Wise decisions rarely shout. They bring calm, direction, and a clearer next step.',
    },
    {
      focus: 'Responsibility',
      text: 'Good leaders make the work lighter for others by bringing order where confusion used to live.',
    },
  ],
  branch: [
    {
      focus: 'Order',
      text: 'Well-run branches thrive when each action supports the whole team, not just the moment.',
    },
    {
      focus: 'Follow-through',
      text: 'Operations become dependable when important tasks are finished with care, not left half-done.',
    },
    {
      focus: 'Coordination',
      text: 'Teams work best when timing, communication, and responsibility move together.',
    },
    {
      focus: 'Readiness',
      text: 'Prepared teams handle pressure better because they built good habits in quieter moments.',
    },
  ],
  employee: [
    {
      focus: 'Consistency',
      text: 'A good day of work often begins with showing up well and doing the small things with care.',
    },
    {
      focus: 'Reliability',
      text: 'Trust is built little by little, through steady effort and work others can count on.',
    },
    {
      focus: 'Craft',
      text: 'Every task done thoughtfully adds value, even when it seems ordinary at first.',
    },
    {
      focus: 'Discipline',
      text: 'Progress grows when attention stays on what matters most, one faithful step at a time.',
    },
  ],
};

const dayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
};

/** @param {'leader'|'branch'|'employee'} [audience] */
export const getDailyQuote = (audience = 'general', date = new Date()) => {
  const pool = BY_AUDIENCE[audience] || GENERAL;
  return pool[dayOfYear(date) % pool.length];
};

/** Time-of-day greeting, used in the dashboard headings. */
export const greeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};
