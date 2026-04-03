import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

interface EventType {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string | null;
  is_published: boolean;
  max_attendees: number | null;
  created_at: string;
}

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
}

const AdminEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [regsDialogOpen, setRegsDialogOpen] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const fetchEvents = async () => {
    const { data } = await supabase.from("events").select("*").order("start_time", { ascending: false });
    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || null,
      location: (fd.get("location") as string) || null,
      start_time: fd.get("start_time") as string,
      end_time: (fd.get("end_time") as string) || null,
      max_attendees: fd.get("max_attendees") ? Number(fd.get("max_attendees")) : null,
      is_published: fd.get("is_published") === "on",
      created_by: user?.id,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("events").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("events").insert(payload));
    }

    if (error) toast.error(error.message);
    else { toast.success("Event saved!"); setDialogOpen(false); setEditing(null); fetchEvents(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", id);
    toast.success("Deleted");
    fetchEvents();
  };

  const viewRegistrations = async (eventId: string) => {
    const { data } = await supabase.from("event_registrations").select("*").eq("event_id", eventId).order("created_at", { ascending: false });
    setRegistrations(data || []);
    setRegsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Events</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="bg-brand-gradient text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" />New Event
        </Button>
      </div>

      {loading ? <p>Loading...</p> : events.length === 0 ? <p className="text-muted-foreground">No events yet.</p> : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={event.is_published ? "default" : "secondary"}>{event.is_published ? "Published" : "Draft"}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(event.start_time).toLocaleDateString()}</span>
                    {event.location && <span className="text-xs text-muted-foreground">📍 {event.location}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => viewRegistrations(event.id)} title="View Registrations"><Users className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(event); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Event" : "New Event"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div><Label>Title *</Label><Input name="title" defaultValue={editing?.title} required /></div>
            <div><Label>Description</Label><Textarea name="description" defaultValue={editing?.description || ""} /></div>
            <div><Label>Location</Label><Input name="location" defaultValue={editing?.location || ""} /></div>
            <div><Label>Start Time *</Label><Input name="start_time" type="datetime-local" defaultValue={editing ? editing.start_time.slice(0, 16) : ""} required /></div>
            <div><Label>End Time</Label><Input name="end_time" type="datetime-local" defaultValue={editing?.end_time?.slice(0, 16) || ""} /></div>
            <div><Label>Max Attendees</Label><Input name="max_attendees" type="number" defaultValue={editing?.max_attendees || ""} /></div>
            <div className="flex items-center gap-2"><Switch name="is_published" defaultChecked={editing?.is_published} /><Label>Published</Label></div>
            <Button type="submit" className="w-full bg-brand-gradient text-primary-foreground">{editing ? "Update" : "Create"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={regsDialogOpen} onOpenChange={setRegsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Registrations</DialogTitle></DialogHeader>
          {registrations.length === 0 ? <p className="text-muted-foreground">No registrations yet.</p> : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {registrations.map((r) => (
                <div key={r.id} className="rounded-lg border p-3">
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.email}{r.phone && ` · ${r.phone}`}</p>
                  <Badge className="mt-1" variant="secondary">{r.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEvents;
