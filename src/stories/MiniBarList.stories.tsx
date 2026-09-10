import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { buildMiniBarListSpec } from '../mobileCharts';
import { Card } from '../Card';
import { spend } from '../data';
import { categorical16 } from '../spectrumVegaTheme';

const data = spend.map((d) => ({ label: d.category, value: d.value }));

function MiniBarListDemo() {
  return (
    <div style={{ padding: 16, maxWidth: 360 }}>
      <Card title="Team Spend" subtitle="Ranked">
        <ResponsiveVegaLiteChart spec={buildMiniBarListSpec(data, categorical16[2])} aspectRatio={0.5} enableTapDetail={false} />
      </Card>
    </div>
  );
}

const meta: Meta<typeof MiniBarListDemo> = {
  title: 'Mobile/MiniBarList',
  component: MiniBarListDemo,
};
export default meta;

type Story = StoryObj<typeof MiniBarListDemo>;
export const Default: Story = {};
