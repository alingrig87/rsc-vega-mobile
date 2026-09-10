# RSC ⇄ Vega-Lite — Mobile

Mobile-dashboard-shaped charts (radial progress gauge, donut with a center
total, KPI sparkline/mini-bar cards, a line chart with a floating value
callout) built with **vega ^6.2.0**, **vega-lite ^6.4.2**, and
**vega-embed ^7.1.0**, styled with the same design tokens (colors, font,
corner radius) as [`rsc_d3`](../rsc_d3) — the desktop RSC-parity sibling
project — but tuned for a phone instead of a fixed desktop panel: fluid
width, bigger touch targets, and a tap-to-reveal detail panel instead of a
hover tooltip.

## What's here

- **`ResponsiveVegaLiteChart`** — the core wrapper. Measures its own
  container via `ResizeObserver` and re-embeds on every width change
  (`autosize: {type: 'pad'}`, not `'fit'` — see the long comment on this
  component for a real, confirmed Vega-Lite bug that ruled `'fit'` out for
  layered specs with an explicit scale `domain`), plus a tap-driven detail
  panel in place of a cursor-tracking tooltip.
- **`mobileCharts.ts`** — chart builders with no RSC equivalent: a radial
  gauge, a donut with a center total + segment labels, a sparkline, a
  compact dual-bar, a mini horizontal bar list, and a line chart with a
  value "bubble" pinned to one point.
- **`mobileTheme.ts`** — extends the shared Spectrum theme with touch-target
  sizing (bigger legend swatches/row spacing, bigger point marks).
- **`charts.ts` / `spectrumVegaTheme.ts` / `data.ts`** — ported from
  `rsc_d3` unchanged; the desktop project's chart *types* (bar, stacked
  bar, line, area, donut) drop straight into `ResponsiveVegaLiteChart`
  without modification (`Mobile/Classic RSC Chart Types` story).
- **`App.tsx`** — a small assembled dashboard demo (gauges, donut, line
  callout, mini-bar, bar list) in a card layout.

## Running it

```bash
npm install
npm run storybook   # port 6007 — defaults to an iPhone 14 viewport
npm run dev          # plain Vite dev server, the App.tsx dashboard
```

Storybook's viewport addon is pre-configured with iPhone SE / iPhone 14 /
Pixel 7 / iPad Mini presets (`.storybook/preview.tsx`) — switch device via
the toolbar to check a story at another width.

## Real bugs found building this (not just design choices)

Two are worth knowing if you extend `mobileCharts.ts`:

1. **Donut segment labels crowd toward one edge instead of each sitting in
   its own wedge.** Pairing a `text` mark with an `arc` mark via a shared
   `theta: {field: 'value', type: 'quantitative'}` positions the text at
   each row's *cumulative* stacked angle (the boundary with the next
   segment), not the segment's own midpoint. Fix: compute
   `startAngle`/`endAngle`/`midAngle` explicitly per row in JS and encode
   with `scale: null` so Vega-Lite uses the values as-is — see
   `buildDonutSummarySpec`.
2. **A layered chart's `height` signal can resolve to `0`** when a shared
   quantitative scale has an explicit `domain` array under
   `autosize: {type: 'fit'}` — every mark in every layer collapses to the
   same y position. Confirmed by bisecting a minimal repro and by
   instrumenting a live `View`'s `height` signal directly. `autosize:
   {type: 'pad'}` doesn't hit it — see `ResponsiveVegaLiteChart`'s autosize
   comment for the full isolation.

## Relationship to `rsc_d3`

That project answers "does this look pixel-identical to
`@adobe/react-spectrum-charts`, given a prompt" for a fixed desktop canvas,
and ships two Claude Code skills (`rsc-vega-chart`, `rsc-vega-interactions`)
that teach that workflow. This project is not a skill — it's a working
demonstration that the same design tokens hold up on a phone, with the
sizing/interaction rules a mobile layout actually needs.
