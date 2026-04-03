import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/media", label: "Media" },
  { to: "/events", label: "Events" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-gradient">Speak_Up wid Chris</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === l.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin">
              <Button size="sm" variant="outline">Dashboard</Button>
            </Link>
          )}
          {!isAdmin && (
            <Link to="/admin/login">
              <Button size="sm" variant="ghost"><LogIn className="h-4 w-4" /></Button>
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="border-t bg-background px-4 pb-4 md:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block py-2 text-sm font-medium ${
                location.pathname === l.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin ? (
            <Link to="/admin" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-primary">
              Dashboard
            </Link>
          ) : (
            <Link to="/admin/login" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-muted-foreground">
              Admin Login
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
