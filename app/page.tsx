"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createChama, createFirstAdmin } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { getPhoneValidationError, formatKenyanPhone, cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Menu, 
  X, 
  Shield, 
  Users, 
  TrendingUp, 
  Workflow, 
  Smartphone,
  PieChart,
  ArrowRight,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register State
  const [regData, setRegData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regPhoneError, setRegPhoneError] = useState<string | null>(null);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        setLoginError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setLoginError("An error occurred during sign in");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");

    try {
      // Validate phone
      const phoneErr = getPhoneValidationError(regData.phone);
      if (phoneErr) {
        setRegPhoneError(phoneErr);
        setRegLoading(false);
        return;
      }
      
      // Step 1: Create Chama
      const chamaResult = await createChama({
        ...regData,
        phone: formatKenyanPhone(regData.phone),
      });

      if (!chamaResult.success) {
        setRegError(String(chamaResult.error) || "Registration failed");
        return;
      }

      // Step 2: Create first admin user
      const adminResult = await createFirstAdmin({
        chamaId: chamaResult.chama!.id,
        email: regData.email,
        name: regData.name,
        phone: regData.phone,
        hashedPassword: chamaResult.tempPassword!,
      });

      if (adminResult.success) {
        // Auto-populate login form
        setLoginEmail(regData.email);
        setLoginPassword(regData.password);
        setActiveTab("login");
        alert(`Chama "${chamaResult.chama!.name}" registered successfully! Please log in as the admin.`);
      } else {
        setRegError(String(adminResult.error) || "Failed to create admin account");
      }
    } catch (error) {
      setRegError("An error occurred during registration");
    } finally {
      setRegLoading(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "ChamaSmart",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": "0",
          "highPrice": "500",
          "priceCurrency": "KES",
          "offerCount": "3"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "100"
        },
        "description": "Comprehensive platform for managing Kenyan investment groups (Chamas). Track members, contributions, loans, investments, and generate detailed financial reports.",
        "featureList": [
          "Member Management",
          "Financial Tracking",
          "Loan Management",
          "Investment Tracking",
          "Automated Reports",
          "Mobile Friendly"
        ]
      },
      {
        "@type": "Organization",
        "name": "ChamaSmart",
        "url": "https://chamasmart.com",
        "logo": "https://chamasmart.com/icon.png",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+254-700-000-000",
          "contactType": "customer support",
          "areaServed": "KE",
          "availableLanguage": ["en", "sw"]
        },
        "sameAs": [
          "https://twitter.com/chamasmart",
          "https://facebook.com/chamasmart"
        ]
      },
      {
        "@type": "WebSite",
        "name": "ChamaSmart",
        "url": "https://chamasmart.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://chamasmart.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do members log in?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Admins create member accounts. Members receive their credentials via email (or from the admin directly) and can log in using the Member Login tab."
            }
          },
          {
            "@type": "Question",
            "name": "Is my data secure?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, we use bank-grade encryption and secure database protocols to ensure your financial data is safe."
            }
          },
          {
            "@type": "Question",
            "name": "Can I track M-Pesa payments?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Absolutely. You can record M-Pesa reference codes for every transaction to make reconciliation easy."
            }
          },
          {
            "@type": "Question",
            "name": "Does it support loan guarantors?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, our comprehensive loan module allows you to assign up to 2 guarantors per loan and track their approval status."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12">
                <Image src="/icon.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-green-600">
                ChamaSmart
              </span>
            </div>

            {/* Desktop Menu - Centered */}
            <div className="hidden md:flex flex-1 items-center justify-center gap-8">
              <button onClick={() => scrollTo("features")} className="text-sm font-medium text-muted-foreground hover:text-blue-600 transition">Features</button>
              <button onClick={() => scrollTo("about")} className="text-sm font-medium text-muted-foreground hover:text-blue-600 transition">About</button>
              <button onClick={() => scrollTo("pricing")} className="text-sm font-medium text-muted-foreground hover:text-blue-600 transition">Pricing</button>
              <button onClick={() => scrollTo("faq")} className="text-sm font-medium text-muted-foreground hover:text-blue-600 transition">FAQ</button>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <Button onClick={() => scrollTo("auth-section")} variant="default" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition-opacity border-none shadow-md">
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button className="p-2 text-muted-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border p-4 space-y-4 shadow-lg">
            <button onClick={() => scrollTo("features")} className="block w-full text-left font-medium text-foreground">Features</button>
            <button onClick={() => scrollTo("about")} className="block w-full text-left font-medium text-foreground">About</button>
            <button onClick={() => scrollTo("pricing")} className="block w-full text-left font-medium text-foreground">Pricing</button>
            <button onClick={() => scrollTo("faq")} className="block w-full text-left font-medium text-foreground">FAQ</button>
            <Button onClick={() => scrollTo("auth-section")} className="w-full">Get Started</Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/50 to-background dark:from-blue-950/20 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Trusted by 100+ Chamas
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Manage Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                Investment Group
              </span> <br/>
              With Confidence.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Automate contributions, track loans, and monitor investments in one secure platform. 
              The smart way to grow your Chama's wealth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 border-none px-8" onClick={() => scrollTo("auth-section")}>
                Start Your Chama
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollTo("features")} className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-8 transition-all">
                Explore Features
              </Button>
            </div>
            {/* Trust Badges */}
            <div className="pt-8 flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholders for logos if needed */}
            </div>
          </div>

          {/* Auth Card (Hero Right) */}
          <div id="auth-section" className="relative z-10 lg:ml-auto w-full max-w-md">
            {/* Decoration blobs */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-green-200/50 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-200/50 rounded-full blur-3xl" />

            <Card className="relative bg-card/80 backdrop-blur-sm border-border shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex bg-muted p-1 rounded-lg mb-4">
                  <button
                    onClick={() => setActiveTab("login")}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      activeTab === "login" 
                        ? "bg-background text-blue-700 shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setActiveTab("register")}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      activeTab === "register" 
                        ? "bg-background text-green-700 shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Register Chama
                  </button>
                </div>
                <CardTitle>{activeTab === "login" ? "Welcome Back" : "Create New Chama"}</CardTitle>
                <CardDescription>
                  {activeTab === "login" 
                    ? "Access your dashboard (Admins & Members)" 
                    : "Set up your group account to start managing your Chama"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeTab === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link 
                          href="/auth/forgot-password" 
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <PasswordInput 
                        id="password" 
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(value) => setLoginPassword(value)}
                        required 
                      />
                    </div>
                    {loginError && <p className="text-sm text-red-600">{loginError}</p>}
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loginLoading}>
                      {loginLoading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="r-name">Chama Name</Label>
                      <Input 
                        id="r-name" 
                        placeholder="e.g. Sunrise Investment Group"
                        value={regData.name}
                        onChange={(e) => setRegData({...regData, name: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="r-email">Chama Email (Admin)</Label>
                      <Input 
                        id="r-email" 
                        type="email" 
                        placeholder="info@sunrise.com"
                        value={regData.email}
                        onChange={(e) => setRegData({...regData, email: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="r-phone">Phone Number</Label>
                      <Input 
                        id="r-phone" 
                        type="tel" 
                        placeholder="+254..."
                        value={regData.phone}
                        onChange={(e) => {
                          setRegData({...regData, phone: e.target.value});
                          if(regPhoneError) setRegPhoneError(null);
                        }}
                        onBlur={() => {
                          const err = getPhoneValidationError(regData.phone);
                          setRegPhoneError(err);
                          if (!err && regData.phone) {
                            setRegData(prev => ({...prev, phone: formatKenyanPhone(prev.phone)}));
                          }
                        }}
                        className={regPhoneError ? "border-red-500" : ""}
                        required 
                      />
                      {regPhoneError && <p className="text-sm text-red-600">{regPhoneError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="r-password">Password</Label>
                      <PasswordInput 
                        id="r-password" 
                        value={regData.password}
                        onChange={(value) => setRegData({...regData, password: value})}
                        required 
                      />
                    </div>
                    {regError && <p className="text-sm text-red-600">{regError}</p>}
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={regLoading}>
                      {regLoading ? "Create Chama Account" : "Create Chama Account"}
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      By registering, you agree to our Terms of Service.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Features</h2>
            <h3 className="text-3xl font-bold text-foreground mt-2">Everything you need to run your Chama</h3>
            <p className="text-muted-foreground mt-4">Stop using spreadsheets and notebooks. Transition to a professional, digital ledger designed for Kenyan investment groups.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Users} 
              title="Member Management" 
              desc="Easily add members, assign roles (Treasurer, Admin), and track individual activity."
              colorClass="bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
            />
            <FeatureCard 
              icon={PieChart} 
              title="Financial Tracking" 
              desc="Record deposits, withdrawals, and expenses with M-Pesa reference codes."
              colorClass="bg-gradient-to-br from-green-500 to-emerald-600 text-white"
            />
            <FeatureCard 
              icon={TrendingUp} 
              title="Loan Management" 
              desc="Full table banking suite: Create loans, assign guarantors, and track repayments."
              colorClass="bg-gradient-to-br from-orange-500 to-amber-600 text-white"
            />
            <FeatureCard 
              icon={Shield} 
              title="Secure & Transparent" 
              desc="Bank-grade security for your data with transparent records visible to members."
              colorClass="bg-gradient-to-br from-purple-500 to-pink-600 text-white"
            />
            <FeatureCard 
              icon={Smartphone} 
              title="Mobile Friendly" 
              desc="Access your dashboard from any device. Perfect for meetings on the go."
              colorClass="bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
            />
            <FeatureCard 
              icon={Workflow} 
              title="Automated Reports" 
              desc="Instant summaries of cash at hand, total assets, and loan portfolio performance."
              colorClass="bg-gradient-to-br from-indigo-500 to-blue-700 text-white"
            />
          </div>
        </div>
      </section>

      {/* About / Infographic Section */}
      <section id="about" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="relative">
                {/* Abstract infographic representation */}
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl p-8 relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-white shadow-xl rounded-xl p-6 flex flex-col justify-between">
                    <div className="flex items-center gap-4 border-b pb-4">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">JD</div>
                      <div>
                        <div className="h-2 w-24 bg-gray-200 rounded mb-2"></div>
                        <div className="h-2 w-16 bg-gray-100 rounded"></div>
                      </div>
                      <div className="ml-auto text-green-600 font-bold">+5000</div>
                    </div>
                     <div className="flex items-center gap-4 border-b pb-4">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">AM</div>
                      <div>
                        <div className="h-2 w-24 bg-gray-200 rounded mb-2"></div>
                        <div className="h-2 w-16 bg-gray-100 rounded"></div>
                      </div>
                      <div className="ml-auto text-green-600 font-bold">+2000</div>
                    </div>
                     <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">LO</div>
                      <div>
                        <div className="h-2 w-24 bg-gray-200 rounded mb-2"></div>
                        <div className="h-2 w-16 bg-gray-100 rounded"></div>
                      </div>
                      <div className="ml-auto text-red-600 font-bold">-1000</div>
                    </div>
                  </div>
                  {/* Floating elements */}
                  <div className="absolute top-10 right-10 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">✓ Approved</div>
                  <div className="absolute bottom-10 left-10 bg-white text-gray-800 text-xs px-3 py-2 rounded-lg shadow-lg font-bold">Cash at Hand: KES 150,000</div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Built for the Modern Kenyan Saver</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                     <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                       <Users className="h-5 w-5" />
                     </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Member-Centric Design</h4>
                    <p className="text-muted-foreground text-sm">Members can log in to view their own statements, ensuring transparency and trust within the group.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                     <div className="h-8 w-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                       <TrendingUp className="h-5 w-5" />
                     </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Investment Tracking</h4>
                    <p className="text-muted-foreground text-sm">Keep an eye on your assets—land, bonds, or equity. Track current value vs purchase price automatically.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                     <div className="h-8 w-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                       <Shield className="h-5 w-5" />
                     </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Admin Controls</h4>
                    <p className="text-muted-foreground text-sm">Admins have full control to approve loans, verify payments, and manage user roles.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground mt-4">Start for free, upgrade as you grow.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PricingCard 
              title="Free" 
              price="KES 0" 
              features={["Up to 5 Members", "Basic Ledger", "1 Admin", "Email Support"]}
            />
             <PricingCard 
              title="Growth" 
              price="KES 1,000" 
              period="/mo"
              features={["Up to 25 Members", "Loan Management", "Investment Tracking", "2 Admins"]}
            />
             <PricingCard 
              title="Professional" 
              price="KES 2,500" 
              period="/mo"
              isPopular
              features={["Up to 100 Members", "Advanced Reporting", "Multiple Admins", "SMS Alerts", "Priority Support"]}
            />
             <PricingCard 
              title="Enterprise" 
              price="Custom" 
              features={["Unlimited Members", "Custom Integrations", "Dedicated Support", "API Access", "Multiple Admins"]}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
           <h2 className="text-3xl font-bold text-center text-foreground mb-12">Frequently Asked Questions</h2>
           <div className="space-y-4">
             {[
               { q: "How do members log in?", a: "Admins create member accounts. Members receive their credentials via email (or from the admin directly) and can log in using the Member Login tab above." },
               { q: "Is my data secure?", a: "Yes, we use bank-grade encryption and secure database protocols to ensure your financial data is safe." },
               { q: "Can I track M-Pesa payments?", a: "Absolutely. You can record M-Pesa reference codes for every transaction to make reconciliation easy." },
               { q: "Does it support loan guarantors?", a: "Yes, our comprehensive loan module allows you to assign up to 2 guarantors per loan and track their approval status." }
             ].map((faq, i) => (
               <div key={i} className="border border-border rounded-lg overflow-hidden">
                 <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted text-left font-medium text-foreground"
                 >
                   {faq.q}
                   {openFaq === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                 </button>
                 {openFaq === i && (
                   <div className="p-4 bg-background text-muted-foreground text-sm border-t border-border">
                     {faq.a}
                   </div>
                 )}
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                 <div className="relative h-10 w-10">
                    <Image src="/icon.png" alt="Logo" fill className="object-contain" />
                  </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">ChamaSmart</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering investment groups with digital tools for a brighter financial future.
              </p>
            </div>
             <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => scrollTo("features")}>Features</button></li>
                <li><button onClick={() => scrollTo("pricing")}>Pricing</button></li>
                <li><button onClick={() => scrollTo("faq")}>FAQ</button></li>
              </ul>
            </div>
             <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#">About Us</Link></li>
                <li><Link href="#">Careers</Link></li>
                <li><Link href="#">Privacy Policy</Link></li>
                <li><Link href="#">Terms of Service</Link></li>
              </ul>
            </div>
             <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Mail className="h-4 w-4"/> support@chamasmart.com</li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4"/> +254 700 000 000</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4"/> Nairobi, Kenya</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ChamaSmart. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}

function FeatureCard({ icon: Icon, title, desc, colorClass }: { icon: any, title: string, desc: string, colorClass?: string }) {
  return (
    <div className="bg-card p-8 rounded-2xl shadow-sm border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group text-center">
      <div className={cn(
        "h-16 w-16 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300",
        colorClass || "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
      )}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function PricingCard({ title, price, period, features, isPopular }: any) {
  return (
    <div className={`relative p-8 bg-card rounded-2xl shadow-sm border ${isPopular ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-20" : "border-border"}`}>
      {isPopular && (
        <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      <div className="mt-4 flex items-baseline text-foreground">
        <span className="text-4xl font-extrabold tracking-tight">{price}</span>
        {period && <span className="ml-1 text-xl font-semibold text-muted-foreground">{period}</span>}
      </div>
      <ul className="mt-6 space-y-4">
        {features.map((feature: string) => (
          <li key={feature} className="flex">
            <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
            <span className="ml-3 text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <Button className={cn(
        "w-full mt-8 border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        isPopular 
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 border-none hover:opacity-90" 
          : "bg-white dark:bg-zinc-900 text-foreground border-border hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm"
      )} variant={isPopular ? "default" : "outline"}>
        Choose Plan
      </Button>
    </div>
  );
}
