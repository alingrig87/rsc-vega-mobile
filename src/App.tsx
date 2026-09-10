import { useState } from 'react';
import { ResponsiveVegaLiteChart } from './ResponsiveVegaLiteChart';
import { Card } from './Card';
import { Legend } from './Legend';
import { BarList } from './BarList';
import {
  buildGaugeSpec,
  buildConcentricGaugeSpec,
  buildDonutSummarySpec,
  getDonutLegend,
  buildLineCalloutSpec,
  buildTrendSparklineSpec,
  buildStackedAreaSpec,
  getSeriesLegend,
} from './mobileCharts';
import { spend, comboData, browserTrend } from './data';
import { ADOBE_CLEAN_FONT, categorical16 } from './spectrumVegaTheme';

const donutData = spend.map((d) => ({ label: d.category, value: d.value }));
const donutLegend = getDonutLegend(donutData);

const browserSeriesOrder = ['Chrome', 'Safari', 'Firefox', 'Edge'];
const browserLegend = getSeriesLegend(browserSeriesOrder, [categorical16[6], categorical16[1], categorical16[2], categorical16[3]]);

const comparisonData = spend.map((d) => ({ label: d.category, current: d.value, previous: Math.round(d.value * (0.82 + Math.random() * 0.3)) }));

const chromeTrend = browserTrend.filter((d) => d.browser === 'Chrome').map((d, i) => ({ idx: i, share: d.share }));
const chromePrevTrend = chromeTrend.map((d) => ({ idx: d.idx, share: d.share - 6 + Math.random() * 3 }));
const safariTrend = browserTrend.filter((d) => d.browser === 'Safari').map((d, i) => ({ idx: i, share: d.share }));
const safariPrevTrend = safariTrend.map((d) => ({ idx: d.idx, share: d.share + 3 + Math.random() * 2 }));

function DeltaBadge({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: up ? 'rgb(0, 143, 93)' : 'rgb(211, 21, 16)' }}>
      {up ? '▲' : '▼'} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        // belt-and-suspenders with ResponsiveVegaLiteChart's per-chart
        // clip: this is what actually guarantees no visible horizontal
        // scrollbar, no matter how a chart's own `overflowMargin` (or a
        // future chart's own quirk) is tuned — see that component's doc
        // comment for the full reasoning.
        overflowX: 'hidden',
        background: isDark ? '#12151c' : '#f4f5f9',
        fontFamily: ADOBE_CLEAN_FONT,
        paddingBottom: 32,
      }}
    >
      <header
        style={{
          background: `linear-gradient(135deg, ${categorical16[1]}, ${categorical16[0]})`,
          color: '#fff',
          padding: '20px 16px 28px',
          borderRadius: '0 0 24px 24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Welcome back</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Dashboard</div>
          </div>
          <button
            onClick={() => setIsDark((d) => !d)}
            style={{ background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 20, padding: '6px 12px', color: '#fff', fontSize: 12 }}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      <main style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, marginTop: -12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Card title="Monthly Goal" isDark={isDark}>
            <ResponsiveVegaLiteChart
              spec={(w, h) => buildGaugeSpec(w, h, { value: 72, color: categorical16[6], label: undefined })}
              aspectRatio={1}
              enableTapDetail={false}
            />
          </Card>
          <Card title="Revenue Target" isDark={isDark}>
            <ResponsiveVegaLiteChart
              spec={(w, h) => buildGaugeSpec(w, h, { value: 89, color: categorical16[8], label: undefined })}
              aspectRatio={1}
              enableTapDetail={false}
            />
          </Card>
        </div>

        <Card title="Quality Score" subtitle="Three tracked metrics" isDark={isDark}>
          {/* Ring above, legend below — a side-by-side flex row here kept
              overflowing the card on narrow viewports (confirmed by reading
              `document.documentElement.scrollWidth` back at a 390px
              viewport: it came back 796). Stacking vertically has no
              shrink-to-fit tug-of-war between the ring and the legend text
              at all, which is worth more here than matching the reference
              screenshot's side-by-side arrangement pixel for pixel. */}
          <div style={{ maxWidth: 220, margin: '0 auto' }}>
            <ResponsiveVegaLiteChart
              spec={(w, h) =>
                buildConcentricGaugeSpec(
                  w,
                  h,
                  [
                    { value: 72, color: categorical16[6] },
                    { value: 43, color: categorical16[3] },
                    { value: 15, color: categorical16[5] },
                  ],
                  '89',
                )
              }
              aspectRatio={1}
              enableTapDetail={false}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14, marginTop: 10, fontSize: 12, color: isDark ? '#ccc' : '#333' }}>
            <LegendChip color={categorical16[6]} label="Stability" value="72%" isDark={isDark} />
            <LegendChip color={categorical16[3]} label="Quality" value="43%" isDark={isDark} />
            <LegendChip color={categorical16[5]} label="Responsiveness" value="15%" isDark={isDark} />
          </div>
        </Card>

        <Card title="Spend by Team" subtitle="This quarter" isDark={isDark}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: '1 1 0', minWidth: 0 }}>
              <ResponsiveVegaLiteChart
                spec={(w, h) => buildDonutSummarySpec(w, h, { data: donutData, centerLabel: 'Total spend', colors: donutLegend.map((e) => e.color) })}
                aspectRatio={1}
                colorScheme={isDark ? 'dark' : 'light'}
              />
            </div>
            <div style={{ flex: '1 1 0', minWidth: 0 }}>
              <Legend entries={donutLegend} isDark={isDark} layout="right" />
            </div>
          </div>
        </Card>

        <Card title="Revenue" subtitle="Last 5 months" isDark={isDark}>
          <ResponsiveVegaLiteChart
            spec={(w, h) =>
              buildLineCalloutSpec(w, h, {
                data: comboData,
                dimensionField: 'month',
                metricField: 'visitors',
                format: (v) => `${(Number(v) / 1000).toFixed(1)}K`,
                color: categorical16[6],
              })
            }
            aspectRatio={0.5}
            enableTapDetail={false}
          />
        </Card>

        <Card title="Browser Share" subtitle="Last 5 months" isDark={isDark}>
          <ResponsiveVegaLiteChart
            spec={buildStackedAreaSpec({
              data: browserTrend,
              dimensionField: 'month',
              metricField: 'share',
              seriesField: 'browser',
              seriesOrder: browserSeriesOrder,
              colors: browserLegend.map((e) => e.color),
            })}
            aspectRatio={0.65}
            colorScheme={isDark ? 'dark' : 'light'}
          />
          <div style={{ marginTop: 8 }}>
            <Legend entries={browserLegend} isDark={isDark} layout="bottom" />
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Card title="Chrome" isDark={isDark}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: isDark ? '#eee' : '#1a1a2e' }}>{chromeTrend[chromeTrend.length - 1]?.share}%</span>
              <DeltaBadge value={6.2} />
            </div>
            <ResponsiveVegaLiteChart
              spec={buildTrendSparklineSpec({ data: chromeTrend, previousData: chromePrevTrend, dimensionField: 'idx', metricField: 'share', color: categorical16[6] })}
              aspectRatio={0.4}
              enableTapDetail={false}
            />
          </Card>
          <Card title="Safari" isDark={isDark}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: isDark ? '#eee' : '#1a1a2e' }}>{safariTrend[safariTrend.length - 1]?.share}%</span>
              <DeltaBadge value={-3.1} />
            </div>
            <ResponsiveVegaLiteChart
              spec={buildTrendSparklineSpec({ data: safariTrend, previousData: safariPrevTrend, dimensionField: 'idx', metricField: 'share', color: categorical16[1] })}
              aspectRatio={0.4}
              enableTapDetail={false}
            />
          </Card>
        </div>

        <Card title="Spend by Team" subtitle="Current vs. last quarter" isDark={isDark}>
          <BarList
            entries={comparisonData.map((d) => ({ label: d.label, value: d.current, previousValue: d.previous, color: categorical16[0] }))}
            isDark={isDark}
            valueStyle="none"
          />
        </Card>

        <Card title="Team Spend" subtitle="Ranked" isDark={isDark}>
          <BarList entries={donutLegend} isDark={isDark} />
        </Card>
      </main>
    </div>
  );
}

function LegendChip({ color, label, value, isDark }: { color: string; label: string; value: string; isDark: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
      <span style={{ width: 8, height: 8, borderRadius: 4, background: color, flexShrink: 0 }} />
      <span>{label}</span>
      <strong style={{ color: isDark ? '#eee' : '#1a1a2e' }}>{value}</strong>
    </span>
  );
}
