import { useAuthStore } from "@/app/store";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardGreeting() {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.name.split(" ")[0];

  return (
    <div>
      <h1 className="text-h1 text-foreground">
        {getGreeting()}
        {firstName ? `, ${firstName}` : ""}! 👋
      </h1>
      <p className="mt-1 text-body">Here&apos;s what&apos;s happening across your workspaces.</p>
    </div>
  );
}
