import type { Compat, Profile } from "@/lib/types";

/** One card in the deck, exactly the shape /api/discover returns. */
export interface DeckItem {
  profile: Profile;
  compat: Compat;
}

export type SwipeAction = "like" | "pass";
