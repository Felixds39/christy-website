import { useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Linkedin, Youtube, Instagram } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const subject = fd.get("subject") as string;
    const message = fd.get("message") as string;

    const { error } = await supabase.from("form_submissions").insert({
      form_type: "contact",
      email,
      data: { name, email, subject, message },
    });

    setSubmitting(false);
    if (error) {
      toast.error("Failed to send message. Please try again.");
    } else {
      toast.success("Message sent! We'll get back to you soon.");
      e.currentTarget.reset();
    }
  };

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-center font-display text-4xl font-bold">
            <span className="text-gradient">Contact</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Have a question, collaboration idea, or just want to say hello? Reach out!
          </p>

          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Send a Message</CardTitle>
                <CardDescription>Fill out the form and we'll respond as soon as possible.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div><Label>Name *</Label><Input name="name" required /></div>
                  <div><Label>Email *</Label><Input name="email" type="email" required /></div>
                  <div><Label>Subject *</Label><Input name="subject" required /></div>
                  <div><Label>Message *</Label><Textarea name="message" required rows={5} /></div>
                  <Button type="submit" className="w-full bg-brand-gradient text-primary-foreground" disabled={submitting}>
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold mb-4">Connect With Us</h3>
                  <div className="space-y-4">
                    <a
                      href="https://www.linkedin.com/in/dr-gincy-susan-george-7b52655b/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Linkedin className="h-5 w-5" /> LinkedIn
                    </a>
                    <a
                      href="https://www.youtube.com/@gincygeorge3038"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Youtube className="h-5 w-5" /> YouTube
                    </a>
                    <a
                      href="https://www.instagram.com/speak_up.widchris?igsh=MW5mNGVmeXhydHh1dQ=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Instagram className="h-5 w-5" /> Instagram
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold mb-2">Newsletter</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Stay updated with the latest talks, events, and blog posts.
                  </p>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const email = fd.get("newsletter_email") as string;
                      const { error } = await supabase.from("form_submissions").insert({
                        form_type: "newsletter",
                        email,
                        data: { email },
                      });
                      if (error) toast.error("Subscription failed. Please try again.");
                      else { toast.success("Subscribed!"); e.currentTarget.reset(); }
                    }}
                    className="flex gap-2"
                  >
                    <Input name="newsletter_email" type="email" placeholder="your@email.com" required className="flex-1" />
                    <Button type="submit" className="bg-brand-gradient text-primary-foreground">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
