import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const emailSchema = z.string().email("সঠিক ইমেইল দিন");
const passwordSchema = z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");

type AuthMode = "login" | "signup" | "reset";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, user, loading, isAdmin } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  // Redirect based on role
  useEffect(() => {
    if (user && !loading) {
      if (isAdmin) {
        navigate("/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    }
  }, [user, loading, isAdmin, navigate]);

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
      newErrors.confirmPassword = "পাসওয়ার্ড মিলছে না";
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
            toast.error("ভুল ইমেইল বা পাসওয়ার্ড");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("স্বাগতম!");
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("এই ইমেইল আগে থেকেই রেজিস্টার্ড");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("অ্যাকাউন্ট তৈরি হয়েছে!");
        }
      } else if (mode === "reset") {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("রিসেট লিঙ্ক পাঠানো হয়েছে");
          setMode("login");
        }
      }
    } catch (error: unknown) {
      toast.error("কিছু সমস্যা হয়েছে");
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
    <div className="min-h-screen bg-background flex flex-col safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="flex items-center justify-center pt-12 pb-8">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-2xl gradient-gold shadow-gold">
            <Scale className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">
            LexPro<span className="text-gradient-gold">Suite</span>
          </h1>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 px-6">
        <div className="max-w-sm mx-auto">
          {/* Title */}
          <div className="text-center mb-6">
            {mode === "reset" && (
              <button
                onClick={() => setMode("login")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 mx-auto transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                ফিরে যান
              </button>
            )}
            <h2 className="font-display text-xl font-bold text-foreground mb-1">
              {mode === "login" && "লগইন করুন"}
              {mode === "signup" && "অ্যাকাউন্ট তৈরি করুন"}
              {mode === "reset" && "পাসওয়ার্ড রিসেট"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "login" && "আপনার অ্যাকাউন্টে প্রবেশ করুন"}
              {mode === "signup" && "নতুন অ্যাকাউন্ট তৈরি করুন"}
              {mode === "reset" && "আপনার ইমেইল দিন"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">ইমেইল</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`pl-12 h-12 text-base ${errors.email ? 'border-destructive' : ''}`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            {mode !== "reset" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">পাসওয়ার্ড</Label>
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
                    className={`pl-12 pr-12 h-12 text-base ${errors.password ? 'border-destructive' : ''}`}
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
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>
            )}

            {/* Confirm Password */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">পাসওয়ার্ড নিশ্চিত করুন</Label>
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
                    className={`pl-12 h-12 text-base ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Forgot Password */}
            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-sm text-primary hover:underline"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  অপেক্ষা করুন...
                </span>
              ) : (
                <>
                  {mode === "login" && "লগইন"}
                  {mode === "signup" && "অ্যাকাউন্ট তৈরি"}
                  {mode === "reset" && "রিসেট লিঙ্ক পাঠান"}
                </>
              )}
            </Button>
          </form>

          {/* Mode Switch */}
          <div className="mt-6 text-center space-y-3">
            {mode === "login" ? (
              <>
                <p className="text-muted-foreground text-sm">
                  অ্যাকাউন্ট নেই?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-primary hover:underline font-medium"
                  >
                    তৈরি করুন
                  </button>
                </p>
                <p className="text-muted-foreground text-sm">
                  অ্যাডমিন?{" "}
                  <Link to="/admin/login" className="text-destructive hover:underline font-medium">
                    অ্যাডমিন লগইন
                  </Link>
                </p>
              </>
            ) : mode === "signup" ? (
              <p className="text-muted-foreground text-sm">
                অ্যাকাউন্ট আছে?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline font-medium"
                >
                  লগইন করুন
                </button>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 px-6">
        <p className="text-center text-xs text-muted-foreground">
          এন্টারপ্রাইজ-গ্রেড সিকিউরিটি দ্বারা সুরক্ষিত
        </p>
      </div>
    </div>
  );
};

export default Login;
