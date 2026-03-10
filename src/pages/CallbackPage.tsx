import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from("profiles").select("name").eq("id", session.user.id).single();
        if (!profile?.name) {
          navigate("/onboarding", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        navigate("/login", { replace: true });
      }
    };
    // Small delay to let Supabase process the auth callback
    setTimeout(handleCallback, 500);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
