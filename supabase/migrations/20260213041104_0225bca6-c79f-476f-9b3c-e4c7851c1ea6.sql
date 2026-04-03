
-- Fix permissive INSERT policies by adding email validation
DROP POLICY "Public can register for events" ON public.event_registrations;
CREATE POLICY "Public can register for events" ON public.event_registrations 
  FOR INSERT WITH CHECK (email IS NOT NULL AND email <> '' AND name IS NOT NULL AND name <> '');

DROP POLICY "Public can submit forms" ON public.form_submissions;
CREATE POLICY "Public can submit forms" ON public.form_submissions 
  FOR INSERT WITH CHECK (form_type IS NOT NULL AND data IS NOT NULL);
