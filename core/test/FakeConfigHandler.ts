import type { ILLM, TabAutocompleteOptions } from "../index.js";
import { DEFAULT_AUTOCOMPLETE_OPTS } from "../util/parameters.js";

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
 * It provides sensible defaults for all methods while allowing tests to customize behavior.
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
export class FakeConfigHandler {
  private config: MinimalTestConfig;
  public currentProfile: { profileDescription: { profileType?: string } } | undefined;
  
  /** Track calls to onConfigUpdate for assertions */
  public configUpdateCallbacks: Array<(event: { config: MinimalTestConfig; configLoadInterrupted: boolean }) => void> = [];

  constructor(options: FakeConfigHandlerOptions = {}) {
    // Build config from options
    const autocompleteModel = options.autocompleteModel;
    
    this.config = {
      tabAutocompleteOptions: {
        ...DEFAULT_AUTOCOMPLETE_OPTS,
        ...options.tabAutocompleteOptions,
      } as TabAutocompleteOptions,
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
   * Returns the config in the same shape as ConfigHandler.loadConfig()
   * This maintains API compatibility with existing code.
   */
  async loadConfig(): Promise<{ config: MinimalTestConfig }> {
    return { config: this.config };
  }

  /**
   * Get autocomplete options directly
   */
  getAutocompleteOptions(): TabAutocompleteOptions {
    return this.config.tabAutocompleteOptions || DEFAULT_AUTOCOMPLETE_OPTS;
  }

  /**
   * Check if static contextualization is enabled
   */
  isStaticContextualizationEnabled(): boolean {
    return this.config.experimental?.enableStaticContextualization ?? false;
  }

  /**
   * Reload config (stub for compatibility)
   */
  async reloadConfig(..._args: unknown[]): Promise<void> {
    // No-op by default, tests can override if needed
  }

  /**
   * Register config update handler
   */
  onConfigUpdate(
    handler: (event: {
      config: MinimalTestConfig;
      configLoadInterrupted: boolean;
    }) => void,
  ): void {
    this.configUpdateCallbacks.push(handler);
  }

  /**
   * Register custom context provider (stub for compatibility)
   */
  registerCustomContextProvider(_provider: unknown): void {
    // No-op by default, tests can override if needed
  }
  
  /**
   * Helper method to simulate config updates in tests.
   * This is not part of the config handler interface but useful for testing.
   */
  simulateConfigUpdate(newConfig: Partial<MinimalTestConfig>, interrupted = false): void {
    this.config = { ...this.config, ...newConfig };
    this.configUpdateCallbacks.forEach((callback) => 
      callback({ config: this.config, configLoadInterrupted: interrupted })
    );
  }
  
  /**
   * Helper method to update config for tests
   */
  updateConfig(newConfig: Partial<MinimalTestConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}