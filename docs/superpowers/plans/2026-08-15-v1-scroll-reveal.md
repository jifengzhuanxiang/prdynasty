# v1 Scroll Reveal Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a one-shot, Apple-balanced upward reveal to every confirmed section below the v1 hero while preserving all existing content, layout, hover effects, and interactions.

**Architecture:** A framework-independent controller owns `IntersectionObserver`, reduced-motion detection, progressive fallback, and cleanup. A minimal client React component activates that controller, while the existing server-rendered page marks twelve semantic reveal units with `data-reveal`; CSS applies the shared 38px/820ms motion without touching child-card transforms.

**Tech Stack:** React 19, TypeScript 5.9, Next.js 16/Vinext, native `IntersectionObserver`, CSS transitions, Node.js built-in test runner.

## Global Constraints

- Preserve all existing copy, images, QR code, colors, layout, responsive breakpoints, navigation, hover states, and FAQ behavior.
- Keep the existing hero load animation unchanged.
- Use approximately `38px` upward travel, `820ms` duration, and `cubic-bezier(0.22, 1, 0.36, 1)` easing.
- Use a `140ms` second-layer delay when heading and content enter together.
- Observe each card/list container once so cards or rows in the same group reveal simultaneously, never with per-item stagger.
- Each reveal unit plays at most once per page visit.
- Keep content visible when JavaScript or `IntersectionObserver` is unavailable.
- Disable movement and delay for `prefers-reduced-motion: reduce`.
- Add no animation dependency and no scroll hijacking, parallax, sticky storytelling, or scroll-bound scaling.
- The project supports Node.js `>=22.13.0`.

## File Structure

- Create `四个本地网页版本/v1/app/scroll-reveal-controller.ts`: observer lifecycle, one-shot state, fallbacks, and cleanup.
- Create `四个本地网页版本/v1/app/scroll-reveal.tsx`: minimal client component that activates the controller once.
- Create `四个本地网页版本/v1/tests/scroll-reveal-controller.test.mjs`: unit tests with deterministic observer fakes.
- Modify `四个本地网页版本/v1/app/page.tsx`: mount the activator and label the twelve approved reveal units.
- Modify `四个本地网页版本/v1/app/globals.css`: shared hidden/revealed states, timing, delay, and reduced-motion override.
- Modify `四个本地网页版本/v1/tests/rendered-html.test.mjs`: assert the exact reveal-unit contract and grouped-container semantics.
- Modify `四个本地网页版本/v1/package.json`: expose the unit test and include it in the full test command.

---

### Task 1: One-shot reveal controller and client activator

**Files:**
- Create: `四个本地网页版本/v1/tests/scroll-reveal-controller.test.mjs`
- Create: `四个本地网页版本/v1/app/scroll-reveal-controller.ts`
- Create: `四个本地网页版本/v1/app/scroll-reveal.tsx`
- Modify: `四个本地网页版本/v1/package.json:9-17`

**Interfaces:**
- Consumes: browser `document`, `window.matchMedia`, and `IntersectionObserver` through optional injected values.
- Produces: `activateScrollReveal(options?: ActivateScrollRevealOptions): () => void`.
- Produces: `RevealObserverFactory`, used by tests to inject deterministic observer behavior.
- Produces: default React export `ScrollReveal`, which renders `null` and activates the controller in a client effect.

- [ ] **Step 1: Write failing controller tests**

Create `tests/scroll-reveal-controller.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

const controllerUrl = new URL(
  "../app/scroll-reveal-controller.ts",
  import.meta.url,
);
const { activateScrollReveal } = await import(controllerUrl.href);

class FakeClassList {
  values = new Set();

  add(...tokens) {
    tokens.forEach((token) => this.values.add(token));
  }

  remove(...tokens) {
    tokens.forEach((token) => this.values.delete(token));
  }

  contains(token) {
    return this.values.has(token);
  }
}

function fakeElement() {
  return { classList: new FakeClassList() };
}

function createObserverHarness() {
  let callback;
  const observed = [];
  const unobserved = [];
  let disconnected = false;

  const factory = (nextCallback, options) => {
    callback = nextCallback;
    assert.deepEqual(options, {
      root: null,
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.12,
    });
    return {
      observe(element) {
        observed.push(element);
      },
      unobserve(element) {
        unobserved.push(element);
      },
      disconnect() {
        disconnected = true;
      },
    };
  };

  return {
    factory,
    observed,
    unobserved,
    emit(entries) {
      assert.ok(callback);
      callback(entries);
    },
    isDisconnected() {
      return disconnected;
    },
  };
}

test("reveals an intersecting element once and unobserves it", () => {
  const root = fakeElement();
  const item = fakeElement();
  const observer = createObserverHarness();

  const cleanup = activateScrollReveal({
    root,
    elements: [item],
    reducedMotion: false,
    observerFactory: observer.factory,
  });

  assert.equal(root.classList.contains("reveal-ready"), true);
  assert.deepEqual(observer.observed, [item]);
  observer.emit([{ isIntersecting: false, target: item }]);
  assert.equal(item.classList.contains("is-revealed"), false);

  observer.emit([{ isIntersecting: true, target: item }]);
  assert.equal(item.classList.contains("is-revealed"), true);
  assert.deepEqual(observer.unobserved, [item]);

  cleanup();
  assert.equal(observer.isDisconnected(), true);
  assert.equal(root.classList.contains("reveal-ready"), false);
});

test("shows all content without an observer for reduced motion", () => {
  const root = fakeElement();
  const items = [fakeElement(), fakeElement()];
  let factoryCalled = false;

  activateScrollReveal({
    root,
    elements: items,
    reducedMotion: true,
    observerFactory() {
      factoryCalled = true;
      throw new Error("observer must not be created");
    },
  });

  assert.equal(factoryCalled, false);
  assert.equal(root.classList.contains("reveal-ready"), false);
  items.forEach((item) => {
    assert.equal(item.classList.contains("is-revealed"), true);
  });
});

test("shows all content when IntersectionObserver is unavailable", () => {
  const root = fakeElement();
  const item = fakeElement();

  activateScrollReveal({
    root,
    elements: [item],
    reducedMotion: false,
    observerFactory: null,
  });

  assert.equal(root.classList.contains("reveal-ready"), false);
  assert.equal(item.classList.contains("is-revealed"), true);
});

test("restores visible content when observer setup throws", () => {
  const root = fakeElement();
  const item = fakeElement();

  activateScrollReveal({
    root,
    elements: [item],
    reducedMotion: false,
    observerFactory() {
      throw new Error("observer setup failed");
    },
  });

  assert.equal(root.classList.contains("reveal-ready"), false);
  assert.equal(item.classList.contains("is-revealed"), true);
});
```

- [ ] **Step 2: Run the new test and verify failure**

Run from `四个本地网页版本/v1`:

```bash
node --experimental-strip-types --test tests/scroll-reveal-controller.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `app/scroll-reveal-controller.ts`.

- [ ] **Step 3: Implement the controller**

Create `app/scroll-reveal-controller.ts`:

```ts
export type RevealEntry = {
  isIntersecting: boolean;
  target: Element;
};

export type RevealObserver = {
  observe(element: Element): void;
  unobserve(element: Element): void;
  disconnect(): void;
};

export type RevealObserverFactory = (
  callback: (entries: readonly RevealEntry[]) => void,
  options: IntersectionObserverInit,
) => RevealObserver;

export type ActivateScrollRevealOptions = {
  root?: HTMLElement;
  elements?: Iterable<HTMLElement>;
  reducedMotion?: boolean;
  observerFactory?: RevealObserverFactory | null;
};

const REVEAL_SELECTOR = "[data-reveal]";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function getDefaultObserverFactory(): RevealObserverFactory | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }

  return (callback, options) =>
    new window.IntersectionObserver((entries) => callback(entries), options);
}

export function activateScrollReveal(
  options: ActivateScrollRevealOptions = {},
): () => void {
  const root = options.root ?? document.documentElement;
  const elements = Array.from(
    options.elements ?? document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
  );
  const revealAll = () => {
    root.classList.remove("reveal-ready");
    elements.forEach((element) => element.classList.add("is-revealed"));
  };
  const reducedMotion =
    options.reducedMotion ??
    (typeof window !== "undefined" &&
      window.matchMedia(REDUCED_MOTION_QUERY).matches);
  const observerFactory =
    options.observerFactory === undefined
      ? getDefaultObserverFactory()
      : options.observerFactory;

  if (elements.length === 0 || reducedMotion || observerFactory === null) {
    revealAll();
    return () => {};
  }

  let observer: RevealObserver;
  const onIntersect = (entries: readonly RevealEntry[]) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  };

  try {
    observer = observerFactory(onIntersect, {
      root: null,
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.12,
    });
    elements.forEach((element) => observer.observe(element));
    root.classList.add("reveal-ready");
  } catch {
    revealAll();
    return () => {};
  }

  return () => {
    observer.disconnect();
    root.classList.remove("reveal-ready");
  };
}
```

- [ ] **Step 4: Implement the minimal client activator**

Create `app/scroll-reveal.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { activateScrollReveal } from "./scroll-reveal-controller";

export default function ScrollReveal() {
  useEffect(() => activateScrollReveal(), []);
  return null;
}
```

- [ ] **Step 5: Add the unit test script**

Change the `scripts` block in `package.json` so it includes these exact entries while retaining every other script:

```json
"test:unit": "node --experimental-strip-types --test tests/scroll-reveal-controller.test.mjs",
"test": "npm run build && npm run test:unit && node --test tests/rendered-html.test.mjs"
```

- [ ] **Step 6: Run controller tests and lint**

```bash
npm run test:unit
npm run lint
```

Expected: both commands exit `0`; four controller tests pass.

- [ ] **Step 7: Commit Task 1**

```bash
git add -- 四个本地网页版本/v1/app/scroll-reveal-controller.ts 四个本地网页版本/v1/app/scroll-reveal.tsx 四个本地网页版本/v1/tests/scroll-reveal-controller.test.mjs 四个本地网页版本/v1/package.json
git commit -m "feat: add one-shot scroll reveal controller"
```

---

### Task 2: Page reveal contract, styles, and end-to-end verification

**Files:**
- Modify: `四个本地网页版本/v1/tests/rendered-html.test.mjs:32-46`
- Modify: `四个本地网页版本/v1/app/page.tsx:3-219`
- Modify: `四个本地网页版本/v1/app/globals.css:843-850,1159-1171`

**Interfaces:**
- Consumes: default export `ScrollReveal` from `app/scroll-reveal.tsx`.
- Consumes: controller selectors `.reveal-ready`, `[data-reveal]`, and `.is-revealed`.
- Produces: twelve named reveal units and five second-layer units with `data-reveal-delay="140"`.
- Produces: CSS custom property `--reveal-delay`.

- [ ] **Step 1: Extend the rendered HTML contract so it fails first**

Append these assertions inside the existing `renders the recruitment content contract` test, after the placeholder assertions:

```js
  const revealUnits = [
    "strip",
    "groups-heading",
    "groups-cards",
    "benefits-intro",
    "benefits-list",
    "stories-heading",
    "stories-cards",
    "faq-intro",
    "faq-list",
    "join-copy",
    "join-qr",
    "footer",
  ];
  for (const unit of revealUnits) {
    assert.match(html, new RegExp(`data-reveal=["']${unit}["']`));
  }
  assert.equal((html.match(/\sdata-reveal=["']/g) ?? []).length, 12);
  assert.equal(
    (html.match(/data-reveal-delay=["']140["']/g) ?? []).length,
    5,
  );
  assert.doesNotMatch(
    html,
    /class=["'][^"']*\bgroup-card\b[^"']*["'][^>]*\sdata-reveal=/,
  );
```

- [ ] **Step 2: Run the current rendered contract and verify failure**

```bash
node --test tests/rendered-html.test.mjs
```

Expected: FAIL because `data-reveal="strip"` and the remaining reveal units are absent.

- [ ] **Step 3: Mount the activator and mark the exact reveal units**

Add this import above the existing theme import in `app/page.tsx`:

```tsx
import ScrollReveal from "./scroll-reveal";
import { recruitmentTheme as theme } from "./recruitment-theme";
```

Mount the activator as the first child of `<main>`:

```tsx
<main>
  <ScrollReveal />
```

Add the following attributes only to the listed existing outer elements:

```tsx
<div className="recruitment-strip" aria-label="宣传部工作方向" data-reveal="strip">

<div className="section-heading" data-reveal="groups-heading">
<div className="group-grid" data-reveal="groups-cards" data-reveal-delay="140">

<div className="benefit-intro" data-reveal="benefits-intro">
<ol className="benefit-list" data-reveal="benefits-list" data-reveal-delay="140">

<div className="section-heading stories-heading" data-reveal="stories-heading">
<div className="story-grid" data-reveal="stories-cards" data-reveal-delay="140">

<div className="faq-intro" data-reveal="faq-intro">
<div className="faq-list" data-reveal="faq-list" data-reveal-delay="140">

<div className="join-copy" data-reveal="join-copy">
<div className="qr-card" data-reveal="join-qr" data-reveal-delay="140">

<footer data-reveal="footer">
```

Do not add `data-reveal` to `.group-card`, `.benefit-list li`, `.story-card`, or `.faq-list details`; their shared containers are the animation units that guarantee simultaneous appearance.

- [ ] **Step 4: Add the Apple-balanced reveal CSS**

Insert immediately before the existing `@keyframes rise` in `app/globals.css`:

```css
[data-reveal] {
  --reveal-delay: 0ms;
}

[data-reveal-delay="140"] {
  --reveal-delay: 140ms;
}

.reveal-ready [data-reveal] {
  opacity: 0;
  transform: translateY(38px);
  transition:
    opacity 820ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 820ms cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: var(--reveal-delay);
}

.reveal-ready [data-reveal].is-revealed {
  opacity: 1;
  transform: translateY(0);
}
```

Add this override at the beginning of the existing `@media (prefers-reduced-motion: reduce)` block:

```css
  .reveal-ready [data-reveal],
  .reveal-ready [data-reveal].is-revealed {
    opacity: 1;
    transform: none;
    transition: none;
  }
```

- [ ] **Step 5: Build with macOS-compatible project commands**

The repository's `npm run build` wrapper requires GNU `timeout`, which is not available by default on macOS. Run the equivalent build and artifact checks:

```bash
bash scripts/sites-env.sh -- node_modules/.bin/vinext build
bash scripts/validate-artifact.sh
```

Expected: Vinext build exits `0`; validation prints `Validated Sites artifact: ESM Worker default.fetch and hosting manifest are present.`

- [ ] **Step 6: Run unit, rendered HTML, lint, and whitespace checks**

```bash
npm run test:unit
node --test tests/rendered-html.test.mjs
npm run lint
git diff --check
```

Expected: four unit tests pass, the rendered HTML contract passes, lint exits `0`, and `git diff --check` prints nothing.

- [ ] **Step 7: Perform desktop browser QA**

Start the existing local v1 server on its dedicated port:

```bash
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173
```

At a desktop viewport near `1440×1000`, verify in order:

1. Hero animation and layout are unchanged.
2. The pink strip reveals as one unit.
3. The groups heading reveals before the three group cards, and all three cards move together.
4. Benefits intro reveals before the full benefits list.
5. Stories heading reveals before all five story cards.
6. FAQ intro reveals before the full FAQ list; the first item remains open and details still toggle.
7. Join copy reveals before the QR card.
8. Footer reveals as one unit.
9. Scrolling back up and down does not replay any revealed unit.
10. Header navigation and anchor jumps work.
11. Browser console contains no new error.

- [ ] **Step 8: Perform mobile and reduced-motion QA**

At a viewport near `390×844`, scroll through the complete page and verify every reveal unit becomes visible without clipping, permanent hiding, or horizontal overflow. Confirm grouped cards remain simultaneous even when their shared container spans more than one screen.

Emulate `prefers-reduced-motion: reduce`, reload, and verify all twelve units are immediately visible with no 38px movement or 140ms delay. Disable emulation, reload, and confirm the standard one-shot motion returns.

- [ ] **Step 9: Commit Task 2 after all checks pass**

```bash
git add -- 四个本地网页版本/v1/app/page.tsx 四个本地网页版本/v1/app/globals.css 四个本地网页版本/v1/tests/rendered-html.test.mjs
git commit -m "feat: reveal v1 sections on scroll"
```

- [ ] **Step 10: Final repository verification**

```bash
git status --short --branch
git log -4 --oneline --decorate
```

Expected: no uncommitted tracked changes; the branch contains the design commit, controller commit, and page-animation commit. Ignored `.superpowers/` visual-companion files may remain locally but must not be staged.
