import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { Card } from '../Card';
import { getDonutSpec } from '../charts';

function ClassicDonutDemo() {
  return (
    <div style={{ padding: 16, maxWidth: 360 }}>
      <Card title="Spend by Team" subtitle="Donut">
        <ResponsiveVegaLiteChart spec={getDonutSpec} aspectRatio={0.85} />
      </Card>
    </div>
  );
}

const meta: Meta<typeof ClassicDonutDemo> = {
  title: 'Mobile/Classic/Donut',
  component: ClassicDonutDemo,
};
export default meta;

type Story = StoryObj<typeof ClassicDonutDemo>;
export const Default: Story = {};
