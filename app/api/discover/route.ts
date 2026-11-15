// STUB (Liam's scaffold). Kailen replaces this with real scoring.
import { NextResponse } from "next/server";
import { getProfiles } from "@/lib/store";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId");
  const profiles = (await getProfiles()).filter((p) => p.id !== userId);
  return NextResponse.json(
    profiles.map((profile, i) => ({
      profile,
      compat: { score: 90 - i * 3, reasons: ["Stub compat: you both exist.", "Fixture data. Kailen is cooking."] },
    })),
  );
}
