import { LineStream } from "../diff/util";
import { isMarkdownFile, MarkdownBlockStateTracker } from "./markdownUtils";

/**
 * Determines if we should stop at a markdown block based on nested markdown logic.
 * This handles the complex case where markdown blocks contain other markdown blocks.
 * Uses optimized state tracking to avoid redundant computation.
 */
export function shouldStopAtMarkdownBlock(
  stateTracker: MarkdownBlockStateTracker,
  currentIndex: number,
): boolean {
  return stateTracker.shouldStopAtPosition(currentIndex);
}

/**
 * Processes block nesting logic and returns updated state.
 */
export function processBlockNesting(
  line: string,
  seenFirstFence: boolean,
  shouldRemoveLineBeforeStart: (line: string) => boolean,
): { newSeenFirstFence: boolean; shouldSkip: boolean } {
  if (!seenFirstFence && shouldRemoveLineBeforeStart(line)) {
    return { newSeenFirstFence: false, shouldSkip: true };
  }

  if (!seenFirstFence) {
    return { newSeenFirstFence: true, shouldSkip: false };
  }

  return { newSeenFirstFence: seenFirstFence, shouldSkip: false };
}

