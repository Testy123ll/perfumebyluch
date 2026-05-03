import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, IS_SUPABASE_CONFIGURED } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Temporary test credentials — remove once real Supabase auth is set up
const TEST_EMAIL = "luchpfume@gmail.com";
const TEST_PASSWORD = "luchperfume";
const TEST_SESSION_KEY = "pbl_admin_test_session";


const AdminLogin = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("luchpfume@gmail.com");
  const [password, setPassword] = useState("luchperfume");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Use local test auth when Supabase is not configured yet
    if (!IS_SUPABASE_CONFIGURED) {
      if (isSignUp) {
        const users = JSON.parse(localStorage.getItem("pbl_mock_users") || "[]");
        if (users.find((u: any) => u.email === email)) {
          toast({ title: "Error", description: "User already exists", variant: "destructive" });
        } else {
          users.push({ email, password });
          localStorage.setItem("pbl_mock_users", JSON.stringify(users));
          toast({ title: "Success", description: "Mock account created! You can now sign in." });
          setIsSignUp(false);
        }
      } else {
        const users = JSON.parse(localStorage.getItem("pbl_mock_users") || "[]");
        const user = users.find((u: any) => u.email === email && u.password === password);

        if (user || (email === TEST_EMAIL && password === TEST_PASSWORD)) {
          localStorage.setItem(TEST_SESSION_KEY, "true");
          navigate("/admin", { replace: true });
        } else {
          toast({ title: "Invalid credentials", description: "Wrong email or password.", variant: "destructive" });
        }
      }
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const { data: invite, error: inviteError } = await supabase
        .from("admin_invites")
        .select("email")
        .eq("email", email)
        .single();

      if (inviteError || !invite) {
        toast({ title: "Access Denied", description: "You have not been invited to this admin panel.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else if (data?.user) {
        // 1. Insert into profiles
        await supabase.from("profiles").insert([{ id: data.user.id, email: email, role: 'admin' }]);
        
        // 2. Delete from invites
        await supabase.from("admin_invites").delete().eq("email", email);

        // 3. Auto Sign In
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        
        if (signInError) {
          toast({ title: "Error signing in", description: signInError.message, variant: "destructive" });
        } else {
          toast({ title: "Success", description: "Account created successfully. Welcome to the admin panel!" });
          navigate("/admin", { replace: true });
        }
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else if (data?.session) {
        navigate("/admin", { replace: true });
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-card-luxe">
        <h1 className="mb-2 text-center font-serif text-3xl">
          {isSignUp ? "Admin Sign Up" : "Admin Login"}
        </h1>
        {!IS_SUPABASE_CONFIGURED && (
          <p className="mb-6 text-center text-xs text-muted-foreground">
            Test mode — using local credentials
          </p>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-muted-foreground transition-smooth hover:text-primary"
          >
            {isSignUp ? "Already have an account? Sign In" : "Invited? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
