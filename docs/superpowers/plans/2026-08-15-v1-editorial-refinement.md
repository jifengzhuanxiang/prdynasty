# V1 Editorial Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the v1 recruitment landing page as a readable, responsive editorial refinement that preserves the existing PR brand, content structure, real photographs, anchors, and QR flow.

**Architecture:** Keep the existing static Next.js/Vinext page and centralized `recruitmentTheme` data module. Implement the redesign through semantic markup changes in `app/page.tsx`, a scoped replacement of the page design rules in `app/globals.css`, minimal content and metadata updates, one generated decorative texture, and source-level plus rendered-output contract tests. Retain the native scroll-reveal controller and existing build pipeline; add no runtime dependency.

**Tech Stack:** Next.js 16, React 19, TypeScript, native CSS, Tailwind v4 build pipeline, Vinext/Vite, Node test runner, in-app browser, headless Google Chrome for dark-media verification.

## Global Constraints

- Use `DESIGN_VARIANCE: 6`, `MOTION_INTENSITY: 4`, and `VISUAL_DENSITY: 4`.
- Preserve the existing `groups`, `benefits`, `stories`, `faq`, and `join` anchors and the primary navigation labels.
- Preserve every real member photograph and the QR code byte-for-byte; do not AI-edit people or QR pixels.
- Add no third-party runtime dependency and do not modify v2, v3, current version, database, worker, build scripts, or launchers.
- Use rose as the only accent color; cards and content images use 16px radii, buttons use pill radii, and the QR image is not clipped.
- Define three stable font roles: Chinese display serif, Chinese UI sans, and short Latin-label sans.
- No visible text may compute below 12px; body is 16-17px; navigation and CTAs are at least 15px.
- Desktop hero headline is at most two lines; the CTA is visible at 1440×900; the 390×844 initial viewport shows status, headline, summary, actions, and part of the main photograph.
- All join-intent links use the exact visible label `加入招新群`; CTA text never wraps.
- Visible copy, metadata, alt text, and captions contain zero em-dash or en-dash characters.
- Keep no numbered English eyebrows, version labels, scroll cues, decorative status dots, photo-overlay labels, or duplicate CTA intents.
- Provide automatic light/dark tokens with `prefers-color-scheme`, reduced-motion fallbacks, readable focus states, and explicit mobile collapse below 768px.
- Do not stage or commit the existing deleted archive ZIP files.

## File Responsibility Map

- `四个本地网页版本/v1/tests/design-contract.test.mjs`: source-level design and copy contract.
- `四个本地网页版本/v1/tests/rendered-html.test.mjs`: rendered content, anchors, reveal units, and CTA contract.
- `四个本地网页版本/v1/public/assets/editorial-paper-texture.png`: generated low-contrast decorative background with no people, text, or logos.
- `四个本地网页版本/v1/app/recruitment-theme.ts`: recruitment facts and reusable copy only; no presentation numbering.
- `四个本地网页版本/v1/app/layout.tsx`: SEO metadata and document shell.
- `四个本地网页版本/v1/app/page.tsx`: semantic page composition and reveal-unit mapping.
- `四个本地网页版本/v1/app/globals.css`: color, fonts, shapes, responsive layouts, dark mode, states, and motion.
- `docs/qa/2026-08-15-v1-editorial-refinement-design-qa.md`: completed pre-flight and browser evidence.

---

### Task 1: Lock the redesign contract with failing tests

**Files:**
- Create: `四个本地网页版本/v1/tests/design-contract.test.mjs`
- Modify: `四个本地网页版本/v1/tests/rendered-html.test.mjs:25-73`

**Interfaces:**
- Consumes: current v1 source and `dist/server/index.js` rendered by the existing test helper.
- Produces: a source contract that later tasks must satisfy and rendered assertions for the final page.

- [ ] **Step 1: Create the source-level failing test**

Add `tests/design-contract.test.mjs` with this exact structure:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("uses the approved typography and theme contract", async () => {
  const css = await read("app/globals.css");
  assert.match(css, /--font-display:/);
  assert.match(css, /--font-ui:/);
  assert.match(css, /--font-latin:/);
  assert.match(css, /@media \(prefers-color-scheme: dark\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);

  const literalSizes = [...css.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)]
    .map((match) => Number(match[1]));
  assert.ok(literalSizes.length > 0);
  assert.equal(literalSizes.filter((size) => size < 12).length, 0);
});

test("contains no banned visible-copy separators or numbered eyebrows", async () => {
  const files = await Promise.all([
    read("app/page.tsx"),
    read("app/recruitment-theme.ts"),
    read("app/layout.tsx"),
  ]);
  const source = files.join("\n");
  assert.doesNotMatch(source, /[—–]/);
  assert.doesNotMatch(source, /(?:·|\/|NO\.)\s*0[1-9]/i);
  assert.doesNotMatch(source, /section-kicker|className="eyebrow"/);
});

test("uses one join label and preserves required anchors", async () => {
  const page = await read("app/page.tsx");
  const theme = await read("app/recruitment-theme.ts");
  for (const id of ["groups", "benefits", "stories", "faq", "join"]) {
    assert.match(page, new RegExp(`id=["']${id}["']`));
  }
  assert.doesNotMatch(`${page}\n${theme}`, /立即加入|加入我们/);
  assert.match(`${page}\n${theme}`, /加入招新群/);
  assert.equal((page.match(/theme\.hero\.primaryAction\.label/g) ?? []).length, 3);
});
```

- [ ] **Step 2: Tighten the rendered HTML assertions**

In `tests/rendered-html.test.mjs`, retain the existing anchor, group, QR, reveal-unit, and placeholder assertions. Replace the old headline and reveal-name expectations with:

```js
assert.match(html, /把你的灵感，做成/);
assert.match(html, /校园里真正发生的作品/);
assert.match(html, /加入招新群/);
assert.doesNotMatch(html, /立即加入|加入我们|[—–]/);
assert.doesNotMatch(html, /(?:·|\/)\s*0[1-9]/);

const revealUnits = [
  "directions",
  "groups-heading",
  "groups-grid",
  "benefits-heading",
  "benefits-grid",
  "stories-heading",
  "stories-grid",
  "faq-heading",
  "faq-list",
  "join-copy",
  "join-qr",
  "footer",
];
```

Keep the expected reveal count at `12` and the grouped delay count at `5`.

- [ ] **Step 3: Run the tests and verify the intended failures**

Run:

```bash
node --test tests/design-contract.test.mjs
```

Expected: FAIL because the CSS still contains 8-11px sizes, no dark-mode media block, old font token names, numbered eyebrows, and old CTA labels.

Do not run the rendered HTML test before rebuilding `dist`; its existing built artifact is not the source under test.

- [ ] **Step 4: Commit only the contract tests**

```bash
git add -- '四个本地网页版本/v1/tests/design-contract.test.mjs' '四个本地网页版本/v1/tests/rendered-html.test.mjs'
git diff --cached --check
git commit -m "test: lock v1 editorial design contract"
```

Expected staged files: exactly the two test files. The archive deletions remain unstaged.

---

### Task 2: Generate the decorative paper texture

**Files:**
- Create: `四个本地网页版本/v1/public/assets/editorial-paper-texture.png`

**Interfaces:**
- Consumes: the approved cream, dusty rose, and wine palette; the `imagegen` skill.
- Produces: `/assets/editorial-paper-texture.png`, used by the hero background in Task 4.

- [ ] **Step 1: Read and invoke the image-generation skill**

Use the `imagegen` skill with this exact prompt:

```text
Create a square 2048 by 2048 seamless editorial paper texture for a Chinese university public-relations recruitment webpage. Warm cream paper base with extremely subtle dusty-rose fibers, faint offset-print grain, and sparse soft paper-cut shadows. Low contrast and calm. No people, faces, hands, objects, flowers, letters, words, numbers, logos, symbols, gradients, frames, stickers, or watermarks. The texture must remain quiet behind dark wine-colored Chinese text and should look natural at 8 to 12 percent opacity.
```

Generate a new image without referencing or editing any supplied photograph.

- [ ] **Step 2: Save the chosen output at the exact public path**

Copy the generated PNG to:

```text
四个本地网页版本/v1/public/assets/editorial-paper-texture.png
```

Do not recompress or alter any existing asset.

- [ ] **Step 3: Verify the asset**

Run:

```bash
file public/assets/editorial-paper-texture.png
sips -g pixelWidth -g pixelHeight public/assets/editorial-paper-texture.png
```

Expected: a readable PNG, `pixelWidth: 2048`, `pixelHeight: 2048`.

Visually inspect it and reject any output containing readable text, people, logos, or high-contrast motifs.

- [ ] **Step 4: Commit the texture**

```bash
git add -- '四个本地网页版本/v1/public/assets/editorial-paper-texture.png'
git diff --cached --check
git commit -m "feat: add v1 editorial paper texture"
```

---

### Task 3: Simplify the content model and metadata

**Files:**
- Modify: `四个本地网页版本/v1/app/recruitment-theme.ts:1-222`
- Modify: `四个本地网页版本/v1/app/layout.tsx:1-41`
- Test: `四个本地网页版本/v1/tests/design-contract.test.mjs`

**Interfaces:**
- Consumes: the existing image paths, group facts, benefit descriptions, story facts, FAQ, and QR data.
- Produces: `RecruitmentTheme` without presentation numbering, with the exact CTA labels used by `app/page.tsx`.

- [ ] **Step 1: Remove presentation-only fields from the type**

Change the relevant shape to:

```ts
type RecruitmentDetails = {
  title: string;
  groupName: string;
  instruction: string;
  qr: ImageAsset;
  validity: string;
  fallback: string;
};

export type RecruitmentTheme = {
  meta: { status: string };
  hero: {
    titleLead: string;
    titleAccent: string;
    description: string;
    primaryAction: { label: "加入招新群"; href: "#join" };
    secondaryAction: { label: "了解三个分组"; href: "#groups" };
    images: ImageAsset[];
  };
  groups: Array<{
    title: string;
    lead: string;
    lines: string[];
    fit: string;
    image: ImageAsset;
  }>;
  benefits: Array<{ title: string; description: string }>;
  stories: Array<{
    title: string;
    description: string;
    image: ImageAsset;
  }>;
  faq: Array<{ question: string; answer: string }>;
  recruitment: RecruitmentDetails;
};
```

Remove `eyebrow`, `season`, every `number`, and every story `tag` from both the type and object data. Keep all six `RecruitmentDetails` fields and their existing values.

- [ ] **Step 2: Apply the approved hero and CTA copy**

Use these exact values:

```ts
meta: { status: "新成员招募中" },
hero: {
  titleLead: "把你的灵感，做成",
  titleAccent: "校园里真正发生的作品。",
  description: "用文字、镜头与设计，把你的想法做成校园里真实发生的作品。",
  primaryAction: { label: "加入招新群", href: "#join" },
  secondaryAction: { label: "了解三个分组", href: "#groups" },
  // retain the two existing ImageAsset objects byte-for-byte
},
```

Retain the existing group, benefit, story, FAQ, and recruitment wording after removing only the deleted presentation fields.

- [ ] **Step 3: Rewrite metadata without banned dash characters**

Set all three descriptions in `app/layout.tsx` to:

```ts
"摄影、平面设计、公众号：把你的灵感做成校园里真实发生的作品。"
```

Keep the current title, Open Graph dimensions, image path, icons, and `lang="zh-CN"`.

- [ ] **Step 4: Run the focused contract test**

```bash
node --test tests/design-contract.test.mjs
```

Expected: the copy/number assertions move closer to passing; typography and page-markup assertions still fail until Tasks 4-6.

- [ ] **Step 5: Commit the content contract**

```bash
git add -- '四个本地网页版本/v1/app/recruitment-theme.ts' '四个本地网页版本/v1/app/layout.tsx'
git diff --cached --check
git commit -m "refactor: simplify v1 recruitment content"
```

---

### Task 4: Build the font, color, header, and hero foundation

**Files:**
- Modify: `四个本地网页版本/v1/app/page.tsx:1-79`
- Modify: `四个本地网页版本/v1/app/globals.css:1-364`
- Test: `四个本地网页版本/v1/tests/design-contract.test.mjs`

**Interfaces:**
- Consumes: `theme.meta`, `theme.hero`, the generated texture path, and existing anchor targets.
- Produces: `site-header`, `hero`, and `direction-rail` markup/classes used by the final responsive CSS.

- [ ] **Step 1: Establish semantic design tokens**

Replace the old root tokens with this foundation, then retain only selectors still used by the new markup:

```css
:root {
  color-scheme: light dark;
  --page: #fffaf4;
  --surface: #fff3ef;
  --surface-strong: #f8d8d4;
  --accent: #df526b;
  --accent-strong: #a92747;
  --text: #351f29;
  --text-muted: #6c5961;
  --inverse: #fff9f4;
  --line: rgba(53, 31, 41, 0.18);
  --shadow: rgba(92, 42, 61, 0.16);
  --font-display: "Songti SC", "STSong", "Noto Serif CJK SC", Georgia, serif;
  --font-ui: "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  --font-latin: "Avenir Next", "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
  --page-pad: max(24px, calc((100vw - 1280px) / 2));
}

@media (prefers-color-scheme: dark) {
  :root {
    --page: #21171c;
    --surface: #2d1d24;
    --surface-strong: #43252f;
    --accent: #ef6f85;
    --accent-strong: #ff91a4;
    --text: #fff4ef;
    --text-muted: #d8c3cb;
    --inverse: #21171c;
    --line: rgba(255, 244, 239, 0.2);
    --shadow: rgba(7, 3, 5, 0.38);
  }
}
```

Set `body` to `var(--page)`, `var(--text)`, and `var(--font-ui)`. Set `:focus-visible` to a 3px `var(--accent-strong)` outline. Use `scroll-padding-top: 80px`.

- [ ] **Step 2: Replace the header and hero markup**

Use one status, one two-line heading, one summary, and one action group. The header CTA and hero primary CTA both render `theme.hero.primaryAction.label`; the footer will provide the third exact occurrence in Task 6.

```tsx
<header className="site-header">
  <a className="brand" href="#top" aria-label="深大志联宣传部招新首页">
    <span className="brand-mark">PR</span>
    <span className="brand-copy">
      <strong>深大志联宣传部</strong>
      <small>PUBLIC RELATIONS</small>
    </span>
  </a>
  <nav className="desktop-nav" aria-label="主导航">
    <a href="#top">招新首页</a>
    <a href="#groups">三个分组</a>
    <a href="#benefits">加入收获</a>
    <a href="#stories">真实日常</a>
  </nav>
  <a className="header-cta" href={theme.hero.primaryAction.href}>
    {theme.hero.primaryAction.label}
  </a>
</header>

<section className="hero" id="top">
  <div className="hero-copy">
    <p className="hero-status">{theme.meta.status}</p>
    <h1 aria-label={`${theme.hero.titleLead}${theme.hero.titleAccent}`}>
      <span>{theme.hero.titleLead}</span>
      <strong>{theme.hero.titleAccent}</strong>
    </h1>
    <p className="hero-description">{theme.hero.description}</p>
    <div className="hero-actions">
      <a className="button button-primary" href={theme.hero.primaryAction.href}>
        {theme.hero.primaryAction.label}
      </a>
      <a className="text-action" href={theme.hero.secondaryAction.href}>
        {theme.hero.secondaryAction.label}
      </a>
    </div>
  </div>
  <div className="hero-visual" aria-label="宣传部成员与活动照片">
    <figure className="hero-photo hero-photo-main">
      <img src={theme.hero.images[0].src} alt={theme.hero.images[0].alt}
        width={theme.hero.images[0].width} height={theme.hero.images[0].height}
        fetchPriority="high" decoding="async" />
      <figcaption>一起把想法做成作品</figcaption>
    </figure>
    <figure className="hero-photo hero-photo-secondary">
      <img src={theme.hero.images[1].src} alt={theme.hero.images[1].alt}
        width={theme.hero.images[1].width} height={theme.hero.images[1].height}
        loading="lazy" decoding="async" />
    </figure>
  </div>
</section>

<ul className="direction-rail" aria-label="宣传部工作方向" data-reveal="directions">
  <li><strong>摄影</strong><span>PHOTO</span></li>
  <li><strong>平面设计</strong><span>DESIGN</span></li>
  <li><strong>公众号</strong><span>CONTENT</span></li>
</ul>
```

- [ ] **Step 3: Implement the header and hero layout**

Use a 70px sticky header, `min-height: calc(100dvh - 70px)` desktop hero, a two-column grid, 16px photo radii, a maximum 64px heading, and a single contained texture layer:

```css
.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: url("/assets/editorial-paper-texture.png") center / 720px repeat;
  opacity: 0.1;
  mix-blend-mode: multiply;
}

.hero h1 {
  font-family: var(--font-display);
  font-size: clamp(56px, 5vw, 64px);
  line-height: 1.08;
  letter-spacing: -0.055em;
}

.hero h1 span,
.hero h1 strong { display: block; }
.hero h1 strong { color: var(--accent); }
.hero-description { max-width: 32rem; font-size: 17px; line-height: 1.8; }
.button, .header-cta { white-space: nowrap; font-size: 15px; }
.button:active, .header-cta:active { transform: translateY(1px) scale(0.98); }
```

In the dark media block, set `.hero::before { mix-blend-mode: soft-light; opacity: 0.08; }`.

At `max-width: 767px`, use a 66px header, hide `.brand-copy small` and `.desktop-nav`, set the hero to a single column, size the heading with `clamp(34px, 9.6vw, 40px)`, keep the summary at 16px, place actions inline when they fit, and give `.hero-visual` a 190-220px height. The full hero must target `min-height: calc(100dvh - 66px)` without using `h-screen`.

- [ ] **Step 4: Run the source contract**

```bash
node --test tests/design-contract.test.mjs
```

Expected: typography and dark-mode assertions pass; page still fails until all old section-kicker markup is removed in Tasks 5-6.

- [ ] **Step 5: Commit the foundation**

```bash
git add -- '四个本地网页版本/v1/app/page.tsx' '四个本地网页版本/v1/app/globals.css'
git diff --cached --check
git commit -m "feat: refine v1 header and hero"
```

---

### Task 5: Recompose the groups and benefits sections

**Files:**
- Modify: `四个本地网页版本/v1/app/page.tsx:80-139`
- Modify: `四个本地网页版本/v1/app/globals.css`
- Test: `四个本地网页版本/v1/tests/design-contract.test.mjs`

**Interfaces:**
- Consumes: `theme.groups` without numbers and `theme.benefits` without numbers.
- Produces: `group-grid` with exactly three cells and `benefit-grid` with exactly four items.

- [ ] **Step 1: Replace the groups markup**

```tsx
<section className="groups section-pad" id="groups">
  <header className="section-heading-stack" data-reveal="groups-heading">
    <h2>找到你想认真做的事</h2>
    <p>从最感兴趣的方向开始，在真实任务里慢慢找到自己的节奏。</p>
  </header>
  <div className="group-grid" data-reveal="groups-grid" data-reveal-delay="140">
    {theme.groups.map((group, index) => (
      <article className={`group-card ${index === 0 ? "group-card-featured" : ""}`} key={group.title}>
        <div className="group-image">
          <img src={group.image.src} alt={group.image.alt} width={group.image.width}
            height={group.image.height} loading="lazy" decoding="async" />
        </div>
        <div className="group-content">
          <h3>{group.title}</h3>
          <p className="group-lead">{group.lead}</p>
          <ul>{group.lines.map((line) => <li key={line}>{line}</li>)}</ul>
          <p className="group-fit">{group.fit}</p>
        </div>
      </article>
    ))}
  </div>
</section>
```

Use these exact layout rules:

```css
.group-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.85fr);
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 20px;
}
.group-card-featured { grid-row: 1 / 3; }
.group-card { overflow: hidden; border-radius: 16px; background: var(--surface); }
.group-card-featured .group-image { aspect-ratio: 4 / 3; }
.group-card:not(.group-card-featured) { display: grid; grid-template-columns: minmax(150px, 0.8fr) 1.2fr; }
.group-card:not(.group-card-featured) .group-image { min-height: 100%; }
.group-content { padding: clamp(22px, 3vw, 34px); }
.group-content li, .group-fit { font-size: 15px; line-height: 1.7; }
@media (max-width: 1023px) {
  .group-card:not(.group-card-featured) { display: block; }
}
@media (max-width: 767px) {
  .group-grid { grid-template-columns: 1fr; grid-template-rows: none; }
  .group-card-featured { grid-row: auto; }
}
```

- [ ] **Step 2: Replace the benefits markup**

```tsx
<section className="benefits section-pad" id="benefits">
  <header className="section-heading-stack" data-reveal="benefits-heading">
    <h2>把兴趣带走，也把经历留下</h2>
    <p>作品、方法、协作和伙伴，都来自一次次真实参与。</p>
  </header>
  <div className="benefit-grid" data-reveal="benefits-grid" data-reveal-delay="140">
    {theme.benefits.map((benefit) => (
      <article key={benefit.title}>
        <h3>{benefit.title}</h3>
        <p>{benefit.description}</p>
      </article>
    ))}
  </div>
</section>
```

Use a 2×2 desktop grid with one soft background tint on alternating cells, no row numbers, no dark full-width inversion, and no top-plus-bottom border on each item:

```css
.benefit-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.benefit-grid article { min-height: 190px; padding: 30px; border-radius: 16px; background: var(--surface); }
.benefit-grid article:nth-child(2), .benefit-grid article:nth-child(3) { background: var(--surface-strong); }
.benefit-grid h3 { font: 600 clamp(26px, 2.4vw, 34px) / 1.2 var(--font-display); }
.benefit-grid p { font-size: 16px; line-height: 1.75; color: var(--text-muted); }
@media (max-width: 767px) { .benefit-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 3: Verify exact cell counts and mobile rules**

Add assertions to `tests/design-contract.test.mjs`:

```js
test("declares explicit mobile collapse for editorial grids", async () => {
  const css = await read("app/globals.css");
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.group-grid[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.benefit-grid[\s\S]*grid-template-columns:\s*1fr/);
});
```

Run `node --test tests/design-contract.test.mjs`. Expected: this new test passes; old markup assertions may still fail until Task 6.

- [ ] **Step 4: Commit the content-section rhythm**

```bash
git add -- '四个本地网页版本/v1/app/page.tsx' '四个本地网页版本/v1/app/globals.css' '四个本地网页版本/v1/tests/design-contract.test.mjs'
git diff --cached --check
git commit -m "feat: recompose v1 recruitment sections"
```

---

### Task 6: Recompose stories, FAQ, join panel, and footer

**Files:**
- Modify: `四个本地网页版本/v1/app/page.tsx:140-223`
- Modify: `四个本地网页版本/v1/app/globals.css`
- Test: `四个本地网页版本/v1/tests/design-contract.test.mjs`

**Interfaces:**
- Consumes: `theme.stories`, `theme.faq`, `theme.recruitment`, and the exact primary CTA label.
- Produces: the remaining reveal units and the third exact `加入招新群` occurrence.

- [ ] **Step 1: Build a label-free editorial story grid**

Use one stacked header followed by five articles. Each article contains only `.story-image`, `h3`, and description `p`; do not render a tag or overlay text.

```tsx
<section className="stories section-pad" id="stories">
  <header className="section-heading-stack" data-reveal="stories-heading">
    <h2>一起做事，也一起生活</h2>
    <p>真实的作品、活动和合照，比口号更能说明 PR 是什么样的地方。</p>
  </header>
  <div className="story-grid" data-reveal="stories-grid" data-reveal-delay="140">
    {theme.stories.map((story, index) => (
      <article className={`story-card story-card-${index + 1}`} key={story.title}>
        <div className="story-image">
          <img src={story.image.src} alt={story.image.alt} width={story.image.width}
            height={story.image.height} loading="lazy" decoding="async" />
        </div>
        <h3>{story.title}</h3>
        <p>{story.description}</p>
      </article>
    ))}
  </div>
</section>
```

Use this exact grid composition:

```css
.story-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 52px 20px; }
.story-card-1 { grid-column: 1 / span 4; }
.story-card-2 { grid-column: 5 / span 5; margin-top: 64px; }
.story-card-3 { grid-column: 10 / span 3; }
.story-card-4 { grid-column: 2 / span 5; }
.story-card-5 { grid-column: 7 / span 5; margin-top: 72px; }
.story-image { overflow: hidden; border-radius: 16px; aspect-ratio: 4 / 3; }
.story-card-1 .story-image, .story-card-3 .story-image { aspect-ratio: 4 / 5; }
.story-card h3 { font: 600 clamp(25px, 2.3vw, 33px) / 1.25 var(--font-display); }
.story-card p { font-size: 16px; line-height: 1.75; color: var(--text-muted); }
@media (min-width: 768px) and (max-width: 1023px) {
  .story-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .story-card-1, .story-card-2, .story-card-3, .story-card-4, .story-card-5 {
    grid-column: auto; margin-top: 0;
  }
}
@media (max-width: 767px) {
  .story-grid { grid-template-columns: 1fr; }
  .story-card-1, .story-card-2, .story-card-3, .story-card-4, .story-card-5 {
    grid-column: auto; margin-top: 0;
  }
  .story-image { aspect-ratio: 4 / 3; }
  .story-card-1 .story-image { aspect-ratio: 3 / 4; }
}
```

- [ ] **Step 2: Stack the FAQ header above the native disclosure list**

Use `data-reveal="faq-heading"` and `data-reveal="faq-list"`. Keep the first `details` open, preserve all answers, set summary to at least 52px tall and 20-22px, and answers to 16px. Use only a bottom divider between FAQ rows.

- [ ] **Step 3: Build the contained join panel**

Keep `section.join.section-pad#join`, then use a `.join-shell` contained grid. The copy column uses the recruitment title, group name, instruction, and fallback. The QR column retains the original `img` dimensions and unmodified source, plus validity and “微信扫码加入”. Do not apply border-radius to `.qr-image img`.

Add the third join-intent link after the QR guidance:

```tsx
<a className="join-link" href={theme.hero.primaryAction.href}>
  {theme.hero.primaryAction.label}
</a>
```

The link points to the current panel, providing consistent focus/navigation semantics without inventing an external link.

- [ ] **Step 4: Rebuild the footer at 14px minimum**

Keep the brand, organization attribution, groups/stories anchors, and return-top link. Remove the old footer `加入我们` link so only the three exact join-intent labels remain: header, hero, join panel.

- [ ] **Step 5: Finish dark and responsive styles**

Add dark-mode-safe surfaces for group cards, benefit cells, FAQ dividers, join shell, footer, and muted text. Keep the page theme locked: sections use only `--page`, `--surface`, and `--surface-strong`; the contained `.join-shell` may use `--text` as a high-contrast panel with `--inverse` text.

Below 767px explicitly set `.story-grid`, `.faq`, `.join-shell`, and `footer` to their single-column or documented compact layouts. Keep all visible font declarations at 12px or above.

- [ ] **Step 6: Run the source contract**

```bash
node --test tests/design-contract.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Commit the remaining page structure**

```bash
git add -- '四个本地网页版本/v1/app/page.tsx' '四个本地网页版本/v1/app/globals.css'
git diff --cached --check
git commit -m "feat: complete v1 editorial page rhythm"
```

---

### Task 7: Refine motion and pass the built-output tests

**Files:**
- Modify: `四个本地网页版本/v1/app/globals.css`
- Modify only if required: `四个本地网页版本/v1/app/scroll-reveal-controller.ts`
- Test: `四个本地网页版本/v1/tests/scroll-reveal-controller.test.mjs`
- Test: `四个本地网页版本/v1/tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: the twelve final `data-reveal` units.
- Produces: one-shot 22px/580ms reveal behavior with a 140ms grouped delay and fail-visible fallback.

- [ ] **Step 1: Set the approved motion values**

Use:

```css
.reveal-ready [data-reveal] {
  opacity: 0;
  transform: translateY(22px);
  transition:
    opacity 580ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 580ms cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: var(--reveal-delay, 0ms);
}

.reveal-ready [data-reveal].is-revealed {
  opacity: 1;
  transform: translateY(0);
}
```

Retain the existing observer threshold, root margin, one-shot unobserve, initialization-failure fallback, and cleanup unless a test proves a change is necessary.

- [ ] **Step 2: Verify motion unit tests**

```bash
npm run test:unit
```

Expected: all scroll-reveal controller tests PASS.

- [ ] **Step 3: Build without relying on GNU `timeout`**

Run the project-equivalent macOS-safe sequence:

```bash
bash scripts/sites-env.sh -- node_modules/.bin/vinext build
bash scripts/validate-artifact.sh
```

Expected: successful build and artifact validation.

- [ ] **Step 4: Run rendered and source contracts against the new build**

```bash
node --test tests/rendered-html.test.mjs tests/design-contract.test.mjs
```

Expected: both test files PASS, including 12 reveal units, 5 delayed groups, exact CTA labels, preserved anchors, no banned dash characters, and minimum literal font sizes.

- [ ] **Step 5: Run lint**

```bash
npm run lint
```

Expected: exit 0 with no errors.

- [ ] **Step 6: Commit the verified motion layer**

```bash
git add -- '四个本地网页版本/v1/app/globals.css' '四个本地网页版本/v1/app/scroll-reveal-controller.ts'
git diff --cached --check
git commit -m "refactor: tune v1 reveal motion"
```

If `scroll-reveal-controller.ts` is unchanged, do not stage it.

---

### Task 8: Perform browser, dark-mode, copy, and pre-flight QA

**Files:**
- Create: `docs/qa/2026-08-15-v1-editorial-refinement-design-qa.md`
- Modify: only files with verified QA defects

**Interfaces:**
- Consumes: the built page, local Vite server, final design skill checklist, and all visible strings.
- Produces: evidence that the implementation meets the spec across viewports and themes.

- [ ] **Step 1: Start the local page**

```bash
npm run dev -- --host 127.0.0.1 --port 4173
```

Expected: `http://127.0.0.1:4173/` returns HTTP 200.

- [ ] **Step 2: Inspect five responsive viewports in the in-app browser**

Check 1440×900, 1024×768, 768×1024, 390×844, and 360×800. At each viewport record:

- no horizontal overflow;
- navigation height and single-line state;
- CTA visibility and no wrapping;
- hero headline line count;
- minimum computed visible font size;
- reasonable image subject cropping;
- correct single-column collapse below 768px;
- FAQ open/close, anchors, focus visibility, and scroll reveal;
- console errors.

Use this read-only browser evaluation for measurable checks:

```js
() => {
  const leaves = [...document.querySelectorAll("main *")].filter((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const ownsText = [...element.childNodes].some(
      (node) => node.nodeType === Node.TEXT_NODE && (node.textContent || "").trim(),
    );
    return ownsText && style.display !== "none" && style.visibility !== "hidden"
      && rect.width > 0 && rect.height > 0;
  });
  return {
    viewport: { width: innerWidth, height: innerHeight },
    documentWidth: document.documentElement.scrollWidth,
    minimumFontSize: Math.min(...leaves.map((element) =>
      Number(getComputedStyle(element).fontSize.replace("px", "")))),
    headerHeight: document.querySelector(".site-header")?.getBoundingClientRect().height,
    heroBottom: document.querySelector(".hero")?.getBoundingClientRect().bottom,
    wrappedActions: [...document.querySelectorAll(".button,.header-cta,.join-link")]
      .filter((element) => element.getBoundingClientRect().height > 54)
      .map((element) => element.textContent?.trim()),
  };
}
```

Expected at every viewport: `documentWidth === viewport.width`, `minimumFontSize >= 12`, and `wrappedActions` is empty. At 1440×900, `headerHeight <= 72`; at 390×844, part of `.hero-photo-main` is visible before the fold.

- [ ] **Step 3: Render deterministic dark-mode screenshots**

With the local server running, use installed Google Chrome headlessly:

```bash
mkdir -p .qa/v1-editorial-refinement
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --headless=new --disable-gpu --hide-scrollbars --force-dark-mode \
  --window-size=1440,900 \
  --screenshot=.qa/v1-editorial-refinement/dark-desktop.png \
  http://127.0.0.1:4173/
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --headless=new --disable-gpu --hide-scrollbars --force-dark-mode \
  --window-size=390,844 \
  --screenshot=.qa/v1-editorial-refinement/dark-mobile.png \
  http://127.0.0.1:4173/
```

Open both screenshots with the local image viewer and inspect text hierarchy, surfaces, accent consistency, image legibility, focus contrast, and QR contrast. Expected: the page uses the explicit dark tokens, not Chrome auto-inversion artifacts.

- [ ] **Step 4: Perform the copy and design pre-flight scan**

Run:

```bash
rg -n "—|–|section-kicker|className=\"eyebrow\"|font-size:\s*(8|9|10|11)px|h-screen|window\.addEventListener\(['\"]scroll" app tests
```

Expected: no matches.

Manually reread every visible headline, paragraph, button, caption, alt text, FAQ answer, QR instruction, and footer string. Confirm the headline and descriptions remain factual and natural.

Mechanically record these design checks: one accent, consistent shape rule, hero four-element stack, zero numbered eyebrows, no split headers, no duplicate CTA intent, no image overlays, exactly three group cells, four benefit items, five story cells, one theme per mode, no extra marquee, and reduced-motion support.

- [ ] **Step 5: Write the QA evidence file**

Create `docs/qa/2026-08-15-v1-editorial-refinement-design-qa.md` with these sections. Copy the real command summary and measured values into every result cell during execution:

```markdown
# V1 编辑部式精修改版 QA

## 自动检查

| 检查 | 命令 | 结果 |
| --- | --- | --- |
| 源码设计合同 | `node --test tests/design-contract.test.mjs` | PASS，并抄录本次 Node 测试汇总 |
| 滚动显现单测 | `npm run test:unit` | PASS，并抄录本次 Node 测试汇总 |
| 渲染 HTML | `node --test tests/rendered-html.test.mjs` | PASS，并抄录本次 Node 测试汇总 |
| ESLint | `npm run lint` | PASS |
| 构建 | `bash scripts/sites-env.sh -- node_modules/.bin/vinext build` | PASS |
| 产物 | `bash scripts/validate-artifact.sh` | PASS |

## 视口检查

写入五个视口实际测得的页面宽度、最小字号、导航高度、首屏、CTA 和溢出结果。

## 浅色与深色

写入桌面端和手机端浅色、深色渲染检查结果及截图路径。

## 交互与降级

写入锚点、FAQ、滚动显现、减少动态效果、键盘焦点和控制台的实际结果。

## Design Taste 预检

逐项写入本任务适用规则的实际检查结论，所有 P0、P1、P2 均为零后签字完成。
```

The final QA file must contain only observed values and no placeholder words.

- [ ] **Step 6: Re-run the complete verification after any QA fix**

```bash
npm run lint
bash scripts/sites-env.sh -- node_modules/.bin/vinext build
bash scripts/validate-artifact.sh
npm run test:unit
node --test tests/rendered-html.test.mjs tests/design-contract.test.mjs
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 7: Commit only the final QA evidence and verified fixes**

```bash
git add -- docs/qa/2026-08-15-v1-editorial-refinement-design-qa.md \
  '四个本地网页版本/v1/app' \
  '四个本地网页版本/v1/tests' \
  '四个本地网页版本/v1/public/assets/editorial-paper-texture.png'
git diff --cached --check
git status --short
git commit -m "test: verify v1 editorial refinement"
```

Before committing, inspect `git diff --cached --name-only` and remove any path outside the listed v1 files and QA document. The three deleted archive ZIPs must remain unstaged.

---

## Final Handoff

After Task 8 passes, report the exact modified files, commit list, responsive/browser results, dark-mode evidence, and any true residual limitation. Provide clickable absolute paths to the v1 folder and QA report. Do not claim deployment or QR validity beyond the verified date.
