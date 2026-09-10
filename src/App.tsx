import { useState } from 'react';
import { ResponsiveVegaLiteChart } from './ResponsiveVegaLiteChart';
import { Card } from './Card';
import { buildGaugeSpec, buildDonutSummarySpec, buildCompactDualBarSpec, buildMiniBarListSpec, buildLineCalloutSpec } from './mobileCharts';
import { spend, comboData, browserTrend } from './data';
import { ADOBE_CLEAN_FONT, categorical16 } from './spectrumVegaTheme';

const dualBarData = browserTrend
  .filter((d) => d.browser === 'Chrome' || d.browser === 'Safari')
  .map((d) => ({ month: d.month.slice(5), browser: d.browser, share: d.share }));

const miniBarListData = spend.map((d) => ({ label: d.category, value: d.value }));

export default function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
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

        <Card title="Spend by Team" subtitle="This quarter" isDark={isDark}>
          <ResponsiveVegaLiteChart
            spec={(w, h) => buildDonutSummarySpec(w, h, { data: miniBarListData, centerLabel: 'Total spend' })}
            aspectRatio={0.85}
            colorScheme={isDark ? 'dark' : 'light'}
          />
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

        <Card title="Chrome vs Safari" subtitle="Weekly share" isDark={isDark}>
          <ResponsiveVegaLiteChart
            spec={buildCompactDualBarSpec(dualBarData, 'month', 'share', 'browser')}
            aspectRatio={0.45}
            colorScheme={isDark ? 'dark' : 'light'}
          />
        </Card>

        <Card title="Team Spend" subtitle="Ranked" isDark={isDark}>
          <ResponsiveVegaLiteChart
            spec={buildMiniBarListSpec(miniBarListData, categorical16[2])}
            aspectRatio={0.5}
            enableTapDetail={false}
          />
        </Card>
      </main>
    </div>
  );
}
