import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: string;
  rightSlot?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon: Icon, error, rightSlot, ...props }, ref) => (
    <div className="relative">
      {Icon && (
        <Icon className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      )}
      <input
        ref={ref}
        className={cn(
          "w-full bg-background border rounded-md py-2.5 text-sm text-foreground placeholder:text-muted/70 outline-none transition-colors duration-200",
          Icon ? "pl-9" : "pl-3",
          rightSlot ? "pr-10" : "pr-3",
          error
            ? "border-danger focus:border-danger"
            : "border-border focus:border-muted/60",
          className,
        )}
        {...props}
      />
      {rightSlot}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  ),
);
Input.displayName = "Input";
