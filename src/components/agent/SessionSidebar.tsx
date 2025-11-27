import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SessionItem } from './SessionItem';
import { getSessions, deleteSession } from '@/agent/agent.service';
import { queryKeys } from '@/lib/query-keys';
import { Plus, Loader2, Bot } from 'lucide-react';
import { useState } from 'react';

interface SessionSidebarProps {
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

export function SessionSidebar({
  currentSessionId,
  onSelectSession,
  onNewChat,
}: SessionSidebarProps) {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.agent.sessionList({ limit: 50 }),
    queryFn: () => getSessions({ limit: 50 }),
  });

  const sessions = data?.sessions ?? [];

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteSession(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.sessions() });
      // If we deleted the current session, start a new chat
      if (id === currentSessionId) {
        onNewChat();
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-muted/30">
      {/* Header with New Chat button */}
      <div className="p-3">
        <Button onClick={onNewChat} className="w-full justify-start" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      <Separator />

      {/* Sessions list */}
      <ScrollArea className="flex-1 px-2 py-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Bot className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No conversations yet
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={session.id === currentSessionId}
                onSelect={onSelectSession}
                onDelete={handleDelete}
                isDeleting={deletingId === session.id}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
