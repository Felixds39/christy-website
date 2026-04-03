import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => (
  <Layout>
    <section className="flex flex-col items-center justify-center py-32 text-center">
      <h1 className="font-display text-6xl font-bold text-gradient">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">Page not found</p>
      <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="mt-8">
        <Button className="bg-brand-gradient text-primary-foreground">
          <Home className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </Link>
    </section>
  </Layout>
);

export default NotFound;
