
-- Enable reviewers to edit and delete their own reviews
CREATE POLICY "reviews_update" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id);
CREATE POLICY "reviews_delete" ON public.reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- Update the user rating trigger to handle updates and deletes
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    r_id UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        r_id := OLD.reviewee_id;
    ELSE
        r_id := NEW.reviewee_id;
    END IF;

    UPDATE public.profiles SET
        avg_rating = (SELECT COALESCE(AVG(rating::numeric), 0) FROM public.reviews WHERE reviewee_id = r_id),
        total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE reviewee_id = r_id)
    WHERE id = r_id;

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop and recreate the trigger to cover all operations
DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
CREATE TRIGGER on_review_change 
AFTER INSERT OR UPDATE OR DELETE ON public.reviews 
FOR EACH ROW EXECUTE FUNCTION public.update_user_rating();
