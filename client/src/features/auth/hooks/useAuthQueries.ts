import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/app/store";
import { getCurrentUserRequest } from "../api/auth.api";
import { useEffect } from "react";
export function useCurrentUserQuery() {
  const setUser = useAuthStore((state) => state.setUser);

  const query = useQuery({
    queryKey: ["me"],
    queryFn: getCurrentUserRequest,
    retry: false,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
}