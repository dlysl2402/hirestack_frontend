import { cn } from '@/lib/utils';
import type { DisplayMessage } from '@/agent/agent.types';
import { ToolCallDisplay } from './ToolCallDisplay';

interface MessageBubbleProps {
  message: DisplayMessage;
  showToolCalls?: boolean;
}

export function MessageBubble({ message, showToolCalls = true }: MessageBubbleProps) {
  const isUser = message.role === 'USER';

  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground',
          message.isOptimistic && 'opacity-70'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>

        {showToolCalls && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-3 border-t border-border/50 pt-3">
            <ToolCallDisplay toolCalls={message.toolCalls} />
          </div>
        )}

        <p
          className={cn(
            'mt-2 text-xs',
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
