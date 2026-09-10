import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: ReactNode;
  isDark?: boolean;
  children: ReactNode;
}

/**
 * The one visual container every mobile-dashboard reference screenshot
 * shares: a rounded, softly-shadowed white/dark card. Deliberately has no
 * opinion on sizing (no flex-basis) — a parent flexbox row or CSS grid
 * controls that; `min-width: 0` here just stops a chart's measured SVG
 * width from ever forcing the card wider than its grid/flex track (the
 * classic "flex/grid item won't shrink below its content's intrinsic
 * width" trap).
 */
export function Card({ title, subtitle, isDark = false, children }: CardProps) {
  return (
    <div
      style={{
        width: '100%',
        minWidth: 0,
        background: isDark ? '#1f2430' : '#fff',
        borderRadius: 16,
        padding: 16,
        boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(15, 23, 42, 0.08)',
      }}
    >
      {title && (
        <div style={{ marginBottom: subtitle ? 2 : 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#eee' : '#1a1a2e' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, opacity: 0.6, color: isDark ? '#ccc' : '#333' }}>{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
