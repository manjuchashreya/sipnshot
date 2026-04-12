import alcoholCatalog from "@/data/alcohol-catalog.json";
import type { SipwiseState } from "@/lib/types";

type CatalogEntry = (typeof alcoholCatalog)[number];

export type RankedDrink = CatalogEntry & {
  score: number;
  badge: string;
  profileLine: string;
  reason: string;
};

function normalize(text: string) {
  return text.trim().toLowerCase();
}

export function getRankedRecommendations(state: SipwiseState): RankedDrink[] {
  const userTastes = state.profile.tastes.map((t) => normalize(t));
  const guestTastes = state.guestProfiles.flatMap((g) => g.tastes.map((t) => normalize(t)));
  const allTastes = Array.from(new Set([...userTastes, ...guestTastes]));

  const guestAllergies = state.guestProfiles.map((g) => g.allergyNote).filter(Boolean).join(" ");
  const allergyText =
    `${state.profile.allergyNote} ${guestAllergies} ${state.party.guestAllergies}`.toLowerCase();

  const blockedCategories = new Set([
    ...state.profile.dislikedCategories.map((c) => normalize(c)),
    ...state.guestProfiles.flatMap((g) => g.dislikedCategories.map((c) => normalize(c))),
  ]);

  if (allTastes.includes("no tequila")) {
    blockedCategories.add("tequila");
  }

  return alcoholCatalog
    .filter((drink) => !blockedCategories.has(normalize(drink.category)))
    .filter((drink) =>
      allergyText
        ? !drink.allergenNotes.some((note) => allergyText.includes(note.toLowerCase()))
        : true,
    )
    .map((drink) => {
      const tasteScore = allTastes.reduce((total, taste) => {
        if (taste.startsWith("no ")) {
          return total;
        }

        const noteMatch = drink.tasteNotes.some((note) => normalize(note).includes(taste));
        const serveMatch = drink.serves.some((serve) => normalize(serve).includes(taste));

        // Boost more if BOTH user and guest like it
        const isUserMatch = userTastes.includes(taste) && (noteMatch || serveMatch);
        const isGuestMatch = guestTastes.includes(taste) && (noteMatch || serveMatch);

        const styleBoost =
          taste === "light" && (drink.lowAbv || drink.abv <= 12.5)
            ? 2
            : taste === "bubbly" && drink.serves.some((serve) => normalize(serve).includes("spritz"))
              ? 2
              : 0;

        let matchPoints = 0;
        if (isUserMatch && isGuestMatch) matchPoints = 4;
        else if (isUserMatch || isGuestMatch) matchPoints = 2;

        return total + matchPoints + styleBoost;
      }, 0);

      const lowAbvBoost = state.eventPreferences.lowAbvMode && drink.lowAbv ? 3 : 0;
      const maxDrinkBoost = state.eventPreferences.maxDrinks <= 3 && drink.abv <= 12.5 ? 2 : 0;
      const partyBoost = state.party.peopleCount >= 6 && drink.serves.length > 1 ? 1 : 0;

      const userBudget = normalize(state.profile.budget);
      const allBudgets = new Set([userBudget, ...state.guestProfiles.map(g => normalize(g.budget))]);
      const drinkBudget = normalize(drink.priceTier);

      const hasBudgetMatch = allBudgets.has(drinkBudget);
      const hasMidBudget = allBudgets.has("mid");

      const budgetBoost =
        hasBudgetMatch
          ? 2
          : hasMidBudget && drink.priceTier !== "premium"
            ? 1
            : 0;
      const isUsa = normalize(state.party.region).includes("usa") || normalize(state.party.region).includes("miami") || normalize(state.party.region).includes("united states");
      const isDrinkUsa = normalize(drink.country).includes("united states");

      const regionalBoost =
        (normalize(state.party.region) && normalize(drink.country).includes(normalize(state.party.region))) || (isUsa && isDrinkUsa)
          ? 10
          : normalize(state.party.region) && drink.country !== "Global" && !normalize(drink.country).includes(normalize(state.party.region)) && !(isUsa && isDrinkUsa)
            ? -10
            : 0;

      const score = tasteScore + lowAbvBoost + maxDrinkBoost + partyBoost + budgetBoost + regionalBoost;

      return {
        ...drink,
        score,
        badge:
          drink.abv <= 5
            ? "Very light"
            : drink.abv <= 12.5
              ? "Low ABV"
              : drink.abv <= 40
                ? "Standard"
                : "Strong",
        profileLine: `${drink.subtype} · ${drink.country}`,
        reason:
          score > 5
            ? `Matches your taste profile and tonight's safety settings.`
            : `Useful fallback for a ${state.eventPreferences.vibe.toLowerCase()} ${state.party.partyType.toLowerCase()} setup.`,
      };
    })
    .sort((left, right) => right.score - left.score);
}

export function getRegionalHighlights(state: SipwiseState): RankedDrink[] {
  const region = normalize(state.party.region || state.party.city);

  return alcoholCatalog
    .filter((drink) =>
      region
        ? normalize(drink.country).includes(region) ||
        (region.includes("india") && drink.country === "India") ||
        (region.includes("us") && drink.country === "United States")
        : true,
    )
    .slice(0, 6)
    .map((drink) => ({
      ...drink,
      score: 0,
      badge: drink.lowAbv ? "Crowd-safe" : "Signature",
      profileLine: `${drink.subtype} · ${drink.country}`,
      reason: `Popular fit for ${state.party.city || state.party.region || "this region"}-style ordering.`,
    }));
}
