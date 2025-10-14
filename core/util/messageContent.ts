import {
  ChatMessage,
  MessageContent,
  TextMessagePart,
} from "../index";

function stripImages(messageContent: MessageContent): string {
  if (typeof messageContent === "string") {
    return messageContent;
  }

  return messageContent
    .filter((part) => part.type === "text")
    .map((part) => (part as TextMessagePart).text)
    .join("\n");
}

export function renderChatMessage(message: ChatMessage): string {
  switch (message?.role) {
    case "user":
    case "assistant":
    case "thinking":
    case "system":
      return stripImages(message.content);
    case "tool":
      return message.content;
    default:
      return "";
  }
}
