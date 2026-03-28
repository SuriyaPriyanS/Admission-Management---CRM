import React from "react";
import { cn } from "../../lib/utils";

export const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-[#9fd7d2] bg-[#f5f8fb] px-3 py-2 text-sm text-[#0d2333] focus-visible:border-[#0a9b8c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a9b8c]/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";
