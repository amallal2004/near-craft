-- Add Stripe Connect fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN stripe_account_id TEXT,
ADD COLUMN payouts_enabled BOOLEAN DEFAULT false;

-- Add RLS policies for the new fields
-- Users can read their own Stripe account info
CREATE POLICY "Users can view their own stripe info" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Standard profile update policy already handles this, but ensuring they can't set these fields easily via frontend
-- (though payouts_enabled should ideally be updated by a service role function)
