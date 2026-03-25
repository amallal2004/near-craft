import { supabase } from "./src/integrations/supabase/client";

async function check() {
  const { data: jobs } = await supabase.from("jobs").select("status");
  console.log("Jobs statuses:", jobs?.map(j => j.status));
}

check();
