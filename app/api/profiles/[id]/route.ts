import { NextResponse } from "next/server";
import { getProfile, updateProfile } from "@/lib/store";
import { validateProfileInput } from "@/lib/validate";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const profile = await getProfile(id);
  if (!profile) return NextResponse.json({ error: "No such hacker. Ghosted." }, { status: 404 });
  return NextResponse.json(profile);
}

// Used by /profile to save edits.
export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const result = validateProfileInput(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  const updated = await updateProfile(id, result.value);
  if (!updated) return NextResponse.json({ error: "No such hacker. Ghosted." }, { status: 404 });
  return NextResponse.json(updated);
}
