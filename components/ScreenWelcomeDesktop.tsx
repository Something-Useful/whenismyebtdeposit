'use client';
import { C, SERIF, FONT, TRACK_EYEBROW } from '@/lib/tokens';
import { STATE_RULES } from '@/lib/state-rules';
import { DesktopShell, DESKTOP_COLUMN } from './DesktopShell';
import { DesktopNav } from './DesktopNav';
import { StatePicker } from './StatePicker';
import { StateFields } from './StateFields';
import { useStateForm } from './useStateForm';
import { ValueProps } from './ValueProps';
import { AppFooter } from './AppFooter';

interface Props {
  stateAbbr: string | null;
  setStateAbbr: (a: string | null) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  hasCash: boolean;
  setHasCash: (v: boolean) => void;
  onSubmit: () => void;
}

export function ScreenWelcomeDesktop({
  stateAbbr,
  setStateAbbr,
  inputValue,
  setInputValue,
  hasCash,
  setHasCash,
  onSubmit,
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
    <DesktopShell>
      {/* Sage hero — full width. Top padding matches the result hero so the
          logo stays put when navigating between screens. */}
      <div style={{ background: C.sage, padding: '40px 32px 64px' }}>
        <div style={{ maxWidth: DESKTOP_COLUMN, margin: '0 auto' }}>
          <DesktopNav />
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 50,
              lineHeight: 0.98,
              whiteSpace: 'nowrap',
              letterSpacing: '-0.025em',
              margin: 0,
              color: C.ink,
            }}
          >
            Find your next EBT deposit
          </h1>
        </div>
      </div>

      {/* Body — floating form card overlapping the hero */}
      <div style={{ padding: '40px 32px 56px' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          style={{
            width: '100%',
            maxWidth: DESKTOP_COLUMN,
            margin: '0 auto',
            background: '#fff',
            borderRadius: 24,
            border: `1px solid ${C.line}`,
            boxShadow: '0 1px 2px rgba(21,20,15,0.04), 0 24px 60px rgba(21,20,15,0.08)',
            padding: '36px 40px 32px',
            marginTop: -88,
            position: 'relative',
          }}
        >
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: TRACK_EYEBROW,
              color: C.inkSoft,
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 10,
            }}
          >
            What state do you live in?
          </label>
          <StatePicker
            selectedAbbr={stateAbbr}
            onSelect={(abbr) => {
              setStateAbbr(abbr);
              clearErrors();
            }}
            onClear={() => {
              setStateAbbr(null);
              clearErrors();
            }}
            variant="desktop"
          />

          {rule && (
            <div className="fade-up" style={{ marginTop: 28 }}>
              <StateFields
                rule={rule}
                inputValue={inputValue}
                setInputValue={setInput}
                hasCash={hasCash}
                setHasCash={setHasCash}
                onSubmit={onSubmit}
                error={error}
                cashError={cashError}
                variant="desktop"
              />
            </div>
          )}

          {rule && (
            <>
              <button
                type="submit"
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  marginTop: 28,
                  padding: '16px 28px',
                  borderRadius: 999,
                  background: C.ink,
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily: FONT,
                  letterSpacing: '-0.01em',
                  width: '100%',
                  boxShadow: '0 6px 14px rgba(21,20,15,0.18)',
                }}
              >
                Show my deposit day
              </button>
            </>
          )}
        </form>

        {/* Trust strip — only when no state picked. Shared with mobile
            (ValueProps) so the item list stays in one place. */}
        {!rule && (
          <div style={{ maxWidth: DESKTOP_COLUMN, margin: '0 auto' }}>
            <ValueProps variant="desktop" />
          </div>
        )}
      </div>

      <AppFooter variant="desktop" />
    </DesktopShell>
  );
}
