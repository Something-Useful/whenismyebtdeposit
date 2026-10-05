'use client';
// Dev-only click-to-source: hold Cmd+Shift to highlight, Cmd+Shift+click to
// open the nearest enclosing component's file in your editor.
//
// Next's App Router ships a React canary with per-JSX `_debugSource`
// stripped, so exact line numbers are gone. Instead we build a
// component-function → file map from webpack's require.context over
// components/, walk the clicked element's fiber chain to the first function
// component in that map, and open its file through the dev server's
// /__nextjs_launch-editor endpoint. That endpoint launches whatever editor
// your environment sets (REACT_EDITOR / LAUNCH_EDITOR — e.g. `code`,
// `subl`, `vim`). Renders nothing and maps nothing in production.
import { useEffect } from 'react';

type Fiber = {
  type: unknown;
  return: Fiber | null;
};

// Two indexes into the same data. Identity is exact but goes stale the
// moment HMR swaps a module (the edited component becomes a new function
// object), which would silently resolve to the nearest un-edited ancestor
// instead — so name is the fallback, and names survive hot reloads.
const fileByComponent = new Map<unknown, string>();
const fileByName = new Map<string, string>();

if (process.env.NODE_ENV === 'development') {
  try {
    // require.context is a webpack build-time API and must be written
    // literally (an aliased `require` breaks static extraction). If the
    // bundler ever changes (turbopack), the catch degrades this to a no-op.
    // @ts-expect-error -- webpack-only API, not in the TS lib
    const ctx = require.context('./', false, /\.tsx$/);
    for (const key of ctx.keys() as string[]) {
      const mod = ctx(key) as Record<string, unknown>;
      const file = `components/${key.replace(/^\.\//, '')}`;
      for (const [name, exp] of Object.entries(mod)) {
        if (typeof exp !== 'function') continue;
        // An alias re-export (ValuePropsSection.tsx → ValueProps) exports the
        // same function object under a different name. Let the file that
        // *defines* the function win, so we open the real component and not
        // the one-line shim.
        const defining = name === exp.name;
        if (defining || !fileByComponent.has(exp)) fileByComponent.set(exp, file);
        if (defining || !fileByName.has(name)) fileByName.set(name, file);
      }
    }
  } catch {
    /* non-webpack bundler — click-to-source quietly does nothing */
  }
}

function nameOf(type: unknown): string | null {
  const t = type as { displayName?: string; name?: string };
  return t?.displayName ?? t?.name ?? null;
}

function fileFor(type: unknown): string | undefined {
  if (typeof type !== 'function') return undefined;
  const byIdentity = fileByComponent.get(type);
  if (byIdentity) return byIdentity;
  const name = nameOf(type);
  return name ? fileByName.get(name) : undefined;
}

// Server Components (the static pages: partners, privacy, terms, and the
// page shells) never ship their functions to the browser, so the fiber walk
// can't resolve them. Fall back to the file that owns the current route.
function pageFileForPath(path: string): { name: string; file: string } {
  const routes: Array<[RegExp, string]> = [
    [/^\/embed\/create(\/|$)/, 'app/embed/create/page.tsx'],
    [/^\/embed(\/|$)/, 'app/embed/(widget)/[[...slug]]/page.tsx'],
    [/^\/partner(\/|$)/, 'app/partner/page.tsx'],
    [/^\/privacy(\/|$)/, 'app/privacy/page.tsx'],
    [/^\/terms(\/|$)/, 'app/terms/page.tsx'],
  ];
  for (const [rx, file] of routes) if (rx.test(path)) return { name: 'Page', file };
  return { name: 'Page', file: 'app/[[...slug]]/page.tsx' };
}

function componentForElement(
  start: Element | null,
): { name: string; file: string } | null {
  for (let el = start; el; el = el.parentElement) {
    const fiberKey = Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
    if (!fiberKey) continue;
    let fiber = (el as unknown as Record<string, Fiber>)[fiberKey];
    while (fiber) {
      const file = fileFor(fiber.type);
      if (file) return { name: nameOf(fiber.type) ?? 'component', file };
      fiber = fiber.return as Fiber;
    }
  }
  return null;
}

export function DevClickToComponent() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const box = document.createElement('div');
    Object.assign(box.style, {
      position: 'fixed',
      zIndex: '99999',
      pointerEvents: 'none',
      border: '2px solid #3a7d3a',
      borderRadius: '4px',
      background: 'rgba(58,125,58,0.08)',
      display: 'none',
    });
    const label = document.createElement('div');
    Object.assign(label.style, {
      position: 'absolute',
      top: '-22px',
      left: '0',
      padding: '2px 7px',
      borderRadius: '4px',
      background: '#3a7d3a',
      color: '#fff',
      fontSize: '11px',
      fontFamily: 'ui-monospace, monospace',
      whiteSpace: 'nowrap',
    });
    box.appendChild(label);
    document.body.appendChild(box);

    const hide = () => {
      box.style.display = 'none';
    };

    const armed = (e: MouseEvent | KeyboardEvent) => e.metaKey && e.shiftKey;

    const onMouseMove = (e: MouseEvent) => {
      if (!armed(e)) return hide();
      const el = e.target as Element | null;
      if (!el || el === box) return;
      const hit = componentForElement(el) ?? pageFileForPath(location.pathname);
      const r = el.getBoundingClientRect();
      Object.assign(box.style, {
        display: 'block',
        left: `${r.left}px`,
        top: `${r.top}px`,
        width: `${r.width}px`,
        height: `${r.height}px`,
      });
      label.textContent = `${hit.name} → ${hit.file}`;
    };

    const onClick = (e: MouseEvent) => {
      if (!armed(e)) return;
      // Always swallow the armed combo in dev — the browser default on a
      // link would open a new tab/window.
      e.preventDefault();
      e.stopPropagation();
      const hit =
        componentForElement(e.target as Element | null) ?? pageFileForPath(location.pathname);
      const params = new URLSearchParams({
        file: hit.file,
        lineNumber: '1',
        column: '1',
      });
      fetch(`/__nextjs_launch-editor?${params.toString()}`).catch(() => {
        console.error('[click-to-source] failed to open editor');
      });
      hide();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || e.key === 'Shift') hide();
    };

    window.addEventListener('mousemove', onMouseMove, true);
    window.addEventListener('click', onClick, true);
    window.addEventListener('keyup', onKeyUp, true);
    window.addEventListener('blur', hide);
    return () => {
      window.removeEventListener('mousemove', onMouseMove, true);
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('keyup', onKeyUp, true);
      window.removeEventListener('blur', hide);
      box.remove();
    };
  }, []);

  return null;
}
