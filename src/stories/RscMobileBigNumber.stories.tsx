import type { Meta, StoryObj } from '@storybook/react';
import { BigNumber } from '../rsc-mobile';
import { StoryShell, mobileArgTypes } from './RscMobileStoryShell';
import { bigNumberTrend } from '../data';

const trend = bigNumberTrend.map((d) => ({ x: String(d.idx), y: d.visitors }));

function BigNumberDemo({ isDark, withTrend }: { isDark: boolean; withTrend: boolean }) {
  return (
    <StoryShell isDark={isDark} maxWidth={220}>
      <BigNumber label="Visitors" value="1,480" trend={withTrend ? trend : undefined} isDark={isDark} />
    </StoryShell>
  );
}

const meta: Meta<typeof BigNumberDemo> = {
  title: 'RSC Mobile/BigNumber',
  component: BigNumberDemo,
  args: { isDark: false, withTrend: true },
  argTypes: { ...mobileArgTypes, withTrend: { control: 'boolean' } },
};
export default meta;

type Story = StoryObj<typeof BigNumberDemo>;
export const WithTrend: Story = {};
export const NoTrend: Story = { args: { withTrend: false } };
export const Dark: Story = { args: { isDark: true } };
