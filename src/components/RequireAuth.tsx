import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { setActiveUser } from "@/lib/transactions";

/**
 * Client-side gate for protected pages. Renders nothing until the Firebase
 * session is resolved; unauthenticated visitors are replaced (not pushed) to
 * the login page so the browser Back button cannot restore protected screens.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    setActiveUser(user.uid);
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-400" size={26} />
      </div>
    );
  }

  return <>{children}</>;
}
