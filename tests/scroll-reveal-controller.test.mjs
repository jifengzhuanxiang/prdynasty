import assert from "node:assert/strict";
import test from "node:test";

const controllerUrl = new URL(
  "../app/scroll-reveal-controller.ts",
  import.meta.url,
);
const controllerModule = await import(controllerUrl.href).catch(() => null);

function getActivateScrollReveal() {
  assert.ok(
    controllerModule,
    "the scroll reveal controller should be available to the live page",
  );
  assert.equal(typeof controllerModule.activateScrollReveal, "function");
  return controllerModule.activateScrollReveal;
}

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
  const activateScrollReveal = getActivateScrollReveal();
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
  const activateScrollReveal = getActivateScrollReveal();
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
  const activateScrollReveal = getActivateScrollReveal();
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

test("shows all content when matchMedia is unavailable", () => {
  const activateScrollReveal = getActivateScrollReveal();
  const root = fakeElement();
  const item = fakeElement();
  const hadWindow = Object.prototype.hasOwnProperty.call(globalThis, "window");
  const previousWindow = globalThis.window;
  globalThis.window = {};

  try {
    activateScrollReveal({
      root,
      elements: [item],
      observerFactory() {
        throw new Error("observer must not be created");
      },
    });
  } finally {
    if (hadWindow) {
      globalThis.window = previousWindow;
    } else {
      delete globalThis.window;
    }
  }

  assert.equal(root.classList.contains("reveal-ready"), false);
  assert.equal(item.classList.contains("is-revealed"), true);
});

test("shows all content when matchMedia throws", () => {
  const activateScrollReveal = getActivateScrollReveal();
  const root = fakeElement();
  const item = fakeElement();
  const hadWindow = Object.prototype.hasOwnProperty.call(globalThis, "window");
  const previousWindow = globalThis.window;
  globalThis.window = {
    matchMedia() {
      throw new Error("matchMedia failed");
    },
  };

  try {
    activateScrollReveal({
      root,
      elements: [item],
      observerFactory() {
        throw new Error("observer must not be created");
      },
    });
  } finally {
    if (hadWindow) {
      globalThis.window = previousWindow;
    } else {
      delete globalThis.window;
    }
  }

  assert.equal(root.classList.contains("reveal-ready"), false);
  assert.equal(item.classList.contains("is-revealed"), true);
});

test("restores visible content when observer setup throws", () => {
  const activateScrollReveal = getActivateScrollReveal();
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

test("disconnects a partially initialized observer when observing throws", () => {
  const activateScrollReveal = getActivateScrollReveal();
  const root = fakeElement();
  const items = [fakeElement(), fakeElement()];
  let observeCalls = 0;
  let disconnected = false;

  activateScrollReveal({
    root,
    elements: items,
    reducedMotion: false,
    observerFactory() {
      return {
        observe() {
          observeCalls += 1;
          if (observeCalls === 2) {
            throw new Error("observe failed");
          }
        },
        unobserve() {},
        disconnect() {
          disconnected = true;
        },
      };
    },
  });

  assert.equal(disconnected, true);
  assert.equal(root.classList.contains("reveal-ready"), false);
  items.forEach((item) => {
    assert.equal(item.classList.contains("is-revealed"), true);
  });
});
