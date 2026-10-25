import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface HeaderProps {
  badgeText?: string;
  badgeColor?: string;
  category?: string;
  mainTitle?: string;
  subTitle?: string;
}

export const TypographyHeader: React.FC<HeaderProps> = ({
  badgeText = "Problem #221",
  badgeColor = "#0284c7",
  category = "QUY HOẠCH ĐỘNG 2D",
  mainTitle = "MAXIMAL",
  subTitle = "Square",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rawWhip = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 240, mass: 0.5 },
  });
  const whip = frame === 0 ? 1 : rawWhip;

  const scanProgress =
    frame === 0
      ? 100
      : interpolate(frame, [0, 25], [0, 100], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const totalChars = (mainTitle?.length || 0) + (subTitle?.length || 0);
  const mainFontSize =
    totalChars <= 18
      ? 52
      : totalChars <= 24
      ? 45
      : totalChars <= 30
      ? 39
      : 34;
  const subFontSize = mainFontSize + 2;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "1020px",
        padding: "22px 24px 6px",
        boxSizing: "border-box",
        transform: `translateY(${interpolate(whip, [0, 1], [-40, 0])}px) scale(${whip})`,
        zIndex: 10,
      }}
    >
      {/* Top Brand Badges */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          marginBottom: "8px",
          maxWidth: "990px",
        }}
      >
        <div
          style={{
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "5px 14px",
            borderRadius: "6px 14px 6px 14px",
            fontSize: "13px",
            fontWeight: 800,
            letterSpacing: "0.06em",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#38bdf8" }}>▲</span>
          <span>Leetcode Mô Phỏng · {badgeText}</span>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            color: badgeColor,
            border: `2px solid ${badgeColor}`,
            padding: "3px 12px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 800,
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "520px",
          }}
        >
          {category}
        </div>
      </div>

      {/* Title: Contrast between Heavy Bold 900 & Light Italic Serif 300 */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "center",
          gap: "14px",
          position: "relative",
          maxWidth: "990px",
          whiteSpace: "nowrap",
        }}
      >
        <h1
          style={{
            fontSize: `${mainFontSize}px`,
            fontWeight: 900,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: "#0f172a",
            margin: 0,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {mainTitle}
        </h1>

        <span
          style={{
            fontSize: `${subFontSize}px`,
            fontWeight: 400,
            fontStyle: "italic",
            fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif',
            color: "#0284c7",
            margin: 0,
            letterSpacing: "-0.01em",
            position: "relative",
            whiteSpace: "nowrap",
          }}
        >
          {subTitle}
        </span>
      </div>

      {/* Dynamic Animated Underline */}
      <div
        style={{
          width: "200px",
          height: "4px",
          backgroundColor: "#e2e8f0",
          borderRadius: "2px",
          marginTop: "8px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${scanProgress}%`,
            height: "100%",
            backgroundColor: "#0284c7",
            borderRadius: "2px",
          }}
        />
      </div>
    </div>
  );
};
