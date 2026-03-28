import { cn } from "../../lib/utils";

export function Badge({ className, children, tone = "default" }) {
  const toneClass =
    tone === "success"
      ? "bg-green-100 text-green-700 border border-green-200"
      : tone === "warning"
        ? "bg-amber-100 text-amber-700 border border-amber-200"
        : tone === "danger"
          ? "bg-red-100 text-red-700 border border-red-200"
          : "bg-teal-50 text-teal-700 border border-teal-200";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
        toneClass,
        className
      )}
    >
      {children}
    </span>
  );
}
