import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      throw new Error("Missing Authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      throw new Error("Unauthorized");
    }

    const body = await req.json();
    const { jobId, successUrl, cancelUrl } = body;

    console.log(`Processing payment for job: ${jobId}, user: ${user.id}`);

    if (!jobId || !successUrl || !cancelUrl) {
      throw new Error("Missing required parameters");
    }

    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("*, categories(name)")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      console.error("Job fetch error:", jobError);
      throw new Error("Job not found");
    }

    console.log(`Found job: ${job.title}, status: ${job.status}`);

    if (job.status !== "pending_review") {
      throw new Error(`Job is not ready for payment (status: ${job.status})`);
    }

    if (job.customer_id !== user.id) {
      throw new Error("Only the customer can pay for this job");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const amountInCents = Math.round(Number(job.budget_amount) * 100);
    const categoryName = Array.isArray(job.categories) 
      ? job.categories[0]?.name 
      : (job.categories as any)?.name || "Service";

    console.log(`Creating Stripe session for ${amountInCents} cents`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Job: ${job.title}`,
              description: `Payment for ${categoryName} service on Near-Craft`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: job.id,
      metadata: {
        job_id: job.id,
        customer_id: job.customer_id,
        worker_id: job.selected_worker_id,
        platform_fee_percent: "10",
      },
    });

    console.log("Stripe session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    console.error("Function error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
