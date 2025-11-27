// Request types
export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface GetSessionsParams {
  limit?: number;
  offset?: number;
}

// Response types
export interface ToolCall {
  toolName: string;
  args: unknown;
  result: unknown;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ChatResponse {
  sessionId: string;
  message: string;
  toolCalls?: ToolCall[];
  usage?: TokenUsage;
}

export interface ChatSession {
  id: string;
  organizationId: string;
  userId: string;
  agentName: string;
  title: string | null;
  metadata: unknown | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL';
  content: string;
  toolCalls: unknown | null;
  toolResults: unknown | null;
  metadata: unknown | null;
  createdAt: string;
}

export interface SessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}

export interface SessionsResponse {
  sessions: ChatSession[];
}

export interface SessionDetailResponse {
  session: SessionWithMessages;
}

// UI-specific types
export interface DisplayMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  toolCalls?: ToolCall[];
  createdAt: string;
  isOptimistic?: boolean;
}
