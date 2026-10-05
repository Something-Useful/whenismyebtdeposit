'use client';
import { C, EYEBROW } from '@/lib/tokens';
import { STATE_RULES } from '@/lib/state-rules';
import { EmbedShell } from './EmbedShell';
import { ResultCard } from './ResultCard';
import { ExplainerCard } from './ExplainerCard';
import { BackButton } from './BackButton';

interface Props {
  stateAbbr: string;
  inputValue: string;
  hasCash: boolean;
  onBack: () => void;
}

/** The main site's mobile result screen inside the embed card, plus a small
 * link to this site. */
export function ScreenResultEmbed({ stateAbbr, inputValue, hasCash, onBack }: Props) {
  if (!STATE_RULES[stateAbbr]) return null;

  return (
    <EmbedShell tint={C.sage}>
      <div style={{ ...EYEBROW, marginBottom: 14 }}>Your next EBT deposit is</div>
      <ResultCard stateAbbr={stateAbbr} inputValue={inputValue} hasCash={hasCash} />
      <div style={{ marginTop: 20 }}>
        <ExplainerCard stateAbbr={stateAbbr} hasCash={hasCash} collapsible />
      </div>
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <BackButton onClick={onBack} />
        <a
          href={`/${stateAbbr.toLowerCase()}`}
          target="_blank"
          rel="noopener"
          style={{
            fontSize: 11.5,
            color: C.inkMute,
            textDecoration: 'underline',
            textDecorationColor: 'rgba(21,20,15,0.25)',
            textUnderlineOffset: 2,
          }}
        >
          When is my EBT deposit?
        </a>
      </div>
    </EmbedShell>
  );
}
