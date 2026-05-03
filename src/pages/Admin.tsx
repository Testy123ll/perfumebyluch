import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Product, IS_SUPABASE_CONFIGURED } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Edit2, Eye, EyeOff, Plus, LogOut, Loader2, Shield, ShieldOff, Mail, History, User } from "lucide-react";

const OWNER_ID = "7a7f1bb0-6aa6-42e6-80e3-7e4f7a48491e";
const TEST_SESSION_KEY = "pbl_admin_test_session";


const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "team" | "activity" | "reviews">("products");

  // Team state
  const [team, setTeam] = useState<{ 
    id?: string; 
    email: string; 
    role: string; 
    status: "active" | "pending" | "restricted";
    created_at: string;
  }[]>([]);
  // Activity state
  const [logs, setLogs] = useState<{ id: string; admin_email: string; action: string; target_name: string; created_at: string; admin_id: string }[]>([]);
  const [logFilterAdmin, setLogFilterAdmin] = useState("all");
  const [logFilterAction, setLogFilterAction] = useState("all");
  const [newInviteEmail, setNewInviteEmail] = useState("");

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
    video_url: "",
    sizes: [] as { size: string; price: number }[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewFormData, setReviewFormData] = useState({
    reviewer_name: "",
    product_id: "",
    rating: 5,
    comment: "",
    verified: false,
  });

  const navigate = useNavigate();
  const { toast } = useToast();

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
  }, [toast]);

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

  const fetchLogs = useCallback(async () => {
    let query = supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(100);
    
    if (logFilterAdmin !== "all") {
      query = query.eq("admin_email", logFilterAdmin);
    }
    if (logFilterAction !== "all") {
      query = query.eq("action", logFilterAction);
    }

    const { data, error } = await query;
    if (!error) setLogs(data || []);
  }, [logFilterAdmin, logFilterAction]);

  const fetchReviews = useCallback(async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, products(name)")
      .order("created_at", { ascending: false });
    if (!error) setReviews(data || []);
  }, []);

  const fetchTeam = useCallback(async () => {
    const { data: profiles, error: pError } = await supabase.from("profiles").select("*");
    const { data: invites, error: iError } = await supabase.from("admin_invites").select("*");
    
    if (pError || iError) return;

    const combinedTeam: any[] = [
      ...(profiles || []).map(p => ({
        id: p.id,
        email: p.email,
        role: p.role,
        status: p.role === "restricted" ? "restricted" : "active",
        created_at: p.created_at
      })),
      ...(invites || []).map(i => ({
        email: i.email,
        role: "admin",
        status: "pending",
        created_at: i.created_at
      }))
    ];

    setTeam(combinedTeam.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      setAuthChecking(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/admin/login");
        setAuthChecking(false);
        return;
      }

      setSession(session);
      
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      
      if (profileError || !profile) {
        // Profiles table missing or query failed — default to admin with warning
        setUserRole("admin");
        toast({ 
          title: "Profiles table not found — running in open admin mode",
          description: "Database setup may be incomplete.",
          variant: "destructive" 
        });
      } else if (profile.role !== "admin" && profile.role !== "owner") {
        toast({ title: "Access Denied", description: "You do not have admin privileges.", variant: "destructive" });
        supabase.auth.signOut();
        navigate("/admin/login");
        setAuthChecking(false);
        return;
      } else {
        setUserRole(profile.role);
        fetchProducts();
        fetchReviews();
        if (profile.role === "owner") {
          fetchTeam();
        }
        // Always fetch logs for both admin and owner (restricted by RLS anyway)
        fetchLogs();
      }
      
      setAuthChecking(false);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/admin/login");
        } else {
          setSession(session);
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, [navigate, fetchProducts, fetchTeam, fetchLogs, fetchReviews, toast]);

  const handleLogout = async () => {
    localStorage.removeItem(TEST_SESSION_KEY);
    if (IS_SUPABASE_CONFIGURED) await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Product deleted" });
      logAction("Deleted product", "product", name);
      fetchProducts();
    }
  };

  const handleToggleVisibility = async (product: Product) => {
    const { error } = await supabase
      .from("products")
      .update({ visible: !product.visible })
      .eq("id", product.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      logAction("Toggled visibility", "product", product.name);
      fetchProducts();
    }
  };

  const handleToggleStock = async (product: Product) => {
    const { error } = await supabase
      .from("products")
      .update({ in_stock: !product.in_stock })
      .eq("id", product.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      logAction("Toggled stock status", "product", product.name);
      fetchProducts();
    }
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
      video_url: product.video_url || "",
      sizes: product.sizes || [],
    });
    setImageFile(null);
    setVideoFile(null);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      price: "",
      description: "",
      category: "Unboxed",
      in_stock: true,
      visible: true,
      is_new: false,
      video_url: "",
      sizes: [],
    });
    setImageFile(null);
    setVideoFile(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let image_url = editingId ? products.find((p) => p.id === editingId)?.image_url : "";

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, imageFile);

      if (uploadError) {
        toast({ title: "Upload Error", description: uploadError.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("products").getPublicUrl(filePath);
      image_url = publicUrlData.publicUrl;
    }

    let video_url = editingId ? products.find((p) => p.id === editingId)?.video_url : "";

    if (videoFile) {
      const fileExt = videoFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `product-videos/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("products").upload(filePath, videoFile);
      if (uploadError) {
        toast({ title: "Video Upload Error", description: uploadError.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from("products").getPublicUrl(filePath);
      video_url = publicUrlData.publicUrl;
    }

    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      category: formData.category,
      in_stock: formData.in_stock,
      visible: formData.visible,
      is_new: formData.is_new,
      video_url,
      sizes: formData.sizes,
      ...(image_url ? { image_url } : {}),
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else {
        toast({ title: "Success", description: "Product updated" });
        logAction("Edited product", "product", formData.name);
        resetForm();
        fetchProducts();
      }
    } else {
      const { error } = await supabase.from("products").insert([payload]);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else {
        toast({ title: "Success", description: "Product created" });
        logAction("Added product", "product", formData.name);
        resetForm();
        fetchProducts();
      }
    }
    setLoading(false);
  };

  console.log("Admin Dashboard State:", { 
    hasSession: !!session, 
    userRole, 
    authChecking,
    supabaseConfigured: IS_SUPABASE_CONFIGURED 
  });

  const handleDeleteLog = async (id: string) => {
    if (session?.user?.id !== OWNER_ID) return;
    if (!confirm("Are you sure you want to delete this log entry?")) return;
    
    const { error } = await supabase.from("activity_log").delete().eq("id", id);
    if (!error) fetchLogs();
  };

  const handleClearLogs = async () => {
    if (session?.user?.id !== OWNER_ID) return;
    const confirmText = prompt("Type 'CLEAR' to delete all activity logs:");
    if (confirmText !== "CLEAR") return;

    const { error } = await supabase.from("activity_log").delete().neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all
    if (!error) {
      toast({ title: "Success", description: "All logs cleared" });
      fetchLogs();
    }
  };

  const handleAddInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInviteEmail) return;
    
    const { error } = await supabase.from("admin_invites").upsert([{ 
      email: newInviteEmail,
      invited_by: session?.user?.id 
    }]);

    if (error) {
      if (error.code === "23505" || error.message?.includes("duplicate")) {
        toast({ 
          title: "Duplicate Invite", 
          description: "This email has already been invited. Check your pending invites list.", 
          variant: "destructive" 
        });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "Success", description: `Invited ${newInviteEmail} as admin` });
      logAction("Invited admin", "admin", newInviteEmail);
      setNewInviteEmail("");
      fetchTeam();
    }
  };

  const handleDeleteInvite = async (email: string) => {
    const { error } = await supabase.from("admin_invites").delete().eq("email", email);
    if (!error) {
      logAction("Cancelled invite", "admin", email);
      fetchTeam();
    }
  };

  const handleToggleRestrict = async (id: string, currentRole: string, email: string) => {
    if (userRole !== "owner") return;
    const newRole = currentRole === "restricted" ? "admin" : "restricted";
    
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Admin ${newRole === "restricted" ? "restricted" : "restored"}` });
      logAction(newRole === "restricted" ? "Restricted admin" : "Restored admin", "admin", email);
      fetchTeam();
    }
  };

  const handleDeleteAdmin = async (id: string, email: string) => {
    if (userRole !== "owner") {
      toast({ title: "Unauthorized", description: "Only the owner can delete admins.", variant: "destructive" });
      return;
    }
    if (id === session?.user?.id) {
      toast({ title: "Action Blocked", description: "You cannot remove your own account.", variant: "destructive" });
      return;
    }
    if (email === "luchpfume@gmail.com") {
      toast({ title: "Action Blocked", description: "The primary owner cannot be deleted.", variant: "destructive" });
      return;
    }
    if (!confirm(`Are you sure you want to PERMANENTLY remove ${email}?`)) return;

    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Admin account deleted" });
      logAction("Removed admin", "admin", email);
      fetchTeam();
    }
  };

  const handleToggleReviewVisibility = async (id: string, current: boolean, reviewer: string) => {
    const { error } = await supabase.from("reviews").update({ visible: !current }).eq("id", id);
    if (!error) {
      logAction(current ? "Hid review" : "Showed review", "review", reviewer);
      fetchReviews();
    }
  };

  const handleToggleReviewVerified = async (id: string, current: boolean, reviewer: string) => {
    const { error } = await supabase.from("reviews").update({ verified: !current }).eq("id", id);
    if (!error) {
      logAction(current ? "Unverified review" : "Verified review", "review", reviewer);
      fetchReviews();
    }
  };

  const handleDeleteReview = async (id: string, reviewer: string) => {
    if (!confirm(`Delete review from ${reviewer}?`)) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (!error) {
      logAction("Deleted review", "review", reviewer);
      fetchReviews();
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("reviews").insert([reviewFormData]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Review added manually" });
      logAction("Manually added review", "review", reviewFormData.reviewer_name);
      setReviewFormData({
        reviewer_name: "",
        product_id: "",
        rating: 5,
        comment: "",
        verified: false,
      });
      fetchReviews();
    }
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
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-serif text-3xl">Admin Dashboard</h1>
            
            <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-1.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium">{session?.user?.email}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{userRole}</span>
              </div>
            </div>

            <div className="flex gap-2 rounded-lg bg-muted p-1">
              <button
                onClick={() => setActiveTab("products")}
                className={`rounded-md px-3 py-1 text-sm transition-all ${
                  activeTab === "products" ? "bg-background shadow-sm" : "hover:text-foreground/80"
                }`}
              >
                Products
              </button>
              {userRole === "owner" && (
                <>
                  <button
                    onClick={() => setActiveTab("team")}
                    className={`rounded-md px-3 py-1 text-sm transition-all ${
                      activeTab === "team" ? "bg-background shadow-sm" : "hover:text-foreground/80"
                    }`}
                  >
                    Team
                  </button>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`rounded-md px-3 py-1 text-sm transition-all ${
                      activeTab === "activity" ? "bg-background shadow-sm" : "hover:text-foreground/80"
                    }`}
                  >
                    Activity
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`rounded-md px-3 py-1 text-sm transition-all ${
                      activeTab === "reviews" ? "bg-background shadow-sm" : "hover:text-foreground/80"
                    }`}
                  >
                    Reviews
                  </button>
                </>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        {activeTab === "products" && (
          <>
            {showForm ? (
          <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-medium">{editingId ? "Edit Product" : "Add Product"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm">Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Price (₦)</label>
                  <input
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Unboxed">Unboxed</option>
                    <option value="Thrifted Open Box">Thrifted Open Box</option>
                    <option value="Boxed">Boxed</option>
                    <option value="Tester">Tester</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm">
                    Image {editingId && !imageFile ? "(Leave blank to keep current)" : ""}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    required={!editingId}
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">
                    Video {editingId && !videoFile ? "(Leave blank to keep current)" : ""}
                  </label>
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Pricing Sizes (Optional)</label>
                <div className="space-y-2">
                  {formData.sizes.map((s, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Size (e.g. 100ml)"
                        value={s.size}
                        onChange={(e) => {
                          const newSizes = [...formData.sizes];
                          newSizes[idx].size = e.target.value;
                          setFormData({ ...formData, sizes: newSizes });
                        }}
                        className="flex-1 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={s.price}
                        onChange={(e) => {
                          const newSizes = [...formData.sizes];
                          newSizes[idx].price = parseFloat(e.target.value);
                          setFormData({ ...formData, sizes: newSizes });
                        }}
                        className="flex-1 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newSizes = formData.sizes.filter((_, i) => i !== idx);
                          setFormData({ ...formData, sizes: newSizes });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    onClick={() => setFormData({ ...formData, sizes: [...formData.sizes, { size: "", price: 0 }] })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Size
                  </Button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm">Description (Notes)</label>
                <input
                  required
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : editingId ? (
                    "Update"
                  ) : (
                    "Add"
                  )}
                </Button>
                <Button variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-serif text-2xl">Product Catalog</h2>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No products found. Add your first perfume!
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.image_url && (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        )}
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.description}</div>
                      </div>
                    </td>
                    <td className="p-4">{p.category}</td>
                    <td className="p-4">₦{p.price.toLocaleString()}</td>
                    <td className="p-4">
                      <span
                        onClick={() => handleToggleStock(p)}
                        className={`inline-flex rounded-full px-2 py-1 text-xs cursor-pointer ${
                          p.in_stock
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {p.in_stock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleToggleVisibility(p)}>
                          {p.visible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4 opacity-50" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(p.id, p.name)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
          </>
        )}

        {activeTab === "team" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{session?.user?.email}</h3>
                <p className="text-sm text-muted-foreground capitalize">{userRole}</p>
              </div>
            </div>

            {userRole === "owner" ? (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-xl font-medium">Add Admin</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Enter an email address to invite someone as an admin. They will automatically get admin rights when they sign up with this email.
                </p>
                <form onSubmit={handleAddInvite} className="flex gap-4">
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={newInviteEmail}
                    onChange={(e) => setNewInviteEmail(e.target.value)}
                    className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    required
                  />
                  <Button type="submit">Invite Admin</Button>
                </form>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
                <Shield className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <h2 className="text-lg font-medium">Team Management</h2>
                <p className="text-sm text-muted-foreground">Only the owner can invite or manage other administrators.</p>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-4 font-medium">Team Member</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((member) => (
                    <tr key={member.id || member.email} className="border-t border-border">
                      <td className="p-4">
                        <div className="font-medium">{member.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(member.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          member.role === "owner" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          {member.role === "owner" && <Shield className="h-3 w-3" />}
                          {member.role === "admin" && <ShieldOff className="h-3 w-3" />}
                          <span className="capitalize">{member.role}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          member.status === "active" ? "bg-green-500/10 text-green-500" :
                          member.status === "pending" ? "bg-yellow-500/10 text-yellow-500" :
                          "bg-red-500/10 text-red-500"
                        }`}>
                          <span className="capitalize">{member.status}</span>
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {userRole === "owner" && member.role !== "owner" && (
                            <>
                              {member.status !== "pending" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title={member.status === "restricted" ? "Unrestrict Admin" : "Restrict Admin"}
                                  onClick={() => handleToggleRestrict(member.id!, member.role, member.email || "")}
                                  className={member.status === "restricted" ? "text-green-500" : "text-orange-500"}
                                >
                                  {member.status === "restricted" ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Delete Account/Invite"
                                onClick={() => member.status === "pending" ? handleDeleteInvite(member.email) : handleDeleteAdmin(member.id!, member.email)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {member.status === "pending" && <Mail className="h-4 w-4 text-muted-foreground opacity-50" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl">Activity Log</h2>
              {session?.user?.id === OWNER_ID && (
                <Button variant="destructive" size="sm" onClick={handleClearLogs}>
                  Clear All
                </Button>
              )}
            </div>

            <div className="flex gap-4">
              <select 
                value={logFilterAdmin} 
                onChange={(e) => { setLogFilterAdmin(e.target.value); fetchLogs(); }}
                className="rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="all">All Admins</option>
                {Array.from(new Set(logs.map(l => l.admin_email))).map(email => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
              <select 
                value={logFilterAction} 
                onChange={(e) => { setLogFilterAction(e.target.value); fetchLogs(); }}
                className="rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="all">All Actions</option>
                {Array.from(new Set(logs.map(l => l.action))).map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-4 font-medium">Date & Time</th>
                    <th className="p-4 font-medium">Admin Email</th>
                    <th className="p-4 font-medium">Action</th>
                    <th className="p-4 font-medium">Product/Target Name</th>
                    {session?.user?.id === OWNER_ID && <th className="p-4 font-medium text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">No activities recorded yet.</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="border-t border-border">
                        <td className="p-4 text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-4 font-medium">{log.admin_email}</td>
                        <td className="p-4">
                          <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{log.target_name}</td>
                        {session?.user?.id === OWNER_ID && (
                          <td className="p-4 text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteLog(log.id)} className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === "reviews" && (
          <div className="space-y-8 animate-fade-in pb-20">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-medium">Add Manual Review</h2>
              <form onSubmit={handleAddReview} className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Reviewer Name"
                  value={reviewFormData.reviewer_name}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, reviewer_name: e.target.value })}
                  className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  required
                />
                <select
                  value={reviewFormData.product_id}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, product_id: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <div className="flex items-center gap-4">
                  <label className="text-sm">Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={reviewFormData.rating}
                    onChange={(e) => setReviewFormData({ ...reviewFormData, rating: parseInt(e.target.value) })}
                    className="w-20 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reviewFormData.verified}
                      onChange={(e) => setReviewFormData({ ...reviewFormData, verified: e.target.checked })}
                    />
                    Verified Purchase
                  </label>
                </div>
                <textarea
                  placeholder="Comment"
                  value={reviewFormData.comment}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                  className="col-span-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm h-20"
                />
                <Button type="submit" className="w-fit">Save Review</Button>
              </form>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-4 font-medium">Reviewer</th>
                    <th className="p-4 font-medium">Product</th>
                    <th className="p-4 font-medium">Rating</th>
                    <th className="p-4 font-medium">Comment</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="p-4">
                        <div className="font-medium">{r.reviewer_name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">{new Date(r.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4">{r.products?.name}</td>
                      <td className="p-4 text-yellow-500 font-bold">{"★".repeat(r.rating)}</td>
                      <td className="p-4 max-w-xs truncate">{r.comment}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <span 
                            onClick={() => handleToggleReviewVerified(r.id, r.verified, r.reviewer_name)}
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase cursor-pointer ${r.verified ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}
                          >
                            {r.verified ? 'Verified' : 'Unverified'}
                          </span>
                          <span 
                            onClick={() => handleToggleReviewVisibility(r.id, r.visible, r.reviewer_name)}
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase cursor-pointer ${r.visible ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-500'}`}
                          >
                            {r.visible ? 'Visible' : 'Hidden'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteReview(r.id, r.reviewer_name)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
