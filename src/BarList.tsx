/**
 * A horizontal bar list built in plain HTML/CSS — no Vega-Lite involved.
 *
 * This exists because the Vega-Lite version of this exact widget
 * (a nominal y-axis of category labels + horizontal bars) has a real,
 * confirmed sizing bug: bisected it down to a bare-minimum spec with
 * nothing but `y: {field, type: 'nominal'}` and it *still* renders its SVG
 * wider than the width requested — Vega reserves space for the axis
 * labels on top of the canvas size instead of within it, regardless of
 * `autosize` settings ('fit', 'pad', and 'pad' + `contains: 'padding'` were
 * all tried). A `<ResponsiveVegaLiteChart>` container clips that excess
 * with `overflow: hidden` as a general safety net, but for *this specific*
 * shape that means losing the widest bar's own tick/value label — exactly
 * the content this widget exists to show. A plain CSS width percentage has
 * none of that failure mode and needed no engine at all.
 */

export interface BarListEntry {
  label: string;
  value: number;
  /** A second value to draw as a fainter paired bar behind/above the first — "current vs. previous", not a ranking. */
  previousValue?: number;
  color?: string;
}

interface BarListProps {
  entries: BarListEntry[];
  isDark?: boolean;
  /** Falls back to each entry's own `color`. */
  previousColor?: string;
  /** `'end'` — value printed just past the bar's tip, colored to match it. `'none'` — no value text (the bar length is the only cue). */
  valueStyle?: 'end' | 'none';
  format?: (value: number) => string;
  barHeight?: number;
}

const DEFAULT_PREVIOUS_COLOR = 'rgb(200, 200, 200)';

export function BarList({ entries, isDark = false, previousColor = DEFAULT_PREVIOUS_COLOR, valueStyle = 'end', format = (v) => v.toLocaleString(), barHeight = 20 }: BarListProps) {
  const max = Math.max(...entries.map((e) => Math.max(e.value, e.previousValue ?? 0)));
  const hasComparison = entries.some((e) => e.previousValue !== undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: hasComparison ? 10 : 8 }}>
      {entries.map((entry) => {
        const color = entry.color ?? 'rgb(15, 181, 174)';
        const widthPct = max > 0 ? (entry.value / max) * 100 : 0;
        const prevWidthPct = entry.previousValue !== undefined && max > 0 ? (entry.previousValue / max) * 100 : null;
        return (
          <div key={entry.label} style={{ display: 'grid', gridTemplateColumns: '76px 1fr', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span
              style={{
                fontSize: 11,
                color: isDark ? '#ccc' : '#333',
                textAlign: 'right',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {entry.label}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
              <Bar widthPct={widthPct} color={color} height={barHeight} valueText={valueStyle === 'end' ? format(entry.value) : undefined} valueColor={color} />
              {prevWidthPct !== null && <Bar widthPct={prevWidthPct} color={previousColor} height={Math.round(barHeight * 0.6)} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Bar({ widthPct, color, height, valueText, valueColor }: { widthPct: number; color: string; height: number; valueText?: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
      <div
        style={{
          width: `${Math.max(widthPct, 2)}%`,
          height,
          minWidth: 4,
          background: color,
          borderRadius: height / 2,
          flexShrink: 0,
        }}
      />
      {valueText && (
        <strong style={{ fontSize: 11, color: valueColor, flexShrink: 0 }}>{valueText}</strong>
      )}
    </div>
  );
}
