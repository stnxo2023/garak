/**
 * @file useProbeTooltip.ts
 * @description Hook to generate rich HTML tooltips for probe bar chart interactions.
 * @module hooks
 *
 * @copyright NVIDIA Corporation 2023-2026
 * @license Apache-2.0
 */

import { useCallback } from "react";
import type { Probe } from "../types/ProbesChart";
import type { EChartsTooltipParams } from "../types/echarts.d";
import { formatPercentage } from "../utils/formatPercentage";

/**
 * Generates rich HTML tooltips for probe bar chart hover interactions.
 *
 * Tooltips display:
 * - Probe name and score percentage
 * - Severity level with visual color indicator
 * - DEFCON level
 * - Number of detectors
 *
 * @param probesData - Array of enriched probe data with labels and colors
 * @returns Formatter function that ECharts calls on hover
 */
export function useProbeTooltip(
  probesData: (Probe & {
    label: string;
    value: number;
    color: string;
    severity?: number;
    severityLabel?: string;
  })[]
) {
  return useCallback(
    (params: EChartsTooltipParams): string => {
      const item = probesData.find(p => p.label === params.name);

      const severityColor = item?.color ?? "#999";
      const severityText = item?.severityLabel ?? "Unknown";

      // Map severity to DEFCON (severity is essentially the same as DEFCON level)
      const defcon = item?.severity;
      const defconLine = defcon != null ? `<br/>DEFCON: <strong>DC-${defcon}</strong>` : "";

      const value = typeof params.value === "number" ? params.value : 0;

      return `
        <strong>${params.name}</strong><br/>
        Score: ${formatPercentage(value)}<br/>
        Severity: <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${severityColor}; margin-right: 6px; vertical-align: middle;"></span><span style="font-weight: 600">${severityText}</span>${defconLine}
        <br/>Detectors: ${item?.detectors.length ?? 0}
      `;
    },
    [probesData]
  );
}
