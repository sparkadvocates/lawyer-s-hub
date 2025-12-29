import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Shield, ShieldCheck, User, Users, Settings, RefreshCw, Plus, Pencil, Key, Mail, Save } from "lucide-react";
import { RoleBadge } from "@/components/RoleBadge";
import { AppRole } from "@/hooks/useAuth";

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: AppRole;
  username: string;
  display_name: string;
}

const AdminSettings = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Create user form
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("user");
  const [creating, setCreating] = useState(false);

  // Edit user form
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // Email settings
  const [resendApiKey, setResendApiKey] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [emailSettingsLoading, setEmailSettingsLoading] = useState(true);
  const [savingEmail, setSavingEmail] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session?.access_token) {
        console.error("No valid session found:", sessionError);
        toast.error("Session expired. Please login again.");
        navigate("/admin/login");
        return;
      }
      
      const response = await supabase.functions.invoke("admin-get-users", {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (response.error) {
        console.error("Edge function error:", response.error);
        throw new Error(response.error.message || "Failed to fetch users");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      setUsers(response.data.users || []);
    } catch (error: unknown) {
      console.error("Error fetching users:", error);
      const message = error instanceof Error ? error.message : "Failed to fetch users";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (targetUserId: string, newRole: AppRole) => {
    try {
      setUpdating(targetUserId);
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (sessionError || !token) {
        toast.error("Session expired. Please login again.");
        navigate("/admin/login");
        return;
      }

      const response = await supabase.functions.invoke("admin-update-role", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { targetUserId, newRole },
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error || "Failed to update role");
      }

      toast.success(`Role updated to ${newRole}`);
      await fetchUsers();
    } catch (error: unknown) {
      console.error("Error updating role:", error);
      const message = error instanceof Error ? error.message : "Failed to update role";
      toast.error(message);
    } finally {
      setUpdating(null);
    }
  };

  const createUser = async () => {
    if (!newEmail || !newPassword) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setCreating(true);
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (sessionError || !token) {
        toast.error("Session expired. Please login again.");
        navigate("/admin/login");
        return;
      }

      const response = await supabase.functions.invoke("admin-create-user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          email: newEmail,
          password: newPassword,
          username: newUsername || newEmail,
          displayName: newDisplayName || newEmail.split("@")[0],
          role: newRole,
        },
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error || "Failed to create user");
      }

      toast.success("User created successfully");
      setCreateDialogOpen(false);
      setNewEmail("");
      setNewPassword("");
      setNewUsername("");
      setNewDisplayName("");
      setNewRole("user");
      await fetchUsers();
    } catch (error: unknown) {
      console.error("Error creating user:", error);
      const message = error instanceof Error ? error.message : "Failed to create user";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const openEditDialog = (u: UserWithRole) => {
    setEditingUser(u);
    setEditUsername(u.username);
    setEditDisplayName(u.display_name);
    setEditPassword("");
    setEditDialogOpen(true);
  };

  const saveUserChanges = async () => {
    if (!editingUser) return;

    try {
      setSaving(true);
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (sessionError || !token) {
        toast.error("Session expired. Please login again.");
        navigate("/admin/login");
        return;
      }

      const response = await supabase.functions.invoke("admin-update-user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          targetUserId: editingUser.id,
          username: editUsername,
          displayName: editDisplayName,
          newPassword: editPassword || undefined,
        },
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error || "Failed to update user");
      }

      toast.success("User updated successfully");
      setEditDialogOpen(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (error: unknown) {
      console.error("Error updating user:", error);
      const message = error instanceof Error ? error.message : "Failed to update user";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const fetchEmailSettings = async () => {
    try {
      setEmailSettingsLoading(true);
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching email settings:', error);
        return;
      }

      if (data) {
        setResendApiKey(data.resend_api_key || '');
        setFromEmail(data.from_email || '');
        setFromName(data.from_name || '');
      }
    } catch (error) {
      console.error('Error fetching email settings:', error);
    } finally {
      setEmailSettingsLoading(false);
    }
  };

  const saveEmailSettings = async () => {
    try {
      setSavingEmail(true);
      
      const { data: existing } = await supabase
        .from('email_settings')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('email_settings')
          .update({
            resend_api_key: resendApiKey || null,
            from_email: fromEmail,
            from_name: fromName,
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_settings')
          .insert({
            resend_api_key: resendApiKey || null,
            from_email: fromEmail,
            from_name: fromName,
          });

        if (error) throw error;
      }

      toast.success('ইমেইল সেটিংস সংরক্ষিত হয়েছে');
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast.error('সেটিংস সংরক্ষণে সমস্যা হয়েছে');
    } finally {
      setSavingEmail(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Access denied: Admin privileges required");
      navigate("/dashboard");
      return;
    }

    if (!authLoading && isAdmin) {
      fetchUsers();
      fetchEmailSettings();
    }
  }, [authLoading, isAdmin, navigate]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                <Settings className="w-8 h-8 text-primary" />
                Admin Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage users, roles, and system settings
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchUsers} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new user to the system with specified credentials and role.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        placeholder="John Doe"
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={newRole} onValueChange={(v: AppRole) => setNewRole(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createUser} disabled={creating}>
                      {creating ? "Creating..." : "Create User"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">{users.length}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Admins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-destructive" />
                  <span className="text-2xl font-bold">
                    {users.filter((u) => u.role === "admin").length}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Moderators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">
                    {users.filter((u) => u.role === "moderator").length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                ইমেইল সেটিংস
              </CardTitle>
              <CardDescription>
                রিনিউ নোটিফিকেশন ইমেইল পাঠানোর জন্য Resend API কনফিগার করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailSettingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resendApiKey">Resend API Key</Label>
                    <Input
                      id="resendApiKey"
                      type="password"
                      placeholder="re_xxxxxxxxxx"
                      value={resendApiKey}
                      onChange={(e) => setResendApiKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Resend থেকে API Key সংগ্রহ করুন: <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com</a>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">প্রেরকের ইমেইল</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        placeholder="noreply@yourdomain.com"
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromName">প্রেরকের নাম</Label>
                      <Input
                        id="fromName"
                        placeholder="Legal Case Manager"
                        value={fromName}
                        onChange={(e) => setFromName(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={saveEmailSettings} disabled={savingEmail}>
                    <Save className="w-4 h-4 mr-2" />
                    {savingEmail ? "সংরক্ষণ হচ্ছে..." : "সেটিংস সংরক্ষণ করুন"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription>
                View, create, and manage user accounts and roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{u.username}</span>
                          <span className="text-xs text-muted-foreground">{u.display_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {u.email}
                          {u.id === user?.id && (
                            <Badge variant="outline" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={u.role}
                          onValueChange={(value: AppRole) => updateUserRole(u.id, value)}
                          disabled={updating === u.id || u.id === user?.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                User
                              </div>
                            </SelectItem>
                            <SelectItem value="moderator">
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Moderator
                              </div>
                            </SelectItem>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                Admin
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(u.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(u)}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-muted-foreground">No users found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and password for {editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editUsername">Username</Label>
              <Input
                id="editUsername"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDisplayName">Display Name</Label>
              <Input
                id="editDisplayName"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPassword">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  New Password
                </div>
              </Label>
              <Input
                id="editPassword"
                type="password"
                placeholder="Leave blank to keep current password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Min 6 characters. Leave blank to keep the current password.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveUserChanges} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSettings;
