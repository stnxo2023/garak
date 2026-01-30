/**
 * @file ModuleFilterChips.tsx
 * @description Clickable filter chips for filtering probes by module family.
 *              Uses KUI Badge component for consistent styling.
 * @module components/ProbeChart
 *
 * @copyright NVIDIA Corporation 2023-2026
 * @license Apache-2.0
 */

import { Badge, Flex, Text } from "@kui/react";

/** Valid KUI Badge colors */
type KUIBadgeColor = "blue" | "green" | "red" | "yellow" | "purple" | "teal" | "gray";

/** Color rotation for module chips */
const MODULE_COLORS: KUIBadgeColor[] = ["blue", "green", "purple", "teal", "yellow", "red"];

/** CSS variable mapping for dot colors (uses KUI theme variables) */
const DOT_COLOR_VARS: Record<KUIBadgeColor, string> = {
  blue: "var(--color-blue-500)",
  green: "var(--color-green-500)",
  purple: "var(--color-purple-500)",
  teal: "var(--color-teal-500)",
  yellow: "var(--color-yellow-500)",
  red: "var(--color-red-500)",
  gray: "var(--color-gray-500)",
};

/**
 * Gets a consistent color for a module based on its index.
 * Uses modulo to cycle through available colors.
 */
function getModuleColor(index: number): KUIBadgeColor {
  return MODULE_COLORS[index % MODULE_COLORS.length];
}

export interface ModuleFilterChipsProps {
  /** Unique module names to display as chips */
  moduleNames: string[];
  /** Currently selected modules (multi-select) */
  selectedModules: string[];
  /** Callback when a chip is clicked */
  onSelectModule: (moduleName: string) => void;
}

/**
 * Displays clickable filter chips for each probe module.
 * Supports multi-select - click multiple chips to filter by multiple modules.
 * Clicking a selected chip deselects it.
 *
 * @param props - Component props
 * @returns Row of clickable module filter badges
 */
const ModuleFilterChips = ({
  moduleNames,
  selectedModules,
  onSelectModule,
}: ModuleFilterChipsProps) => {
  const isInteractive = moduleNames.length > 1;
  const hasSelection = selectedModules.length > 0;

  return (
    <Flex gap="density-sm" wrap="wrap" align="center">
      <Text kind="label/regular/sm" className="text-secondary">
        {isInteractive ? "Filter by module:" : "Module:"}
      </Text>
      {moduleNames.map((moduleName, index) => {
        const isSelected = selectedModules.includes(moduleName);
        const color = getModuleColor(index);
        const dotColor = DOT_COLOR_VARS[color];

        return (
          <Badge
            key={moduleName}
            color={color}
            kind={isSelected ? "solid" : "outline"}
            onClick={isInteractive ? () => onSelectModule(moduleName) : undefined}
            className={isInteractive ? "cursor-pointer" : ""}
          >
            <Flex align="center" gap="density-xxs">
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: dotColor,
                  flexShrink: 0,
                }}
              />
              <Text kind="label/bold/sm">{moduleName}</Text>
            </Flex>
          </Badge>
        );
      })}
      {isInteractive && hasSelection && (
        <Badge
          color="gray"
          kind="outline"
          onClick={() => selectedModules.forEach(m => onSelectModule(m))}
          className="cursor-pointer"
        >
          <Text kind="label/regular/sm">Clear all</Text>
        </Badge>
      )}
    </Flex>
  );
};

export default ModuleFilterChips;
