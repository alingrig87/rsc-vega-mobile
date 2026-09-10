import type { Meta, StoryObj } from '@storybook/react';
import { Venn } from '../rsc-mobile';
import { StoryShell, mobileArgTypes } from './RscMobileStoryShell';
import { vennData } from '../data';

const [vennA, vennB, vennX] = vennData as { sets: string[]; size: number }[];

function VennDemo({ isDark }: { isDark: boolean }) {
  return (
    <StoryShell isDark={isDark}>
      <Venn
        title={`${vennA.sets[0]} vs. ${vennB.sets[0]}`}
        setA={{ label: vennA.sets[0], size: vennA.size }}
        setB={{ label: vennB.sets[0], size: vennB.size }}
        intersection={vennX.size}
        isDark={isDark}
      />
    </StoryShell>
  );
}

const meta: Meta<typeof VennDemo> = {
  title: 'RSC Mobile/Venn',
  component: VennDemo,
  args: { isDark: false },
  argTypes: mobileArgTypes,
};
export default meta;

type Story = StoryObj<typeof VennDemo>;
export const Default: Story = {};
export const Dark: Story = { args: { isDark: true } };
