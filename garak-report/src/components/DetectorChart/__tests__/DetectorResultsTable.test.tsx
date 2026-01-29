/**
 * @file DetectorResultsTable.test.tsx
 * @description Tests for the DetectorResultsTable component.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DetectorResultsTable from "../DetectorResultsTable";
import type { Detector } from "../../../types/ProbesChart";

// Mock KUI components
vi.mock("@kui/react", () => ({
  Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

// Mock DefconBadge
vi.mock("../../DefconBadge", () => ({
  __esModule: true,
  default: ({ level }: { level: number }) => (
    <div data-testid="defcon-badge" data-level={level}>
      DC-{level}
    </div>
  ),
}));

const createMockDetector = (overrides: Partial<Detector> = {}): Detector => ({
  detector_name: "test.Detector",
  detector_descr: "Test detector",
  absolute_score: 0.9,
  absolute_defcon: 5,
  absolute_comment: "minimal risk",
  relative_score: 0.5,
  relative_defcon: 5,
  relative_comment: "average",
  detector_defcon: 5,
  calibration_used: true,
  total_evaluated: 100,
  passed: 90,
  ...overrides,
});

describe("DetectorResultsTable", () => {
  it("renders table headers", () => {
    render(<DetectorResultsTable detectors={[]} />);

    expect(screen.getByText("Detector")).toBeInTheDocument();
    expect(screen.getByText("DEFCON")).toBeInTheDocument();
    expect(screen.getByText("Passed")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  it("renders detector row with correct data", () => {
    const detectors = [
      createMockDetector({
        detector_name: "my.TestDetector",
        detector_defcon: 3,
        total_evaluated: 50,
        passed: 45,
      }),
    ];

    render(<DetectorResultsTable detectors={detectors} />);

    expect(screen.getByText("my.TestDetector")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument(); // passed
    expect(screen.getByText("5")).toBeInTheDocument(); // failed (50 - 45)
    expect(screen.getByText("50")).toBeInTheDocument(); // total
  });

  it("renders multiple detectors", () => {
    const detectors = [
      createMockDetector({ detector_name: "detector.One" }),
      createMockDetector({ detector_name: "detector.Two" }),
      createMockDetector({ detector_name: "detector.Three" }),
    ];

    render(<DetectorResultsTable detectors={detectors} />);

    expect(screen.getByText("detector.One")).toBeInTheDocument();
    expect(screen.getByText("detector.Two")).toBeInTheDocument();
    expect(screen.getByText("detector.Three")).toBeInTheDocument();
  });

  it("renders DEFCON badges for each detector", () => {
    const detectors = [
      createMockDetector({ detector_name: "d1", detector_defcon: 1 }),
      createMockDetector({ detector_name: "d2", detector_defcon: 5 }),
    ];

    render(<DetectorResultsTable detectors={detectors} />);

    const badges = screen.getAllByTestId("defcon-badge");
    expect(badges).toHaveLength(2);
    expect(badges[0]).toHaveAttribute("data-level", "1");
    expect(badges[1]).toHaveAttribute("data-level", "5");
  });

  it("handles zero failures correctly", () => {
    const detectors = [
      createMockDetector({
        detector_name: "perfect.Detector",
        total_evaluated: 100,
        passed: 100,
      }),
    ];

    render(<DetectorResultsTable detectors={detectors} />);

    // 100 appears twice: once for passed, once for total
    expect(screen.getAllByText("100")).toHaveLength(2);
    // 0 appears for failed count
    expect(screen.getAllByText("0")).toHaveLength(1);
  });

  it("handles legacy hit_count field", () => {
    const detectors = [
      {
        ...createMockDetector(),
        detector_name: "legacy.Detector",
        total_evaluated: undefined,
        passed: undefined,
        attempt_count: 80,
        hit_count: 20, // failures in old format
      } as Detector,
    ];

    render(<DetectorResultsTable detectors={detectors} />);

    // total = attempt_count = 80
    // passed = total - hit_count = 80 - 20 = 60
    // failed = hit_count = 20
    expect(screen.getByText("80")).toBeInTheDocument(); // total
    expect(screen.getByText("60")).toBeInTheDocument(); // passed
    expect(screen.getByText("20")).toBeInTheDocument(); // failed
  });
});
