'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { C, FONT } from '@/lib/tokens';

/** One option: [value, label]. When they differ (states: ['CA', 'California'])
 * the value is shown as a trailing code; when equal (counties) it's omitted. */
export type PickerOption = readonly [string, string];

interface Props {
  options: ReadonlyArray<PickerOption>;
  selected: string | null;
  onSelect: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  /** Plural noun for the empty state ("No counties match …"). */
  noun: string;
  /** Prefix for the listbox/option DOM ids — must be unique per picker on a page. */
  idPrefix: string;
  /** Show the location-pin icon before the input. */
  icon?: boolean;
  /** Options that can't be chosen yet render dimmed with "coming soon". */
  isSupported?: (value: string) => boolean;
  variant?: 'mobile' | 'desktop';
}

/**
 * Typeahead single-select used for the state picker and PA's county picker.
 * Both share this exact component so they behave identically; the props
 * only swap the option list, placeholder, icon, and copy.
 */
export function Picker({
  options,
  selected: selectedAbbr,
  onSelect,
  onClear,
  placeholder,
  noun,
  idPrefix,
  icon = false,
  isSupported = () => true,
  variant = 'mobile',
}: Props) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  // `isChanging` overrides the displayed state name when the user taps
  // "Change" — opens the dropdown and lets them type without navigating
  // away from the current state's URL.
  const [isChanging, setIsChanging] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedName = useMemo(
    () => options.find(([a]) => a === selectedAbbr)?.[1] ?? '',
    [options, selectedAbbr],
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const matches = options.filter(
      ([a, n]) => n.toLowerCase().includes(q) || a.toLowerCase().startsWith(q),
    );
    if (!q) return matches;
    // Names that *start* with the query rank above names that merely
    // contain it, so "phi" highlights Philadelphia, not Dauphin. Stable sort
    // keeps each group in its original order.
    const starts = ([a, n]: PickerOption) =>
      n.toLowerCase().startsWith(q) || a.toLowerCase().startsWith(q);
    return [...matches.filter(starts), ...matches.filter((o) => !starts(o))];
  }, [options, query]);

  const visible = filtered;
  const showAsEmpty = !selectedAbbr || isChanging;
  const showList = showAsEmpty && (focused || query.length > 0);
  const isDesktop = variant === 'desktop';
  const fieldBg = isDesktop ? C.paper : '#fff';
  const fieldRadius = isDesktop ? 14 : 16;
  const fieldFontSize = isDesktop ? 16 : 17;

  // Reset highlight whenever the visible list changes.
  useEffect(() => {
    setActiveIndex(0);
  }, [query, focused]);

  // When the parent's selection changes (e.g., user picked a new state),
  // exit "changing" mode.
  useEffect(() => {
    setIsChanging(false);
  }, [selectedAbbr]);

  // Keep the highlighted item scrolled into view.
  useEffect(() => {
    if (!showList || !listRef.current) return;
    const node = listRef.current.querySelector<HTMLElement>(
      `[data-picker-index="${activeIndex}"]`,
    );
    node?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, showList]);

  const commit = (idx: number) => {
    const entry = visible[idx];
    if (!entry) return;
    const [abbr] = entry;
    if (!isSupported(abbr)) return;
    onSelect(abbr);
    setQuery('');
    setFocused(false);
    // Reset locally too: the useEffect on `selectedAbbr` only fires when
    // the value actually changes, so re-selecting the same state would
    // leave `isChanging` stuck at true and the input visibly empty.
    setIsChanging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList || visible.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(visible.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      // Prevent form submission while the dropdown is open — Enter selects.
      e.preventDefault();
      commit(activeIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setFocused(false);
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          background: fieldBg,
          borderRadius: fieldRadius,
          border: `1.5px solid ${focused ? C.ink : C.line}`,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          transition: 'border-color .15s',
        }}
      >
        {icon && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 22s-7-7.5-7-13a7 7 0 1114 0c0 5.5-7 13-7 13z"
              stroke={C.ink}
              strokeWidth="1.8"
            />
            <circle cx="12" cy="9" r="2.5" stroke={C.ink} strokeWidth="1.8" />
          </svg>
        )}
        <input
          ref={inputRef}
          value={showAsEmpty ? query : selectedName}
          onChange={(e) => {
            // Any edit while a state is selected = the user wants to change
            // it. Flip into "changing" mode so the input shows their query
            // instead of snapping back to the locked state name.
            if (selectedAbbr && !isChanging) {
              setIsChanging(true);
            }
            const val = e.target.value;
            setQuery(val);
            // When the last character is deleted and the field is empty,
            // re-assert focus so the full dropdown list opens. Some mobile
            // browsers fire a spurious blur on the final backspace keypress,
            // which would otherwise hide the dropdown.
            if (val === '') {
              setFocused(true);
            }
          }}
          onFocus={(e) => {
            setFocused(true);
            // If a state is currently selected, highlight the whole name so
            // the user can immediately start typing to overwrite it.
            if (selectedAbbr && !isChanging) {
              e.currentTarget.select();
            }
            // On mobile, scroll the picker near the top of the viewport so
            // the dropdown has room to open above the on-screen keyboard.
            if (!isDesktop && inputRef.current) {
              const rect = inputRef.current.getBoundingClientRect();
              const target = rect.top - 16;
              if (Math.abs(target) > 4) {
                window.scrollBy({ top: target, behavior: 'smooth' });
              }
            }
          }}
          onClick={(e) => {
            // Select-all on tap too — onFocus may not fire if the input was
            // already focused.
            if (selectedAbbr && !isChanging) {
              e.currentTarget.select();
            }
          }}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-controls={`${idPrefix}-listbox`}
          aria-activedescendant={
            showList && visible[activeIndex]
              ? `${idPrefix}-opt-${visible[activeIndex][0]}`
              : undefined
          }
          style={{
            all: 'unset',
            flex: 1,
            fontFamily: FONT,
            fontSize: fieldFontSize,
            color: C.ink,
            letterSpacing: '-0.01em',
            minWidth: 0,
          }}
        />
        {selectedAbbr && !isChanging && (
          <button
            type="button"
            // Keep "Change" out of the Tab order: tabbing from the picker
            // should advance to the next form field, not detour through this
            // inline affordance. Still clickable with the mouse.
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              // Clear app state back to home AND open the picker for typing:
              // cursor in the input, dropdown showing the full state list.
              // Focus must run synchronously inside this user-gesture handler
              // so iOS Safari pops the keyboard.
              setQuery('');
              setFocused(true);
              onClear();
              inputRef.current?.focus();
            }}
            style={{
              all: 'unset',
              cursor: 'pointer',
              fontSize: 13,
              color: C.inkMute,
            }}
          >
            Change
          </button>
        )}
      </div>

      {showList && (
        <div
          ref={listRef}
          id={`${idPrefix}-listbox`}
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: '#fff',
            borderRadius: fieldRadius,
            border: `1px solid ${C.line}`,
            maxHeight: 360,
            overflowY: 'auto',
            zIndex: 5,
            boxShadow: '0 12px 32px rgba(21,20,15,0.10)',
          }}
        >
          {visible.map(([abbr, name], i) => {
            const supported = isSupported(abbr);
            const active = i === activeIndex;
            return (
              <button
                key={abbr}
                type="button"
                id={`${idPrefix}-opt-${abbr}`}
                role="option"
                aria-selected={active}
                data-picker-index={i}
                // Dropdown options aren't tab stops: ArrowUp/Down + Enter
                // navigate the list (see handleKeyDown on the input). Tab from
                // the picker should advance to the next form field instead of
                // stepping through 51 options.
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => commit(i)}
                disabled={!supported}
                style={{
                  all: 'unset',
                  cursor: supported ? 'pointer' : 'not-allowed',
                  width: '100%',
                  padding: isDesktop ? '12px 18px' : '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                  borderBottom: `1px solid ${C.line}`,
                  opacity: supported ? 1 : 0.42,
                  background: active && supported ? 'rgba(21,20,15,0.05)' : undefined,
                }}
              >
                <span style={{ fontSize: isDesktop ? 15 : 16 }}>
                  {name}
                  {!supported && (
                    <span style={{ fontSize: 11, color: C.inkMute, marginLeft: 8 }}>
                      coming soon
                    </span>
                  )}
                </span>
                {abbr !== name && (
                  <span style={{ fontSize: 12, color: C.inkMute, letterSpacing: '0.06em' }}>
                    {abbr}
                  </span>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: 18, fontSize: 14, color: C.inkMute }}>
              No {noun} match &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
