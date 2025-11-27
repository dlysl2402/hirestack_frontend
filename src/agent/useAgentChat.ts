import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sendChatMessage, getSession } from './agent.service';
import { queryKeys } from '@/lib/query-keys';
import type { DisplayMessage, ChatMessage, ToolCall } from './agent.types';

export function useAgentChat() {
  const queryClient = useQueryClient();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // Load existing session
  const loadSession = useCallback(async (id: string) => {
    // Skip if already on this session
    if (id === sessionId) return;

    setIsLoadingSession(true);
    setError(null);

    try {
      const { session } = await getSession(id);
      setSessionId(id);

      // Convert ChatMessage[] to DisplayMessage[]
      const displayMessages: DisplayMessage[] = session.messages
        .filter((m): m is ChatMessage & { role: 'USER' | 'ASSISTANT' } =>
          m.role === 'USER' || m.role === 'ASSISTANT'
        )
        .map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          toolCalls: m.toolCalls as ToolCall[] | undefined,
          createdAt: m.createdAt,
        }));

      setMessages(displayMessages);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load session';
      setError(message);
    } finally {
      setIsLoadingSession(false);
    }
  }, [sessionId]);

  // Send a new message
  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);

    // Optimistic update - add user message immediately
    const optimisticId = `optimistic-${Date.now()}`;
    const userMessage: DisplayMessage = {
      id: optimisticId,
      role: 'USER',
      content,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await sendChatMessage({
        message: content,
        ...(sessionId && { sessionId }),
      });

      // Update sessionId if this was a new conversation
      const isNewSession = !sessionId;
      if (isNewSession) {
        setSessionId(response.sessionId);
      }

      // Replace optimistic message with real one and add assistant response
      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => m.id !== optimisticId);
        return [
          ...withoutOptimistic,
          {
            id: `user-${Date.now()}`,
            role: 'USER' as const,
            content,
            createdAt: new Date().toISOString(),
          },
          {
            id: `assistant-${Date.now()}`,
            role: 'ASSISTANT' as const,
            content: response.message,
            toolCalls: response.toolCalls,
            createdAt: new Date().toISOString(),
          },
        ];
      });

      // Invalidate sessions list cache to show new/updated session
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.sessions() });

      return response;
    } catch (err: unknown) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      const message = err instanceof Error ? err.message : 'Failed to send message';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, queryClient]);

  // Start a new conversation
  const newConversation = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    setError(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sessionId,
    messages,
    isLoading,
    isLoadingSession,
    error,
    sendMessage,
    loadSession,
    newConversation,
    clearError,
  };
}
