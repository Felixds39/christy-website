import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string | null;
  max_attendees: number | null;
}

const Events = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [regDialogOpen, setRegDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("events")
      .select("id, title, description, location, start_time, end_time, max_attendees")
      .eq("is_published", true)
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) console.error("Failed to load events:", error.message);
        setEvents(data || []);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("event_registrations").insert({
      event_id: selectedEvent.id,
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: (fd.get("phone") as string) || null,
      message: (fd.get("message") as string) || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Registration failed. Please try again.");
    } else {
      toast.success("Registered successfully!");
      setRegDialogOpen(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric" });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-center font-display text-4xl font-bold">
            <span className="text-gradient">Upcoming Events</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Workshops, talks, and sessions on leadership, mental health, and communication.
          </p>

          {loading ? (
            <div className="mt-12 space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <p className="mt-12 text-center text-muted-foreground">No upcoming events. Check back soon!</p>
          ) : (
            <div className="mx-auto mt-12 max-w-3xl space-y-6">
              {events.map((event) => (
                <Card key={event.id} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="font-display text-xl">{event.title}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-4 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> {formatDate(event.start_time)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {formatTime(event.start_time)}
                        {event.end_time && ` - ${formatTime(event.end_time)}`}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {event.location}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {event.description && (
                      <p className="mb-4 text-sm text-muted-foreground">{event.description}</p>
                    )}
                    <div className="flex items-center gap-3">
                      <Button
                        className="bg-brand-gradient text-primary-foreground"
                        onClick={() => { setSelectedEvent(event); setRegDialogOpen(true); }}
                      >
                        Register Now
                      </Button>
                      {event.max_attendees && (
                        <Badge variant="outline">{event.max_attendees} spots</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={regDialogOpen} onOpenChange={setRegDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register for {selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4">
            <div><Label>Name *</Label><Input name="name" required /></div>
            <div><Label>Email *</Label><Input name="email" type="email" required /></div>
            <div><Label>Phone</Label><Input name="phone" type="tel" /></div>
            <div><Label>Message</Label><Textarea name="message" rows={2} /></div>
            <Button type="submit" className="w-full bg-brand-gradient text-primary-foreground" disabled={submitting}>
              {submitting ? "Registering..." : "Register"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Events;
