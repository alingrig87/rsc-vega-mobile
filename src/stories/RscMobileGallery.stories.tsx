import type { Meta, StoryObj } from '@storybook/react';
import { Donut, Funnel, Scatter, Bar, Line, Combo, Bullet, BigNumber, Venn, PaletteProvider, PaletteSwitcher } from '../rsc-mobile';
import { spend, regionSales, browserTrend, scatterData, comboData, bulletData, vennData, bigNumberTrend, funnelData } from '../data';
import { ADOBE_CLEAN_FONT } from '../spectrumVegaTheme';

const donutData = spend.map((d) => ({ label: d.category, value: d.value }));
const dodgedData = regionSales.map((d) => ({ category: d.quarter, series: d.region, value: d.value }));
const stackedData = browserTrend.map((d) => ({ category: d.month.slice(5), series: d.browser, value: d.share }));
const lineData = browserTrend.filter((d) => d.browser === 'Chrome' || d.browser === 'Safari').map((d) => ({ x: d.month.slice(5), y: d.share, series: d.browser }));
const scatterPoints = scatterData.map((d) => ({ x: d.speed, y: d.handling, series: d.weightClass }));
const comboRows = comboData.map((d) => ({ x: d.month.slice(5), bar: d.visitors, line: d.conversion }));
const bulletRows = bulletData.map((d) => ({ category: d.category, current: d.current, target: d.target }));
const [vennA, vennB, vennX] = vennData as { sets: string[]; size: number }[];
const trend = bigNumberTrend.map((d) => ({ x: String(d.idx), y: d.visitors }));

function GalleryDemo({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ padding: 16, background: isDark ? '#0d0f14' : '#f4f5f9', minHeight: '100vh', fontFamily: ADOBE_CLEAN_FONT }}>
      <PaletteProvider>
        <div style={{ marginBottom: 16 }}>
          <PaletteSwitcher isDark={isDark} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
          <Donut title="Orders Count By Country" data={donutData} isDark={isDark} />
          <Funnel title="Campaign Funnel" data={funnelData.map((d) => ({ label: d.stage, value: d.value }))} isDark={isDark} />
          <Bar title="Spend by Team" data={donutData.map((d) => ({ category: d.label, value: d.value }))} yLabel="Spend ($k)" isDark={isDark} />
          <Bar title="Sales by Region" type="dodged" data={dodgedData} yLabel="Sales ($k)" isDark={isDark} />
          <Bar title="Browser Share" type="stacked" data={stackedData} yLabel="Share (%)" isDark={isDark} />
          <Line title="Browser Share Trend" data={lineData} yLabel="Share (%)" isDark={isDark} />
          <Line title="Browser Share" data={lineData} yLabel="Share (%)" isDark={isDark} filled />
          <Scatter title="Speed vs. Handling" data={scatterPoints} xLabel="Speed" yLabel="Handling" isDark={isDark} />
          <Combo title="Visitors & Conversion" data={comboRows} barLabel="Visitors" lineLabel="Conversion (%)" isDark={isDark} />
          <Bullet title="Usage vs. Target" data={bulletRows} isDark={isDark} />
          <BigNumber label="Visitors" value="1,480" trend={trend} isDark={isDark} />
          <Venn title={`${vennA.sets[0]} vs. ${vennB.sets[0]}`} setA={{ label: vennA.sets[0], size: vennA.size }} setB={{ label: vennB.sets[0], size: vennB.size }} intersection={vennX.size} isDark={isDark} />
        </div>
      </PaletteProvider>
    </div>
  );
}

const meta: Meta<typeof GalleryDemo> = {
  title: 'RSC Mobile/Gallery',
  component: GalleryDemo,
  args: { isDark: false },
  argTypes: { isDark: { control: 'boolean' } },
};
export default meta;

type Story = StoryObj<typeof GalleryDemo>;
export const Default: Story = {};
export const Dark: Story = { args: { isDark: true } };
