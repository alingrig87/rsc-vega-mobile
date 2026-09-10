import type { ReactNode } from 'react';
import { PaletteProvider, PaletteSwitcher } from '../rsc-mobile';
import { ADOBE_CLEAN_FONT } from '../spectrumVegaTheme';

interface StoryShellProps {
  isDark: boolean;
  children: ReactNode;
  maxWidth?: number;
}

/**
 * The palette switcher + mobile-page background + font every `RSC Mobile/*`
 * story shares — pulled out once instead of repeating the same wrapper in
 * every story file, and to keep each individual story focused on just the
 * one chart it's demonstrating (the point of splitting these out of the
 * single Gallery story: each is its own thing to browse and tap around on
 * an actual phone, not a slice of one long scroll).
 */
export function StoryShell({ isDark, children, maxWidth = 400 }: StoryShellProps) {
  return (
    <div style={{ padding: 16, background: isDark ? '#0d0f14' : '#f4f5f9', minHeight: '100vh', fontFamily: ADOBE_CLEAN_FONT }}>
      <PaletteProvider>
        <div style={{ marginBottom: 16 }}>
          <PaletteSwitcher isDark={isDark} />
        </div>
        <div style={{ maxWidth }}>{children}</div>
      </PaletteProvider>
    </div>
  );
}

export const mobileArgTypes = { isDark: { control: 'boolean' as const } };
