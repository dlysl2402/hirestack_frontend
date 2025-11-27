import { Badge } from '@/components/ui/badge';
import type { ToolCall } from '@/agent/agent.types';
import { ChevronDown, ChevronRight, Wrench } from 'lucide-react';
import { useState } from 'react';

interface ToolCallDisplayProps {
  toolCalls: ToolCall[];
}

export function ToolCallDisplay({ toolCalls }: ToolCallDisplayProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        <Wrench className="h-3 w-3" />
        Tools used ({toolCalls.length})
      </p>
      {toolCalls.map((toolCall, index) => (
        <ToolCallItem key={index} toolCall={toolCall} />
      ))}
    </div>
  );
}

function ToolCallItem({ toolCall }: { toolCall: ToolCall }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded border border-border/50 bg-background/50 text-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-accent/50"
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        )}
        <Badge variant="secondary" className="font-mono text-xs">
          {toolCall.toolName}
        </Badge>
      </button>

      {isExpanded && (
        <div className="border-t border-border/50 px-3 py-2 space-y-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Arguments:</p>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
              {JSON.stringify(toolCall.args, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Result:</p>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-40 overflow-y-auto">
              {JSON.stringify(toolCall.result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
