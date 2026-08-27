import assert from "node:assert/strict";
import test from "node:test";

import * as geometry from "../app/components/specular-geometry.ts";

const {
  invertLinearTransform,
  parseCssTransform,
  resolveBorderRadii,
  resolveScaledFrameGeometry,
  transformScreenOffsetToLocal,
} = geometry;

test("normalizes oversized pill radii to the exact CSS border shape", () => {
  const radii = resolveBorderRadii(
    {
      topLeft: "999px",
      topRight: "999px",
      bottomRight: "999px",
      bottomLeft: "999px",
    },
    148,
    52,
  );

  assert.deepEqual(radii.x, [26, 26, 26, 26]);
  assert.deepEqual(radii.y, [26, 26, 26, 26]);
});

test("resolves percentage and pixel corner radii independently", () => {
  const radii = resolveBorderRadii(
    {
      topLeft: "48%",
      topRight: "48%",
      bottomRight: "28px",
      bottomLeft: "28px",
    },
    541.9,
    565.6,
  );

  assert.deepEqual(radii.x, [260.112, 260.112, 28, 28]);
  assert.deepEqual(radii.y, [271.488, 271.488, 28, 28]);
});

test("scales frame dimensions and corner radii into viewport coordinates", () => {
  const frame = resolveScaledFrameGeometry(
    {
      topLeft: "999px",
      topRight: "999px",
      bottomRight: "999px",
      bottomLeft: "999px",
    },
    148,
    52,
    "0.8",
  );

  assert.deepEqual(frame, {
    halfWidth: 59.2,
    halfHeight: 20.8,
    radiiX: [20.8, 20.8, 20.8, 20.8],
    radiiY: [20.8, 20.8, 20.8, 20.8],
  });
});

test("falls back to unscaled frame geometry when the layout scale is invalid", () => {
  const frame = resolveScaledFrameGeometry(
    {
      topLeft: "12px",
      topRight: "12px",
      bottomRight: "12px",
      bottomLeft: "12px",
    },
    100,
    40,
    "missing",
  );

  assert.deepEqual(frame, {
    halfWidth: 50,
    halfHeight: 20,
    radiiX: [12, 12, 12, 12],
    radiiY: [12, 12, 12, 12],
  });
});

test("maps screen offsets back into a rotated frame's local coordinates", () => {
  const transform = parseCssTransform("matrix(0, 1, -1, 0, 0, 0)");
  const inverse = invertLinearTransform(transform);
  const local = transformScreenOffsetToLocal(inverse, -5, 10);

  assert.deepEqual(local, { x: 10, y: 5 });
});

test("falls back to an identity transform when CSS supplies no matrix", () => {
  const transform = parseCssTransform("none");
  const inverse = invertLinearTransform(transform);

  assert.deepEqual(transform, { a: 1, b: 0, c: 0, d: 1 });
  assert.deepEqual(inverse, [1, 0, 0, 1]);
});

test("uses stronger configured tuning for highlighted image and button frames", () => {
  assert.equal(typeof geometry.resolveSpecularTuning, "function");
  assert.deepEqual(geometry.resolveSpecularTuning("1.6", "1.3"), {
    thickness: 1.6,
    strength: 1.3,
  });
});

test("falls back when specular tuning values are missing or invalid", () => {
  assert.equal(typeof geometry.resolveSpecularTuning, "function");
  assert.deepEqual(geometry.resolveSpecularTuning("", "not-a-number"), {
    thickness: 1,
    strength: 1,
  });
});
