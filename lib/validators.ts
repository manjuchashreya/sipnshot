import { z } from "zod";

import { contactStatuses, tasteOptions } from "@/lib/types";

export const createContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  goal: z.string().min(1),
});

export const contactIdSchema = z.object({
  contactId: z.number().int().positive(),
});

export const updateContactSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  company: z.string().min(1).optional(),
  goal: z.string().min(1).optional(),
  subject: z.string().min(1).nullable().optional(),
  body: z.string().min(1).nullable().optional(),
  status: z.enum(contactStatuses).optional(),
});

export const recommendationRequestSchema = z.object({
  prompt: z.string().min(1),
  apiKey: z.string().optional(),
  model: z.string().optional(),
  state: z.object({
    event: z.object({
      name: z.string(),
      date: z.string(),
      context: z.string(),
    }),
    profile: z.object({
      name: z.string(),
      tastes: z.array(z.enum(tasteOptions)),
      allergyNote: z.string(),
      tolerance: z.enum(["Low", "Medium", "High"]),
      budget: z.enum(["Value", "Mid", "Premium"]),
      dislikedCategories: z.array(z.string()),
    }),
    guestProfiles: z.array(z.object({
      name: z.string(),
      tastes: z.array(z.enum(tasteOptions)),
      allergyNote: z.string(),
      tolerance: z.enum(["Low", "Medium", "High"]),
      budget: z.enum(["Value", "Mid", "Premium"]),
      dislikedCategories: z.array(z.string()),
    })),
    eventPreferences: z.object({
      vibe: z.enum(["Chill", "Social", "High energy"]),
      maxDrinks: z.number(),
      waterCadenceMinutes: z.number(),
      lowAbvMode: z.boolean(),
      mocktailMode: z.boolean().optional().default(false),
    }),
    party: z.object({
      peopleCount: z.number(),
      region: z.string(),
      city: z.string(),
      partyType: z.string(),
      guestAllergies: z.string(),
      guestPreferences: z.string(),
      eventDurationHours: z.number().optional().default(4),
    }),
  }),
});

export const aiRecommendationSchema = z.object({
  summary: z.string(),
  safetyNote: z.string(),
  quantityGuidance: z.string(),
  regionalTip: z.string(),
  suggestions: z.array(
    z.object({
      name: z.string(),
      category: z.string(),
      reason: z.string(),
      abv: z.string(),
      serveSuggestion: z.string(),
      caution: z.string(),
      priceTier: z.string(),
      alternative: z.string(),
    }),
  ).min(3).max(3),
  itinerary: z.array(
    z.object({
      id: z.string(),
      phase: z.string(),
      timeLabel: z.string(),
      note: z.string(),
    }),
  ).min(3).max(4),
});
