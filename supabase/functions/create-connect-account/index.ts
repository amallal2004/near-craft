import Stripe from "npm:stripe@^14.18.0";
import { createClient } from "npm:@supabase/supabase-js@^2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not configured in Supabase secrets. Please run: supabase secrets set STRIPE_SECRET_KEY=...");

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      // httpClient: Stripe.createFetchHttpClient(), // Removing this as it can cause issues in Supabase Deno runtime
    });

    // Create client to verify the user
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const { returnUrl, refreshUrl } = body;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_account_id, email, name")
      .eq("id", user.id)
      .single();

    if (profileError) throw new Error(`Profile not found: ${profileError.message}`);

    let accountId = profile?.stripe_account_id;

    if (!accountId) {
      // Create a new Express account
      const account = await stripe.accounts.create({
        type: "express",
        email: profile?.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          supabase_user_id: user.id,
        },
      });
      accountId = account.id;

      // Save the account ID
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ stripe_account_id: accountId })
        .eq("id", user.id);
      
      if (updateError) throw new Error(`Failed to save stripe_account_id: ${updateError.message}`);
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return new Response(JSON.stringify({ url: accountLink.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    } catch (err: any) {
    console.error("Function error:", err.message);
    
    // Provide more specific feedback for common Stripe errors
    let errorMessage = err.message;
    if (errorMessage.includes("signed up for Connect")) {
      errorMessage = "Stripe Connect is not enabled on your account. Please enable it in your Stripe Dashboard (https://dashboard.stripe.com/connect) before setting up payouts.";
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
