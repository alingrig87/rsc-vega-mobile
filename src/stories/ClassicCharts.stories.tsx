import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { Card } from '../Card';
import { barSpec, stackedBarSpec, lineSpec, areaSpec, getDonutSpec } from '../charts';

// The desktop-parity project's chart *types* (bar/stacked-bar/line/area/donut)
// dropped straight into the fluid, touch-tuned wrapper — proof the base
// Spectrum-fidelity work (colors, fonts, tick-density, band padding) and the
// mobile-specific layer (resize, bigger touch targets, tap-detail panel)
// compose cleanly instead of being two unrelated chart libraries.
function ClassicChartsDemo() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420 }}>
      <Card title="Spend by Team">
        <ResponsiveVegaLiteChart spec={barSpec} aspectRatio={0.62} />
      </Card>
      <Card title="Browser Share" subtitle="Stacked">
        <ResponsiveVegaLiteChart spec={stackedBarSpec} aspectRatio={0.62} />
      </Card>
      <Card title="Browser Share" subtitle="Trend">
        <ResponsiveVegaLiteChart spec={lineSpec} aspectRatio={0.62} />
      </Card>
      <Card title="Browser Share" subtitle="Area">
        <ResponsiveVegaLiteChart spec={areaSpec} aspectRatio={0.62} />
      </Card>
      <Card title="Spend by Team" subtitle="Donut">
        <ResponsiveVegaLiteChart spec={getDonutSpec} aspectRatio={0.85} />
      </Card>
    </div>
  );
}

const meta: Meta<typeof ClassicChartsDemo> = {
  title: 'Mobile/Classic RSC Chart Types',
  component: ClassicChartsDemo,
};
export default meta;

type Story = StoryObj<typeof ClassicChartsDemo>;
export const Default: Story = {};
