import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { Card } from '../Card';
import { areaSpec } from '../charts';

function ClassicAreaDemo() {
  return (
    <div style={{ padding: 16, maxWidth: 360 }}>
      <Card title="Browser Share" subtitle="Area">
        <ResponsiveVegaLiteChart spec={areaSpec} aspectRatio={0.62} />
      </Card>
    </div>
  );
}

const meta: Meta<typeof ClassicAreaDemo> = {
  title: 'Mobile/Classic/Area',
  component: ClassicAreaDemo,
};
export default meta;

type Story = StoryObj<typeof ClassicAreaDemo>;
export const Default: Story = {};
