'use client';
import { useCallback, useEffect, useState } from 'react';
import { STATE_RULES, defaultHasCashFor } from '@/lib/state-rules';
import { ScreenWelcome } from './ScreenWelcome';
import { ScreenResult } from './ScreenResult';
import { ScreenWelcomeDesktop } from './ScreenWelcomeDesktop';
import { ScreenResultDesktop } from './ScreenResultDesktop';

const RESULT_HASH = '#result';

function abbrFromPath(pathname: string): string | null {
  const seg = pathname.replace(/^\//, '').split('/')[0].toUpperCase();
  return seg && STATE_RULES[seg] ? seg : null;
}

interface Props {
  initialAbbr: string | null;
}

// Single-page navigation, owned in React state. We deliberately bypass
// Next.js's client-side router for state navigation — Next.js's internal
// `history.replaceState` calls during navigation strip the `#result` hash
// we use to mark the result screen, which made the auto-jump for no-input
// states unreliable. Owning history directly gives us a deterministic flow:
//
//   - URL paths (`/`, `/co`, `/ak`) are managed with `history.pushState`/
//     `history.replaceState` from this component.
//   - The result screen is encoded as a `#result` hash on the current path.
//   - `popstate` is the only event we need to listen for (browser back/forward).
//
// The parent server component does SSR seeding via `params.slug` →
// `initialAbbr`, and exports `generateMetadata` for per-state titles/OG tags.
export function PageClient({ initialAbbr }: Props) {
  const [stateAbbr, setStateAbbr] = useState<string | null>(initialAbbr);
  const [screen, setScreen] = useState<0 | 1>(0);
  const [inputValue, setInputValue] = useState('');
  // Some states (NY) want the cash toggle pre-selected to "Yes" — e.g.
  // NY uses it for "Are you in NYC?" and NYC is far more populous.
  const [hasCash, setHasCash] = useState(() => defaultHasCashFor(initialAbbr));

  // Scroll to top whenever we land on the result screen.
  useEffect(() => {
    if (screen === 1) {
      window.scrollTo(0, 0);
    }
  }, [screen]);

  // Auto-jump to the result for no-input states (AK, NH, ND, RI, SD, VT).
  // `setScreen(1)` runs unconditionally so React Strict Mode's
  // unmount/remount in dev (which resets screen to 0 while the URL hash
  // survives) doesn't leave us stranded on the welcome screen.
  useEffect(() => {
    if (!stateAbbr) return;
    const rule = STATE_RULES[stateAbbr];
    if (!rule || rule.field.kind !== 'none') return;
    if (window.location.hash !== RESULT_HASH) {
      history.replaceState(null, '', window.location.pathname + RESULT_HASH);
    }
    setScreen(1);
  }, [stateAbbr]);

  // First-load housekeeping + back/forward sync.
  useEffect(() => {
    // Clear any stale `#result` hash so a refresh on /xx#result doesn't try
    // to render the result with no form values. The no-input effect above
    // re-adds the hash for no-input states; input states stay on welcome.
    if (window.location.hash === RESULT_HASH) {
      const cleaned = window.location.pathname + window.location.search;
      const abbr = abbrFromPath(window.location.pathname);
      const rule = abbr ? STATE_RULES[abbr] : null;
      if (!rule || rule.field.kind !== 'none') {
        history.replaceState(null, '', cleaned);
        setScreen(0);
      }
    }

    const onPop = () => {
      const newAbbr = abbrFromPath(window.location.pathname);
      const isResult = window.location.hash === RESULT_HASH;
      setStateAbbr((prev) => {
        if (prev !== newAbbr) {
          setInputValue('');
          setHasCash(defaultHasCashFor(newAbbr));
        }
        return newAbbr;
      });
      setScreen(isResult ? 1 : 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const handleStateChange = useCallback((abbr: string | null) => {
    if (abbr) {
      const rule = STATE_RULES[abbr];
      const isNoInput = rule?.field.kind === 'none';
      const newPath = '/' + abbr.toLowerCase() + (isNoInput ? RESULT_HASH : '');
      // From home → push (so back returns home).
      // Already on a state page → replace (don't stack a long trail of state swaps).
      if (window.location.pathname === '/') {
        history.pushState(null, '', newPath);
      } else {
        history.replaceState(null, '', newPath);
      }
      setStateAbbr(abbr);
      setInputValue('');
      setHasCash(defaultHasCashFor(abbr));
      setScreen(isNoInput ? 1 : 0);
    } else {
      // "Change" cleared from picker — back to home as a new history entry.
      history.pushState(null, '', '/');
      setStateAbbr(null);
      setInputValue('');
      setHasCash(false);
      setScreen(0);
    }
  }, []);

  const goToResult = useCallback(() => {
    history.pushState(null, '', window.location.pathname + RESULT_HASH);
    setScreen(1);
  }, []);

  const goBack = useCallback(() => {
    history.back();
  }, []);

  const welcomeProps = {
    stateAbbr,
    setStateAbbr: handleStateChange,
    inputValue,
    setInputValue,
    hasCash,
    setHasCash,
    onSubmit: goToResult,
  };

  const resultProps = {
    stateAbbr: stateAbbr!,
    inputValue,
    hasCash,
    onBack: goBack,
  };

  if (screen === 0 || !stateAbbr) {
    return (
      <>
        <div className="mobile-layout">
          <ScreenWelcome {...welcomeProps} />
        </div>
        <div className="desktop-layout">
          <ScreenWelcomeDesktop {...welcomeProps} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mobile-layout">
        <ScreenResult {...resultProps} />
      </div>
      <div className="desktop-layout">
        <ScreenResultDesktop {...resultProps} />
      </div>
    </>
  );
}
