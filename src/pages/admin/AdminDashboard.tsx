import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image, Calendar, MessageSquare } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ posts: 0, media: 0, events: 0, submissions: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      supabase.from("media_items").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase.from("form_submissions").select("id", { count: "exact", head: true }).eq("is_read", false),
    ]).then(([posts, media, events, submissions]) => {
      setStats({
        posts: posts.count || 0,
        media: media.count || 0,
        events: events.count || 0,
        submissions: submissions.count || 0,
      });
    });
  }, []);

  const cards = [
    { title: "Blog Posts", value: stats.posts, icon: FileText, color: "text-primary" },
    { title: "Media Items", value: stats.media, icon: Image, color: "text-secondary" },
    { title: "Events", value: stats.events, icon: Calendar, color: "text-primary" },
    { title: "Unread Submissions", value: stats.submissions, icon: MessageSquare, color: "text-destructive" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
