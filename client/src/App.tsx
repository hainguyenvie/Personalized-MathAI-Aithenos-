import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import ChatWidget from "@/components/chat-widget";
import DemoBanner from "@/components/demo-banner";
import Home from "@/pages/home";
import Assessment from "@/pages/assessment";
import Onboarding from "@/pages/onboarding";
import Practice from "@/pages/practice";
import UnitQuiz from "@/pages/unit-quiz";
import Mastery from "@/pages/mastery";
import Learning from "@/pages/learning";
import LearningRoadmap from "@/pages/learning-roadmap";
import GameShow from "@/pages/gameshow";
import Leaderboard from "@/pages/leaderboard";
import DiagnosticReport from "@/pages/diagnostic-report";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/assessment" component={Assessment} />
      <Route path="/practice" component={Practice} />
      <Route path="/unit-quiz" component={UnitQuiz} />
      <Route path="/mastery" component={Mastery} />
      <Route path="/learning" component={Learning} />
      <Route path="/learning-roadmap" component={LearningRoadmap} />
      <Route path="/gameshow" component={GameShow} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/diagnostic-report" component={DiagnosticReport} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <DemoBanner />
          <Navigation />
          <Router />
          <ChatWidget />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
