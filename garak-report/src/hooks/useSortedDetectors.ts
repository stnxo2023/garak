/**
 * @file useSortedDetectors.ts
 * @description Hook to sort detectors by Z-score for ordered display.
 * @module hooks
 *
 * @copyright NVIDIA Corporation 2023-2026
 * @license Apache-2.0
 */

import type { Detector } from "../types/ProbesChart";

/**
 * Provides a function to sort detectors by Z-score (ascending).
 * Null/undefined Z-scores are sorted to the end.
 *
 * @returns Sort function for detector arrays
 */
export function useSortedDetectors() {
  return function sortDetectors(entries: Detector[]): Detector[] {
    return [...entries].sort((a, b) => {
      if (a.zscore == null) return 1;
      if (b.zscore == null) return -1;
      return a.zscore - b.zscore;
    });
  };
}
