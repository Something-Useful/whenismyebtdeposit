'use client';
import { useCallback, useEffect, useState } from 'react';
import { STATE_RULES, defaultHasCashFor } from '@/lib/state-rules';
import { ScreenWelcomeEmbed } from './ScreenWelcomeEmbed';
import { ScreenResultEmbed } from './ScreenResultEmbed';

interface Props {
  initialAbbr: string | null;
  /** Demo mode for the /partner live example ONLY: seeds the input with a
   * sample value and pulses the CTA. Never set on real embeds — /embed and
   * /embed/{state} pass nothing, so partner embeds can't enter this mode. */
  demoPrefill?: string;
}

/**
 * Embed orchestrator. Holds the same screen / state-abbr / input / hasCash
 * state shape as the canonical page, but does NOT touch the browser URL —
 * everything happens in-iframe in React state. Partners shouldn't see their
 * users' navigation history pollute the iframe's URL bar.
 *
 * Auto-jumps to the result screen for no-input states (AK, NH, ND, etc.)
 * when a state is pre-selected via /embed/{state}.
 */
export function EmbedApp({ initialAbbr, demoPrefill }: Props) {
  const [stateAbbr, setStateAbbr] = useState<string | null>(initialAbbr);
  const [screen, setScreen] = useState<0 | 1>(0);
  const [inputValue, setInputValue] = useState(demoPrefill ?? '');
  // Some states (NY) want the cash toggle pre-selected to "Yes" — e.g.
  // NY uses it for "Are you in NYC?" and NYC is far more populous.
  const [hasCash, setHasCash] = useState(() => defaultHasCashFor(initialAbbr));

  // `?credit=1` (set by /embed/create snippets): reserve a strip at the
  // bottom of the initial welcome card for the host page's credit line,
  // which the snippet layers over the iframe. Client-only — the static
  // export can't see query params at build time.
  const [creditSpace, setCreditSpace] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('credit') === '1')
      setCreditSpace(true);
  }, []);

  // Record a completed calculation in GoatCounter as an event pageview.
  // Recorded shapes (localhost is auto-filtered, so dev never counts):
  //   /embed/fl/result                    — partner iframe, no partner param
  //   /embed/fl/result/p/food-bank-nyc    — partner iframe with attribution
  //   /partner/fl/result                  — the live demo on our own site
  // Dashboard queries: "result" = total completions, "/embed/fl/result" =
  // per state, "/p/<slug>" = per partner (impressions + completions).
  // The explicit `path` bypasses the embed layout's path() override, so the
  // shape here is the whole story.
  const countResult = useCallback((abbr: string) => {
    try {
      const gc = (
        window as unknown as {
          goatcounter?: { count?: (vars: object) => void };
        }
      ).goatcounter;
      if (!gc?.count) return;
      const slug = (new URLSearchParams(location.search).get('partner') || '')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 100);
      const surface = location.pathname.startsWith('/embed')
        ? '/embed'
        : location.pathname.replace(/\/+$/, '');
      gc.count({
        path: `${surface}/${abbr.toLowerCase()}/result${slug ? `/p/${slug}` : ''}`,
        title: 'Deposit day shown',
        event: true,
      });
    } catch {
      /* analytics must never break the calculator */
    }
  }, []);

  // No-input states (AK, NH, ND, RI, SD, VT, WA) jump straight to the
  // result screen on selection or on initial load via /embed/{state}.
  // Only a user *selection* counts as a completion — the initial auto-jump
  // for a pre-configured state is an impression, not an action.
  useEffect(() => {
    if (!stateAbbr) return;
    const rule = STATE_RULES[stateAbbr];
    if (rule?.field.kind === 'none') {
      setScreen(1);
      if (stateAbbr !== initialAbbr) countResult(stateAbbr);
    }
  }, [stateAbbr, initialAbbr, countResult]);

  const handleStateChange = useCallback((abbr: string | null) => {
    setStateAbbr(abbr);
    setInputValue('');
    setHasCash(defaultHasCashFor(abbr));
    setScreen(0);
  }, []);

  const goToResult = useCallback(() => {
    setScreen(1);
    if (stateAbbr) countResult(stateAbbr);
  }, [stateAbbr, countResult]);
  const goBack = useCallback(() => setScreen(0), []);

  if (screen === 0 || !stateAbbr) {
    return (
      <ScreenWelcomeEmbed
        stateAbbr={stateAbbr}
        setStateAbbr={handleStateChange}
        inputValue={inputValue}
        setInputValue={setInputValue}
        hasCash={hasCash}
        setHasCash={setHasCash}
        onSubmit={goToResult}
        ctaPulse={!!demoPrefill}
        creditSpace={creditSpace}
      />
    );
  }

  return (
    <ScreenResultEmbed
      stateAbbr={stateAbbr}
      inputValue={inputValue}
      hasCash={hasCash}
      onBack={goBack}
    />
  );
}
