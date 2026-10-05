'use client';
import { useCallback, useState } from 'react';
import type { StateRule } from '@/lib/state-rules';

/** Validation and error state shared by every welcome screen (mobile,
 * desktop, embed). Resetting the input and cash toggle on a state change
 * belongs to the app (PageClient / EmbedApp), which knows each state's
 * defaults — screens only clear their errors. */
export function useStateForm(opts: {
  rule: StateRule | null;
  inputValue: string;
  setInputValue: (v: string) => void;
  hasCash: boolean;
  onSubmit: () => void;
}) {
  const { rule, inputValue, setInputValue, hasCash, onSubmit } = opts;
  const [error, setError] = useState<string | null>(null);
  const [cashError, setCashError] = useState<string | null>(null);

  const clearErrors = useCallback(() => {
    setError(null);
    setCashError(null);
  }, []);

  const setInput = useCallback(
    (v: string) => {
      setInputValue(v);
      clearErrors();
    },
    [setInputValue, clearErrors],
  );

  const submit = useCallback(() => {
    if (!rule) return;
    // Run every validator so the user sees all problems at once.
    const err = rule.validate(inputValue);
    const cashErr = hasCash ? (rule.validateCash?.(inputValue) ?? null) : null;
    setError(err);
    setCashError(cashErr);
    if (err || cashErr) return;
    onSubmit();
  }, [rule, inputValue, hasCash, onSubmit]);

  return { error, cashError, setInput, submit, clearErrors };
}
