import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { Card } from '../Card';
import { stackedBarSpec } from '../charts';

function ClassicStackedBarDemo() {
  return (
    <div style={{ padding: 16, maxWidth: 360 }}>
      <Card title="Browser Share" subtitle="Stacked">
        <ResponsiveVegaLiteChart spec={stackedBarSpec} aspectRatio={0.62} />
      </Card>
    </div>
  );
}

const meta: Meta<typeof ClassicStackedBarDemo> = {
  title: 'Mobile/Classic/Stacked Bar',
  component: ClassicStackedBarDemo,
};
export default meta;

type Story = StoryObj<typeof ClassicStackedBarDemo>;
export const Default: Story = {};
