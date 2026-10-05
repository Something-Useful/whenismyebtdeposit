'use client';
import { SERIF } from '@/lib/tokens';
import { STATE_RULES } from '@/lib/state-rules';
import { ScreenChrome } from './ScreenChrome';
import { HeaderArea } from './HeaderArea';
import { AppLogo } from './AppLogo';
import { StatePicker } from './StatePicker';
import { StateFields } from './StateFields';
import { useStateForm } from './useStateForm';
import { ValueProps } from './ValueProps';
import { PillButton } from './PillButton';
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

export function ScreenWelcome({
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
    <ScreenChrome>
      <HeaderArea>
        <AppLogo />
        <h1
          style={{
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: 44,
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Find your next
          <br />
          EBT deposit
        </h1>
      </HeaderArea>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        style={{ padding: '24px 24px 0', flex: 1, display: 'flex', flexDirection: 'column' }}
      >
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
        />

        {!rule && <ValueProps />}

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
            />
          </div>
        )}

        {rule && (
          <>
            <div style={{ height: 28 }} />
            <PillButton
              type="submit"
              style={{ width: '100%', boxSizing: 'border-box', marginBottom: 16 }}
            >
              Show my deposit day
            </PillButton>
          </>
        )}
      </form>

      <AppFooter />
    </ScreenChrome>
  );
}
