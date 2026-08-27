"use client";

import { useEffect, useRef } from "react";
import { Color, Mesh, Program, Renderer, Triangle } from "ogl";

import {
  invertLinearTransform,
  parseCssTransform,
  resolveScaledFrameGeometry,
  resolveSpecularTuning,
  transformScreenOffsetToLocal,
} from "./specular-geometry";
import {
  advanceSpecularMotion,
  createSpecularMotionState,
  type SpecularMotionState,
} from "./specular-motion";
import "./specular-surface.css";

const TARGET_SELECTOR = "[data-specular]";
const PAD = 24;
const PROXIMITY = 250;
const SHINE_SIZE = (10 * Math.PI) / 180;
const SHINE_FADE = (40 * Math.PI) / 180;

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uViewportHeight;
uniform float uDpr;
uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform mat2 uToLocal;
uniform vec4 uRadiusX;
uniform vec4 uRadiusY;
uniform float uAngle;
uniform vec3 uLineColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;

out vec4 fragColor;

float sdBox(vec2 p, vec2 b) {
  vec2 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

float sdEllipseNearEdge(vec2 p, vec2 radii) {
  vec2 safeRadii = max(radii, vec2(0.0001));
  float implicitValue = length(p / safeRadii) - 1.0;
  float gradientLength = length(p / (safeRadii * safeRadii));
  return implicitValue / max(gradientLength, 0.0001);
}

vec2 cornerRadii(vec2 p) {
  if (p.x < 0.0) {
    if (p.y < 0.0) return vec2(uRadiusX.x, uRadiusY.x);
    return vec2(uRadiusX.w, uRadiusY.w);
  }
  if (p.y < 0.0) return vec2(uRadiusX.y, uRadiusY.y);
  return vec2(uRadiusX.z, uRadiusY.z);
}

float sdCssRoundedRect(vec2 p) {
  vec2 radii = cornerRadii(p);
  if (min(radii.x, radii.y) < 0.001) return sdBox(p, uHalfSize);

  vec2 ap = abs(p);
  vec2 cornerStart = uHalfSize - radii;
  if (ap.x <= cornerStart.x) return ap.y - uHalfSize.y;
  if (ap.y <= cornerStart.y) return ap.x - uHalfSize.x;
  return sdEllipseNearEdge(ap - cornerStart, radii);
}

float gaussianLine(float distanceToEdge, float sigma) {
  float x = distanceToEdge / (sigma + 0.000001);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, abs(x)));
  return exp(-k * x * x);
}

void main() {
  vec2 screenPoint = vec2(gl_FragCoord.x / uDpr, uViewportHeight - gl_FragCoord.y / uDpr);
  vec2 p = uToLocal * (screenPoint - uCenter);
  float d = sdCssRoundedRect(p);
  vec2 lightDirection = vec2(cos(uAngle), sin(uAngle));

  vec2 normalHint = normalize(p / max(uHalfSize * uHalfSize, vec2(0.0001)));
  float phi = acos(clamp(abs(dot(normalHint, lightDirection)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(
    uShineSize - uShineFade,
    uShineSize + uShineFade + 0.0001,
    phi
  );

  float aa = max(fwidth(d), 0.5 / uDpr);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(uThickness + aa, uThickness + aa * 3.0, abs(d));
  float highlight = line * rim * edgeClamp * uIntensity;

  fragColor = vec4(uLineColor * highlight, clamp(highlight, 0.0, 1.0));
}
`;

type TargetGeometry = {
  centerX: number;
  centerY: number;
  halfWidth: number;
  halfHeight: number;
  inverse: [number, number, number, number];
  radiiX: number[];
  radiiY: number[];
  lineColor: string;
  strength: number;
  thickness: number;
  rect: DOMRect;
};

function numericCssSize(value: string, fallback: number) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function geometryFor(target: HTMLElement): TargetGeometry | null {
  const styles = window.getComputedStyle(target);
  const rect = target.getBoundingClientRect();
  if (
    rect.width <= 0 ||
    rect.height <= 0 ||
    styles.display === "none" ||
    styles.visibility === "hidden"
  ) {
    return null;
  }

  const width = numericCssSize(styles.width, target.offsetWidth || rect.width);
  const height = numericCssSize(styles.height, target.offsetHeight || rect.height);
  const inverse = invertLinearTransform(parseCssTransform(styles.transform));
  const frame = resolveScaledFrameGeometry(
    {
      topLeft: styles.borderTopLeftRadius,
      topRight: styles.borderTopRightRadius,
      bottomRight: styles.borderBottomRightRadius,
      bottomLeft: styles.borderBottomLeftRadius,
    },
    width,
    height,
    styles.getPropertyValue("--site-scale"),
  );
  const tuning = resolveSpecularTuning(
    styles.getPropertyValue("--specular-thickness"),
    styles.getPropertyValue("--specular-strength"),
  );

  return {
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
    halfWidth: frame.halfWidth,
    halfHeight: frame.halfHeight,
    inverse,
    radiiX: frame.radiiX,
    radiiY: frame.radiiY,
    lineColor:
      styles.getPropertyValue("--specular-line").trim() || "#fffefd",
    strength: tuning.strength,
    thickness: tuning.thickness,
    rect,
  };
}

function pointerDistance(rect: DOMRect, x: number, y: number) {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
}

function easedProximity(distance: number) {
  const t = Math.max(0, 1 - distance / PROXIMITY);
  return t * t * (3 - 2 * t);
}

export function SpecularSurface() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof window === "undefined") return;

    try {
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        host.dataset.specularStatus = "reduced-motion";
        return;
      }
    } catch {
      host.dataset.specularStatus = "unavailable";
      return;
    }

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        antialias: true,
        autoClear: false,
        depth: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        premultipliedAlpha: true,
        powerPreference: "low-power",
        webgl: 2,
      });
    } catch {
      host.dataset.specularStatus = "unavailable";
      return;
    }

    const gl = renderer.gl;
    if (!gl || !renderer.isWebgl2) {
      host.dataset.specularStatus = "unavailable";
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      return;
    }

    gl.clearColor(0, 0, 0, 0);
    renderer.enable(gl.BLEND);
    renderer.setBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uViewportHeight: { value: window.innerHeight },
        uDpr: { value: renderer.dpr },
        uCenter: { value: [0, 0] },
        uHalfSize: { value: [1, 1] },
        uToLocal: { value: [1, 0, 0, 1] },
        uRadiusX: { value: [0, 0, 0, 0] },
        uRadiusY: { value: [0, 0, 0, 0] },
        uAngle: { value: 2.4 },
        uLineColor: { value: [1, 1, 1] },
        uIntensity: { value: 0 },
        uShineSize: { value: SHINE_SIZE },
        uShineFade: { value: SHINE_FADE },
        uThickness: { value: 1 },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });
    const lineColor = new Color();
    host.appendChild(gl.canvas);
    host.dataset.specularStatus = "ready";

    let targets: HTMLElement[] = [];
    const visibleTargets = new Set<HTMLElement>();
    let pointer: { x: number; y: number } | null = null;
    let focusedTarget: HTMLElement | null = null;
    let animationFrame = 0;
    let lastTime = performance.now();
    const targetStates = new Map<HTMLElement, SpecularMotionState>();

    const setRendererSize = () => {
      if (renderer.width !== window.innerWidth || renderer.height !== window.innerHeight) {
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      program.uniforms.uViewportHeight.value = window.innerHeight;
      program.uniforms.uDpr.value = renderer.dpr;
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => schedule());

    const intersectionObserver =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                const target = entry.target as HTMLElement;
                if (entry.isIntersecting) visibleTargets.add(target);
                else visibleTargets.delete(target);
              }
              schedule();
            },
            { rootMargin: `${PAD}px` },
          );

    const refreshTargets = () => {
      targets = Array.from(document.querySelectorAll<HTMLElement>(TARGET_SELECTOR));
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      visibleTargets.clear();
      targets.forEach((target) => {
        resizeObserver?.observe(target);
        if (intersectionObserver) {
          intersectionObserver.observe(target);
          const rect = target.getBoundingClientRect();
          if (
            rect.bottom >= -PAD &&
            rect.top <= window.innerHeight + PAD &&
            rect.right >= -PAD &&
            rect.left <= window.innerWidth + PAD
          ) {
            visibleTargets.add(target);
          }
        } else {
          visibleTargets.add(target);
        }
      });
      for (const target of targetStates.keys()) {
        if (!targets.includes(target)) targetStates.delete(target);
      }
      host.dataset.specularTargetCount = String(targets.length);
      schedule();
    };

    const render = (now: number) => {
      animationFrame = 0;
      if (document.visibilityState === "hidden") return;
      setRendererSize();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      renderer.disable(gl.SCISSOR_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT);
      renderer.enable(gl.SCISSOR_TEST);

      for (const [targetIndex, target] of targets.entries()) {
        if (!visibleTargets.has(target)) continue;
        const targetGeometry = geometryFor(target);
        if (!targetGeometry) continue;

        const visible =
          targetGeometry.rect.bottom >= -PAD &&
          targetGeometry.rect.top <= window.innerHeight + PAD &&
          targetGeometry.rect.right >= -PAD &&
          targetGeometry.rect.left <= window.innerWidth + PAD;
        if (!visible) continue;

        let state = targetStates.get(target);
        if (!state) {
          state = createSpecularMotionState(2.4 + targetIndex * 2.3999632297);
          targetStates.set(target, state);
        }

        let proximity = target === focusedTarget ? 0.78 : 0;
        let targetAngle: number | undefined;
        if (pointer) {
          const distance = pointerDistance(
            targetGeometry.rect,
            pointer.x,
            pointer.y,
          );
          proximity = Math.max(proximity, easedProximity(distance));
          const localPointer = transformScreenOffsetToLocal(
            targetGeometry.inverse,
            pointer.x - targetGeometry.centerX,
            pointer.y - targetGeometry.centerY,
          );
          if (Math.hypot(localPointer.x, localPointer.y) > 4) {
            targetAngle = Math.atan2(localPointer.y, localPointer.x);
          }
        }

        state = advanceSpecularMotion(state, { dt, proximity, targetAngle });
        targetStates.set(target, state);

        const dpr = renderer.dpr;
        const left = Math.max(
          0,
          Math.floor((targetGeometry.rect.left - PAD) * dpr),
        );
        const right = Math.min(
          gl.canvas.width,
          Math.ceil((targetGeometry.rect.right + PAD) * dpr),
        );
        const top = Math.max(
          0,
          Math.floor((targetGeometry.rect.top - PAD) * dpr),
        );
        const bottom = Math.min(
          gl.canvas.height,
          Math.ceil((targetGeometry.rect.bottom + PAD) * dpr),
        );
        if (right <= left || bottom <= top) continue;

        renderer.setScissor(
          right - left,
          bottom - top,
          left,
          gl.canvas.height - bottom,
        );
        lineColor.set(targetGeometry.lineColor);
        program.uniforms.uCenter.value = [
          targetGeometry.centerX,
          targetGeometry.centerY,
        ];
        program.uniforms.uHalfSize.value = [
          targetGeometry.halfWidth,
          targetGeometry.halfHeight,
        ];
        program.uniforms.uToLocal.value = targetGeometry.inverse;
        program.uniforms.uRadiusX.value = targetGeometry.radiiX;
        program.uniforms.uRadiusY.value = targetGeometry.radiiY;
        program.uniforms.uAngle.value = state.angle;
        program.uniforms.uLineColor.value = [lineColor.r, lineColor.g, lineColor.b];
        program.uniforms.uIntensity.value = state.brightness * targetGeometry.strength;
        program.uniforms.uThickness.value = targetGeometry.thickness;
        renderer.render({ scene: mesh, clear: false });
      }

      renderer.disable(gl.SCISSOR_TEST);
      schedule();
    };

    function schedule() {
      if (document.visibilityState !== "hidden" && !animationFrame) {
        animationFrame = requestAnimationFrame(render);
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer = { x: event.clientX, y: event.clientY };
    };
    const clearPointer = () => {
      pointer = null;
    };
    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) clearPointer();
    };
    const onFocusIn = (event: FocusEvent) => {
      focusedTarget =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(TARGET_SELECTOR)
          : null;
    };
    const onFocusOut = () => {
      focusedTarget = null;
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        return;
      }
      lastTime = performance.now();
      schedule();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerOut, { passive: true });
    window.addEventListener("blur", clearPointer);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("visibilitychange", onVisibilityChange);
    const mutationObserver =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(refreshTargets);
    mutationObserver?.observe(document.body, {
      attributeFilter: ["open"],
      attributes: true,
      childList: true,
      subtree: true,
    });

    setRendererSize();
    refreshTargets();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      mutationObserver?.disconnect();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("blur", clearPointer);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (gl.canvas.parentNode === host) host.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div ref={hostRef} className="specular-surface" aria-hidden="true" />;
}
