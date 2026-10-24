import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface PopupWord {
  from: number;
  to: number;
  text: string;
  color?: string;
  tilt?: number;
}

export const PopupCaption: React.FC<{
  segments: PopupWord[];
  bottom?: string;
}> = ({ segments, bottom = "110px" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Strictly MAX 1 word on screen at a time
  const currentSegment = segments?.find(
    (s) => frame >= s.from && frame < s.to
  );

  if (!currentSegment) return null;

  const segmentFrame = frame - currentSegment.from;
  const popSpring = spring({
    frame: segmentFrame,
    fps,
    config: {
      damping: 9,
      stiffness: 340,
      mass: 0.3,
    },
  });

  const scale = interpolate(popSpring, [0, 0.5, 1], [0.65, 1.14, 1]);
  const tilt = currentSegment.tilt ?? -2.5;
  const color = currentSegment.color ?? "#FFE600";

  const len = currentSegment.text.length;
  const fontSize = len > 7 ? "68px" : len > 5 ? "76px" : "84px";

  return (
    <div
      style={{
        position: "absolute",
        bottom,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        zIndex: 150,
      }}
    >
      <div
        style={{
          fontFamily:
            '"Montserrat", "Impact", "Arial Black", "Inter", -apple-system, sans-serif',
          fontSize,
          fontWeight: 900,
          color,
          textTransform: "uppercase",
          letterSpacing: "0.02em",
          textAlign: "center",
          lineHeight: "1.0",
          WebkitTextStroke: "4.5px #000000",
          paintOrder: "stroke fill",
          textShadow: `
            0px 8px 0px #000000,
            4px 6px 0px #000000,
            -4px 6px 0px #000000,
            0px 10px 22px rgba(0, 0, 0, 0.55)
          `,
          transform: `scale(${scale}) rotate(${tilt}deg)`,
          filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.4))",
          transformOrigin: "center center",
          display: "inline-block",
        }}
      >
        {currentSegment.text}
      </div>
    </div>
  );
};
