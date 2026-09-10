import type { Meta, StoryObj } from '@storybook/react';
import { Scatter } from '../rsc-mobile';
import { StoryShell, mobileArgTypes } from './RscMobileStoryShell';
import { scatterData } from '../data';

const scatterPoints = scatterData.map((d) => ({ x: d.speed, y: d.handling, series: d.weightClass }));

function ScatterDemo({ isDark }: { isDark: boolean }) {
  return (
    <StoryShell isDark={isDark}>
      <Scatter title="Speed vs. Handling" data={scatterPoints} xLabel="Speed" yLabel="Handling" isDark={isDark} />
    </StoryShell>
  );
}

const meta: Meta<typeof ScatterDemo> = {
  title: 'RSC Mobile/Scatter',
  component: ScatterDemo,
  args: { isDark: false },
  argTypes: mobileArgTypes,
};
export default meta;

type Story = StoryObj<typeof ScatterDemo>;
export const Default: Story = {};
export const Dark: Story = { args: { isDark: true } };
