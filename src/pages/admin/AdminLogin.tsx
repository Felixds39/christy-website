import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);
    setLoading(false);
    if (error) {
      console.error("Auth error:", error.message); toast.error("Authentication failed. Please check your credentials.");
    } else {
      toast.success(isSignUp ? "Account created! You can now log in." : "Welcome back!");
      if (!isSignUp) navigate("/admin");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      console.error("Reset error:", error.message); toast.error("Failed to send reset link. Please try again.");
    } else {
      toast.success("Password reset link sent! Check your email.");
      setIsForgot(false);
    }
  };

  if (isForgot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">
              <span className="text-gradient">Reset Password</span>
            </CardTitle>
            <CardDescription>Enter your email to receive a reset link</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></div>
              <Button type="submit" className="w-full bg-brand-gradient text-primary-foreground" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <button onClick={() => setIsForgot(false)} className="text-primary hover:underline">Back to Login</button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">
            <span className="text-gradient">Admin {isSignUp ? "Sign Up" : "Login"}</span>
          </CardTitle>
          <CardDescription>Speak_Up wid Chris — Content Management</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></div>
            <div><Label>Password</Label><Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={12} pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$" title="Password must be at least 12 characters with uppercase, lowercase, and a number" /></div>
            <Button type="submit" className="w-full bg-brand-gradient text-primary-foreground" disabled={loading}>
              {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground space-y-1">
            {!isSignUp && (
              <p>
                <button onClick={() => setIsForgot(true)} className="text-primary hover:underline">Forgot password?</button>
              </p>
            )}
            <p>
              {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline">
                {isSignUp ? "Login" : "Sign Up"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
