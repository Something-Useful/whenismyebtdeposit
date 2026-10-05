'use client';
import { C, EYEBROW } from '@/lib/tokens';
import { STATE_RULES } from '@/lib/state-rules';
import { ScreenChrome } from './ScreenChrome';
import { HeaderArea } from './HeaderArea';
import { AppLogo } from './AppLogo';
import { ResultCard } from './ResultCard';
import { ExplainerCard } from './ExplainerCard';
import { BackButton } from './BackButton';
import { AppFooter } from './AppFooter';

interface Props {
  stateAbbr: string;
  inputValue: string;
  hasCash: boolean;
  onBack: () => void;
}

export function ScreenResult({ stateAbbr, inputValue, hasCash, onBack }: Props) {
  if (!STATE_RULES[stateAbbr]) return null;

  return (
    <ScreenChrome>
      <HeaderArea tint={C.sage}>
        <AppLogo />
        <div style={{ ...EYEBROW, marginBottom: 14 }}>Your next EBT deposit is</div>
        <ResultCard stateAbbr={stateAbbr} inputValue={inputValue} hasCash={hasCash} />
      </HeaderArea>

      <div style={{ padding: '20px 24px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ExplainerCard stateAbbr={stateAbbr} hasCash={hasCash} />
        <div style={{ margin: '44px 0 12px' }}>
          <BackButton onClick={onBack} />
        </div>
      </div>

      <AppFooter />
    </ScreenChrome>
  );
}
