import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { buildGaugeSpec } from '../mobileCharts';
import { Card } from '../Card';
import { categorical16 } from '../spectrumVegaTheme';

interface GaugeDemoProps {
  value: number;
  label: string;
  colorIndex: number;
}

function GaugeDemo({ value, label, colorIndex }: GaugeDemoProps) {
  return (
    <div style={{ padding: 16, maxWidth: 260 }}>
      <Card title={label}>
        <ResponsiveVegaLiteChart
          spec={(w, h) => buildGaugeSpec(w, h, { value, color: categorical16[colorIndex] })}
          aspectRatio={1}
          enableTapDetail={false}
        />
      </Card>
    </div>
  );
}

const meta: Meta<typeof GaugeDemo> = {
  title: 'Mobile/Gauge',
  component: GaugeDemo,
  args: { value: 72, label: 'Monthly Goal', colorIndex: 6 },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    colorIndex: { control: { type: 'range', min: 0, max: 15 } },
  },
};
export default meta;

type Story = StoryObj<typeof GaugeDemo>;
export const Default: Story = {};
export const NearlyFull: Story = { args: { value: 96, label: 'Revenue Target', colorIndex: 8 } };
export const Low: Story = { args: { value: 18, label: 'Tasks Complete', colorIndex: 3 } };
