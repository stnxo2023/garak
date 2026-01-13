/**
 * @file DetectorLollipopChart.tsx
 * @description Lollipop chart showing Z-score comparison across probes for a detector type.
 *              Displays horizontal lines from zero to Z-score value with dot endpoints.
 * @module components/DetectorChart
 *
 * @copyright NVIDIA Corporation 2023-2026
 * @license Apache-2.0
 */

import ReactECharts from "echarts-for-react";
import { Divider, Flex, Stack, StatusMessage, Text } from "@kui/react";
import type { Probe } from "../../types/ProbesChart";
import type { GroupedDetectorEntry } from "../../hooks/useGroupedDetectors";
import type { EChartsTooltipParams } from "../../types/echarts.d";
import { useDetectorChartOptions } from "../../hooks/useDetectorChartOptions";

/** Props for DetectorLollipopChart component */
interface DetectorLollipopChartProps {
  /** Currently selected probe */
  probe: Probe;
  /** All probes for cross-comparison */
  allProbes: Probe[];
  /** Detector type name being visualized */
  detectorType: string;
  /** Filtered detector entries to display */
  entries: GroupedDetectorEntry[];
  /** Whether to hide N/A entries */
  hideUnavailable: boolean;
  /** Callback when a probe is clicked */
  onProbeClick: (probe: Probe) => void;
  /** Theme mode for styling */
  isDark?: boolean;
}

/**
 * Lollipop chart comparing Z-scores across probes for a specific detector type.
 * Highlights the selected probe and handles click interactions for probe switching.
 *
 * @param props - Component props
 * @returns Lollipop chart with click handling, or empty state message
 */
const DetectorLollipopChart = ({
  probe,
  allProbes,
  detectorType,
  entries,
  hideUnavailable,
  onProbeClick,
  isDark,
}: DetectorLollipopChartProps) => {
  const { option, visible, chartHeight } = useDetectorChartOptions(
    probe,
    detectorType,
    entries,
    hideUnavailable,
    isDark
  );

  /**
   * Handles click events on chart elements or axis labels.
   */
  const handleClick = (params: EChartsTooltipParams) => {
    let clickedLabel = params.name;

    // Handle axis label clicks
    if (params.componentType === "yAxis") {
      clickedLabel = params.value as string;
      const match = clickedLabel.match(/^(.+?)\s*\(\d+\/\d+\)$/);
      if (match) {
        clickedLabel = match[1];
      }
    }

    const match = allProbes.find(p => p.probe_name.includes(clickedLabel));
    if (match) onProbeClick(match);
  };

  // Empty state - show when no entries or all entries are N/A
  if (visible.length === 0 || visible.every(d => d.zscore === null)) {
    return (
      <Flex paddingTop="density-2xl">
        <StatusMessage
          size="small"
          slotMedia={<i className="nv-icons-fill-warning"></i>}
          slotHeading="No Data Available"
          slotSubheading={
            <Stack gap="density-sm">
              <Text kind="label/regular/md">
                All detector results for this comparison are unavailable (N/A).
              </Text>
              <Text kind="label/regular/sm">
                Try unchecking "Hide N/A" to see unavailable entries, change DEFCON levels or select
                a different detector.
              </Text>
            </Stack>
          }
        />
      </Flex>
    );
  }

  return (
    <>
      {/* Chart header */}
      <Flex align="center" gap="density-xxs">
        <Text kind="mono/sm">{probe.probe_name}</Text>
        <Text kind="mono/sm">//</Text>
        <Text kind="title/sm">{detectorType}</Text>
        <Divider />
      </Flex>

      {/* Probe counts */}
      {(probe.summary?.prompt_count != null || probe.summary?.fail_count != null) && (
        <Flex gap="density-md" paddingTop="density-sm">
          {probe.summary.fail_count != null && (
            <Text kind="label/regular/sm">
              Failures: <strong>{probe.summary.fail_count}</strong>
            </Text>
          )}
          {probe.summary.prompt_count != null && (
            <Text kind="label/regular/sm">
              Prompts: <strong>{probe.summary.prompt_count}</strong>
            </Text>
          )}
        </Flex>
      )}

      {/* Chart */}
      <ReactECharts
        option={option}
        style={{ height: chartHeight }}
        onEvents={{ click: handleClick }}
      />
    </>
  );
};

export default DetectorLollipopChart;
