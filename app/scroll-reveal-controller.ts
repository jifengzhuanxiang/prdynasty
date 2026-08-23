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
  let reducedMotion = options.reducedMotion;
  if (reducedMotion === undefined) {
    if (typeof window === "undefined") {
      reducedMotion = false;
    } else if (typeof window.matchMedia !== "function") {
      revealAll();
      return () => {};
    } else {
      try {
        reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
      } catch {
        revealAll();
        return () => {};
      }
    }
  }
  const observerFactory =
    options.observerFactory === undefined
      ? getDefaultObserverFactory()
      : options.observerFactory;

  if (elements.length === 0 || reducedMotion || observerFactory === null) {
    revealAll();
    return () => {};
  }

  let observer: RevealObserver | undefined;
  const onIntersect = (entries: readonly RevealEntry[]) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer?.unobserve(entry.target);
    });
  };

  try {
    observer = observerFactory(onIntersect, {
      root: null,
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.12,
    });
    elements.forEach((element) => observer?.observe(element));
    root.classList.add("reveal-ready");
  } catch {
    observer?.disconnect();
    revealAll();
    return () => {};
  }

  return () => {
    observer?.disconnect();
    root.classList.remove("reveal-ready");
  };
}
