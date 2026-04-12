import { NextResponse } from "next/server";

import { getRankedRecommendations } from "@/lib/recommendations";
import { aiRecommendationSchema, recommendationRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = recommendationRequestSchema.parse(json);
    const apiKey = payload.apiKey || process.env.OPENAI_API_KEY;
    const model = payload.model || process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Add an OpenAI API key in Local Picks or set OPENAI_API_KEY in .env." },
        { status: 400 },
      );
    }

    const candidateDrinks = getRankedRecommendations({
      prompt: payload.prompt,
      hasAsked: true,
      apiConfig: { openAiApiKey: "", openAiModel: model },
      aiResult: null,
      aiError: null,
      isAiLoading: false,
      event: payload.state.event,
      profile: payload.state.profile,
      guestProfiles: payload.state.guestProfiles,
      eventPreferences: payload.state.eventPreferences,
      party: payload.state.party,
      friends: [],
      itinerary: [],
      savedTemplates: [],
    })
      .slice(0, 12)
      .map((drink) => ({
        name: drink.name,
        category: drink.category,
        subtype: drink.subtype,
        abv: drink.abv,
        priceTier: drink.priceTier,
        country: drink.country,
        tasteNotes: drink.tasteNotes,
        serves: drink.serves,
        lowAbv: drink.lowAbv,
      }));

    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        summary: { type: "string" },
        safetyNote: { type: "string" },
        quantityGuidance: { type: "string" },
        regionalTip: { type: "string" },
        suggestions: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string" },
              category: { type: "string" },
              reason: { type: "string" },
              abv: { type: "string" },
              serveSuggestion: { type: "string" },
              caution: { type: "string" },
              priceTier: { type: "string" },
              alternative: { type: "string" },
            },
            required: ["name", "category", "reason", "abv", "serveSuggestion", "caution", "priceTier", "alternative"],
          },
        },
        itinerary: {
          type: "array",
          minItems: 3,
          maxItems: 4,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              id: { type: "string" },
              phase: { type: "string" },
              timeLabel: { type: "string" },
              note: { type: "string" },
            },
            required: ["id", "phase", "timeLabel", "note"],
          },
        },
      },
      required: ["summary", "safetyNote", "quantityGuidance", "regionalTip", "suggestions", "itinerary"],
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: [
              "You are a professional party drink recommendation assistant.",
              "Return valid JSON only.",
              "",
              "CRITICAL ANTI-HALLUCINATION RULES (follow strictly):",
              "1. For the main suggestions, you MUST strictly select ONLY from the provided 'Candidate drinks JSON'.",
              "2. Do NOT suggest any brand or drink name that is not in the 'Candidate drinks' list for your main suggestions.",
              "3. Copy the 'abv', 'priceTier', and 'category' exactly from the selected candidate drinks. Do not invent them.",
              "4. When providing an 'alternative' drink, use a widely recognized, real-world brand (e.g. Coca-Cola, Heineken). Do not invent names.",
              "5. Do NOT hallucinate cocktail names or brands that don't exist.",
              "",
              "REGIONAL RULES:",
              "6. ONLY use brands well-known in the target region (city/country).",
              "7. India → use local brands: Sula, Royal Stag, Bira 91, Old Monk, Kingfisher.",
              "8. USA → use local brands: Bud Light, Tito's, Jack Daniel's, White Claw, Jim Beam.",
              "9. Brazil → use local brands: Cachaça, Brahma, Boa Bier, Skol.",
              "10. Never mix region-specific brands across regions unless explicitly asked.",
              "",
              payload.state.eventPreferences.mocktailMode
                ? "MOCKTAIL MODE: The party is NON-ALCOHOLIC. ALL suggestions MUST be non-alcoholic. Suggest mocktails, sparkling water cocktails, shrubs, virgin versions, kombucha, or craft sodas. ABV must be 0%. Do NOT suggest any alcoholic drinks under any circumstances."
                : "ALCOHOL MODE: Suggest appropriate alcoholic drinks based on preferences.",
            ].join("\n"),
          },
          {
            role: "user",
            content: [
              `User prompt: ${payload.prompt}`,
              `Event: ${payload.state.event.name} on ${payload.state.event.date}. Context: ${payload.state.event.context}.`,
              `User Profile: tastes ${payload.state.profile.tastes.join(", ")}. Allergy: ${payload.state.profile.allergyNote}. Tolerance: ${payload.state.profile.tolerance}. Budget: ${payload.state.profile.budget}. Avoid: ${payload.state.profile.dislikedCategories.join(", ")}.`,
              `Guest Profiles: ${payload.state.guestProfiles.map(g => `${g.name}: tastes ${g.tastes.join(", ")}, allergy ${g.allergyNote}, tolerance ${g.tolerance}, budget ${g.budget}, avoid ${g.dislikedCategories.join(", ")}`).join(" | ")}`,
              `Party: ${payload.state.party.peopleCount} people. ${payload.state.party.partyType}. ${payload.state.party.city}, ${payload.state.party.region}. Guest allergies/notes: ${payload.state.party.guestAllergies}. General Guest info: ${payload.state.party.guestPreferences}.`,
              `Safety: vibe ${payload.state.eventPreferences.vibe}. Max drinks ${payload.state.eventPreferences.maxDrinks}. Water every ${payload.state.eventPreferences.waterCadenceMinutes} minutes. Low ABV mode ${payload.state.eventPreferences.lowAbvMode}.`,
              `Candidate drinks JSON: ${JSON.stringify(candidateDrinks)}`,
              "Return exactly 3 suggestions. Use short, user-facing copy.",
            ].join("\n"),
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "party_recommendations",
            strict: true,
            schema,
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "OpenAI request failed." },
        { status: response.status },
      );
    }

    const rawText = data.choices?.[0]?.message?.content;

    if (!rawText) {
      return NextResponse.json({ error: "OpenAI returned no text output." }, { status: 502 });
    }

    const parsed = aiRecommendationSchema.parse(JSON.parse(rawText));
    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not generate recommendations. Check the prompt, key, or model." },
      { status: 400 },
    );
  }
}
