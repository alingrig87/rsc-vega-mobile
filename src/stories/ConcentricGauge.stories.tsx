import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { buildConcentricGaugeSpec } from '../mobileCharts';
import { Card } from '../Card';
import { categorical16 } from '../spectrumVegaTheme';

function ConcentricGaugeDemo() {
  return (
    <div style={{ padding: 16, maxWidth: 320 }}>
      <Card title="Quality Score" subtitle="Three tracked metrics">
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
      </Card>
    </div>
  );
}

const meta: Meta<typeof ConcentricGaugeDemo> = {
  title: 'Mobile/ConcentricGauge',
  component: ConcentricGaugeDemo,
};
export default meta;

type Story = StoryObj<typeof ConcentricGaugeDemo>;
export const Default: Story = {};
