export type SpecularMotionState = {
  angle: number;
  brightness: number;
  speed: number;
};

export type SpecularMotionInput = {
  dt: number;
  proximity: number;
  targetAngle?: number;
};

const TAU = Math.PI * 2;
const IDLE_BRIGHTNESS = 0.32;
const ACTIVE_BRIGHTNESS = 0.94;
const IDLE_SPEED = TAU / 28;
const ACTIVE_SPEED = 0.92;
const MAX_FRAME_TIME = 0.1;
const MAX_STEER_RATE = 1.1;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function approach(current: number, target: number, response: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-response * dt));
}

function shortestAngleDifference(target: number, current: number) {
  return Math.atan2(Math.sin(target - current), Math.cos(target - current));
}

export function createSpecularMotionState(angle: number): SpecularMotionState {
  return {
    angle,
    brightness: 0,
    speed: 0,
  };
}

export function advanceSpecularMotion(
  state: SpecularMotionState,
  input: SpecularMotionInput,
): SpecularMotionState {
  const dt = Math.min(MAX_FRAME_TIME, Math.max(0, input.dt));
  const proximity = clamp01(input.proximity);
  const targetBrightness =
    IDLE_BRIGHTNESS + (ACTIVE_BRIGHTNESS - IDLE_BRIGHTNESS) * proximity;
  const targetSpeed = IDLE_SPEED + (ACTIVE_SPEED - IDLE_SPEED) * proximity;
  const brightness = approach(state.brightness, targetBrightness, 12, dt);
  const speed = approach(state.speed, targetSpeed, 5, dt);
  let angle = state.angle + speed * dt;

  if (typeof input.targetAngle === "number" && proximity > 0) {
    const difference = shortestAngleDifference(input.targetAngle, angle);
    const requestedSteer = difference * (1 - Math.exp(-3 * dt)) * proximity;
    const maximumSteer = Math.min(
      MAX_STEER_RATE * dt * proximity,
      speed * dt * 0.65,
    );
    angle += Math.min(maximumSteer, Math.max(-maximumSteer, requestedSteer));
  }

  return { angle, brightness, speed };
}
