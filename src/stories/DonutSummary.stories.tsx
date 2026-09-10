import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { buildDonutSummarySpec } from '../mobileCharts';
import { Card } from '../Card';
import { spend } from '../data';

const data = spend.map((d) => ({ label: d.category, value: d.value }));

function DonutSummaryDemo({ colorScheme }: { colorScheme: 'light' | 'dark' }) {
  return (
    <div style={{ padding: 16, maxWidth: 320, background: colorScheme === 'dark' ? '#12151c' : undefined, minHeight: '100vh' }}>
      <Card title="Spend by Team" subtitle="This quarter" isDark={colorScheme === 'dark'}>
        <ResponsiveVegaLiteChart
          spec={(w, h) => buildDonutSummarySpec(w, h, { data, centerLabel: 'Total spend' })}
          aspectRatio={0.85}
          colorScheme={colorScheme}
        />
      </Card>
    </div>
  );
}

const meta: Meta<typeof DonutSummaryDemo> = {
  title: 'Mobile/DonutSummary',
  component: DonutSummaryDemo,
  args: { colorScheme: 'light' },
  argTypes: { colorScheme: { control: 'radio', options: ['light', 'dark'] } },
};
export default meta;

type Story = StoryObj<typeof DonutSummaryDemo>;
export const Default: Story = {};
export const Dark: Story = { args: { colorScheme: 'dark' } };
