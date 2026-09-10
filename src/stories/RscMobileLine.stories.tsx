import type { Meta, StoryObj } from '@storybook/react';
import { Line } from '../rsc-mobile';
import { StoryShell, mobileArgTypes } from './RscMobileStoryShell';
import { browserTrend } from '../data';

const lineData = browserTrend
  .filter((d) => d.browser === 'Chrome' || d.browser === 'Safari')
  .map((d) => ({ x: d.month.slice(5), y: d.share, series: d.browser }));

function LineDemo({ isDark, filled }: { isDark: boolean; filled: boolean }) {
  return (
    <StoryShell isDark={isDark}>
      <Line title="Browser Share" data={lineData} yLabel="Share (%)" isDark={isDark} filled={filled} />
    </StoryShell>
  );
}

const meta: Meta<typeof LineDemo> = {
  title: 'RSC Mobile/Line',
  component: LineDemo,
  args: { isDark: false, filled: false },
  argTypes: { ...mobileArgTypes, filled: { control: 'boolean' } },
};
export default meta;

type Story = StoryObj<typeof LineDemo>;
export const Trend: Story = {};
export const Filled: Story = { args: { filled: true } };
export const Dark: Story = { args: { isDark: true } };
