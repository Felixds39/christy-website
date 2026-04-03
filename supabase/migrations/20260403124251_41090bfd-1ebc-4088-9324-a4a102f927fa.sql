
-- 1. Create a public view for media_items that hides uploaded_by
CREATE VIEW public.media_items_public
WITH (security_invoker = on) AS
SELECT id, title, description, type, url, thumbnail_url, category, created_at
FROM public.media_items;

-- 2. Restrict profiles: users can only see their own profile, admins see all
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
