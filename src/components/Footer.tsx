import { Link } from "react-router-dom";
import { Linkedin, Youtube, Instagram } from "lucide-react";

const Footer = () => (
  <footer className="border-t bg-muted/30 py-12">
    <div className="container mx-auto grid gap-8 px-4 md:grid-cols-3">
      <div>
        <h3 className="font-display text-lg font-bold text-gradient mb-2">Speak_Up wid Chris</h3>
        <p className="text-sm text-muted-foreground">
          Empowering Voices. Inspiring Change.<br />
          Led by Dr. Gincy Susan George
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-sm">Quick Links</h4>
        <div className="flex flex-col gap-1">
          {["/about", "/blog", "/media", "/events", "/contact"].map((p) => (
            <Link key={p} to={p} className="text-sm text-muted-foreground hover:text-primary transition-colors capitalize">
              {p.slice(1)}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-sm">Connect</h4>
        <p className="text-sm text-muted-foreground mb-3">
          Follow on social media for updates on talks, workshops, and new content.
        </p>
        <div className="flex gap-3">
          <a href="https://www.linkedin.com/in/dr-gincy-susan-george-7b52655b/" target="_blank" rel="noopener noreferrer" aria-label="Follow on LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
            <Linkedin className="h-5 w-5" />
          </a>
          <a href="https://www.youtube.com/@gincygeorge3038" target="_blank" rel="noopener noreferrer" aria-label="Follow on YouTube" className="text-muted-foreground hover:text-primary transition-colors">
            <Youtube className="h-5 w-5" />
          </a>
          <a href="https://www.instagram.com/speak_up.widchris?igsh=MW5mNGVmeXhydHh1dQ==" target="_blank" rel="noopener noreferrer" aria-label="Follow on Instagram" className="text-muted-foreground hover:text-primary transition-colors">
            <Instagram className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
    <div className="container mx-auto mt-8 border-t pt-4 px-4">
      <p className="text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Speak_Up wid Chris. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
