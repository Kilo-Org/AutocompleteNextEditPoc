import { fetchwithRequestOptions } from "../fetch";
import * as dotenv from "dotenv";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ChatMessage, ILLM } from "..";
import OpenAI from "./llms/OpenAI";

dotenv.config();

vi.mock("../fetch");

async function dudLLMCall(llm: ILLM, messages: ChatMessage[]) {
  try {
    const abortController = new AbortController();
    const gen = llm.streamChat(messages, abortController.signal, {});
    await gen.next();
    await gen.return({
      completion: "",
      modelTitle: "",
      modelProvider: "",
      prompt: "",
    });
    abortController.abort();
  } catch (e) {
    console.error("Expected error", e);
  }
}

const invalidToolCallArg = '{"name": "Ali';
const messagesWithInvalidToolCallArgs: ChatMessage[] = [
  {
    role: "user",
    content: "Call the say_hello tool",
  },
  {
    role: "assistant",
    content: "",
    toolCalls: [
      {
        id: "tool_call_1",
        type: "function",
        function: {
          name: "say_name",
          arguments: invalidToolCallArg,
        },
      },
    ],
  },
  {
    role: "user",
    content: "This is my response",
  },
];

describe("LLM Pre-fetch", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("OpenAI stores tool call args in strings", async () => {
    // OPENAI DOES NOT NEED TO CLEAR INVALID TOOL CALL ARGS BECAUSE IT STORES THEM IN STRINGS
    const openai = new OpenAI({ model: "gpt-something", apiKey: "invalid" });
    await dudLLMCall(openai, messagesWithInvalidToolCallArgs);
    expect(fetchwithRequestOptions).toHaveBeenCalledWith(
      expect.any(URL),
      {
        method: "POST",
        headers: expect.any(Object),
        signal: expect.any(AbortSignal),
        body: expect.stringContaining(JSON.stringify(invalidToolCallArg)),
      },
      expect.any(Object),
    );
  });
});