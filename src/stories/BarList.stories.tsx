import type { Meta, StoryObj } from '@storybook/react';
import { BarList } from '../BarList';
import { Card } from '../Card';
import { spend } from '../data';
import { categorical16 } from '../spectrumVegaTheme';

const rankedData = spend.map((d, i) => ({ label: d.category, value: d.value, color: [categorical16[6], categorical16[3], categorical16[2], categorical16[5], categorical16[7]][i] }));
const comparisonData = spend.map((d) => ({ label: d.category, value: d.value, previousValue: Math.round(d.value * 0.9), color: categorical16[0] }));

const meta: Meta<typeof BarList> = {
  title: 'Mobile/BarList',
  component: BarList,
  decorators: [
    (Story) => (
      <div style={{ padding: 16, maxWidth: 360 }}>
        <Card title="Team Spend">
          <Story />
        </Card>
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof BarList>;

/** Each row a different color, value printed past the bar's tip — the "ranked scoreboard" pattern. */
export const Ranked: Story = { args: { entries: rankedData } };

/** No value text, just the bar length — a quieter "how do these compare" reading. */
export const NoValueLabel: Story = { args: { entries: rankedData, valueStyle: 'none' } };

/** A fainter paired bar underneath each one — this period vs. last, not a ranking. */
export const CurrentVsPrevious: Story = { args: { entries: comparisonData, valueStyle: 'none' } };

export const Dark: Story = {
  args: { entries: rankedData, isDark: true },
  decorators: [
    (Story) => (
      <div style={{ padding: 16, maxWidth: 360, background: '#12151c', minHeight: '100vh' }}>
        <Card title="Team Spend" isDark>
          <Story />
        </Card>
      </div>
    ),
  ],
};
