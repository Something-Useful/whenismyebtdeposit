'use client';
import { C, EYEBROW } from '@/lib/tokens';
import { STATE_RULES } from '@/lib/state-rules';
import { EmbedShell } from './EmbedShell';
import { StatePicker } from './StatePicker';
import { StateFields } from './StateFields';
import { useStateForm } from './useStateForm';
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

/** The main site's welcome form inside the embed card: an eyebrow instead
 * of the hero, no value props or footer, and the desktop field style, which
 * is designed to sit on a card. */
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
  const { error, cashError, setInput, submit, clearErrors } = useStateForm({
    rule,
    inputValue,
    setInputValue,
    hasCash,
    onSubmit,
  });

  return (
    <EmbedShell tint={C.sage}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div style={{ ...EYEBROW, marginBottom: 14 }}>Find your next EBT deposit</div>

        <StatePicker
          variant="desktop"
          selectedAbbr={stateAbbr}
          onSelect={(abbr) => {
            setStateAbbr(abbr);
            clearErrors();
          }}
          onClear={() => {
            setStateAbbr(null);
            clearErrors();
          }}
        />

        {rule && (
          <div className="fade-up" style={{ marginTop: 28 }}>
            <StateFields
              variant="desktop"
              rule={rule}
              inputValue={inputValue}
              setInputValue={setInput}
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
              style={{ width: '100%', boxSizing: 'border-box', marginTop: 28 }}
            >
              Show my deposit day
            </PillButton>
          </div>
        )}
      </form>
    </EmbedShell>
  );
}
