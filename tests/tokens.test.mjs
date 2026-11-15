import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { buildTokens, renderCss, renderTailwindV3, renderTailwindV4 } from '../scripts/tokens.mjs';

test('every checked pair passes in all four modes', () => {
  const t = buildTokens({ accent: '#7c3aed' });
  assert.deepEqual(Object.keys(t.modes).sort(), ['dark', 'dark-ic', 'light', 'light-ic']);
  const failing = t.checks.filter((c) => !c.pass);
  assert.deepEqual(failing, []);
  assert.ok(t.checks.filter((c) => c.mode.endsWith('-ic') && c.required === 7).length > 0);
});

// A text colour that fails 4.5:1 must say what it is for, or a design system hands people a trap.
test('the unchecked text colour is named for disabled controls and says why in the CSS', () => {
  const t = buildTokens({ accent: '#b45309' });
  for (const mode of Object.values(t.modes)) {
    assert.ok(!('label-tertiary' in mode), 'label-tertiary reads like ordinary text');
    assert.ok('label-disabled' in mode);
  }
  assert.ok(!t.checks.some((c) => c.fg === 'label-disabled'), 'disabled text is exempt, not checked');
  const css = renderCss(t);
  const line = css.split('\n').find((l) => l.includes('--color-label-disabled:'));
  assert.match(line, /disabled controls only/);
  assert.match(renderTailwindV4(t), /--color-label-disabled: [^\n]*disabled controls only/);
});

test('Apple secondary label is darkened to pass 4.5:1 on the web', () => {
  const t = buildTokens({ accent: '#007aff' });
  const c = t.checks.find((x) => x.mode === 'light' && x.fg === 'label-secondary' && x.bg === 'surface');
  assert.ok(c.ratio >= 4.5);
});

test('CSS covers dark, increased contrast, reduced motion and reduced transparency', () => {
  const css = renderCss(buildTokens({ accent: '#7c3aed' }));
  for (const needle of ['prefers-color-scheme: dark', '[data-theme="dark"]', 'prefers-contrast: more', 'prefers-reduced-motion: reduce', 'prefers-reduced-transparency: reduce', '--text-body: 1rem']) assert.ok(css.includes(needle), needle);
});

// The starting values in references/craft.md: the generated system and the cards must agree.
test('six text styles by role, nothing below 12 px', () => {
  const t = buildTokens({ accent: '#7c3aed' });
  assert.deepEqual(t.type, {
    caption: [12, 1.35, 400], small: [14, 1.45, 400], body: [16, 1.5, 400],
    heading: [22, 1.25, 600], title: [28, 1.2, 600], display: [36, 1.15, 600],
  });
  assert.ok(Object.values(t.type).every(([size]) => size >= 12));
  const css = renderCss(t);
  for (const needle of ['--text-caption: 0.75rem;', '--leading-caption: 1.35;', '--text-small: 0.875rem;', '--leading-body: 1.5;', '--text-heading: 1.375rem;', '--weight-heading: 600;', '--text-title: 1.75rem;', '--text-display: 2.25rem;', '--leading-display: 1.15;']) assert.ok(css.includes(needle), needle);
  const sizes = [...css.matchAll(/--text-[a-z]+: ([\d.]+)rem;/g)].map((m) => Number(m[1]));
  assert.equal(sizes.length, 6);
  assert.ok(sizes.every((s) => s >= 0.75), `a size under 0.75rem: ${sizes}`);
});

test('spacing, radius and motion follow the starting values', () => {
  const t = buildTokens({ accent: '#7c3aed' });
  assert.deepEqual(t.space, [4, 8, 12, 16, 24, 32, 48, 64]);
  assert.deepEqual(t.radius, { sm: 4, md: 6, lg: 10, full: 9999 });
  assert.equal(t.motion.fast, 120);
  assert.equal(t.motion.base, 200);
  assert.equal(t.motion.slow, 280);
  assert.equal(t.motion.ease, 'cubic-bezier(0.2, 0, 0, 1)');
  const css = renderCss(t);
  for (const needle of ['--space-1: 0.25rem;', '--space-6: 1.5rem;', '--space-16: 4rem;', '--radius-md: 6px;', '--radius-lg: 10px;', '--duration-fast: 120ms;', '--duration-base: 200ms;', '--duration-slow: 280ms;']) assert.ok(css.includes(needle), needle);
  assert.doesNotMatch(css, /--space-[0-9]+: (1\.25|2\.5)rem;/, 'no 20 or 40 px step');
});

test('reduced motion is gentler, not zero: fades stay short, movement goes', () => {
  const css = renderCss(buildTokens({ accent: '#7c3aed' }));
  assert.match(css, /--motion-distance: [1-9]\d*px;/, 'things move by default');
  const reduced = css.match(/@media \(prefers-reduced-motion: reduce\) \{([^}]*)\}/)?.[1] ?? '';
  assert.match(reduced, /--motion-distance: 0(px)?;/);
  const durations = [...reduced.matchAll(/--duration-[a-z]+: (\d+)ms;/g)].map((m) => Number(m[1]));
  assert.equal(durations.length, 3, reduced);
  assert.ok(durations.every((d) => d > 0 && d <= 120), `durations under reduced motion: ${durations}`);
});

test('dark is a dim base with raised surfaces and off-white text, never pure black or white', () => {
  const t = buildTokens({ accent: '#7c3aed' });
  for (const mode of ['dark', 'dark-ic']) {
    const m = t.modes[mode];
    assert.equal(m.background, '#121212');
    assert.equal(m.surface, '#1c1c1e');
    assert.equal(m.elevated, '#2c2c2e');
    assert.equal(m.label, '#f5f5f7');
    for (const role of ['background', 'surface', 'elevated', 'label', 'label-secondary']) assert.ok(!['#000000', '#ffffff'].includes(m[role]), `${mode} ${role} is ${m[role]}`);
  }
  assert.deepEqual(t.checks.filter((c) => !c.pass), []);
});

test('the generated files name this skill', () => {
  const t = buildTokens({ accent: '#7c3aed' });
  for (const out of [renderCss(t), renderTailwindV3(t), renderTailwindV4(t)]) {
    assert.match(out, /fresh-eyes/);
    assert.doesNotMatch(out, /designing-\w+-interfaces/, 'the name of version 1 of the skill');
  }
});

test('the OS-dark guard also excludes a forced .light class', () => {
  const css = renderCss(buildTokens({ accent: '#7c3aed' }));
  assert.match(css, /@media \(prefers-color-scheme: dark\) \{ :root:not\(\[data-theme="light"\]\):not\(\.light\)/);
});

test('class-based theme wins over the OS color scheme in a real browser', { timeout: 60_000 }, async () => {
  const css = renderCss(buildTokens({ accent: '#7c3aed' }));
  const browser = await chromium.launch();
  try {
    const backgroundFor = async (htmlClass, colorScheme) => {
      const context = await browser.newContext({ colorScheme });
      const page = await context.newPage();
      await page.setContent(`<!doctype html><html class="${htmlClass}"><head><style>${css}</style></head><body></body></html>`);
      const value = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim());
      await context.close();
      return value;
    };
    assert.equal(await backgroundFor('light', 'dark'), '#ffffff');
    assert.equal(await backgroundFor('dark', 'light'), '#121212');
  } finally {
    await browser.close();
  }
});

test('control-border passes 3:1 against every background and is emitted in CSS', () => {
  const t = buildTokens({ accent: '#7c3aed' });
  const borderChecks = t.checks.filter((c) => c.fg === 'control-border');
  assert.ok(borderChecks.length > 0);
  assert.ok(borderChecks.every((c) => c.pass));
  assert.ok(renderCss(t).includes('--color-control-border:'));
});

test('Tailwind outputs reference the CSS variables', () => {
  const t = buildTokens({ accent: '#7c3aed' });
  assert.match(renderTailwindV3(t), /accent: 'var\(--color-accent\)'/);
  assert.match(renderTailwindV4(t), /--color-accent: #[0-9a-f]{6};/);
});
