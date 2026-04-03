import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface Submission {
  id: string;
  form_type: string;
  data: Record<string, string>;
  email: string | null;
  is_read: boolean;
  created_at: string;
}

const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchSubmissions = async () => {
    const { data } = await supabase.from("form_submissions").select("*").order("created_at", { ascending: false });
    setSubmissions((data as Submission[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const markRead = async (id: string) => {
    const { error } = await supabase.from("form_submissions").update({ is_read: true }).eq("id", id);
    if (error) toast.error("Failed to mark as read.");
    else fetchSubmissions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this submission?")) return;
    const { error } = await supabase.from("form_submissions").delete().eq("id", id);
    if (error) toast.error("Failed to delete submission.");
    else { toast.success("Deleted"); fetchSubmissions(); }
  };

  const filtered = activeTab === "all" ? submissions : submissions.filter((s) => s.form_type === activeTab);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-8">Form Submissions</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? <p>Loading...</p> : filtered.length === 0 ? <p className="text-muted-foreground">No submissions.</p> : (
            <div className="space-y-4">
              {filtered.map((s) => (
                <Card key={s.id} className={!s.is_read ? "border-primary/40" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={s.form_type === "contact" ? "default" : s.form_type === "feedback" ? "secondary" : "outline"}>
                            {s.form_type}
                          </Badge>
                          {!s.is_read && <Badge variant="destructive" className="text-xs">New</Badge>}
                          <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</span>
                        </div>
                        {s.email && <p className="text-sm font-medium">{s.email}</p>}
                        <div className="mt-2 space-y-1">
                          {Object.entries(s.data).map(([key, value]) => (
                            <p key={key} className="text-sm">
                              <span className="font-medium capitalize">{key}:</span>{" "}
                              <span className="text-muted-foreground">{value}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        {!s.is_read && (
                          <Button variant="ghost" size="icon" onClick={() => markRead(s.id)} title="Mark as read">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSubmissions;
