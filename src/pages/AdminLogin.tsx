import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, IS_SUPABASE_CONFIGURED } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";

// Temporary test constants: values removed for security
const TEST_EMAIL = "";
const TEST_PASSWORD = "";
const TEST_SESSION_KEY = "pbl_admin_test_session";


const AdminLogin = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Check if there is a confirmation token in the URL hash
      const hash = window.location.hash;
      if (!hash) return;

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (type === "signup" && accessToken && refreshToken) {
        // Set the session from the confirmation tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setError("Email confirmation failed. Please try signing up again.");
          return;
        }

        if (data.user) {
          // Check if profile already exists
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", data.user.id)
            .single();

          // Only create profile if it doesn't exist yet
          if (!existingProfile) {
            await supabase.from("profiles").upsert([{
              id: data.user.id,
              email: data.user.email,
              role: "admin"
            }]);

            // Delete the invite now that signup is complete
            await supabase
              .from("admin_invites")
              .delete()
              .eq("email", data.user.email);
          }

          // Redirect to admin dashboard
          navigate("/admin");
        }
      }
    };

    handleEmailConfirmation();
  }, []);

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

        if (user || (TEST_EMAIL && email === TEST_EMAIL && password === TEST_PASSWORD)) {
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
      setError("");
      setSuccess("");
      try {
        // Step 1: Check if already a profile
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email.trim().toLowerCase())
          .single();

        if (existingProfile) {
          setError("You already have an admin account. Please sign in instead.");
          setLoading(false);
          return;
        }

        // Step 2: Check invite
        const { data: invite, error: inviteError } = await supabase
          .from("admin_invites")
          .select("*")
          .eq("email", email.trim().toLowerCase())
          .single();

        if (inviteError || !invite) {
          setError("You have not been invited as an admin. Contact the owner.");
          setLoading(false);
          return;
        }

        // Step 2: Sign up with Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: "https://perfumesbyluch.com/admin/login",
          }
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        if (data.user && !data.session) {
          // Email confirmation required — show clear message
          setSuccess("Account created! Please check your email and click the confirmation link to activate your account.");
          setLoading(false);
          return;
        }

      } catch (err: any) {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
      return;
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 md:py-0">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 md:p-8 shadow-card-luxe">
        <h1 className="mb-2 text-center font-serif text-2xl md:text-3xl">
          {isSignUp ? "Admin Sign Up" : "Admin Login"}
        </h1>
        {!IS_SUPABASE_CONFIGURED && (
          <p className="mb-6 text-center text-xs text-muted-foreground">
            Test mode active
          </p>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-500 text-center">
            {success}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-muted-foreground transition-smooth hover:text-primary w-full"
          >
            {isSignUp ? "Already have an account? Sign In" : "Invited? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
