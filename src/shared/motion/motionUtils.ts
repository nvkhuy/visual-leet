import { interpolate, spring } from "remotion";

/**
 * Antigravity 2.0 Whip-in entrance with spring overshoot and plateau
 */
export function whipIn(
  frame: number,
  fps: number,
  delay: number = 0,
  yOffset: number = 50
) {
  const current = Math.max(0, frame - delay);
  const spr = spring({
    frame: current,
    fps,
    config: {
      damping: 11,
      stiffness: 240,
      mass: 0.5,
    },
  });

  return {
    opacity: interpolate(spr, [0, 0.4, 1], [0, 1, 1]),
    transform: `translateY(${interpolate(spr, [0, 1], [yOffset, 0])}px) scale(${interpolate(
      spr,
      [0, 1],
      [0.9, 1]
    )})`,
  };
}

/**
 * Horizontal Whip-In for side-by-side elements
 */
export function whipInX(
  frame: number,
  fps: number,
  delay: number = 0,
  xOffset: number = 60
) {
  const current = Math.max(0, frame - delay);
  const spr = spring({
    frame: current,
    fps,
    config: {
      damping: 11,
      stiffness: 240,
      mass: 0.5,
    },
  });

  return {
    opacity: interpolate(spr, [0, 0.4, 1], [0, 1, 1]),
    transform: `translateX(${interpolate(spr, [0, 1], [xOffset, 0])}px) scale(${interpolate(
      spr,
      [0, 1],
      [0.92, 1]
    )})`,
  };
}
