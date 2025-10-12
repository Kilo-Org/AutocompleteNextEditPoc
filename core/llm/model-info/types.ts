export type UseCase = "chat" | "autocomplete" | "rerank" | "embed";

type ParameterType = "string" | "number" | "boolean";

interface Parameter {
  key: string;
  required: boolean;
  valueType: ParameterType;
  displayName?: string;
  description?: string;
  defaultValue?: any;
}

enum ChatTemplate {
  None = "none",
  // TODO
}

interface LlmInfo {
  model: string;
  // providers: string[]; // TODO: uncomment and deal with the consequences
  displayName?: string;
  description?: string;
  contextLength?: number;
  maxCompletionTokens?: number;
  regex?: RegExp;
  chatTemplate?: ChatTemplate;

  /** If not set, assumes "text" only */
  mediaTypes?: MediaType[];
  recommendedFor?: UseCase[];

  /** Any additional parameters required to configure the model */
  extraParameters?: Parameter[];
}

export type LlmInfoWithProvider = LlmInfo & {
  provider: string;
};

enum MediaType {
  Text = "text",
  Image = "image",
  Audio = "audio",
  Video = "video",
}

const AllMediaTypes = [
  MediaType.Text,
  MediaType.Image,
  MediaType.Audio,
  MediaType.Video,
];

interface ApiProviderInfo {
  displayName: string;
  supportsStreaming: boolean;
  handlesTemplating: boolean;
}

type ModelProviderCapability =
  | "stream"
  | "fim"
  | "image"
  | "template_chat"
  | "tools";

export interface ModelProvider {
  id: string;
  displayName: string;
  // capabilities: ModelProviderCapability[]; // TODO: uncomment and deal with the consequences
  models: Omit<LlmInfo, "provider">[];

  /** Any additional parameters required to configure the model
   *
   * (other than apiKey, apiBase, which are assumed always. And of course model and provider always required)
   */
  extraParameters?: Parameter[];
}
