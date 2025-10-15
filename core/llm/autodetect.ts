import { ModelCapability } from "../index.js";
import { NEXT_EDIT_MODELS } from "./constants.js";

export type TemplateType =
  | "llama2"
  | "alpaca"
  | "zephyr"
  | "phi2"
  | "phind"
  | "anthropic"
  | "chatml"
  | "none"
  | "openchat"
  | "deepseek"
  | "xwin-coder"
  | "neural-chat"
  | "codellama-70b"
  | "llava"
  | "gemma"
  | "granite"
  | "llama3"
  | "codestral";

function isProviderHandlesTemplatingOrNoTemplateTypeRequired(
  modelName: string,
): boolean {
  return (
    modelName.includes("gpt") ||
    modelName.includes("command") ||
    modelName.includes("aya") ||
    modelName.includes("chat-bison") ||
    modelName.includes("pplx") ||
    modelName.includes("gemini") ||
    modelName.includes("grok") ||
    modelName.includes("moonshot") ||
    modelName.includes("kimi") ||
    modelName.includes("mercury") ||
    /^o\d/.test(modelName)
  );
}

// NOTE: When updating this list,
// update core/nextEdit/templating/NextEditPromptEngine.ts as well.
const MODEL_SUPPORTS_NEXT_EDIT: string[] = [
  NEXT_EDIT_MODELS.MERCURY_CODER,
  NEXT_EDIT_MODELS.INSTINCT,
];

export function modelSupportsNextEdit(
  capabilities: ModelCapability | undefined,
  model: string,
  title: string | undefined,
): boolean {
  if (capabilities?.nextEdit !== undefined) {
    return capabilities.nextEdit;
  }

  const lower = model.toLowerCase();
  if (
    MODEL_SUPPORTS_NEXT_EDIT.some(
      (modelName) => lower.includes(modelName) || title?.includes(modelName),
    )
  ) {
    return true;
  }

  return false;
}

export function autodetectTemplateType(
  model: string,
): TemplateType | undefined {
  const lower = model.toLowerCase();

  if (lower.includes("codellama") && lower.includes("70b")) {
    return "codellama-70b";
  }

  if (isProviderHandlesTemplatingOrNoTemplateTypeRequired(lower)) {
    return undefined;
  }

  if (lower.includes("llama3") || lower.includes("llama-3")) {
    return "llama3";
  }

  if (lower.includes("llava")) {
    return "llava";
  }

  if (lower.includes("tinyllama")) {
    return "zephyr";
  }

  if (lower.includes("xwin")) {
    return "xwin-coder";
  }

  if (lower.includes("dolphin")) {
    return "chatml";
  }

  if (lower.includes("gemma")) {
    return "gemma";
  }

  if (lower.includes("phi2")) {
    return "phi2";
  }

  if (lower.includes("phind")) {
    return "phind";
  }

  if (lower.includes("llama")) {
    return "llama2";
  }

  if (lower.includes("zephyr")) {
    return "zephyr";
  }

  // Claude requests always sent through Messages API, so formatting not necessary
  if (lower.includes("claude")) {
    return "none";
  }

  // Nova Pro requests always sent through Converse API, so formatting not necessary
  if (lower.includes("nova")) {
    return "none";
  }

  if (lower.includes("codestral")) {
    return "none";
  }

  if (lower.includes("alpaca") || lower.includes("wizard")) {
    return "alpaca";
  }

  if (lower.includes("mistral") || lower.includes("mixtral")) {
    return "llama2";
  }

  if (lower.includes("deepseek")) {
    return "deepseek";
  }

  if (lower.includes("ninja") || lower.includes("openchat")) {
    return "openchat";
  }

  if (lower.includes("neural-chat")) {
    return "neural-chat";
  }

  if (lower.includes("granite")) {
    return "granite";
  }

  return "chatml";
}
