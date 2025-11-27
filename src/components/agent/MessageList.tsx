import { useEffect, useRef } from 'react';
import type { DisplayMessage } from '@/agent/agent.types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: DisplayMessage[];
  showToolCalls?: boolean;
}

export function MessageList({ messages, showToolCalls = true }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">Start a conversation</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask about candidates, jobs, or get help finding the right fit
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          showToolCalls={showToolCalls}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
