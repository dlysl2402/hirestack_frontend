import { Loader2 } from 'lucide-react';

export function ThinkingIndicator() {
  return (
    <div className="flex justify-start px-4">
      <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Thinking...</span>
      </div>
    </div>
  );
}
