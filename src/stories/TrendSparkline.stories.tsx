import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { buildTrendSparklineSpec } from '../mobileCharts';
import { Card } from '../Card';
import { browserTrend } from '../data';
import { categorical16 } from '../spectrumVegaTheme';

const chromeTrend = browserTrend.filter((d) => d.browser === 'Chrome').map((d, i) => ({ idx: i, share: d.share }));
const chromePrevTrend = chromeTrend.map((d) => ({ idx: d.idx, share: d.share - 6 }));

function TrendSparklineDemo() {
  return (
    <div style={{ padding: 16, maxWidth: 220 }}>
      <Card title="Chrome">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <span style={{ fontSize: 20, fontWeight: 700 }}>{chromeTrend[chromeTrend.length - 1]?.share}%</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgb(0, 143, 93)' }}>▲ 6.2%</span>
        </div>
        <ResponsiveVegaLiteChart
          spec={buildTrendSparklineSpec({ data: chromeTrend, previousData: chromePrevTrend, dimensionField: 'idx', metricField: 'share', color: categorical16[6] })}
          aspectRatio={0.4}
          enableTapDetail={false}
        />
      </Card>
    </div>
  );
}

const meta: Meta<typeof TrendSparklineDemo> = {
  title: 'Mobile/TrendSparkline',
  component: TrendSparklineDemo,
};
export default meta;

type Story = StoryObj<typeof TrendSparklineDemo>;
export const Default: Story = {};
