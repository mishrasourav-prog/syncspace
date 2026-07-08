import { BrowserRouter } from "react-router-dom";
import { Providers } from "./providers";
import { AppRouter } from "./router";
import { useCurrentUserQuery } from "@/features/auth/hooks/useAuthQueries";
export function AuthInitializer(){

    useCurrentUserQuery();

    return null;
}

export function App() {
  return (
    <Providers>
      <BrowserRouter>
       <AuthInitializer/>
        <AppRouter />
      </BrowserRouter>
    </Providers>
  );
}
