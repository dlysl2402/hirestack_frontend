import { authenticatedRequest } from '@/lib/api';
import type {
  ChatRequest,
  ChatResponse,
  GetSessionsParams,
  SessionsResponse,
  SessionDetailResponse,
} from './agent.types';

/**
 * Send a message to the Headhunter Agent
 * Creates a new session if sessionId is not provided
 */
export async function sendChatMessage(data: ChatRequest): Promise<ChatResponse> {
  return authenticatedRequest<ChatResponse>('/api/agent/chat', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get paginated list of chat sessions
 */
export async function getSessions(params?: GetSessionsParams): Promise<SessionsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.limit !== undefined) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params?.offset !== undefined) {
    queryParams.append('offset', params.offset.toString());
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/api/agent/sessions?${queryString}` : '/api/agent/sessions';

  return authenticatedRequest<SessionsResponse>(url);
}

/**
 * Get a specific session with its message history
 */
export async function getSession(sessionId: string): Promise<SessionDetailResponse> {
  return authenticatedRequest<SessionDetailResponse>(`/api/agent/sessions/${sessionId}`);
}

/**
 * Delete a chat session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  return authenticatedRequest<void>(`/api/agent/sessions/${sessionId}`, {
    method: 'DELETE',
  });
}
