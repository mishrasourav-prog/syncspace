import { LogOut, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/app/store";
import { useLogout } from "@/features/auth/hooks/useLogout";

export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const { logout, isPending } = useLogout();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="!h-auto !w-full justify-start gap-2.5 rounded-lg px-2 py-2 hover:bg-surface"
      >
        <Avatar src={user.avatar} name={user.name} size="sm" />
        <div className="min-w-0 text-left">
          <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
          <p className="truncate text-caption">@{user.username}</p>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="mb-1.5 bottom-full mt-0">
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <UserCircle className="h-3.5 w-3.5" />
          View profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="danger" onClick={logout} disabled={isPending}>
          <LogOut className="h-3.5 w-3.5" />
          {isPending ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
