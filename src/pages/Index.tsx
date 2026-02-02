import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scale, ArrowRight, Shield, Clock, FileText, Users, ShieldCheck, User } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "নিরাপদ ও সম্মত",
    description: "এন্টারপ্রাইজ-গ্রেড নিরাপত্তা",
  },
  {
    icon: Clock,
    title: "সময় ট্র্যাকিং",
    description: "স্বয়ংক্রিয় বিলিং ঘন্টা",
  },
  {
    icon: FileText,
    title: "ডকুমেন্ট ম্যানেজমেন্ট",
    description: "সকল নথি এক জায়গায়",
  },
  {
    icon: Users,
    title: "ক্লায়েন্ট পোর্টাল",
    description: "সহজ যোগাযোগ ব্যবস্থা",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-[100dvh] flex flex-col">
        {/* Background Effects - Optimized for mobile */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-32 h-32 md:w-64 md:h-64 bg-primary/5 rounded-full blur-2xl" />
        </div>

        {/* Navigation - Touch-friendly */}
        <nav className="relative z-10 w-full px-4 py-3 flex items-center justify-between safe-area-inset">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl gradient-gold shadow-gold">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">
              LexPro<span className="text-gradient-gold">Suite</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full"
              onClick={() => navigate("/login")}
            >
              <User className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => navigate("/admin/login")}
            >
              <ShieldCheck className="w-5 h-5" />
            </Button>
          </div>
        </nav>

        {/* Hero Content - Mobile-first */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-4 py-8 text-center">
          <div className="animate-fade-in max-w-lg mx-auto">
            <h1 className="font-display text-3xl md:text-5xl lg:text-7xl font-bold text-foreground mb-4 leading-tight">
              আধুনিক আইনি
              <span className="block text-gradient-gold">ম্যানেজমেন্ট</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed px-2">
              আপনার আইন অনুশীলনকে আধুনিক করুন। কেস ম্যানেজমেন্ট থেকে বিলিং - সব এক জায়গায়।
            </p>

            <div className="flex flex-col gap-3 px-4">
              <Button
                variant="gold"
                size="lg"
                onClick={() => navigate("/login")}
                className="w-full animate-pulse-glow text-base"
              >
                শুরু করুন
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
              >
                ডেমো দেখুন
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator for mobile */}
        <div className="relative z-10 pb-6 flex justify-center">
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
          </div>
        </div>
      </div>

      {/* Features Section - Card Grid for Mobile */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3">
              সাফল্যের জন্য <span className="text-gradient-gold">সব কিছু</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
              উকিলদের দ্বারা, উকিলদের জন্য তৈরি।
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`glass-card p-4 md:p-6 hover:shadow-elevated transition-all duration-300 active:scale-[0.98] animate-fade-in stagger-${index + 1}`}
              >
                <div className="p-2.5 rounded-xl bg-primary/10 w-fit mb-3">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-sm md:text-base font-semibold text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-lg mx-auto md:max-w-4xl">
          <div className="glass-card p-6 md:p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10" />
            <div className="relative z-10">
              <h2 className="font-display text-xl md:text-3xl font-bold text-foreground mb-3">
                শুরু করতে প্রস্তুত?
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto mb-6">
                হাজার হাজার উকিল বিশ্বাস করেন LexProSuite।
              </p>
              <Button 
                variant="gold" 
                size="lg" 
                className="w-full md:w-auto"
                onClick={() => navigate("/login")}
              >
                আজই শুরু করুন
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Compact for Mobile */}
      <footer className="border-t border-border py-6 px-4 safe-area-inset">
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl gradient-gold">
                <Scale className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-base font-bold">
                LexPro<span className="text-gradient-gold">Suite</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2025 LexProSuite. সর্বস্বত্ব সংরক্ষিত।
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
