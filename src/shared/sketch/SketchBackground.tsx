import React from "react";
import { AbsoluteFill } from "remotion";

export const SketchBackground: React.FC = () => {
  return (
    <>
      <AbsoluteFill
        style={{
          backgroundColor: "#ffffff",
          backgroundImage: `
            radial-gradient(#cbd5e1 1.2px, transparent 1.2px)
          `,
          backgroundSize: "28px 28px",
          zIndex: 0,
        }}
      />
      {/* Anti-theft subtle corner watermark */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "26px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          opacity: 0.28,
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 200,
        }}
      >
        <span style={{ color: "#0284c7", fontSize: "15px", fontWeight: 900 }}>▲</span>
        <span
          style={{
            fontSize: "17px",
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "0.04em",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Leetcode mô phỏng
        </span>
      </div>
    </>
  );
};
