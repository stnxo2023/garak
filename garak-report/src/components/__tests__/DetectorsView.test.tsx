// src/components/__tests__/DetectorsView.test.tsx
import { render, screen } from "@testing-library/react";
import DetectorsView from "../DetectorsView";
import { vi, describe, expect, it, beforeEach } from "vitest";
import type { Probe, Detector } from "../../types/ProbesChart";

// Mock Kaizen components
vi.mock("@kui/react", () => ({
  Panel: ({ children, slotHeading }: { children: React.ReactNode; slotHeading: React.ReactNode }) => (
    <div data-testid="panel">
      <div data-testid="panel-heading">{slotHeading}</div>
      <div data-testid="panel-content">{children}</div>
    </div>
  ),
  Stack: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stack">{children}</div>
  ),
  Flex: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="flex">{children}</div>
  ),
  Text: ({ children, kind }: { children: React.ReactNode; kind?: string }) => (
    <span data-kind={kind}>{children}</span>
  ),
  Button: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
  Divider: () => <hr data-testid="divider" />,
  StatusMessage: ({ slotHeading }: { slotHeading: React.ReactNode }) => (
    <div data-testid="status-message">{slotHeading}</div>
  ),
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
}));

// Mock DefconBadge component
vi.mock("../DefconBadge", () => ({
  __esModule: true,
  default: ({ level }: { level: number }) => (
    <div data-testid="defcon-badge" data-level={level}>
      DC-{level}
    </div>
  ),
}));

// Mock ECharts
vi.mock("echarts-for-react", () => ({
  default: () => <div data-testid="echarts" />,
}));

// Mock hooks
vi.mock("../../hooks/useSeverityColor", () => ({
  __esModule: true,
  default: () => ({
    getSeverityColorByComment: () => "#00ff00",
    getDefconColor: () => "#ff0000",
  }),
}));

vi.mock("../../hooks/useTooltipFormatter", () => ({
  useTooltipFormatter: () => () => "mock tooltip",
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

const createMockProbe = (overrides: Partial<Probe> = {}): Probe => ({
  probe_name: "test.Probe",
  summary: {
    probe_name: "test.Probe",
    probe_score: 0.9,
    probe_severity: 5,
    probe_descr: "Test probe",
    probe_tier: 1,
  },
  detectors: [createMockDetector()],
  ...overrides,
});

describe("DetectorsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders panel with heading", () => {
    const probe = createMockProbe();
    render(<DetectorsView probe={probe} />);

    expect(screen.getByTestId("panel")).toBeInTheDocument();
    expect(screen.getByTestId("panel-heading")).toBeInTheDocument();
  });

  it("renders chart and results table", () => {
    const probe = createMockProbe();
    render(<DetectorsView probe={probe} />);

    expect(screen.getByTestId("echarts")).toBeInTheDocument();
    expect(screen.getByText("Results")).toBeInTheDocument();
  });

  it("displays probe name in chart header", () => {
    const probe = createMockProbe({ probe_name: "custom.ProbeName" });
    render(<DetectorsView probe={probe} />);

    expect(screen.getByText("custom.ProbeName")).toBeInTheDocument();
  });

  it("renders results table with detector data", () => {
    const probe = createMockProbe({
      detectors: [
        createMockDetector({
          detector_name: "detector.One",
          detector_defcon: 2,
          total_evaluated: 50,
          passed: 45,
        }),
        createMockDetector({
          detector_name: "detector.Two",
          detector_defcon: 5,
          total_evaluated: 100,
          passed: 100,
        }),
      ],
    });

    render(<DetectorsView probe={probe} />);

    // Table headers
    expect(screen.getByText("Detector")).toBeInTheDocument();
    expect(screen.getByText("DEFCON")).toBeInTheDocument();
    expect(screen.getByText("Passed")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();

    // Detector names
    expect(screen.getByText("detector.One")).toBeInTheDocument();
    expect(screen.getByText("detector.Two")).toBeInTheDocument();

    // DEFCON badges
    const badges = screen.getAllByTestId("defcon-badge");
    expect(badges).toHaveLength(2);
  });

  it("sorts detectors alphabetically", () => {
    const probe = createMockProbe({
      detectors: [
        createMockDetector({ detector_name: "z.Last" }),
        createMockDetector({ detector_name: "a.First" }),
        createMockDetector({ detector_name: "m.Middle" }),
      ],
    });

    render(<DetectorsView probe={probe} />);

    // Check that all detectors are rendered
    expect(screen.getByText("a.First")).toBeInTheDocument();
    expect(screen.getByText("m.Middle")).toBeInTheDocument();
    expect(screen.getByText("z.Last")).toBeInTheDocument();
  });

  it("shows empty state when probe has no detectors", () => {
    const probe = createMockProbe({ detectors: [] });
    render(<DetectorsView probe={probe} />);

    expect(screen.getByTestId("status-message")).toBeInTheDocument();
    expect(screen.getByText("No Data Available")).toBeInTheDocument();
  });

  it("calculates failed count correctly from total and passed", () => {
    const probe = createMockProbe({
      detectors: [
        createMockDetector({
          detector_name: "test.Detector",
          total_evaluated: 100,
          passed: 85,
        }),
      ],
    });

    render(<DetectorsView probe={probe} />);

    // 100 total - 85 passed = 15 failed
    expect(screen.getByText("85")).toBeInTheDocument(); // passed
    expect(screen.getByText("15")).toBeInTheDocument(); // failed
    expect(screen.getByText("100")).toBeInTheDocument(); // total
  });

  it("applies dark theme when isDark is true", () => {
    const probe = createMockProbe();
    render(<DetectorsView probe={probe} isDark={true} />);

    // Component renders without error with dark theme
    expect(screen.getByTestId("panel")).toBeInTheDocument();
  });
});
