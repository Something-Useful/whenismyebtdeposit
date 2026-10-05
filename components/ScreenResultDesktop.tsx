'use client';
import { C, EYEBROW } from '@/lib/tokens';
import { STATE_RULES } from '@/lib/state-rules';
import { DesktopShell, DESKTOP_COLUMN } from './DesktopShell';
import { DesktopNav } from './DesktopNav';
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

export function ScreenResultDesktop({ stateAbbr, inputValue, hasCash, onBack }: Props) {
  if (!STATE_RULES[stateAbbr]) return null;

  return (
    <DesktopShell>
      <div style={{ background: C.sage, padding: '40px 32px 48px' }}>
        <div style={{ maxWidth: DESKTOP_COLUMN, margin: '0 auto' }}>
          <DesktopNav />
          <div style={{ ...EYEBROW, marginBottom: 24 }}>Your next EBT deposit is</div>
          <ResultCard
            stateAbbr={stateAbbr}
            inputValue={inputValue}
            hasCash={hasCash}
            variant="desktop"
          />
        </div>
      </div>

      <div style={{ flex: 1, padding: '32px 32px 56px' }}>
        <div style={{ maxWidth: DESKTOP_COLUMN, margin: '0 auto' }}>
          <ExplainerCard stateAbbr={stateAbbr} hasCash={hasCash} variant="desktop" />
          <div style={{ marginTop: 26 }}>
            <BackButton onClick={onBack} />
          </div>
        </div>
      </div>

      <AppFooter variant="desktop" />
    </DesktopShell>
  );
}
