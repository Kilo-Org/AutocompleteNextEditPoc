import { MinimalConfigProvider } from "../autocomplete/MinimalConfig";
import { ControlPlaneClient } from "../control-plane/client";
import Mock from "../llm/llms/Mock";
import { LLMLogger } from "../llm/logger";
import FileSystemIde from "../util/filesystem";

import { TEST_DIR } from "./testDir";

export const testIde = new FileSystemIde(TEST_DIR);

export const ideSettingsPromise = testIde.getIdeSettings();

export const testControlPlaneClient = new ControlPlaneClient(
  Promise.resolve(undefined),
  testIde,
);

// For autocomplete/nextEdit tests, use MinimalConfigProvider
export const testMinimalConfigProvider = new MinimalConfigProvider();

export const testLLM = new Mock({
  model: "mock-model",
  title: "Mock LLM",
  uniqueId: "not-unique",
});
