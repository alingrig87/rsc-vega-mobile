import type { Preview } from '@storybook/react';

// Custom viewport set (rather than importing addon-viewport's own presets,
// which aren't guaranteed to be independently resolvable from
// addon-essentials' bundled copy) — the phones/tablet this project's
// components were actually tuned and screenshotted against.
const mobileViewports = {
  iphoneSE: {
    name: 'iPhone SE (375×667)',
    styles: { width: '375px', height: '667px' },
    type: 'mobile' as const,
  },
  iphone14: {
    name: 'iPhone 14 (390×844)',
    styles: { width: '390px', height: '844px' },
    type: 'mobile' as const,
  },
  pixel7: {
    name: 'Pixel 7 (412×915)',
    styles: { width: '412px', height: '915px' },
    type: 'mobile' as const,
  },
  ipadMini: {
    name: 'iPad Mini (768×1024)',
    styles: { width: '768px', height: '1024px' },
    type: 'tablet' as const,
  },
};

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    viewport: {
      viewports: mobileViewports,
      defaultViewport: 'iphone14',
    },
  },
  // Same belt-and-suspenders as App.tsx's own root — a page-level
  // safety net against horizontal scroll, paired with
  // ResponsiveVegaLiteChart's per-chart `overflowMargin` (see its doc
  // comment). Applies to every story so individual ones don't each need
  // their own wrapper for this.
  decorators: [
    (Story) => (
      <div style={{ overflowX: 'hidden', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
