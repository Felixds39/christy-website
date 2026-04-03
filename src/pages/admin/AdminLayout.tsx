import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, Image, Calendar, MessageSquare, LogOut, Home } from "lucide-react";
import { useEffect } from "react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/blog", icon: FileText, label: "Blog" },
  { to: "/admin/media", icon: Image, label: "Media" },
  { to: "/admin/events", icon: Calendar, label: "Events" },
  { to: "/admin/submissions", icon: MessageSquare, label: "Submissions" },
];

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate("/admin/login");
  }, [loading, user, navigate]);

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-sidebar p-4 flex flex-col">
        <Link to="/" className="font-display text-lg font-bold text-gradient mb-8">Speak_Up wid Chris</Link>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <Home className="h-4 w-4" /> View Site
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-destructive" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {!isAdmin ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground mt-2">You don't have admin privileges. Contact the site owner.</p>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <Outlet />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLayout;
