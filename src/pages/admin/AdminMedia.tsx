import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string;
  category: string | null;
  created_at: string;
}

const categories = ["Talks", "Workshops", "Lectures", "Events", "Interviews", "Other"];
const types = ["image", "video", "youtube", "vimeo"];

const AdminMedia = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    const { data } = await supabase.from("media_items").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleFileUpload = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast.error("Upload failed"); return null; }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const fd = new FormData(e.currentTarget);
    const type = fd.get("type") as string;
    let url = fd.get("url") as string;

    const file = fd.get("file") as File;
    if (file && file.size > 0) {
      const uploadedUrl = await handleFileUpload(file);
      if (!uploadedUrl) { setUploading(false); return; }
      url = uploadedUrl;
    }

    if (!url) { toast.error("Please provide a URL or upload a file"); setUploading(false); return; }

    const { error } = await supabase.from("media_items").insert({
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || null,
      type,
      url,
      category: (fd.get("category") as string) || null,
      uploaded_by: user?.id,
    });

    setUploading(false);
    if (error) { console.error("Media save error:", error.message); toast.error("Failed to add media. Please try again."); }
    else { toast.success("Media added!"); setDialogOpen(false); fetchItems(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this media?")) return;
    await supabase.from("media_items").delete().eq("id", id);
    toast.success("Deleted");
    fetchItems();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Media Manager</h1>
        <Button onClick={() => setDialogOpen(true)} className="bg-brand-gradient text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" />Add Media
        </Button>
      </div>

      {loading ? <p>Loading...</p> : items.length === 0 ? <p className="text-muted-foreground">No media yet.</p> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.type === "image" ? (
                <div className="h-40 overflow-hidden"><img src={item.url} alt={item.title} className="h-full w-full object-cover" /></div>
              ) : (
                <div className="h-40 flex items-center justify-center bg-muted text-muted-foreground text-sm">
                  {item.type.toUpperCase()} — {item.url.substring(0, 40)}...
                </div>
              )}
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  {item.category && <span className="text-xs text-muted-foreground">{item.category}</span>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Media</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div><Label>Title *</Label><Input name="title" required /></div>
            <div><Label>Description</Label><Textarea name="description" rows={2} /></div>
            <div>
              <Label>Type *</Label>
              <Select name="type" defaultValue="image">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select name="category">
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>URL (or upload below)</Label><Input name="url" placeholder="https://youtube.com/..." /></div>
            <div><Label>Upload File</Label><Input name="file" type="file" accept="image/*,video/*" /></div>
            <Button type="submit" className="w-full bg-brand-gradient text-primary-foreground" disabled={uploading}>
              {uploading ? "Uploading..." : "Add Media"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMedia;
