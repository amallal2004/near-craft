require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  
  const supabase = createClient(supabaseUrl, serviceKey);

  console.log("Checking jobs in pending_review state...");
  const { data: jobs, error: jobError } = await supabase
    .from('jobs')
    .select('id, title, status')
    .eq('status', 'pending_review');
    
  if (jobError) console.error("Error fetching jobs:", jobError);
  console.log("Jobs pending review:", jobs);

  console.log("Checking payments...");
  const { data: payments, error: paymentError } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (paymentError) console.error("Error fetching payments:", paymentError);
  console.log("Recent payments:", payments);
}

main();
