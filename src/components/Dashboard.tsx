"use client";

import { useState } from "react";
import { Moon, Play, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { PipelineResult, RawInput } from "@/lib/schemas";
import { defaultVoiceProfile } from "@/lib/defaults";
import { AgentSteps } from "@/components/AgentSteps";
import { OutputPanel } from "@/components/OutputPanel";
import { VersionCompare } from "@/components/VersionCompare";
import { VoiceProfileEditor } from "@/components/VoiceProfileEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const sample: RawInput = {
  companyName: "Northstar AI",
  period: "Q1 2026",
  metrics: [
    { name: "MRR", current: 84000, previous: 62000, unit: "usd" },
    { name: "Runway", current: 14, previous: 12, unit: "months" },
    { name: "Activation Rate", current: 42, previous: 35, unit: "percent" }
  ],
  wins: ["Closed 18 new design partners", "Launched SOC 2 readiness sprint", "Reduced onboarding time by 31%"],
  risks: ["Enterprise procurement cycles are taking longer than forecast"],
  asks: ["Intro to fintech compliance leaders", "Feedback on VP Sales scorecard"],
  notes: "Focus on disciplined growth, customer pull, and transparent hiring cadence."
};

export function Dashboard() {
  const [rawJson, setRawJson] = useState(JSON.stringify(sample, null, 2));
  const [result, setResult] = useState<Partial<PipelineResult>>();
  const [showSteps, setShowSteps] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [voiceProfile, setVoiceProfile] = useState(defaultVoiceProfile);
  const { theme, setTheme } = useTheme();

  async function run() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: JSON.parse(rawJson), voiceProfile, llmMode: "mock" })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Pipeline failed");
      setResult(payload);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Unknown pipeline error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <section className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Investor Update Automation Agent</h1>
            <p className="text-sm text-muted-foreground">Local-first parsing, analysis, planning, writing, critique, refinement, and markdown export.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="steps">Show agent steps</Label>
              <Switch id="steps" checked={showSteps} onCheckedChange={setShowSteps} />
            </div>
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Toggle dark mode">
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="hidden h-4 w-4 dark:block" />
            </Button>
            <Button onClick={run} disabled={loading}>
              <Play className="h-4 w-4" />
              {loading ? "Running" : "Run Pipeline"}
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 xl:grid-cols-[440px_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Raw Startup Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="raw">JSON input</Label>
                <Textarea id="raw" className="min-h-[460px] font-mono text-xs" value={rawJson} onChange={(event) => setRawJson(event.target.value)} />
              </div>
              {error ? <p className="rounded-md border border-destructive p-3 text-sm text-destructive">{error}</p> : null}
              <Input value={result?.canonical?.id || "No draft loaded"} readOnly />
            </CardContent>
          </Card>
          <VoiceProfileEditor value={voiceProfile} onChange={setVoiceProfile} />
        </div>

        <div className="space-y-5">
          <OutputPanel result={result} />
          <VersionCompare refined={result?.refined} />
          {showSteps ? <AgentSteps traces={result?.traces || []} /> : null}
        </div>
      </div>
    </main>
  );
}
