
-- Fix search_path on all mutable functions
ALTER FUNCTION public.update_updated_at() SET search_path = public;
ALTER FUNCTION public.update_application_count() SET search_path = public;
ALTER FUNCTION public.update_user_rating() SET search_path = public;
ALTER FUNCTION public.update_worker_completed_jobs() SET search_path = public;
ALTER FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, public.notification_ref_type, UUID) SET search_path = public;
ALTER FUNCTION public.notify_new_application() SET search_path = public;
ALTER FUNCTION public.notify_application_status() SET search_path = public;
ALTER FUNCTION public.notify_job_status_change() SET search_path = public;
ALTER FUNCTION public.notify_new_message() SET search_path = public;

-- Move pg_trgm extension to extensions schema
DROP EXTENSION IF EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA extensions;
