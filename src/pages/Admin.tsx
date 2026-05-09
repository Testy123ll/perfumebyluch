import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Product, IS_SUPABASE_CONFIGURED, getOptimisedImageUrl } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast, toast } from "@/components/ui/use-toast";
import {
  Trash2, Edit2, Eye, EyeOff, Plus, LogOut, Loader2,
  Shield, ShieldOff, Mail, History, User, Star, CheckCircle2,
  ArrowUpRight
} from "lucide-react";
import logo from "@/assets/logo.webp";

const OWNER_ID = "7a7f1bb0-6aa6-42e6-80e3-7e4f7a48491e";
const TEST_SESSION_KEY = "pbl_admin_test_session";
const MAX_VIDEO_SIZE_MB = 100;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

type Tab = "products" | "reviews" | "team" | "activity";

interface TeamMember {
  id?: string;
  email: string;
  role: string;
  status: "active" | "pending" | "restricted";
  created_at: string;
}

interface ActivityLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_name: string;
  created_at: string;
}

/**
 * Standard SDK upload for images.
 */
const uploadImage = async (
  file: File,
  onProgress: (msg: string) => void
): Promise<{ url: string; error: string | null }> => {
  return new Promise((resolve) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Perfumeluch");
    formData.append("folder", "perfumebyluch/images");
    formData.append("transformation", "q_auto,f_auto,w_800");

    const xhr = new XMLHttpRequest();
    xhr.timeout = 120000;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(`Uploading image... ${pct}%`);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        resolve({ url: res.secure_url, error: null });
      } else {
        resolve({ url: "", error: `Upload failed: ${xhr.status}` });
      }
    };

    xhr.onerror = () => resolve({ url: "", error: "Network error" });
    xhr.ontimeout = () => resolve({ url: "", error: "Upload timed out" });

    xhr.open("POST", "https://api.cloudinary.com/v1_1/dp4auwl1h/image/upload", true);
    xhr.send(formData);
  });
};

const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Lazy load Cloudinary upload widget script only for the Admin page
    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    script.type = "text/javascript";
    document.head.appendChild(script);

    return () => {
      // Clean up the script when the component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "Unboxed",
    in_stock: true,
    visible: true,
    is_new: false,
    is_bestseller: false,
    size: "",
    scent_mood: "",
    sale_price: "",
    sale_end_date: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState(""); // Replaces videoFile for Widget support

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewFormData, setReviewFormData] = useState({
    reviewer_name: "",
    product_id: "",
    rating: 5,
    comment: "",
    verified: false,
  });

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState("");

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logFilterAdmin, setLogFilterAdmin] = useState("all");
  const [logFilterAction, setLogFilterAction] = useState("all");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching products", description: error.message, variant: "destructive" });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }, []);

  const fetchReviews = useCallback(async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, products(name)")
      .order("created_at", { ascending: false });
    if (!error) setReviews(data || []);
  }, []);

  const fetchLogs = useCallback(async () => {
    let query = supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(100);
    if (logFilterAdmin !== "all") query = query.eq("admin_email", logFilterAdmin);
    if (logFilterAction !== "all") query = query.eq("action", logFilterAction);
    const { data, error } = await query;
    if (!error) setLogs(data || []);
  }, [logFilterAdmin, logFilterAction]);

  const fetchTeam = useCallback(async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: invites } = await supabase.from("admin_invites").select("*");

    const profileEmails = new Set((profiles || []).map((p: any) => p.email));
    const combined: TeamMember[] = [
      ...((profiles as any[]) || []).map(p => ({
        id: p.id,
        email: p.email,
        role: p.role,
        status: p.role === "restricted" ? "restricted" : "active",
        created_at: p.created_at
      })),
      ...((invites as any[]) || []).filter(i => !profileEmails.has(i.email)).map(i => ({
        email: i.email,
        role: "admin",
        status: "pending",
        created_at: i.created_at
      }))
    ] as TeamMember[];

    combined.sort((a, b) => {
      if (a.role === "owner" && b.role !== "owner") return -1;
      if (a.role !== "owner" && b.role === "owner") return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setTeam(combined);
  }, []);

  const logAction = async (action: string, target_type: string, target_name: string) => {
    if (!session?.user?.id) return;
    await supabase.from("activity_log").insert([{
      admin_id: session.user.id,
      admin_email: session.user.email,
      action,
      target_type,
      target_name
    }]);
    fetchLogs();
  };

  useEffect(() => {
    const checkAuth = async () => {
      setAuthChecking(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (!currentSession) {
        navigate("/admin/login");
        setAuthChecking(false);
        return;
      }

      setSession(currentSession);

      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentSession.user.id)
        .single();

      if (pErr || !profile) {
        // Auto-create profile instead of failing
        await supabase.from("profiles").upsert([{
          id: currentSession.user.id,
          email: currentSession.user.email,
          role: "admin"
        }]);
        setUserRole("admin");

        // Cleanup invite just in case
        await supabase.from("admin_invites").delete().eq("email", currentSession.user.email);
      } else {
        if (profile.role !== "admin" && profile.role !== "owner") {
          toast({ title: "Access Denied", description: "Unauthorized role.", variant: "destructive" });
          await supabase.auth.signOut();
          navigate("/admin/login");
        } else {
          setUserRole(profile.role);
        }
      }
      setAuthChecking(false);
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) navigate("/admin/login");
      else setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      if (activeTab === "products" && products.length === 0) fetchProducts();
      else if (activeTab === "reviews" && reviews.length === 0) fetchReviews();
      else if (activeTab === "activity" && logs.length === 0) fetchLogs();
      else if (activeTab === "team" && team.length === 0 && userRole === "owner") fetchTeam();
    }
  }, [session, userRole, activeTab]);

  useEffect(() => {
    if (session) fetchLogs();
  }, [logFilterAdmin, logFilterAction]);

  const handleLogout = async () => {
    localStorage.removeItem(TEST_SESSION_KEY);
    if (IS_SUPABASE_CONFIGURED) await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "", price: "", description: "", category: "Unboxed",
      in_stock: true, visible: true, is_new: false, is_bestseller: false, size: "", scent_mood: "",
      sale_price: "", sale_end_date: ""
    });
    setImageFile(null);
    setVideoUrl(""); // Reset widget URL
    setUploadProgress(""); // Clear progress banner
    setShowForm(false);
  };

  const handleUploadVideo = () => {
    // @ts-ignore - Cloudinary is loaded via script tag
    if (!(window as any).cloudinary) {
      toast({ title: "Widget Error", description: "Cloudinary library not ready. Please refresh the page.", variant: "destructive" });
      return;
    }

    // @ts-ignore
    const widget = (window as any).cloudinary.createUploadWidget(
      {
        cloudName: "dvmefdiu3",
        uploadPreset: "Perfume",
        sources: ["local", "camera"], // Simplified for mobile stability
        multiple: false,
        resourceType: "video",
        clientAllowedFormats: ["mp4", "mov", "avi"],
        maxFileSize: 100000000, // 100MB
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          setVideoUrl(result.info.secure_url);
          toast({ title: "Video Uploaded", description: "Video ready to be saved." });
        } else if (error) {
          toast({ title: "Upload Widget Error", description: error.message || "Initialization failed", variant: "destructive" });
        }
      }
    );
    widget.open();
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || "",
      category: product.category,
      in_stock: product.in_stock,
      visible: product.visible,
      is_new: product.is_new ?? false,
      size: product.size || "",
      scent_mood: product.scent_mood || "",
      is_bestseller: product.is_bestseller ?? false,
      sale_price: product.sale_price ? product.sale_price.toString() : "",
      sale_end_date: product.sale_end_date ? new Date(product.sale_end_date).toISOString().slice(0, 16) : "",
    });
    setImageFile(null);
    setVideoUrl(product.video_url || ""); // Set existing video URL
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete product "${name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Success", description: "Product deleted" });
      logAction("Deleted product", "product", name);
      fetchProducts();
    }
  };

  const handleToggleVisibility = async (p: Product) => {
    const { error } = await supabase.from("products").update({ visible: !p.visible }).eq("id", p.id);
    if (!error) {
      logAction(p.visible ? "Hid product" : "Showed product", "product", p.name);
      fetchProducts();
    } else {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleStock = async (p: Product) => {
    const { error } = await supabase.from("products").update({ in_stock: !p.in_stock }).eq("id", p.id);
    if (!error) {
      logAction("Toggled stock", "product", p.name);
      fetchProducts();
    } else {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleNewArrival = async (p: Product) => {
    const { error } = await supabase.from("products").update({ is_new: !p.is_new }).eq("id", p.id);
    if (!error) {
      logAction(p.is_new ? "Removed from New" : "Marked as New", "product", p.name);
      fetchProducts();
    } else {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleBestSeller = async (p: Product) => {
    if (!p.is_bestseller && products.filter(x => x.is_bestseller).length >= 6) {
      toast({ title: "Limit reached", description: "Maximum 6 Top Sellers allowed.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("products").update({ is_bestseller: !p.is_bestseller }).eq("id", p.id);
    if (!error) {
      logAction(!p.is_bestseller ? "Marked as Top Seller" : "Removed from Top Sellers", "product", p.name);
      fetchProducts();
    } else {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let image_url = editingId ? products.find(p => p.id === editingId)?.image_url || "" : "";
    let video_url = editingId ? products.find(p => p.id === editingId)?.video_url || "" : "";

    if (imageFile) {
      setUploadProgress("Uploading image...");
      const r = await uploadImage(imageFile, setUploadProgress);
      if (r.error) {
        toast({ title: "Image Upload Failed", description: r.error, variant: "destructive" });
        setLoading(false); setUploadProgress(""); return;
      }
      image_url = r.url;
    }

    // Video is now handled by the Cloudinary Widget (videoUrl state)
    let final_video_url = videoUrl || (editingId ? products.find(p => p.id === editingId)?.video_url || "" : "");

    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      category: formData.category,
      in_stock: formData.in_stock,
      visible: formData.visible,
      is_new: formData.is_new,
      video_url: final_video_url,
      size: formData.size,
      scent_mood: formData.scent_mood,
      is_bestseller: formData.is_bestseller,
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      sale_end_date: formData.sale_end_date || null,
      ...(image_url ? { image_url } : {}),
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) toast({ title: "Update Error", description: error.message, variant: "destructive" });
      else {
        toast({ title: "Updated", description: formData.name });
        logAction("Edited product", "product", formData.name);
        resetForm(); fetchProducts();
      }
    } else {
      const { error } = await supabase.from("products").insert([payload]);
      if (error) toast({ title: "Creation Error", description: error.message, variant: "destructive" });
      else {
        toast({ title: "Created", description: formData.name });
        logAction("Added product", "product", formData.name);
        resetForm(); fetchProducts();
      }
    }
    setLoading(false);
    setUploadProgress(""); // Final clear
  };

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
    else { toast({ title: "Failed to update review", description: error.message, variant: "destructive" }); }
  };

  const handleToggleReviewVerified = async (id: string, current: boolean, name: string) => {
    const { error } = await supabase.from("reviews").update({ verified: !current }).eq("id", id);
    if (!error) { logAction(current ? "Unverified review" : "Verified review", "review", name); fetchReviews(); }
    else { toast({ title: "Failed to update verification", description: error.message, variant: "destructive" }); }
  };

  const handleToggleTestimonial = async (id: string, current: boolean, name: string) => {
    if (!current && reviews.filter(r => r.is_testimonial).length >= 3) {
      toast({ title: "Limit reached", description: "Max 3 testimonials allowed.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("reviews").update({ is_testimonial: !current }).eq("id", id);
    if (!error) { logAction(!current ? "Featured Testimonial" : "Removed Testimonial", "review", name); fetchReviews(); }
    else { toast({ title: "Failed to update testimonial", description: error.message, variant: "destructive" }); }
  };

  const handleDeleteReview = async (id: string, name: string) => {
    if (!confirm(`Delete review from ${name}?`)) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (!error) { logAction("Deleted review", "review", name); fetchReviews(); }
    else { toast({ title: "Delete Failed", description: error.message, variant: "destructive" }); }
  };

  const handleAddInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInviteEmail) return;

    // Check if already invited or registered
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", newInviteEmail)
      .single();

    if (existingProfile) {
      toast({
        title: "Already Registered",
        description: `${newInviteEmail} is already an admin.`,
        variant: "destructive",
      });
      return;
    }

    // Send invite via Supabase Auth
    const { error } = await supabase.auth.admin.inviteUserByEmail(newInviteEmail, {
      redirectTo: `${window.location.origin}/admin/register`,
      data: { role: "admin" }
    });

    if (error) {
      toast({
        title: "Invite Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Save invite record
    await supabase.from("admin_invites").upsert([{
      email: newInviteEmail,
      invited_by: session?.user?.id
    }]);

    toast({
      title: "Invite Sent",
      description: `A registration link has been sent to ${newInviteEmail}`,
    });

    logAction("Invited admin", "admin", newInviteEmail);
    setNewInviteEmail("");
    fetchTeam();
  };

  const handleDeleteInvite = async (email: string) => {
    const { error } = await supabase.from("admin_invites").delete().eq("email", email);
    if (!error) { logAction("Cancelled invite", "admin", email); fetchTeam(); }
  };

  const handleToggleRestrict = async (id: string, role: string, email: string) => {
    if (userRole !== "owner") return;
    const newRole = role === "restricted" ? "admin" : "restricted";
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", id);
    if (!error) { logAction(newRole === "restricted" ? "Restricted admin" : "Restored admin", "admin", email); fetchTeam(); }
  };

  const handleDeleteAdmin = async (id: string, email: string) => {
    if (userRole !== "owner") return;
    if (id === session?.user?.id) return;
    if (email === "luchpfume@gmail.com") return;
    if (!confirm(`Permanently remove ${email}?`)) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (!error) { logAction("Removed admin", "admin", email); fetchTeam(); }
  };

  const handleDeleteLog = async (id: string) => {
    if (session?.user?.id !== OWNER_ID) return;
    const { error } = await supabase.from("activity_log").delete().eq("id", id);
    if (!error) fetchLogs();
  };

  const handleClearLogs = async () => {
    if (session?.user?.id !== OWNER_ID) return;
    if (prompt("Type 'CLEAR' to delete everything:") !== "CLEAR") return;
    const { error } = await supabase.from("activity_log").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (!error) { toast({ title: "Logs cleared" }); fetchLogs(); }
  };

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || (userRole !== "admin" && userRole !== "owner")) return null;

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6 md:p-8">
      {/* Upload Banner */}
      {uploadProgress && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground animate-pulse shadow-md">
          ⏳ {uploadProgress}
        </div>
      )}

      <div className="mx-auto max-w-6xl w-full">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-6">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2" aria-label="Perfumes By Luch home">
              <img src={logo} alt="Perfumes By Luch logo" className="h-12 w-auto md:h-16" width={160} height={64} />
              <span className="sr-only">Perfumes By Luch</span>
            </a>
            <div className="h-10 w-px bg-border/50 hidden sm:block" />
            <div>
              <h1 className="font-serif text-xl sm:text-2xl tracking-tight">Admin Console</h1>
              <div className="mt-1 flex items-center flex-wrap gap-y-2 gap-x-3 text-[10px] text-muted-foreground uppercase tracking-widest">
                <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" /> {session?.user?.email}</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span className="font-bold text-primary">{userRole}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-muted-foreground/60 hover:text-red-500 transition-colors ml-2 border-l border-border/50 pl-3"
                >
                  <LogOut className="h-2.5 w-2.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-muted p-1 no-scrollbar">
          {[
            { id: "products", label: "Products" },
            { id: "reviews", label: "Reviews" },
            ...(userRole === "owner" ? [
              { id: "team", label: "Team" },
              { id: "activity", label: "Activity" }
            ] : [])
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "products" && (
          <>
            {showForm ? (
              <div className="mb-6 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-medium">{editingId ? "Edit Product" : "Add Product"}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Name</label>
                      <input required type="text" value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Price (₦)</label>
                      <input required type="number" value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Sale Promo Price (₦) - Optional</label>
                      <input type="number" value={formData.sale_price}
                        onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                        placeholder="Leave empty if no sale"
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Sale End Date - Optional</label>
                      <input type="datetime-local" value={formData.sale_end_date}
                        onChange={(e) => setFormData({ ...formData, sale_end_date: e.target.value })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Category</label>
                      <select value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="Unboxed">Unboxed</option>
                        <option value="Thrifted Open Box">Thrifted Open Box</option>
                        <option value="Boxed">Boxed</option>
                        <option value="Tester">Tester</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Size (e.g. 100ml)</label>
                      <input type="text" value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Image {editingId ? "(optional)" : ""}</label>
                      <input type="file" accept="image/*" required={!editingId}
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="w-full text-xs" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Video Content</label>
                      <div className="flex flex-col gap-2">
                        <Button type="button" variant="secondary" size="sm" onClick={handleUploadVideo} className="w-full">
                          {videoUrl ? "Change Video" : "Upload Video (Widget)"}
                        </Button>
                        {videoUrl && (
                          <div className="flex items-center gap-2 overflow-hidden rounded border border-green-500/50 bg-green-500/5 p-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                            <span className="truncate text-[10px] text-green-700">Video Uploaded Successfully</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Scent Mood</label>
                    <select value={formData.scent_mood}
                      onChange={(e) => setFormData({ ...formData, scent_mood: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">No Mood Selected</option>
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
                  <div>
                    <label className="mb-1 block text-sm font-medium">Description (Perfume Notes)</label>
                    <textarea required value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm h-24 resize-none" />
                  </div>
                  <div className="flex flex-wrap gap-5 text-sm">
                    {[
                      { id: "in_stock", label: "In Stock" },
                      { id: "visible", label: "Visible" },
                      { id: "is_new", label: "New Arrival" }
                    ].map(opt => (
                      <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={(formData as any)[opt.id]}
                          onChange={(e) => setFormData({ ...formData, [opt.id]: e.target.checked })} />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Add"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} className="flex-1 sm:flex-none">Cancel</Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-xl sm:text-2xl">Perfume Collection</h2>
                <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> <span className="hidden xs:inline">Add Product</span>
                </Button>
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4 hidden sm:table-cell">Type</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products found.</td></tr>
                    ) : products.map((p) => (
                      <tr key={p.id} className="border-t border-border hover:bg-muted/10 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                              {p.image_url && <img src={getOptimisedImageUrl(p.image_url, 100)} className="h-full w-full object-cover" alt="" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-[150px]">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground">{p.size || "No size"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell text-muted-foreground">{p.category}</td>
                        <td className="p-4 font-mono">₦{p.price.toLocaleString()}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            <button onClick={() => handleToggleStock(p)}
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${p.in_stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {p.in_stock ? "In Stock" : "Sold Out"}
                            </button>
                            <button onClick={() => handleToggleNewArrival(p)}
                              className={`rounded px-1 text-xs border transition-all ${p.is_new ? "border-primary text-primary" : "border-border opacity-30"}`} title="New Arrival">✨</button>
                            <button onClick={() => handleToggleBestSeller(p)}
                              className={`rounded px-1 text-xs border transition-all ${p.is_bestseller ? "border-amber-500 text-amber-500" : "border-border opacity-30"}`} title="Top Seller">🔥</button>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleVisibility(p)}>
                              {p.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground/50" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(p)}><Edit2 className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(p.id, p.name)}><Trash2 className="h-4 w-4" /></Button>
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

        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium">Create Manual Review</h2>
              <form onSubmit={handleAddReview} className="grid gap-4 sm:grid-cols-2">
                <input required placeholder="Reviewer Name" value={reviewFormData.reviewer_name}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, reviewer_name: e.target.value })}
                  className="rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                <select required value={reviewFormData.product_id}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, product_id: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Link to Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Rating:</span>
                  <input type="number" min="1" max="5" value={reviewFormData.rating}
                    onChange={(e) => setReviewFormData({ ...reviewFormData, rating: parseInt(e.target.value) })}
                    className="w-16 rounded border bg-transparent px-2 py-1 text-sm" />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={reviewFormData.verified}
                    onChange={(e) => setReviewFormData({ ...reviewFormData, verified: e.target.checked })} />
                  Verified Purchase
                </label>
                <textarea placeholder="Write their comment here..." value={reviewFormData.comment}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                  className="sm:col-span-2 h-20 rounded border bg-transparent p-3 text-sm resize-none" />
                <Button type="submit" className="w-fit">Save Review</Button>
              </form>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Product</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Flags</th>
                      <th className="p-4 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No customer feedback yet.</td></tr>
                    ) : reviews.map((r) => (
                      <tr key={r.id} className="border-t border-border">
                        <td className="p-4">
                          <p className="font-medium">{r.reviewer_name}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4 truncate max-w-[120px] text-muted-foreground">{r.products?.name || "N/A"}</td>
                        <td className="p-4 text-amber-500 font-bold">{"★".repeat(r.rating)}</td>
                        <td className="p-4">
                          <div className="flex gap-1.5">
                            <button onClick={() => handleToggleReviewVisibility(r.id, r.visible, r.reviewer_name)}
                              className={`h-7 w-7 rounded border transition-all flex items-center justify-center ${r.visible ? "border-primary/40 bg-primary/5 text-primary" : "border-red-400 bg-red-50 text-red-500"}`}><Eye className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleToggleReviewVerified(r.id, r.verified, r.reviewer_name)}
                              className={`h-7 w-7 rounded border transition-all flex items-center justify-center ${r.verified ? "border-green-400 bg-green-50 text-green-600" : "opacity-30 border-border"}`} title="Verified"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleToggleTestimonial(r.id, r.is_testimonial, r.reviewer_name)}
                              className={`h-7 w-7 rounded border transition-all flex items-center justify-center ${r.is_testimonial ? "border-amber-400 bg-amber-50 text-amber-500" : "opacity-30 border-border"}`} title="Testimonial"><Star className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteReview(r.id, r.reviewer_name)}><Trash2 className="h-4 w-4" /></Button>
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
            TEAM TAB (OWNER ONLY)
        ══════════════════════════════════════════════════════ */}
        {activeTab === "team" && userRole === "owner" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
              <h2 className="mb-2 text-lg font-medium">Invite New Admin</h2>
              <p className="mb-4 text-xs text-muted-foreground">The user must sign up with this exact email to gain access.</p>
              <form onSubmit={handleAddInvite} className="flex flex-col sm:flex-row gap-3">
                <input type="email" required placeholder="newadmin@example.com" value={newInviteEmail}
                  onChange={(e) => setNewInviteEmail(e.target.value)}
                  className="flex-1 rounded border bg-transparent p-2.5 text-sm" />
                <Button type="submit"><Mail className="mr-2 h-4 w-4" /> Send Invite</Button>
              </form>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-sm min-w-[450px]">
                  <thead className="bg-muted/50 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.map((m) => (
                      <tr key={m.email} className="border-t border-border">
                        <td className="p-4">
                          <p className="font-medium">{m.email}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4 uppercase text-[10px] font-bold tracking-tight">
                          <span className={m.role === "owner" ? "text-primary" : "text-muted-foreground"}>{m.role}</span>
                        </td>
                        <td className="p-4">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${m.status === "active" ? "bg-green-100 text-green-600" :
                            m.status === "pending" ? "bg-amber-100 text-amber-600" :
                              "bg-red-100 text-red-600"
                            }`}>{m.status}</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            {m.status === "pending" ? (
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteInvite(m.email)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                            ) : m.role !== "owner" ? (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => handleToggleRestrict(m.id!, m.role, m.email)}>
                                  {m.status === "restricted" ? <Shield className="h-4 w-4 text-green-600" /> : <ShieldOff className="h-4 w-4 text-amber-600" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteAdmin(m.id!, m.email)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                              </>
                            ) : <span className="text-[10px] text-muted-foreground px-2">READ ONLY</span>}
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
            ACTIVITY LOG TAB (OWNER ONLY)
        ══════════════════════════════════════════════════════ */}
        {activeTab === "activity" && userRole === "owner" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl sm:text-2xl flex items-center gap-2"><History className="h-5 w-5" /> Audit Logs</h2>
              {session?.user?.id === OWNER_ID && <Button variant="destructive" size="sm" onClick={handleClearLogs}>Clear All</Button>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select value={logFilterAdmin} onChange={(e) => setLogFilterAdmin(e.target.value)} className="rounded border bg-background p-2 text-sm">
                <option value="all">Filter by Admin</option>
                {Array.from(new Set(logs.map(l => l.admin_email))).map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <select value={logFilterAction} onChange={(e) => setLogFilterAction(e.target.value)} className="rounded border bg-background p-2 text-sm">
                <option value="all">Filter by Action</option>
                {Array.from(new Set(logs.map(l => l.action))).map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-sm min-w-[500px]">
                  <thead className="bg-muted/50 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Admin</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">Target</th>
                      {session?.user?.id === OWNER_ID && <th className="p-4 text-right">Delete</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l) => (
                      <tr key={l.id} className="border-t border-border">
                        <td className="p-4 text-[10px] whitespace-nowrap text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
                        <td className="p-4 truncate max-w-[120px] font-medium">{l.admin_email}</td>
                        <td className="p-4"><span className="rounded bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary uppercase">{l.action}</span></td>
                        <td className="p-4 text-muted-foreground italic truncate max-w-[100px]">{l.target_name}</td>
                        {session?.user?.id === OWNER_ID && (
                          <td className="p-4 text-right">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => handleDeleteLog(l.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
