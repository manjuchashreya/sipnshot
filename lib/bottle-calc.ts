import type { AiSuggestion, PartyDetails, EventPreferences } from "@/lib/types";

const SERVING_ML = 60; // average pour in ml
const BOTTLE_ML = 750;

const PRICE_RANGES: Record<string, { min: number; max: number }> = {
    value: { min: 400, max: 900 },
    mid: { min: 900, max: 2500 },
    premium: { min: 2500, max: 6000 },
};

// Servings per bottle — beer/cider ≈ 1 unit per bottle/can, spirits ~12 pours
function servingsPerBottle(category: string): number {
    const lower = category.toLowerCase();
    if (lower.includes("beer") || lower.includes("cider") || lower.includes("cooler")) return 1;
    if (lower.includes("wine") || lower.includes("champagne") || lower.includes("sparkling")) return 5;
    return Math.floor(BOTTLE_ML / SERVING_ML); // ~12 for spirits
}

function drinksPerPersonPerHour(tolerance: string): number {
    if (tolerance === "Low") return 0.5;
    if (tolerance === "High") return 1.5;
    return 1.0; // Medium
}

export type BottleEstimate = {
    suggestion: AiSuggestion;
    bottlesNeeded: number;
    priceMin: number;
    priceMax: number;
    totalMin: number;
    totalMax: number;
    currency: string;
};

export function calcBottles(
    suggestions: AiSuggestion[],
    party: PartyDetails,
    preferences: EventPreferences,
    avgTolerance: "Low" | "Medium" | "High" = "Medium",
): BottleEstimate[] {
    const duration = party.eventDurationHours ?? 4;
    const people = party.peopleCount;
    const dph = drinksPerPersonPerHour(avgTolerance);
    const totalDrinks = people * dph * duration;

    // Split drinks over the number of suggestions
    const drinksPerSuggestion = totalDrinks / (suggestions.length || 1);

    // Currency symbol based on region
    const region = party.region.toLowerCase();
    const currency =
        region.includes("india") || region.includes("mumbai") || region.includes("delhi")
            ? "₹"
            : region.includes("brazil")
                ? "R$"
                : "$";

    return suggestions.map((s) => {
        const spb = servingsPerBottle(s.category);
        const bottlesNeeded = Math.max(1, Math.ceil(drinksPerSuggestion / spb));
        const tierKey = s.priceTier?.toLowerCase() ?? "mid";
        const range = PRICE_RANGES[tierKey] ?? PRICE_RANGES.mid;
        return {
            suggestion: s,
            bottlesNeeded,
            priceMin: range.min,
            priceMax: range.max,
            totalMin: range.min * bottlesNeeded,
            totalMax: range.max * bottlesNeeded,
            currency,
        };
    });
}

export function totalBudget(estimates: BottleEstimate[]) {
    const currency = estimates[0]?.currency ?? "₹";
    const totalMin = estimates.reduce((s, e) => s + e.totalMin, 0);
    const totalMax = estimates.reduce((s, e) => s + e.totalMax, 0);
    return { totalMin, totalMax, currency };
}
