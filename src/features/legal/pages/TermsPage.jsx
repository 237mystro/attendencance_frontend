import { ArrowLeft, Scale } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { useForceLightMode } from '@/context/theme-context';
import {
  COMPANY_NAME,
  CONTACT_EMAIL,
  EFFECTIVE_DATE,
  PREAMBLE,
  TERMS_SECTIONS,
} from '../terms-content';

/** One numbered clause, rendered from the data in `terms-content.js`. */
function TermsSection({ index, section }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 flex gap-2 text-lg font-bold text-ink">
        <span className="text-brand-500">{index + 1}.</span>
        {section.title}
      </h2>

      <div className="flex flex-col gap-3 text-sm leading-relaxed text-slate-600">
        {section.paragraphs?.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}

        {section.bullets && (
          <ul className="flex flex-col gap-2">
            {section.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500"
                />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {section.footer && <p>{section.footer}</p>}

        {section.contact && (
          <address className="inline-block rounded-panel border border-line bg-slate-50 p-4 not-italic">
            <p className="text-sm font-bold text-ink">{COMPANY_NAME}</p>
            <p className="text-sm text-slate-600">
              Email:{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-brand-500 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </address>
        )}
      </div>
    </section>
  );
}

export function TermsPage() {
  const navigate = useNavigate();
  useForceLightMode();

  return (
    <main className="min-h-dvh bg-canvas py-6 md:py-10">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-5"
          startIcon={<ArrowLeft aria-hidden="true" />}
          onClick={() => navigate(-1)}
        >
          Go back
        </Button>

        <header className="mb-6 flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-panel bg-brand-500 text-white"
          >
            <Scale className="size-6" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-ink sm:text-3xl">
              Terms &amp; Conditions
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              {COMPANY_NAME} · Effective {EFFECTIVE_DATE}
            </p>
          </div>
        </header>

        <article className="rounded-panel border border-line bg-white p-5 sm:p-8">
          <p className="mb-8 rounded-panel border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">
            {PREAMBLE}
          </p>

          {TERMS_SECTIONS.map((section, index) => (
            <TermsSection key={section.title} index={index} section={section} />
          ))}

          <hr className="my-8 border-line" />

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-soft">
              Last updated: {EFFECTIVE_DATE} · {COMPANY_NAME}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button as={Link} to={ROUTES.login} variant="secondary" size="sm">
                Back to login
              </Button>
              <Button as={Link} to={ROUTES.register} size="sm">
                Create account
              </Button>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
