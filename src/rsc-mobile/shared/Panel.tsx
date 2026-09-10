import type { ReactNode } from 'react';
import { ADOBE_CLEAN_FONT } from '../../spectrumVegaTheme';

interface PanelProps {
  title?: string;
  isDark?: boolean;
  children: ReactNode;
}

/**
 * The plain-bordered widget panel style (thin 1px border, sharp-ish
 * corners, no shadow) — distinct from `Card.tsx`'s softer rounded/shadowed
 * style used by `mobileCharts.ts`'s dashboard. `rsc-mobile/` charts are
 * meant to read as a closer match to RSC's own desktop chart panels
 * (a bordered rectangle with a title, not an app-dashboard card), just
 * sized and touch-tuned for a phone.
 */
export function Panel({ title, isDark = false, children }: PanelProps) {
  return (
    <div
      style={{
        border: `1px solid ${isDark ? '#3a3a3a' : '#d9d9d9'}`,
        borderRadius: 4,
        background: isDark ? '#1a1d24' : '#fff',
        padding: 16,
        fontFamily: ADOBE_CLEAN_FONT,
      }}
    >
      {title && (
        <div style={{ fontSize: 15, fontWeight: 600, color: isDark ? '#eee' : '#3a2f1c', marginBottom: 12 }}>{title}</div>
      )}
      {children}
    </div>
  );
}
