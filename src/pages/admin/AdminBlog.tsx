import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import RichTextEditor from "@/components/RichTextEditor";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  status: string;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
}

const AdminBlog = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  const fetchPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const status = fd.get("status") as string;
    const payload = {
      title,
      slug: slugify(title),
      content: editorContent,
      excerpt: (fd.get("excerpt") as string) || null,
      cover_image_url: (fd.get("cover_image_url") as string) || null,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
      meta_title: (fd.get("meta_title") as string) || null,
      meta_description: (fd.get("meta_description") as string) || null,
      author_id: user?.id,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("blog_posts").insert(payload));
    }

    if (error) { console.error("Blog save error:", error.message); toast.error("Failed to save post. Please try again."); }
    else { toast.success("Post saved!"); setDialogOpen(false); setEditing(null); fetchPosts(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) { console.error("Blog delete error:", error.message); toast.error("Failed to delete post. Please try again."); }
    else { toast.success("Deleted"); fetchPosts(); }
  };

  const openEdit = (post: BlogPost) => { setEditing(post); setEditorContent(post.content); setDialogOpen(true); };
  const openNew = () => { setEditing(null); setEditorContent(""); setDialogOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Blog Posts</h1>
        <Button onClick={openNew} className="bg-brand-gradient text-primary-foreground"><Plus className="h-4 w-4 mr-1" />New Post</Button>
      </div>

      {loading ? <p>Loading...</p> : posts.length === 0 ? <p className="text-muted-foreground">No posts yet.</p> : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-semibold">{post.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(post)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div><Label>Title *</Label><Input name="title" defaultValue={editing?.title} required /></div>
            <div><Label>Excerpt</Label><Textarea name="excerpt" defaultValue={editing?.excerpt || ""} rows={2} /></div>
            <div>
              <Label>Content *</Label>
              <RichTextEditor
                key={editing?.id || "new"}
                content={editorContent}
                onChange={setEditorContent}
              />
            </div>
            <div><Label>Cover Image URL</Label><Input name="cover_image_url" defaultValue={editing?.cover_image_url || ""} /></div>
            <div>
              <Label>Status</Label>
              <Select name="status" defaultValue={editing?.status || "draft"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Meta Title</Label><Input name="meta_title" defaultValue={editing?.meta_title || ""} /></div>
            <div><Label>Meta Description</Label><Textarea name="meta_description" defaultValue={editing?.meta_description || ""} rows={2} /></div>
            <Button type="submit" className="w-full bg-brand-gradient text-primary-foreground">
              {editing ? "Update" : "Create"} Post
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
