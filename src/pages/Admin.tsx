import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Product, IS_SUPABASE_CONFIGURED } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Trash2, Edit2, Eye, EyeOff, Plus, LogOut, Loader2,
  Shield, ShieldOff, Mail, User, History, Star, CheckCircle2,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────
const OWNER_ID = "7a7f1bb0-6aa6-42e6-80e3-7e4f7a48491e";
const TEST_SESSION_KEY = "pbl_admin_test_session";
const MAX_VIDEO_SIZE_MB = 100;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "products" | "reviews" | "team" | "activity";
type TeamMember = {
  id?: string;
  email: string;
  role: string;
  status: "active" | "pending" | "restricted";
  created_at: string;
};
type LogEntry = {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_name: string;
  created_at: string;
};

// ─── Upload helpers ───────────────────────────────────────────────────────────

/** Upload any file using FormData — works on Chrome Android without size limits */
const uploadViaFormData = (
  file: File,
  storagePath: string,
  authToken: string,
  supabaseUrl: string,
  supabaseKey: string,
  onProgress: (msg: string) => void
): Promise<{ publicUrl: string | null; error: string | null }> =>
  new Promise((resolve) => {
    let done = false;
    const finish = (v: { publicUrl: string | null; error: string | null }) => {
      if (!done) { done = true; resolve(v); }
    };

    const formData = new FormData();
    formData.append("", file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.timeout = 600_000; // 10 min for large videos

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(`Uploading... ${pct}%`);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const { data } = supabase.storage.from("products").getPublicUrl(storagePath);
        finish({ publicUrl: data.publicUrl, error: null });
      } else {
        finish({ publicUrl: null, error: `Server error ${xhr.status}: ${xhr.responseText}` });
      }
    };
    xhr.onerror   = () => finish({ publicUrl: null, error: "Network error — check your connection." });
    xhr.ontimeout = () => finish({ publicUrl: null, error: "Upload timed out — try a smaller file or better connection." });

    xhr.open("POST", `${supabaseUrl}/storage/v1/object/products/${storagePath}`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${authToken}`);
    xhr.setRequestHeader("apikey", supabaseKey);
    xhr.setRequestHeader("x-upsert", "true");
    // Do NOT set Content-Type — browser sets it automatically with multipart boundary
    xhr.send(formData);
  });

/** Simple Supabase SDK upload — fast, reliable for images */
const uploadImage = async (
  file: File,
  folder: string
): Promise<{ url: string; error: string | null }> => {
  const ext  = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("products")
    .upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: true });
  if (error) return { url: "", error: error.message };
  const { data } = supabase.storage.from("products").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
};

// ─── Component ────────────────────────────────────────────────────────────────
const Admin = () => {
  const navigate = useNavigate();

  // Auth
  const [session,      setSession]      = useState<any>(null);
  const [userRole,     setUserRole]     = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // UI
  const [activeTab,       setActiveTab]       = useState<Tab>("products");
  const [uploadProgress,  setUploadProgress]  = useState("");

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "", price: "", description: "", category: "Unboxed",
    in_stock: true, visible: true, is_new: false,
    video_url: "", size: "", scent_mood: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewFormData, setReviewFormData] = useState({
    reviewer_name: "", product_id: "", rating: 5, comment: "", verified: false,
  });

  // Team
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState("");

  // Activity
  const [logs,            setLogs]            = useState<LogEntry[]>([]);
  const [logFilterAdmin,  setLogFilterAdmin]  = useState("all");
  const [logFilterAction, setLogFilterAction] = useState("all");

  // ── Fetchers ────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setProducts(data || []);
    setLoading(false);
  }, []);

  const fetchReviews = useCallback(async () => {
    const { data, error } = await supabase
      .from("reviews").select("*, products(name)").order("created_at", { ascending: false });
    if (!error) setReviews(data || []);
  }, []);

  const fetchLogs = useCallback(async () => {
    let q = supabase.from("activity_log").select("*")
      .order("created_at", { ascending: false }).limit(100);
    if (logFilterAdmin  !== "all") q = q.eq("admin_email", logFilterAdmin);
    if (logFilterAction !== "all") q = q.eq("action",      logFilterAction);
    const { data, error } = await q;
    if (!error) setLogs(data || []);
  }, [logFilterAdmin, logFilterAction]);

  const fetchTeam = useCallback(async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: invites  } = await supabase.from("admin_invites").select("*");
    const profileEmails = new Set((profiles || []).map((p: any) => p.email));
    const combined: TeamMember[] = [
      ...((profiles as any[]) || []).map((p) => ({
        id: p.id, email: p.email, role: p.role,
        status: (p.role === "restricted" ? "restricted" : "active") as TeamMember["status"],
        created_at: p.created_at,
      })),
      ...((invites as any[]) || []).filter((i) => !profileEmails.has(i.email)).map((i) => ({
        email: i.email, role: "admin", status: "pending" as const, created_at: i.created_at,
      })),
    ];
    combined.sort((a, b) => {
      if (a.role === "owner" && b.role !== "owner") return -1;
      if (b.role === "owner" && a.role !== "owner") return  1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setTeam(combined);
  }, []);

  const logAction = async (action: string, target_type: string, target_name: string) => {
    if (!session?.user?.id) return;
    await supabase.from("activity_log").insert([{
      admin_id: session.user.id, admin_email: session.user.email,
      action, target_type, target_name,
    }]);
    fetchLogs();
  };

  // ── Auth ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      setAuthChecking(true);
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!s) { navigate("/admin/login"); setAuthChecking(false); return; }
      setSession(s);

      const { data: profile, error: pErr } = await supabase
        .from("profiles").select("role").eq("id", s.user.id).single();

      if (pErr || !profile) {
        const { data: invite } = await supabase
          .from("admin_invites").select("*").eq("email", s.user.email).single();
        if (invite) {
          const { error: iErr } = await supabase.from("profiles")
            .insert([{ id: s.user.id, email: s.user.email, role: "admin" }]);
          if (!iErr) {
            setUserRole("admin");
            await supabase.from("admin_invites").delete().eq("email", s.user.email);
          } else {
            toast({ title: "Profile Error", description: "Could not init admin profile.", variant: "destructive" });
            await supabase.auth.signOut(); navigate("/admin/login"); setAuthChecking(false); return;
          }
        } else {
          toast({ title: "Access Denied", description: "You have not been invited as an admin.", variant: "destructive" });
          await supabase.auth.signOut(); navigate("/admin/login"); setAuthChecking(false); return;
        }
      } else {
        if (profile.role !== "admin" && profile.role !== "owner") {
          toast({ title: "Access Denied", description: "Unauthorized role.", variant: "destructive" });
          await supabase.auth.signOut(); navigate("/admin/login"); setAuthChecking(false); return;
        }
        setUserRole(profile.role);
      }
      setAuthChecking(false);
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) navigate("/admin/login"); else setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!session) return;
    fetchProducts(); fetchReviews(); fetchLogs();
    if (userRole === "owner") fetchTeam();
  }, [session, userRole]);

  useEffect(() => { if (session) fetchLogs(); }, [logFilterAdmin, logFilterAction]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    localStorage.removeItem(TEST_SESSION_KEY);
    if (IS_SUPABASE_CONFIGURED) await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", price: "", description: "", category: "Unboxed",
      in_stock: true, visible: true, is_new: false, video_url: "", size: "", scent_mood: "" });
    setImageFile(null); setVideoFile(null); setShowForm(false);
  };

  // ── Product handlers ─────────────────────────────────────────────────────────
  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData({
      name: p.name, price: p.price.toString(), description: p.description || "",
      category: p.category, in_stock: p.in_stock, visible: p.visible,
      is_new: p.is_new ?? false, video_url: p.video_url || "",
      size: p.size || "", scent_mood: p.scent_mood || "",
    });
    setImageFile(null); setVideoFile(null); setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted", description: name }); logAction("Deleted product", "product", name); fetchProducts(); }
  };

  const handleToggleVisibility = async (p: Product) => {
    const { error } = await supabase.from("products").update({ visible: !p.visible }).eq("id", p.id);
    if (!error) { logAction(p.visible ? "Hidden product" : "Showed product", "product", p.name); fetchProducts(); }
  };

  const handleToggleStock = async (p: Product) => {
    const { error } = await supabase.from("products").update({ in_stock: !p.in_stock }).eq("id", p.id);
    if (!error) { logAction("Toggled stock", "product", p.name); fetchProducts(); }
  };

  const handleToggleNewArrival = async (p: Product) => {
    const { error } = await supabase.from("products").update({ is_new: !p.is_new }).eq("id", p.id);
    if (!error) { logAction(p.is_new ? "Removed from New" : "Marked as New", "product", p.name); fetchProducts(); }
  };

  const handleToggleBestSeller = async (p: Product) => {
    if (!p.is_bestseller && products.filter(x => x.is_bestseller).length >= 6) {
      toast({ title: "Limit Reached", description: "Max 6 Top Sellers. Remove one first.", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("products").update({ is_bestseller: !p.is_bestseller }).eq("id", p.id);
    if (!error) { logAction(!p.is_bestseller ? "Marked Top Seller" : "Removed Top Seller", "product", p.name); fetchProducts(); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const { data: { session: s } } = await supabase.auth.getSession();
    const authToken = s?.access_token || supabaseKey;

    let image_url = editingId ? products.find(p => p.id === editingId)?.image_url || "" : "";
    let video_url = editingId ? products.find(p => p.id === editingId)?.video_url || "" : "";

    // Upload image via Supabase SDK (reliable, no size concern for images)
    if (imageFile) {
      setUploadProgress("Uploading image...");
      const r = await uploadImage(imageFile, "product-images");
      if (r.error) {
        toast({ title: "Image Upload Failed", description: r.error, variant: "destructive" });
        setLoading(false); setUploadProgress(""); return;
      }
      image_url = r.url;
    }

    // Upload video via FormData XHR — bypasses Chrome Android binary size limit
    if (videoFile) {
      const videoPath = `product-videos/${Date.now()}.${videoFile.name.split(".").pop()}`;
      setUploadProgress("Uploading video...");
      const r = await uploadViaFormData(
        videoFile, videoPath, authToken, supabaseUrl, supabaseKey, setUploadProgress
      );
      if (r.error) {
        toast({ title: "Video Upload Failed", description: r.error, variant: "destructive" });
        setLoading(false); setUploadProgress(""); return;
      }
      video_url = r.publicUrl || "";
    }

    setUploadProgress("");

    const payload = {
      name: formData.name, price: parseFloat(formData.price),
      description: formData.description, category: formData.category,
      in_stock: formData.in_stock, visible: formData.visible, is_new: formData.is_new,
      video_url, size: formData.size, scent_mood: formData.scent_mood,
      ...(image_url ? { image_url } : {}),
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else { toast({ title: "Updated", description: formData.name }); logAction("Edited product", "product", formData.name); resetForm(); fetchProducts(); }
    } else {
      const { error } = await supabase.from("products").insert([payload]);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else { toast({ title: "Created", description: formData.name }); logAction("Added product", "product", formData.name); resetForm(); fetchProducts(); }
    }
    setLoading(false);
  };

  // ── Review handlers ──────────────────────────────────────────────────────────
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("reviews").insert([reviewFormData]);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Review added" });
      logAction("Manually added review", "review", reviewFormData.reviewer_name);
      setReviewFormData({ reviewer_name: "", product_id: "", rating: 5, comment: "", verified: false });
      fetchReviews();
    }
  };

  const handleToggleReviewVisibility = async (id: string, current: boolean, name: string) => {
    const { error } = await supabase.from("reviews").update({ visible: !current }).eq("id", id);
    if (!error) { logAction(current ? "Hid review" : "Showed review", "review", name); fetchReviews(); }
  };

  const handleToggleReviewVerified = async (id: string, current: boolean, name: string) => {
    const { error } = await supabase.from("reviews").update({ verified: !current }).eq("id", id);
    if (!error) { logAction(current ? "Unverified review" : "Verified review", "review", name); fetchReviews(); }
  };

  const handleToggleTestimonial = async (id: string, current: boolean, name: string) => {
    if (!current && reviews.filter(r => r.is_testimonial).length >= 3) {
      toast({ title: "Limit Reached", description: "Max 3 Testimonials. Remove one first.", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("reviews").update({ is_testimonial: !current }).eq("id", id);
    if (!error) { logAction(!current ? "Featured Testimonial" : "Removed Testimonial", "review", name); fetchReviews(); }
  };

  const handleDeleteReview = async (id: string, name: string) => {
    if (!confirm(`Delete review from ${name}?`)) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (!error) { logAction("Deleted review", "review", name); fetchReviews(); }
  };

  // ── Team handlers ────────────────────────────────────────────────────────────
  const handleAddInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInviteEmail) return;
    const { error } = await supabase.from("admin_invites")
      .upsert([{ email: newInviteEmail, invited_by: session?.user?.id }]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Invited", description: newInviteEmail });
      logAction("Invited admin", "admin", newInviteEmail);
      setNewInviteEmail(""); fetchTeam();
    }
  };

  const handleDeleteInvite = async (email: string) => {
    const { error } = await supabase.from("admin_invites").delete().eq("email", email);
    if (!error) { logAction("Cancelled invite", "admin", email); fetchTeam(); }
  };

  const handleToggleRestrict = async (id: string, currentRole: string, email: string) => {
    if (userRole !== "owner") return;
    const newRole = currentRole === "restricted" ? "admin" : "restricted";
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", id);
    if (!error) { logAction(newRole === "restricted" ? "Restricted admin" : "Restored admin", "admin", email); fetchTeam(); }
  };

  const handleDeleteAdmin = async (id: string, email: string) => {
    if (userRole !== "owner") return;
    if (id === session?.user?.id) { toast({ title: "Blocked", description: "Cannot remove yourself.", variant: "destructive" }); return; }
    if (email === "luchpfume@gmail.com") { toast({ title: "Blocked", description: "Primary owner cannot be deleted.", variant: "destructive" }); return; }
    if (!confirm(`Permanently remove ${email}?`)) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (!error) { logAction("Removed admin", "admin", email); fetchTeam(); }
  };

  // ── Log handlers ─────────────────────────────────────────────────────────────
  const handleDeleteLog = async (id: string) => {
    if (session?.user?.id !== OWNER_ID) return;
    if (!confirm("Delete this log entry?")) return;
    const { error } = await supabase.from("activity_log").delete().eq("id", id);
    if (!error) fetchLogs();
  };

  const handleClearLogs = async () => {
    if (session?.user?.id !== OWNER_ID) return;
    if (prompt("Type 'CLEAR' to delete all logs:") !== "CLEAR") return;
    const { error } = await supabase.from("activity_log")
      .delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (!error) { toast({ title: "Logs cleared" }); fetchLogs(); }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || (userRole !== "admin" && userRole !== "owner")) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "products",  label: "Products"  },
    { key: "reviews",   label: "Reviews"   },
    ...(userRole === "owner"
      ? [{ key: "team" as Tab, label: "Team" }, { key: "activity" as Tab, label: "Activity" }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6 md:p-8">
      {/* Upload progress banner */}
      {uploadProgress && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground animate-pulse">
          ⏳ {uploadProgress}
        </div>
      )}

      <div className="mx-auto max-w-6xl w-full">

        {/* ── Header ── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl">Admin Dashboard</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[200px]">{session?.user?.email}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 capitalize">{userRole}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full sm:w-auto">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        {/* ── Tabs ── */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-muted p-1 no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === t.key ? "bg-background shadow-sm" : "hover:text-foreground/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════
            PRODUCTS TAB
        ══════════════════════════════════════════════════════ */}
        {activeTab === "products" && (
          <>
            {showForm ? (
              <div className="mb-6 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-medium">{editingId ? "Edit Product" : "Add Product"}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Name */}
                    <div>
                      <label className="mb-1 block text-sm">Name</label>
                      <input required value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                    </div>
                    {/* Price */}
                    <div>
                      <label className="mb-1 block text-sm">Price (₦)</label>
                      <input required type="number" value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                    </div>
                    {/* Category */}
                    <div>
                      <label className="mb-1 block text-sm">Category</label>
                      <select value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="Unboxed">Unboxed</option>
                        <option value="Thrifted Open Box">Thrifted Open Box</option>
                        <option value="Boxed">Boxed</option>
                        <option value="Tester">Tester</option>
                      </select>
                    </div>
                    {/* Size */}
                    <div>
                      <label className="mb-1 block text-sm">Size (Optional)</label>
                      <input value={formData.size} placeholder="e.g. 50ml, 100ml"
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                    </div>
                    {/* Image */}
                    <div>
                      <label className="mb-1 block text-sm">
                        Image {editingId && !imageFile ? "(leave blank to keep)" : ""}
                      </label>
                      <input type="file" accept="image/*" required={!editingId}
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1 file:text-xs" />
                    </div>
                    {/* Video */}
                    <div>
                      <label className="mb-1 block text-sm">
                        Video — max {MAX_VIDEO_SIZE_MB}MB {editingId && !videoFile ? "(leave blank to keep)" : ""}
                      </label>
                      <input type="file" accept="video/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          if (f && f.size > MAX_VIDEO_SIZE_BYTES) {
                            toast({ title: "Video too large", description: `Max ${MAX_VIDEO_SIZE_MB}MB allowed.`, variant: "destructive" });
                            e.target.value = ""; setVideoFile(null); return;
                          }
                          setVideoFile(f);
                        }}
                        className="w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1 file:text-xs" />
                      {videoFile && (
                        <p className="mt-1 text-xs text-green-600">
                          {videoFile.name} — {(videoFile.size / 1024 / 1024).toFixed(1)} MB ✓
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Scent mood */}
                  <div>
                    <label className="mb-1 block text-sm">Scent Mood (Optional)</label>
                    <select value={formData.scent_mood}
                      onChange={(e) => setFormData({ ...formData, scent_mood: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Select Mood</option>
                      <option value="💫 Mysterious">💫 Mysterious</option>
                      <option value="🌹 Romantic">🌹 Romantic</option>
                      <option value="🌿 Fresh & Clean">🌿 Fresh & Clean</option>
                      <option value="👑 Bold & Powerful">👑 Bold & Powerful</option>
                      <option value="🌸 Soft & Feminine">🌸 Soft & Feminine</option>
                      <option value="🔥 Sensual">🔥 Sensual</option>
                      <option value="☀️ Bright & Joyful">☀️ Bright & Joyful</option>
                      <option value="🕌 Oud & Oriental">🕌 Oud & Oriental</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-1 block text-sm">Description (Notes)</label>
                    <input required value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                  </div>

                  {/* Checkboxes */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {[
                      { label: "In Stock",     key: "in_stock" },
                      { label: "Visible",      key: "visible"  },
                      { label: "New Arrival",  key: "is_new"   },
                    ].map(({ label, key }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox"
                          checked={(formData as any)[key]}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })} />
                        {label}
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Add Product"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} className="flex-1 sm:flex-none">
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl">Product Catalog</h2>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Visible</span>
                    <span className="flex items-center gap-1 text-green-600">✓ In Stock</span>
                    <span className="flex items-center gap-1 text-primary">✨ New</span>
                    <span className="flex items-center gap-1 text-amber-500">🔥 Top Seller</span>
                  </div>
                </div>
                <Button onClick={() => setShowForm(true)} size="sm" className="gap-2 shrink-0">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Product</span>
                </Button>
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-sm min-w-[540px]">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 sm:p-4 font-medium">Product</th>
                      <th className="p-3 sm:p-4 font-medium hidden md:table-cell">Category</th>
                      <th className="p-3 sm:p-4 font-medium">Price</th>
                      <th className="p-3 sm:p-4 font-medium">Status</th>
                      <th className="p-3 sm:p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && products.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
                    ) : products.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products yet. Add your first perfume!</td></tr>
                    ) : products.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            {p.image_url && (
                              <img src={p.image_url} alt={p.name}
                                className="h-8 w-8 sm:h-10 sm:w-10 rounded-md object-cover shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="font-medium truncate max-w-[100px] sm:max-w-none">{p.name}</span>
                                {p.is_bestseller && <span className="text-amber-500 shrink-0">🔥</span>}
                              </div>
                              <div className="text-xs text-muted-foreground truncate hidden sm:block">{p.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 hidden md:table-cell text-sm">{p.category}</td>
                        <td className="p-3 sm:p-4 whitespace-nowrap text-sm">₦{p.price.toLocaleString()}</td>
                        <td className="p-3 sm:p-4">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                            <button onClick={() => handleToggleStock(p)}
                              className={`rounded px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase border transition-all ${
                                p.in_stock ? "border-green-500/50 bg-green-500/10 text-green-600" : "border-red-500/50 bg-red-500/10 text-red-500"
                              }`}>
                              {p.in_stock ? "✓ Stock" : "× Out"}
                            </button>
                            <button onClick={() => handleToggleNewArrival(p)} title="Toggle New Arrival"
                              className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded border transition-all ${
                                p.is_new ? "border-primary/50 bg-primary/10" : "border-border opacity-40"
                              }`}>✨</button>
                            <button onClick={() => handleToggleBestSeller(p)} title="Toggle Top Seller"
                              className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded border transition-all ${
                                p.is_bestseller ? "border-amber-500/50 bg-amber-500/10" : "border-border opacity-40"
                              }`}>🔥</button>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleToggleVisibility(p)}>
                              {p.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 opacity-50" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleEdit(p)}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-red-500"
                              onClick={() => handleDelete(p.id, p.name)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════
            REVIEWS TAB
        ══════════════════════════════════════════════════════ */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Add review form */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium">Add Manual Review</h2>
              <form onSubmit={handleAddReview} className="grid gap-3 sm:grid-cols-2">
                <input required placeholder="Reviewer Name" value={reviewFormData.reviewer_name}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, reviewer_name: e.target.value })}
                  className="rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                <select required value={reviewFormData.product_id}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, product_id: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <div className="flex items-center gap-3">
                  <label className="text-sm shrink-0">Rating (1–5)</label>
                  <input type="number" min="1" max="5" value={reviewFormData.rating}
                    onChange={(e) => setReviewFormData({ ...reviewFormData, rating: parseInt(e.target.value) })}
                    className="w-16 rounded-md border border-input bg-transparent px-3 py-1 text-sm" />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={reviewFormData.verified}
                    onChange={(e) => setReviewFormData({ ...reviewFormData, verified: e.target.checked })} />
                  Verified Purchase
                </label>
                <textarea placeholder="Comment" value={reviewFormData.comment}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                  className="sm:col-span-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm h-20 resize-none" />
                <Button type="submit" className="w-full sm:w-fit">Save Review</Button>
              </form>
            </div>

            {/* Review list */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-lg font-medium">Customer Reviews</h2>
                <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Visible</span>
                  <span className="flex items-center gap-1 text-green-600">✓ Verified</span>
                  <span className="flex items-center gap-1 text-amber-500">⭐ Testimonial</span>
                </div>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-sm min-w-[560px]">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 sm:p-4 font-medium">Reviewer</th>
                      <th className="p-3 sm:p-4 font-medium">Product</th>
                      <th className="p-3 sm:p-4 font-medium">Rating</th>
                      <th className="p-3 sm:p-4 font-medium hidden lg:table-cell">Comment</th>
                      <th className="p-3 sm:p-4 font-medium">Status</th>
                      <th className="p-3 sm:p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No reviews yet.</td></tr>
                    ) : reviews.map((r) => (
                      <tr key={r.id} className="border-t border-border">
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-1.5 font-medium">
                            {r.reviewer_name}
                            {r.is_testimonial && <span className="text-amber-500">⭐</span>}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="p-3 sm:p-4 text-muted-foreground">{r.products?.name || "—"}</td>
                        <td className="p-3 sm:p-4 text-amber-400 font-bold">{"★".repeat(r.rating)}</td>
                        <td className="p-3 sm:p-4 max-w-[160px] truncate text-muted-foreground hidden lg:table-cell">{r.comment}</td>
                        <td className="p-3 sm:p-4">
                          <div className="flex gap-1.5">
                            <button onClick={() => handleToggleReviewVisibility(r.id, r.visible, r.reviewer_name)}
                              className={`flex h-7 w-7 items-center justify-center rounded border transition-all ${r.visible ? "border-primary/50 bg-primary/10 text-primary" : "border-red-500/50 bg-red-500/10 text-red-500"}`}>
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleToggleReviewVerified(r.id, r.verified, r.reviewer_name)}
                              className={`flex h-7 w-7 items-center justify-center rounded border font-bold transition-all ${r.verified ? "border-green-500/50 bg-green-500/10 text-green-600" : "border-border opacity-40"}`}>
                              ✓
                            </button>
                            <button onClick={() => handleToggleTestimonial(r.id, r.is_testimonial, r.reviewer_name)}
                              className={`flex h-7 w-7 items-center justify-center rounded border transition-all ${r.is_testimonial ? "border-amber-500/50 bg-amber-500/10 text-amber-500" : "border-border opacity-40"}`}>
                              ⭐
                            </button>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500"
                            onClick={() => handleDeleteReview(r.id, r.reviewer_name)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TEAM TAB
        ══════════════════════════════════════════════════════ */}
        {activeTab === "team" && userRole === "owner" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <h2 className="mb-2 text-lg font-medium">Invite Admin</h2>
              <p className="mb-4 text-sm text-muted-foreground">Enter an email to grant admin access on first sign-in.</p>
              <form onSubmit={handleAddInvite} className="flex flex-col gap-2 sm:flex-row">
                <input type="email" required placeholder="admin@example.com" value={newInviteEmail}
                  onChange={(e) => setNewInviteEmail(e.target.value)}
                  className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                <Button type="submit" className="w-full sm:w-auto">
                  <Mail className="mr-2 h-4 w-4" /> Invite
                </Button>
              </form>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-sm min-w-[400px]">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 sm:p-4 font-medium">Member</th>
                      <th className="p-3 sm:p-4 font-medium">Role</th>
                      <th className="p-3 sm:p-4 font-medium">Status</th>
                      <th className="p-3 sm:p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No members yet.</td></tr>
                    ) : team.map((m) => (
                      <tr key={m.email} className="border-t border-border">
                        <td className="p-3 sm:p-4">
                          <div className="font-medium truncate max-w-[140px] sm:max-w-none">{m.email}</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">{new Date(m.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            m.role === "owner" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          }`}>
                            {m.role === "owner" && <Shield className="h-3 w-3" />}
                            <span className="capitalize">{m.role}</span>
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                            m.status === "active" ? "bg-green-500/10 text-green-600"
                            : m.status === "pending" ? "bg-amber-500/10 text-amber-600"
                            : "bg-red-500/10 text-red-500"
                          }`}>{m.status}</span>
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <div className="flex justify-end gap-1">
                            {m.status === "pending" ? (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500"
                                onClick={() => handleDeleteInvite(m.email)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            ) : m.role !== "owner" ? (
                              <>
                                <Button variant="ghost" size="icon" className="h-7 w-7"
                                  onClick={() => m.id && handleToggleRestrict(m.id, m.role, m.email)}
                                  title={m.status === "restricted" ? "Restore" : "Restrict"}>
                                  {m.status === "restricted"
                                    ? <Shield className="h-3.5 w-3.5 text-green-500" />
                                    : <ShieldOff className="h-3.5 w-3.5 text-orange-500" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500"
                                  onClick={() => m.id && handleDeleteAdmin(m.id, m.email)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            ACTIVITY TAB
        ══════════════════════════════════════════════════════ */}
        {activeTab === "activity" && userRole === "owner" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl sm:text-2xl flex items-center gap-2">
                <History className="h-5 w-5" /> Activity Log
              </h2>
              {session?.user?.id === OWNER_ID && (
                <Button variant="destructive" size="sm" onClick={handleClearLogs}>Clear All</Button>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <select value={logFilterAdmin} onChange={(e) => setLogFilterAdmin(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-auto">
                <option value="all">All Admins</option>
                {Array.from(new Set(logs.map(l => l.admin_email))).map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <select value={logFilterAction} onChange={(e) => setLogFilterAction(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-auto">
                <option value="all">All Actions</option>
                {Array.from(new Set(logs.map(l => l.action))).map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-sm min-w-[480px]">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 sm:p-4 font-medium">When</th>
                      <th className="p-3 sm:p-4 font-medium hidden md:table-cell">Admin</th>
                      <th className="p-3 sm:p-4 font-medium">Action</th>
                      <th className="p-3 sm:p-4 font-medium">Target</th>
                      {session?.user?.id === OWNER_ID && <th className="p-3 sm:p-4 font-medium text-right">Del</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No activity yet.</td></tr>
                    ) : logs.map((l) => (
                      <tr key={l.id} className="border-t border-border">
                        <td className="p-3 sm:p-4 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(l.created_at).toLocaleString()}
                        </td>
                        <td className="p-3 sm:p-4 hidden md:table-cell truncate max-w-[140px]">{l.admin_email}</td>
                        <td className="p-3 sm:p-4">
                          <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary whitespace-nowrap">
                            {l.action}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-muted-foreground truncate max-w-[100px] sm:max-w-none">{l.target_name}</td>
                        {session?.user?.id === OWNER_ID && (
                          <td className="p-3 sm:p-4 text-right">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500"
                              onClick={() => handleDeleteLog(l.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;
