export function Label({ children, ...props }) {
  return (
    <label
      className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.6px] text-muted-foreground"
      {...props}
    >
      {children}
    </label>
  );
}
