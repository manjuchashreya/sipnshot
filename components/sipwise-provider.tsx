"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  AiRecommendationResult,
  EventFormValues,
  EventPreferences,
  FriendPreference,
  ItineraryItem,
  PartyDetails,
  PartyTemplate,
  ProfilePreferences,
  SipwiseState,
  TasteOption,
} from "@/lib/types";

const STORAGE_KEY = "sipwise-demo-state";

const defaultState: SipwiseState = {
  prompt:
    "Going to a rooftop party in Mumbai for 6 people. Two want low alcohol, one avoids gluten, and I like citrus drinks.",
  hasAsked: false,
  apiConfig: {
    openAiApiKey: "",
    openAiModel: "gpt-4o-mini",
  },
  aiResult: null,
  aiError: null,
  isAiLoading: false,
  event: {
    name: "Rooftop Mixer",
    date: "2026-04-12",
    context: "Outdoor cocktail bar with college friends",
  },
  profile: {
    name: "Me",
    tastes: ["Citrus", "Light", "No tequila"],
    allergyNote: "No dairy",
    tolerance: "Medium",
    budget: "Mid",
    dislikedCategories: ["tequila"],
  },
  guestProfiles: [],
  eventPreferences: {
    vibe: "Social",
    maxDrinks: 3,
    waterCadenceMinutes: 45,
    lowAbvMode: true,
    mocktailMode: false,
  },
  party: {
    peopleCount: 6,
    region: "India",
    city: "Mumbai",
    partyType: "Rooftop party",
    guestAllergies: "gluten",
    guestPreferences: "2 want low alcohol, 1 prefers sweeter drinks",
    eventDurationHours: 4,
  },
  friends: [
    {
      name: "Maya",
      vibe: "Sweet cocktails",
      paceNote: "One stronger drink, then mocktails.",
    },
    {
      name: "Jordan",
      vibe: "Beer or spritz",
      paceNote: "Prefers lighter drinks all night.",
    },
  ],
  itinerary: [
    {
      id: "arrival",
      phase: "Arrival",
      timeLabel: "8:00 PM",
      note: "Start with low-ABV or bubbly options and water on the table.",
    },
    {
      id: "peak",
      phase: "Peak social",
      timeLabel: "9:30 PM",
      note: "Offer main signature picks plus one mocktail backup.",
    },
    {
      id: "wind-down",
      phase: "Wind-down",
      timeLabel: "11:00 PM",
      note: "Switch to lighter pours, cider, or mocktails before wrap-up.",
    },
  ],
  savedTemplates: [],
};

function mergeWithDefaultState(savedState: unknown): SipwiseState {
  if (!savedState || typeof savedState !== "object") {
    return defaultState;
  }

  const parsed = savedState as Partial<SipwiseState>;

  return {
    ...defaultState,
    ...parsed,
    event: {
      ...defaultState.event,
      ...parsed.event,
    },
    profile: {
      ...defaultState.profile,
      ...parsed.profile,
      name: parsed.profile?.name ?? defaultState.profile.name,
      tastes: parsed.profile?.tastes ?? defaultState.profile.tastes,
      dislikedCategories:
        parsed.profile?.dislikedCategories ?? defaultState.profile.dislikedCategories,
    },
    guestProfiles: (parsed.guestProfiles ?? defaultState.guestProfiles).map((g: any) => ({
      ...g,
      name: g.name ?? "Guest",
      tastes: g.tastes ?? [],
      dislikedCategories: g.dislikedCategories ?? [],
    })),
    eventPreferences: {
      ...defaultState.eventPreferences,
      ...parsed.eventPreferences,
    },
    apiConfig: {
      ...defaultState.apiConfig,
      ...parsed.apiConfig,
    },
    aiResult: parsed.aiResult ?? defaultState.aiResult,
    aiError: parsed.aiError ?? defaultState.aiError,
    isAiLoading: false,
    party: {
      ...defaultState.party,
      ...parsed.party,
    },
    friends: parsed.friends ?? defaultState.friends,
    itinerary: parsed.itinerary ?? defaultState.itinerary,
    savedTemplates: parsed.savedTemplates ?? defaultState.savedTemplates,
  };
}

type SipwiseContextValue = {
  state: SipwiseState;
  isHydrated: boolean;
  updatePrompt: (value: string) => void;
  updateApiConfig: (field: keyof SipwiseState["apiConfig"], value: string) => void;
  setAiLoading: (value: boolean) => void;
  setAiResult: (value: AiRecommendationResult | null) => void;
  setAiError: (value: string | null) => void;
  updateEvent: (field: keyof EventFormValues, value: string) => void;
  updateParty: <K extends keyof PartyDetails>(field: K, value: PartyDetails[K]) => void;
  toggleTaste: (taste: TasteOption, profileType?: "user" | "guest", guestIndex?: number) => void;
  updateAllergyNote: (value: string, profileType?: "user" | "guest", guestIndex?: number) => void;
  updateTolerance: (
    value: ProfilePreferences["tolerance"],
    profileType?: "user" | "guest",
    guestIndex?: number,
  ) => void;
  updateBudget: (
    value: ProfilePreferences["budget"],
    profileType?: "user" | "guest",
    guestIndex?: number,
  ) => void;
  toggleDislikedCategory: (
    value: string,
    profileType?: "user" | "guest",
    guestIndex?: number,
  ) => void;
  updateProfileName: (name: string, profileType?: "user" | "guest", guestIndex?: number) => void;
  addGuestProfile: () => void;
  removeGuestProfile: (index: number) => void;
  updateEventPreference: <K extends keyof EventPreferences>(
    field: K,
    value: EventPreferences[K],
  ) => void;
  addFriend: (friend: FriendPreference) => void;
  addItineraryItem: (item: ItineraryItem) => void;
  applyPrompt: () => void;
  saveTemplate: (name: string) => void;
  loadTemplate: (id: string) => void;
  removeTemplate: (id: string) => void;
};

const SipwiseContext = createContext<SipwiseContextValue | null>(null);

export function SipwiseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SipwiseState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedState = window.localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        setState(mergeWithDefaultState(JSON.parse(savedState)));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isHydrated, state]);

  const value = useMemo<SipwiseContextValue>(
    () => ({
      state,
      isHydrated,
      updatePrompt: (value) => {
        setState((current) => ({
          ...current,
          prompt: value,
          hasAsked: false,
          aiResult: null,
          aiError: null,
        }));
      },
      updateApiConfig: (field, value) => {
        setState((current) => ({
          ...current,
          apiConfig: {
            ...current.apiConfig,
            [field]: value,
          },
        }));
      },
      setAiLoading: (value) => {
        setState((current) => ({
          ...current,
          isAiLoading: value,
        }));
      },
      setAiResult: (value) => {
        setState((current) => ({
          ...current,
          aiResult: value,
        }));
      },
      setAiError: (value) => {
        setState((current) => ({
          ...current,
          aiError: value,
        }));
      },
      updateEvent: (field, value) => {
        setState((current) => ({
          ...current,
          event: {
            ...current.event,
            [field]: value,
          },
        }));
      },
      updateParty: (field, value) => {
        setState((current) => ({
          ...current,
          party: {
            ...current.party,
            [field]: value,
          },
        }));
      },
      toggleTaste: (taste, profileType = "user", guestIndex) => {
        setState((current) => {
          if (profileType === "user") {
            const exists = current.profile.tastes.includes(taste);
            return {
              ...current,
              profile: {
                ...current.profile,
                tastes: exists
                  ? current.profile.tastes.filter((item) => item !== taste)
                  : [...current.profile.tastes, taste],
              },
            };
          } else if (guestIndex !== undefined) {
            const nextGuests = [...current.guestProfiles];
            const guest = nextGuests[guestIndex];
            if (!guest) return current;
            const exists = guest.tastes.includes(taste);
            nextGuests[guestIndex] = {
              ...guest,
              tastes: exists
                ? guest.tastes.filter((item) => item !== taste)
                : [...guest.tastes, taste],
            };
            return { ...current, guestProfiles: nextGuests };
          }
          return current;
        });
      },
      updateAllergyNote: (value, profileType = "user", guestIndex) => {
        setState((current) => {
          if (profileType === "user") {
            return { ...current, profile: { ...current.profile, allergyNote: value } };
          } else if (guestIndex !== undefined) {
            const nextGuests = [...current.guestProfiles];
            if (nextGuests[guestIndex]) {
              nextGuests[guestIndex] = { ...nextGuests[guestIndex], allergyNote: value };
            }
            return { ...current, guestProfiles: nextGuests };
          }
          return current;
        });
      },
      updateTolerance: (value, profileType = "user", guestIndex) => {
        setState((current) => {
          if (profileType === "user") {
            return { ...current, profile: { ...current.profile, tolerance: value } };
          } else if (guestIndex !== undefined) {
            const nextGuests = [...current.guestProfiles];
            if (nextGuests[guestIndex]) {
              nextGuests[guestIndex] = { ...nextGuests[guestIndex], tolerance: value };
            }
            return { ...current, guestProfiles: nextGuests };
          }
          return current;
        });
      },
      updateBudget: (value, profileType = "user", guestIndex) => {
        setState((current) => {
          if (profileType === "user") {
            return { ...current, profile: { ...current.profile, budget: value } };
          } else if (guestIndex !== undefined) {
            const nextGuests = [...current.guestProfiles];
            if (nextGuests[guestIndex]) {
              nextGuests[guestIndex] = { ...nextGuests[guestIndex], budget: value };
            }
            return { ...current, guestProfiles: nextGuests };
          }
          return current;
        });
      },
      toggleDislikedCategory: (value, profileType = "user", guestIndex) => {
        setState((current) => {
          if (profileType === "user") {
            const exists = current.profile.dislikedCategories.includes(value);
            return {
              ...current,
              profile: {
                ...current.profile,
                dislikedCategories: exists
                  ? current.profile.dislikedCategories.filter((item) => item !== value)
                  : [...current.profile.dislikedCategories, value],
              },
            };
          } else if (guestIndex !== undefined) {
            const nextGuests = [...current.guestProfiles];
            const guest = nextGuests[guestIndex];
            if (!guest) return current;
            const exists = guest.dislikedCategories.includes(value);
            nextGuests[guestIndex] = {
              ...guest,
              dislikedCategories: exists
                ? guest.dislikedCategories.filter((item) => item !== value)
                : [...guest.dislikedCategories, value],
            };
            return { ...current, guestProfiles: nextGuests };
          }
          return current;
        });
      },
      updateProfileName: (name, profileType = "user", guestIndex) => {
        setState((current) => {
          if (profileType === "user") {
            return { ...current, profile: { ...current.profile, name } };
          } else if (guestIndex !== undefined) {
            const nextGuests = [...current.guestProfiles];
            if (nextGuests[guestIndex]) {
              nextGuests[guestIndex] = { ...nextGuests[guestIndex], name };
            }
            return { ...current, guestProfiles: nextGuests };
          }
          return current;
        });
      },
      addGuestProfile: () => {
        setState((current) => ({
          ...current,
          guestProfiles: [
            ...current.guestProfiles,
            {
              name: `Guest ${current.guestProfiles.length + 1}`,
              tastes: [],
              allergyNote: "",
              tolerance: "Medium",
              budget: "Mid",
              dislikedCategories: [],
            },
          ],
        }));
      },
      removeGuestProfile: (index) => {
        setState((current) => ({
          ...current,
          guestProfiles: current.guestProfiles.filter((_, i) => i !== index),
        }));
      },
      updateEventPreference: (field, value) => {
        setState((current) => ({
          ...current,
          eventPreferences: {
            ...current.eventPreferences,
            [field]: value,
          },
        }));
      },
      addFriend: (friend) => {
        setState((current) => ({
          ...current,
          friends: [...current.friends, friend],
        }));
      },
      addItineraryItem: (item) => {
        setState((current) => ({
          ...current,
          itinerary: [...current.itinerary, item],
        }));
      },
      applyPrompt: () => {
        setState((current) => {
          const prompt = current.prompt.toLowerCase();
          const peopleMatch = prompt.match(/(\d+)\s+people/);
          const cities = ["mumbai", "new york", "london", "delhi", "bangalore", "chicago"];
          const matchedCity = cities.find((city) => prompt.includes(city));
          const vibe = prompt.includes("house party")
            ? "High energy"
            : prompt.includes("rooftop") || prompt.includes("mixer")
              ? "Social"
              : "Chill";
          const lowAbvMode = prompt.includes("low alcohol") || prompt.includes("not too drunk");
          const gluten = prompt.includes("gluten") ? "gluten" : current.party.guestAllergies;
          const sweet = prompt.includes("sweet");
          const herbal = prompt.includes("herbal");
          const citrus = prompt.includes("citrus");

          const nextTastes = new Set(current.profile.tastes);
          if (citrus) nextTastes.add("Citrus");
          if (sweet) nextTastes.add("Sweet");
          if (herbal) nextTastes.add("Herbal");
          if (lowAbvMode) nextTastes.add("Light");

          return {
            ...current,
            hasAsked: true,
            aiError: null,
            profile: {
              ...current.profile,
              tastes: Array.from(nextTastes) as TasteOption[],
            },
            eventPreferences: {
              ...current.eventPreferences,
              vibe,
              lowAbvMode,
            },
            party: {
              ...current.party,
              peopleCount: peopleMatch ? Number(peopleMatch[1]) : current.party.peopleCount,
              city: matchedCity
                ? matchedCity.replace(/\b\w/g, (char) => char.toUpperCase())
                : current.party.city,
              region: matchedCity === "mumbai" || matchedCity === "delhi" || matchedCity === "bangalore"
                ? "India"
                : current.party.region,
              partyType: prompt.includes("rooftop")
                ? "Rooftop party"
                : prompt.includes("house party")
                  ? "House party"
                  : current.party.partyType,
              guestAllergies: gluten,
              guestPreferences: lowAbvMode
                ? "Some guests want low alcohol"
                : current.party.guestPreferences,
            },
          };
        });
      },
      saveTemplate: (name: string) => {
        setState((current) => ({
          ...current,
          savedTemplates: [
            ...(current.savedTemplates ?? []),
            {
              id: Date.now().toString(),
              name,
              party: current.party,
              eventPreferences: current.eventPreferences,
              savedAt: new Date().toISOString(),
            },
          ],
        }));
      },
      loadTemplate: (id: string) => {
        setState((current) => {
          const template = (current.savedTemplates ?? []).find((t) => t.id === id);
          if (!template) return current;
          return {
            ...current,
            party: template.party,
            eventPreferences: template.eventPreferences,
            aiResult: null,
            hasAsked: false,
          };
        });
      },
      removeTemplate: (id: string) => {
        setState((current) => ({
          ...current,
          savedTemplates: (current.savedTemplates ?? []).filter((t) => t.id !== id),
        }));
      },
    }),
    [isHydrated, state],
  );

  return <SipwiseContext.Provider value={value}>{children}</SipwiseContext.Provider>;
}

export function useSipwise() {
  const context = useContext(SipwiseContext);

  if (!context) {
    throw new Error("useSipwise must be used within SipwiseProvider.");
  }

  return context;
}
