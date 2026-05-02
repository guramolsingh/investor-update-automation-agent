"use client";

import type { RefinedResult } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VersionCompare({ refined }: { refined?: RefinedResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Version Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {refined?.diff.length ? (
          refined.diff.map((item) => (
            <div key={`${item.sectionId}-${item.reason}`} className="grid gap-3 rounded-md border bg-background p-3 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Before</p>
                <p className="text-sm">{item.before}</p>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">After</p>
                <p className="text-sm">{item.after}</p>
                <p className="mt-2 text-xs text-muted-foreground">{item.reason}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Refinement changes will appear after a full run.</p>
        )}
      </CardContent>
    </Card>
  );
}
