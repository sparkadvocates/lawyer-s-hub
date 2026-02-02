import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn, user, loading, isAdmin, role } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Redirect if already logged in as admin
  useEffect(() => {
    if (user && !loading) {
      if (isAdmin) {
        navigate("/dashboard");
      } else if (role) {
        // User is logged in but not admin
        toast.error("You don't have admin access");
        navigate("/user/dashboard");
      }
    }
  }, [user, loading, isAdmin, role, navigate]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else {
          toast.error(error.message);
        }
      } else {
        // Will redirect via useEffect when role is loaded
        toast.success("Checking admin access...");
      }
    } catch (error: unknown) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Admin Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-destructive/10 via-background to-background">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-destructive shadow-lg">
                <ShieldCheck className="w-12 h-12 text-destructive-foreground" />
              </div>
            </div>
            
            <h1 className="font-display text-5xl font-bold text-foreground mb-4">
              Admin <span className="text-destructive">Portal</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-md leading-relaxed">
              Secure administrative access for LexProSuite system management.
            </p>
            
            <div className="mt-12 glass-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Admin Capabilities:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full" />
                  User Management & Access Control
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full" />
                  Role Assignment & Permissions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full" />
                  System Configuration & Settings
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full" />
                  Full Platform Oversight
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center">
            <div className="p-2 sm:p-3 rounded-xl bg-destructive">
              <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-destructive-foreground" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Admin <span className="text-destructive">Portal</span>
            </h1>
          </div>

          <div className="text-center lg:text-left mb-6 sm:mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Admin Login
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Sign in with your administrator credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm">
                Admin Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@lawfirm.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`pl-10 sm:pl-12 ${errors.email ? 'border-destructive' : ''}`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-xs sm:text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground text-sm">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`pl-10 sm:pl-12 pr-10 sm:pr-12 ${errors.password ? 'border-destructive' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs sm:text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-destructive hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-destructive-foreground border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Admin Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-muted-foreground text-xs sm:text-sm">
              Not an admin?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                User Login
              </Link>
            </p>
          </div>

          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border">
            <p className="text-center text-xs text-muted-foreground">
              Admin access is restricted to authorized personnel only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
