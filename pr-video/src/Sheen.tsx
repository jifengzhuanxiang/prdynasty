import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

// 产品的招牌"镜面流光"（specular 高光描边）的轻量复刻：
// 一道沿圆角边缘滑过的亮线，用 screen 混合提亮父层。一次性扫过。
export const Sheen: React.FC<{
  delay?: number;
  duration?: number;
  angle?: number;
  intensity?: number;
}> = ({ delay = 0, duration = 42, angle = -18, intensity = 0.85 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  const x = interpolate(t, [0, 1], [-70, 170]);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        borderRadius: "inherit",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-60%",
          bottom: "-60%",
          width: "42%",
          left: `${x}%`,
          transform: `rotate(${angle}deg)`,
          background:
            "linear-gradient(90deg, transparent, rgba(255,254,253," +
            intensity +
            "), transparent)",
          filter: "blur(7px)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
};
