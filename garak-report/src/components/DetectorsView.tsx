/**
 * @file DetectorsView.tsx
 * @description Panel component displaying detector comparison for a selected probe.
 *              Shows Z-score lollipop chart and results table for detectors within the probe.
 * @module components
 *
 * @copyright NVIDIA Corporation 2023-2026
 * @license Apache-2.0
 */

import type { Probe } from "../types/ProbesChart";
import { Stack, Panel } from "@kui/react";
import { DetectorChartHeader, DetectorLollipopChart } from "./DetectorChart";
import DetectorResultsTable from "./DetectorChart/DetectorResultsTable";

/**
 * Panel displaying detector comparison for a selected probe.
 * Shows Z-score lollipop chart comparing detectors, plus a results table.
 *
 * @param props - Component props
 * @param props.probe - Selected probe to show detectors for
 * @param props.isDark - Theme mode for chart styling
 * @returns Detector comparison panel with chart and table
 */
const DetectorsView = ({
  probe,
  isDark,
}: {
  probe: Probe;
  isDark?: boolean;
}) => {
  // Sort detectors alphabetically by name
  const sortedDetectors = [...probe.detectors].sort((a, b) =>
    a.detector_name.localeCompare(b.detector_name)
  );

  return (
    <Panel slotHeading={<DetectorChartHeader />}>
      <Stack gap="density-xl">
        {/* Z-Score Lollipop Chart */}
        <DetectorLollipopChart
          probe={probe}
          detectors={sortedDetectors}
          isDark={isDark}
        />

        {/* Results Table */}
        <DetectorResultsTable detectors={sortedDetectors} />
      </Stack>
    </Panel>
  );
};

export default DetectorsView;
