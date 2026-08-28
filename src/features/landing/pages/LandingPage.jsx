import { useForceLightMode } from '@/context/theme-context';
import { LandingCta, LandingFooter } from '../components/LandingCta';
import { LandingHero } from '../components/LandingHero';
import { LandingNav } from '../components/LandingNav';
import {
  BusinessValue,
  FeatureGrid,
  SecurityAndRollout,
  StatsBar,
} from '../components/LandingSections';
import { PersonaGrid } from '../components/PersonaGrid';

/**
 * Public marketing page.
 *
 * Locked to light mode, as in the source — the artwork and gradients here are
 * built for a light backdrop and the app's dark palette would fight them.
 */
export function LandingPage() {
  useForceLightMode();

  return (
    <div className="bg-[#f5f8fe] text-brand-950">
      {/* Lets keyboard users jump past the nav on first Tab. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-btn focus:bg-brand-500 focus:px-4 focus:py-2 focus:font-bold focus:text-white"
      >
        Skip to content
      </a>

      <LandingNav />

      <main id="main">
        <LandingHero />
        <StatsBar />
        <FeatureGrid />
        <BusinessValue />
        <PersonaGrid />
        <SecurityAndRollout />
        <LandingCta />
      </main>

      <LandingFooter />
    </div>
  );
}
