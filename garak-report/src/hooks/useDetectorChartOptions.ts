/**
 * @file useDetectorChartOptions.ts
 * @description Hook to build ECharts options for detector lollipop chart.
 *              Displays Z-score comparison across detectors within a single probe.
 * @module hooks
 *
 * @copyright NVIDIA Corporation 2023-2026
 * @license Apache-2.0
 */

import { useMemo } from "react";
import type { Detector } from "../types/ProbesChart";
import { useTooltipFormatter } from "./useTooltipFormatter";
import useSeverityColor from "./useSeverityColor";
import {
  THEME_COLORS,
  CHART_DIMENSIONS,
  CHART_SYMBOL_SIZES,
  CHART_LINE_WIDTHS,
} from "../constants";

/** Return type for detector chart options hook */
export interface DetectorChartOptionsResult {
  /** ECharts option configuration */
  option: Record<string, unknown>;
  /** Chart height based on number of detectors */
  chartHeight: number;
  /** Whether there is data to display */
  hasData: boolean;
}

/** Internal chart data structure */
interface ChartDetectorData {
  name: string;
  zscore: number | null;
  detector_score: number | null;
  comment: string;
  color: string;
  defcon: number;
  total: number;
  failed: number;
}

/**
 * Builds ECharts options for detector lollipop chart visualization.
 * Shows Z-score comparison across detectors within a single probe.
 *
 * @param detectors - Detectors from the selected probe
 * @param isDark - Whether dark theme is active
 * @returns Chart options, height, and data availability flag
 */
export function useDetectorChartOptions(
  detectors: Detector[],
  isDark?: boolean
): DetectorChartOptionsResult {
  const formatTooltip = useTooltipFormatter();
  const { getSeverityColorByComment, getDefconColor } = useSeverityColor();
  const textColor = isDark ? THEME_COLORS.text.dark : THEME_COLORS.text.light;

  // Convert detectors to chart data format
  const chartData = useMemo<ChartDetectorData[]>(() => {
    return detectors.map((d) => {
      const zscore = d.relative_score;
      const zscoreIsValid = zscore != null && typeof zscore === "number" && !isNaN(zscore);
      const total = d.total_evaluated ?? d.attempt_count ?? 0;
      const passed = d.passed ?? (total - (d.hit_count ?? 0));
      const failed = total - passed;

      return {
        name: d.detector_name,
        zscore: zscoreIsValid ? zscore : null,
        detector_score: d.absolute_score != null ? d.absolute_score * 100 : null,
        comment: d.relative_comment ?? "Unknown",
        color: zscoreIsValid
          ? getSeverityColorByComment(d.relative_comment ?? "")
          : "#999999", // Gray for unavailable
        defcon: d.detector_defcon ?? 5,
        total,
        failed,
      };
    }).sort((a, b) => b.name.localeCompare(a.name)); // Reverse alpha for A at bottom
  }, [detectors, getSeverityColorByComment]);

  // Check if we have any valid data
  const hasData = chartData.some((d) => d.zscore !== null);

  // Build Y-axis labels with counts
  const yAxisLabels = useMemo(
    () =>
      chartData.map((d) => {
        if (d.total > 0) {
          return `${d.name} (${d.failed}/${d.total})`;
        }
        return d.name;
      }),
    [chartData]
  );

  // Build series data
  const { pointData, lineData } = useMemo(() => {
    const points: unknown[] = [];
    const lines: unknown[] = [];

    chartData.forEach((d, index) => {
      if (d.zscore === null) return;

      // Point (dot at the end of lollipop)
      points.push({
        value: [d.zscore, index],
        name: d.name,
        zscore: d.zscore,
        detector_score: d.detector_score,
        comment: d.comment,
        itemStyle: {
          color: d.color,
          borderWidth: 2,
          borderColor: getDefconColor(d.defcon),
        },
        symbolSize: CHART_SYMBOL_SIZES.normal,
      });

      // Line (stem from 0 to value)
      lines.push({
        value: [d.zscore, index, d.color],
        name: d.name,
        zscore: d.zscore,
        detector_score: d.detector_score,
        comment: d.comment,
        lineStyle: {
          width: CHART_LINE_WIDTHS.normal,
          color: d.color,
        },
      });
    });

    return { pointData: points, lineData: lines };
  }, [chartData, getDefconColor]);

  // Build chart option
  const option = useMemo(
    () => ({
      grid: {
        containLabel: CHART_DIMENSIONS.detectorGrid.containLabel,
        left: CHART_DIMENSIONS.detectorGrid.left,
        right: CHART_DIMENSIONS.detectorGrid.right,
        top: CHART_DIMENSIONS.detectorGrid.top,
        bottom: CHART_DIMENSIONS.detectorGrid.bottom,
      },
      tooltip: {
        trigger: "item",
        formatter: (params: { data: { name: string; zscore: number | null; detector_score: number | null; comment: string | null } }) =>
          formatTooltip({ data: { ...params.data, detector_score: params.data.detector_score ?? undefined, comment: params.data.comment ?? undefined }, detectorType: params.data.name }),
        confine: true,
      },
      xAxis: {
        type: "value",
        min: CHART_DIMENSIONS.zscore.min,
        max: CHART_DIMENSIONS.zscore.max,
        nameTextStyle: { color: textColor },
        axisLabel: { color: textColor },
        axisLine: { lineStyle: { color: textColor } },
        splitLine: {
          lineStyle: {
            color: isDark ? THEME_COLORS.chart.splitLine.dark : THEME_COLORS.chart.splitLine.light,
          },
        },
      },
      yAxis: {
        type: "category",
        data: yAxisLabels,
        axisLabel: {
          fontSize: CHART_DIMENSIONS.axis.fontSize,
          color: textColor,
          rich: {
            // Defcon-colored styles for labels
            dc1: { fontWeight: "bold", color: getDefconColor(1) },
            dc2: { fontWeight: "bold", color: getDefconColor(2) },
            dc3: { fontWeight: "bold", color: getDefconColor(3) },
            dc4: { fontWeight: "bold", color: getDefconColor(4) },
            dc5: { fontWeight: "bold", color: getDefconColor(5) },
          },
          formatter: (value: string, index: number) => {
            const detector = chartData[index];
            if (!detector) return value;
            const defcon = detector.defcon;
            return `{dc${defcon}|${value}}`;
          },
        },
        axisLine: { lineStyle: { color: textColor } },
      },
      series: [
        // Line series (stems)
        {
          type: "custom",
          renderItem: (
            _params: { coordSys: { x: number; width: number } },
            api: {
              value: (dim: number) => number;
              coord: (val: [number, number]) => [number, number];
              style: () => Record<string, unknown>;
            }
          ) => {
            const xValue = api.value(0);
            const yValue = api.value(1);
            const start = api.coord([0, yValue]);
            const end = api.coord([xValue, yValue]);

            return {
              type: "line",
              shape: {
                x1: start[0],
                y1: start[1],
                x2: end[0],
                y2: end[1],
              },
              style: api.style(),
            };
          },
          encode: { x: 0, y: 1 },
          data: lineData,
        },
        // Point series (dots)
        {
          type: "scatter",
          symbolSize: CHART_SYMBOL_SIZES.normal,
          data: pointData,
        },
      ],
    }),
    [chartData, yAxisLabels, pointData, lineData, formatTooltip, getDefconColor, textColor, isDark]
  );

  const chartHeight = Math.max(
    CHART_DIMENSIONS.detector.minHeight,
    CHART_DIMENSIONS.detector.rowHeight * chartData.length + CHART_DIMENSIONS.detector.extraSpace
  );

  return { option, chartHeight, hasData };
}
