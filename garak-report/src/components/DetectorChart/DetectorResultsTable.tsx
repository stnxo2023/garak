/**
 * @file DetectorResultsTable.tsx
 * @description Table showing detector results with DEFCON badges and stacked progress bars.
 * @module components/DetectorChart
 *
 * @copyright NVIDIA Corporation 2023-2026
 * @license Apache-2.0
 */

import { Divider, Flex, Stack, Text, Tooltip } from "@kui/react";
import type { Detector } from "../../types/ProbesChart";
import DefconBadge from "../DefconBadge";

/** Props for DetectorResultsTable component */
interface DetectorResultsTableProps {
  /** Detectors to display in the table */
  detectors: Detector[];
  /** Currently hovered detector name (for linked highlighting) */
  hoveredDetector?: string | null;
  /** Callback when detector is hovered */
  onHoverDetector?: (name: string | null) => void;
}

/**
 * Table displaying detector results with DEFCON severity and stacked progress bars.
 * Green = passed, Red = failed. All on single line per detector.
 *
 * @param props - Component props
 * @returns Results table with detector metrics and progress visualization
 */
const DetectorResultsTable = ({
  detectors,
  hoveredDetector,
  onHoverDetector,
}: DetectorResultsTableProps) => {
  return (
    <Stack gap="density-lg">
      <Flex align="center" gap="density-xxs">
        <Text kind="title/sm">Detector Breakdown</Text>
        <Divider />
      </Flex>
      <Stack gap="density-md">
        {detectors.map((detector) => {
          const isHovered = hoveredDetector === detector.detector_name;
          const isFaded = hoveredDetector !== null && !isHovered;
          
          // Use backend data directly - hit_count IS the failure count
          const total = detector.total_evaluated ?? detector.attempt_count ?? 0;
          const failed = detector.hit_count ?? 0;  // Backend provides this directly
          const passed = detector.passed ?? (total - failed);  // Fallback only if passed not provided
          
          // Percentages for progress bar visualization (presentation only)
          const passedPercent = total > 0 ? (passed / total) * 100 : 0;
          const failedPercent = total > 0 ? (failed / total) * 100 : 0;

          return (
            <Flex
              key={detector.detector_name}
              align="center"
              gap="density-md"
              onMouseEnter={() => onHoverDetector?.(detector.detector_name)}
              onMouseLeave={() => onHoverDetector?.(null)}
              style={{
                opacity: isFaded ? 0.3 : 1,
                transition: "opacity 0.15s ease",
                cursor: "pointer",
              }}
            >
              {/* DEFCON badge - fixed width */}
              <div style={{ width: "52px", flexShrink: 0 }}>
                <DefconBadge defcon={detector.detector_defcon} />
              </div>

              {/* Detector name - mono font for technical identifier */}
              <Text
                kind="mono/sm"
                style={{
                  width: "280px",
                  flexShrink: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "var(--color-tk-700)",
                }}
                title={detector.detector_name}
              >
                {detector.detector_name}
              </Text>

              {/* Stacked progress bar with tooltip */}
              <Tooltip
                slotContent={
                  <Stack gap="density-xxs">
                    <Text kind="body/bold/sm">{detector.detector_name}</Text>
                    <Text kind="body/regular/sm">
                      <span style={{ color: "var(--color-green-400)" }}>{passed} passed</span>
                      {" · "}
                      <span style={{ color: "var(--color-red-400)" }}>{failed} failed</span>
                      {" · "}
                      {total} total
                    </Text>
                    <Text kind="body/regular/sm">
                      Pass rate: {passedPercent.toFixed(1)}%
                    </Text>
                  </Stack>
                }
              >
                <div
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    height: "8px",
                    borderRadius: "4px",
                    overflow: "hidden",
                    backgroundColor: "var(--color-tk-200)",
                    cursor: "help",
                    display: "flex",
                  }}
                >
                  {/* Green (passed) portion - KUI green */}
                  {passedPercent > 0 && (
                    <div
                      style={{
                        width: `${passedPercent}%`,
                        height: "100%",
                        backgroundColor: "var(--color-green-500)",
                      }}
                    />
                  )}
                  {/* Red (failed) portion - KUI red */}
                  {failedPercent > 0 && (
                    <div
                      style={{
                        width: `${failedPercent}%`,
                        height: "100%",
                        backgroundColor: "var(--color-red-500)",
                      }}
                    />
                  )}
                </div>
              </Tooltip>

              {/* Counts: passed/total and percentage - mono for alignment */}
              <Flex align="center" gap="density-sm" style={{ flexShrink: 0 }}>
                <Text kind="mono/sm" style={{ color: "var(--color-tk-500)" }}>
                  <span style={{ color: "var(--color-green-500)" }}>{passed}</span>
                  <span style={{ color: "var(--color-tk-400)" }}> / {total}</span>
                </Text>
                <Text kind="mono/sm" style={{ color: "var(--color-tk-400)", width: "40px", textAlign: "right" }}>
                  {passedPercent.toFixed(0)}%
                </Text>
              </Flex>
            </Flex>
          );
        })}
      </Stack>
    </Stack>
  );
};

export default DetectorResultsTable;
