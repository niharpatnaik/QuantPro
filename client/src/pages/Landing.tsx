import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code2, LineChart, Terminal, Shield, Mail } from "lucide-react";
import { SiGoogle, SiGithub, SiApple } from "react-icons/si";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <header className="container mx-auto px-6 py-8 relative z-10 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Terminal className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold font-display tracking-tight">QuantPro</span>
        </div>
        <a href="/api/login">
          <Button variant="outline" data-testid="button-login" className="border-primary/20 hover:border-primary/50 hover:bg-primary/5">
            Log In
          </Button>
        </a>
      </header>

      <main className="flex-1 container mx-auto px-6 flex flex-col justify-center relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6">
              The Standard for Quant Hiring
            </span>
            <h1 className="text-6xl md:text-7xl font-bold font-display tracking-tight leading-[1.1] mb-6">
              Master the Art of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-teal-500">
                Quantitative Finance
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join elite candidates practicing on QuantPro. Solve real-world trading challenges, backtest your strategies, and prove your alpha.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="/api/login">
              <Button size="lg" data-testid="button-start-practicing" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-full">
                Start Practicing
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <Link href="/leaderboard">
              <Button size="lg" variant="ghost" data-testid="button-view-leaderboard" className="h-14 px-8 text-lg rounded-full hover:bg-secondary/50">
                View Leaderboard
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex items-center justify-center gap-3 text-muted-foreground text-sm"
          >
            <span data-testid="text-sign-in-with">Sign in with</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" data-testid="text-auth-method-google" className="gap-1.5 bg-secondary/60 border border-border/50 text-foreground">
                <SiGoogle className="w-3.5 h-3.5" /> Google
              </Badge>
              <Badge variant="secondary" data-testid="text-auth-method-github" className="gap-1.5 bg-secondary/60 border border-border/50 text-foreground">
                <SiGithub className="w-3.5 h-3.5" /> GitHub
              </Badge>
              <Badge variant="secondary" data-testid="text-auth-method-apple" className="gap-1.5 bg-secondary/60 border border-border/50 text-foreground">
                <SiApple className="w-3.5 h-3.5" /> Apple
              </Badge>
              <Badge variant="secondary" data-testid="text-auth-method-email" className="gap-1.5 bg-secondary/60 border border-border/50 text-foreground">
                <Mail className="w-3.5 h-3.5" /> Email
              </Badge>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <FeatureCard 
            icon={Code2}
            title="Algorithmic Trading"
            description="Implement execution algorithms and market making strategies in a realistic simulation environment."
          />
          <FeatureCard 
            icon={LineChart}
            title="Risk Management"
            description="Calculate VaR, Greeks, and portfolio optimization metrics against live market data scenarios."
          />
          <FeatureCard 
            icon={Shield}
            title="Backtesting Engine"
            description="Instant feedback on your strategy's Sharpe ratio, max drawdown, and stability metrics."
          />
        </div>
      </main>

      <footer className="container mx-auto px-6 py-8 border-t border-border/40 text-center text-muted-foreground text-sm relative z-10">
        <p>© 2026 QuantPro. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl bg-card/40 border border-border/50 backdrop-blur-sm hover:border-primary/20 transition-colors"
    >
      <div className="w-12 h-12 bg-secondary/50 rounded-xl flex items-center justify-center mb-6 text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
