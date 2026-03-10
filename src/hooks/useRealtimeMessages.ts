import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function useRealtimeMessages(jobId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!jobId) return;

    const channel = supabase
      .channel("messages-" + jobId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `job_id=eq.${jobId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", jobId] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [jobId, queryClient]);
}
