import Link from "next/link";
import { Bolt, BarChart3, ShieldCheck, CheckCircle2, ArrowRight, XCircle } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";

export default function LandingPage() {
  const faqs = [
    {
      q: "Is my data secure and private?",
      a: "Yes. We use industry-standard encryption. Your attendance data is your own, and we never sell student information to third parties.",
    },
    {
      q: "Can I export reports for my manager?",
      a: "Absolutely. DietTrack allows you to view and track your monthly meals taken, skipped, and percentages which you can show to your hostel office for billing disputes.",
    },
    {
      q: "How does the 'Quick-Mark' work?",
      a: "Using the dashboard's Today's Attendance card, you can log whether you took or skipped today's meal in a single tap. No complex setup or nested forms required.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-secondary/20 selection:text-secondary">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex justify-between items-center w-full px-6 h-16 max-w-5xl mx-auto">
          <div className="text-xl font-bold tracking-tight text-white">DietTrack</div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex items-center gap-6">
              <a href="#features" className="text-xs font-semibold text-muted-foreground hover:text-white transition-colors duration-200">
                Features
              </a>
              <a href="#why" className="text-xs font-semibold text-muted-foreground hover:text-white transition-colors duration-200">
                Value
              </a>
              <a href="#faq" className="text-xs font-semibold text-muted-foreground hover:text-white transition-colors duration-200">
                FAQ
              </a>
            </div>
            <Link
              href="/dashboard"
              className="bg-white text-background px-4 py-1.5 rounded-lg text-xs font-semibold hover:opacity-95 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          <div className="flex flex-col gap-6">
            <span className="text-secondary font-mono text-[10px] tracking-widest uppercase">
              The Modern Mess Standard
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-none">
              Track Your Mess Attendance with <span className="text-secondary">Precision</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-lg leading-relaxed">
              Specifically designed for hostel residents and college students. Stop guessing your bill—start logging every meal with one tap.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link
                href="/dashboard"
                className="bg-white text-background px-6 py-3 rounded-xl text-sm font-bold hover:scale-[0.98] transition-transform duration-200 flex items-center gap-2"
              >
                Get Started for Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              {/* <Link
                href="/admin/login"
                className="border border-border text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-surface-low transition-colors duration-200"
              >
                Admin Access
              </Link> */}
            </div>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-background bg-zinc-800" />
                <div className="w-8 h-8 rounded-full border-2 border-background bg-zinc-700" />
                <div className="w-8 h-8 rounded-full border-2 border-background bg-zinc-600" />
              </div>
              <span className="text-xs text-muted-foreground">Trusted by 2,000+ students globally</span>
            </div>
          </div>
          <div className="relative group w-full flex justify-center">
            {/* Ambient background glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-secondary/20 to-white/5 rounded-3xl blur-3xl opacity-35 group-hover:opacity-50 transition duration-1000" />
            
            {/* Live-looking Dashboard Card */}
            <div className="relative w-full max-w-sm rounded-3xl overflow-hidden premium-border bg-card p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:border-muted-foreground/30">
              
              {/* Card Header */}
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase">Live Dashboard</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">Room 302</span>
              </div>

              {/* Card Body - Today's check-in */}
              <div className="my-6 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-mono">TODAY&apos;S MEAL STATUS</span>
                  <h3 className="text-lg font-bold text-white leading-tight">Have you eaten in the mess today?</h3>
                </div>
                
                {/* Visual Action Buttons */}
                <div className="flex gap-3">
                  <div className="flex-grow bg-secondary text-secondary-foreground font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-secondary/15 cursor-default">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Taken
                  </div>
                  <div className="flex-grow border border-border text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-surface-low transition-colors cursor-default">
                    <XCircle className="h-3.5 w-3.5 text-muted-foreground" /> Skipped
                  </div>
                </div>

                {/* Weekly Streak preview */}
                <div className="flex flex-col gap-2 bg-surface-low/30 border border-border/40 rounded-xl p-3">
                  <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">Weekly Streak</span>
                  <div className="flex justify-between items-center">
                    {[
                      { day: "M", status: "taken" },
                      { day: "T", status: "taken" },
                      { day: "W", status: "taken" },
                      { day: "T", status: "skipped" },
                      { day: "F", status: "taken" },
                      { day: "S", status: "taken" },
                      { day: "S", status: "pending" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <span className="text-[9px] text-muted-foreground font-mono">{item.day}</span>
                        {item.status === "taken" ? (
                          <div className="h-4 w-4 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                          </div>
                        ) : item.status === "skipped" ? (
                          <div className="h-4 w-4 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-border/80 flex items-center justify-center border-dashed">
                            <div className="h-1.5 w-1.5 rounded-full bg-transparent" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                <span>Monthly rate: 85%</span>
                <span>Logged 4m ago</span>
              </div>
            </div>
          </div>
        </div>
        {/* Background element */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto border-t border-border/40" id="features">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4">Built for Zero Friction</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Everything you need to manage your daily nutrition logs and mess finances in one quiet, efficient workspace.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="premium-border bg-card p-8 rounded-2xl flex flex-col gap-4 group transition-all duration-200 hover:border-muted-foreground/30">
            <div className="w-12 h-12 rounded-xl bg-surface-low flex items-center justify-center text-secondary border border-border">
              <Bolt className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Simplicity</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              One-tap meal logging. No complex forms, no wasted time. Mark &quot;Taken&quot; or &quot;Skipped&quot; in under 2 seconds.
            </p>
          </div>
          <div className="premium-border bg-card p-8 rounded-2xl flex flex-col gap-4 group transition-all duration-200 hover:border-muted-foreground/30">
            <div className="w-12 h-12 rounded-xl bg-surface-low flex items-center justify-center text-secondary border border-border">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Analytics</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Real-time attendance insights. Visualize your savings and monthly trends with professional-grade charts.
            </p>
          </div>
          <div className="premium-border bg-card p-8 rounded-2xl flex flex-col gap-4 group transition-all duration-200 hover:border-muted-foreground/30">
            <div className="w-12 h-12 rounded-xl bg-surface-low flex items-center justify-center text-secondary border border-border">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Accountability</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Automated logs with timestamps. Dispute errors with mess management using detailed calendar history.
            </p>
          </div>
        </div>
      </section>

      {/* Why DietTrack / Value Prop */}
      <section className="py-20 px-6 max-w-5xl mx-auto my-12 rounded-[2rem] border border-border bg-card/40 relative overflow-hidden" id="why">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-[10px] font-bold text-secondary uppercase font-mono">The Statistics</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Stop Overpaying by 15% Each Month
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Most mess managers rely on manual registers prone to human error. DietTrack provides a digital twin of your attendance, ensuring you only pay for what you actually eat.
            </p>
            <ul className="flex flex-col gap-3 mt-2">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary h-4 w-4 shrink-0" />
                <span className="text-sm text-foreground/80">Save average of ₹400-800 per month</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary h-4 w-4 shrink-0" />
                <span className="text-sm text-foreground/80">Habit tracking integration for health goals</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary h-4 w-4 shrink-0" />
                <span className="text-sm text-foreground/80">Permanent editing support for back-logs</span>
              </li>
            </ul>
          </div>
          <div className="relative w-full flex justify-center">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/5 blur-3xl pointer-events-none" />
            <div className="premium-border p-8 rounded-2xl card-bg w-full max-w-md flex flex-col gap-4">
              <span className="text-xs text-muted-foreground uppercase font-mono">Estimated Savings Calculator</span>
              <div className="h-1.5 w-full bg-surface-low rounded-full overflow-hidden border border-border">
                <div className="bg-secondary h-full w-[82%]" />
              </div>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-sm text-muted-foreground">Monthly Refund Rate</span>
                <span className="text-2xl font-bold text-white font-mono">82% Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Placeholder Section */}
      <div className="max-w-5xl mx-auto px-6 mb-12">
        <AdPlaceholder />
      </div>

      {/* FAQ Section */}
      <section className="py-20 px-6 max-w-2xl mx-auto" id="faq">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Frequently Asked Questions</h2>
        </div>
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="premium-border card-bg rounded-xl p-6 flex flex-col gap-2 transition-all duration-200 hover:border-muted-foreground/30"
            >
              <h4 className="text-base font-bold text-white flex items-center justify-between">
                {faq.q}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card/10">
        <div className="px-6 max-w-5xl mx-auto flex flex-col items-center justify-center gap-2">
          <span className="text-[10px] text-muted-foreground font-mono">
            © {new Date().getFullYear()} DietTrack Systems. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
