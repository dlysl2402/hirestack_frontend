import { Card, CardContent } from '@/components/ui/card';
import {
  MessageList,
  ChatInput,
  ThinkingIndicator,
  SessionSidebar,
} from '@/components/agent';
import { useAgentChat } from '@/agent/useAgentChat';
import { Loader2 } from 'lucide-react';

export default function Agent() {
  const {
    sessionId,
    messages,
    isLoading,
    isLoadingSession,
    error,
    sendMessage,
    loadSession,
    newConversation,
  } = useAgentChat();

  return (
    <div className="flex h-full bg-background">
      {/* Session sidebar */}
      <SessionSidebar
        currentSessionId={sessionId}
        onSelectSession={loadSession}
        onNewChat={newConversation}
      />

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-semibold text-foreground">Headhunter Agent</h1>
          <p className="text-sm text-muted-foreground">
            AI assistant for finding and evaluating candidates
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="mx-6 mt-4">
            <Card className="border-destructive">
              <CardContent className="py-3">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingSession ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <MessageList messages={messages} showToolCalls={true} />
              {isLoading && <ThinkingIndicator />}
            </>
          )}
        </div>

        {/* Input area */}
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          disabled={isLoadingSession}
          placeholder="Ask about candidates, jobs, or finding the right fit..."
        />
      </div>
    </div>
  );
}
