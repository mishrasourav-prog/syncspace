import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error("DropdownMenu components must be used within <DropdownMenu>");
  return context;
}

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div ref={rootRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  className,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  const { open, setOpen, triggerRef } = useDropdownMenuContext();

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-label={ariaLabel}
      onClick={() => setOpen(!open)}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-border/40 hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  align = "end",
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const { open, setOpen } = useDropdownMenuContext();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="menu"
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: 0.12 }}
          onClick={() => setOpen(false)}
          className={cn(
            "absolute z-40 mt-1.5 min-w-[180px] rounded-xl border border-border bg-surface p-1.5 shadow-elevated",
            align === "end" ? "right-0" : "left-0",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  variant = "default",
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger";
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors disabled:pointer-events-none disabled:opacity-50",
        variant === "danger" ? "text-danger hover:bg-danger/10" : "text-foreground hover:bg-border/40",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-2.5 py-1.5 text-caption">{children}</div>;
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-border" />;
}
