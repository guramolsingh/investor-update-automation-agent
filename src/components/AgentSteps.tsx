"use client";

import type { AgentTrace } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AgentSteps({ traces }: { traces: AgentTrace[] }) {
  if (!traces.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Steps</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Run the pipeline to inspect structured inputs and outputs for every stage.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Steps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {traces.map((trace) => (
          <details key={`${trace.stage}-${trace.startedAt}`} className="rounded-md border bg-background p-3">
            <summary className="cursor-pointer text-sm font-semibold">{trace.stage}</summary>
            <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify({ input: trace.input, output: trace.output }, null, 2)}</pre>
          </details>
        ))}
      </CardContent>
    </Card>
  );
}
