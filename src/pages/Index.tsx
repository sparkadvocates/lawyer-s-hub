import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scale, ArrowRight, Shield, Clock, FileText, Users } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Enterprise-grade security with full regulatory compliance",
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description: "Automated billable hours tracking and invoicing",
  },
  {
    icon: FileText,
    title: "Document Management",
    description: "Organize and access all case documents instantly",
  },
  {
    icon: Users,
    title: "Client Portal",
    description: "Seamless client communication and collaboration",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-gold shadow-gold">
              <Scale className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">
              LexPro<span className="text-gradient-gold">Suite</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button variant="gold" onClick={() => navigate("/login")}>
              Get Started
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-24 text-center">
          <div className="animate-fade-in max-w-4xl mx-auto">
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Modern Legal Practice
              <span className="block text-gradient-gold">Management</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Streamline your law practice with our comprehensive suite of tools.
              From case management to billing, everything you need in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="gold"
                size="xl"
                onClick={() => navigate("/login")}
                className="animate-pulse-glow"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="xl">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to <span className="text-gradient-gold">Succeed</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built by lawyers, for lawyers. Our platform understands the unique challenges of legal practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`glass-card p-6 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-fade-in stagger-${index + 1}`}
              >
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Transform Your Practice?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Join thousands of attorneys who trust LexProSuite to manage their practice efficiently.
              </p>
              <Button variant="gold" size="xl" onClick={() => navigate("/login")}>
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl gradient-gold">
                <Scale className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">
                LexPro<span className="text-gradient-gold">Suite</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 LexProSuite. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
