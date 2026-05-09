import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const AdminRegister = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase puts the session in the URL hash after invite link click
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        setEmail(session.user.email || "");
        setSessionReady(true);
      }
      if (event === "PASSWORD_RECOVERY") {
        setEmail(session?.user.email || "");
        setSessionReady(true);
      }
    });
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      toast({
        title: "Registration Failed",
        description: updateError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Create profile
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from("profiles").upsert({
        id: session.user.id,
        email: session.user.email,
        role: "admin"
      });

      // Remove from invites
      await supabase
        .from("admin_invites")
        .delete()
        .eq("email", session.user.email);
    }

    toast({
      title: "Account Created!",
      description: "Welcome to the admin dashboard.",
    });

    navigate("/admin");
    setLoading(false);
  };

  if (!sessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            Verifying your invite link...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card-luxe">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl">Complete Registration</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You've been invited as an admin
          </p>
          {email && (
            <p className="mt-1 text-sm font-medium text-primary">{email}</p>
          )}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm">Create Password</label>
            <input
              type="password"
              required
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary/60 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Confirm Password</label>
            <input
              type="password"
              required
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary/60 focus:outline-none"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Complete Registration"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;
