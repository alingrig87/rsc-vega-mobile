import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { Card } from '../Card';
import { lineSpec } from '../charts';

function ClassicLineDemo() {
  return (
    <div style={{ padding: 16, maxWidth: 360 }}>
      <Card title="Browser Share" subtitle="Trend">
        <ResponsiveVegaLiteChart spec={lineSpec} aspectRatio={0.62} />
      </Card>
    </div>
  );
}

const meta: Meta<typeof ClassicLineDemo> = {
  title: 'Mobile/Classic/Line',
  component: ClassicLineDemo,
};
export default meta;

type Story = StoryObj<typeof ClassicLineDemo>;
export const Default: Story = {};
