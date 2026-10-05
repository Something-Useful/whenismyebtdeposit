'use client';
import { useRef, useState, type CSSProperties } from 'react';
import { C, FONT, TRACK_EYEBROW } from '@/lib/tokens';
import { MULTI_DELIM, type StateRule } from '@/lib/state-rules';
import { Popover, linkifyText } from './Popover';
import { Picker } from './Picker';

interface Props {
  rule: StateRule;
  inputValue: string;
  setInputValue: (v: string) => void;
  hasCash: boolean;
  setHasCash: (v: boolean) => void;
  onSubmit: () => void;
  error: string | null;
  /** Error for the `cashInput` field, rendered beneath it. */
  cashError?: string | null;
  variant?: 'mobile' | 'desktop';
}

const MONTHS: ReadonlyArray<readonly [string, string]> = [
  ['01', 'January'], ['02', 'February'], ['03', 'March'], ['04', 'April'],
  ['05', 'May'], ['06', 'June'], ['07', 'July'], ['08', 'August'],
  ['09', 'September'], ['10', 'October'], ['11', 'November'], ['12', 'December'],
];

const ERROR_COLOR = '#c0392b';

/** The (i) icon button rendered next to a field label. */
function InfoButton({
  btnRef,
  open,
  onToggle,
  fieldLabel,
}: {
  btnRef: React.RefObject<HTMLButtonElement>;
  open: boolean;
  onToggle: () => void;
  fieldLabel: string;
}) {
  return (
    <button
      ref={btnRef}
      type="button"
      // Skip the (i) icon in Tab order: it sits between the label and the
      // input visually, so leaving it tabbable means tabbing into the
      // field advances to (i), not the input the user is trying to fill.
      // Still click/tap-accessible.
      tabIndex={-1}
      onClick={onToggle}
      aria-label={`More info about ${fieldLabel}`}
      aria-expanded={open}
      style={{
        all: 'unset',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        borderRadius: 9,
        color: C.inkMute,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="8" r="1" fill="currentColor" />
      </svg>
    </button>
  );
}

/** Two-option question rendered as one radio group: a single Tab stop, with
 * arrow keys moving selection and focus together, like a native radio. */
function YesNoToggle({
  id,
  prompt,
  noLabel,
  yesLabel,
  value,
  onChange,
  yesFirst = false,
  labelStyle,
  buttonStyle,
  style,
}: {
  id: string;
  prompt: string;
  noLabel: string;
  yesLabel: string;
  value: boolean;
  onChange: (v: boolean) => void;
  /** Puts Yes on the left when it's the pre-selected default (NY's NYC). */
  yesFirst?: boolean;
  labelStyle: CSSProperties;
  buttonStyle: (active: boolean) => CSSProperties;
  style?: CSSProperties;
}) {
  const noRef = useRef<HTMLButtonElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === 'Home' ? false : e.key === 'End' ? true : !value;
    onChange(next);
    // Wait for the tabIndex swap to commit before moving focus.
    requestAnimationFrame(() => (next ? yesRef : noRef).current?.focus());
  };

  const options = [
    ['no', noLabel, noRef],
    ['yes', yesLabel, yesRef],
  ] as const;

  return (
    <div style={style}>
      <label id={id} style={labelStyle}>
        {prompt}
      </label>
      <div
        role="radiogroup"
        aria-labelledby={id}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
      >
        {(yesFirst ? [options[1], options[0]] : options).map(([k, lbl, ref]) => {
          const active = (k === 'yes') === value;
          return (
            <button
              ref={ref}
              key={k}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(k === 'yes')}
              onKeyDown={onKeyDown}
              style={buttonStyle(active)}
            >
              {lbl}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function StateFields({
  rule,
  inputValue,
  setInputValue,
  hasCash,
  setHasCash,
  onSubmit,
  error,
  cashError = null,
  variant = 'mobile',
}: Props) {
  const isDesktop = variant === 'desktop';
  const hasInput = rule.field.kind !== 'none';
  const isSingleDigit = rule.field.kind === 'singleDigit';
  const isMulti = rule.field.kind === 'birthMonthAndLetter';
  const isCountyAndDigit = rule.field.kind === 'countyAndDigit';
  // Both kinds render the county picker; countyAndDigit adds a conditional
  // digit input underneath.
  const isCombobox = rule.field.kind === 'comboboxSelect' || isCountyAndDigit;
  const [countyPart = '', digitPart = ''] = isCountyAndDigit
    ? inputValue.split(MULTI_DELIM)
    : [];
  // The rule decides whether the second input applies — keeps this component
  // from having to know anything about PA counties.
  const needsDigit = rule.field.secondInputApplies?.(countyPart) ?? false;
  // Rules with a `cashInput` or `extraToggle` keep both values in
  // `inputValue` as "primary|second" — split here, join on every edit.
  const cashInput = rule.field.cashInput;
  const extraToggle = rule.field.extraToggle;
  const splitsInput = !!(cashInput || extraToggle);
  const [primaryPart = '', secondPart = ''] = splitsInput
    ? inputValue.split(MULTI_DELIM)
    : [inputValue, ''];
  // The (i) on either conditional second input — PA's county digit or a
  // cashInput — shares one popover since the two never coexist.
  const secondInfo = rule.field.secondInputInfoModal ?? cashInput?.infoModal;
  const [infoOpen, setInfoOpen] = useState(false);
  // The (i) icon button — anchored to itself for popover positioning. The
  // field-kind branches are mutually exclusive, so one ref covers the main
  // label's (i); countyAndDigit's second input gets its own below.
  const infoBtnRef = useRef<HTMLButtonElement>(null);
  const [secondInfoOpen, setSecondInfoOpen] = useState(false);
  const secondInfoBtnRef = useRef<HTMLButtonElement>(null);

  const fieldBg = isDesktop ? C.paper : '#fff';
  const fieldRadius = isDesktop ? 14 : 16;
  const inputFontSize = isSingleDigit
    ? isDesktop
      ? 28
      : 32
    : isDesktop
      ? 20
      : 22;
  const btnRadius = isDesktop ? 12 : 14;
  const btnPadding = isDesktop ? '14px 12px' : '16px 12px';
  const btnFontSize = isDesktop ? 14 : 15;
  const labelMb = isDesktop ? 10 : 8;

  const questionLabelStyle: CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: TRACK_EYEBROW,
    color: C.inkSoft,
    textTransform: 'uppercase',
    marginBottom: labelMb,
    display: 'block',
  };

  const toggleButtonStyle = (active: boolean): CSSProperties => ({
    all: 'unset',
    cursor: 'pointer',
    textAlign: 'center',
    padding: btnPadding,
    borderRadius: btnRadius,
    fontSize: btnFontSize,
    fontWeight: 500,
    background: active ? C.ink : fieldBg,
    color: active ? '#fff' : C.ink,
    border: `1.5px solid ${active ? C.ink : C.line}`,
  });

  const inputContainerStyle: CSSProperties = {
    background: fieldBg,
    borderRadius: fieldRadius,
    border: `1.5px solid ${C.line}`,
    padding: '14px 16px',
    marginBottom: 22,
  };

  if (!hasInput && !rule.cash) return null;

  return (
    // position:relative establishes the containing block for the (i) popover.
    <div style={{ position: 'relative' }}>
      {isMulti && (
        <MultiInputBirthMonthAndLetter
          inputValue={inputValue}
          setInputValue={setInputValue}
          monthLabel={rule.field.label ?? ''}
          nameLabel={rule.field.secondInputLabel ?? ''}
          questionLabelStyle={questionLabelStyle}
          inputContainerStyle={inputContainerStyle}
          inputFontSize={isDesktop ? 20 : 22}
        />
      )}

      {isCombobox && (
        <>
          {/* Outer wrapper is a div, NOT a label — labels propagate clicks
              to their first contained labelable control (the (i) button),
              which would make the whole row toggle the popover. */}
          <div style={{ ...questionLabelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{rule.field.label}</span>
            {rule.field.infoModal && (
              <InfoButton
                btnRef={infoBtnRef}
                open={infoOpen}
                onToggle={() => setInfoOpen((o) => !o)}
                fieldLabel={rule.field.label ?? ''}
              />
            )}
          </div>
          <div style={{ marginBottom: 22 }}>
            {/* Same component as the state picker, minus the pin icon. */}
            <Picker
              options={rule.field.comboboxOptions ?? []}
              selected={(isCountyAndDigit ? countyPart : inputValue) || null}
              onSelect={(v) =>
                setInputValue(isCountyAndDigit ? `${v}${MULTI_DELIM}${digitPart}` : v)
              }
              onClear={() => setInputValue(isCountyAndDigit ? MULTI_DELIM : '')}
              placeholder={rule.field.placeholder}
              noun={rule.field.comboboxNoun ?? 'options'}
              idPrefix="county-picker"
              variant={variant}
            />
          </div>

          {/* Only the 31 PA counties that split by case digit ask for one. */}
          {isCountyAndDigit && needsDigit && (
            <>
              <div style={{ ...questionLabelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{rule.field.secondInputLabel}</span>
                {rule.field.secondInputInfoModal && (
                  <InfoButton
                    btnRef={secondInfoBtnRef}
                    open={secondInfoOpen}
                    onToggle={() => setSecondInfoOpen((o) => !o)}
                    fieldLabel={rule.field.secondInputLabel ?? ''}
                  />
                )}
              </div>
              <div style={inputContainerStyle}>
                <input
                  value={digitPart}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, '').slice(-1);
                    setInputValue(`${countyPart}${MULTI_DELIM}${d}`);
                  }}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="e.g. 7"
                  style={{
                    all: 'unset',
                    width: '100%',
                    fontFamily: FONT,
                    fontSize: isDesktop ? 28 : 32,
                    letterSpacing: '0.04em',
                    color: C.ink,
                    textAlign: 'center',
                  }}
                />
              </div>
            </>
          )}
        </>
      )}

      {hasInput && !isMulti && !isCombobox && (
        <>
          {/* See comment above: div, not label, so the (i) button's click
              doesn't get triggered by clicks on the surrounding label text. */}
          <div style={{ ...questionLabelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{rule.field.label}</span>
            {rule.field.infoModal && (
              <InfoButton
                btnRef={infoBtnRef}
                open={infoOpen}
                onToggle={() => setInfoOpen((o) => !o)}
                fieldLabel={rule.field.label ?? ''}
              />
            )}
          </div>
          <div
            style={{
              ...inputContainerStyle,
              marginBottom:
                rule.field.helperText || rule.field.secondaryAction ? 10 : 22,
            }}
          >
            <input
              value={
                rule.field.secondaryAction &&
                inputValue === rule.field.secondaryAction.inputValue
                  ? ''
                  : primaryPart
              }
              onChange={(e) => {
                let v = e.target.value;
                if (rule.field.kind === 'singleDigit') {
                  v = v.replace(/\D/g, '').slice(-1);
                }
                setInputValue(splitsInput ? `${v}${MULTI_DELIM}${secondPart}` : v);
              }}
              inputMode={rule.field.inputMode}
              autoCapitalize={rule.field.autoCapitalize}
              autoComplete="off"
              spellCheck={false}
              maxLength={rule.field.kind === 'singleDigit' ? 1 : undefined}
              placeholder={rule.field.placeholder}
              style={{
                all: 'unset',
                width: '100%',
                fontFamily: FONT,
                fontSize: inputFontSize,
                letterSpacing: '0.04em',
                color: C.ink,
                fontVariantNumeric: 'tabular-nums',
                textAlign: isSingleDigit ? 'center' : 'left',
              }}
            />
          </div>
          {rule.field.secondaryAction && (
            <div style={{ marginBottom: 22 }}>
              <button
                type="button"
                onClick={() => {
                  setInputValue(rule.field.secondaryAction!.inputValue);
                  onSubmit();
                }}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  fontSize: 15,
                  color: C.inkSoft,
                  textDecoration: 'underline',
                  textUnderlineOffset: 2,
                }}
              >
                {rule.field.secondaryAction.label}
              </button>
            </div>
          )}
          {rule.field.helperText && (
            <div style={{ fontSize: 14, color: C.inkMute, marginBottom: 22, lineHeight: 1.45 }}>
              {rule.field.helperText}
            </div>
          )}
        </>
      )}

      {error && (
        <div
          role="alert"
          style={{
            fontSize: 14,
            color: ERROR_COLOR,
            marginTop: -10,
            marginBottom: 22,
            lineHeight: 1.4,
          }}
        >
          {error}
        </div>
      )}

      {rule.field.infoModal && (
        <Popover
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          anchorRef={infoBtnRef}
          title={rule.field.infoModal.title}
        >
          <p style={{ fontSize: 15, lineHeight: 1.55, color: C.inkSoft, margin: 0 }}>
            {linkifyText(rule.field.infoModal.body)}
          </p>
        </Popover>
      )}

      {secondInfo && (
        <Popover
          open={secondInfoOpen}
          onClose={() => setSecondInfoOpen(false)}
          anchorRef={secondInfoBtnRef}
          title={secondInfo.title}
        >
          <p style={{ fontSize: 15, lineHeight: 1.55, color: C.inkSoft, margin: 0 }}>
            {linkifyText(secondInfo.body)}
          </p>
        </Popover>
      )}

      {extraToggle && (
        <YesNoToggle
          id="extra-prompt-label"
          prompt={extraToggle.promptLabel}
          noLabel={extraToggle.noLabel}
          yesLabel={extraToggle.yesLabel}
          value={secondPart === 'y'}
          onChange={(yes) => setInputValue(`${primaryPart}${MULTI_DELIM}${yes ? 'y' : ''}`)}
          labelStyle={questionLabelStyle}
          buttonStyle={toggleButtonStyle}
          style={{ marginBottom: rule.cash ? 22 : 0 }}
        />
      )}

      {rule.cash && (
        <>
          <YesNoToggle
            id="cash-prompt-label"
            prompt={rule.cash.promptLabel}
            noLabel={rule.cash.snapOnlyLabel}
            yesLabel={rule.cash.hasCashLabel}
            value={hasCash}
            onChange={setHasCash}
            yesFirst={rule.cash.defaultHasCash}
            labelStyle={questionLabelStyle}
            buttonStyle={toggleButtonStyle}
          />

          {/* Second input that only applies to cash recipients (TX's TANF
              EDG number). Rendered under the toggle that reveals it. */}
          {cashInput && hasCash && (
            <div style={{ marginTop: 22 }}>
              <div style={{ ...questionLabelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{cashInput.label}</span>
                {cashInput.infoModal && (
                  <InfoButton
                    btnRef={secondInfoBtnRef}
                    open={secondInfoOpen}
                    onToggle={() => setSecondInfoOpen((o) => !o)}
                    fieldLabel={cashInput.label ?? ''}
                  />
                )}
              </div>
              <div style={{ ...inputContainerStyle, marginBottom: cashError ? 12 : 0 }}>
                <input
                  value={secondPart}
                  onChange={(e) =>
                    setInputValue(`${primaryPart}${MULTI_DELIM}${e.target.value}`)
                  }
                  inputMode={rule.field.inputMode}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={cashInput.placeholder}
                  style={{
                    all: 'unset',
                    width: '100%',
                    fontFamily: FONT,
                    fontSize: inputFontSize,
                    letterSpacing: '0.04em',
                    color: C.ink,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                />
              </div>
              {cashError && (
                <div role="alert" style={{ fontSize: 14, color: ERROR_COLOR, lineHeight: 1.4 }}>
                  {cashError}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface MultiProps {
  inputValue: string;
  setInputValue: (v: string) => void;
  monthLabel: string;
  nameLabel: string;
  questionLabelStyle: CSSProperties;
  inputContainerStyle: CSSProperties;
  inputFontSize: number;
}

function MultiInputBirthMonthAndLetter({
  inputValue,
  setInputValue,
  monthLabel,
  nameLabel,
  questionLabelStyle,
  inputContainerStyle,
  inputFontSize,
}: MultiProps) {
  const [month, name] = inputValue.split(MULTI_DELIM);
  const setMonth = (m: string) => setInputValue(`${m}${MULTI_DELIM}${name ?? ''}`);
  const setName = (n: string) => setInputValue(`${month ?? ''}${MULTI_DELIM}${n}`);

  return (
    <>
      <label style={questionLabelStyle}>{monthLabel}</label>
      <div
        style={{
          ...inputContainerStyle,
          position: 'relative',
          padding: '14px 40px 14px 16px',
        }}
      >
        <select
          value={month ?? ''}
          onChange={(e) => setMonth(e.target.value)}
          style={{
            all: 'unset',
            width: '100%',
            fontFamily: FONT,
            fontSize: inputFontSize,
            letterSpacing: '0.01em',
            color: month ? C.ink : 'rgba(21,20,15,0.32)',
            cursor: 'pointer',
          }}
        >
          <option value="">Pick a month</option>
          {MONTHS.map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke={C.inkMute}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <label style={questionLabelStyle}>{nameLabel}</label>
      <div style={inputContainerStyle}>
        <input
          value={name ?? ''}
          onChange={(e) => setName(e.target.value)}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder="e.g. Smith"
          style={{
            all: 'unset',
            width: '100%',
            fontFamily: FONT,
            fontSize: inputFontSize,
            letterSpacing: '0.04em',
            color: C.ink,
          }}
        />
      </div>
    </>
  );
}
