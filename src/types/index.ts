export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface Message {
  role: MessageRole;
  content: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  name?: string;
}

export interface ChatRequest {
  messages: Message[];
}

export interface ChatResponse {
  content: string;
  role: 'assistant';
}

export interface ErrorResponse {
  error: {
    message: string;
    status?: number;
    type?: string;
  };
}

export interface WebSearchParams {
  query: string;
  numResults?: number;
}

export interface WebSearchResult {
  results: string;
}
