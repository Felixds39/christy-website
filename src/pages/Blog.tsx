import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  status: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image_url, published_at, status")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) console.error("Failed to load posts:", error.message);
        setPosts(data || []);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl font-bold text-center">
            <span className="text-gradient">Blog</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Insights on leadership, mental health, and the power of communication.
          </p>

          {loading ? (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="mt-12 text-center text-muted-foreground">No posts yet. Check back soon!</p>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                    {post.cover_image_url && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2 font-display text-lg">{post.title}</CardTitle>
                      {post.published_at && (
                        <CardDescription className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.published_at).toLocaleDateString()}
                        </CardDescription>
                      )}
                    </CardHeader>
                    {post.excerpt && (
                      <CardContent>
                        <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
