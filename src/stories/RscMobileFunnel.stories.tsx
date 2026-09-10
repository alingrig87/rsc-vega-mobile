import type { Meta, StoryObj } from '@storybook/react';
import { Funnel } from '../rsc-mobile/Funnel';
import { PaletteProvider, PaletteSwitcher } from '../rsc-mobile/shared/palettes';

const data = [
  { label: 'Leads', value: 1045 },
  { label: 'Prospects', value: 705 },
  { label: 'Opportunities', value: 581 },
  { label: 'Win', value: 322 },
];

function FunnelDemo({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ padding: 16, maxWidth: 360, background: isDark ? '#12151c' : undefined, minHeight: '100vh' }}>
      <PaletteProvider>
        <div style={{ marginBottom: 12 }}>
          <PaletteSwitcher isDark={isDark} />
        </div>
        <Funnel title="Campaign Funnel" data={data} isDark={isDark} />
      </PaletteProvider>
    </div>
  );
}

const meta: Meta<typeof FunnelDemo> = {
  title: 'RSC Mobile/Funnel',
  component: FunnelDemo,
  args: { isDark: false },
  argTypes: { isDark: { control: 'boolean' } },
};
export default meta;

type Story = StoryObj<typeof FunnelDemo>;
export const Default: Story = {};
export const Dark: Story = { args: { isDark: true } };
