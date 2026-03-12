import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  if (!stripeSecretKey || !endpointSecret || !supabaseUrl || !supabaseServiceRoleKey) {
    return new Response("Missing environment variables", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("No signature found", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);

    console.log(`Processing event: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (!metadata || !metadata.job_id) {
        console.error("No job_id in session metadata");
        return new Response("No job_id in metadata", { status: 400 });
      }

      const jobId = metadata.job_id;
      const customerId = metadata.customer_id;
      const workerId = metadata.worker_id;
      const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
      const platformFee = amountPaid * 0.10;

      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

      console.log(`Updating job ${jobId} and recording payment for user ${customerId}`);

      // Update the job status
      const { error: updateError } = await supabaseAdmin
        .from("jobs")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", jobId);

      if (updateError) {
        console.error("Job update error:", updateError);
        throw updateError;
      }

      // Record the payment
      const { error: paymentError } = await supabaseAdmin
        .from("payments")
        .insert({
          job_id: jobId,
          payer_id: customerId,
          payee_id: workerId,
          amount: amountPaid,
          platform_fee: platformFee,
          payment_method: "card",
          status: "released",
          completed_at: new Date().toISOString(),
        });

      if (paymentError) {
        console.error("Payment insert error:", paymentError);
        throw paymentError;
      }
      
      console.log(`Successfully processed job ${jobId}`);
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});

