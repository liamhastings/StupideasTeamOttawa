import { NextResponse } from "next/server";
import { createProfile, getProfiles } from "@/lib/store";
import { validateProfileInput } from "@/lib/validate";

export async function GET() {
  return NextResponse.json(await getProfiles());
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "That's not JSON. That's a cry for help." }, { status: 400 });
  }
  const result = validateProfileInput(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(await createProfile(result.value), { status: 201 });
}
