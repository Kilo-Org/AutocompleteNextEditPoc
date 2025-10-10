import { ConfigHandler } from "../config/ConfigHandler";
import { MinimalConfigProvider } from "../config/MinimalConfig";
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

// Keep testConfigHandler for other parts of core that still use ConfigHandler
export const testConfigHandler = new ConfigHandler(
  testIde,
  new LLMLogger(),
  Promise.resolve(undefined),
);

export const testLLM = new Mock({
  model: "mock-model",
  title: "Mock LLM",
  uniqueId: "not-unique",
});
