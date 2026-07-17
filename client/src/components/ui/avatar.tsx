import * as React from "react";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  square?: boolean;
}

const sizeClasses = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function Avatar({ src, name, size = "md", square = false, className, ...props }: AvatarProps) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const showImage = Boolean(src) && !imageFailed;

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/25 to-secondary/25 font-semibold text-foreground",
        square ? "rounded-lg" : "rounded-full",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden>{getInitials(name)}</span>
      )}
      <span className="sr-only">{name}</span>
    </div>
  );
}
