import { Switch, Route, Redirect } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import { Layout } from "@/components/Layout";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import ChallengeLibrary from "@/pages/ChallengeLibrary";
import ChallengeWorkspace from "@/pages/ChallengeWorkspace";
import Leaderboard from "@/pages/Leaderboard";
import UserTraffic from "@/pages/UserTraffic";
import AdminFeedback from "@/pages/AdminFeedback";
import NotFound from "@/pages/not-found";

function LoginRedirect() {
  useEffect(() => {
    window.location.href = "/api/login";
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

const ADMIN_EMAIL = "npatnaik@gmail.com";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={LoginRedirect} />
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={() => <Redirect to="/dashboard" />} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/challenges" component={ChallengeLibrary} />
        <Route path="/challenge/:id" component={ChallengeWorkspace} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/admin/traffic">
          {user?.email === ADMIN_EMAIL ? <UserTraffic /> : <Redirect to="/dashboard" />}
        </Route>
        <Route path="/admin/feedback">
          {user?.email === ADMIN_EMAIL ? <AdminFeedback /> : <Redirect to="/dashboard" />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
