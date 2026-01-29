/**
 * @file DetectorResultsTable.test.tsx
 * @description Tests for the DetectorResultsTable component with stacked progress bars.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DetectorResultsTable from "../DetectorResultsTable";
import type { Detector } from "../../../types/ProbesChart";

// Mock KUI components
vi.mock("@kui/react", () => ({
  Flex: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={style}>{children}</div>
  ),
  Stack: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

// Mock DefconBadge
vi.mock("../../DefconBadge", () => ({
  __esModule: true,
  default: ({ defcon }: { defcon: number }) => (
    <div data-testid="defcon-badge" data-defcon={defcon}>
      DC-{defcon}
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
  it("renders Results heading", () => {
    render(<DetectorResultsTable detectors={[]} />);

    expect(screen.getByText("Results")).toBeInTheDocument();
  });

  it("renders detector name and counts", () => {
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
    expect(screen.getByText("50")).toBeInTheDocument(); // total
    expect(screen.getByText("/")).toBeInTheDocument(); // separator
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
    expect(badges[0]).toHaveAttribute("data-defcon", "1");
    expect(badges[1]).toHaveAttribute("data-defcon", "5");
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

    // Shows 100/100 (passed/total)
    const hundredTexts = screen.getAllByText("100");
    expect(hundredTexts).toHaveLength(2); // passed and total
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

    // passed = total - hit_count = 80 - 20 = 60
    expect(screen.getByText("60")).toBeInTheDocument(); // passed
    expect(screen.getByText("80")).toBeInTheDocument(); // total
  });
});
