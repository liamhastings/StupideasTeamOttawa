// STUB (Liam's scaffold). Kailen replaces this. Returns fixtures from the seed.
import { NextResponse } from "next/server";
import { getProfiles } from "@/lib/store";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId") ?? "me";
  const others = (await getProfiles()).filter((p) => p.id !== userId).slice(0, 3);
  return NextResponse.json(
    others.map((other, i) => ({
      match: { id: `stub_m${i}`, userAId: userId, userBId: other.id, score: 88 - i * 5, createdAt: new Date().toISOString() },
      other,
      compat: { score: 88 - i * 5, reasons: ["Stub: you need a designer. They ARE a designer."] },
    })),
  );
}
