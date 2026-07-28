'use client';

import { useEffect, useRef, useState } from 'react';

interface Token {
  cls: string;
  text: string;
  inline?: boolean;
  newline?: boolean;
}

/**
 * The hero's animated code terminal — a React port of `initTerminal()` from the
 * original `main.js`, including the token colouring, per-character typing pace
 * and the blinking cursor that disappears when the sequence completes.
 *
 * Content is reframed for RFT360 (a careers platform) but the motif, timing and
 * styling are the original's.
 */
const LINES: Token[] = [
  { cls: 't-comment', text: '// Initializing RedFort talent engine...' },
  { cls: 't-keyword', text: 'import', inline: true },
  { cls: 't-default', text: ' { ', inline: true },
  { cls: 't-class', text: 'Career', inline: true },
  { cls: 't-default', text: ' } ', inline: true },
  { cls: 't-keyword', text: 'from', inline: true },
  { cls: 't-string', text: " '@redfort/team'", inline: true },
  { cls: 't-default', text: ';', newline: true },
  { cls: 't-keyword', text: 'const', inline: true },
  { cls: 't-default', text: ' you = ', inline: true },
  { cls: 't-class', text: 'new', inline: true },
  { cls: 't-default', text: ' Career({', newline: true },
  { cls: 't-string', text: '  growth', inline: true },
  { cls: 't-default', text: ': ', inline: true },
  { cls: 't-string', text: "'accelerated'", inline: true },
  { cls: 't-default', text: ',', newline: true },
  { cls: 't-string', text: '  culture', inline: true },
  { cls: 't-default', text: ': ', inline: true },
  { cls: 't-string', text: "'people-first'", inline: true },
  { cls: 't-default', text: ',', newline: true },
  { cls: 't-string', text: '  impact', inline: true },
  { cls: 't-default', text: ': ', inline: true },
  { cls: 't-class', text: 'true', inline: true },
  { cls: 't-default', text: ',', newline: true },
  { cls: 't-default', text: '});', newline: true },
  { cls: 't-default', text: '', newline: true },
  { cls: 't-default', text: 'you', inline: true },
  { cls: 't-default', text: '.join(', inline: true },
  { cls: 't-string', text: "'RedFort'", inline: true },
  { cls: 't-default', text: ');', newline: true },
  { cls: 't-comment', text: '// ✓ Welcome to the team.' },
];

export function Terminal({ title = 'rft360 / career.ts' }: { title?: string }) {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisibleCount(LINES.length);
      setDone(true);
      return;
    }

    const timers: number[] = [];
    let delay = 600;
    LINES.forEach((token, i) => {
      timers.push(window.setTimeout(() => setVisibleCount(i + 1), delay));
      // Same pacing formula as the original.
      delay += token.text.length * 22 + (token.newline ? 120 : 30);
    });
    timers.push(window.setTimeout(() => setDone(true), delay + 800));
    return () => timers.forEach(window.clearTimeout);
  }, []);

  // Group the flat token list into rendered lines.
  const lines: Token[][] = [];
  let current: Token[] = [];
  LINES.slice(0, visibleCount).forEach((token) => {
    if (!token.inline && current.length > 0) {
      lines.push(current);
      current = [];
    }
    current.push(token);
    if (token.newline) {
      lines.push(current);
      current = [];
    }
  });
  if (current.length > 0) lines.push(current);

  return (
    <div className="terminal-window">
      <div className="terminal-bar">
        <div className="t-dot r" />
        <div className="t-dot y" />
        <div className="t-dot g" />
        <span className="terminal-title">{title}</span>
      </div>
      <div className="terminal-body" ref={bodyRef} aria-hidden="true">
        {lines.map((line, i) => (
          <span className="t-line" key={i}>
            {line.map((token, j) => (
              <span className={token.cls} key={j}>
                {token.text}
              </span>
            ))}
          </span>
        ))}
        {!done && <span className="t-cursor" />}
      </div>
    </div>
  );
}
