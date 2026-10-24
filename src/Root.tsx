import React from "react";
import { Composition } from "remotion";
import { MaximalSquareVideo } from "./problems/maximal-square/video/MaximalSquareVideo";

/**
 * Remotion Root Composition Registry.
 * Registers 4:5 (1080x1350) dynamic-duration compositions for each LeetCode problem.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MaximalSquare"
        component={MaximalSquareVideo}
        durationInFrames={2156}
        fps={30}
        width={1080}
        height={1350}
      />
    </>
  );
};
