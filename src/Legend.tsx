import type { DonutLegendEntry } from './mobileCharts';

interface LegendProps {
  entries: DonutLegendEntry[];
  isDark?: boolean;
  /** `'right'` — a vertical stacked list, meant to sit beside a ring. `'bottom'` — a wrapped row of chips, meant to sit under one. */
  layout?: 'right' | 'bottom';
}

/**
 * Plain HTML/CSS legend for the mobile donut charts — deliberately not a
 * Vega-Lite legend. See `buildDonutSummarySpec`'s doc comment in
 * mobileCharts.ts for why: a chart-engine-drawn legend doesn't reliably
 * respect a width/height reserved for it by the caller, and a browser flex
 * layout always will. Takes the same `{label, value, color}[]` shape
 * `getDonutLegend(data)` returns, so the colors always match the ring.
 */
export function Legend({ entries, isDark = false, layout = 'right' }: LegendProps) {
  const textColor = isDark ? '#ccc' : '#333';
  if (layout === 'right') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: textColor, minWidth: 0 }}>
        {entries.map((entry) => (
          <div key={entry.label} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: entry.color, flexShrink: 0 }} />
            <span
              style={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {entry.label}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 14px', fontSize: 12, color: textColor }}>
      {entries.map((entry) => (
        <span key={entry.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: entry.color, flexShrink: 0 }} />
          {entry.label}
        </span>
      ))}
    </div>
  );
}
