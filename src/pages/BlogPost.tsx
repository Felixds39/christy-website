import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Post {
  id: string;
  title: string;
  content: string;
  cover_image_url: string | null;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => {
        setPost(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <Layout><div className="container mx-auto py-20 px-4"><div className="h-96 animate-pulse rounded-xl bg-muted" /></div></Layout>;
  if (!post) return <Layout><div className="container mx-auto py-20 px-4 text-center"><h1 className="text-2xl font-bold">Post not found</h1><Link to="/blog"><Button variant="link" className="mt-4">Back to Blog</Button></Link></div></Layout>;

  return (
    <Layout>
      <article className="py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <Link to="/blog">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Blog
            </Button>
          </Link>
          {post.cover_image_url && (
            <img src={post.cover_image_url} alt={post.title} className="mb-8 w-full rounded-xl object-cover max-h-96" />
          )}
          <h1 className="font-display text-4xl font-bold">{post.title}</h1>
          {post.published_at && (
            <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
          <div
            className="prose prose-lg mt-8 max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />
        </div>
      </article>
    </Layout>
  );
};

export default BlogPost;
