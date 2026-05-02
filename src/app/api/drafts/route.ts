import { NextResponse } from "next/server";
import { listJson, saveJson } from "@/lib/storage";

export async function GET() {
  return NextResponse.json(await listJson("drafts"));
}

export async function POST(request: Request) {
  const draft = await request.json();
  return NextResponse.json(await saveJson("drafts", draft));
}
