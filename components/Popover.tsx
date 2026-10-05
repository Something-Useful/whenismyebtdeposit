'use client';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { C, SERIF } from '@/lib/tokens';
import { telHref } from '@/lib/state-data';

interface Props {
  open: boolean;
  onClose: () => void;
  /**
   * Ref to the trigger element. Used to:
   *   1. position the popover (top placement is computed from the anchor's
   *      offset within the *popover's* positioned ancestor, so the trigger
   *      can live anywhere — e.g. inside the header's DayCard while the
   *      popover renders in the body wrapper)
   *   2. ignore click-outside dismissal when the user clicks the trigger
   *      itself (so the trigger's own onClick can toggle, not double-close)
   *
   * The popover's nearest positioned ancestor is its containing block. Make
   * sure that ancestor has `position: relative` and is the element you want
   * the popover to span the width of.
   */
  anchorRef: RefObject<HTMLElement | null>;
  title?: string;
  children: ReactNode;
  /** Optional aria-label override. Defaults to `title`. */
  ariaLabel?: string;
  /**
   * Which side of the anchor we'd like the popover on. The placement logic
   * still flips to the other side if the preferred side won't fit, but this
   * is the tie-breaker. Default `'below'`.
   *
   * Use `'above'` for triggers that sit near the bottom of the page, where
   * opening downward would push the content past the fold.
   */
  preferredPlacement?: 'below' | 'above';
}

/**
 * Full-width popover anchored to a trigger. Replaces the centered InfoModal /
 * SupportModal pattern for "what is this field?" and "didn't get your
 * benefits?" — both are contextual help, not true modals.
 *
 * Layout: position:absolute within the trigger's nearest positioned
 * ancestor. left:0/right:0 → spans the full content width of that ancestor.
 * Vertical placement (above/below the trigger) is chosen at open time based
 * on which side has more viewport space.
 *
 * Dismissal: click outside the popover (and outside the trigger), or press
 * Escape, or click the close X.
 */
export function Popover({
  open,
  onClose,
  anchorRef,
  title,
  children,
  ariaLabel,
  preferredPlacement = 'below',
}: Props) {
  const popoverRef = useRef<HTMLDivElement>(null);
  // `measured` tracks whether we've sized the popover after mount. We render
  // with visibility:hidden until then so the user never sees a flicker at
  // top=0 before useLayoutEffect re-positions us.
  const [pos, setPos] = useState<{
    top: number;
    placement: 'below' | 'above';
    measured: boolean;
  }>({ top: 0, placement: 'below', measured: false });

  // Position the popover when it opens. useLayoutEffect runs synchronously
  // after the DOM is committed but before the browser paints — so we
  // measure the *actual* popover height and decide above/below based on
  // whether the real popover fits, not a fixed estimate.
  useLayoutEffect(() => {
    if (!open) {
      // Reset measured=false so the next open starts hidden and re-measures.
      setPos((p) => (p.measured ? { ...p, measured: false } : p));
      return;
    }
    if (!anchorRef.current || !popoverRef.current) return;

    const compute = () => {
      const anchor = anchorRef.current;
      const popover = popoverRef.current;
      if (!anchor || !popover) return;
      // Measure against the POPOVER's containing block — the anchor may sit
      // in a different positioned ancestor (e.g. the DayCard in the header),
      // and `top` below is resolved against the popover's ancestor.
      const offsetParent = popover.offsetParent as HTMLElement | null;
      if (!offsetParent) return;
      const anchorRect = anchor.getBoundingClientRect();
      const parentRect = offsetParent.getBoundingClientRect();
      // Offset of the anchor's top within the offsetParent's content box.
      const anchorTopInParent = anchorRect.top - parentRect.top;
      const anchorBottomInParent = anchorRect.bottom - parentRect.top;

      const spaceBelow = window.innerHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;
      // Measure the popover's actual rendered height (it's in the DOM but
      // hidden via visibility:hidden during this measurement pass).
      const popoverHeight = popover.offsetHeight;
      // Need ~16px of breathing room beyond the popover so it doesn't kiss
      // the viewport edge.
      const fitsBelow = spaceBelow >= popoverHeight + 16;
      const fitsAbove = spaceAbove >= popoverHeight + 16;

      // Honor the caller's preferred side when it fits. Fall back to the
      // other side if the preferred side doesn't fit but the other does.
      // If neither fits in the viewport, pick whichever side has more room —
      // the scrollIntoView below will pull the rest into view.
      const preferenceFits = preferredPlacement === 'below' ? fitsBelow : fitsAbove;
      const otherFits = preferredPlacement === 'below' ? fitsAbove : fitsBelow;
      // An embed iframe can grow downward but not upward.
      const framed = window.self !== window.top;
      const placement: 'below' | 'above' = framed
        ? 'below'
        : preferenceFits
          ? preferredPlacement
          : otherFits
            ? preferredPlacement === 'below'
              ? 'above'
              : 'below'
            : spaceBelow >= spaceAbove
              ? 'below'
              : 'above';

      // For "above" placement we compute the real top (no transform) so the
      // layout box matches the visible position. That lets scrollIntoView
      // and click-outside hit-testing work correctly.
      const top =
        placement === 'below'
          ? anchorBottomInParent + 8
          : anchorTopInParent - popoverHeight - 16;

      setPos({ top, placement, measured: true });

      // If the popover ends up partially or fully outside the viewport
      // (common when "above" placement pushes it above a scrolled-down
      // viewport), pull it into view. `nearest` avoids over-scrolling when
      // it's already visible.
      requestAnimationFrame(() => {
        popover.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    };
    compute();
    // Re-measure on viewport resize (orientation, mobile keyboard).
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [open, anchorRef, preferredPlacement]);

  // Click outside / Escape to close.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popoverRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={ariaLabel ?? title}
      style={{
        position: 'absolute',
        top: pos.top,
        // Narrower than the cards below (inset + capped width) so the
        // popover reads as floating above the page, not another card.
        left: 12,
        right: 12,
        maxWidth: 480,
        margin: '0 auto',
        background: '#fff',
        border: `1px solid ${C.line}`,
        borderRadius: 18,
        padding: '22px 24px 20px',
        boxShadow: '0 18px 48px rgba(21,20,15,0.28), 0 6px 16px rgba(21,20,15,0.14)',
        zIndex: 50,
        // Hide until useLayoutEffect has measured and positioned us. Without
        // this the user would see a flash at top=0 before the effect runs.
        visibility: pos.measured ? 'visible' : 'hidden',
        // Opacity-only fade — both placements use real `top` now, so a
        // translate-based fade would fight with positioning.
        animation: pos.measured ? 'popoverFadeIn 0.18s ease both' : undefined,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          all: 'unset',
          cursor: 'pointer',
          position: 'absolute',
          top: 10,
          right: 12,
          width: 32,
          height: 32,
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: C.inkSoft,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {title && (
        <h2
          style={{
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: 20,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            margin: '0 36px 8px 0',
            color: C.ink,
          }}
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

/**
 * Turn links and phone numbers inside body text into clickable anchors:
 *   - `[label](https://url)` — explicit link with display text
 *   - bare domains (mybenefits.ny.gov, gateway.ga.gov/some/path, …)
 *   - phone numbers in the 1-XXX-XXX-XXXX format → tel: links
 */
export function linkifyText(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern =
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\b(1-\d{3}-\d{3}-\d{4})\b|\b([a-z0-9][a-z0-9.-]*\.(?:gov|com|org|net)(?:\/[^\s,)]*)?)/gi;
  const linkStyle = { color: C.inkSoft, textDecoration: 'underline' } as const;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index));
    if (match[1]) {
      parts.push(
        <a
          key={key++}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          {match[1]}
        </a>,
      );
      lastIdx = match.index + match[0].length;
    } else if (match[3]) {
      parts.push(
        <a key={key++} href={telHref(match[3])} style={linkStyle}>
          {match[3]}
        </a>,
      );
      lastIdx = match.index + match[0].length;
    } else {
      const url = match[4].replace(/[.,)]$/, '');
      parts.push(
        <a
          key={key++}
          href={`https://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          {url}
        </a>,
      );
      lastIdx = match.index + url.length;
    }
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts;
}
