import React from "react";
import { cn } from "../../lib/utils";

export const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-20 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
