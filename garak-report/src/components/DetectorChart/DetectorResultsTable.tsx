/**
 * @file DetectorResultsTable.tsx
 * @description Table showing detector results with DEFCON badges and pass/fail counts.
 * @module components/DetectorChart
 *
 * @copyright NVIDIA Corporation 2023-2026
 * @license Apache-2.0
 */

import { Flex, Text } from "@kui/react";
import type { Detector } from "../../types/ProbesChart";
import DefconBadge from "../DefconBadge";

/** Props for DetectorResultsTable component */
interface DetectorResultsTableProps {
  /** Detectors to display in the table */
  detectors: Detector[];
}

/**
 * Table displaying detector results with DEFCON severity and pass/fail counts.
 *
 * @param props - Component props
 * @returns Results table with detector metrics
 */
const DetectorResultsTable = ({ detectors }: DetectorResultsTableProps) => {
  return (
    <div>
      <Text kind="title/sm" style={{ marginBottom: "var(--density-md)" }}>
        Results
      </Text>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-tk-150)" }}>
            <th style={{ textAlign: "left", padding: "var(--density-sm) var(--density-md)", fontWeight: 500 }}>
              <Text kind="label/bold/sm">Detector</Text>
            </th>
            <th style={{ textAlign: "center", padding: "var(--density-sm) var(--density-md)", fontWeight: 500 }}>
              <Text kind="label/bold/sm">DEFCON</Text>
            </th>
            <th style={{ textAlign: "right", padding: "var(--density-sm) var(--density-md)", fontWeight: 500 }}>
              <Text kind="label/bold/sm">Passed</Text>
            </th>
            <th style={{ textAlign: "right", padding: "var(--density-sm) var(--density-md)", fontWeight: 500 }}>
              <Text kind="label/bold/sm">Failed</Text>
            </th>
            <th style={{ textAlign: "right", padding: "var(--density-sm) var(--density-md)", fontWeight: 500 }}>
              <Text kind="label/bold/sm">Total</Text>
            </th>
          </tr>
        </thead>
        <tbody>
          {detectors.map((detector) => {
            const total = detector.total_evaluated ?? detector.attempt_count ?? 0;
            const passed = detector.passed ?? (total - (detector.hit_count ?? 0));
            const failed = total - passed;

            return (
              <tr
                key={detector.detector_name}
                style={{ borderBottom: "1px solid var(--color-tk-100)" }}
              >
                <td style={{ padding: "var(--density-sm) var(--density-md)" }}>
                  <Text kind="body/regular/sm">{detector.detector_name}</Text>
                </td>
                <td style={{ padding: "var(--density-sm) var(--density-md)", textAlign: "center" }}>
                  <Flex justify="center">
                    <DefconBadge level={detector.detector_defcon} />
                  </Flex>
                </td>
                <td style={{ padding: "var(--density-sm) var(--density-md)", textAlign: "right" }}>
                  <Text kind="body/regular/sm" style={{ color: "var(--color-green-500)" }}>
                    {passed}
                  </Text>
                </td>
                <td style={{ padding: "var(--density-sm) var(--density-md)", textAlign: "right" }}>
                  <Text
                    kind="body/regular/sm"
                    style={{ color: failed > 0 ? "var(--color-red-500)" : "var(--color-tk-300)" }}
                  >
                    {failed}
                  </Text>
                </td>
                <td style={{ padding: "var(--density-sm) var(--density-md)", textAlign: "right" }}>
                  <Text kind="body/regular/sm">{total}</Text>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DetectorResultsTable;
