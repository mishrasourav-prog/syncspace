import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <div>
      <textarea
        ref={ref}
        className={cn(
          "w-full resize-none rounded-md border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-muted/70",
          error
            ? "border-danger focus:border-danger"
            : "border-border focus:border-muted/60",
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  ),
);
Textarea.displayName = "Textarea";
