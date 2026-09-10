import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { Card } from '../Card';
import { barSpec } from '../charts';

function ClassicBarDemo() {
  return (
    <div style={{ padding: 16, maxWidth: 360 }}>
      <Card title="Spend by Team">
        <ResponsiveVegaLiteChart spec={barSpec} aspectRatio={0.62} />
      </Card>
    </div>
  );
}

const meta: Meta<typeof ClassicBarDemo> = {
  title: 'Mobile/Classic/Bar',
  component: ClassicBarDemo,
};
export default meta;

type Story = StoryObj<typeof ClassicBarDemo>;
export const Default: Story = {};
