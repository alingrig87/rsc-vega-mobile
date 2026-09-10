import type { Meta, StoryObj } from '@storybook/react';
import { Donut } from '../rsc-mobile/Donut';
import { PaletteProvider, PaletteSwitcher } from '../rsc-mobile/shared/palettes';

const data = [
  { label: 'USA', value: 27.86 },
  { label: 'Germany', value: 28.86 },
  { label: 'Brazil', value: 12.65 },
  { label: 'UK', value: 16.66 },
  { label: 'Austria', value: 13.97 },
];

function DonutDemo({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ padding: 16, maxWidth: 400, background: isDark ? '#12151c' : undefined, minHeight: '100vh' }}>
      <PaletteProvider>
        <div style={{ marginBottom: 12 }}>
          <PaletteSwitcher isDark={isDark} />
        </div>
        <Donut title="Orders Count By Country" data={data} isDark={isDark} />
      </PaletteProvider>
    </div>
  );
}

const meta: Meta<typeof DonutDemo> = {
  title: 'RSC Mobile/Donut',
  component: DonutDemo,
  args: { isDark: false },
  argTypes: { isDark: { control: 'boolean' } },
};
export default meta;

type Story = StoryObj<typeof DonutDemo>;
export const Default: Story = {};
export const Dark: Story = { args: { isDark: true } };
