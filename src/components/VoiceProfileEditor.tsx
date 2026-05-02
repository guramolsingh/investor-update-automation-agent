"use client";

import type { VoiceProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function VoiceProfileEditor({ value, onChange }: { value: VoiceProfile; onChange: (profile: VoiceProfile) => void }) {
  async function saveProfile() {
    await fetch("/api/voice-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value)
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Audience</Label>
          <Input value={value.audience} onChange={(event) => onChange({ ...value, audience: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Style Rules</Label>
          <Textarea
            value={value.styleRules.join("\n")}
            onChange={(event) => onChange({ ...value, styleRules: event.target.value.split("\n").filter(Boolean) })}
          />
        </div>
        <Button variant="outline" onClick={saveProfile}>
          Save profile
        </Button>
      </CardContent>
    </Card>
  );
}
