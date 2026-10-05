'use client';
import { useCallback, useState } from 'react';
import { C, TRACK_EYEBROW } from '@/lib/tokens';
import { STATE_RULES } from '@/lib/state-rules';
import { EmbedShell } from './EmbedShell';
import { StatePicker } from './StatePicker';
import { StateFields } from './StateFields';
import { PillButton } from './PillButton';

interface Props {
  stateAbbr: string | null;
  setStateAbbr: (a: string | null) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  hasCash: boolean;
  setHasCash: (v: boolean) => void;
  onSubmit: () => void;
  /** Demo mode (/embed?prefill=…): pulse + glow the CTA to invite the tap */
  ctaPulse?: boolean;
}

const EYEBROW_STYLE = {
  fontSize: 13,
  fontWeight: 700 as const,
  letterSpacing: TRACK_EYEBROW,
  color: C.inkSoft,
  textTransform: 'uppercase' as const,
  marginBottom: 14,
};

/**
 * Welcome screen for the embed. Same logic as ScreenWelcome but:
 *   - no app logo / no big serif H1 hero
 *   - no value-props block
 *   - no footer (host page owns chrome)
 *   - sage tinted card with a small "FIND YOUR NEXT EBT DEPOSIT" eyebrow
 *
 * Uses StatePicker + StateFields with `variant="desktop"`, which is the
 * cream-paper-on-tinted-card look the design specifies.
 */
export function ScreenWelcomeEmbed({
  stateAbbr,
  setStateAbbr,
  inputValue,
  setInputValue,
  hasCash,
  setHasCash,
  onSubmit,
  ctaPulse = false,
}: Props) {
  const rule = stateAbbr ? STATE_RULES[stateAbbr] : null;
  const [error, setError] = useState<string | null>(null);
  const [cashError, setCashError] = useState<string | null>(null);

  const setInputAndClearError = useCallback(
    (v: string) => {
      setInputValue(v);
      setError((e) => (e ? null : e));
      setCashError((e) => (e ? null : e));
    },
    [setInputValue],
  );

  const handleSubmit = useCallback(() => {
    if (!rule) return;
    // Run every validator so the user sees all problems at once.
    const err = rule.validate(inputValue);
    const cashErr = hasCash ? (rule.validateCash?.(inputValue) ?? null) : null;
    setError(err);
    setCashError(cashErr);
    if (err || cashErr) return;
    onSubmit();
  }, [rule, inputValue, hasCash, onSubmit]);

  return (
    <EmbedShell tint={C.sage}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div style={EYEBROW_STYLE}>Find your next EBT deposit</div>

        <StatePicker
          variant="desktop"
          selectedAbbr={stateAbbr}
          onSelect={(abbr) => {
            setStateAbbr(abbr);
            setInputValue('');
            setHasCash(false);
            setError(null);
            setCashError(null);
          }}
          onClear={() => {
            setStateAbbr(null);
            setInputValue('');
            setHasCash(false);
            setError(null);
            setCashError(null);
          }}
        />

        {rule && (
          <div style={{ marginTop: 22 }}>
            <StateFields
              variant="desktop"
              rule={rule}
              inputValue={inputValue}
              setInputValue={setInputAndClearError}
              hasCash={hasCash}
              setHasCash={setHasCash}
              onSubmit={onSubmit}
              error={error}
              cashError={cashError}
            />
          </div>
        )}

        {rule && (
          <div className={ctaPulse ? 'ebtcalc-cta-pulse' : undefined}>
            {ctaPulse && (
              <style>{`
                @media (prefers-reduced-motion: no-preference) {
                  /* !important: PillButton sets \`all: unset\` inline, which
                       resets animation at inline-style specificity. */
                  .ebtcalc-cta-pulse button {
                    animation: ebtcalc-cta-pulse 1.2s ease-out infinite !important;
                  }
                  /* Saffron ring — deeper gold than the tint for contrast
                       against the sage card. */
                  @keyframes ebtcalc-cta-pulse {
                    0%   { transform: scale(1);    box-shadow: 0 0 0 0 rgba(219, 168, 58, 1); }
                    55%  { transform: scale(1.04); box-shadow: 0 0 0 16px rgba(219, 168, 58, 0); }
                    100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(219, 168, 58, 0); }
                  }
                }
              `}</style>
            )}
            <PillButton
              type="submit"
              style={{ width: '100%', boxSizing: 'border-box', marginTop: 18 }}
            >
              Show my deposit day
            </PillButton>
          </div>
        )}
      </form>
    </EmbedShell>
  );
}
