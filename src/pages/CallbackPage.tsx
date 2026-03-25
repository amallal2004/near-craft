import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingScreen from "@/components/auth/LoadingScreen";

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

  return <LoadingScreen />;
}
