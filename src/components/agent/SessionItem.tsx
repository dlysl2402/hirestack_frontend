import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trash2, MessageSquare } from 'lucide-react';
import type { ChatSession } from '@/agent/agent.types';

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function SessionItem({
  session,
  isActive,
  onSelect,
  onDelete,
  isDeleting,
}: SessionItemProps) {
  const displayDate = new Date(session.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-accent text-foreground'
      )}
      onClick={() => onSelect(session.id)}
    >
      <MessageSquare className="h-4 w-4 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {session.title || 'Untitled conversation'}
        </p>
        <p
          className={cn(
            'text-xs truncate',
            isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {displayDate}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
          isActive
            ? 'hover:bg-primary-foreground/20 text-primary-foreground'
            : 'hover:bg-destructive/10 hover:text-destructive'
        )}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(session.id);
        }}
        disabled={isDeleting}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
