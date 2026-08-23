import assert from "node:assert/strict";
import test from "node:test";

import {
  advanceSpecularMotion,
  createSpecularMotionState,
} from "../app/components/specular-motion.ts";

test("idle motion keeps the highlight moving with a visible baseline", () => {
  const next = advanceSpecularMotion(
    createSpecularMotionState(0),
    { dt: 1, proximity: 0 },
  );

  assert.ok(next.angle > 0, "idle motion should advance around the frame");
  assert.ok(next.brightness >= 0.2, "idle highlight should remain visible");
});

test("pointer proximity makes the highlight faster", () => {
  let idle = createSpecularMotionState(0);
  let near = createSpecularMotionState(0);

  for (let frame = 0; frame < 60; frame += 1) {
    idle = advanceSpecularMotion(idle, { dt: 1 / 60, proximity: 0 });
    near = advanceSpecularMotion(near, { dt: 1 / 60, proximity: 1 });
  }

  assert.ok(near.speed > idle.speed * 2);
});

test("pointer proximity makes the highlight brighter", () => {
  let idle = createSpecularMotionState(0);
  let near = createSpecularMotionState(0);

  for (let frame = 0; frame < 60; frame += 1) {
    idle = advanceSpecularMotion(idle, { dt: 1 / 60, proximity: 0 });
    near = advanceSpecularMotion(near, { dt: 1 / 60, proximity: 1 });
  }

  assert.ok(near.brightness > idle.brightness + 0.35);
});

test("pointer steering crosses the angle seam by the shortest route", () => {
  const state = {
    ...createSpecularMotionState(3.12),
    brightness: 0.7,
    speed: 0.25,
  };
  const next = advanceSpecularMotion(state, {
    dt: 1 / 60,
    proximity: 1,
    targetAngle: -3.12,
  });

  assert.ok(next.angle > state.angle, "steering should move forward across the seam");
});

test("pointer steering keeps the shortest route after many autonomous orbits", () => {
  const angle = Math.PI * 8 - 0.25;
  const state = {
    ...createSpecularMotionState(angle),
    brightness: 0.7,
    speed: 0.92,
  };
  const unsteered = advanceSpecularMotion(state, {
    dt: 1 / 60,
    proximity: 1,
  });
  const steered = advanceSpecularMotion(state, {
    dt: 1 / 60,
    proximity: 1,
    targetAngle: 0,
  });

  assert.ok(
    steered.angle > unsteered.angle,
    "zero lies just ahead after wrapping four full orbits",
  );
});

test("pointer steering cannot jump abruptly in one frame", () => {
  const state = {
    ...createSpecularMotionState(0),
    brightness: 0.7,
    speed: 0.25,
  };
  const next = advanceSpecularMotion(state, {
    dt: 0.05,
    proximity: 1,
    targetAngle: Math.PI,
  });

  assert.ok(Math.abs(next.angle - state.angle) <= 0.08);
});

test("a stationary nearby pointer cannot stop the autonomous orbit", () => {
  let state = createSpecularMotionState(0);

  for (let frame = 0; frame < 180; frame += 1) {
    state = advanceSpecularMotion(state, {
      dt: 1 / 60,
      proximity: 1,
      targetAngle: 0,
    });
  }
  const settledAngle = state.angle;

  for (let frame = 0; frame < 30; frame += 1) {
    state = advanceSpecularMotion(state, {
      dt: 1 / 60,
      proximity: 1,
      targetAngle: 0,
    });
  }

  assert.ok(state.angle - settledAngle > 0.1);
});
