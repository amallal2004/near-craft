
-- Extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enums
CREATE TYPE public.user_role AS ENUM ('customer', 'worker', 'admin');
CREATE TYPE public.active_role AS ENUM ('customer', 'worker');
CREATE TYPE public.budget_type AS ENUM ('fixed', 'hourly');
CREATE TYPE public.urgency_level AS ENUM ('low', 'medium', 'urgent');
CREATE TYPE public.job_status AS ENUM ('open', 'assigned', 'in_progress', 'pending_review', 'completed', 'disputed', 'resolved', 'cancelled', 'expired');
CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE public.message_type AS ENUM ('text', 'image');
CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'upi', 'wallet', 'external');
CREATE TYPE public.payment_status AS ENUM ('pending', 'held', 'released', 'refunded');
CREATE TYPE public.dispute_status AS ENUM ('open', 'under_review', 'resolved');
CREATE TYPE public.notification_ref_type AS ENUM ('job', 'application', 'message', 'review', 'payment', 'dispute');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT UNIQUE,
  role public.user_role NOT NULL DEFAULT 'customer',
  active_role public.active_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  bio TEXT,
  location_text TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  avg_rating NUMERIC(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  penalty_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Worker profiles
CREATE TABLE public.worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  experience_desc TEXT,
  hourly_rate_min NUMERIC(10,2),
  hourly_rate_max NUMERIC(10,2),
  service_radius INTEGER DEFAULT 10,
  is_available BOOLEAN DEFAULT true,
  completed_jobs INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_rate_range CHECK (hourly_rate_min IS NULL OR hourly_rate_max IS NULL OR hourly_rate_min <= hourly_rate_max)
);

-- Worker skills
CREATE TABLE public.worker_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(worker_id, category_id)
);

-- Worker portfolio
CREATE TABLE public.worker_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Worker availability
CREATE TABLE public.worker_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(worker_id, day_of_week),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  title TEXT NOT NULL CHECK (char_length(title) >= 5 AND char_length(title) <= 200),
  description TEXT NOT NULL CHECK (char_length(description) >= 20),
  location_text TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  budget_type public.budget_type NOT NULL DEFAULT 'fixed',
  budget_amount NUMERIC(10,2) NOT NULL CHECK (budget_amount > 0 AND budget_amount < 1000000),
  urgency public.urgency_level NOT NULL DEFAULT 'medium',
  status public.job_status NOT NULL DEFAULT 'open',
  selected_worker_id UUID REFERENCES public.profiles(id),
  application_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  CONSTRAINT no_self_hire CHECK (customer_id != selected_worker_id)
);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_created ON public.jobs(created_at DESC);
CREATE INDEX idx_jobs_customer ON public.jobs(customer_id);
CREATE INDEX idx_jobs_category ON public.jobs(category_id);

-- Job images
CREATE TABLE public.job_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Applications
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(message) >= 10),
  offer_price NUMERIC(10,2) NOT NULL CHECK (offer_price > 0 AND offer_price < 1000000),
  status public.application_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, worker_id)
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  receiver_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL CHECK (char_length(content) >= 1),
  message_type public.message_type NOT NULL DEFAULT 'text',
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT no_self_message CHECK (sender_id != receiver_id)
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK (char_length(comment) >= 10),
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, reviewer_id),
  CONSTRAINT no_self_review CHECK (reviewer_id != reviewee_id)
);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID UNIQUE NOT NULL REFERENCES public.jobs(id),
  payer_id UUID NOT NULL REFERENCES public.profiles(id),
  payee_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  platform_fee NUMERIC(10,2) DEFAULT 0,
  payment_method public.payment_method NOT NULL DEFAULT 'external',
  status public.payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  reference_type public.notification_ref_type,
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Disputes
CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID UNIQUE NOT NULL REFERENCES public.jobs(id),
  raised_by UUID NOT NULL REFERENCES public.profiles(id),
  reason TEXT NOT NULL CHECK (char_length(reason) >= 10),
  status public.dispute_status NOT NULL DEFAULT 'open',
  resolution TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Saved jobs
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(worker_id, job_id)
);

-- User roles table (for admin checking per security guidelines)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.user_role NOT NULL,
  UNIQUE(user_id, role)
);

-- ============================================================
-- Functions and Triggers
-- ============================================================

-- Handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON public.worker_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Application count trigger
CREATE OR REPLACE FUNCTION public.update_application_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.jobs SET application_count = application_count + 1 WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.jobs SET application_count = GREATEST(application_count - 1, 0) WHERE id = OLD.job_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE TRIGGER on_application_change AFTER INSERT OR DELETE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_application_count();

-- User rating trigger
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles SET
    avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id)
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_review_created AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_user_rating();

-- Worker completed jobs trigger
CREATE OR REPLACE FUNCTION public.update_worker_completed_jobs()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.worker_profiles SET completed_jobs = completed_jobs + 1 WHERE user_id = NEW.selected_worker_id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_job_completed AFTER UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_worker_completed_jobs();

-- Notification helper
CREATE OR REPLACE FUNCTION public.create_notification(p_user_id UUID, p_type TEXT, p_title TEXT, p_body TEXT DEFAULT NULL, p_ref_type public.notification_ref_type DEFAULT NULL, p_ref_id UUID DEFAULT NULL)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, reference_type, reference_id) VALUES (p_user_id, p_type, p_title, p_body, p_ref_type, p_ref_id) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Notification triggers
CREATE OR REPLACE FUNCTION public.notify_new_application()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_job RECORD; v_worker_name TEXT;
BEGIN
  SELECT title, customer_id INTO v_job FROM public.jobs WHERE id = NEW.job_id;
  SELECT name INTO v_worker_name FROM public.profiles WHERE id = NEW.worker_id;
  PERFORM public.create_notification(v_job.customer_id, 'new_application', 'New application on "' || v_job.title || '"', COALESCE(v_worker_name, 'A worker') || ' applied with an offer of $' || NEW.offer_price, 'application', NEW.id);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_application_notify AFTER INSERT ON public.applications FOR EACH ROW EXECUTE FUNCTION public.notify_new_application();

CREATE OR REPLACE FUNCTION public.notify_application_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_job_title TEXT;
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  SELECT title INTO v_job_title FROM public.jobs WHERE id = NEW.job_id;
  IF NEW.status = 'accepted' THEN
    PERFORM public.create_notification(NEW.worker_id, 'application_accepted', 'Your application was accepted!', 'You were selected for "' || v_job_title || '"', 'job', NEW.job_id);
  ELSIF NEW.status = 'rejected' THEN
    PERFORM public.create_notification(NEW.worker_id, 'application_rejected', 'Application update', 'Another worker was selected for "' || v_job_title || '"', 'job', NEW.job_id);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_application_status_change AFTER UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.notify_application_status();

CREATE OR REPLACE FUNCTION public.notify_job_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  IF NEW.status = 'pending_review' THEN
    PERFORM public.create_notification(NEW.customer_id, 'job_pending_review', 'Job marked as complete', 'Worker marked "' || NEW.title || '" as complete. Please review.', 'job', NEW.id);
  END IF;
  IF NEW.status = 'completed' AND NEW.selected_worker_id IS NOT NULL THEN
    PERFORM public.create_notification(NEW.selected_worker_id, 'job_completed', 'Job completed!', '"' || NEW.title || '" has been confirmed complete.', 'job', NEW.id);
  END IF;
  IF NEW.status = 'cancelled' AND NEW.selected_worker_id IS NOT NULL THEN
    PERFORM public.create_notification(NEW.selected_worker_id, 'job_cancelled', 'Job cancelled', '"' || NEW.title || '" has been cancelled.', 'job', NEW.id);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_job_status_change AFTER UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.notify_job_status_change();

CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_sender_name TEXT;
BEGIN
  SELECT name INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;
  PERFORM public.create_notification(NEW.receiver_id, 'new_message', 'New message from ' || COALESCE(v_sender_name, 'a user'), LEFT(NEW.content, 100), 'message', NEW.job_id);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_message_notify AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();

-- ============================================================
-- Admin check function (uses user_roles table per security guidelines)
-- ============================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.user_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (is_active = true OR id = auth.uid());
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories (public read)
CREATE POLICY "categories_select" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "categories_admin_all" ON public.categories FOR ALL USING (public.is_admin());

-- Worker profiles
CREATE POLICY "worker_profiles_select" ON public.worker_profiles FOR SELECT USING (true);
CREATE POLICY "worker_profiles_insert" ON public.worker_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "worker_profiles_update" ON public.worker_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "worker_profiles_delete" ON public.worker_profiles FOR DELETE USING (auth.uid() = user_id);

-- Worker skills
CREATE POLICY "worker_skills_select" ON public.worker_skills FOR SELECT USING (true);
CREATE POLICY "worker_skills_insert" ON public.worker_skills FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.worker_profiles WHERE id = worker_id));
CREATE POLICY "worker_skills_update" ON public.worker_skills FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.worker_profiles WHERE id = worker_id));
CREATE POLICY "worker_skills_delete" ON public.worker_skills FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.worker_profiles WHERE id = worker_id));

-- Worker portfolio
CREATE POLICY "worker_portfolio_select" ON public.worker_portfolio FOR SELECT USING (true);
CREATE POLICY "worker_portfolio_insert" ON public.worker_portfolio FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.worker_profiles WHERE id = worker_id));
CREATE POLICY "worker_portfolio_update" ON public.worker_portfolio FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.worker_profiles WHERE id = worker_id));
CREATE POLICY "worker_portfolio_delete" ON public.worker_portfolio FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.worker_profiles WHERE id = worker_id));

-- Worker availability
CREATE POLICY "worker_availability_select" ON public.worker_availability FOR SELECT USING (true);
CREATE POLICY "worker_availability_insert" ON public.worker_availability FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.worker_profiles WHERE id = worker_id));
CREATE POLICY "worker_availability_update" ON public.worker_availability FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.worker_profiles WHERE id = worker_id));
CREATE POLICY "worker_availability_delete" ON public.worker_availability FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.worker_profiles WHERE id = worker_id));

-- Jobs
CREATE POLICY "jobs_select" ON public.jobs FOR SELECT USING (status = 'open' OR customer_id = auth.uid() OR selected_worker_id = auth.uid() OR public.is_admin());
CREATE POLICY "jobs_insert" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "jobs_update" ON public.jobs FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = selected_worker_id OR public.is_admin());

-- Job images
CREATE POLICY "job_images_select" ON public.job_images FOR SELECT USING (true);
CREATE POLICY "job_images_insert" ON public.job_images FOR INSERT WITH CHECK (auth.uid() = (SELECT customer_id FROM public.jobs WHERE id = job_id));
CREATE POLICY "job_images_update" ON public.job_images FOR UPDATE USING (auth.uid() = (SELECT customer_id FROM public.jobs WHERE id = job_id));
CREATE POLICY "job_images_delete" ON public.job_images FOR DELETE USING (auth.uid() = (SELECT customer_id FROM public.jobs WHERE id = job_id));

-- Applications
CREATE POLICY "applications_select" ON public.applications FOR SELECT USING (worker_id = auth.uid() OR (SELECT customer_id FROM public.jobs WHERE id = job_id) = auth.uid() OR public.is_admin());
CREATE POLICY "applications_insert" ON public.applications FOR INSERT WITH CHECK (auth.uid() = worker_id AND auth.uid() != (SELECT customer_id FROM public.jobs WHERE id = job_id) AND (SELECT status FROM public.jobs WHERE id = job_id) = 'open');
CREATE POLICY "applications_update" ON public.applications FOR UPDATE USING (worker_id = auth.uid() OR (SELECT customer_id FROM public.jobs WHERE id = job_id) = auth.uid());

-- Messages
CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "messages_update" ON public.messages FOR UPDATE USING (receiver_id = auth.uid());

-- Reviews
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (is_flagged = false OR public.is_admin());
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id AND (SELECT status FROM public.jobs WHERE id = job_id) IN ('completed', 'resolved'));

-- Payments
CREATE POLICY "payments_select" ON public.payments FOR SELECT USING (payer_id = auth.uid() OR payee_id = auth.uid() OR public.is_admin());

-- Notifications
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Disputes
CREATE POLICY "disputes_select" ON public.disputes FOR SELECT USING (raised_by = auth.uid() OR public.is_admin() OR (SELECT customer_id FROM public.jobs WHERE id = job_id) = auth.uid() OR (SELECT selected_worker_id FROM public.jobs WHERE id = job_id) = auth.uid());
CREATE POLICY "disputes_insert" ON public.disputes FOR INSERT WITH CHECK (raised_by = auth.uid());
CREATE POLICY "disputes_update" ON public.disputes FOR UPDATE USING (public.is_admin());

-- Saved jobs
CREATE POLICY "saved_jobs_select" ON public.saved_jobs FOR SELECT USING (worker_id = auth.uid());
CREATE POLICY "saved_jobs_insert" ON public.saved_jobs FOR INSERT WITH CHECK (worker_id = auth.uid());
CREATE POLICY "saved_jobs_delete" ON public.saved_jobs FOR DELETE USING (worker_id = auth.uid());

-- User roles (admin only + self-read)
CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "user_roles_admin_manage" ON public.user_roles FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "user_roles_admin_delete" ON public.user_roles FOR DELETE USING (public.is_admin());

-- ============================================================
-- Storage buckets
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('job-images', 'job-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true);

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Job images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'job-images');
CREATE POLICY "Users can upload job images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'job-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Portfolio images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
CREATE POLICY "Workers can upload portfolio images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Workers can update portfolio images" ON storage.objects FOR UPDATE USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Workers can delete portfolio images" ON storage.objects FOR DELETE USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- Seed categories
-- ============================================================
INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
  ('Plumbing', 'plumbing', '🔧', 1),
  ('Electrical', 'electrical', '⚡', 2),
  ('Cleaning', 'cleaning', '🧹', 3),
  ('Tutoring', 'tutoring', '📚', 4),
  ('Moving & Hauling', 'moving', '📦', 5),
  ('Painting', 'painting', '🎨', 6),
  ('Gardening', 'gardening', '🌱', 7),
  ('Carpentry', 'carpentry', '🪚', 8),
  ('Appliance Repair', 'appliance-repair', '🔌', 9),
  ('Pet Care', 'pet-care', '🐕', 10),
  ('Photography', 'photography', '📷', 11),
  ('Delivery & Errands', 'delivery', '🚗', 12),
  ('Tech Support', 'tech-support', '💻', 13),
  ('Event Help', 'event-help', '🎉', 14),
  ('Other', 'other', '📋', 15);
