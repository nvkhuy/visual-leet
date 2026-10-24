import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export interface ThumbnailFrameProps {
  /** Official LeetCode problem number/code, e.g. 206, "206", or "#206" -> displayed in English as "LEETCODE #206" */
  problemNumber: string | number;
  /** Official English problem title on LeetCode, e.g. "Reverse Linked List" */
  problemTitle: string;
  /** Official English difficulty level on LeetCode */
  difficulty?: "Easy" | "Medium" | "Hard";
  /** Algorithm pattern or topic tag, e.g. "Two Pointers · In-Place" or "Dynamic Programming" */
  algorithmTag?: string;
  /** Optimal time complexity, e.g. "O(N)" */
  timeComplexity?: string;
  /** Optimal space complexity, e.g. "O(1)" */
  spaceComplexity?: string;
  /** Primary accent color */
  accentColor?: string;
  /** If true (default), only renders at frame === 0 as the video's first-frame thumbnail */
  onlyFirstFrame?: boolean;
  /** Optional custom problem illustration / diagram preview rendered inside the thumbnail card */
  children?: React.ReactNode;
}

const DIFFICULTY_STYLES: Record<
  "Easy" | "Medium" | "Hard",
  { bg: string; text: string; border: string; label: string }
> = {
  Easy: {
    bg: "#dcfce7",
    text: "#15803d",
    border: "#16a34a",
    label: "EASY",
  },
  Medium: {
    bg: "#fef3c7",
    text: "#b45309",
    border: "#d97706",
    label: "MEDIUM",
  },
  Hard: {
    bg: "#fee2e2",
    text: "#b91c1c",
    border: "#dc2626",
    label: "HARD",
  },
};

export const ThumbnailFrame: React.FC<ThumbnailFrameProps> = ({
  problemNumber,
  problemTitle,
  difficulty = "Medium",
  algorithmTag = "Optimal Algorithm & Step-by-Step Trace",
  timeComplexity = "O(N)",
  spaceComplexity = "O(1)",
  accentColor = "#0284c7",
  onlyFirstFrame = true,
  children,
}) => {
  const frame = useCurrentFrame();

  if (onlyFirstFrame && frame !== 0) {
    return null;
  }

  const normalizedCode = String(problemNumber)
    .trim()
    .replace(/^(leetcode\s*|problem\s*)?#?/i, "");

  const words = problemTitle.trim().split(/\s+/);
  const hasMultipleWords = words.length > 1;
  const mainWords = hasMultipleWords
    ? words.slice(0, -1).join(" ")
    : problemTitle;
  const accentWord = hasMultipleWords ? words[words.length - 1] : "";

  const diffStyle = DIFFICULTY_STYLES[difficulty] ?? DIFFICULTY_STYLES.Medium;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f8fafc",
        backgroundImage: `
          radial-gradient(#cbd5e1 1.6px, transparent 1.6px)
        `,
        backgroundSize: "28px 28px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "56px 54px 48px",
        zIndex: 9999,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Top Channel Branding Header: "Leetcode Mô Phỏng" */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "16px 34px",
            borderRadius: "24px 8px 24px 8px",
            border: "3px solid #0f172a",
            boxShadow: `6px 6px 0px ${accentColor}`,
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <span
            style={{
              color: "#38bdf8",
              fontSize: "30px",
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            ▲
          </span>
          <span
            style={{
              fontSize: "30px",
              fontWeight: 900,
              letterSpacing: "0.04em",
              color: "#ffffff",
            }}
          >
            Leetcode Mô Phỏng
          </span>
        </div>
      </div>

      {/* Center Hero Thumbnail Card: English LeetCode Code & Title */}
      <div
        style={{
          width: "100%",
          backgroundColor: "#ffffff",
          borderRadius: "36px 14px 36px 14px",
          border: "4px solid #0f172a",
          boxShadow: "12px 12px 0px #0f172a",
          padding: "48px 46px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "28px",
          position: "relative",
        }}
      >
        {/* Problem Code (English) + Difficulty Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFE600",
              color: "#0f172a",
              padding: "10px 26px",
              borderRadius: "14px 6px 14px 6px",
              border: "3px solid #0f172a",
              boxShadow: "4px 4px 0px #0f172a",
              fontSize: "28px",
              fontWeight: 900,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            LEETCODE #{normalizedCode}
          </div>

          <div
            style={{
              backgroundColor: diffStyle.bg,
              color: diffStyle.text,
              border: `3px solid ${diffStyle.border}`,
              padding: "10px 22px",
              borderRadius: "999px",
              fontSize: "24px",
              fontWeight: 900,
              letterSpacing: "0.08em",
            }}
          >
            {diffStyle.label}
          </div>
        </div>

        {/* English Problem Title on LeetCode */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            maxWidth: "900px",
          }}
        >
          <h1
            style={{
              fontSize: problemTitle.length > 24 ? "68px" : "80px",
              fontWeight: 900,
              color: "#0f172a",
              margin: 0,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
            }}
          >
            {mainWords}
          </h1>

          {accentWord && (
            <span
              style={{
                fontSize: problemTitle.length > 24 ? "72px" : "84px",
                fontWeight: 400,
                fontStyle: "italic",
                fontFamily:
                  '"Playfair Display", Georgia, "Times New Roman", serif',
                color: accentColor,
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
              }}
            >
              {accentWord}
            </span>
          )}

          {/* Accent bar */}
          <div
            style={{
              width: "220px",
              height: "8px",
              backgroundColor: accentColor,
              borderRadius: "4px",
              marginTop: "12px",
            }}
          />
        </div>

        {/* Algorithm Tag Pill */}
        {algorithmTag && (
          <div
            style={{
              backgroundColor: "#f1f5f9",
              color: "#0f172a",
              border: "2.5px solid #0f172a",
              borderRadius: "16px",
              padding: "12px 26px",
              fontSize: "24px",
              fontWeight: 800,
              letterSpacing: "0.02em",
            }}
          >
            {algorithmTag}
          </div>
        )}

        {/* Custom Visual Preview Slot OR Default Complexity Cards */}
        {children ? (
          <div
            style={{
              width: "100%",
              marginTop: "8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {children}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              width: "100%",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                flex: 1,
                backgroundColor: "#f0f9ff",
                border: "3px solid #0284c7",
                borderRadius: "20px 8px 20px 8px",
                padding: "18px 20px",
                boxShadow: "4px 4px 0px #0f172a",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#0369a1",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                TIME COMPLEXITY
              </div>
              <div
                style={{
                  fontSize: "38px",
                  fontWeight: 900,
                  color: "#0f172a",
                  marginTop: "4px",
                }}
              >
                {timeComplexity}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                backgroundColor: "#f0fdf4",
                border: "3px solid #16a34a",
                borderRadius: "20px 8px 20px 8px",
                padding: "18px 20px",
                boxShadow: "4px 4px 0px #0f172a",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#15803d",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                SPACE COMPLEXITY
              </div>
              <div
                style={{
                  fontSize: "38px",
                  fontWeight: 900,
                  color: "#0f172a",
                  marginTop: "4px",
                }}
              >
                {spaceComplexity}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Watermark / Channel Signature */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "0 8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "20px",
            fontWeight: 800,
            color: "#475569",
          }}
        >
          <span style={{ color: accentColor, fontWeight: 900 }}>●</span>
          <span>STEP-BY-STEP VISUAL SIMULATION</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: 0.45,
          }}
        >
          <span
            style={{ color: "#0284c7", fontSize: "18px", fontWeight: 900 }}
          >
            ▲
          </span>
          <span
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "0.04em",
            }}
          >
            Leetcode mô phỏng
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
