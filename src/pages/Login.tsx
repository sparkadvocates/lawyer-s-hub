import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login - in production, connect to Supabase
    setTimeout(() => {
      if (email && password) {
        toast.success("Welcome back, Counselor!");
        navigate("/dashboard");
      } else {
        toast.error("Please enter valid credentials");
      }
      setIsLoading(false);
    }, 1000);
  };

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

      {/* Right Panel - Login Form */}
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
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              Welcome Back
            </h2>
            <p className="text-muted-foreground">
              Sign in to access your legal dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12"
                  required
                />
              </div>
            </div>

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
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12"
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
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border bg-secondary" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{" "}
              <a href="#" className="text-primary hover:underline font-medium">
                Contact Sales
              </a>
            </p>
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
