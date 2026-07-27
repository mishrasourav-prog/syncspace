import { useEffect, useState } from "react";

import { useAuthStore } from "@/app/store";

interface Greeting {
  text: string;
  emoji: string;
}

const DEFAULT_GREETING: Greeting = {
  text: "Welcome",
  emoji: "👋",
};

function getGreetingForHour(hour: number): Greeting {
  if (hour >= 5 && hour < 12) {
    return {
      text: "Good morning",
      emoji: "☀️",
    };
  }

  if (hour >= 12 && hour < 17) {
    return {
      text: "Good afternoon",
      emoji: "🌤️",
    };
  }

  if (hour >= 17 && hour < 21) {
    return {
      text: "Good evening",
      emoji: "🌆",
    };
  }

  if (hour >= 21) {
    return {
      text: "Good night",
      emoji: "🌙",
    };
  }

  return {
    text: "Working late",
    emoji: "🌙",
  };
}

export function DashboardGreeting() {
  const user = useAuthStore((state) => state.user);

  const [greeting, setGreeting] =
    useState<Greeting>(DEFAULT_GREETING);

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();

      setGreeting(getGreetingForHour(currentHour));
    };

    updateGreeting();

    const intervalId = window.setInterval(
      updateGreeting,
      60_000,
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const firstName = user?.name
    ?.trim()
    .split(/\s+/)[0];

  return (
    <div>
      <h1 className="text-h1 text-foreground">
        {greeting.text}
        {firstName ? `, ${firstName}` : ""}!{" "}
        {greeting.emoji}
      </h1>

      <p className="mt-1 text-body">
        Here&apos;s what&apos;s happening across your
        workspaces.
      </p>
    </div>
  );
}