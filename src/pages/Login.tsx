import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Mail, Lock, Eye, EyeOff, ArrowLeft, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type AuthMode = "login" | "signup" | "reset";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, user, loading } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    if (mode !== "reset") {
      try {
        passwordSchema.parse(password);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.password = e.errors[0].message;
        }
      }
    }

    if (mode === "signup" && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password. Please try again.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back, Counselor!");
          navigate("/dashboard");
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created successfully! Welcome to LexProSuite.");
          navigate("/dashboard");
        }
      } else if (mode === "reset") {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Password reset email sent. Please check your inbox.");
          setMode("login");
        }
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred. Please try again.");
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
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-navy-light to-background" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl gradient-gold shadow-gold animate-pulse-glow">
                <Scale className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="font-display text-5xl font-bold text-foreground mb-4">
              LexPro<span className="text-gradient-gold">Suite</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-md leading-relaxed">
              The modern legal practice management platform trusted by leading attorneys worldwide.
            </p>
            
            <div className="mt-12 grid grid-cols-2 gap-6 text-sm">
              {[
                { label: "Active Users", value: "50,000+" },
                { label: "Cases Managed", value: "2M+" },
                { label: "Firms", value: "5,000+" },
                { label: "Uptime", value: "99.9%" },
              ].map((stat, index) => (
                <div 
                  key={stat.label} 
                  className={`glass-card p-4 animate-fade-in stagger-${index + 1}`}
                >
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="p-3 rounded-xl gradient-gold shadow-gold">
              <Scale className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold">
              LexPro<span className="text-gradient-gold">Suite</span>
            </h1>
          </div>

          <div className="text-center lg:text-left mb-8">
            {mode === "reset" && (
              <button
                onClick={() => setMode("login")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </button>
            )}
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              {mode === "login" && "Welcome Back"}
              {mode === "signup" && "Create Account"}
              {mode === "reset" && "Reset Password"}
            </h2>
            <p className="text-muted-foreground">
              {mode === "login" && "Sign in to access your legal dashboard"}
              {mode === "signup" && "Start managing your legal practice today"}
              {mode === "reset" && "Enter your email to receive a reset link"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="attorney@lawfirm.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`pl-12 ${errors.email ? 'border-destructive' : ''}`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {mode !== "reset" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    className={`pl-12 pr-12 ${errors.password ? 'border-destructive' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                    }}
                    className={`pl-12 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {mode === "login" && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border bg-secondary" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  {mode === "login" && "Signing in..."}
                  {mode === "signup" && "Creating account..."}
                  {mode === "reset" && "Sending..."}
                </span>
              ) : (
                <>
                  {mode === "login" && "Sign In"}
                  {mode === "signup" && "Create Account"}
                  {mode === "reset" && "Send Reset Link"}
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            {mode === "login" ? (
              <p className="text-muted-foreground text-sm">
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-primary hover:underline font-medium"
                >
                  Create one now
                </button>
              </p>
            ) : mode === "signup" ? (
              <p className="text-muted-foreground text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            ) : null}
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-center text-xs text-muted-foreground">
              Protected by enterprise-grade security. Your data is encrypted and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
