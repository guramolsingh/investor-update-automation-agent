"use client";

import type { PipelineResult } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Save } from "lucide-react";

export function OutputPanel({ result }: { result?: Partial<PipelineResult> }) {
  const draft = result?.draft?.markdown || "";
  const final = result?.formatted?.markdown || result?.refined?.markdown || "";

  function exportMarkdown() {
    const blob = new Blob([final || draft], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "investor-update.md";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function saveDraft() {
    await fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ createdAt: new Date().toISOString(), result })
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Output</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={saveDraft} disabled={!draft && !final} title="Save draft locally">
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button variant="secondary" size="sm" onClick={exportMarkdown} disabled={!draft && !final} title="Export markdown">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="final">
          <TabsList>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="final">Final</TabsTrigger>
          </TabsList>
          <TabsContent value="draft">
            <pre className="min-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">{draft || "Draft output will appear here."}</pre>
          </TabsContent>
          <TabsContent value="final">
            <pre className="min-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">{final || "Final polished update will appear here."}</pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
