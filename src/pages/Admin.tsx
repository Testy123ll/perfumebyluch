import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Product, IS_SUPABASE_CONFIGURED } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast, toast } from "@/components/ui/use-toast";
import { Trash2, Edit2, Eye, EyeOff, Plus, LogOut, Loader2, Shield, ShieldOff, Mail, History, User } from "lucide-react";

const OWNER_ID = "7a7f1bb0-6aa6-42e6-80e3-7e4f7a48491e";
const TEST_SESSION_KEY = "pbl_admin_test_session";
const MAX_VIDEO_SIZE_MB = 20;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;


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
    size: "",
    scent_mood: "",
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
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const navigate = useNavigate();
  // Using static toast to avoid re-render loops

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

    const profileEmails = new Set((profiles || []).map(p => p.email));
    
    const combinedTeam: any[] = [
      ...(profiles || []).map(p => ({
        id: p.id,
        email: p.email,
        role: p.role,
        status: p.role === "restricted" ? "restricted" : "active",
        created_at: p.created_at
      })),
      ...(invites || []).filter(i => !profileEmails.has(i.email)).map(i => ({
        email: i.email,
        role: "admin",
        status: "pending",
        created_at: i.created_at
      }))
    ];

    // Sort: Owners first, then by date
    setTeam(combinedTeam.sort((a, b) => {
      if (a.role === "owner" && b.role !== "owner") return -1;
      if (a.role !== "owner" && b.role === "owner") return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }));
  }, []);

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
      
      // 1. Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentSession.user.id)
        .single();
      
      if (profileError || !profile) {
        // 2. Check if invited
        const { data: invite } = await supabase
          .from("admin_invites")
          .select("*")
          .eq("email", currentSession.user.email)
          .single();

        if (invite) {
          // 3. Create profile if invited
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([{ id: currentSession.user.id, email: currentSession.user.email, role: 'admin' }]);
          
          if (!insertError) {
            setUserRole("admin");
            // Optionally delete the invite now
            await supabase.from("admin_invites").delete().eq("email", currentSession.user.email);
          } else {
            toast({ title: "Profile Error", description: "Could not initialize admin profile.", variant: "destructive" });
            supabase.auth.signOut();
            navigate("/admin/login");
            setAuthChecking(false);
            return;
          }
        } else {
          // 4. No profile and no invite = Deny
          toast({ title: "Access Denied", description: "You have not been invited as an admin.", variant: "destructive" });
          supabase.auth.signOut();
          navigate("/admin/login");
          setAuthChecking(false);
          return;
        }
      } else {
        // Profile exists
        if (profile.role !== "admin" && profile.role !== "owner") {
          toast({ title: "Access Denied", description: "Unauthorized role.", variant: "destructive" });
          supabase.auth.signOut();
          navigate("/admin/login");
          setAuthChecking(false);
          return;
        }
        setUserRole(profile.role);
      }

      // Successful auth - load data
      fetchProducts();
      fetchReviews();
      fetchLogs();
      if (profile?.role === "owner" || (userRole === "owner")) {
        fetchTeam();
      }
      
      setAuthChecking(false);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!newSession) {
          navigate("/admin/login");
        } else {
          setSession(newSession);
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, [navigate, fetchProducts, fetchReviews, fetchLogs, fetchTeam, userRole]);

  useEffect(() => {
    if (session) fetchLogs();
  }, [logFilterAdmin, logFilterAction]);

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
      logAction(product.visible ? "Hidden product" : "Showed product", "product", product.name);
      fetchProducts();
    }
  };

  const handleToggleTestimonial = async (id: string, current: boolean, name: string) => {
    if (!current) {
      const testimonialsCount = reviews.filter(r => r.is_testimonial).length;
      if (testimonialsCount >= 3) {
        toast({ 
          title: "Limit Reached", 
          description: "You can only feature 3 Testimonials at a time. Remove one first.", 
          variant: "destructive" 
        });
        return;
      }
    }

    const { error } = await supabase
      .from("reviews")
      .update({ is_testimonial: !current })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      logAction(!current ? "Featured as Testimonial" : "Removed from Testimonials", "review", name);
      fetchReviews();
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

  const handleToggleNewArrival = async (product: Product) => {
    const { error } = await supabase
      .from("products")
      .update({ is_new: !product.is_new })
      .eq("id", product.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      logAction(product.is_new ? "Removed from New Arrivals" : "Marked as New Arrival", "product", product.name);
      fetchProducts();
    }
  };

  const handleToggleBestSeller = async (product: Product) => {
    if (!product.is_bestseller) {
      const bestSellersCount = products.filter(p => p.is_bestseller).length;
      if (bestSellersCount >= 6) {
        toast({ 
          title: "Limit Reached", 
          description: "You can only have 6 Top Sellers at a time. Remove one first.", 
          variant: "destructive" 
        });
        return;
      }
    }

    const { error } = await supabase
      .from("products")
      .update({ is_bestseller: !product.is_bestseller })
      .eq("id", product.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      logAction(!product.is_bestseller ? "Marked as Top Seller" : "Removed from Top Sellers", "product", product.name);
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
      size: product.size || "",
      scent_mood: product.scent_mood || "",
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
      size: "",
      scent_mood: "",
    });
    setImageFile(null);
    setVideoFile(null);
    setShowForm(false);
  };


  const uploadWithRetry = async (
    filePath: string,
    file: ArrayBuffer,
    options: any,
    maxRetries = 3
  ): Promise<{ publicUrl: string | null; error: any }> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const { error } = await supabase.storage
          .from("products")
          .upload(filePath, file, options);
        
        if (!error) {
          const { data: publicUrlData } = supabase.storage
            .from("products")
            .getPublicUrl(filePath);
          return { publicUrl: publicUrlData.publicUrl, error: null };
        }
        
        if (i === maxRetries - 1) {
          return { publicUrl: null, error };
        }
        
        await new Promise(r => setTimeout(r, 2000));
      } catch (err: any) {
        if (i === maxRetries - 1) return { publicUrl: null, error: err };
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    return { publicUrl: null, error: new Error("Upload failed after retries") };
  };

  const uploadVideoInChunks = async (
    file: File,
    filePath: string,
    onProgress: (msg: string) => void
  ): Promise<{ publicUrl: string | null; error: any }> => {
    const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const chunks: ArrayBuffer[] = [];

    // Read file in chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const blob = file.slice(start, end);
      const buffer = await blob.arrayBuffer();
      chunks.push(buffer);
      onProgress(`Reading video... ${Math.round(((i + 1) / totalChunks) * 50)}%`);
    }

    // Combine chunks
    const totalLength = chunks.reduce((sum, c) => sum + c.byteLength, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }

    onProgress("Uploading video... please wait");

    const { error } = await supabase.storage
      .from("products")
      .upload(filePath, combined.buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) return { publicUrl: null, error };

    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(filePath);

    return { publicUrl: publicUrlData.publicUrl, error: null };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let image_url = editingId ? products.find((p) => p.id === editingId)?.image_url : "";

    if (imageFile) {
      setUploadProgress("Uploading image...");
      const imageExt = imageFile.name.split(".").pop();
      const imagePath = `product-images/${Date.now()}.${imageExt}`;

      const arrayBuffer = await imageFile.arrayBuffer();
      const { publicUrl, error: imgError } = await uploadWithRetry(
        imagePath,
        arrayBuffer,
        {
          contentType: imageFile.type,
          cacheControl: "3600",
          upsert: false,
        }
      );

      if (imgError) {
        toast({
          title: "Image Upload Failed",
          description: imgError.message,
          variant: "destructive",
        });
        setLoading(false);
        setUploadProgress("");
        return;
      }

      image_url = publicUrl || "";
    }

    let video_url = editingId ? products.find((p) => p.id === editingId)?.video_url : "";

    if (videoFile) {
      const videoPath = `product-videos/${Date.now()}.${videoFile.name.split(".").pop()}`;
      const { publicUrl, error: vidError } = await uploadVideoInChunks(
        videoFile,
        videoPath,
        setUploadProgress
      );

      if (vidError) {
        toast({
          title: "Video Upload Failed",
          description: vidError?.message || JSON.stringify(vidError) || "Unknown error",
          variant: "destructive",
        });
        setLoading(false);
        setUploadProgress("");
        return;
      }

      video_url = publicUrl || "";
    }

    setUploadProgress("");

    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      category: formData.category,
      in_stock: formData.in_stock,
      visible: formData.visible,
      is_new: formData.is_new,
      video_url,
      size: formData.size,
      scent_mood: formData.scent_mood,
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

  // Removed debug useEffect for performance

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
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Invite cancelled" });
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      {uploadProgress && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground animate-pulse">
          ⏳ {uploadProgress}
        </div>
      )}
      <div className="mx-auto max-w-5xl w-full">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <h1 className="font-serif text-2xl md:text-3xl">Admin Dashboard</h1>
            
            <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-1.5 shadow-sm w-fit">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-sm font-medium truncate max-w-[150px] md:max-w-none">{session?.user?.email}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{userRole}</span>
              </div>
            </div>

            <div className="flex gap-2 rounded-lg bg-muted p-1 overflow-x-auto no-scrollbar whitespace-nowrap">
              <button
                onClick={() => setActiveTab("products")}
                className={`rounded-md px-3 py-1 text-sm transition-all flex-shrink-0 ${
                  activeTab === "products" ? "bg-background shadow-sm" : "hover:text-foreground/80"
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`rounded-md px-3 py-1 text-sm transition-all flex-shrink-0 ${
                  activeTab === "reviews" ? "bg-background shadow-sm" : "hover:text-foreground/80"
                }`}
              >
                Reviews
              </button>
              {userRole === "owner" && (
                <>
                  <button
                    onClick={() => setActiveTab("team")}
                    className={`rounded-md px-3 py-1 text-sm transition-all flex-shrink-0 ${
                      activeTab === "team" ? "bg-background shadow-sm" : "hover:text-foreground/80"
                    }`}
                  >
                    Team
                  </button>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`rounded-md px-3 py-1 text-sm transition-all flex-shrink-0 ${
                      activeTab === "activity" ? "bg-background shadow-sm" : "hover:text-foreground/80"
                    }`}
                  >
                    Activity
                  </button>
                </>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="w-full md:w-auto">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        {activeTab === "products" && (
          <>
            {showForm ? (
          <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-medium">{editingId ? "Edit Product" : "Add Product"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && file.size > MAX_VIDEO_SIZE_BYTES) {
                        toast({
                          title: "Video too large",
                          description: `Please upload a video under ${MAX_VIDEO_SIZE_MB}MB. Tip: compress your video using HandBrake or Clideo.com before uploading.`,
                          variant: "destructive",
                        });
                        e.target.value = "";
                        setVideoFile(null);
                        return;
                      }
                      setVideoFile(file);
                    }}
                    className="w-full text-sm"
                  />
                  {videoFile && (
                    <p className={`mt-1 text-xs ${videoFile.size > MAX_VIDEO_SIZE_BYTES ? "text-red-500 font-bold" : "text-green-600"}`}>
                      Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB) 
                      {videoFile.size > MAX_VIDEO_SIZE_BYTES ? " • Too large" : " • Good to upload"}
                    </p>
                  )}
                </div>
              </div>

                <div>
                  <label className="mb-1 block text-sm">Size (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 50ml, 100ml, 3.4oz"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm">Scent Mood (Optional)</label>
                  <select
                    value={formData.scent_mood}
                    onChange={(e) => setFormData({ ...formData, scent_mood: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
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
                <Button type="submit" disabled={loading || (!!videoFile && videoFile.size > MAX_VIDEO_SIZE_BYTES)} className="w-full md:w-auto">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : editingId ? (
                    "Update"
                  ) : (
                    "Add"
                  )}
                </Button>
                <Button variant="ghost" onClick={resetForm} className="w-full md:w-auto">
                  Cancel
                </Button>
              </div>
              {uploadProgress && (
                <p className="mt-2 text-sm text-primary animate-pulse">{uploadProgress}</p>
              )}
            </form>
          </div>
        ) : (
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl md:text-2xl">Product Catalog</h2>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Visible</span>
                <span className="flex items-center gap-1 font-bold text-green-600">✓ In Stock</span>
                <span className="flex items-center gap-1 text-primary">✨ New Arrival</span>
                <span className="flex items-center gap-1 text-amber-500">🔥 Top Seller</span>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2 shrink-0" size="sm">
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add Product</span>
            </Button>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm min-w-[600px] md:min-w-0">
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
                      <div className="flex items-center gap-3 min-w-0">
                        {p.image_url && (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="h-8 w-8 md:h-10 md:w-10 rounded-md object-cover shrink-0"
                          />
                        )}
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{p.name}</span>
                            {p.is_bestseller && <span title="Featured Top Seller" className="text-amber-500">🔥</span>}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1 hidden md:block">{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{p.category}</td>
                    <td className="p-4 whitespace-nowrap">₦{p.price.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleToggleStock(p)}
                          title={p.in_stock ? "Mark as Out of Stock" : "Mark as In Stock"}
                          className={`flex h-7 md:h-8 w-14 md:w-16 items-center justify-center rounded-md border text-[9px] md:text-[10px] font-bold uppercase transition-all ${
                            p.in_stock
                              ? "border-green-500/50 bg-green-500/10 text-green-600"
                              : "border-red-500/50 bg-red-500/10 text-red-500"
                          }`}
                        >
                          {p.in_stock ? "✓ Stock" : "× Out"}
                        </button>
                        <button
                          onClick={() => handleToggleNewArrival(p)}
                          title={p.is_new ? "Remove from New Arrivals" : "Mark as New Arrival"}
                          className={`flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-md border transition-all ${
                            p.is_new ? "border-primary/50 bg-primary/10 text-primary shadow-sm" : "border-border opacity-40 hover:opacity-100"
                          }`}
                        >
                          ✨
                        </button>
                        <button
                          onClick={() => handleToggleBestSeller(p)}
                          title={p.is_bestseller ? "Remove from Top Sellers" : "Mark as Top Seller (max 6)"}
                          className={`flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-md border transition-all ${
                            p.is_bestseller ? "border-amber-500/50 bg-amber-500/10 shadow-sm" : "border-border opacity-40 hover:opacity-100"
                          }`}
                        >
                          🔥
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1 md:gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleVisibility(p)}>
                          {p.visible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4 opacity-50" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(p)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(p.id, p.name)}
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
                  Enter an email address to invite someone as an admin.
                </p>
                <form onSubmit={handleAddInvite} className="flex flex-col md:flex-row gap-4">
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={newInviteEmail}
                    onChange={(e) => setNewInviteEmail(e.target.value)}
                    className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    required
                  />
                  <Button type="submit" className="w-full md:w-auto">Invite Admin</Button>
                </form>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
                <Shield className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <h2 className="text-lg font-medium">Team Management</h2>
                <p className="text-sm text-muted-foreground">Only the owner can invite or manage other administrators.</p>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-sm min-w-[500px] md:min-w-0">
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
                        <div className="font-medium truncate max-w-[200px] md:max-w-none">{member.email}</div>
                        <div className="text-xs text-muted-foreground hidden md:block">
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
                        <div className="flex justify-end gap-1 md:gap-2">
                          {userRole === "owner" && member.role !== "owner" && (
                            <>
                              {member.status !== "pending" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title={member.status === "restricted" ? "Unrestrict Admin" : "Restrict Admin"}
                                  onClick={() => handleToggleRestrict(member.id!, member.role, member.email || "")}
                                  className={`h-8 w-8 ${member.status === "restricted" ? "text-green-500" : "text-orange-500"}`}
                                >
                                  {member.status === "restricted" ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Delete Account/Invite"
                                onClick={() => member.status === "pending" ? handleDeleteInvite(member.email) : handleDeleteAdmin(member.id!, member.email)}
                                className="h-8 w-8 text-red-500 hover:text-red-600"
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

            <div className="flex flex-col md:flex-row gap-4">
              <select 
                value={logFilterAdmin} 
                onChange={(e) => { setLogFilterAdmin(e.target.value); fetchLogs(); }}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full md:w-auto"
              >
                <option value="all">All Admins</option>
                {Array.from(new Set(logs.map(l => l.admin_email))).map(email => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
              <select 
                value={logFilterAction} 
                onChange={(e) => { setLogFilterAction(e.target.value); fetchLogs(); }}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full md:w-auto"
              >
                <option value="all">All Actions</option>
                {Array.from(new Set(logs.map(l => l.action))).map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-sm min-w-[600px] md:min-w-0">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-4 font-medium">Date & Time</th>
                    <th className="p-4 font-medium hidden md:table-cell">Admin Email</th>
                    <th className="p-4 font-medium">Action</th>
                    <th className="p-4 font-medium">Target</th>
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
                        <td className="p-4 text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-4 font-medium hidden md:table-cell truncate max-w-[150px]">{log.admin_email}</td>
                        <td className="p-4">
                          <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] md:text-xs font-medium text-primary whitespace-nowrap">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground truncate max-w-[100px] md:max-w-none">{log.target_name}</td>
                        {session?.user?.id === OWNER_ID && (
                          <td className="p-4 text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteLog(log.id)} className="text-red-500 h-8 w-8">
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
            <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-medium">Add Manual Review</h2>
              <form onSubmit={handleAddReview} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="md:col-span-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm h-20"
                />
                <Button type="submit" className="w-full md:w-fit">Save Review</Button>
              </form>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-x-auto no-scrollbar shadow-sm">
              <div className="border-b border-border bg-muted/30 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <h2 className="text-lg font-medium">Customer Reviews</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Visible</span>
                  <span className="flex items-center gap-1 font-bold text-green-600">✓ Verified</span>
                  <span className="flex items-center gap-1 text-amber-500">⭐ Featured Testimonial</span>
                </div>
              </div>
              <table className="w-full text-left text-sm min-w-[700px] md:min-w-0">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-4 font-medium">Reviewer</th>
                    <th className="p-4 font-medium">Product</th>
                    <th className="p-4 font-medium">Rating</th>
                    <th className="p-4 font-medium hidden md:table-cell">Comment</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{r.reviewer_name}</span>
                          {r.is_testimonial && <span title="Featured as Testimonial" className="text-amber-500">⭐</span>}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase">{new Date(r.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4">{r.products?.name}</td>
                      <td className="p-4 text-yellow-500 font-bold whitespace-nowrap">{"★".repeat(r.rating)}</td>
                      <td className="p-4 max-w-xs truncate hidden md:table-cell">{r.comment}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleToggleReviewVisibility(r.id, r.visible, r.reviewer_name)}
                            title="Toggle Visibility"
                            className={`flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-md border transition-all ${r.visible ? 'border-primary/50 bg-primary/10 text-primary' : 'border-red-500/50 bg-red-500/10 text-red-500'}`}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleReviewVerified(r.id, r.verified, r.reviewer_name)}
                            title="Toggle Verified Badge"
                            className={`flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-md border font-bold transition-all ${r.verified ? 'border-green-500/50 bg-green-500/10 text-green-600' : 'border-border opacity-40'}`}
                          >
                            ✓
                          </button>
                          <button 
                            onClick={() => handleToggleTestimonial(r.id, r.is_testimonial, r.reviewer_name)}
                            title="Feature as Testimonial (max 3)"
                            className={`flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-md border transition-all ${r.is_testimonial ? 'border-amber-500/50 bg-amber-500/10 text-amber-500 shadow-sm' : 'border-border opacity-40'}`}
                          >
                            ⭐
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteReview(r.id, r.reviewer_name)}>
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
