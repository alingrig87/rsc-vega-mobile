import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { buildLineCalloutSpec } from '../mobileCharts';
import { Card } from '../Card';
import { comboData } from '../data';
import { categorical16 } from '../spectrumVegaTheme';

function LineCalloutDemo() {
  return (
    <div style={{ padding: 16, maxWidth: 360 }}>
      <Card title="Revenue" subtitle="Last 5 months">
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
    </div>
  );
}

const meta: Meta<typeof LineCalloutDemo> = {
  title: 'Mobile/LineCallout',
  component: LineCalloutDemo,
};
export default meta;

type Story = StoryObj<typeof LineCalloutDemo>;
export const Default: Story = {};
