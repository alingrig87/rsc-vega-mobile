import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { buildDonutSummarySpec, getDonutLegend } from '../mobileCharts';
import { Card } from '../Card';
import { Legend } from '../Legend';
import { spend } from '../data';

const data = spend.map((d) => ({ label: d.category, value: d.value }));
const legend = getDonutLegend(data);

function DonutSummaryDemo({ colorScheme, layout }: { colorScheme: 'light' | 'dark'; layout: 'bottom' | 'right' }) {
  const isDark = colorScheme === 'dark';
  return (
    <div style={{ padding: 16, maxWidth: 340, background: isDark ? '#12151c' : undefined, minHeight: '100vh' }}>
      <Card title="Spend by Team" subtitle="This quarter" isDark={isDark}>
        {layout === 'right' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: '1 1 0', minWidth: 0 }}>
              <ResponsiveVegaLiteChart
                spec={(w, h) => buildDonutSummarySpec(w, h, { data, centerLabel: 'Total spend', colors: legend.map((e) => e.color) })}
                aspectRatio={1}
                colorScheme={colorScheme}
              />
            </div>
            <div style={{ flex: '1 1 0', minWidth: 0 }}>
              <Legend entries={legend} isDark={isDark} layout="right" />
            </div>
          </div>
        ) : (
          <>
            <ResponsiveVegaLiteChart
              spec={(w, h) => buildDonutSummarySpec(w, h, { data, centerLabel: 'Total spend', colors: legend.map((e) => e.color) })}
              aspectRatio={0.75}
              colorScheme={colorScheme}
            />
            <div style={{ marginTop: 10 }}>
              <Legend entries={legend} isDark={isDark} layout="bottom" />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

const meta: Meta<typeof DonutSummaryDemo> = {
  title: 'Mobile/DonutSummary',
  component: DonutSummaryDemo,
  args: { colorScheme: 'light', layout: 'bottom' },
  argTypes: {
    colorScheme: { control: 'radio', options: ['light', 'dark'] },
    layout: { control: 'radio', options: ['bottom', 'right'] },
  },
};
export default meta;

type Story = StoryObj<typeof DonutSummaryDemo>;
export const Default: Story = {};
export const SideLegend: Story = { args: { layout: 'right' } };
export const Dark: Story = { args: { colorScheme: 'dark' } };
