import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  itemLabel?: string;
}

export const PaginationControls = React.memo(function PaginationControls({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  itemLabel = 'items',
}: PaginationControlsProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages || totalPages === 0;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* Left: Navigation buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <Badge variant="secondary" className="text-xs">
          Page {currentPage} of {totalPages || 1}
        </Badge>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Center: Results counter */}
      <div className="text-sm text-muted-foreground">
        {totalItems === 0 ? (
          `No ${itemLabel} found`
        ) : (
          <>
            {startItem}-{endItem} of {totalItems} {itemLabel}
          </>
        )}
      </div>

      {/* Right: Items per page selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className={cn(
            'h-8 w-[70px] rounded-sm border border-input bg-background px-2 py-1',
            'text-sm ring-offset-background',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          aria-label="Items per page"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>
  );
});
