import { createContext, useContext, useState, type ReactNode } from 'react';
import { categorical16 } from '../../spectrumVegaTheme';

export interface Palette {
  id: string;
  name: string;
  colors: string[];
}

// "Spectrum" is the project's own default (same categorical16 every other
// chart in this repo uses) — the others are alternate palettes a user can
// switch to, same idea as RSC's own `<Chart colors={[...]}>` prop, just
// exposed as a picker instead of a code-level array.
export const PALETTES: Palette[] = [
  { id: 'spectrum', name: 'Spectrum', colors: categorical16 },
  {
    id: 'warm',
    name: 'Warm',
    colors: ['rgb(180, 95, 6)', 'rgb(24, 100, 171)', 'rgb(232, 93, 47)', 'rgb(155, 143, 9)', 'rgb(74, 144, 226)', 'rgb(201, 64, 64)', 'rgb(214, 158, 46)', 'rgb(56, 161, 105)'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: ['rgb(11, 94, 140)', 'rgb(32, 156, 158)', 'rgb(90, 120, 200)', 'rgb(14, 165, 165)', 'rgb(56, 108, 176)', 'rgb(103, 178, 184)', 'rgb(26, 60, 110)', 'rgb(130, 195, 200)'],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: ['rgb(219, 84, 68)', 'rgb(240, 147, 43)', 'rgb(190, 50, 110)', 'rgb(245, 178, 71)', 'rgb(150, 40, 90)', 'rgb(230, 110, 60)', 'rgb(120, 30, 70)', 'rgb(250, 200, 110)'],
  },
];

interface PaletteContextValue {
  palette: Palette;
  setPaletteId: (id: string) => void;
}

const PaletteContext = createContext<PaletteContextValue>({ palette: PALETTES[0], setPaletteId: () => {} });

/** Wrap any group of `rsc-mobile` charts in this once; every chart inside reads the active palette via `usePalette()` instead of taking its own `colors` prop, so a single switcher controls all of them together. */
export function PaletteProvider({ children, defaultPaletteId = 'spectrum' }: { children: ReactNode; defaultPaletteId?: string }) {
  const [id, setId] = useState(defaultPaletteId);
  const palette = PALETTES.find((p) => p.id === id) ?? PALETTES[0];
  return <PaletteContext.Provider value={{ palette, setPaletteId: setId }}>{children}</PaletteContext.Provider>;
}

export function usePalette(): PaletteContextValue {
  return useContext(PaletteContext);
}

/** A row of palette swatches — click one to switch every chart under the same `PaletteProvider`. */
export function PaletteSwitcher({ isDark = false }: { isDark?: boolean }) {
  const { palette, setPaletteId } = usePalette();
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      {PALETTES.map((p) => (
        <button
          key={p.id}
          onClick={() => setPaletteId(p.id)}
          aria-pressed={p.id === palette.id}
          aria-label={`${p.name} palette`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
            borderRadius: 16,
            border: p.id === palette.id ? `1.5px solid ${isDark ? '#eee' : '#1a1a2e'}` : `1px solid ${isDark ? '#3a3a3a' : '#ddd'}`,
            background: isDark ? '#1c2029' : '#fff',
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex' }}>
            {p.colors.slice(0, 4).map((c, i) => (
              <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, marginLeft: i === 0 ? 0 : -3, border: `1px solid ${isDark ? '#1c2029' : '#fff'}` }} />
            ))}
          </span>
          <span style={{ fontSize: 11, color: isDark ? '#ddd' : '#333' }}>{p.name}</span>
        </button>
      ))}
    </div>
  );
}
