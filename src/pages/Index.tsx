import React, { useState } from "react";
import { Header } from "@/components/Header";
import { SkillMatchingDashboard } from "@/components/SkillMatchingDashboard";
import { WorkerProfiles } from "@/components/WorkerProfiles";
import { JobRequirements } from "@/components/JobRequirements";
import { ProductivityMetrics } from "@/components/ProductivityMetrics";
import { RecommendationPanel } from "@/components/RecommendationPanel";
import { AdminPanel } from "@/components/AdminPanel";
import AIManufacturingIntelligence from "@/components/AIManufacturingIntelligence";
import DairyDataAnalysis from "@/components/DairyDataAnalysis";
import { Button } from "@/components/ui/button";
import { Settings, BarChart3, Brain, Database } from "lucide-react";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />

      {/* View Toggle */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            onClick={() => setActiveView("dairy")}
            variant={activeView === "dairy" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Button>
          {/* <Button
            onClick={() => setActiveView("dairy")}
            variant={activeView === "dairy" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Dairy Data Analysis
          </Button> */}
          <Button
            onClick={() => setActiveView("ai")}
            variant={activeView === "ai" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            AI Manufacturing
          </Button>
          <Button
            onClick={() => setActiveView("admin")}
            variant={activeView === "admin" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Admin Management
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 pb-6">
        {activeView === "dashboard" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SkillMatchingDashboard />
              </div>
              <div>
                <ProductivityMetrics />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <WorkerProfiles />
              <JobRequirements />
            </div>

            <RecommendationPanel />
          </div>
        ) : activeView === "dairy" ? (
          <DairyDataAnalysis />
        ) : activeView === "ai" ? (
          <AIManufacturingIntelligence />
        ) : (
          <AdminPanel />
        )}
      </main>
    </div>
  );
};

export default Index;
