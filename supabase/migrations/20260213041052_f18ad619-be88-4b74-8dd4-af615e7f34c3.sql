
-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table (as per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Convenience function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Blog categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Blog tags
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Blog posts
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  cover_image_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Post categories junction
CREATE TABLE public.post_categories (
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (post_id, category_id)
);
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

-- Post tags junction
CREATE TABLE public.post_tags (
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (post_id, tag_id)
);
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- Media items
CREATE TABLE public.media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'youtube', 'vimeo')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT CHECK (category IN ('Talks', 'Workshops', 'Lectures', 'Events', 'Interviews', 'Other')),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ,
  max_attendees INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Event registrations
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Form submissions (contact, feedback, newsletter)
CREATE TABLE public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type TEXT NOT NULL CHECK (form_type IN ('contact', 'feedback', 'newsletter')),
  data JSONB NOT NULL DEFAULT '{}',
  email TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Storage bucket for media
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- ============ RLS POLICIES ============

-- user_roles: only admin can read
CREATE POLICY "Admin can read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admin can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin());

-- profiles
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Admin can manage profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

-- categories & tags: public read, admin write
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Public can read tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Admin can manage tags" ON public.tags FOR ALL TO authenticated USING (public.is_admin());

-- blog_posts: public reads published, admin full access
CREATE POLICY "Public can read published posts" ON public.blog_posts FOR SELECT USING (
  (status = 'published' AND published_at IS NOT NULL AND published_at <= now())
  OR public.is_admin()
);
CREATE POLICY "Admin can insert posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update posts" ON public.blog_posts FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admin can delete posts" ON public.blog_posts FOR DELETE TO authenticated USING (public.is_admin());

-- post_categories & post_tags
CREATE POLICY "Public can read post_categories" ON public.post_categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage post_categories" ON public.post_categories FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Public can read post_tags" ON public.post_tags FOR SELECT USING (true);
CREATE POLICY "Admin can manage post_tags" ON public.post_tags FOR ALL TO authenticated USING (public.is_admin());

-- media_items: public read, admin write
CREATE POLICY "Public can read media" ON public.media_items FOR SELECT USING (true);
CREATE POLICY "Admin can insert media" ON public.media_items FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update media" ON public.media_items FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admin can delete media" ON public.media_items FOR DELETE TO authenticated USING (public.is_admin());

-- events: public reads published, admin full access
CREATE POLICY "Public can read published events" ON public.events FOR SELECT USING (is_published OR public.is_admin());
CREATE POLICY "Admin can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update events" ON public.events FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admin can delete events" ON public.events FOR DELETE TO authenticated USING (public.is_admin());

-- event_registrations: public can insert, admin can read/manage
CREATE POLICY "Public can register for events" ON public.event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read registrations" ON public.event_registrations FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admin can manage registrations" ON public.event_registrations FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admin can delete registrations" ON public.event_registrations FOR DELETE TO authenticated USING (public.is_admin());

-- form_submissions: public can insert, admin can read/manage
CREATE POLICY "Public can submit forms" ON public.form_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read submissions" ON public.form_submissions FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admin can delete submissions" ON public.form_submissions FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Admin can update submissions" ON public.form_submissions FOR UPDATE TO authenticated USING (public.is_admin());

-- Storage policies for media bucket
CREATE POLICY "Public can read media files" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admin can upload media files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "Admin can update media files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "Admin can delete media files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_admin());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
