import type { ILLM, TabAutocompleteOptions } from "../index.js";
import { MinimalConfigProvider } from "../autocomplete/MinimalConfig.js";

/**
 * Minimal config structure for testing.
 * Matches the shape of config returned by MinimalConfigProvider.loadConfig()
 */
export interface MinimalTestConfig {
  tabAutocompleteOptions?: TabAutocompleteOptions;
  experimental?: {
    enableStaticContextualization?: boolean;
  };
  modelsByRole?: {
    autocomplete?: ILLM[];
  };
  selectedModelByRole?: {
    autocomplete?: ILLM;
    edit?: ILLM;
    chat?: ILLM;
    rerank?: ILLM;
  };
  rules?: unknown[];
}

/**
 * Options for customizing FakeConfigHandler behavior.
 * All options are optional and will use sensible defaults if not provided.
 */
export interface FakeConfigHandlerOptions {
  /** Configuration to return from loadConfig() */
  config?: Partial<MinimalTestConfig>;
  
  /** Autocomplete model to use (shorthand for setting selectedModelByRole.autocomplete) */
  autocompleteModel?: ILLM;
  
  /** Whether static contextualization is enabled */
  enableStaticContextualization?: boolean;
  
  /** Tab autocomplete options */
  tabAutocompleteOptions?: TabAutocompleteOptions;
  
  /** Profile type for logging */
  profileType?: "control-plane" | "local" | "platform";
}

/**
 * FakeConfigHandler is a test implementation of the config handler interface.
 * It extends MinimalConfigProvider to ensure type compatibility and provides additional
 * test utilities for tracking config updates and simulating changes.
 *
 * Usage example:
 * ```typescript
 * const configHandler = new FakeConfigHandler({
 *   autocompleteModel: {
 *     title: "test-model",
 *     model: "gpt-4",
 *     autocompleteOptions: {},
 *   },
 *   enableStaticContextualization: true,
 * });
 *
 * // Override loadConfig if needed
 * configHandler.loadConfig = async () => ({
 *   config: { ...customConfig },
 * });
 * ```
 */
export class FakeConfigHandler extends MinimalConfigProvider {
  /** Track calls to onConfigUpdate for assertions */
  public configUpdateCallbacks: Array<(event: { config: MinimalTestConfig; configLoadInterrupted: boolean }) => void> = [];

  constructor(options: FakeConfigHandlerOptions = {}) {
    // Build config from options
    const autocompleteModel = options.autocompleteModel;
    
    const config = {
      tabAutocompleteOptions: options.tabAutocompleteOptions,
      experimental: {
        enableStaticContextualization: options.enableStaticContextualization ?? false,
      },
      modelsByRole: {
        autocomplete: autocompleteModel ? [autocompleteModel] : [],
      },
      selectedModelByRole: {
        autocomplete: autocompleteModel,
      },
      ...options.config,
    };
    
    // Call parent constructor with merged config
    super(config);
    
    // Set profile if provided
    if (options.profileType) {
      this.currentProfile = {
        profileDescription: {
          profileType: options.profileType,
        },
      };
    }
  }

  /**
   * Register config update handler
   * Overrides parent to track callbacks for test assertions
   */
  override onConfigUpdate(
    handler: (event: {
      config: MinimalTestConfig;
      configLoadInterrupted: boolean;
    }) => void,
  ): void {
    this.configUpdateCallbacks.push(handler);
  }
  
  /**
   * Helper method to simulate config updates in tests.
   * This is not part of the config handler interface but useful for testing.
   */
  async simulateConfigUpdate(newConfig: Partial<MinimalTestConfig>, interrupted = false): Promise<void> {
    // Update the internal config
    const { config } = await this.loadConfig();
    const updatedConfig = { ...config, ...newConfig } as MinimalTestConfig;
    
    // Notify all callbacks
    this.configUpdateCallbacks.forEach((callback) =>
      callback({ config: updatedConfig, configLoadInterrupted: interrupted })
    );
  }
  
  /**
   * Helper method to update config for tests
   * Note: This directly modifies the internal config state
   */
  async updateConfig(newConfig: Partial<MinimalTestConfig>): Promise<void> {
    const { config } = await this.loadConfig();
    Object.assign(config, newConfig);
  }
}