import {
  AssistantUnrolledNonNullable,
  ConfigValidationError,
} from "./yaml-package";
import { IContextProvider, IdeType } from "..";

// Context providers removed for autocomplete-only build
// Stub function to satisfy type requirements
function contextProviderClassFromName(_name: string): any {
  return undefined;
}

/*
    Loads context providers based on configuration
    - default providers will always be loaded, using config params if present
    - other providers will be loaded if configured

    NOTE the MCPContextProvider is added in doLoadConfig if any resources are present
*/
export function loadConfigContextProviders(
  configContext: AssistantUnrolledNonNullable["context"],
  hasDocs: boolean,
  ideType: IdeType,
): {
  providers: IContextProvider[];
  errors: ConfigValidationError[];
} {
  // Autocomplete-only build: context providers not needed
  // Return empty lists to satisfy type requirements
  return {
    providers: [],
    errors: [],
  };
}
