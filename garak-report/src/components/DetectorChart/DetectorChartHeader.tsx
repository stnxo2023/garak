/**
 * @file DetectorChartHeader.tsx
 * @description Header component for detector comparison chart with explanatory tooltips.
 * @module components/DetectorChart
 *
 * @copyright NVIDIA Corporation 2023-2026
 * @license Apache-2.0
 */

import { Button, Flex, Stack, Text, Tooltip } from "@kui/react";
import { Info } from "lucide-react";

/**
 * Header for detector comparison chart with info tooltips.
 * Explains detectors, Z-scores, and DEFCON levels to users.
 *
 * @returns Chart header with title and info buttons
 */
const DetectorChartHeader = () => {
  return (
    <Flex gap="density-xs" align="center">
      <Text kind="title/xs">Detector comparison</Text>
      <Tooltip
        slotContent={
          <Stack gap="density-xxs">
            <Text kind="body/bold/sm">What are Detectors?</Text>
            <Text kind="body/regular/sm">
              A detector analyzes the language model's responses to determine if a probe's attack
              succeeded. Each detector examines the output for specific failure indicators (e.g.,
              lack of refusal, presence of harmful content, or decoded malicious prompts).
            </Text>
            <Text kind="body/regular/sm">
              The same probe is tested across multiple models to compare vulnerability patterns.
              Z-scores show how each model performs relative to calibration—higher Z-scores indicate
              worse performance (more vulnerable).
            </Text>
            <Text kind="body/regular/sm">
              DEFCON levels indicate risk: DC-1 (Critical Risk) to DC-5 (Low Risk). Click DEFCON
              badges to filter results.
            </Text>
            <Text kind="body/bold/sm">Lollipop colors:</Text>
            <Text kind="body/regular/sm">
              Colors represent each detector's individual DEFCON level, which may differ from the
              probe's overall DEFCON. Different detectors within the same probe can have different
              risk levels.
            </Text>
            <Text kind="body/bold/sm">Detector counts (hits/attempts):</Text>
            <Text kind="body/regular/sm">
              Each detector shows its own hit and attempt counts, which may differ from the probe's
              total prompt count. Different detectors may evaluate different subsets of prompts
              based on their detection logic.
            </Text>
          </Stack>
        }
      >
        <Button kind="tertiary">
          <Info size={16} />
        </Button>
      </Tooltip>
      <Text kind="label/regular/sm">•</Text>
      <Tooltip
        slotContent={
          <Stack gap="density-xxs">
            <Text kind="body/bold/sm">Understanding Z-Scores</Text>
            <Text kind="body/regular/sm">
              Positive Z-scores mean better than average, negative Z-scores mean worse than average.
            </Text>
            <Text kind="body/regular/sm">
              "Average" is determined over a bag of models of varying sizes, updated periodically.
            </Text>
            <Text kind="body/regular/sm">
              For any probe, roughly two-thirds of models get a Z-score between -1.0 and +1.0.
            </Text>
            <Text kind="body/regular/sm">
              The middle 10% of models score -0.125 to +0.125. This is labeled "competitive".
            </Text>
            <Text kind="body/regular/sm">
              A Z-score of +1.0 means the score was one standard deviation better than the mean
              score other models achieved for this probe & metric.
            </Text>
          </Stack>
        }
      >
        <Button kind="tertiary">
          <Text kind="label/regular/sm">Z-Score</Text>
          <Info size={14} />
        </Button>
      </Tooltip>
    </Flex>
  );
};

export default DetectorChartHeader;
