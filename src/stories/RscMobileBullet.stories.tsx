import type { Meta, StoryObj } from '@storybook/react';
import { Bullet } from '../rsc-mobile';
import { StoryShell, mobileArgTypes } from './RscMobileStoryShell';
import { bulletData } from '../data';

const bulletRows = bulletData.map((d) => ({ category: d.category, current: d.current, target: d.target }));

function BulletDemo({ isDark }: { isDark: boolean }) {
  return (
    <StoryShell isDark={isDark}>
      <Bullet title="Usage vs. Target" data={bulletRows} isDark={isDark} />
    </StoryShell>
  );
}

const meta: Meta<typeof BulletDemo> = {
  title: 'RSC Mobile/Bullet',
  component: BulletDemo,
  args: { isDark: false },
  argTypes: mobileArgTypes,
};
export default meta;

type Story = StoryObj<typeof BulletDemo>;
export const Default: Story = {};
export const Dark: Story = { args: { isDark: true } };
