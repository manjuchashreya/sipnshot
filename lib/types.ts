export const contactStatuses = [
  "new",
  "draft_generated",
  "draft_saved",
  "sent",
  "failed",
] as const;

export type ContactStatus = (typeof contactStatuses)[number];

export type ContactRecord = {
  id: number;
  name: string;
  email: string;
  company: string;
  goal: string;
  status: ContactStatus;
  subject: string | null;
  body: string | null;
  createdAt: string;
};

export type ContactFormValues = {
  name: string;
  email: string;
  company: string;
  goal: string;
};

export type DraftFormValues = {
  subject: string;
  body: string;
};

export const tasteOptions = [
  "Citrus",
  "Sweet",
  "Bubbly",
  "Light",
  "Herbal",
  "No tequila",
  "No dairy",
] as const;

export type TasteOption = (typeof tasteOptions)[number];

export type EventFormValues = {
  name: string;
  date: string;
  context: string;
};

export type ProfilePreferences = {
  name: string;
  tastes: TasteOption[];
  allergyNote: string;
  tolerance: "Low" | "Medium" | "High";
  budget: "Value" | "Mid" | "Premium";
  dislikedCategories: string[];
};

export type EventPreferences = {
  vibe: "Chill" | "Social" | "High energy";
  maxDrinks: number;
  waterCadenceMinutes: number;
  lowAbvMode: boolean;
  mocktailMode: boolean;
};

export type FriendPreference = {
  name: string;
  vibe: string;
  paceNote: string;
};

export type PartyDetails = {
  peopleCount: number;
  region: string;
  city: string;
  partyType: string;
  guestAllergies: string;
  guestPreferences: string;
  eventDurationHours: number;
};

export type PartyTemplate = {
  id: string;
  name: string;
  party: PartyDetails;
  eventPreferences: EventPreferences;
  savedAt: string;
};

export type ItineraryItem = {
  id: string;
  phase: string;
  timeLabel: string;
  note: string;
};

export type ApiConfig = {
  openAiApiKey: string;
  openAiModel: string;
};

export type AiSuggestion = {
  name: string;
  category: string;
  reason: string;
  abv: string;
  serveSuggestion: string;
  caution: string;
  priceTier: string;
  alternative: string;
};

export type AiRecommendationResult = {
  summary: string;
  safetyNote: string;
  quantityGuidance: string;
  regionalTip: string;
  suggestions: AiSuggestion[];
  itinerary: ItineraryItem[];
};

export type Recommendation = {
  name: string;
  profile: string;
  reason: string;
  abv: string;
  tags: string[];
};

export type SipwiseState = {
  prompt: string;
  hasAsked: boolean;
  apiConfig: ApiConfig;
  aiResult: AiRecommendationResult | null;
  aiError: string | null;
  isAiLoading: boolean;
  event: EventFormValues;
  profile: ProfilePreferences;
  guestProfiles: ProfilePreferences[];
  eventPreferences: EventPreferences;
  party: PartyDetails;
  friends: FriendPreference[];
  itinerary: ItineraryItem[];
  savedTemplates: PartyTemplate[];
};
