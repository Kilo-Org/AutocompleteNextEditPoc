import { getUriFileExtension } from "../../util/uri";
import { BracketMatchingService } from "../filtering/BracketMatchingService";
import {
  CharacterFilter,
  LineFilter,
} from "../filtering/streamTransforms/lineStream";

export interface AutocompleteLanguageInfo {
  /**
   * The display name of the language
   */
  name: string;
  /**
   * Keywords that show up at the top-level of files. We often use these as stop words or soft breaks
   */
  topLevelKeywords: string[];
  /**
   * The character that prefixes a single line comment
   * We use this to format snippets from other files as large comment blocks
   */
  singleLineComment?: string;
  /**
   * Semi-colon or other end of line indicator that may be used as a stop char
   * or other parsing
   */
  endOfLine: string[];
  /**
   * Strings that indicate we should filter out a line from completion
   * Primarily currently used for .ipynb files
   */
  lineFilters?: LineFilter[];
  /**
   * Similar to line filters, but characters. I think.
   */
  charFilters?: CharacterFilter[];
  /**
   * Function that allows cusotmization of whether to use a multi-line completion on a per-language and completion basis
   */
  useMultiline?: (args: { prefix: string; suffix: string }) => boolean;
}

export function languageForFilepath(fileUri: string): AutocompleteLanguageInfo {
  const extension = getUriFileExtension(fileUri);
  return {} as AutocompleteLanguageInfo;
}