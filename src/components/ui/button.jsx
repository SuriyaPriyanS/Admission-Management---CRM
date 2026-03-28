import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-[#077a6e] text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 hover:-translate-y-px",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        outline: "border border-input bg-transparent text-foreground hover:bg-secondary",
        ghost: "text-foreground hover:bg-secondary",
        destructive: "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? "span" : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
