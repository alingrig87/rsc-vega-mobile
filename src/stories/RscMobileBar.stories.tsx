import type { Meta, StoryObj } from '@storybook/react';
import { Bar } from '../rsc-mobile';
import { StoryShell, mobileArgTypes } from './RscMobileStoryShell';
import { spend, regionSales, browserTrend } from '../data';

const simpleData = spend.map((d) => ({ category: d.category, value: d.value }));
const dodgedData = regionSales.map((d) => ({ category: d.quarter, series: d.region, value: d.value }));
const stackedData = browserTrend.map((d) => ({ category: d.month.slice(5), series: d.browser, value: d.share }));

function BarDemo({ isDark, type }: { isDark: boolean; type: 'simple' | 'dodged' | 'stacked' }) {
  const data = type === 'simple' ? simpleData : type === 'dodged' ? dodgedData : stackedData;
  const title = type === 'simple' ? 'Spend by Team' : type === 'dodged' ? 'Sales by Region' : 'Browser Share';
  const yLabel = type === 'dodged' ? 'Sales ($k)' : type === 'stacked' ? 'Share (%)' : 'Spend ($k)';
  return (
    <StoryShell isDark={isDark}>
      <Bar title={title} type={type} data={data} yLabel={yLabel} isDark={isDark} />
    </StoryShell>
  );
}

const meta: Meta<typeof BarDemo> = {
  title: 'RSC Mobile/Bar',
  component: BarDemo,
  args: { isDark: false },
  argTypes: mobileArgTypes,
};
export default meta;

type Story = StoryObj<typeof BarDemo>;
export const Simple: Story = { args: { type: 'simple' } };
export const Dodged: Story = { args: { type: 'dodged' } };
export const Stacked: Story = { args: { type: 'stacked' } };
export const Dark: Story = { args: { type: 'simple', isDark: true } };
