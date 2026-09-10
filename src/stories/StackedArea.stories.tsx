import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { buildStackedAreaSpec, getSeriesLegend } from '../mobileCharts';
import { Card } from '../Card';
import { Legend } from '../Legend';
import { browserTrend } from '../data';
import { categorical16 } from '../spectrumVegaTheme';

const seriesOrder = ['Chrome', 'Safari', 'Firefox', 'Edge'];
const legend = getSeriesLegend(seriesOrder, [categorical16[6], categorical16[1], categorical16[2], categorical16[3]]);

function StackedAreaDemo() {
  return (
    <div style={{ padding: 16, maxWidth: 400 }}>
      <Card title="Browser Share" subtitle="Last 5 months">
        <ResponsiveVegaLiteChart
          spec={buildStackedAreaSpec({
            data: browserTrend,
            dimensionField: 'month',
            metricField: 'share',
            seriesField: 'browser',
            seriesOrder,
            colors: legend.map((e) => e.color),
          })}
          aspectRatio={0.65}
        />
        <div style={{ marginTop: 8 }}>
          <Legend entries={legend} layout="bottom" />
        </div>
      </Card>
    </div>
  );
}

const meta: Meta<typeof StackedAreaDemo> = {
  title: 'Mobile/StackedArea',
  component: StackedAreaDemo,
};
export default meta;

type Story = StoryObj<typeof StackedAreaDemo>;
export const Default: Story = {};
