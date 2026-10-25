import React from "react";
import { Composition } from "remotion";
import {
  NumberOfIslandsVideo,
  TOTAL_FRAMES as NOI_TOTAL_FRAMES,
} from "./problems/number-of-islands/video/NumberOfIslandsVideo";
import {
  TwoSumIIVideo,
  TOTAL_FRAMES as TS2_TOTAL_FRAMES,
} from "./problems/two-sum-ii-input-array-is-sorted/video/TwoSumIIVideo";

/**
 * Remotion Root Composition Registry.
 * Registers 4:5 (1080x1350) dynamic-duration compositions for each LeetCode problem.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="NumberOfIslands"
        component={NumberOfIslandsVideo}
        durationInFrames={NOI_TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1350}
      />
      <Composition
        id="TwoSumIIInputArrayIsSorted"
        component={TwoSumIIVideo}
        durationInFrames={TS2_TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1350}
      />
    </>
  );
};
