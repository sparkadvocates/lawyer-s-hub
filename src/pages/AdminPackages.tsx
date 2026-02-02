import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Check,
  Crown,
  Zap,
  Users,
  CreditCard,
  Calendar,
} from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_cases: number | null;
  max_clients: number | null;
  max_documents: number | null;
  is_active: boolean;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string | null;
  billing_cycle: string;
  status: string;
  start_date: string;
  end_date: string | null;
  amount_paid: number | null;
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  subscription_plans: { name: string } | null;
  profiles: { username: string | null; display_name: string | null } | null;
}

const AdminPackages = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  // Plan form state
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planName, setPlanName] = useState("");
  const [planSlug, setPlanSlug] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planPriceMonthly, setPlanPriceMonthly] = useState("");
  const [planPriceYearly, setPlanPriceYearly] = useState("");
  const [planFeatures, setPlanFeatures] = useState("");
  const [planMaxCases, setPlanMaxCases] = useState("");
  const [planMaxClients, setPlanMaxClients] = useState("");
  const [planMaxDocs, setPlanMaxDocs] = useState("");
  const [planActive, setPlanActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Subscription form state
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedCycle, setSelectedCycle] = useState("monthly");
  const [customDuration, setCustomDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState<"days" | "months" | "years">("months");
  const [subAmount, setSubAmount] = useState("");
  const [subPaymentMethod, setSubPaymentMethod] = useState("");
  const [subPaymentRef, setSubPaymentRef] = useState("");
  const [subNotes, setSubNotes] = useState("");
  const [creatingSub, setCreatingSub] = useState(false);

  // Users list for subscription assignment
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Access denied: Admin privileges required");
      navigate("/dashboard");
      return;
    }

    if (!authLoading && isAdmin) {
      fetchData();
    }
  }, [authLoading, isAdmin, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch plans
      const { data: plansData } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price_monthly", { ascending: true });

      if (plansData) {
        setPlans(
          plansData.map((p) => ({
            ...p,
            features: Array.isArray(p.features) ? (p.features as string[]) : [],
          }))
        );
      }

      // Fetch subscriptions with profiles
      const { data: subsData } = await supabase
        .from("user_subscriptions")
        .select("*, subscription_plans(name)")
        .order("created_at", { ascending: false });

      // Fetch profiles separately
      const { data: profilesData } = await supabase.from("profiles").select("user_id, username, display_name");

      const subsWithProfiles = (subsData || []).map((sub) => {
        const profile = profilesData?.find((p) => p.user_id === sub.user_id);
        return {
          ...sub,
          profiles: profile ? { username: profile.username, display_name: profile.display_name } : null,
        };
      });

      setSubscriptions(subsWithProfiles as Subscription[]);

      // Fetch users for dropdown (admin-only via edge function not needed here, just use profiles)
      if (profilesData) {
        setUsers(
          profilesData.map((p) => ({
            id: p.user_id,
            email: p.username || p.user_id,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const openPlanDialog = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanName(plan.name);
      setPlanSlug(plan.slug);
      setPlanDescription(plan.description || "");
      setPlanPriceMonthly(String(plan.price_monthly));
      setPlanPriceYearly(String(plan.price_yearly));
      setPlanFeatures(plan.features.join("\n"));
      setPlanMaxCases(plan.max_cases ? String(plan.max_cases) : "");
      setPlanMaxClients(plan.max_clients ? String(plan.max_clients) : "");
      setPlanMaxDocs(plan.max_documents ? String(plan.max_documents) : "");
      setPlanActive(plan.is_active);
    } else {
      setEditingPlan(null);
      setPlanName("");
      setPlanSlug("");
      setPlanDescription("");
      setPlanPriceMonthly("");
      setPlanPriceYearly("");
      setPlanFeatures("");
      setPlanMaxCases("");
      setPlanMaxClients("");
      setPlanMaxDocs("");
      setPlanActive(true);
    }
    setPlanDialogOpen(true);
  };

  const savePlan = async () => {
    if (!planName || !planSlug) {
      toast.error("Name and slug are required");
      return;
    }

    try {
      setSaving(true);
      const planData = {
        name: planName,
        slug: planSlug,
        description: planDescription || null,
        price_monthly: parseFloat(planPriceMonthly) || 0,
        price_yearly: parseFloat(planPriceYearly) || 0,
        features: planFeatures.split("\n").filter((f) => f.trim()) as unknown as Json,
        max_cases: planMaxCases ? parseInt(planMaxCases) : null,
        max_clients: planMaxClients ? parseInt(planMaxClients) : null,
        max_documents: planMaxDocs ? parseInt(planMaxDocs) : null,
        is_active: planActive,
      };

      if (editingPlan) {
        const { error } = await supabase
          .from("subscription_plans")
          .update(planData)
          .eq("id", editingPlan.id);

        if (error) throw error;
        toast.success("Plan updated successfully");
      } else {
        const { error } = await supabase.from("subscription_plans").insert(planData);
        if (error) throw error;
        toast.success("Plan created successfully");
      }

      setPlanDialogOpen(false);
      fetchData();
    } catch (error: unknown) {
      console.error("Error saving plan:", error);
      const message = error instanceof Error ? error.message : "Failed to save plan";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      const { error } = await supabase.from("subscription_plans").delete().eq("id", planId);
      if (error) throw error;
      toast.success("Plan deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete plan");
    }
  };

  const createSubscription = async () => {
    if (!selectedUserId || !selectedPlanId) {
      toast.error("User and plan are required");
      return;
    }

    try {
      setCreatingSub(true);

      const selectedPlan = plans.find((p) => p.id === selectedPlanId);
      const amount =
        parseFloat(subAmount) ||
        (selectedCycle === "monthly" ? selectedPlan?.price_monthly : selectedPlan?.price_yearly) ||
        0;

      // Calculate end date based on custom duration or billing cycle
      const endDate = new Date();
      if (customDuration && parseInt(customDuration) > 0) {
        const duration = parseInt(customDuration);
        if (durationUnit === "days") {
          endDate.setDate(endDate.getDate() + duration);
        } else if (durationUnit === "months") {
          endDate.setMonth(endDate.getMonth() + duration);
        } else if (durationUnit === "years") {
          endDate.setFullYear(endDate.getFullYear() + duration);
        }
      } else if (selectedCycle === "monthly") {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const { error: subError } = await supabase.from("user_subscriptions").insert({
        user_id: selectedUserId,
        plan_id: selectedPlanId,
        billing_cycle: selectedCycle,
        status: "active",
        amount_paid: amount,
        payment_method: subPaymentMethod || null,
        payment_reference: subPaymentRef || null,
        notes: subNotes || null,
        end_date: endDate.toISOString(),
        renewal_reminder_sent: false,
      });

      if (subError) throw subError;

      // Record payment
      const { error: payError } = await supabase.from("payment_history").insert({
        user_id: selectedUserId,
        amount,
        payment_method: subPaymentMethod || null,
        payment_reference: subPaymentRef || null,
        status: "completed",
        notes: `${selectedPlan?.name} - ${customDuration ? `${customDuration} ${durationUnit}` : (selectedCycle === "monthly" ? "মাসিক" : "বাৎসরিক")}`,
      });

      if (payError) console.error("Payment recording error:", payError);

      toast.success("Subscription created successfully");
      setSubDialogOpen(false);
      setSelectedUserId("");
      setSelectedPlanId("");
      setCustomDuration("");
      setDurationUnit("months");
      setSubAmount("");
      setSubPaymentMethod("");
      setSubPaymentRef("");
      setSubNotes("");
      fetchData();
    } catch (error: unknown) {
      console.error("Error creating subscription:", error);
      const message = error instanceof Error ? error.message : "Failed to create subscription";
      toast.error(message);
    } finally {
      setCreatingSub(false);
    }
  };

  const updateSubscriptionStatus = async (subId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ status: newStatus })
        .eq("id", subId);

      if (error) throw error;
      toast.success(`Subscription ${newStatus}`);
      fetchData();
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error("Failed to update subscription");
    }
  };

  const getPlanIcon = (slug: string) => {
    if (slug === "enterprise") return <Crown className="w-6 h-6 text-primary" />;
    if (slug === "pro") return <Zap className="w-6 h-6 text-chart-2" />;
    return <Package className="w-6 h-6 text-muted-foreground" />;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("bn-BD");
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden pl-16 md:pl-0">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden pl-16 md:pl-0">
        <Header />
        <div className="flex-1 overflow-auto p-3 sm:p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-primary" />
                প্যাকেজ ও বিলিং
              </h1>
              <p className="text-muted-foreground mt-1">সাবস্ক্রিপশন প্ল্যান এবং বিলিং ম্যানেজমেন্ট</p>
            </div>
          </div>

          <Tabs defaultValue="plans" className="space-y-6">
            <TabsList>
              <TabsTrigger value="plans">প্ল্যানসমূহ</TabsTrigger>
              <TabsTrigger value="subscriptions">সাবস্ক্রিপশন</TabsTrigger>
            </TabsList>

            {/* Plans Tab */}
            <TabsContent value="plans" className="space-y-6">
              <div className="flex justify-end">
                <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openPlanDialog()}>
                      <Plus className="w-4 h-4 mr-2" />
                      নতুন প্ল্যান
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingPlan ? "প্ল্যান এডিট করুন" : "নতুন প্ল্যান তৈরি করুন"}</DialogTitle>
                      <DialogDescription>প্ল্যানের বিস্তারিত তথ্য দিন</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>নাম *</Label>
                          <Input value={planName} onChange={(e) => setPlanName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Slug *</Label>
                          <Input value={planSlug} onChange={(e) => setPlanSlug(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>বর্ণনা</Label>
                        <Textarea value={planDescription} onChange={(e) => setPlanDescription(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>মাসিক মূল্য (৳)</Label>
                          <Input
                            type="number"
                            value={planPriceMonthly}
                            onChange={(e) => setPlanPriceMonthly(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>বাৎসরিক মূল্য (৳)</Label>
                          <Input
                            type="number"
                            value={planPriceYearly}
                            onChange={(e) => setPlanPriceYearly(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>ফিচারসমূহ (প্রতি লাইনে একটি)</Label>
                        <Textarea
                          rows={4}
                          value={planFeatures}
                          onChange={(e) => setPlanFeatures(e.target.value)}
                          placeholder="আনলিমিটেড কেস&#10;প্রায়োরিটি সাপোর্ট"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Max Cases</Label>
                          <Input
                            type="number"
                            value={planMaxCases}
                            onChange={(e) => setPlanMaxCases(e.target.value)}
                            placeholder="Unlimited"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Clients</Label>
                          <Input
                            type="number"
                            value={planMaxClients}
                            onChange={(e) => setPlanMaxClients(e.target.value)}
                            placeholder="Unlimited"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Docs</Label>
                          <Input
                            type="number"
                            value={planMaxDocs}
                            onChange={(e) => setPlanMaxDocs(e.target.value)}
                            placeholder="Unlimited"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={planActive} onCheckedChange={setPlanActive} />
                        <Label>অ্যাক্টিভ</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
                        বাতিল
                      </Button>
                      <Button onClick={savePlan} disabled={saving}>
                        {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative ${plan.slug === "pro" ? "border-primary shadow-lg" : ""}`}
                  >
                    {plan.slug === "pro" && (
                      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">জনপ্রিয়</Badge>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        {getPlanIcon(plan.slug)}
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openPlanDialog(plan)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deletePlan(plan.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">৳{plan.price_monthly}</span>
                          <span className="text-muted-foreground">/মাস</span>
                        </div>
                        <p className="text-sm text-muted-foreground">অথবা ৳{plan.price_yearly}/বছর</p>
                      </div>
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Badge variant={plan.is_active ? "default" : "secondary"}>
                        {plan.is_active ? "অ্যাক্টিভ" : "ইনঅ্যাক্টিভ"}
                      </Badge>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="space-y-6">
              <div className="flex justify-end">
                <Dialog open={subDialogOpen} onOpenChange={setSubDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      সাবস্ক্রিপশন অ্যাসাইন করুন
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>সাবস্ক্রিপশন অ্যাসাইন করুন</DialogTitle>
                      <DialogDescription>ইউজারকে প্ল্যান অ্যাসাইন করুন</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>ইউজার *</Label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                          <SelectTrigger>
                            <SelectValue placeholder="ইউজার সিলেক্ট করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>প্ল্যান *</Label>
                        <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                          <SelectTrigger>
                            <SelectValue placeholder="প্ল্যান সিলেক্ট করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            {plans
                              .filter((p) => p.is_active)
                              .map((plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {plan.name} - ৳{plan.price_monthly}/মাস
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>বিলিং সাইকেল</Label>
                        <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">মাসিক</SelectItem>
                            <SelectItem value="yearly">বাৎসরিক</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>কাস্টম মেয়াদ (ঐচ্ছিক)</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={customDuration}
                            onChange={(e) => setCustomDuration(e.target.value)}
                            placeholder="যেমন: 6"
                            className="flex-1"
                          />
                          <Select value={durationUnit} onValueChange={(v) => setDurationUnit(v as "days" | "months" | "years")}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="days">দিন</SelectItem>
                              <SelectItem value="months">মাস</SelectItem>
                              <SelectItem value="years">বছর</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs text-muted-foreground">খালি রাখলে বিলিং সাইকেল অনুযায়ী হবে</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>পেমেন্ট এমাউন্ট (৳)</Label>
                          <Input
                            type="number"
                            value={subAmount}
                            onChange={(e) => setSubAmount(e.target.value)}
                            placeholder="Auto from plan"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>পেমেন্ট মেথড</Label>
                          <Input
                            value={subPaymentMethod}
                            onChange={(e) => setSubPaymentMethod(e.target.value)}
                            placeholder="bKash, Bank"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>পেমেন্ট রেফারেন্স</Label>
                        <Input
                          value={subPaymentRef}
                          onChange={(e) => setSubPaymentRef(e.target.value)}
                          placeholder="Transaction ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>নোট</Label>
                        <Textarea value={subNotes} onChange={(e) => setSubNotes(e.target.value)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSubDialogOpen(false)}>
                        বাতিল
                      </Button>
                      <Button onClick={createSubscription} disabled={creatingSub}>
                        {creatingSub ? "তৈরি হচ্ছে..." : "সাবস্ক্রিপশন তৈরি করুন"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    সাবস্ক্রিপশন তালিকা
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subscriptions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>কোনো সাবস্ক্রিপশন নেই</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ইউজার</TableHead>
                          <TableHead>প্ল্যান</TableHead>
                          <TableHead>সাইকেল</TableHead>
                          <TableHead>স্ট্যাটাস</TableHead>
                          <TableHead>মেয়াদ</TableHead>
                          <TableHead>এমাউন্ট</TableHead>
                          <TableHead className="text-right">অ্যাকশন</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscriptions.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell>
                              {sub.profiles?.display_name || sub.profiles?.username || sub.user_id.slice(0, 8)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{sub.subscription_plans?.name || "N/A"}</Badge>
                            </TableCell>
                            <TableCell>{sub.billing_cycle === "monthly" ? "মাসিক" : "বাৎসরিক"}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  sub.status === "active"
                                    ? "default"
                                    : sub.status === "cancelled"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {sub.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(sub.start_date)} - {formatDate(sub.end_date)}
                            </TableCell>
                            <TableCell>৳{sub.amount_paid || 0}</TableCell>
                            <TableCell className="text-right">
                              {sub.status === "active" ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateSubscriptionStatus(sub.id, "cancelled")}
                                >
                                  বাতিল
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateSubscriptionStatus(sub.id, "active")}
                                >
                                  অ্যাক্টিভ করুন
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminPackages;
