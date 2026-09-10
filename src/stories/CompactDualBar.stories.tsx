import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { buildCompactDualBarSpec } from '../mobileCharts';
import { Card } from '../Card';
import { browserTrend } from '../data';

const dualBarData = browserTrend
  .filter((d) => d.browser === 'Chrome' || d.browser === 'Safari')
  .map((d) => ({ month: d.month.slice(5), browser: d.browser, share: d.share }));

function CompactDualBarDemo() {
  return (
    <div style={{ padding: 16, maxWidth: 360 }}>
      <Card title="Chrome vs Safari" subtitle="Weekly share">
        <ResponsiveVegaLiteChart spec={buildCompactDualBarSpec(dualBarData, 'month', 'share', 'browser')} aspectRatio={0.45} />
      </Card>
    </div>
  );
}

const meta: Meta<typeof CompactDualBarDemo> = {
  title: 'Mobile/CompactDualBar',
  component: CompactDualBarDemo,
};
export default meta;

type Story = StoryObj<typeof CompactDualBarDemo>;
export const Default: Story = {};
