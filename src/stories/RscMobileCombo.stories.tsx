import type { Meta, StoryObj } from '@storybook/react';
import { Combo } from '../rsc-mobile';
import { StoryShell, mobileArgTypes } from './RscMobileStoryShell';
import { comboData } from '../data';

const comboRows = comboData.map((d) => ({ x: d.month.slice(5), bar: d.visitors, line: d.conversion }));

function ComboDemo({ isDark }: { isDark: boolean }) {
  return (
    <StoryShell isDark={isDark}>
      <Combo title="Visitors & Conversion" data={comboRows} barLabel="Visitors" lineLabel="Conversion (%)" isDark={isDark} />
    </StoryShell>
  );
}

const meta: Meta<typeof ComboDemo> = {
  title: 'RSC Mobile/Combo',
  component: ComboDemo,
  args: { isDark: false },
  argTypes: mobileArgTypes,
};
export default meta;

type Story = StoryObj<typeof ComboDemo>;
export const Default: Story = {};
export const Dark: Story = { args: { isDark: true } };
