import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play } from "lucide-react";

interface MediaItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string;
  category: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

const getEmbedUrl = (url: string, type: string): string | null => {
  if (type === "youtube") {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }
  if (type === "vimeo") {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  }
  return null;
};

const Media = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    let mounted = true;
    supabase
      .from("media_items_public")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) console.error("Failed to load media:", error.message);
        setItems((data as MediaItem[]) || []);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const categories = ["all", ...Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[]];
  const filtered = activeTab === "all" ? items : items.filter((i) => i.category === activeTab);

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-center font-display text-4xl font-bold">
            <span className="text-gradient">Media</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Talks, workshops, lectures, and more from Dr. Gincy Susan George.
          </p>

          {loading ? (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="mt-12 text-center text-muted-foreground">No media yet. Check back soon!</p>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
              {categories.length > 1 && (
                <TabsList className="flex-wrap justify-center">
                  {categories.map((c) => (
                    <TabsTrigger key={c} value={c} className="capitalize">{c}</TabsTrigger>
                  ))}
                </TabsList>
              )}
              <TabsContent value={activeTab} className="mt-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((item) => {
                    const embedUrl = getEmbedUrl(item.url, item.type);
                    return (
                      <Card key={item.id} className="group overflow-hidden transition-all hover:shadow-lg">
                        {item.type === "image" ? (
                          <div className="h-48 overflow-hidden">
                            <img src={item.url} alt={item.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                          </div>
                        ) : embedUrl ? (
                          <div className="aspect-video">
                            <iframe
                              src={embedUrl}
                              title={item.title}
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex h-48 items-center justify-center bg-muted">
                            <Play className="h-12 w-12 text-muted-foreground" />
                          </a>
                        )}
                        <CardContent className="p-4">
                          <h3 className="font-display font-semibold">{item.title}</h3>
                          {item.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                            {item.category && <Badge variant="outline" className="text-xs">{item.category}</Badge>}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Media;
