import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "bg-surface border border-border text-muted",
        primary: "bg-primary/15 text-primary border border-primary/20",
        secondary: "bg-secondary/15 text-secondary border border-secondary/20",
        success: "bg-success/15 text-success border border-success/20",
        warning: "bg-warning/15 text-warning border border-warning/20",
        danger: "bg-danger/15 text-danger border border-danger/20",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
