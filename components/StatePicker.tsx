'use client';
import { STATES, isSupported } from '@/lib/state-rules';
import { Picker } from './Picker';

interface Props {
  selectedAbbr: string | null;
  onSelect: (abbr: string) => void;
  onClear: () => void;
  variant?: 'mobile' | 'desktop';
}

export function StatePicker({ selectedAbbr, onSelect, onClear, variant = 'mobile' }: Props) {
  return (
    <Picker
      options={STATES}
      selected={selectedAbbr}
      onSelect={onSelect}
      onClear={onClear}
      placeholder="Choose your state"
      noun="states"
      idPrefix="state-picker"
      icon
      isSupported={isSupported}
      variant={variant}
    />
  );
}
